import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDevApiProxy, rewriteDevAuthCookie } from './dev-api-proxy.ts';
import { getApiBaseUrl, getSocketUrl } from '../src/shared/api/connection.ts';

test('development sends HTTP and both socket namespaces through the frontend origin', () => {
  const env = { DEV: true, VITE_API_URL: 'http://remote:3000', VITE_WEBSOCKET_API_URL: 'ws://remote:3000' };
  assert.equal(getApiBaseUrl(env), '/api');
  assert.equal(getSocketUrl('/inventory', 'http://localhost:5173', env), 'http://localhost:5173/inventory');
  assert.equal(getSocketUrl('/recommendations', 'http://localhost:5173', env), 'http://localhost:5173/recommendations');
  assert.equal(getApiBaseUrl({ VITE_API_URL: 'https://api.example.com' }), 'https://api.example.com');
  assert.equal(getSocketUrl('/inventory', 'http://localhost:5173', { VITE_WEBSOCKET_API_URL: 'wss://api.example.com' }), 'wss://api.example.com/inventory');
});

test('HTTP dev proxy keeps HttpOnly and expiry, removes remote-domain/Secure restrictions, and rewrites refresh path', () => {
  const cookie = 'refreshToken=secret; Domain=backend.example; Path=/auth; HttpOnly; Secure; SameSite=None; Max-Age=600';
  const result = rewriteDevAuthCookie(cookie, false);
  assert.match(result, /^refreshToken=secret;/);
  assert.match(result, /HttpOnly/);
  assert.match(result, /Path=\/api\/auth/);
  assert.match(result, /SameSite=Lax/);
  assert.match(result, /Max-Age=600/);
  assert.doesNotMatch(result, /(?:^|;)\s*(Secure|Domain=)/i);
  assert.match(rewriteDevAuthCookie(cookie, true), /Secure/);
  assert.equal(rewriteDevAuthCookie('unrelated=value; Secure; SameSite=None', false), 'unrelated=value; Secure; SameSite=None');
  assert.match(rewriteDevAuthCookie('accessToken=; Path=/; HttpOnly; Max-Age=0', false), /Max-Age=0/);
});

test('proxy strips the API prefix only and forwards WebSocket with the same target', () => {
  const proxy = createDevApiProxy('http://remote:3000');
  const api = proxy['^/api(?:/|$)'];
  assert.equal(api.target, 'http://remote:3000');
  assert.equal(api.rewrite('/api/auth/login'), '/auth/login');
  assert.equal(api.rewrite('/api/auth/refresh?x=1'), '/auth/refresh?x=1');
  assert.equal(proxy['/socket.io'].target, api.target);
  assert.equal(proxy['/socket.io'].ws, true);
  assert.throws(() => createDevApiProxy('/api'), /HTTP/);
});
