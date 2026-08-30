# Authentic product media standard

## Source rules

- Capture the actual running LANVEXA application. No reconstructed HTML, Figma, or generated interface.
- Use an example/test network only. Never expose UTD/internal identifiers or personal/workstation information.
- Preserve honest product states and current visual maturity; do not composite capabilities.

## Required evidence

1. Passed state.
2. Partial/failure state.
3. No-neighbor state when practical.

Preferred video length: 30–45 seconds showing disconnected → cable connected → link → address → configured checks → LLDP/CDP observation → advertised switch/port when available. Capture a separate partial/failure sequence if practical.

## Sanitization gate

Two explicit reviewers must check source and exported frames for internal hostname/domain, organization name, username, MAC address, public IP, ticket number, Wi-Fi SSID, desktop notifications, taskbar/personal data, file path, browser history, clock/calendar sensitivity, and hidden metadata. Use RFC1918/example network values and a locally administered MAC only when the media is intentionally staged on the test network.

## Delivery

Place approved files only at the reserved paths in `public/media/`. Record capture date, app release identifier, environment, sanitization reviewers, and source archive location. Run `verify:launch`, inspect the fallback, and run media/video accessibility checks before deployment.
