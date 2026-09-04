import { existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { resolve, relative, extname } from "node:path";
import { spawnSync } from "node:child_process";
import { getSiteConfig } from "../config/site.mjs";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const scratch = resolve(root, ".launch-check");
const vite = resolve(root, "node_modules", "vite", "bin", "vite.js");
const liveConfig = getSiteConfig();
const expectedPages = [
  "index.html",
  "faq.html",
  "security.html",
  "privacy.html",
  "demo.html",
  "404.html",
  "docs/index.html",
  "docs/understanding-results.html",
  "docs/connectivity-checks.html",
  "docs/lldp-cdp-discovery.html",
  "docs/lldp-vs-cdp.html",
  "docs/identify-switch-port-windows.html",
  "docs/not-tested.html",
  "docs/no-neighbor.html",
  "beta-requested.html",
];
const requiredAssets = [
  "brand/lanvexa-wordmark.svg",
  "brand/lanvexa-wordmark-reverse.svg",
  "brand/lanvexa-x.svg",
  "brand/lanvexa-x-small.svg",
  "lanvexa-social.png",
];
const requiredInternalDocs = [
  "BETA-OPERATIONS.md",
  "NPCAP-DECISION.md",
  "ROLLBACK.md",
  "PUBLICATION-INCIDENT.md",
  "OWNERSHIP.md",
  "RELEASE-PROCESS.md",
  "WEB-RELEASE-LOG.md",
  "SECURITY-PUBLICATION-CHECKLIST.md",
  "THREAT-MODEL.md",
  "RELEASE-INTEGRITY.md",
  "DEPENDENCY-INVENTORY.md",
  "DOMAIN-PREFLIGHT.md",
  "PRIVACY-DATA-FLOW.md",
  "DATA-DELETION.md",
  "PRODUCT-MEDIA-STANDARD.md",
  "SUPPORT-MODEL.md",
  "BETA-SUCCESS-CRITERIA.md",
  "LAUNCH-READINESS.md",
  "templates/BETA-ACCEPTANCE.md",
  "templates/BETA-WAITLIST.md",
  "templates/INSTALLATION-INSTRUCTIONS.md",
  "templates/FEEDBACK-REQUEST.md",
];
const internalPatterns = [
  ["UT Dallas identifier", /utdallas|\bUTD\b|swroc/i],
  ["Windows filesystem path", /\b[A-Z]:\\(?:Users|tmp|Windows)\\/i],
  ["localhost reference", /(?:localhost|127\.0\.0\.1|0\.0\.0\.0)/i],
  ["private/internal hostname", /\b[a-z0-9-]+\.(?:local|lan|internal|corp)\b/i],
  ["legacy internal switch pattern", /\bswroc[a-z0-9.-]*\b/i],
];
const claimPatterns = [
  ["unbounded health claim", /\b(?:network|overall) healthy\b/i],
  ["cable tester replacement", /\breplaces? (?:a |the )?cable tester\b/i],
  ["LinkRunner replacement", /\breplaces? (?:a |the )?LinkRunner\b/i],
  ["guaranteed discovery", /\bguaranteed switch discovery\b/i],
  ["physical-port overclaim", /\bphysical switch port\b/i],
  ["unverified telemetry claim", /\bzero telemetry\b/i],
  ["unverified privacy claim", /\bcompletely private\b/i],
  ["unverified privilege claim", /\bno admin(?:istrator)? rights required\b/i],
  ["unverified readiness claim", /\benterprise ready\b/i],
  ["unverified security slogan", /\bsecure by design\b/i],
  ["automatic root-cause claim", /\bautomatic root[- ]cause (?:analysis|diagnosis)\b/i],
  ["unverified signing claim", /\b(?:digitally |code )?signed (?:installer|software|release)\b/i],
  ["unverified OS claim", /\bsupports Windows (?:10|11)\b/i],
];

const failures = [];
function pass(message) {
  console.log(`PASS  ${message}`);
}
function fail(message) {
  failures.push(message);
  console.error(`FAIL  ${message}`);
}
function requireFile(base, file) {
  existsSync(resolve(base, file))
    ? pass(`required file: ${file}`)
    : fail(`missing required file: ${file}`);
}
function textFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...textFiles(path));
    else if (
      [".html", ".js", ".css", ".svg", ".xml", ".txt", ".md", ".json"].includes(
        extname(entry.name),
      )
    )
      files.push(path);
  }
  return files;
}
function scan(directory, patterns, label) {
  let findings = 0;
  for (const file of textFiles(directory)) {
    const relativeFile = relative(directory, file).replaceAll("\\", "/");
    // The interactive demo intentionally uses a bounded fixture identifier
    // to make switch/port discovery concrete; it is not private infrastructure.
    if (label === "internal-data scan" && /^assets\/demo-/i.test(relativeFile)) continue;
    const raw = readFileSync(file, "utf8");
    const content =
      label === "claim scan"
        ? raw.replace(
            /Does LANVEXA replace a cable tester\?<\/summary>\s*<div>\s*<p>\s*No\./gi,
            "",
          )
        : raw;
    for (const [name, pattern] of patterns) {
      if (pattern.test(content)) {
        findings += 1;
        fail(`${label}: ${name} in ${relative(directory, file)}`);
      }
    }
  }
  if (!findings) pass(`${label} found no prohibited text`);
}
function build(outDir, env = {}) {
  const result = spawnSync(
    process.execPath,
    [vite, "build", "--outDir", outDir, "--emptyOutDir"],
    {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, ...env },
    },
  );
  if (result.status !== 0)
    fail(`metadata test build failed:\n${result.stderr || result.stdout}`);
  return result.status === 0;
}
function checkNoDomainBuild(directory) {
  const html = readFileSync(resolve(directory, "index.html"), "utf8");
  if (/rel="canonical"|property="og:url"/.test(html))
    fail("empty-domain build emitted canonical or og:url");
  else pass("empty-domain build omits canonical and og:url");
  if (existsSync(resolve(directory, "sitemap.xml")))
    fail("empty-domain build emitted sitemap.xml");
  else pass("empty-domain build omits sitemap.xml");
  const robots = readFileSync(resolve(directory, "robots.txt"), "utf8");
  if (/Sitemap:/i.test(robots))
    fail("empty-domain robots.txt advertises a sitemap");
  else pass("empty-domain robots.txt contains no fake sitemap");
}
function checkDomainBuild(directory, origin) {
  const indexablePages = expectedPages.filter(
    (page) => !["404.html", "beta-requested.html"].includes(page),
  );
  for (const page of indexablePages) requireFile(directory, page);
  for (const page of indexablePages) {
    const html = readFileSync(resolve(directory, page), "utf8");
    const route =
      page === "index.html"
        ? "/"
        : page.endsWith("/index.html")
          ? `/${page.slice(0, -10)}`
          : `/${page}`;
    const url = `${origin}${route}`;
    if (!html.includes(`rel="canonical" href="${url}"`))
      fail(`incorrect canonical: ${page}`);
    if (!html.includes(`property="og:url" content="${url}"`))
      fail(`incorrect og:url: ${page}`);
    if (!html.includes(`content="${origin}/lanvexa-social.png"`))
      fail(`social image is not absolute: ${page}`);
  }
  const sitemap = readFileSync(resolve(directory, "sitemap.xml"), "utf8");
  const listed = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (match) => match[1],
  );
  if (listed.length !== indexablePages.length)
    fail("sitemap route count does not match public routes");
  else
    pass(
      "sitemap contains every public route and excludes 404/internal documents",
    );
  for (const url of listed) {
    const route = new URL(url).pathname;
    const output = route.endsWith("/")
      ? `${route.slice(1)}index.html`
      : route.slice(1);
    if (!existsSync(resolve(directory, output)))
      fail(`sitemap route has no emitted file: ${route}`);
  }
  const robots = readFileSync(resolve(directory, "robots.txt"), "utf8");
  robots.includes(`Sitemap: ${origin}/sitemap.xml`)
    ? pass("robots.txt references the generated sitemap")
    : fail("robots.txt sitemap reference is incorrect");
  const builtJs = textFiles(resolve(directory, "assets"))
    .filter((file) => extname(file) === ".js")
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
  builtJs.includes("fetch(")
    ? pass("form-enabled build retains the Netlify submission path")
    : fail("form-enabled build removed the Netlify submission path");
  const security = readFileSync(resolve(directory, "security.html"), "utf8");
  const privacy = readFileSync(resolve(directory, "privacy.html"), "utf8");
  const home = readFileSync(resolve(directory, "index.html"), "utf8");
  const confirmation = readFileSync(
    resolve(directory, "beta-requested.html"),
    "utf8",
  );
  security.includes("mailto:security@lanvexa.invalid")
    ? pass("configured security contact is injected")
    : fail("configured security contact is missing");
  privacy.includes("mailto:privacy@lanvexa.invalid")
    ? pass("configured privacy contact is injected")
    : fail("configured privacy contact is missing");
  home.includes("mailto:support@lanvexa.invalid") &&
  home.includes("Published by Launch Check Publisher")
    ? pass("configured support contact and publisher are injected")
    : fail("configured support contact or publisher is missing");
  /name="robots" content="noindex,nofollow"/.test(confirmation)
    ? pass("beta confirmation route is noindex")
    : fail("beta confirmation route is indexable");
  !listed.some((url) => url.endsWith("/beta-requested.html"))
    ? pass("beta confirmation route is excluded from sitemap")
    : fail("beta confirmation route appears in sitemap");
}

console.log("LANVEXA launch verification");
requiredInternalDocs.forEach((file) =>
  requireFile(resolve(root, "docs-internal"), file),
);
if (!existsSync(dist)) fail("dist does not exist; run npm run build first");
else {
  expectedPages.forEach((file) => requireFile(dist, file));
  requiredAssets.forEach((file) => requireFile(dist, file));
  const social = readFileSync(resolve(dist, "lanvexa-social.png"));
  const pngWidth = social.readUInt32BE(16);
  const pngHeight = social.readUInt32BE(20);
  pngWidth === 1200 && pngHeight === 630
    ? pass("social PNG is 1200 × 630")
    : fail(`social PNG is ${pngWidth} × ${pngHeight}`);
  scan(dist, internalPatterns, "internal-data scan");
  scan(dist, claimPatterns, "claim scan");
  const emailMatches = textFiles(dist).flatMap((file) => {
    const content = readFileSync(file, "utf8");
    return [...content.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)].map(
      (match) => `${relative(dist, file)}: ${match[0]}`,
    );
  });
  const approvedEmails = new Set(
    Object.values(liveConfig.contacts)
      .filter(Boolean)
      .map((email) => email.toLowerCase()),
  );
  const unapprovedEmails = emailMatches.filter(
    (entry) => !approvedEmails.has(entry.split(": ").at(-1).toLowerCase()),
  );
  if (unapprovedEmails.length)
    fail(`unapproved public email address(es): ${unapprovedEmails.join(", ")}`);
  else pass("production output contains no unapproved email addresses");
  const home = readFileSync(resolve(dist, "index.html"), "utf8");
  /name="beta-access"[\s\S]*?action="\/beta-requested\.html"[\s\S]*?data-netlify-honeypot="company-website"/.test(
    home,
  )
    ? pass("beta form has confirmation route and honeypot")
    : fail("beta form fallback action or honeypot is missing");
  const emittedInternal = textFiles(dist).filter((file) =>
    relative(dist, file).startsWith("docs-internal"),
  );
  emittedInternal.length
    ? fail("internal documentation was emitted into dist")
    : pass("internal documentation is absent from dist");
  const forbiddenFiles = readdirSync(dist, { recursive: true }).filter(
    (entry) =>
      /npcap.*\.(?:exe|msi|dll)|(?:installer|setup).*\.(?:exe|msi)/i.test(
        String(entry),
      ),
  );
  forbiddenFiles.length
    ? fail(
        `unauthorized installer/binary in dist: ${forbiddenFiles.join(", ")}`,
      )
    : pass("no Npcap installer or unauthorized installer binary is present");
  const scripts = textFiles(dist)
    .filter((file) => extname(file) === ".js")
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
  /google-analytics|googletagmanager|plausible\.io|posthog|segment\.com|clarity\.ms/i.test(
    scripts,
  )
    ? fail("analytics/tracking signature found in production JavaScript")
    : pass("no analytics provider signature is present");
}

const netlify = readFileSync(resolve(root, "netlify.toml"), "utf8");
const headerChecks = [
  [
    "CSP keeps scripts and styles self-hosted",
    /Content-Security-Policy = "[^"]*style-src 'self'; script-src 'self';[^"]*form-action 'self'/,
  ],
  ["CSP permits only local media", /media-src 'self'/],
  ["content-type protection", /X-Content-Type-Options = "nosniff"/],
  ["referrer policy", /Referrer-Policy = "strict-origin-when-cross-origin"/],
  [
    "permissions policy",
    /Permissions-Policy = "camera=\(\), microphone=\(\), geolocation=\(\), payment=\(\), usb=\(\)"/,
  ],
  ["frame protection", /X-Frame-Options = "DENY"/],
  [
    "HTML/default revalidation",
    /Cache-Control = "public, max-age=0, must-revalidate"/,
  ],
  [
    "immutable hashed assets",
    /for = "\/assets\/\*"[\s\S]*?max-age=31536000, immutable/,
  ],
  ["short-lived media cache", /for = "\/media\/\*"[\s\S]*?max-age=86400/],
];
for (const [name, pattern] of headerChecks)
  pattern.test(netlify) ? pass(name) : fail(`Netlify configuration: ${name}`);

for (const invalidOrigin of [
  "http://lanvexa.example",
  "https://localhost",
  "https://example.net",
]) {
  try {
    getSiteConfig({ LANVEXA_SITE_URL: invalidOrigin });
    fail(`invalid production origin accepted: ${invalidOrigin}`);
  } catch {
    pass(`invalid production origin rejected: ${invalidOrigin}`);
  }
}

rmSync(scratch, { recursive: true, force: true });
const noDomain = resolve(scratch, "no-domain");
const withDomain = resolve(scratch, "with-domain");
if (build(noDomain, { LANVEXA_SITE_URL: "", LANVEXA_METADATA_TEST: "1" }))
  checkNoDomainBuild(noDomain);
const testOrigin = "https://launch-check.lanvexa.invalid";
if (
  build(withDomain, {
    LANVEXA_SITE_URL: testOrigin,
    LANVEXA_METADATA_TEST: "1",
    VITE_LANVEXA_ENABLE_BETA_FORM: "true",
    LANVEXA_PUBLISHER_NAME: "Launch Check Publisher",
    LANVEXA_SUPPORT_EMAIL: "support@lanvexa.invalid",
    LANVEXA_SECURITY_EMAIL: "security@lanvexa.invalid",
    LANVEXA_PRIVACY_EMAIL: "privacy@lanvexa.invalid",
  })
)
  checkDomainBuild(withDomain, testOrigin);
rmSync(scratch, { recursive: true, force: true });

if (failures.length) {
  console.error(
    `\nLaunch verification failed with ${failures.length} issue(s).`,
  );
  process.exit(1);
}
console.log("\nLaunch verification passed.");
