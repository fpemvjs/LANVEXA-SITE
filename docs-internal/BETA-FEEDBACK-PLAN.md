# Post-use beta feedback plan

Request feedback after a tester has installed LANVEXA and attempted a real
ticket. Do not add this as a long pre-access website questionnaire.

## Recommended sequence

1. Installation confirmation: installed, blocked, or abandoned—and why.
2. After first real ticket, send a short structured check-in.
3. Offer an optional 20-minute follow-up for ambiguous or high-value findings.
4. Associate feedback with a release identifier, without collecting packet data.

## Core questions

- Did LANVEXA install and run on the technician's managed Windows device?
- Was it used on a real Ethernet ticket?
- Was LLDP or CDP observed? If not, was the missing-neighbor state clear?
- Did the result change the next troubleshooting action?
- Were observations relayed or entered into an escalation?
- Would the technician use the workflow again?
- Which check, label, or state was confusing or incorrect?
- What failed: install, interface selection, connectivity test, discovery, or interpretation?

The primary outcome question is: **Did LANVEXA change what you did next?** Classify the answer as one or more of: identified advertised switch/port; confirmed basic connectivity; isolated a DNS or gateway problem; escalated with better evidence; still required another tool; result was misleading; could not run the product; no change.

## Evidence to retain

Prefer structured answers, release identifier, Windows version, adapter model,
and high-level environment type. Do not request credentials, packet captures,
internal hostnames, full ticket text, or screenshots containing sensitive
infrastructure unless a secure, approved process exists.

Aggregate only after preserving the denominator and release identifier. Separate “no advertisement existed” from a product capture failure; do not treat all no-neighbor results as discovery defects.
