import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { configureStore } from '@reduxjs/toolkit';
const root = path.resolve(import.meta.dirname, '..');
registerHooks({ resolve(specifier, context, next) {
  const target = specifier.startsWith('@/') ? path.join(root, 'src', specifier.slice(2)) : specifier.startsWith('.') && context.parentURL?.startsWith('file:') ? fileURLToPath(new URL(specifier, context.parentURL)) : null;
  if (target && !path.extname(target)) { const file = [`${target}.ts`, path.join(target, 'index.ts')].find(fs.existsSync); if (file) return next(pathToFileURL(file).href, context); }
  return next(specifier, context);
}});
const { activityApi } = await import('../src/entities/activity/api/activity.ts');
const json = data => new Response(JSON.stringify(data), {headers:{'Content-Type':'application/json'}});
test('activity infinite query fetches 30 events then older pages with the server cursor', async t => {
 const requests=[];
 const entries=Array.from({length:30},(_,n)=>({id:String(100-n),timestamp:'2026-10-15T12:00:00Z'}));
 t.mock.method(globalThis,'fetch',async request=>{
  requests.push(new URL(request.url).pathname+new URL(request.url).search);
  return json(requests.length===1?{items:entries,nextCursor:'older-cursor'}:{items:[{id:'69'}],nextCursor:null});
 });
 const store=configureStore({reducer:{[activityApi.reducerPath]:activityApi.reducer},middleware:get=>get().concat(activityApi.middleware)});
 t.after(()=>store.dispatch(activityApi.util.resetApiState()));
 const first=store.dispatch(activityApi.endpoints.getActivity.initiate());
 await first.unwrap(); first.unsubscribe();
 const next=store.dispatch(activityApi.endpoints.getActivity.initiate(undefined,{direction:'forward'}));
 const data=await next.unwrap();next.unsubscribe();
 assert.deepEqual(requests,['/logs','/logs?cursor=older-cursor']);
 assert.equal(data.pages[0].items.length,30);assert.equal(data.pages[1].nextCursor,null);
});
