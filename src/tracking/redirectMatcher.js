/**
 * Redirect Scan - Redirect Matcher
 * Utilities for matching requests and checking chain continuation vs new navigation.
 */

/**
 * Checks if two URLs match closely (ignoring trailing slashes and hash for redirect target matching)
 * @param {string} url1
 * @param {string} url2
 * @returns {boolean}
 */
export function urlsMatchFuzzy(url1, url2) {
  if (!url1 || !url2) return false;
  if (url1 === url2) return true;

  try {
    const u1 = new URL(url1);
    const u2 = new URL(url2);

    const norm1 = `${u1.origin}${u1.pathname.replace(/\/+$/, '')}${u1.search}`;
    const norm2 = `${u2.origin}${u2.pathname.replace(/\/+$/, '')}${u2.search}`;

    return norm1.toLowerCase() === norm2.toLowerCase();
  } catch {
    return url1.replace(/\/+$/, '').toLowerCase() === url2.replace(/\/+$/, '').toLowerCase();
  }
}

/**
 * Checks if an incoming request URL is the expected next redirect hop in an active state
 * @param {import('../shared/typedefs.js').TabNavigationState} state
 * @param {string} nextUrl
 * @returns {boolean}
 */
export function isRedirectContinuation(state, nextUrl) {
  if (!state || !state.steps || state.steps.length === 0) return false;

  const lastStep = state.steps[state.steps.length - 1];
  if (!lastStep || !lastStep.redirectUrl) return false;

  return urlsMatchFuzzy(lastStep.redirectUrl, nextUrl);
}
