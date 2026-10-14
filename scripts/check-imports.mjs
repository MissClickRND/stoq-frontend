import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const extensions = [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json"];

function sourceFiles(root) {
  try {
    return execFileSync(
      "git",
      [
        "ls-files",
        "--cached",
        "--others",
        "--exclude-standard",
        "-z",
        "--",
        "src",
      ],
      {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    )
      .split("\0")
      .filter((file) => file && fs.existsSync(path.join(root, file)));
  } catch {
    // Uploaded deployments may omit .git; Linux disk names remain case-sensitive.
    const walk = (directory) =>
      fs
        .readdirSync(path.join(root, directory), { withFileTypes: true })
        .flatMap((entry) =>
          entry.isDirectory()
            ? walk(`${directory}/${entry.name}`)
            : [`${directory}/${entry.name}`],
        );
    return walk("src");
  }
}

// Git's spelling is what Linux receives, even if Windows has different casing on disk.
export function checkImports(root) {
  const files = sourceFiles(root);
  const exact = new Set(files);
  const folded = new Map(files.map((file) => [file.toLowerCase(), file]));
  const problems = [];

  for (const file of files.filter((file) => /\.[cm]?[jt]sx?$/.test(file))) {
    const source = fs
      .readFileSync(path.join(root, file), "utf8")
      .replace(
        /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\/\*[\s\S]*?\*\/|\/\/[^\r\n]*)/g,
        (match, literal) => (literal ? match : match.replace(/[^\r\n]/g, " ")),
      );
    for (const match of source.matchAll(
      /(?:\bfrom\s+|\bimport\s*(?:\(\s*)?)["']([^"']+)["']/g,
    )) {
      const specifier = match[1];
      const value = specifier.split(/[?#]/)[0];
      if (!value.startsWith(".") && !value.startsWith("@/")) continue;
      const target = path.posix.normalize(
        value.startsWith("@/")
          ? `src/${value.slice(2)}`
          : path.posix.join(path.posix.dirname(file), value),
      );
      const candidates = [
        target,
        ...extensions.map((ext) => target + ext),
        ...extensions.map((ext) => `${target}/index${ext}`),
      ];
      if (candidates.some((candidate) => exact.has(candidate))) continue;
      const actual = candidates
        .map((candidate) => folded.get(candidate.toLowerCase()))
        .find(Boolean);
      const line = source.slice(0, match.index).split("\n").length;
      problems.push(
        `${file}:${line}: ${specifier} — ${actual ? `регистр не совпадает с Git: ${actual}` : "файл не найден"}`,
      );
    }
  }
  return problems;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const problems = checkImports(path.resolve(import.meta.dirname, ".."));
  if (problems.length) {
    console.error(
      "Ошибки локальных импортов (с учётом регистра в Git):\n" +
        problems.join("\n"),
    );
    process.exitCode = 1;
  } else console.log("Локальные импорты: пути и регистр корректны.");
}
