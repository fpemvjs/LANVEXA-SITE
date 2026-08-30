# Beta-request data flow

`VISITOR → LANVEXA WEBSITE → NETLIFY FORM → AUTHORIZED NOTIFICATION RECIPIENT → BETA REVIEW`

| Step | Data | Purpose | Storage | Owner | Deletion requirement | Unresolved |
|---|---|---|---|---|---|---|
| Visitor | Email entered voluntarily | Request consideration | User device/browser until submission | Visitor | Browser-controlled | None |
| LANVEXA website | Email + honeypot field and ordinary HTTP request data | Validate and submit request | Static site has no first-party database; runtime behavior must be verified | WEB OWNER | No app storage expected; verify logs | Hosting/log behavior |
| Netlify form | Email, submission metadata, spam signals determined by platform | Record/protect request | Netlify systems | PRIVACY CONTACT | Platform deletion procedure required | Terms, exact metadata, retention, access |
| Notification recipient | Email and notification metadata | Alert owner | Approved mailbox | BETA OPERATIONS OWNER | Mailbox deletion procedure required | Address, mailbox retention/access |
| Beta review | Email, dates, state, minimal notes | Select/manage beta | Tracking system not selected | BETA OPERATIONS OWNER | Tracking deletion procedure required | System, retention, lawful basis/notice review |

## Data minimization decision

The public form requests only email because no additional field is needed to establish initial contact. Company, title, phone, team size, device details, and ticket data can be requested later only when relevant and after a human relationship exists.
