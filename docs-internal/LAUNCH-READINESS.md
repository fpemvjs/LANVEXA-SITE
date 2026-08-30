# LANVEXA controlled-beta launch gate

Internal master checklist. Status changes require evidence and an owner. High-quality preparation does not mean the beta is ready to open.

## WEBSITE

| Item | Status | Evidence/action |
|---|---|---|
| Reproducible static build and local launch scan | READY | `npm ci`; `npm run verify:launch` |
| Required routes, confirmation route, branded 404 | READY | Automated output checks |
| Domain abstraction and metadata dual-build tests | READY | No fake origin when unset |
| Deployed-site verifier | READY | `npm run verify:deployed -- URL` |
| Real domain configured | BLOCKED | Approve origin and www/apex strategy |
| Preview verified | BLOCKED | Deploy preview and run verifier + visual review |
| Production verified | BLOCKED | Promote reviewed build and repeat verifier |
| Live form verified | BLOCKED | Assign owner/recipient; test storage, notification, JS and no-JS |

## PRODUCT

| Item | Status | Evidence/action |
|---|---|---|
| Capability/limitation wording | READY | Current website is bounded |
| Installation path | BLOCKED | Decide Npcap model; verify installer/uninstaller |
| Clean-machine behavior | NEEDS VERIFICATION | Standard/admin clean-machine matrix |
| Windows baseline | NEEDS VERIFICATION | Approve and test supported versions/architectures |
| Authentic media | BLOCKED | Capture/sanitize actual application per media standard |

## SECURITY

| Item | Status | Evidence/action |
|---|---|---|
| Verification matrix and threat model | READY | Internal documents complete |
| Actual capture behavior | NEEDS VERIFICATION | Source/filter/runtime inspection |
| Telemetry/logging/retention | NEEDS VERIFICATION | Source, runtime and filesystem/network observation |
| Privilege requirements | NEEDS VERIFICATION | Clean-machine tests |
| Binary integrity approach | NEEDS VERIFICATION | Approve signing/hash/distribution implementation |

## LEGAL

| Item | Status | Evidence/action |
|---|---|---|
| Publisher identity | BLOCKED | Human/business decision |
| Privacy handling | BLOCKED | Assign owner; approve retention/deletion/platform handling |
| Npcap model | BLOCKED | Legal/product review of current official terms |
| Beta terms decision | BLOCKED | Decide whether terms are needed and approve them if so |

## OPERATIONS

| Item | Status | Evidence/action |
|---|---|---|
| Runbooks, templates, rollback, incident flow | READY | Internal operational framework |
| Beta owner | BLOCKED | Assign PRODUCT/BETA OPERATIONS owners |
| Notification recipient | BLOCKED | Approve and configure recipient/backup |
| Support path | BLOCKED | Assign alias, owner and scope |
| Installer distribution process | BLOCKED | Assign RELEASE OWNER and approved origin/process |

## MEDIA

| Item | Status | Evidence/action |
|---|---|---|
| Integration fallback and reserved paths | READY | Website build behavior |
| Authentic passed/partial/no-neighbor evidence | BLOCKED | Actual app capture and two-person sanitization review |

## Explicit controlled-beta gate

Controlled beta may begin only when every BLOCKED/NEEDS VERIFICATION item named above under WEBSITE, OPERATIONS, PRODUCT, SECURITY, and LEGAL has evidence and an assigned owner. Optional enhancements do not block; none of the required items may be waived by changing its label.

## Score interpretation

- **Technical preparation score:** quality of the local website infrastructure, checks, documentation, and process design. It may exceed 9 while external decisions remain.
- **Actual launch readiness score:** ability to responsibly accept and distribute to testers today. It remains below 9 until the explicit gate is satisfied.
