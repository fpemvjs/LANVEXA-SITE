# Website rollback

1. **Contain:** stop promotion, disable the affected form/distribution workflow, and preserve the failing URL/deployment evidence.
2. **Restore:** restore the previous known-good Netlify deployment using the currently documented platform rollback mechanism; verify the exact control in Netlify before relying on it.
3. **Identify:** locate the offending commit and affected output.
4. **Fix:** make the smallest corrective change.
5. **Verify locally:** run `npm ci`, `npm run verify:launch`, and visual checks.
6. **Verify preview:** deploy a preview and run `npm run verify:deployed -- https://preview-url`.
7. **Promote:** only after human review.
8. **Record:** add the incident, fix commit, deployment identifiers, and rollback reference to `WEB-RELEASE-LOG.md`.

Apply this flow to broken production output, form failure, incorrect metadata, an unsupported claim, exposed internal data, or bad release media. For disclosure incidents also follow `PUBLICATION-INCIDENT.md`.
