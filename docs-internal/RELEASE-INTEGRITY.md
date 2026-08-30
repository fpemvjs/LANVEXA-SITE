# Release integrity plan

Implementation-ready sequence for a future desktop release:

1. Establish the verified publisher identity.
2. Obtain and protect an appropriate Authenticode signing certificate; define who can sign and recovery/revocation handling.
3. Produce the release from a locked source commit and record toolchain/dependency versions.
4. Sign installer and executable artifacts, then verify signatures on a clean machine.
5. Calculate SHA-256 after final signing; never reuse hashes across artifacts.
6. Publish filename, version, size, SHA-256, signer identity, and release date over the canonical HTTPS origin.
7. If a signed manifest is later justified, sign a machine-readable manifest that binds version, artifact name, hash, and origin. Do not add this complexity before the distribution workflow exists.
8. Test download, signature, hash, installation, removal, Defender/EDR, and rollback before distribution.
9. Retain a restricted release record and a revocation/stop-distribution procedure.

No certificate, binary, manifest, or hash exists yet. Git commit + hosting deployment identifier is sufficient for website versioning.
