import { cp, mkdir } from "node:fs/promises";
// Keep the worker, JS glue and WASM together; all are served from our own origin.
await mkdir(new URL("../public/vendor/libraw/", import.meta.url), {
  recursive: true,
});
await cp(
  new URL("../node_modules/libraw-wasm/dist/", import.meta.url),
  new URL("../public/vendor/libraw/", import.meta.url),
  { recursive: true },
);
