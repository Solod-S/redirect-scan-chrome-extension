/**
 * Redirect Scan - Header Utilities
 */

import { HEADER_GROUPS, SENSITIVE_RESPONSE_HEADERS } from './constants.js';

const GROUP_DEFINITIONS = {
  [HEADER_GROUPS.SEO]: [
    'location',
    'x-robots-tag',
    'link',
    'content-language',
    'canonical',
    'refresh'
  ],
  [HEADER_GROUPS.CACHING]: [
    'cache-control',
    'expires',
    'etag',
    'last-modified',
    'age',
    'vary',
    'cf-cache-status',
    'x-cache',
    'x-cache-lookup',
    'cf-ray',
    'pragma'
  ],
  [HEADER_GROUPS.SECURITY]: [
    'strict-transport-security',
    'content-security-policy',
    'content-security-policy-report-only',
    'x-content-type-options',
    'x-frame-options',
    'referrer-policy',
    'permissions-policy',
    'cross-origin-opener-policy',
    'cross-origin-resource-policy',
    'cross-origin-embedder-policy',
    'x-xss-protection'
  ],
  [HEADER_GROUPS.SERVER]: [
    'server',
    'via',
    'x-powered-by',
    'x-redirect-by',
    'x-served-by',
    'x-aspnet-version',
    'cf-ray',
    'alt-svc'
  ],
  [HEADER_GROUPS.GENERAL]: [
    'content-type',
    'content-length',
    'content-encoding',
    'date',
    'location',
    'connection',
    'keep-alive'
  ]
};

/**
 * Normalizes headers array to standard format
 * @param {Array<{name: string, value: string}>|Object} headers
 * @returns {Array<{name: string, value: string}>}
 */
export function normalizeHeaders(headers) {
  if (!headers) return [];
  if (Array.isArray(headers)) {
    return headers
      .filter(h => h && typeof h.name === 'string')
      .map(h => ({
        name: h.name.trim(),
        value: typeof h.value === 'string' ? h.value.trim() : String(h.value || '')
      }));
  }
  if (typeof headers === 'object') {
    return Object.entries(headers).map(([name, value]) => ({
      name: name.trim(),
      value: typeof value === 'string' ? value.trim() : String(value || '')
    }));
  }
  return [];
}

/**
 * Gets first header value matching name (case-insensitive)
 * @param {Array<{name: string, value: string}>} headers
 * @param {string} name
 * @returns {string|null}
 */
export function getHeader(headers, name) {
  if (!headers || !name) return null;
  const target = name.toLowerCase();
  const found = headers.find(h => h && h.name && h.name.toLowerCase() === target);
  return found ? found.value : null;
}

/**
 * Gets all header values matching name (case-insensitive)
 * @param {Array<{name: string, value: string}>} headers
 * @param {string} name
 * @returns {Array<{name: string, value: string}>}
 */
export function getAllHeaders(headers, name) {
  if (!headers || !name) return [];
  const target = name.toLowerCase();
  return headers.filter(h => h && h.name && h.name.toLowerCase() === target);
}

/**
 * Checks if header name is sensitive
 * @param {string} name
 * @returns {boolean}
 */
export function isSensitiveHeader(name) {
  if (!name) return false;
  return SENSITIVE_RESPONSE_HEADERS.includes(name.toLowerCase());
}

/**
 * Groups headers for display in popup
 * @param {Array<{name: string, value: string}>} headers
 * @param {Object} [options={}]
 * @param {boolean} [options.includeSensitive=false]
 * @param {string} [options.ip]
 * @param {boolean} [options.fromCache]
 * @returns {Object.<string, Array<{name: string, value: string, isSynthetic?: boolean}>>}
 */
export function groupHeaders(headers, options = {}) {
  const { includeSensitive = false, ip = null, fromCache = undefined } = options;
  const normalized = normalizeHeaders(headers);

  const filteredHeaders = includeSensitive
    ? normalized
    : normalized.filter(h => !isSensitiveHeader(h.name));

  const groups = {
    [HEADER_GROUPS.GENERAL]: [],
    [HEADER_GROUPS.SEO]: [],
    [HEADER_GROUPS.CACHING]: [],
    [HEADER_GROUPS.SECURITY]: [],
    [HEADER_GROUPS.SERVER]: [],
    [HEADER_GROUPS.ALL]: []
  };

  // Add synthetic server details if provided
  if (ip) {
    groups[HEADER_GROUPS.SERVER].push({
      name: 'Server IP',
      value: ip,
      isSynthetic: true
    });
  }
  if (fromCache !== undefined) {
    groups[HEADER_GROUPS.SERVER].push({
      name: 'From Cache',
      value: fromCache ? 'Yes' : 'No',
      isSynthetic: true
    });
  }

  // Populate groups
  for (const header of filteredHeaders) {
    const lowerName = header.name.toLowerCase();

    for (const [groupName, headerNames] of Object.entries(GROUP_DEFINITIONS)) {
      if (headerNames.includes(lowerName)) {
        groups[groupName].push(header);
      }
    }
  }

  // Populate All Headers sorted alphabetically
  groups[HEADER_GROUPS.ALL] = [...filteredHeaders].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  return groups;
}
