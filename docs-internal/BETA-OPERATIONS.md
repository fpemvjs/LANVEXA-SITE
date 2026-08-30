# Controlled beta operations runbook

Internal document. Do not publish with the website.

## Request flow

`Beta request submitted → Netlify records submission → authorized owner receives notification → request reviewed → tester receives controlled-beta instructions → feedback collected`

No software is distributed automatically.

## Request state machine

| State | Exit condition |
|---|---|
| NEW | An owner begins review. |
| REVIEWED | Eligibility decision is recorded. |
| ACCEPTED | Approved acceptance message is sent. |
| DECLINED | Approved waitlist/not-selected message is sent, if appropriate. |
| INSTALLATION SENT | Verified installer instructions and release identifier are recorded. |
| ACTIVE TESTER | Tester confirms installation or first real use. |
| FEEDBACK RECEIVED | Post-use feedback is recorded. |
| CLOSED | Access ends, tester withdraws, or the request is otherwise complete. |

Minimum operational fields: submitted email, submission date, review status, beta status, and notes. These are operational records; the public form remains email-only.

## Netlify setup and live verification

1. Deploy a preview with the form disabled.
2. Confirm Netlify detects the `beta-access` form.
3. Assign the approved recipient and backup; do not commit either address.
4. Configure form-submission notification through the current Netlify project settings.
5. Restrict project and submission access to assigned operators.
6. Enable `VITE_LANVEXA_ENABLE_BETA_FORM=true` only on a reviewed preview.
7. Submit a controlled test address with JavaScript enabled; verify storage, notification, single submission, and `/beta-requested.html`.
8. Repeat with JavaScript disabled to verify the native POST fallback.
9. Test invalid email, an unavailable endpoint, keyboard-only use, mobile layout, and browser back navigation.
10. Delete the test submission from every copy according to `DATA-DELETION.md`.

## Spam controls

- Level 1: keep the `company-website` honeypot and Netlify's built-in spam detection. This is the launch default.
- Level 2: add another anti-abuse control only after observed abuse, documenting the accessibility and privacy cost. Do not add CAPTCHA preemptively.

## Unresolved owner decisions

Notification recipient, owner/backup, eligibility criteria, response SLA, installer distribution, beta terms, support path, feedback channel, and removal/revocation process are all **UNASSIGNED** or **UNDECIDED**.

## Stop conditions

Pause acceptance/distribution for a bad installer, integrity mismatch, packet-capture/licensing uncertainty, materially incorrect public statement, exposed internal data, or unavailable support owner. Follow `PUBLICATION-INCIDENT.md` or `ROLLBACK.md` as appropriate.
