# Third-party notices

Stillroom includes these open-source dependencies. Their original licenses apply; package license files are available in `node_modules` after `npm ci`.

| Component                              | License              | Source                                             |
| -------------------------------------- | -------------------- | -------------------------------------------------- |
| React and React DOM                    | MIT                  | https://github.com/facebook/react                  |
| Vite                                   | MIT                  | https://github.com/vitejs/vite                     |
| Tailwind CSS                           | MIT                  | https://github.com/tailwindlabs/tailwindcss        |
| Lucide                                 | ISC                  | https://github.com/lucide-icons/lucide             |
| React Image Crop                       | ISC                  | https://github.com/dominictobias/react-image-crop  |
| LibRaw-Wasm wrapper 1.6.0              | ISC                  | https://github.com/ybouane/LibRaw-Wasm/tree/v1.6.0 |
| LibRaw, underlying WebAssembly library | LGPL-2.1 or CDDL-1.0 | https://www.libraw.org/download                    |
| Little CMS, used by the RAW build      | MIT                  | https://github.com/mm2/Little-CMS                  |

The LibRaw-Wasm source repository includes its wrapper, build scripts, pinned dependency/toolchain configuration, and instructions for rebuilding the WebAssembly. Stillroom uses the unmodified npm distribution. The decoder lives in separate local `vendor/libraw/` files and may be replaced by a compatible rebuilt version. See the upstream source and license texts when redistributing the compiled decoder.

The included photograph is from Unsplash, under https://unsplash.com/license. The synthetic motion fixture was generated specifically for this project. The optional upstream Sony RAW integration sample is downloaded separately and is not intended as an app asset.
