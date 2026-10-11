const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const root = path.join(__dirname, "..");
const output = path.join(root, "build");
const svg = fs.readFileSync(path.join(root, "public", "favicon.svg"));
const fingerprint = createHash("sha256")
  .update(svg)
  .update(fs.readFileSync(__filename))
  .digest("hex");

if (!process.versions.electron) {
  if (
    ["icon.png", "icon.ico", "icon.sha256"].every((name) =>
      fs.existsSync(path.join(output, name)),
    ) &&
    fs.readFileSync(path.join(output, "icon.sha256"), "utf8") === fingerprint
  )
    process.exit(0);
  const { spawn } = require("node:child_process");
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  const child = spawn(require("electron"), [__filename], {
    env,
    stdio: "inherit",
  });
  child.on("error", (error) => {
    console.error(error);
    process.exit(1);
  });
  child.on("exit", (code) => process.exit(code ?? 1));
} else {
  const { app, BrowserWindow, nativeImage } = require("electron");
  app
    .whenReady()
    .then(async () => {
      const window = new BrowserWindow({
        show: false,
        width: 256,
        height: 256,
        useContentSize: true,
        frame: false,
        transparent: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
        },
      });
      const image = "data:image/svg+xml;base64," + svg.toString("base64");
      await window.loadURL(
        "data:text/html;charset=utf-8," +
          encodeURIComponent(
            `<body style="margin:0;width:256px;height:256px;background:transparent"><img src="${image}" style="width:256px;height:256px;object-fit:contain"></body>`,
          ),
      );
      const png = await window.webContents.executeJavaScript(`(async () => {
        const image = document.images[0];
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 256;
        const scale = Math.min(256 / image.naturalWidth, 256 / image.naturalHeight);
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        canvas.getContext('2d').drawImage(image, (256 - width) / 2, (256 - height) / 2, width, height);
        return canvas.toDataURL('image/png');
      })()`);
      const rendered = nativeImage.createFromDataURL(png);
      const sizes = [16, 24, 32, 48, 64, 128, 256];
      const frames = sizes.map((size) =>
        rendered.resize({ width: size, height: size, quality: "best" }).toPNG(),
      );
      const header = Buffer.alloc(6 + sizes.length * 16);
      header.writeUInt16LE(1, 2);
      header.writeUInt16LE(sizes.length, 4);
      let offset = header.length;
      sizes.forEach((size, index) => {
        const entry = 6 + index * 16;
        header[entry] = header[entry + 1] = size === 256 ? 0 : size;
        header.writeUInt16LE(1, entry + 4);
        header.writeUInt16LE(32, entry + 6);
        header.writeUInt32LE(frames[index].length, entry + 8);
        header.writeUInt32LE(offset, entry + 12);
        offset += frames[index].length;
      });
      fs.mkdirSync(output, { recursive: true });
      fs.writeFileSync(path.join(output, "icon.png"), rendered.toPNG());
      fs.writeFileSync(
        path.join(output, "icon.ico"),
        Buffer.concat([header, ...frames]),
      );
      fs.writeFileSync(path.join(output, "icon.sha256"), fingerprint);
      console.log("Desktop icons generated from public/favicon.svg");
      app.exit(0);
    })
    .catch((error) => {
      console.error(error);
      app.exit(1);
    });
}
