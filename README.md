# LANVEXA website

Static, multi-page Vite site for the early LANVEXA Windows Ethernet diagnostic product.

## Local development

Deployment baseline: Node.js 22.x (`.nvmrc` and `netlify.toml`). The declared compatibility range is Node 22–24.

```powershell
npm ci
npm run dev
```

## Production build

```powershell
npm run build
npm run preview
```

Pre-deployment verification:

```powershell
npm run verify:launch
```

Deployed-site verification (after a preview exists):

```powershell
npm run verify:deployed -- https://preview-url
```

Add `--canonical-origin https://approved-origin` when preview metadata targets a different approved origin, and `--alternate-origin https://alternate-host` after the www/apex redirect is configured. HTTPS is required outside the script's explicit local-test mode.

Output: `dist/`

The build includes the homepage, beta-request confirmation, FAQ, Privacy, Security, 404, and all documentation pages. The confirmation route is `noindex` and excluded from the sitemap.

## Production-domain metadata

No production domain has been confirmed, so the default build intentionally omits canonical and `og:url` tags instead of publishing a fake URL.

Set `LANVEXA_SITE_URL` to the confirmed HTTPS production origin in the hosting build environment, then run the production build.

With that value, `vite.config.mjs` adds page-specific canonical/OG URLs, converts social-image metadata to an absolute URL, and generates `sitemap.xml` plus a sitemap-aware `robots.txt`. The build rejects HTTP, localhost, and placeholder origins.

Optional centralized values are `LANVEXA_PUBLISHER_NAME`, `LANVEXA_SUPPORT_EMAIL`, `LANVEXA_SECURITY_EMAIL`, and `LANVEXA_PRIVACY_EMAIL`. Unset values are omitted; never use template identities or addresses.

## Recommended deployment: Netlify

Netlify is the direct fit because the email-only beta form uses Netlify Forms and `netlify.toml` configures the build, 404, caching, and security headers.

1. Confirm all release-readiness items below.
2. Set `LANVEXA_SITE_URL` in the Netlify build environment after the domain is confirmed.
3. Import the local Git repository.
4. Verify build command `npm run build` and publish directory `dist`.
5. Deploy a preview.
6. Confirm Netlify detects the `beta-access` form.
7. Under **Project configuration → Notifications → Form submission notifications**, configure only the approved recipient.
8. Submit and delete a test request using the approved operations process.
9. Set `VITE_LANVEXA_ENABLE_BETA_FORM=true` only after that test succeeds.
10. Test CSP headers, the branded 404, all documentation routes, and the generated sitemap before production promotion.
11. Run `npm run verify:deployed -- https://preview-url`, visually review, then repeat against production after promotion.

CLI preview deployment:

```powershell
npm ci
npm run build
npx netlify-cli login
npx netlify-cli deploy --dir=dist
```

Do not run a production deploy until the domain, privacy owner, form workflow, and product-release requirements are complete.

## Beta form

- Form name: `beta-access`
- Required user fields: email only
- Unconfigured JavaScript submission: intentionally disabled
- JavaScript submission: disabled unless `VITE_LANVEXA_ENABLE_BETA_FORM=true` at build time
- External API keys: none
- Encoding: `application/x-www-form-urlencoded`
- Honeypot field: `company-website`
- JavaScript disabled: native required-email validation and normal form POST remain available
- Successful form destination: `/beta-requested.html`

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

Do not populate those locations with generated or reconstructed product screenshots. The build automatically uses valid authentic media and otherwise retains the interactive HTML example.

## Content locations

- Homepage and example values: `index.html`
- Interactive demo and form behavior: `src/main.js`
- Shared brand/layout/documentation styling: `src/styles.css`
- FAQ: `faq.html`
- Security disclosure: `security.html`
- Beta-form privacy notice: `privacy.html`
- Documentation: `docs/`
- Build inputs, contacts, publisher, and domain metadata: `vite.config.mjs`
- Environment validation: `config/site.mjs`
- Pre-deployment checks: `scripts/verify-launch.mjs`
- Deployed-site checks: `scripts/verify-deployed.mjs`
- Internal launch operations: `docs-internal/`
- Hosting configuration: `netlify.toml`

## Required before controlled beta distribution

- Confirm legal publisher and public support/security/privacy contacts.
- Resolve Npcap licensing, packaging, installation, runtime privilege, and redistribution decisions.
- Verify capture filters, telemetry, storage, logs, outbound destinations, and update behavior against the application source.
- Authenticode-sign release binaries and publish hashes plus dependency/license notices.
- Publish tested Windows/system requirements, install/uninstall guidance, and endpoint-protection compatibility.
- Replace or supplement the interactive example with authentic LANVEXA screenshots and recordings.

All demo infrastructure must use `example.net`, RFC1918 addresses, or locally administered identifiers.

## Website SBOM

`npm run sbom` uses npm's built-in CycloneDX output and writes an ignored release artifact at `artifacts/lanvexa-site.cdx.json`. The site has no npm runtime dependency; Vite and its locked graph are build-only.
