# Controlled beta operations

Internal document. Do not publish with the website.

## Request flow

1. Visitor submits the email-only `beta-access` form.
2. Netlify records the submission and applies configured spam controls.
3. An authorized owner receives a Netlify form notification.
4. The owner reviews the request against the approved eligibility criteria.
5. An accepted tester receives controlled-beta instructions before any software.
6. The tester installs only through the approved distribution method.
7. Feedback is requested after real use.

No automatic software distribution is part of the website workflow.

## Netlify setup

After the site exists in Netlify:

1. Open **Forms** and confirm that `beta-access` is detected.
2. Open **Project configuration → Notifications → Form submission notifications**.
3. Add the approved recipient only after ownership is decided.
4. Restrict Netlify project access to authorized operators.
5. Submit a non-production test address and confirm form storage plus notification delivery.
6. Delete the test submission according to the approved deletion procedure.
7. Set `VITE_LANVEXA_ENABLE_BETA_FORM=true` for the reviewed deployment only after the test succeeds.

Do not commit a recipient address or Netlify credential to this repository.

## Unresolved decisions

| Decision | Status |
|---|---|
| Notification recipient | Unassigned |
| Request owner and backup | Unassigned |
| Tester eligibility criteria | Undefined |
| Response SLA | Undefined |
| Installer distribution method | Undefined |
| Beta terms and acceptance record | Undefined |
| Support contact | Unassigned |
| Feedback mechanism | Undefined |
| Removal/revocation process | Undefined |

## Operational controls before enabling the form

- Assign one accountable owner and one backup.
- Approve the privacy notice and retention period.
- Decide how rejected or unanswered requests are handled.
- Document the exact installer, hash, signing identity, and version sent.
- Keep a distribution record without collecting unnecessary personal data.
- Define a stop-distribution procedure for a security or packaging issue.
