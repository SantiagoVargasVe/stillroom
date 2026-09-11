# Code conventions

Stillroom is a browser-only React application. Media never leaves the tab.

## Module boundaries

- `src/App.tsx` composes the page, workspaces, and overlays.
- `src/features/workspace` owns imports, mode selection, and source lifetimes.
- `src/features/photo` owns edit history, preview synchronization, and photo controls.
- `src/features/export` owns export options and the explicit download action.
- `src/features/video` owns playback, browser media events, and captured frames.
- `src/components/layout` contains presentational page sections.
- `src/hooks` contains shared browser interactions: measurement, drops, notifications.
- `src/lib` contains media types, pure geometry/pixel operations, and browser adapters.
- `src/styles` separates styling by component and responsive concern. Import order in
  `src/index.css` preserves the cascade; responsive overrides come last.
- `tests` exercises observable browser behavior and exported media, grouped by workflow.

Import the module that owns a capability directly. Avoid catch-all utility barrels.
Keep editing logic in feature controllers; controls render controller values and
call event handlers. Add a new abstraction only when it has a distinct responsibility.

## State and effects

Related transitions belong together. Workspace imports and photo history use reducers
so one action updates the related values atomically. A draft is transient; committing
it truncates redo history and retains at most 60 states. Independent UI concerns can
use local state; no global store is needed.

Compute crop dimensions, aspect ratio, history availability, and export dimensions
from existing state during render. Do not synchronize one state value with another
through an effect. Initiate imports, exports, capture, seeking, and notification timers
in the event that requests them.

The remaining effects synchronize external browser systems:

| Owner | External system |
| --- | --- |
| `useWorkspace` | Initial sample request and source resource disposal |
| `useCanvasPreview` | Canvas drawing scheduled with `requestAnimationFrame` |
| `usePlayback` | Pausing the video when its workspace becomes inactive |
| `useCaptures` | Captured object URLs and unfinished work on unmount |
| `useNotification` | Timer cancellation on unmount |
| `Dialog` | Native modal dialog opening and closing |

DOM measurement uses a React 19 callback ref that disconnects its `ResizeObserver`
when the node is detached. Preview drawing depends on source, transform, color, and
comparison mode; crop/zoom changes do not repaint image pixels.

Every created object URL, decoder, timer, or temporary canvas needs an owner and a
cleanup path. `MediaSession` owns source resources independently of React state;
request generations discard stale sample/import results. Capture operations check
their generation after asynchronous encoding or image loading, before publishing
results. Preserve these guards when adding new asynchronous work.

## File size and verification

Authored code, styles, tests, configuration, and Markdown must stay at **100 physical
lines or fewer**, including blank lines and comments. Split by responsibility;
do not compress statements or remove useful formatting to satisfy the limit.

`npm run check:size` enforces the limit and runs as part of `npm run lint`. Generated
output, dependencies, vendored assets, binary fixtures, and the generated lockfile
are excluded. ESLint also enforces the limit for TypeScript and checks React Hooks
rules, dependencies, ref access, and state updates during rendering/effects.

Before submitting a change, run:

```sh
npm run lint
npm run build
npm test
```

Browser tests verify exported pixels, crop/transform history, slider commits,
notifications, video lifetime races, RAW decoding, and responsive layouts. The RAW
fixture is optional; see README for the download command. CI runs the other tests.

These conventions follow React's guidance on
[avoiding unnecessary effects](https://react.dev/learn/you-might-not-need-an-effect),
[reducers](https://react.dev/learn/extracting-state-logic-into-a-reducer), and
[custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks).
