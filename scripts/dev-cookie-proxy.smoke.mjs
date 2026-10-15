import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { createServer as createViteServer } from 'vite';
import { createDevApiProxy } from './dev-api-proxy.ts';

const require = createRequire(import.meta.url);
const { chromium } = require(require.resolve('playwright', { paths: [process.argv[2] || process.cwd()] }));
const requests = [];
let websocketCookies = '';
const backend = createHttpServer((req, res) => {
  requests.push({ path: req.url, cookie: req.headers.cookie || '' });
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/auth/login') {
    res.setHeader('Set-Cookie', [
      'accessToken=test-access; Domain=backend.invalid; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=600',
      'refreshToken=test-refresh; Domain=backend.invalid; Path=/auth; HttpOnly; Secure; SameSite=None; Max-Age=600',
    ]);
  } else if (req.url === '/auth/logout') {
    res.setHeader('Set-Cookie', [
      'accessToken=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0',
      'refreshToken=; Path=/auth; HttpOnly; Secure; SameSite=None; Max-Age=0',
    ]);
  }
  res.end(JSON.stringify({ ok: true, cookie: req.headers.cookie || '' }));
});
backend.on('upgrade', (req, socket) => {
  websocketCookies = req.headers.cookie || '';
  const accept = createHash('sha1').update(req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
  socket.on('data', () => socket.destroy());
});
await new Promise(resolve => backend.listen(0, '127.0.0.1', resolve));
const target = 'http://127.0.0.1:' + backend.address().port;
const vite = await createViteServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { host: '127.0.0.1', port: 0, proxy: createDevApiProxy(target) },
  plugins: [{ name: 'cookie-check-page', configureServer(server) {
    server.middlewares.use('/__cookie-check', (_req, res) => {
      res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><title>Cookie proxy check</title>');
    });
  } }],
});
let browser;
try {
  await vite.listen();
  const origin = 'http://127.0.0.1:' + vite.httpServer.address().port;
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(origin + '/__cookie-check');
  const api = (path, method = 'GET', credentials = 'include') => page.evaluate(async ({ path, method, credentials }) => {
    const response = await fetch('/api' + path, { method, credentials });
    return response.json();
  }, { path, method, credentials });
  await api('/auth/login', 'POST');
  const cookies = await context.cookies();
  assert.equal(cookies.length, 2);
  assert.ok(cookies.every(cookie => cookie.httpOnly && !cookie.secure && cookie.sameSite === 'Lax'));
  assert.equal(cookies.find(cookie => cookie.name === 'refreshToken').path, '/api/auth');
  assert.equal(await page.evaluate(() => document.cookie), '');
  await page.reload();
  assert.match((await api('/auth/status')).cookie, /accessToken=test-access/);
  assert.match((await api('/auth/refresh', 'POST')).cookie, /refreshToken=test-refresh/);
  assert.doesNotMatch((await api('/inventory')).cookie, /refreshToken/);
  assert.equal((await api('/menu', 'GET', 'omit')).cookie, '');
  await page.evaluate(() => new Promise((resolve, reject) => {
    const socket = new WebSocket(location.origin.replace(/^http/, 'ws') + '/socket.io/?EIO=4&transport=websocket');
    socket.onopen = () => { socket.close(); resolve(true); };
    socket.onerror = () => reject(new Error('WebSocket proxy failed'));
  }));
  assert.match(websocketCookies, /accessToken=test-access/);
  assert.doesNotMatch(websocketCookies, /refreshToken/);
  await api('/auth/logout', 'POST');
  assert.deepEqual(await context.cookies(), []);
  assert.equal((await api('/auth/status')).cookie, '');
  assert.ok(requests.every(request => !request.path.startsWith('/api')));
  console.log('HTTP cookie proxy passed: browser stores HttpOnly cookies, reload/status, refresh path, guest isolation, authenticated WebSocket, logout clears both cookies.');
} finally {
  if (browser) await browser.close();
  await vite.close();
  backend.closeAllConnections();
  await new Promise(resolve => backend.close(resolve));
}
