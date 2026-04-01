# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static personal website for Henry Pan (henrybpan.com), deployed via GitHub Pages. No build system — all files are plain HTML/CSS/JS served directly.

## Deployment

Push to `main` → GitHub Pages auto-deploys. The custom domain `henrybpan.com` is configured via `CNAME`. The `.nojekyll` file disables Jekyll processing so GitHub Pages serves files as-is.

## Architecture

The site is a collection of standalone HTML files. Each page is self-contained with all CSS inlined in `<style>` tags and JS inlined in `<script>` tags — there are no external stylesheets or JS modules.

**Page structure:**
- `index.html` — Landing page (the interactive business card)
- `about/index.html`, `essays/index.html`, `recommendations/index.html`, `work-with-me/index.html`, `testimonies-results/index.html` — Sub-pages (also served at `/about`, `/essays`, etc. without the trailing `/index.html`)
- Legacy redirects: `essays.html`, `recommendations.html`, `work-with-me.html` may exist alongside the directory versions

**Design system (consistent across all pages):**
- Dark background: `#0F0E0C`
- Card/surface color: `#EDE8DE` (warm cream)
- Primary text on dark: `rgba(237, 232, 222, 0.28)` or similar opacity variants
- Fonts: Cormorant Garamond (display/headings) + EB Garamond (body/UI) — loaded from Google Fonts
- Cinematic aesthetic inspired by Patrick Bateman business card scene

**Home page UX pattern:**
1. Business card renders centered with a cinematic vignette (`body::after`)
2. Click/Space/Enter flips the card (CSS 3D transform via `.is-flipped` class on `.card-scene`)
3. "See more" button on the back opens a popup overlay with 5 radiating mini-card navigation links
4. Popup closes on backdrop click or Escape key

**Sub-page pattern:**
- Dark full-height layout with entry animation (`@keyframes up`)
- Back arrow link `← Back` returning to `/`
- Heading + optional "Work in Progress" placeholder

## Conventions

- All CSS lives in `<style>` blocks within each HTML file — no shared stylesheet
- Responsive sizing uses `clamp()` and `min()` — avoid fixed pixel values for layout dimensions
- Font sizes on the card use `em` relative to the card's root `font-size` (set via `clamp()` on `.card-face`)
- `@media (prefers-reduced-motion: reduce)` blocks must be included when adding any animation
- Social links use `target="_blank" rel="noopener noreferrer"` — maintain this on all external links
- Favicon lives at `/favicon.png` (root) — all pages reference it as `<link rel="icon" type="image/png" href="/favicon.png">`
- Open Graph + Twitter Card meta tags live only on `index.html`; preview image is `/preview.png`; canonical URL is `https://henrybpan.com/`

## Testimonies & Results page

**File:** `testimonies-results/index.html`

- 2-column CSS grid of client cards (1-column on mobile ≤ 680px)
- Each card: circular profile photo (52px), `@username` linking to Instagram, IG/TikTok follower badges, HTML5 `<video>` testimonial
- Profile photos downloaded from Instagram and stored at `/testimonials/photos/{safe_username}.jpg` — safe name replaces `.` with `_` (e.g. `leogibson_mp4.jpg`)
- Testimonial videos live at `/testimonials/{username}_testimonial.MOV`
- `justtonch` card has no video (Instagram + TikTok stats only)
- Scraper script at `scripts/scrape_photos.py` — requires `playwright` + `playwright install chromium`; run once to refresh photos

**Client social data (hardcoded — update manually when counts change):**

| Username | Instagram | TikTok |
|---|---|---|
| seb.e.kho | 25.8k | — |
| rohabits | 101k | 65.6k |
| sheancreates | 10.3k | — |
| ericvwrld | 5.9k | — |
| lifeofdiegogabriel | 13.2k | — |
| leogibson.mp4 | 16.4k | 27.3k |
| jaqoea | 10k | 13.5k |
| justtonch | 17.5k | 28.2k |

## Home page popup cards (mini navigation)

- 5 mini business cards fly out from center on "more info" click: About, Essays, Recommendations, Work with Me, Results
- Cards are draggable via Pointer Events API — drag threshold is 6px before `hasMoved` is set
- `hasMoved` reset is deferred with `requestAnimationFrame` so the click handler can still block navigation on drag-release
- Both `pointerup` and `pointercancel` call the shared `endDrag` function
- Positions defined in `placements[]` array as `{ dx, dy, rot, delay }` — dx/dy are fractions of viewport
