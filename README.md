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
3. Build command: `pnpm build`. Install command: `pnpm install`. The repo includes **`vercel.json`**, which sets **`framework: null`**, **`outputDirectory: "out"`**, and **`trailingSlash: true`** so Vercel deploys the **static export** folder Next writes (`out/`), not the serverless `.vercel/output` layout. Without that, the build can succeed while the live site returns **404**.
4. Deploy. Vercel runs `next build`; with `output: "export"` in `next.config.ts`, HTML and assets land in **`out/`**.

**First push:** If `origin` is empty locally, run `git remote add origin https://github.com/PodJamz/governmentmapped.git` then `git push -u origin main`. If GitHub already has history (for example only `LICENSE`), either pull merge with `git pull origin main --allow-unrelated-histories` and resolve, or replace the remote history only if you intend to overwrite it.

## Production build locally

```bash
pnpm build
```

With static export, artifacts appear under **`out/`**. You can sanity-check with `npx serve out`. **`next start`** is only for non-export Next apps; this project uses export.

If **`pnpm build`** fails with **ENOSPC**, free disk space (export copies the full client bundle into `out/`).

## Stack

- Next.js 16 (App Router), React 19, Tailwind 4, D3, Leaflet

## Data

Graph JSON lives at **`data/irish-public-sector.json`**. The UI enriches it at build time in `src/app/page.tsx`. Regenerate from the script (after editing `scripts/generate-irish-public-sector-json.mjs`):

```bash
node scripts/generate-irish-public-sector-json.mjs
```

Commit the updated JSON so Vercel and clones have the same tree.

## Note: static export vs “full” Next on Vercel

`next.config.ts` uses **`output: "export"`**. That keeps hosting simple (CDN static files, no Node server). If you later add **Route Handlers**, **dynamic server rendering**, or features that need a running server, remove `output: "export"` (and revisit `images.unoptimized`) so Vercel can run Next in server mode.
