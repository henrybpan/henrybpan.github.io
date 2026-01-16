# Page Loading Bar Component

A modern, performant loading bar component for henrybpan.com that displays during internal page navigation.

## Features

✨ **Brand-Aligned Design**
- Uses official color palette (Misty Blue #C1C8D4, Pure Black #000000)
- Crimson Text typography for brand consistency
- Centered layout with "Henry Pan" name display

⚡ **Performance Optimized**
- GPU-accelerated animations (transform/opacity only)
- Zero dependencies - pure vanilla JavaScript
- 60fps target with requestAnimationFrame
- Minimal DOM manipulation

🎯 **Smart Navigation Detection**
- Activates only for internal links
- Ignores external links, hash links, downloads
- Handles browser back/forward navigation correctly
- Prevents "stuck loading" bug with bfcache handling

🔧 **Easy Customization**
- CSS variables for all visual properties
- Configurable timing and animation curves
- Mobile responsive out of the box
- Respects prefers-reduced-motion

## File Structure

```
henrybpan.github.io/
├── _includes/
│   └── loading-bar.html          # HTML structure (Jekyll include)
├── assets/
│   ├── css/
│   │   └── loading-bar.css       # Standalone CSS component
│   └── js/
│       └── loading-bar.js        # Standalone JavaScript
└── README-loading-bar.md         # This file
```

## Installation

### Step 1: Add HTML to Layout

Add the loading bar include to your main layout file (usually `_layouts/default.html`):

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Your existing head content -->
  <link rel="stylesheet" href="{{ '/assets/css/loading-bar.css' | relative_url }}">
</head>
<body>
  <!-- Add loading bar at the start of body -->
  {% include loading-bar.html %}

  <!-- Your existing content -->
  {{ content }}

  <!-- Add JavaScript before closing body tag -->
  <script src="{{ '/assets/js/loading-bar.js' | relative_url }}"></script>
</body>
</html>
```

### Step 2: Verify File Paths

Ensure these files exist:
- `_includes/loading-bar.html`
- `assets/css/loading-bar.css`
- `assets/js/loading-bar.js`

### Step 3: Build and Test

```bash
# Build Jekyll site
bundle exec jekyll build

# Serve locally to test
bundle exec jekyll serve

# Navigate to http://localhost:4000 and test internal links
```

## Configuration

### Customizing Colors

Edit CSS variables in `assets/css/loading-bar.css`:

```css
:root {
  --loading-bar-width: 280px;        /* Progress bar width */
  --loading-bar-height: 3px;         /* Progress bar thickness */
  --loading-bar-color: #C1C8D4;      /* Misty Blue */
  --loading-brand-size: 32px;        /* "Henry Pan" font size */
  --loading-brand-spacing: 20px;     /* Gap between name and bar */
}
```

### Customizing Timing

Edit configuration in `assets/js/loading-bar.js`:

```javascript
const config = {
  minDisplayTime: 300,               // Minimum visibility time (ms)
  progressSteps: [
    { progress: 30, delay: 100 },    // Quick start
    { progress: 60, delay: 200 },    // Gradual middle
    { progress: 85, delay: 400 },    // Slow approach
    { progress: 95, delay: 800 }     // Final wait
  ]
};
```

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Requirements:** Modern browsers with ES6+ support

## How It Works

### Navigation Detection

1. **Click Event Delegation**: Single listener on document catches all clicks
2. **Link Filtering**: Checks if target is internal link
3. **External Link Detection**: Compares origins to determine external vs internal
4. **Hash Link Handling**: Ignores same-page anchor links

### Progress Animation

1. **GPU Acceleration**: Uses `transform: scaleX()` instead of `width`
2. **Simulated Curve**: Realistic progress curve (fast → gradual → slow)
3. **Minimum Display**: Prevents flicker on fast page loads (300ms minimum)
4. **Auto-Completion**: Completes on `window.load` event

### Back Button Fix

**The Problem**: Previous implementations got stuck when using browser back button

**The Solution**:
1. **`popstate` event**: Detects back/forward navigation
2. **`pageshow` event**: Handles bfcache (Back-Forward Cache) restoration
3. **Immediate cleanup**: Forces loading bar to hide on back navigation
4. **State reset**: Clears all timers and animations

```javascript
// Critical handlers for back button support
window.addEventListener('popstate', handlePopState);
window.addEventListener('pageshow', handlePageShow);
```

## Manual Control (Optional)

The component exposes a global API for manual control:

```javascript
// Show loading bar programmatically
window.LoadingBar.show();

// Hide loading bar
window.LoadingBar.hide();

// Complete and hide (smooth finish)
window.LoadingBar.complete();
```

**Use cases:**
- AJAX navigation
- Single Page Applications
- Custom routing logic

## Performance Characteristics

- **DOM Elements**: 4 elements (minimal footprint)
- **CSS Size**: ~3KB (uncompressed)
- **JS Size**: ~5KB (uncompressed)
- **Animation FPS**: 60fps (GPU-accelerated)
- **Memory**: <1MB runtime footprint

## Troubleshooting

### Loading bar doesn't appear

**Check:**
1. HTML include is in layout: `{% include loading-bar.html %}`
2. CSS is loaded: Check browser dev tools Network tab
3. JS is loaded: Check for console errors
4. Element exists: Inspect DOM for `#page-loading-overlay`

### Loading bar appears on external links

**Fix:** Ensure external links have proper `href` attributes with full URLs:
```html
<!-- Good -->
<a href="https://twitter.com/henrypan">Twitter</a>

<!-- May be detected as internal -->
<a href="twitter.com/henrypan">Twitter</a>
```

### Loading bar stays visible

**Possible causes:**
1. JavaScript error preventing completion
2. Page load event not firing
3. Infinite progress loop

**Debug:**
```javascript
// Check state in browser console
console.log(window.LoadingBar);

// Manually hide
window.LoadingBar.hide();
```

### Back button still causes issues

**Verify:**
1. `popstate` listener is attached (check in dev tools)
2. No JavaScript errors on navigation
3. Page is not using custom history management

## Accessibility

- **ARIA Labels**: `aria-live="polite"` for screen readers
- **ARIA Busy**: `aria-busy` state reflects loading status
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **Semantic HTML**: Proper heading hierarchy
- **Keyboard Navigation**: No interference with tab navigation

## Credits

**Design**: Inspired by "Wanderer Above the Sea of Fog" aesthetic
**Typography**: Crimson Text (Google Fonts)
**Animation**: Material Design motion curves

## License

Proprietary - Henry Pan Personal Website
© 2026 Henry Pan. All rights reserved.

## Support

For issues or questions:
- Check this README first
- Inspect browser console for errors
- Test in demo.html (included)
- Review component source code

---

**Version**: 1.0.0
**Last Updated**: January 2026
**Compatibility**: Jekyll 4.x+
