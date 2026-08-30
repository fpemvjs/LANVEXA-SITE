# Lightweight threat model

| Threat | Likelihood | Impact | Current mitigation | Missing mitigation |
|---|---|---|---|---|
| Tampered installer | Medium | High | Controlled-beta intent only | Authenticode, hashes, secure origin, verification instructions |
| Compromised download location | Medium | High | Distribution not yet active | Access controls, monitoring, rollback, signed artifacts |
| Modified website dependencies | Low–Medium | Medium | Lockfile, `npm ci`, audit | Dependabot-equivalent decision, release SBOM review |
| Malicious LLDP/CDP packet input | Medium | High | Insufficient evidence | Parser fuzzing, bounds tests, encoding validation |
| Hostile strings rendered in UI/report | Medium | Medium–High | Insufficient evidence | Escaping, length limits, control-character tests |
| Excess local privilege | Medium | High | Insufficient evidence | least-privilege design and clean-machine validation |
| Update tampering | Unknown | High | No reviewed update mechanism | signed update design or explicit manual updates |
| Fake LANVEXA download site | Medium | High | Brand/domain not finalized | canonical domain, signed binaries, published hashes |
| Leaked beta binary | Medium | Medium–High | Controlled distribution intended | release identity, revocation, terms decision, leak response |
| Compromised request mailbox | Medium | High | No owner/contact configured | MFA, least access, backup/recovery, incident process |

Likelihood is provisional because no production release or incident baseline exists. Mitigations marked absent must not be implied publicly.
