# Web-publication incident procedure

For a private hostname, personal email, unsupported claim, wrong privacy statement, incorrect installer link, or similar publication error:

1. **CONTAIN** — stop the affected form/distribution path and restore a known-good deployment.
2. **REMOVE** — remove the content from source, generated output, previews, and caches within operational control.
3. **VERIFY** — scan the deployed site and direct URLs; run `verify:launch` and `verify:deployed`.
4. **ASSESS** — identify what was exposed, duration, discoverability, recipients, and possible harm. Do not assume deletion erased third-party copies.
5. **CORRECT** — publish factual corrected content and notify affected parties when an assigned privacy/security owner determines it is required.
6. **DOCUMENT** — record timeline, owner, evidence, correction, and prevention in the release log without copying sensitive data unnecessarily.
