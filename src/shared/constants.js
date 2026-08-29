/**
 * Redirect Scan - Shared Constants
 */

export const BADGE_COLORS = {
  SUCCESS_2XX: '#10B981',      // Emerald green
  REDIRECT_3XX: '#F59E0B',     // Amber / Orange
  CLIENT_ERROR_4XX: '#EF4444', // Red
  SERVER_ERROR_5XX: '#991B1B', // Dark red
  CLIENT_REDIRECT: '#8B5CF6',  // Purple
  NETWORK_ERROR: '#6B7280'     // Gray
};

export const SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  PASSED: 'passed'
};

export const THRESHOLDS = {
  LONG_REDIRECT_CHAIN: 3
};

export const MESSAGE_TYPES = {
  GET_TAB_STATE: 'GET_TAB_STATE',
  RELOAD_AND_TRACE: 'RELOAD_AND_TRACE',
  REFRESH_DATA: 'REFRESH_DATA',
  META_REFRESH_DETECTED: 'META_REFRESH_DETECTED',
  CLEAR_TAB_STATE: 'CLEAR_TAB_STATE',
  TAB_STATE_UPDATED: 'TAB_STATE_UPDATED'
};

export const STORAGE_KEYS = {
  TAB_PREFIX: 'tab_redirect_state_'
};

export const SENSITIVE_RESPONSE_HEADERS = [
  'set-cookie',
  'set-cookie2'
];

export const SENSITIVE_REQUEST_HEADERS = [
  'authorization',
  'cookie',
  'proxy-authorization'
];

export const HEADER_GROUPS = {
  GENERAL: 'General',
  SEO: 'SEO / Crawling',
  CACHING: 'Caching',
  SECURITY: 'Security',
  SERVER: 'Server',
  ALL: 'All Headers'
};
