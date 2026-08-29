import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const root = process.cwd();
const siteUrl = (process.env.LANVEXA_SITE_URL || '').replace(/\/$/, '');
const routes = ['/', '/faq.html', '/privacy.html', '/security.html', '/docs/', '/docs/understanding-results.html', '/docs/lldp-cdp-discovery.html', '/docs/not-tested.html', '/docs/no-neighbor.html'];

function canonicalPath(pathname) {
  if (pathname.endsWith('/index.html')) return pathname.slice(0, -10) || '/';
  return pathname || '/';
}

const siteMetadata = {
  name: 'lanvexa-site-metadata',
  transformIndexHtml: {
    order: 'post',
    handler(html, context) {
      if (!siteUrl) return html;
      const path = canonicalPath(context.path);
      const canonical = `${siteUrl}${path}`;
      return html
        .replace(/content="\/lanvexa-social\.png"/g, `content="${siteUrl}/lanvexa-social.png"`)
        .replace('</head>', `  <link rel="canonical" href="${canonical}">\n  <meta property="og:url" content="${canonical}">\n</head>`);
    },
  },
  generateBundle() {
    if (!siteUrl) return;
    const urls = routes.map((route) => `  <url><loc>${siteUrl}${route}</loc></url>`).join('\n');
    this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n` });
    this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n` });
  },
};

export default defineConfig({
  plugins: [siteMetadata],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        faq: resolve(root, 'faq.html'),
        privacy: resolve(root, 'privacy.html'),
        security: resolve(root, 'security.html'),
        notFound: resolve(root, '404.html'),
        docs: resolve(root, 'docs/index.html'),
        results: resolve(root, 'docs/understanding-results.html'),
        discovery: resolve(root, 'docs/lldp-cdp-discovery.html'),
        notTested: resolve(root, 'docs/not-tested.html'),
        noNeighbor: resolve(root, 'docs/no-neighbor.html'),
      },
    },
  },
});
