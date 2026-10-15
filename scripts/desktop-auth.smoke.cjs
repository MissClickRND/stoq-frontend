// Runs the real Electron networking stack against an isolated local HTTPS API.
// No credentials or requests are sent to production. Run after the desktop build.
const { spawn, execFileSync } = require("node:child_process");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const assert = require("node:assert/strict");

if (!process.versions.electron) {
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  const directory = require("node:fs").mkdtempSync(path.join(os.tmpdir(), "stoq-auth-smoke-"));
  env.STOQ_AUTH_SMOKE_DATA = directory;
  const child = spawn(require("electron"), [__filename, ...process.argv.slice(2)], { env, stdio: "inherit" });
  child.on("exit", async code => {
    await fs.rm(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
    process.exit(code ?? 1);
  });
  child.on("error", error => { console.error(error); process.exit(1); });
} else {
  const { app, BrowserWindow, session } = require("electron");
  const https = require("node:https");
  // Chromium reads networking switches before ready, so configure synchronously.
  app.commandLine.appendSwitch("host-resolver-rules", "MAP lyaguh.site 127.0.0.1:19443");
  app.commandLine.appendSwitch("no-proxy-server");
  const user = { id: 1, restaurantId: 7, role: "WAITER", fullName: "Desktop test", email: "desktop@example.invalid" };
  const requests = [];
  BrowserWindow.prototype.show = function () {};
  let server;
  const directory = process.env.STOQ_AUTH_SMOKE_DATA;
  assert.ok(directory && path.dirname(directory) === os.tmpdir());
  app.setPath("userData", directory);
  const timeout = setTimeout(() => { console.error("Desktop auth smoke timed out"); app.exit(1); }, 45000);
  async function finish(code) {
    clearTimeout(timeout);
    server?.close();
    app.exit(code);
  }
  (async () => {
    const key = path.join(directory, "key.pem"), cert = path.join(directory, "cert.pem");
    execFileSync(process.env.OPENSSL_PATH || "C:/Program Files/Git/usr/bin/openssl.exe", [
      "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", key,
      "-out", cert, "-days", "1", "-subj", "/CN=lyaguh.site",
    ], { stdio: "ignore", windowsHide: true });
    server = https.createServer({ key: await fs.readFile(key), cert: await fs.readFile(cert) }, (req, res) => {
      requests.push({ path: req.url, cookie: req.headers.cookie || "" });
      res.setHeader("content-type", "application/json");
      if (req.url === "/api/auth/login") {
        res.setHeader("set-cookie", [
          "accessToken=desktop-access; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600",
          "refreshToken=desktop-refresh; Path=/api/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=3600",
        ]);
        return res.end(JSON.stringify({ user }));
      }
      if (req.url === "/api/auth/logout") {
        res.setHeader("set-cookie", [
          "accessToken=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
          "refreshToken=; Path=/api/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
        ]);
        return res.end('{"ok":true}');
      }
      if (req.url === "/api/auth/status" || req.url === "/api/auth/refresh") {
        const expected = req.url.endsWith("refresh") ? "refreshToken=desktop-refresh" : "accessToken=desktop-access";
        res.statusCode = req.headers.cookie?.includes(expected) ? 200 : 401;
        return res.end(JSON.stringify(res.statusCode === 200 ? { authenticated: true, user } : { message: "Требуется вход" }));
      }
      res.end("[]");
    });
    server.on("upgrade", (req, socket) => {
      requests.push({ path: req.url, cookie: req.headers.cookie || "" });
      const accept = require("node:crypto").createHash("sha1")
        .update(req.headers["sec-websocket-key"] + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
      socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
      socket.on("data", () => { socket.end(Buffer.from([0x88, 0])); });
    });
    await new Promise((resolve, reject) => { server.once("error", reject); server.listen(19443, "127.0.0.1", resolve); });
    await app.whenReady();
    // Accept only this local test certificate; production code never overrides TLS.
    session.defaultSession.setCertificateVerifyProc((request, callback) => callback(request.hostname === "lyaguh.site" ? 0 : -3));
    app.once("browser-window-created", (_event, window) => {
      window.webContents.once("did-finish-load", async () => {
        try {
          const run = source => window.webContents.executeJavaScript(source);
          const api = (url, method = "GET", credentials = "include") => run(`fetch(${JSON.stringify(url)}, {method:${JSON.stringify(method)},credentials:${JSON.stringify(credentials)}}).then(r=>r.status)`);
          const login = await run("fetch('/api/auth/login', {method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'desktop@example.invalid',password:'fixture'})}).then(async r=>({status:r.status,body:await r.text()}))");
          assert.equal(login.status, 200, JSON.stringify({ login, requests }));
          assert.equal(await api("/api/auth/status"), 200, "SameSite session survives the next request");
          assert.equal(await run("document.cookie"), "", "Tokens stay HttpOnly");
          const cookies = await session.defaultSession.cookies.get({ url: "https://lyaguh.site/api/auth/status" });
          assert.equal(cookies.length, 2);
          assert.ok(cookies.every(cookie => cookie.httpOnly && cookie.secure));
          await window.loadURL("https://lyaguh.site/dishes");
          const deadline = Date.now() + 8000;
          while (await run("document.querySelector('h1')?.textContent !== 'Блюда'")) {
            if (Date.now() > deadline) throw Error("Protected page did not open: " + window.webContents.getURL());
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          assert.equal(await api("/api/auth/status"), 200, "Session survives navigation/reload");
          assert.equal(await api("/api/auth/refresh", "POST"), 200);
          await run("new Promise((resolve,reject)=>{ const ws=new WebSocket('wss://lyaguh.site/socket.io/?smoke=1'); ws.onopen=()=>{ws.close();resolve(true)};ws.onerror=()=>reject(Error('WebSocket failed')); })");
          assert.match(requests.find(request => request.path.includes("smoke=1")).cookie, /accessToken=desktop-access/);
          await api("/api/menu", "GET", "omit");
          assert.equal(requests.find(request => request.path === "/api/menu").cookie, "", "Guest requests omit staff cookies");
          assert.equal(await api("/api/auth/logout", "POST"), 200);
          assert.equal(await api("/api/auth/status"), 401);
          console.log("Desktop auth passed: HTTPS login cookies, status, reload, refresh, HttpOnly, guest isolation and logout.");
          await finish(0);
        } catch (error) { console.error(error); await finish(1); }
      });
    });
    require(process.argv.includes("--packaged")
      ? "../release/win-unpacked/resources/app.asar/electron/main.cjs"
      : "../electron/main.cjs");
  })().catch(async error => { console.error(error); await finish(1); });
}
