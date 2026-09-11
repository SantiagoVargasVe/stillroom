import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

// Count physical lines, including comments and blanks. Generated outputs are excluded.
const extensions = /\.(?:[cm]?[jt]sx?|css|json|md|ya?ml)$/;
const ignored = new Set([
  "node_modules",
  ".git",
  "dist",
  "public",
  "test-results",
  "playwright-report",
  "package-lock.json",
  "tsconfig.tsbuildinfo",
]);
async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((entry) => !ignored.has(entry.name))
      .map(async (entry) => {
        const file = path.join(directory, entry.name);
        return entry.isDirectory()
          ? collect(file)
          : extensions.test(file)
            ? [file]
            : [];
      }),
  );
  return files.flat();
}
const files = await collect(".");
const counts = await Promise.all(
  files.map(async (file) => {
    const text = await readFile(file, "utf8");
    return {
      file,
      lines: text === "" ? 0 : text.replace(/\n$/, "").split("\n").length,
    };
  }),
);
const oversized = counts.filter(({ lines }) => lines > 100);
for (const { file, lines } of oversized)
  console.error(`${file}: ${lines} lines (maximum 100)`);
if (oversized.length) process.exitCode = 1;
else
  console.log(
    `Line limit passed: ${counts.length} authored files, maximum ${Math.max(...counts.map((item) => item.lines))} lines.`,
  );
