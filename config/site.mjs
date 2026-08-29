const placeholderHosts = /(^|\.)(localhost|example\.(com|net|org)|test|invalid)$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value) {
  return String(value || '').trim();
}

function publicUrl(value, allowTestOrigin) {
  const raw = clean(value).replace(/\/$/, '');
  if (!raw) return '';
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error('LANVEXA_SITE_URL must be an absolute URL.');
  }
  if (parsed.protocol !== 'https:') throw new Error('LANVEXA_SITE_URL must use HTTPS.');
  if (!allowTestOrigin && placeholderHosts.test(parsed.hostname)) {
    throw new Error('LANVEXA_SITE_URL cannot use localhost or a placeholder domain.');
  }
  if (parsed.pathname !== '/' || parsed.search || parsed.hash) {
    throw new Error('LANVEXA_SITE_URL must contain only the production origin.');
  }
  return parsed.origin;
}

function optionalEmail(name, value) {
  const email = clean(value);
  if (email && !emailPattern.test(email)) throw new Error(`${name} must be a valid email address.`);
  return email;
}

export function getSiteConfig(env = process.env) {
  return {
    siteUrl: publicUrl(env.LANVEXA_SITE_URL, env.LANVEXA_METADATA_TEST === '1'),
    publisherName: clean(env.LANVEXA_PUBLISHER_NAME),
    contacts: {
      support: optionalEmail('LANVEXA_SUPPORT_EMAIL', env.LANVEXA_SUPPORT_EMAIL),
      security: optionalEmail('LANVEXA_SECURITY_EMAIL', env.LANVEXA_SECURITY_EMAIL),
      privacy: optionalEmail('LANVEXA_PRIVACY_EMAIL', env.LANVEXA_PRIVACY_EMAIL),
    },
  };
}
