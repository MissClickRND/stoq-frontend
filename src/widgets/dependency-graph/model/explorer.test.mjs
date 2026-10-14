import assert from 'node:assert/strict';
import test from 'node:test';
import { getDishGraph, getDishIngredients, getExplorerDishes, layoutDishGraph } from './explorer.ts';

const ingredient = (id, quantity = 2) => ({ id, type: 'ingredient', data: { name: id, quantity, unit: 'кг', status: 'available' } });
const dish = (id, name, status) => ({ id, type: 'dish', data: { name, status } });
const edge = (source, target, status = 'available') => ({ id: `${source}:${target}`, source, target, data: { required: 0.25, unit: 'кг', status } });
const graph = {
  nodes: [ingredient('shared'), ingredient('only-a'), ingredient('only-b'), ingredient('orphan'),
    dish('a', 'Паста', 'low_stock'), dish('b', 'Салат', 'available'), dish('c', 'Суп', 'unavailable')],
  edges: [edge('shared', 'a', 'low_stock'), edge('shared', 'b'), edge('only-a', 'a'), edge('only-b', 'b'), edge('missing', 'a')],
};

test('dish view excludes other dishes even when an ingredient is shared', () => {
  const original = structuredClone(graph);
  const result = getDishGraph(graph, 'a');
  assert.deepEqual(result.nodes.map(node => node.id).sort(), ['a', 'only-a', 'shared']);
  assert.deepEqual(result.edges.map(item => item.source).sort(), ['only-a', 'shared']);
  assert.equal(result.edges[0].data.status, 'low_stock');
  assert.equal(result.nodes.find(node => node.id === 'shared'), graph.nodes[0]);
  assert.deepEqual(graph, original, 'server graph must stay intact');
});

test('missing selection and deleted dish produce an empty graph; recipe-less dish remains visible', () => {
  assert.deepEqual(getDishGraph(graph, null), { nodes: [], edges: [] });
  assert.deepEqual(getDishGraph(graph, 'deleted'), { nodes: [], edges: [] });
  assert.deepEqual(getDishGraph(graph, 'shared'), { nodes: [], edges: [] });
  assert.deepEqual(getDishGraph(graph, 'c').nodes.map(node => node.id), ['c']);
});

test('composition preserves required amount, stock and server edge status', () => {
  const rows = getDishIngredients(graph, 'a');
  assert.equal(rows.length, 2);
  assert.equal(rows.find(row => row.ingredient.id === 'shared').edge.data.required, 0.25);
  assert.equal(rows.find(row => row.ingredient.id === 'shared').ingredient.data.quantity, 2);
  assert.equal(rows.find(row => row.ingredient.id === 'shared').edge.data.status, 'low_stock');
});

test('dish search is case-insensitive and problems include unavailable and low stock', () => {
  assert.deepEqual(getExplorerDishes(graph, '', false).map(node => node.id), ['c', 'a', 'b']);
  assert.deepEqual(getExplorerDishes(graph, '  ПАСТ  ', false).map(node => node.id), ['a']);
  assert.deepEqual(getExplorerDishes(graph, '', true).map(node => node.id), ['c', 'a']);
  assert.deepEqual(getExplorerDishes(graph, 'Салат', true), []);
});

test('dish layout places ingredients in a spaced column to the left of the dish', () => {
  const focused = getDishGraph(graph, 'a');
  const positions = layoutDishGraph(focused);
  const first = positions.get('only-a');
  const second = positions.get('shared');
  const target = positions.get('a');
  assert.equal(first.x, second.x);
  assert.ok(Math.abs(first.y - second.y) >= 90);
  assert.ok(target.x > first.x + 208);
  assert.equal(positions.size, 3);
});
