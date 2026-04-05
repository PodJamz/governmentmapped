# Eire

Manuscript-inspired **atlas** of Irish public sector bodies: radial graph, detail folios, and an optional geographic map. Styling is original (parchment, gold rule, display type); it does not reproduce any specific historical manuscript.

**Repository:** [github.com/PodJamz/governmentmapped](https://github.com/PodJamz/governmentmapped) (Apache-2.0).

## Develop

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push the [governmentmapped](https://github.com/PodJamz/governmentmapped) repo to GitHub (see **First push** below if the remote already has commits).
2. In [Vercel](https://vercel.com), **Import** the repository.
3. Framework preset: **Next.js**. Build command: `pnpm build` (or leave default if Vercel detects it). Install command: `pnpm install`.
4. Deploy. Vercel runs `next build`; with `output: "export"` in `next.config.ts`, the app ships as **static pages**, which is fine for this UI.

No extra output-directory setting is required for the default Next.js integration on Vercel.

**First push:** If `origin` is empty locally, run `git remote add origin https://github.com/PodJamz/governmentmapped.git` then `git push -u origin main`. If GitHub already has history (for example only `LICENSE`), either pull merge with `git pull origin main --allow-unrelated-histories` and resolve, or replace the remote history only if you intend to overwrite it.

## Production build locally

```bash
pnpm build
```

With static export, artifacts appear under **`out/`**. You can sanity-check with `npx serve out`. **`next start`** is only for non-export Next apps; this project uses export.

If **`pnpm build`** fails with **ENOSPC**, free disk space (export copies the full client bundle into `out/`).

## Stack

- Next.js 15 (App Router), React 19, Tailwind 4, D3, Leaflet

## Data

Graph JSON lives under `data/`. The UI enriches it at build time in `src/app/page.tsx`.

## Note: static export vs “full” Next on Vercel

`next.config.ts` uses **`output: "export"`**. That keeps hosting simple (CDN static files, no Node server). If you later add **Route Handlers**, **dynamic server rendering**, or features that need a running server, remove `output: "export"` (and revisit `images.unoptimized`) so Vercel can run Next in server mode.
