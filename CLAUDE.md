# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Angular 19 portfolio/booking website for a tattoo artist. Uses Google Sheets as a headless CMS and Cloudinary for image management. Interface is in Swedish.

## Commands

```bash
npm install          # Install dependencies
npm run config       # Generate environment files from .env (required before first run)
npm start            # Angular dev server on port 4200
npm run api          # Express API server on port 4000 (required for gallery)
npm run build        # Production build with SSR
npm test             # Run unit tests (Karma/Jasmine)
npm run serve:ssr:alex-tattoo  # Serve the SSR production build
```

Development requires two concurrent processes: `npm start` (Angular) and `npm run api` (Express proxy). The Angular dev server proxies `/api` requests to `http://localhost:4000` via `proxy.conf.json`.

## Architecture

### Data Flow

```
Angular Components → Services → External APIs
                              ├── Google Sheets API v4 (CMS content)
                              └── /api/gallery → Express → Cloudinary API
```

### Key Services

**`GoogleSheetsService`** — Fetches all site content from a Google Sheets spreadsheet (configured via `SPREADSHEET_ID`). Uses `shareReplay(1)` caching, has rate-limit handling (60s block on 429 responses), and falls back to mock data on errors.

**`CloudinaryService`** — Fetches gallery images through the Express `/api/gallery` proxy endpoint. Also uses `shareReplay(1)` caching.

### Server (`src/server.ts`)

Express server with dual role:
1. Serves the SSR Angular application
2. Exposes `GET /api/gallery` — proxies Cloudinary API calls server-side (avoids exposing API secret to browser)

### Environment Configuration

Run `npm run config` to generate `src/environments/environment.ts` and `src/environments/environment.development.ts` from `.env`. Never edit these generated files directly.

Required `.env` variables:
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER`
- `GOOGLE_SHEETS_API_KEY`, `SPREADSHEET_ID`

### Angular Patterns

- **Standalone components** throughout — no NgModules
- **Angular Signals** for local state; `toSignal()` to convert observables at component boundaries
- **Computed signals** for derived state (e.g., filtered gallery items)
- Pages: `home`, `gallery`, `contact` under `src/app/pages/`
- Layout: `header`, `footer` under `src/app/components/layout/`

### HTML

Always use semantic HTML. Prefer `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>` over `<div>` where appropriate. Use correct heading hierarchy (`<h1>` → `<h2>` → `<h3>`). Only one `<h1>` per page. Never skip heading levels. This matters for accessibility and SEO.

### Styling

Tailwind CSS with a dark brand theme. Custom brand colors:
- `brand-black` (#0a0a0a), `brand-dark` (#121212), `brand-gray` (#1e1e1e)
- `brand-gold` (#d4af37) — primary accent
- `brand-white` (#f5f5f5)

UI components from PrimeNG with the Aura Dark theme preset.

### Data Models

Key interfaces in `src/app/models/sheets.model.ts`: `SheetContent`, `ContactInfo`, `SiteData`, `GalleryItem`, `CloudinaryItem`.

### Production Build Output

- `dist/alex-tattoo/browser/` — static assets
- `dist/alex-tattoo/server/server.mjs` — SSR Node.js bundle

Run production: `node dist/alex-tattoo/server/server.mjs` (uses `PORT` env var, defaults to 4000).
