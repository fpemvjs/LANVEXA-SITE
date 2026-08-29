# LANVEXA website

Static, multi-page Vite site for the early LANVEXA Windows Ethernet diagnostic product.

## Local development

```powershell
npm install
npm run dev
```

## Production build

```powershell
npm run build
npm run preview
```

Output: `dist/`

The build includes the homepage, FAQ, Privacy, Security, 404, and all documentation pages.

## Production-domain metadata

No production domain has been confirmed, so the default build intentionally omits canonical and `og:url` tags instead of publishing a fake URL.

Set one build-time value when the domain is known:

```powershell
$env:LANVEXA_SITE_URL='https://confirmed-domain.example'
npm run build
```

With that value, `vite.config.js` adds page-specific canonical/OG URLs, converts social-image metadata to an absolute URL, and generates `sitemap.xml` plus a sitemap-aware `robots.txt`. Do not put a placeholder domain in production configuration.

## Recommended deployment: Netlify

Netlify is the direct fit because the email-only beta form uses Netlify Forms and `netlify.toml` configures the build, 404, caching, and security headers.

1. Confirm all release-readiness items below.
2. Set `LANVEXA_SITE_URL` in the Netlify build environment after the domain is confirmed.
3. Import the local Git repository.
4. Verify build command `npm run build` and publish directory `dist`.
5. Deploy a preview.
6. Test the `beta-access` form and configure an authorized notification recipient.
7. Test CSP headers, the branded 404, all documentation routes, and the generated sitemap before production promotion.

CLI preview deployment:

```powershell
npm install
npm run build
npx netlify-cli login
npx netlify-cli deploy --dir=dist
```

Do not run a production deploy until the domain, privacy owner, form workflow, and product-release requirements are complete.

## Beta form

- Form name: `beta-access`
- Required user fields: email only
- Localhost submission: intentionally disabled
- External API keys: none

Before public use, confirm the legal publisher, privacy contact, retention/deletion process, notification recipient, success email, and spam handling.

## Brand assets

Located in `public/brand/`:

- `lanvexa-x.svg` — primary X
- `lanvexa-x-small.svg` — pixel-aligned favicon/small UI variant
- `lanvexa-x-reverse.svg` — dark-background X
- `lanvexa-x-mono.svg` — monochrome X
- `lanvexa-wordmark.svg` — primary wordmark
- `lanvexa-wordmark-reverse.svg` — dark-background wordmark

Social-preview source: `public/lanvexa-social.svg`  
Rendered 1200 × 630 preview: `public/lanvexa-social.png`

## Authentic product media

No authentic screenshot or video currently exists in this repository. Reserved locations are documented in `public/media/README.md`:

- `public/media/lanvexa-demo.webm`
- `public/media/lanvexa-demo.mp4`
- `public/media/lanvexa-demo-poster.png`
- `public/media/lanvexa-product-screenshot.png`

Do not populate those locations with generated or reconstructed product screenshots.

## Content locations

- Homepage and example values: `index.html`
- Interactive demo and form behavior: `src/main.js`
- Shared brand/layout/documentation styling: `src/styles.css`
- FAQ: `faq.html`
- Security disclosure: `security.html`
- Beta-form privacy notice: `privacy.html`
- Documentation: `docs/`
- Build inputs and domain metadata: `vite.config.js`
- Hosting configuration: `netlify.toml`

## Required before controlled beta distribution

- Confirm legal publisher and public support/security/privacy contacts.
- Resolve Npcap licensing, packaging, installation, runtime privilege, and redistribution decisions.
- Verify capture filters, telemetry, storage, logs, outbound destinations, and update behavior against the application source.
- Authenticode-sign release binaries and publish hashes plus dependency/license notices.
- Publish tested Windows/system requirements, install/uninstall guidance, and endpoint-protection compatibility.
- Replace or supplement the interactive example with authentic LANVEXA screenshots and recordings.

All demo infrastructure must use `example.net`, RFC1918 addresses, or locally administered identifiers.
