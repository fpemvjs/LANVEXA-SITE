# Production-domain preflight

The canonical origin is a human decision. Choose exactly one:

- **Apex canonical:** `https://domain` is canonical; `https://www.domain` permanently redirects to it.
- **WWW canonical:** `https://www.domain` is canonical; `https://domain` permanently redirects to it.

Do not configure both as independently indexable. After approval:

1. Configure DNS and managed HTTPS for both hostnames as needed.
2. Set `LANVEXA_SITE_URL` to the approved canonical origin with no trailing slash/path.
3. Configure the alternate hostname to redirect while preserving path/query.
4. Run `npm run verify:launch`.
5. Run `npm run verify:deployed -- https://canonical-origin --alternate-origin https://alternate-origin`.
6. Verify certificate validity, redirect status/destination, canonical and OG origin, sitemap/robots origin, and absence of mixed content.
7. Check provider aliases so preview/provider subdomains are not indexable duplicates.
