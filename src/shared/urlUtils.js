/**
 * Redirect Scan - URL Utilities & Comparison
 */

/**
 * Extracts clean domain or hostname from URL
 * @param {string} urlString
 * @returns {string}
 */
export function getDomain(urlString) {
  try {
    const parsed = new URL(urlString);
    return parsed.hostname;
  } catch {
    return urlString || '';
  }
}

/**
 * Formats URL for display with optional truncation
 * @param {string} urlString
 * @param {number} [maxLength=100]
 * @returns {string}
 */
export function formatUrlDisplay(urlString, maxLength = 100) {
  if (!urlString) return '';
  if (urlString.length <= maxLength) return urlString;
  try {
    const parsed = new URL(urlString);
    const origin = parsed.origin;
    const rest = parsed.pathname + parsed.search + parsed.hash;
    const available = maxLength - origin.length - 3;
    if (available > 10) {
      return `${origin}${rest.slice(0, available)}...`;
    }
    return `${urlString.slice(0, maxLength - 3)}...`;
  } catch {
    return `${urlString.slice(0, maxLength - 3)}...`;
  }
}

/**
 * Compares two URLs in a redirect step
 * @param {string} fromUrl
 * @param {string} toUrl
 * @returns {Object}
 */
export function compareRedirectUrls(fromUrl, toUrl) {
  const result = {
    isValid: false,
    protocolChanged: false,
    isHttpToHttps: false,
    isHttpsToHttp: false,
    hostChanged: false,
    isCrossDomain: false,
    wwwChanged: false,
    pathChanged: false,
    trailingSlashChanged: false,
    queryChanged: false,
    queryDropped: false,
    queryParamsRemoved: [],
    queryParamsAdded: [],
    hashChanged: false
  };

  if (!fromUrl || !toUrl) return result;

  try {
    const from = new URL(fromUrl);
    const to = new URL(toUrl);

    result.isValid = true;

    // Protocol check
    if (from.protocol !== to.protocol) {
      result.protocolChanged = true;
      if (from.protocol === 'http:' && to.protocol === 'https:') {
        result.isHttpToHttps = true;
      } else if (from.protocol === 'https:' && to.protocol === 'http:') {
        result.isHttpsToHttp = true;
      }
    }

    // Host check
    if (from.hostname.toLowerCase() !== to.hostname.toLowerCase()) {
      result.hostChanged = true;

      // Extract base domains (e.g., example.com vs other.com)
      const fromParts = from.hostname.toLowerCase().split('.');
      const toParts = to.hostname.toLowerCase().split('.');
      const fromBase = fromParts.slice(-2).join('.');
      const toBase = toParts.slice(-2).join('.');

      result.isCrossDomain = fromBase !== toBase;

      // Check www changes
      const fromHasWww = from.hostname.toLowerCase().startsWith('www.');
      const toHasWww = to.hostname.toLowerCase().startsWith('www.');
      if (fromHasWww !== toHasWww) {
        result.wwwChanged = true;
      }
    }

    // Path check
    if (from.pathname !== to.pathname) {
      result.pathChanged = true;

      const fromHasSlash = from.pathname.endsWith('/');
      const toHasSlash = to.pathname.endsWith('/');
      const fromPathNoSlash = from.pathname.replace(/\/+$/, '');
      const toPathNoSlash = to.pathname.replace(/\/+$/, '');

      if (fromPathNoSlash === toPathNoSlash && fromHasSlash !== toHasSlash) {
        result.trailingSlashChanged = true;
      }
    }

    // Query parameters check
    if (from.search !== to.search) {
      result.queryChanged = true;
      if (from.search && !to.search) {
        result.queryDropped = true;
      }

      const fromParams = new URLSearchParams(from.search);
      const toParams = new URLSearchParams(to.search);

      for (const [key] of fromParams) {
        if (!toParams.has(key)) {
          if (!result.queryParamsRemoved.includes(key)) {
            result.queryParamsRemoved.push(key);
          }
        }
      }

      for (const [key] of toParams) {
        if (!fromParams.has(key)) {
          if (!result.queryParamsAdded.includes(key)) {
            result.queryParamsAdded.push(key);
          }
        }
      }
    }

    // Hash check
    if (from.hash !== to.hash) {
      result.hashChanged = true;
    }

    return result;
  } catch {
    return result;
  }
}
