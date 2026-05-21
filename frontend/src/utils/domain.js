/**
 * Helper to determine if the current hostname belongs to the central SaaS platform.
 * 
 * Central domains include:
 * - localhost / 127.0.0.1
 * - growstro.test (local custom domain)
 * - restaurant-one-murex.vercel.app (production central domain)
 * - Any vercel preview domain (e.g. restaurant-one-murex-xxx.vercel.app)
 * 
 * @param {string} hostname 
 * @returns {boolean}
 */
export const isCentralDomain = (hostname) => {
  if (!hostname) return true;
  const host = hostname.toLowerCase();

  // Localhost / development IP
  if (host === 'localhost' || host === '127.0.0.1') {
    return true;
  }

  // Local custom test domain
  if (host === 'growstro.test') {
    return true;
  }

  // Production central domain
  if (host === 'restaurant-one-murex.vercel.app') {
    return true;
  }

  // Vercel preview domains (e.g., restaurant-one-murex-git-main-xxx.vercel.app)
  // These usually have exactly 3 segments ending in vercel.app.
  if (host.endsWith('.vercel.app') && !host.includes('.restaurant-one-murex.vercel.app')) {
    const parts = host.split('.');
    if (parts.length === 3) {
      return true;
    }
  }

  return false;
};
