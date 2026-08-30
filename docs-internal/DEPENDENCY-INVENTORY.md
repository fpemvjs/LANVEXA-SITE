# Website dependency inventory

Inventory date: 2026-08-29. Source of truth: `package-lock.json` after `npm ci`.

## Production/runtime dependencies

**None.** The emitted static site uses local HTML, CSS, JavaScript, SVG, and PNG files; it does not ship an npm runtime library.

## Direct build dependency

| Package | Locked version | Purpose | Scope | License | Source |
|---|---:|---|---|---|---|
| vite | 8.2.2 | Static multi-page build and asset bundling | Build-only | MIT | npm registry tarball recorded in lockfile |

## Locked transitive build packages

| Package(s) | Version | License | Purpose/source |
|---|---:|---|---|
| @oxc-project/types | 0.147.0 | MIT | Build types; npm registry |
| rolldown; all `@rolldown/binding-*` optional platform packages | 1.2.6 | MIT | Bundler/platform bindings; npm registry |
| @rolldown/pluginutils | 1.0.1 | MIT | Bundler plugin utilities; npm registry |
| lightningcss; all `lightningcss-*` optional platform packages | 1.33.0 | MPL-2.0 | CSS processing/platform bindings; npm registry |
| detect-libc | 2.1.2 | Apache-2.0 | Platform detection; npm registry |
| fdir | 6.5.0 | MIT | File traversal; npm registry |
| fsevents | 2.3.3 | MIT | Optional macOS filesystem events; npm registry |
| nanoid | 3.3.18 | MIT | Build identifier utility; npm registry |
| picocolors | 1.1.1 | ISC | Build output coloring; npm registry |
| picomatch | 4.0.7 | MIT | Pattern matching; npm registry |
| postcss | 8.5.26 | MIT | CSS processing; npm registry |
| source-map-js | 1.2.1 | BSD-3-Clause | Source maps; npm registry |
| tinyglobby | 0.2.17 | MIT | Build file matching; npm registry |

The exact platform package selected varies by build host; all are retained in the lockfile as optional dependencies. License values above are package metadata, not legal conclusions. Re-run inventory/SBOM review whenever the lockfile changes. Application dependencies are out of scope because the desktop repository was not inspected or modified.

## SBOM

`npm run sbom` uses npm's built-in CycloneDX generator and writes `artifacts/lanvexa-site.cdx.json`. No SBOM library was added. Generate it for a release record; do not treat generation alone as a dependency review.
