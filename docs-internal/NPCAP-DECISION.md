# Npcap packaging decision record

Status: **LEGAL AND PRODUCT DECISION REQUIRED**. No Npcap installer or binary belongs in this repository under the current status.

## Technical fact

- The current LANVEXA architecture uses Npcap/SharpPcap for passive LLDP/CDP packet capture.
- LANVEXA therefore currently requires a compatible packet-capture environment for neighbor discovery.
- Installation, privilege, service, driver, and endpoint-security behavior still require clean-machine runtime verification.

## License text / official publisher statement

- Npcap's publisher states that the free edition has limited installation rights and does not grant general redistribution rights.
- The publisher describes Npcap OEM as the path for commercial redistribution and silent installation.
- Exact applicability, contract terms, and permitted distribution must be confirmed from current official terms and reviewed by the responsible human/legal owner.

Sources for decision-time re-verification:

- https://npcap.com/
- https://npcap.com/oem/
- https://npcap.com/oem/redist
- https://npcap.com/oem/docs/
- https://nmap.org/book/man-legal.html

This record is not legal advice and does not interpret the license for LANVEXA.

## Engineering options

### A — Licensed OEM redistribution

Bundle Npcap only after a written OEM/redistribution agreement authorizes the exact LANVEXA packaging and installer flow.

### B — No redistribution

Do not distribute Npcap. Require a tester to obtain and install a compatible Npcap environment independently under terms applicable to that tester. Validate the user experience, compatibility detection, instructions, and support boundary.

### C — Replace the capture dependency

Investigate a future architecture that does not depend on Npcap. This requires technical feasibility, security, driver, maintenance, and legal evaluation.

### D — Other verified model

Consider another technically viable model only when documented by primary technical evidence and reviewed against the applicable license terms.

## Decision evidence required

Named legal/product owner; current terms retained with review date; chosen packaging flow; written redistribution authority if applicable; clean-machine tests; privilege and EDR results; installer/uninstaller behavior; public wording approved. Until then: **do not bundle, redistribute, silently install, or imply resolution**.
