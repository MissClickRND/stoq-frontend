const {
  app,
  BrowserWindow,
  dialog,
  net,
  protocol,
  session,
  shell,
} = require("electron");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const {
  APP_URL,
  DEV_URL,
  isTrustedUrl,
  isNetworkRequest,
  isGuestRequest,
  resolveAppFile,
  contentSecurityPolicy,
} = require("./protocol.cjs");

app.setName("STOQ");
app.setAppUserModelId("app.stoq.desktop");
const development = !app.isPackaged && process.argv.includes("--dev");
let mainWindow;

async function registerAppProtocol() {
  const root = path.join(__dirname, "..", "dist");
  const policy = contentSecurityPolicy(
    await readFile(path.join(root, "index.html"), "utf8"),
  );
  protocol.handle("https", async (request) => {
    if (!isTrustedUrl(request.url) || isNetworkRequest(request.url))
      return net.fetch(request, {
        bypassCustomProtocolHandlers: true,
        // Electron's protocol Request does not preserve renderer credentials=omit.
        // Keep the application's public guest endpoints anonymous when forwarding.
        credentials: isGuestRequest(request) ? "omit" : request.credentials,
      });
    if (!["GET", "HEAD"].includes(request.method))
      return new Response(null, { status: 405 });
    const file = await resolveAppFile(
      request.url,
      root,
      request.headers.get("accept")?.includes("text/html"),
    );
    if (!file) return new Response("Not found", { status: 404 });
    const response = await net.fetch(pathToFileURL(file).toString());
    const headers = new Headers(response.headers);
    headers.set("Content-Security-Policy", policy);
    headers.set("X-Content-Type-Options", "nosniff");
    return new Response(request.method === "HEAD" ? null : response.body, {
      status: response.status,
      headers,
    });
  });
}

function openExternal(url) {
  try {
    if (["http:", "https:"].includes(new URL(url).protocol))
      shell
        .openExternal(url)
        .catch((error) =>
          console.error("Не удалось открыть ссылку:", error.message),
        );
  } catch {
    /* Ignore malformed renderer URLs. */
  }
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 960,
    minHeight: 640,
    title: "STOQ",
    icon: path.join(__dirname, "..", "build", "icon.png"),
    titleBarStyle: "hidden",
    titleBarOverlay: { color: "#002A2D", symbolColor: "#ffffff", height: 36 },
    show: false,
    backgroundColor: "#ffffff",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event) => {
    if (!isTrustedUrl(event.url, development)) {
      event.preventDefault();
      openExternal(event.url);
    }
  });
  mainWindow.webContents.on("will-attach-webview", (event) =>
    event.preventDefault(),
  );
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  await mainWindow.loadURL(development ? DEV_URL : APP_URL);
}

app
  .whenReady()
  .then(async () => {
    if (!development) await registerAppProtocol();
    const allowed = new Set([
      "clipboard-sanitized-write",
      "local-network",
      "local-network-access",
      "loopback-network",
    ]);
    session.defaultSession.setPermissionRequestHandler(
      (webContents, permission, callback, details) => {
        callback(
          allowed.has(permission) &&
            isTrustedUrl(
              details.requestingUrl || webContents.getURL(),
              development,
            ),
        );
      },
    );
    session.defaultSession.setPermissionCheckHandler(
      (_webContents, permission, origin) =>
        allowed.has(permission) && isTrustedUrl(origin, development),
    );
    await createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0)
        createWindow().catch(handleStartupError);
    });
  })
  .catch(handleStartupError);

function handleStartupError(error) {
  dialog.showErrorBox("Не удалось запустить STOQ", error.message);
  app.exit(1);
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
