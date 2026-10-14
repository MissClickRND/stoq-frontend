import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { checkImports } from "./check-imports.mjs";

function fixture(t, imports) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "stoq-imports-"));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith("stoq-imports-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  for (const [file, content] of Object.entries({
    "src/ui/Recomendtation/Row.tsx": "export const Row = () => null;",
    "src/ui/Errors/index.ts": "export const error = 404;",
    "src/ui/Card.module.css": ".card {}",
    "src/ui/Icon.svg": "<svg />",
    "src/page.tsx": imports,
  })) {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
  execFileSync("git", ["init", "--quiet"], { cwd: root });
  execFileSync("git", ["add", "src"], { cwd: root });
  return root;
}

test("checks aliases, relative imports, directory indexes, CSS, assets and dynamic imports", (t) => {
  const root = fixture(
    t,
    `
    import { Row } from "@/ui/Recomendtation/Row";
    export { error } from "./ui/Errors";
    import styles from "./ui/Card.module.css";
    import icon from "./ui/Icon.svg?url";
    const lazy = import("./ui/Recomendtation/Row");
    // import { Missing } from "@/missing-comment";
    /* export { Missing } from "./missing-block-comment"; */
  `,
  );
  assert.deepEqual(checkImports(root), []);
});

test("reports casing mismatches using Git's names even on case-insensitive Windows", (t) => {
  const root = fixture(
    t,
    `
    import { Row } from "./ui/recomendtation/Row";
    export { error } from "@/ui/errors";
    const lazy = import("./ui/Recomendtation/row");
    import missing from "./missing";
  `,
  );
  const problems = checkImports(root);
  assert.equal(problems.length, 4);
  assert.match(
    problems[0],
    /регистр не совпадает с Git: src\/ui\/Recomendtation\/Row.tsx/,
  );
  assert.match(problems[1], /src\/ui\/Errors\/index.ts/);
  assert.match(problems[2], /src\/ui\/Recomendtation\/Row.tsx/);
  assert.match(problems[3], /файл не найден/);
});

test("deployments without Git metadata still validate paths and casing", (t) => {
  const root = fixture(t, 'import { Row } from "./ui/recomendtation/Row";');
  fs.renameSync(path.join(root, ".git"), path.join(root, "saved-git-metadata"));
  assert.match(checkImports(root)[0], /src\/ui\/Recomendtation\/Row.tsx/);
  fs.writeFileSync(
    path.join(root, "src/page.tsx"),
    'import { Row } from "./ui/Recomendtation/Row";',
  );
  assert.deepEqual(checkImports(root), []);
});
