/**
 * Redirect Scan - Parse Meta Refresh
 * Robust parser for <meta http-equiv="refresh" content="...">
 */

/**
 * Parses the content attribute of a meta refresh tag
 * Examples:
 *   "0; url=https://example.com"
 *   "5;URL='https://example.com'"
 *   "0;URL=/path/page.html"
 *   "10" (page reload with delay)
 *
 * @param {string} content
 * @param {string} [baseUrl='']
 * @returns {{ delay: number, targetUrl: string } | null}
 */
export function parseMetaRefreshContent(content, baseUrl = '') {
  if (!content || typeof content !== 'string') return null;

  const trimmed = content.trim();
  if (!trimmed) return null;

  // Split by semicolon
  const parts = trimmed.split(';');
  const delayStr = parts[0].trim();
  const delay = parseInt(delayStr, 10);

  if (isNaN(delay) || delay < 0) {
    return null;
  }

  let rawUrl = '';

  if (parts.length > 1) {
    const urlPart = parts.slice(1).join(';').trim();
    // Match url=... or URL=...
    const match = urlPart.match(/url\s*=\s*(.*)/i);
    if (match && match[1]) {
      rawUrl = match[1].trim();
      // Strip surrounding single or double quotes
      if (
        (rawUrl.startsWith('"') && rawUrl.endsWith('"')) ||
        (rawUrl.startsWith("'") && rawUrl.endsWith("'"))
      ) {
        rawUrl = rawUrl.slice(1, -1).trim();
      }
    }
  }

  // If no URL specified, it's a self-reload
  let targetUrl = rawUrl || baseUrl;

  // Resolve relative URLs if base URL is available
  if (rawUrl && baseUrl) {
    try {
      targetUrl = new URL(rawUrl, baseUrl).href;
    } catch {
      targetUrl = rawUrl;
    }
  }

  return {
    delay,
    targetUrl
  };
}

/**
 * Checks if a meta element is a refresh tag and extracts details
 * @param {HTMLMetaElement|Element} element
 * @param {string} [baseUrl='']
 * @returns {{ delay: number, targetUrl: string } | null}
 */
export function extractMetaRefresh(element, baseUrl = '') {
  if (!element || !element.getAttribute) return null;

  const httpEquiv = element.getAttribute('http-equiv');
  if (!httpEquiv || httpEquiv.toLowerCase() !== 'refresh') {
    return null;
  }

  const content = element.getAttribute('content');
  return parseMetaRefreshContent(content, baseUrl);
}
