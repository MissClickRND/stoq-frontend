// Run after npm run build. Use --dev for Vite, --packaged for release/win-unpacked.
const path = require("node:path");
const fs = require("node:fs/promises");
const os = require("node:os");

if (!process.versions.electron) {
  const { spawn } = require("node:child_process");
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  const child = spawn(
    require("electron"),
    [__filename, ...process.argv.slice(2)],
    { env, stdio: "inherit" },
  );
  child.on("error", (error) => {
    console.error(error);
    process.exit(1);
  });
  child.on("exit", (code) => process.exit(code ?? 1));
} else {
  const { app, BrowserWindow, dialog, session } = require("electron");
  const { APP_URL, DEV_URL } = require("../electron/protocol.cjs");
  const origin = process.argv.includes("--dev") ? DEV_URL : APP_URL;
  BrowserWindow.prototype.show = function () {}; // Keep verification windows hidden.
  dialog.showErrorBox = (_title, message) => {
    console.error(message);
    app.exit(1);
  };
  const deadline = setTimeout(() => {
    console.error("Desktop smoke test timed out");
    app.exit(1);
  }, 30000);
  let finished = false;
  const waitFor = async (window, expression) => {
    const end = Date.now() + 8000;
    while (Date.now() < end) {
      if (await window.webContents.executeJavaScript(expression)) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error("Renderer did not become ready: " + expression);
  };
  app.once("browser-window-created", (_event, window) => {
    window.webContents.once("did-finish-load", async () => {
      let directory;
      try {
        await waitFor(window, "Boolean(document.querySelector('main'))");
        await window.loadURL(new URL("/orders", origin).toString());
        await waitFor(
          window,
          "document.querySelector('h1')?.textContent === 'Заказы'",
        );
        const renderer = await window.webContents.executeJavaScript(
          "({ node: typeof require, secure: isSecureContext, logo: document.querySelector('aside img')?.naturalWidth, rows: document.querySelectorAll('tbody tr').length, clipboard: typeof navigator.clipboard?.writeText })",
        );
        if (
          renderer.node !== "undefined" ||
          !renderer.secure ||
          !renderer.logo ||
          renderer.rows !== 8 ||
          renderer.clipboard !== "function"
        )
          throw new Error(
            "Unexpected renderer state: " + JSON.stringify(renderer),
          );
        const titlebar = await window.webContents.executeJavaScript(`(() => {
          const bar = document.querySelector('header[aria-label="Панель окна STOQ"]');
          return { color: bar && getComputedStyle(bar).backgroundColor, height: bar?.getBoundingClientRect().height,
            contentHeight: document.querySelector('.appLayout')?.getBoundingClientRect().height, viewportHeight: innerHeight };
        })()`);
        if (
          titlebar.color !== "rgb(0, 42, 45)" ||
          titlebar.height !== 36 ||
          Math.abs(titlebar.contentHeight - (titlebar.viewportHeight - 36)) > 1
        )
          throw new Error("Unexpected titlebar: " + JSON.stringify(titlebar));
        await window.webContents.reload();
        await waitFor(
          window,
          "document.querySelector('h1')?.textContent === 'Заказы'",
        );
        await window.loadURL(new URL("/supply", origin).toString());
        await waitFor(
          window,
          'Boolean(document.querySelector(\'a[href^="/supply/"]:not([href="/supply/new"])\'))',
        );
        const supplyPath = await window.webContents.executeJavaScript(
          "document.querySelector('a[href^=\"/supply/\"]:not([href=\"/supply/new\"])').getAttribute('href')",
        );
        await window.loadURL(new URL(supplyPath, origin).toString());
        await waitFor(
          window,
          "Array.from(document.querySelectorAll('button')).some(button => button.textContent.includes('Скачать XLSX'))",
        );
        directory = await fs.mkdtemp(
          path.join(os.tmpdir(), "stoq-desktop-smoke-"),
        );
        const downloaded = new Promise((resolve, reject) => {
          session.defaultSession.once("will-download", (_event, item) => {
            item.setSavePath(path.join(directory, "report.xlsx"));
            item.once("done", (_event, state) =>
              state === "completed"
                ? resolve()
                : reject(new Error("Download " + state)),
            );
          });
        });
        await window.webContents.executeJavaScript(
          "Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('Скачать XLSX')).click()",
          true,
        );
        await downloaded;
        if ((await fs.stat(path.join(directory, "report.xlsx"))).size < 1000)
          throw new Error("Empty desktop report");
        console.log(
          `Desktop smoke OK (${process.versions.electron}): routes, reload, SVG, isolated renderer, clipboard API, XLSX.`,
        );
        finished = true;
      } catch (error) {
        console.error(error);
      } finally {
        clearTimeout(deadline);
        if (directory) {
          if (
            path.dirname(path.resolve(directory)) !== path.resolve(os.tmpdir())
          )
            throw new Error("Unexpected temporary directory");
          await fs.rm(directory, { recursive: true, force: true });
        }
        app.exit(finished ? 0 : 1);
      }
    });
  });
  require(
    process.argv.includes("--packaged")
      ? "../release/win-unpacked/resources/app.asar/electron/main.cjs"
      : "../electron/main.cjs",
  );
}
