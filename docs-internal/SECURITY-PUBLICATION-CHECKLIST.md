# Security publication verification matrix

Internal document. Unknowns are gates, not assumed negatives. Roles remain unassigned until `OWNERSHIP.md` is completed.

| Claim/area | Current evidence | Status | Required test | Owner |
|---|---|---|---|---|
| Windows/.NET 8/WPF prototype | Product description | VERIFIED FOR PROTOTYPE | Confirm release build | PRODUCT OWNER |
| Npcap/SharpPcap architecture | Product description | VERIFIED FOR PROTOTYPE | Confirm locked release dependencies | RELEASE OWNER |
| LLDP/CDP observation | Prototype capability | VERIFIED FOR PROTOTYPE | Source + packet test | SECURITY CONTACT |
| Capture filter | None reviewed here | UNVERIFIED | Source inspection and runtime capture validation | SECURITY CONTACT |
| Packet lifecycle/retention | None | UNVERIFIED | Source, memory, file and registry inspection | SECURITY CONTACT |
| Telemetry | None | UNVERIFIED | Source/build review and network observation | SECURITY CONTACT |
| Application logging | None | UNVERIFIED | Runtime, crash and uninstall tests | SECURITY CONTACT |
| DNS/TCP targets | Described only as configured checks | UNVERIFIED | Configuration and packet observation | PRODUCT OWNER |
| Permissions/elevation | None | UNVERIFIED | clean-machine standard/admin matrix | RELEASE OWNER |
| Npcap runtime/install behavior | Architecture statement only | UNVERIFIED | clean-machine and service/driver tests | RELEASE OWNER |
| Npcap packaging/license | Official publisher materials reviewed; no LANVEXA decision | BLOCKED | Legal/product decision per `NPCAP-DECISION.md` | PRODUCT OWNER |
| Dependency versions/licenses | Website lockfile; app repository out of scope | PARTIAL | Release inventories for website and app | RELEASE OWNER |
| Authenticode | No release evidence | UNVERIFIED | Signed installer/binary validation | RELEASE OWNER |
| Release hashes | No release exists | UNVERIFIED | Generate and verify release SHA-256 | RELEASE OWNER |
| Update method | No reviewed design | UNVERIFIED | Architecture/threat/rollback review | SECURITY CONTACT |
| Defender/enterprise EDR | No test evidence | UNVERIFIED | Representative release-package tests | SECURITY CONTACT |
| Vulnerability reporting | No published contact | BLOCKED | Assign address and response owner | SECURITY CONTACT |

Nothing is classified NOT APPLICABLE yet. Any such change requires a rationale and reviewer.
