# Privacy operations checklist

Internal document. Complete before collecting public beta requests.

| Item | Status | Required decision/evidence |
|---|---|---|
| Privacy owner | Blocked | Name the accountable person or entity. |
| Data collected | Ready | Website form requires an email address; Netlify also processes hosting/form metadata. |
| Purpose | Ready | Beta availability, installation information, and feedback expectations. |
| Marketing use | Ready | Current notice says the form does not enroll visitors in a general marketing list. |
| Retention period | Blocked | Define and approve a duration. |
| Deletion procedure | Needs approval | Proposed procedure exists in `DATA-DELETION.md`; verify platform behavior and approve. |
| Data-request handling | Blocked | Assign contact, owner, and response process. |
| Netlify data handling | Needs verification | Review account region, subprocessors, logs, export, retention, and deletion controls. |
| Notification recipients | Blocked | Approve the minimum recipient list. |
| Access control | Blocked | Define Netlify roles, MFA requirement, and periodic access review. |
| Incident handling | Blocked | Define notification and containment process for form data. |
| Public privacy contact | Blocked | Configure `LANVEXA_PRIVACY_EMAIL` only after approval. |
| Publisher identity | Blocked | Configure `LANVEXA_PUBLISHER_NAME` only after approval. |

See `PRIVACY-DATA-FLOW.md` for the data inventory, ownership gaps, storage boundaries, and data-minimization rationale.

Do not replace unresolved items with generic legal language.
