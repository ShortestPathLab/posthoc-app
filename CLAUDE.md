# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Posthoc is a visualiser for sequential decision-making / search algorithms. Users emit "search traces" (logs), drop them into the app, and get interactive visualisations. The app runs both as a web SPA and as a packaged Electron desktop app.

## Package manager: Bun

This repo uses **Bun**, not Node/npm. Always run `bun install` (or `bun i`) **from the repository root** — it's a Bun workspace and installing in a sub-package will not resolve `workspace:*` deps correctly. Use `bunx` to run binaries and `bun run <script>` for package scripts.

## Common commands

Most work happens in `client/`. From `client/`:

```bash
bun start            # dev server (vite --host)
bun run build        # production build (vite/rolldown -> client/dist)
bun run typecheck    # tsc --noEmit (NOT part of build — see below)
bun run lint         # oxlint
bun run lint:fix     # oxlint --fix
bun run format       # oxfmt (format in place)
bun run format:check # oxfmt --check
bun run test         # vitest (watch)
bunx vitest run path/to/file.test.ts          # run one test file once
bunx vitest run -t "name of the test"          # run tests matching a name
sh ./package.sh      # package Electron binaries for win/linux/mac (electron-packager)
```

From the root: `bun start` and `bun run build:all` proxy into `client/`.

**The build does not typecheck.** `vite build` uses esbuild/rolldown and transpiles without type checking, so type errors do not fail the build and there is no typecheck in CI. Run `bun run typecheck` explicitly to find them — expect pre-existing errors in app code that are latent for this reason. `vite.config.ts` itself is excluded from `tsconfig.json`'s `include`.

## Tooling notes

- **Linting/formatting is oxc** (oxlint + oxfmt), configured from oxc defaults in `client/.oxlintrc.json` and `client/.oxfmtrc.json`. There is no ESLint or Prettier. oxfmt normalizes line endings to LF.
- **React Compiler** is enabled via `babel-plugin-react-compiler` in `client/vite.config.ts`. Be mindful of the rules of React; the compiler memoizes automatically.
- Tests run under Vitest + jsdom (`client/setupTests.ts`).

## Import conventions

Inside `client/src`, imports are **bare paths relative to `src/`**, not relative `../` paths — e.g. `import { createSlice } from "slices/createSlice"`, `import { Foo } from "components/..."`. This is resolved by `vite-tsconfig-paths` + the `"*": ["./src/*"]` path mapping in `client/tsconfig.json`. Workspace packages are imported by their package name: `protocol`, `renderer`, `internal-renderers`.

## Monorepo layout

The contract between the app and its data sources is the `protocol` package; everything else plugs into it.

- **`protocol/`** — shared TypeScript definitions for the JSON-RPC method/message contract between the client and "adapters": `CheckConnection`, `FeatureQuery` (maps/algorithms/traces discovery), `SolveTask` (run a pathfinding task), `Trace`/`Trace-v140` (the search-trace format), `Renderer`. When changing how the client talks to a backend, this is the source of truth.
- **`adapter-*/`** — backend servers implementing the protocol (solve tasks, serve maps/traces). Variants: `adapter-warthog-wasm` (in-browser WASM solver), `adapter-warthog-websocket`, `adapter-iron-harvest`, `adapter-fs-bridge`, `adapter-pipe`. The client connects to these via a `Transport` (JSON-RPC), discovered through `slices/connections`.
- **`renderer/` and `internal-renderers/`** — the drawing engines (e.g. `d2-renderer`) that paint search traces onto a canvas/viewport.
- **`client/`** — the React 19 SPA + Electron shell (`client/main.mjs` is the Electron main process / static file server).

## Client architecture (`client/src`)

- **State — `slices/`.** Custom state system built on `createSlice` (`slices/createSlice.tsx`): React Context + reducer with a per-slice "commit id" used to detect changes. Slices are exposed as `[useX, XProvider]` pairs and composed as nested providers (`slices/index.ts`, `slices/SliceProvider.tsx`). Some stores (`layers`, `ui`, `view`, `settings`, `loading`) are davstack/zustand stores instead. Read `slices/createSlice.tsx` before touching state.
- **Services — `services/`.** Headless React components (rendered once, no UI) that own side effects and wiring: `BootstrapService`, `ConnectionsService`, `RendererService`, `SyncService` (cross-tab/collab via `sysend`), `BreakpointService`, etc. Add cross-cutting runtime behavior here, not in pages.
- **Layers — `layers/`.** A visualization is a stack of layers (`trace`, `map`, `query`), driven by `LayerController`/`RenderLayer` and the `layers` store. This is the central data model the user manipulates.
- **Pages — `pages/`.** Routed views (`tree`, `visual-scripting`, `steps`, viewport, settings, etc.).
- **Workers — `workers/`.** Web workers for off-main-thread work: compression/decompression, hashing, YAML parsing, IPC (`usingWorker.ts` wraps them). Vite is configured with a separate `worker.plugins` pipeline.
