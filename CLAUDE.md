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
