# Security publication checklist

Internal document. Claims may move to the public Security page only after evidence is reviewed.

## Verified

| Item | Evidence currently available |
|---|---|
| Prototype platform | Windows, .NET 8, WPF |
| Capture components | Npcap and SharpPcap |
| Discovery protocols | Passive LLDP/CDP observation |
| Active checks represented | Gateway, DNS, configured TCP/443 |

## Unverified

| Item | Evidence required |
|---|---|
| Packet capture filter | Source review and captured-filter validation |
| Packet lifecycle | Source review including buffers and disposal |
| Telemetry | Source, build configuration, and network observation |
| Logging | Source, runtime, install, and crash-path review |
| Retention | File/registry/database inspection and policy decision |
| DNS target | Product configuration and packet observation |
| TCP target | Product configuration and packet observation |
| Permissions | Clean-machine install and runtime test |
| Elevation | Standard-user and administrator test matrix |
| Npcap behavior | Install options, runtime service, capture permissions |
| Dependency versions | Locked release dependency inventory |
| Code signing | Authenticode certificate and signed release |
| Release hashes | Reproducible checksum publication process |
| Update method | Design, transport, signing, rollback, and failure behavior |
| Microsoft Defender | Tested release package and documented result |
| Enterprise EDR | Representative controlled validation |
| Npcap licensing | Written packaging/redistribution decision |
| Vulnerability reporting | Approved public security contact and process |

## Not applicable

Nothing is classified as not applicable yet. Move an item here only with a short rationale and reviewer.
