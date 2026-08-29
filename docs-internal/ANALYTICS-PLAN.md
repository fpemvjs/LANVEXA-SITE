# Beta analytics plan

No analytics code is currently shipped. Approval of a provider, privacy impact,
retention, and consent behavior is required before implementation.

## Minimum useful signals

| Signal | Question answered | Necessary for controlled beta? | Privacy impact |
|---|---|---|---|
| Aggregate homepage visit | Is qualified traffic reaching the site? | Optional | Low if IP/user-agent data is minimized and short-lived. |
| Beta CTA click | Does the product explanation create beta intent? | Optional | Low; aggregate counts are sufficient. |
| Beta form success | How many requests completed? | Yes, already available from form records; duplicate analytics event is unnecessary. | Email is personal data in the form system. Do not send it to analytics. |
| Documentation entry | Which technical questions lead visitors deeper? | Optional | Low with aggregate page views. |
| FAQ interaction | Which objections matter? | Optional after sufficient traffic | Event-level interaction can become unnecessary tracking. Prefer aggregate counts. |

## Recommendation

Start without analytics. Use Netlify form totals and direct beta interviews.
If traffic attribution becomes an operational problem, evaluate a
privacy-preserving, cookie-free aggregate provider. Do not add session replay,
fingerprinting, cross-site identity, advertising pixels, or form-field capture.

Before enabling any provider:

- document provider, data fields, retention, subprocessors, and access;
- update the privacy notice;
- apply the minimum CSP change needed;
- verify no email or diagnostic result is included in events;
- define a deletion and disablement procedure.
