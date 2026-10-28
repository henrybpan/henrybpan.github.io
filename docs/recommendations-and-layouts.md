# Affiliates, recommendations, and homepage layouts

## Homepage

`index.html` contains one main landmark and two independent layout containers:
- `.home-mobile`: shown below 760px.
- `.home-desktop`: shown from 760px upward.

Each layout has its own scoped CSS and markup inside the same file. Keep page-specific styles inline. The desktop starts with the existing appearance; redesign only its styles and container. When changing shared content such as social URLs, navigation, or the featured video, update both containers. Hidden layouts use `display: none` and are excluded from keyboard navigation and the accessibility tree. Each layout has a clickable YouTube poster; mobile taps try the YouTube app and fall back to the video URL.

## Affiliate cards

In `affiliates/index.html`, duplicate `.affiliate-card` for another partner. The banner currently uses the partner name as text; replace it with a supplied logo or banner image when available. Add personal copy inside `.card-copy`. Preserve the commission disclosure and `rel="sponsored noopener noreferrer"` on referral links.

## Publish a book review

No reviews or Amazon affiliate URLs were supplied. The recommendations page therefore shows an existing cover with “Review coming soon.” The old `/library/` and `/lindy-library/` collections remain available; books marked unread are not automatically recommendations.

1. Copy `_templates/book-review.html` to `bookshelf/<book-slug>/index.html`.
2. Replace the draft title, description, cover/alt text, author, and body with Henry’s review. Existing covers are in `assets/books/`.
3. Replace the purchase placeholder with the commented “Get the book” anchor, using the supplied Amazon affiliate URL. Keep the disclosure immediately beneath it.
4. Remove the draft label and `noindex, nofollow` meta tag from the finished review only. The template stays unlinked and noindex; like all static source files it is accessible by direct URL, so never store private drafts there.
5. On `bookshelf/index.html` (formerly Recommendations; `/recommendations/` redirects there), wrap the book’s cover and title in an anchor to the new review route. Remove its coming-soon badge. Duplicate the card for each additional published review.
6. Preview the page at mobile and desktop widths and check both the review link and purchase link before pushing.

These are static HTML pages and need no build command.
