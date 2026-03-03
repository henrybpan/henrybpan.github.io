# CLAUDE.md — henrybpan.github.io

This file provides context for AI assistants working in this repository.

## Project Overview

Personal website for Henry Pan, hosted at **henrybpan.com** via GitHub Pages. The site serves as a personal brand hub for a content creator and coach who helps Christian entrepreneurs build personal brands. The current design theme is called **"The Wanderer"** (as of early 2026).

## Technology Stack

- **Static site generator:** Jekyll (GitHub Pages native)
- **Markup:** HTML5 with inline CSS and vanilla JavaScript — no frameworks, no build tools
- **Fonts:** Cormorant Garamond (serif) and Inter (sans-serif) via Google Fonts
- **No npm, no Webpack, no Sass** — everything is plain HTML/CSS/JS

## Repository Structure

```
henrybpan.github.io/
├── _layouts/
│   └── default.html          # Jekyll layout for all secondary pages
├── _includes/
│   └── loading-bar.html      # Page loading bar component
├── _config.yml               # Jekyll config (title, URL, permalink)
├── assets/
│   ├── css/loading-bar.css   # Loading bar styles
│   └── js/loading-bar.js     # Loading bar logic
├── data/
│   └── bible-verses.json     # 19 Bible verses (used on home page)
├── writings/
│   ├── on-marty-supreme.html # Essay (Jan 2026)
│   └── pickupartist.html     # Poetry (Dec 2025)
├── apply/
│   └── index.html            # Typeform redirect page
├── index.html                # Home page (standalone — does NOT use Jekyll layout)
├── about.html                # About page (uses default layout)
├── coaching.html             # Coaching page (uses default layout)
├── writings.html             # Writings listing (uses default layout)
├── recommendations.html      # Recommendations (uses default layout)
├── thoughts.html             # Thoughts page (uses default layout)
├── colors.html               # Brand color reference (uses default layout)
├── poster.jpg                # Video poster/fallback image
├── wanderer-bg.mp4           # Hero background video
├── CNAME                     # Custom domain: henrybpan.com
├── README-loading-bar.md     # Loading bar component documentation
└── SETUP-COMPLETE.md         # Jekyll migration notes
```

## Two-Layout Architecture (Critical)

This site has **two distinct page architectures** that must not be confused:

### 1. Home page (`index.html`) — Standalone
- Has **no Jekyll front matter** (`---` blocks)
- Contains all its own HTML, CSS (in `<style>` tags), and JavaScript inline
- Uses a cinematic layout: fixed video background, sidebar vertical nav, full-page sections
- Design: dark background `#1A1D24`, hero with rotating Bible verse quotes, scroll-reveal animations
- This page is intentionally self-contained and bypasses `_layouts/default.html`

### 2. All other pages — Jekyll Layout
- Start with YAML front matter:
  ```html
  ---
  layout: default
  title: Page Title
  ---
  ```
- Use `_layouts/default.html` which provides: fixed header nav, mobile hamburger menu, footer, all shared CSS/JS
- Page-specific content goes inside `<section class="content">...</section>`

## Design System

### Color Palette
| Name | Hex | Usage |
|------|-----|-------|
| Primary Black | `#050507` | Default layout background |
| Wanderer Dark | `#1A1D24` | Home page background |
| Off-white | `#E8E8EC` | Primary text |
| Accent Gold | `#D4A574` | Highlights, hover effects, links |
| Accent Blue | `#C1C8D4` | Section labels |
| Charcoal | `#2C2C2C` | Buttons |
| Mid-gray | `#8A8E98` | Secondary text |

### Typography
- **Headings / Display:** Cormorant Garamond (serif), weights 300–500
- **Body / UI:** Inter (sans-serif), weights 300–500
- **Fluid sizing:** Use CSS `clamp()` for responsive type (e.g., `clamp(32px, 4vw, 48px)`)

### Responsive Breakpoints
- Desktop sidebar nav switches to mobile hamburger at **900px**
- Additional adjustments at **640px** and **400px**

## Development Workflow

### Running Locally
```bash
jekyll serve         # Serve at http://localhost:4000
jekyll build         # Build to _site/ (not committed)
```
No npm install or other setup steps required.

### Adding a New Secondary Page
1. Create a new `.html` file in the root (or a subdirectory)
2. Add Jekyll front matter at the top:
   ```html
   ---
   layout: default
   title: My New Page
   ---
   ```
3. Write page content inside `<section class="content">...</section>`
4. Add a nav link in `_layouts/default.html` if the page should appear in navigation

### Adding a New Writing/Essay
1. Create `writings/my-essay-title.html` with the Jekyll front matter and `default` layout
2. Include a back link: `<a href="/writings" class="back-link">&larr; Back to Writings</a>`
3. Add the essay to the listings in `writings.html` and on `index.html` (in the Writing section)

### Modifying the Home Page
- Edit `index.html` directly — all styles and scripts are inline in that file
- The Bible verse quotes are loaded from `data/bible-verses.json` via `fetch()`
- To add a Bible verse, append an object `{"text": "...", "reference": "Book X:Y"}` to that JSON array

### Modifying Shared Layout (all secondary pages)
- Edit `_layouts/default.html` — changes apply to every page using the default layout
- CSS is embedded in a `<style>` block inside default.html (not a separate file)

## Key Conventions

1. **No external JavaScript libraries** — keep everything in vanilla JS
2. **No CSS preprocessors** — write plain CSS, use custom properties for theming
3. **Inline styles in layouts** — CSS lives inside `<style>` tags in the layout/page files, not in separate `.css` files (the only exception is `assets/css/loading-bar.css`)
4. **Semantic section IDs** — sections use IDs for anchor navigation (e.g., `#about`, `#thoughts`, `#writing`)
5. **Accessibility** — include `aria-label` on interactive elements, respect `prefers-reduced-motion`
6. **Animation pattern** — use `.reveal` class + `IntersectionObserver` for scroll-triggered fade-ins; use CSS `animation` with `opacity` + `transform` for entrance animations
7. **Gold accent on hover** — interactive links consistently transition to `#D4A574` (gold) on hover
8. **Page title format** — `Page Title — Henry Pan` (em dash separator)

## Loading Bar Component

An animated loading bar (`_includes/loading-bar.html` + `assets/js/loading-bar.js`) shows during internal page navigation. It:
- Triggers on clicks to same-origin links (ignores hash links, downloads, external)
- Animates progress: 30% → 60% → 85% → 95% → 100%
- Respects `prefers-reduced-motion`
- Handles the browser back-forward cache (bfcache) to prevent stuck states

See `README-loading-bar.md` for full documentation on customization and troubleshooting.

## Deployment

Deployment is automatic via GitHub Pages on every push to `master`. The custom domain `henrybpan.com` is configured via the `CNAME` file. No CI/CD pipeline or build step is needed.

## Social / External Links
- Instagram: `https://instagram.com/henrybpan`
- TikTok: `https://tiktok.com/@henrybpan`
- LinkedIn: `https://linkedin.com/in/henrybpan`
- X: `https://x.com/henrypanonx`
- Coaching booking: `https://calendly.com/henrypaninquiries/30min`
