import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const walk = (directory) =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
const files = walk(path.join(root, "src"));
const relative = (file) => path.relative(root, file).replaceAll("\\", "/");
const layers = {
  shared: 0,
  entities: 1,
  features: 2,
  widgets: 3,
  pages: 4,
  app: 5,
};

test("imports follow FSD layers and cross-entity relations use explicit @x APIs", () => {
  const violations = [];
  for (const file of files.filter((file) => /\.(ts|tsx)$/.test(file))) {
    const [, layer, slice] = relative(file).split("/");
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(
      /(?:from\s*|import\s*)["']([^"']+)["']/g,
    )) {
      const specifier = match[1];
      if (!specifier.startsWith("@/") && !specifier.startsWith(".")) continue;
      const target = specifier.startsWith("@/")
        ? `src/${specifier.slice(2)}`
        : relative(path.resolve(path.dirname(file), specifier));
      const [, targetLayer, targetSlice] = target.split("/");
      if (!(targetLayer in layers)) continue;
      if (layers[targetLayer] > layers[layer])
        violations.push(`${relative(file)} → ${target}`);
      if (
        layers[targetLayer] < layers[layer] &&
        ["entities", "features", "widgets"].includes(targetLayer)
      ) {
        const innerPath = target.split("/").slice(3).join("/");
        if (innerPath && innerPath !== "index")
          violations.push(`${relative(file)} bypasses public API → ${target}`);
      }
      if (
        layer === targetLayer &&
        layer !== "app" &&
        layer !== "shared" &&
        slice !== targetSlice
      ) {
        if (layer !== "entities" || !target.includes(`/@x/${slice}`))
          violations.push(`${relative(file)} → ${target}`);
      }
    }
  }
  assert.deepEqual(violations, []);
});

test("fixtures live in entity models; styles are colocated or in shared classes directories", () => {
  for (const file of files) {
    const name = relative(file);
    if (name.endsWith("/mock.ts"))
      assert.match(name, /^src\/entities\/[^/]+\/model\/mock\.ts$/);
    if (!name.endsWith(".module.css") || name.includes("/classes/")) continue;
    const component = path.basename(file, ".module.css");
    assert.equal(path.basename(path.dirname(file)), component, name);
    assert.ok(
      fs.existsSync(path.join(path.dirname(file), `${component}.tsx`)),
      name,
    );
  }
  assert.ok(
    !fs.existsSync(path.join(root, "src/shared/api/auth-mock")) ||
      !fs.readdirSync(path.join(root, "src/shared/api/auth-mock")).length,
  );
});

test("Router retains markup layouts and contains no entity state providers", () => {
  const router = fs.readFileSync(
    path.join(root, "src/app/providers/routes/Router.tsx"),
    "utf8",
  );
  assert.doesNotMatch(
    router,
    /(?:Dishes|Supplies|Store|Inventory|Orders)RoutesLayout|createContext|useState/,
  );
  assert.match(router, /MainLayout/);
  assert.match(router, /AuthLayout/);
  assert.match(router, /GuestRoutesLayout/);
});
