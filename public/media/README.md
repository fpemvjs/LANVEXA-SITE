# Authentic LANVEXA product media

This directory is intentionally empty of product imagery until authentic application media is supplied.

Reserved production filenames:

- `lanvexa-demo.webm`
- `lanvexa-demo.mp4`
- `lanvexa-demo-poster.png`
- `lanvexa-product-screenshot.png`

Recommended first demonstration: Ethernet disconnected, cable connected, link detected, IP obtained, configured checks run, LLDP/CDP advertisement received, switch and advertised port shown.

Recommended second demonstration: connectivity checks pass but no LLDP/CDP advertisement is observed.

Do not replace these files with generated or reconstructed screenshots.

## Automatic website integration

The production build keeps the interactive HTML example when no authentic
media is present.

- A screenshot is enabled when `lanvexa-product-screenshot.png` exists.
- Video is enabled when the poster exists with at least one MP4 or WebM file.
- When valid video media exists, it takes precedence over the screenshot.

Video is rendered with native controls, `preload="none"`, a poster image, and
no autoplay. The original interactive example remains in source as the fallback.
Run `npm run verify:launch` after adding or replacing media.
