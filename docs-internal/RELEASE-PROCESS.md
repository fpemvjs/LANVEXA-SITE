# Website release process

`CHANGE → LOCAL BUILD → verify:launch → PREVIEW DEPLOYMENT → verify:deployed → HUMAN VISUAL REVIEW → PRODUCTION PROMOTION → POST-DEPLOY CHECK → RECORD RELEASE`

1. Work from a reviewed branch and preserve a clean rollback commit.
2. Run `npm ci`, `npm audit`, and `npm run verify:launch` with the intended environment.
3. Deploy a preview; do not enable the live beta form until its owner and notification path are ready.
4. Run `npm run verify:deployed -- https://preview-url --canonical-origin https://intended-origin`.
5. Review desktop/mobile visuals and form behavior.
6. Promote only the verified deployment.
7. Repeat deployed verification against production and perform one controlled live-form test.
8. Record the commit, provider deployment identifier, checks, and rollback reference.

## Versioning

Use the Git commit plus hosting deployment identifier. Do not publish a marketing website version. Tag a known-good launch only if tags become operationally useful.
