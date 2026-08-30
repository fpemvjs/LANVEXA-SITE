import { existsSync } from 'node:fs';
import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { getSiteConfig } from './config/site.mjs';

const root = process.cwd();
const config = getSiteConfig();
const routes = ['/', '/faq.html', '/privacy.html', '/security.html', '/docs/', '/docs/understanding-results.html', '/docs/lldp-cdp-discovery.html', '/docs/not-tested.html', '/docs/no-neighbor.html'];

function canonicalPath(pathname) {
  if (pathname.endsWith('/index.html')) return pathname.slice(0, -10) || '/';
  return pathname || '/';
}

function contactMarkup(kind, label) {
  const email = config.contacts[kind];
  return email ? `<p class="public-contact"><strong>${label}</strong> <a href="mailto:${email}">${email}</a></p>` : '';
}

function identityMarkup() {
  return [
    config.publisherName ? `<p class="publisher-identity">Published by ${config.publisherName}</p>` : '',
    config.contacts.support ? `<p class="publisher-identity"><a href="mailto:${config.contacts.support}">Support contact</a></p>` : '',
  ].join('');
}

function authenticMedia() {
  const media = resolve(root, 'public', 'media');
  const poster = existsSync(resolve(media, 'lanvexa-demo-poster.png'));
  const webm = existsSync(resolve(media, 'lanvexa-demo.webm'));
  const mp4 = existsSync(resolve(media, 'lanvexa-demo.mp4'));
  const screenshot = existsSync(resolve(media, 'lanvexa-product-screenshot.png'));
  if (poster && (webm || mp4)) {
    const sources = [
      webm ? '<source src="/media/lanvexa-demo.webm" type="video/webm">' : '',
      mp4 ? '<source src="/media/lanvexa-demo.mp4" type="video/mp4">' : '',
    ].join('');
    return `<figure class="authentic-media"><video controls preload="none" playsinline poster="/media/lanvexa-demo-poster.png" aria-label="LANVEXA Ethernet diagnostic demonstration">${sources}<p>Your browser cannot play this demonstration. <a href="/media/lanvexa-product-screenshot.png">View the product screenshot</a>.</p></video><figcaption>Authentic LANVEXA product demonstration.</figcaption></figure>`;
  }
  if (screenshot) {
    return '<figure class="authentic-media"><img src="/media/lanvexa-product-screenshot.png" loading="lazy" decoding="async" alt="LANVEXA Windows application showing Ethernet diagnostic results"><figcaption>Authentic LANVEXA application screenshot.</figcaption></figure>';
  }
  return '';
}

const launchTransforms = {
  name: 'lanvexa-launch-transforms',
  transformIndexHtml: {
    order: 'post',
    handler(html, context) {
      const media = context.path === '/index.html' || context.path === '/' ? authenticMedia() : '';
      let transformed = html
        .replace('<!-- LANVEXA_SECURITY_CONTACT -->', contactMarkup('security', 'Security contact:'))
        .replace('<!-- LANVEXA_PRIVACY_CONTACT -->', contactMarkup('privacy', 'Privacy contact:'))
        .replace('<!-- LANVEXA_SUPPORT_CONTACT -->', contactMarkup('support', 'Support contact:'))
        .replace('<!-- LANVEXA_PUBLISHER -->', identityMarkup())
        .replace('<!-- LANVEXA_AUTHENTIC_MEDIA -->', media)
        .replace('data-interactive-fallback', media ? 'data-interactive-fallback hidden' : 'data-interactive-fallback');
      if (!/property="og:image"/.test(transformed)) {
        transformed = transformed.replace(
          '</head>',
          '  <meta property="og:image" content="/lanvexa-social.png">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:image" content="/lanvexa-social.png">\n</head>',
        );
      }
      if (!config.siteUrl) return transformed;
      const path = canonicalPath(context.path);
      const canonical = `${config.siteUrl}${path}`;
      transformed = transformed
        .replace(/content="\/lanvexa-social\.png"/g, `content="${config.siteUrl}/lanvexa-social.png"`)
        .replace('</head>', `  <link rel="canonical" href="${canonical}">\n  <meta property="og:url" content="${canonical}">\n</head>`);
      return transformed;
    },
  },
  generateBundle() {
    if (!config.siteUrl) return;
    const urls = routes.map((route) => `  <url><loc>${config.siteUrl}${route}</loc></url>`).join('\n');
    this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n` });
    this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\nSitemap: ${config.siteUrl}/sitemap.xml\n` });
  },
};

export default defineConfig({
  plugins: [launchTransforms],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        faq: resolve(root, 'faq.html'),
        privacy: resolve(root, 'privacy.html'),
        security: resolve(root, 'security.html'),
        notFound: resolve(root, '404.html'),
        betaRequested: resolve(root, 'beta-requested.html'),
        docs: resolve(root, 'docs/index.html'),
        results: resolve(root, 'docs/understanding-results.html'),
        discovery: resolve(root, 'docs/lldp-cdp-discovery.html'),
        notTested: resolve(root, 'docs/not-tested.html'),
        noNeighbor: resolve(root, 'docs/no-neighbor.html'),
      },
    },
  },
});
