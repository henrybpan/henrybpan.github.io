"""
Downloads Instagram profile photos for testimonial creators.
Run once: python3 scripts/scrape_photos.py
Requires: pip install playwright && playwright install chromium
"""

import asyncio
import os
import urllib.request
from playwright.async_api import async_playwright

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "../testimonials/photos")

USERNAMES = [
    "seb.e.ko",
    "rohabits",
    "sheancreates",
    "ericvwrld",
    "lifeofdeigogabriel",
    "leogibson.mp4",
    "jaqoea",
    "justtonch",
]


async def fetch_photo(page, username):
    url = f"https://www.instagram.com/{username}/"
    print(f"  Visiting {url} ...")
    try:
        await page.goto(url, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(2000)

        # Try OG image meta tag first (most reliable)
        og_image = await page.evaluate(
            "() => document.querySelector('meta[property=\"og:image\"]')?.content"
        )
        if og_image:
            print(f"  Found OG image for @{username}")
            return og_image

        # Try profile picture img tag
        img_src = await page.evaluate(
            "() => { "
            "  const img = document.querySelector('img[alt*=\"profile picture\"]') "
            "           || document.querySelector('header img'); "
            "  return img ? img.src : null; "
            "}"
        )
        if img_src:
            print(f"  Found profile img for @{username}")
            return img_src

    except Exception as e:
        print(f"  Error fetching @{username}: {e}")

    return None


async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1280, "height": 800},
        )
        page = await context.new_page()

        for username in USERNAMES:
            safe_name = username.replace(".", "_")
            dest = os.path.join(OUTPUT_DIR, f"{safe_name}.jpg")
            if os.path.exists(dest):
                print(f"@{username}: already downloaded, skipping.")
                continue

            print(f"\n@{username}:")
            photo_url = await fetch_photo(page, username)

            if photo_url:
                try:
                    req = urllib.request.Request(
                        photo_url,
                        headers={"User-Agent": "Mozilla/5.0"},
                    )
                    with urllib.request.urlopen(req, timeout=15) as resp:
                        with open(dest, "wb") as f:
                            f.write(resp.read())
                    print(f"  Saved → {dest}")
                except Exception as e:
                    print(f"  Download failed: {e}")
            else:
                print(f"  Could not find photo — will use initials avatar in HTML.")

        await browser.close()

    print("\nDone.")


if __name__ == "__main__":
    asyncio.run(main())
