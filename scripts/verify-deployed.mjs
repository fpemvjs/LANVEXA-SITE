import { Buffer } from "node:buffer";

const args = process.argv.slice(2);
const target = args.find((arg) => !arg.startsWith("--"));
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const allowLocal = args.includes("--allow-http-local");
const expectedOriginArg = option("--canonical-origin");
const alternateOrigin = option("--alternate-origin");
const failures = [];

function fail(message) {
  failures.push(message);
  console.error(`FAIL  ${message}`);
}
function pass(message) {
  console.log(`PASS  ${message}`);
}
function assert(ok, message) {
  ok ? pass(message) : fail(message);
}
function normalizeOrigin(value, label) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be an absolute URL`);
  }
  const local = ["localhost", "127.0.0.1"].includes(url.hostname);
  if (
    url.protocol !== "https:" &&
    !(allowLocal && local && url.protocol === "http:")
  )
    throw new Error(`${label} must use HTTPS`);
  if (url.pathname !== "/" || url.search || url.hash)
    throw new Error(
      `${label} must be an origin without a path, query, or fragment`,
    );
  return url.origin;
}
if (!target) {
  console.error(
    "Usage: npm run verify:deployed -- https://preview-url [--canonical-origin https://canonical-origin] [--alternate-origin https://alternate-origin]",
  );
  process.exit(2);
}
let origin;
let canonicalOrigin;
try {
  origin = normalizeOrigin(target, "deployment URL");
  canonicalOrigin = normalizeOrigin(
    expectedOriginArg || target,
    "canonical origin",
  );
} catch (error) {
  console.error(`FAIL  ${error.message}`);
  process.exit(2);
}

const routes = [
  "/",
  "/faq.html",
  "/security.html",
  "/privacy.html",
  "/docs/",
  "/docs/understanding-results.html",
  "/docs/connectivity-checks.html",
  "/docs/lldp-cdp-discovery.html",
  "/docs/lldp-vs-cdp.html",
  "/docs/identify-switch-port-windows.html",
  "/docs/not-tested.html",
  "/docs/no-neighbor.html",
  "/beta-requested.html",
  "/404.html",
];
const indexable = routes.filter(
  (route) => !["/beta-requested.html", "/404.html"].includes(route),
);
const pages = new Map();
async function request(path, init) {
  try {
    return await fetch(`${origin}${path}`, { redirect: "manual", ...init });
  } catch (error) {
    fail(`${path}: request failed (${error.message})`);
    return null;
  }
}

console.log(
  `LANVEXA deployed verification\nTarget: ${origin}\nCanonical: ${canonicalOrigin}`,
);
for (const route of routes) {
  const response = await request(route);
  if (!response) continue;
  assert(response.status === 200, `${route} returns HTTP 200`);
  if (response.status === 200) pages.set(route, await response.text());
}
const missing = await request(`/route-that-does-not-exist-${Date.now()}`);
if (missing) {
  const body = await missing.text();
  assert(missing.status === 404, "unknown route returns HTTP 404");
  assert(
    /No neighbor found\./i.test(body),
    "unknown route returns branded 404 content",
  );
}

const homeResponse = await request("/");
if (homeResponse) {
  const headers = homeResponse.headers;
  const csp = headers.get("content-security-policy") || "";
  assert(
    /default-src 'self'/.test(csp) &&
      /script-src 'self'/.test(csp) &&
      /form-action 'self'/.test(csp),
    "CSP is present and self-restricted",
  );
  assert(
    headers.get("x-content-type-options") === "nosniff",
    "X-Content-Type-Options is nosniff",
  );
  assert(
    headers.get("referrer-policy") === "strict-origin-when-cross-origin",
    "Referrer-Policy is configured",
  );
  assert(
    /camera=\(\).*microphone=\(\).*geolocation=\(\)/.test(
      headers.get("permissions-policy") || "",
    ),
    "Permissions-Policy disables unused capabilities",
  );
  assert(headers.get("x-frame-options") === "DENY", "X-Frame-Options is DENY");
  assert(
    /max-age=0.*must-revalidate/.test(headers.get("cache-control") || ""),
    "HTML is revalidated",
  );
}

for (const [route, html] of pages) {
  assert(
    !/(?:href|src|content)="http:\/\//i.test(html),
    `${route} contains no mixed-content URL`,
  );
  assert(
    !/utdallas|\bUTD\b|swroc|\b[A-Z]:\\(?:Users|tmp|Windows)\\|\b[a-z0-9-]+\.(?:local|lan|internal|corp)\b/i.test(
      html,
    ),
    `${route} contains no known internal data`,
  );
  assert(
    !/(?:https?:\/\/|\b)(?:[a-z0-9-]+\.)*(?:example\.(?:com|org)|placeholder\.(?:com|net|org))\b/i.test(
      html.replaceAll("example.net", ""),
    ),
    `${route} contains no placeholder production domain`,
  );
  if (indexable.includes(route)) {
    const canonical = `${canonicalOrigin}${route}`;
    assert(
      html.includes(`rel="canonical" href="${canonical}"`),
      `${route} canonical is correct`,
    );
    assert(
      html.includes(`property="og:url" content="${canonical}"`),
      `${route} og:url is correct`,
    );
    assert(
      html.includes(`content="${canonicalOrigin}/lanvexa-social.png"`),
      `${route} social image URL is absolute`,
    );
  }
}
const home = pages.get("/") || "";
assert(
  /name="beta-access"/.test(home) &&
    /name="form-name" value="beta-access"/.test(home),
  "Netlify form name is correct",
);
assert(
  /data-netlify-honeypot="company-website"/.test(home) &&
    /name="company-website"/.test(home),
  "form honeypot is present",
);
assert(
  /action="\/beta-requested\.html"/.test(home),
  "form fallback action uses confirmation route",
);
assert(
  /name="email"[\s\S]*?type="email"[\s\S]*?autocomplete="email"[\s\S]*?required/.test(
    home,
  ),
  "email field has type, autocomplete, and required semantics",
);
assert(
  /noindex,nofollow/.test(pages.get("/beta-requested.html") || ""),
  "beta confirmation route is noindex",
);

for (const asset of ["/brand/lanvexa-x-small.svg", "/lanvexa-social.png"]) {
  const response = await request(asset);
  if (!response) continue;
  assert(response.status === 200, `${asset} is available`);
  if (asset.endsWith(".png") && response.status === 200) {
    const bytes = Buffer.from(await response.arrayBuffer());
    assert(
      bytes
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
      "social image is a valid PNG",
    );
    assert(
      bytes.readUInt32BE(16) === 1200 && bytes.readUInt32BE(20) === 630,
      "social image is 1200 × 630",
    );
  }
}
const assets = [...home.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(
  (match) => match[1],
);
if (assets.length) {
  const response = await request(assets[0]);
  if (response)
    assert(
      /max-age=31536000.*immutable/.test(
        response.headers.get("cache-control") || "",
      ),
      "hashed assets use immutable caching",
    );
}
const brandResponse = await request("/brand/lanvexa-wordmark.svg");
if (brandResponse)
  assert(
    /max-age=604800/.test(brandResponse.headers.get("cache-control") || ""),
    "brand assets use bounded caching",
  );

const robotsResponse = await request("/robots.txt");
const sitemapResponse = await request("/sitemap.xml");
if (robotsResponse && sitemapResponse) {
  const robots = await robotsResponse.text();
  const sitemap = await sitemapResponse.text();
  assert(
    robotsResponse.status === 200 &&
      robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`),
    "robots.txt references canonical sitemap",
  );
  assert(sitemapResponse.status === 200, "sitemap.xml is available");
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (match) => match[1],
  );
  assert(
    urls.length === indexable.length &&
      indexable.every((route) => urls.includes(`${canonicalOrigin}${route}`)),
    "sitemap contains only expected indexable routes",
  );
  for (const url of urls) {
    const route = new URL(url).pathname;
    const response = await request(route);
    if (response)
      assert(response.status === 200, `sitemap route resolves: ${route}`);
  }
}

if (alternateOrigin) {
  try {
    const alternate = normalizeOrigin(alternateOrigin, "alternate origin");
    const response = await fetch(`${alternate}/`, { redirect: "manual" });
    assert(
      [301, 302, 307, 308].includes(response.status),
      "alternate origin redirects",
    );
    if ([301, 302, 307, 308].includes(response.status))
      assert(
        new URL(response.headers.get("location"), alternate).origin ===
          canonicalOrigin,
        "alternate origin redirects to canonical origin",
      );
  } catch (error) {
    fail(`alternate-origin check failed (${error.message})`);
  }
}

if (failures.length) {
  console.error(
    `\nDeployed verification failed with ${failures.length} issue(s).`,
  );
  process.exit(1);
}
console.log(
  "\nDeployed verification passed. Perform the required human visual and live-form checks before promotion.",
);
