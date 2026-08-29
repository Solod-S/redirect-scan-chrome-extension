/**
 * Redirect Scan - Status Codes & Metadata
 */

import { BADGE_COLORS, SEVERITY } from './constants.js';

export const STATUS_DESCRIPTIONS = {
  // 1xx Informational
  100: 'Continue',
  101: 'Switching Protocols',
  103: 'Early Hints',

  // 2xx Success
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',

  // 3xx Redirection
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',

  // 4xx Client Error
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  418: "I'm a teapot",
  421: 'Misdirected Request',
  422: 'Unprocessable Content',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Too Early',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',

  // 5xx Server Error
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  510: 'Not Extended',
  511: 'Network Authentication Required'
};

/**
 * Returns human-readable label for a status code
 * @param {number} code
 * @returns {string}
 */
export function getStatusLabel(code) {
  if (!code) return 'Unknown';
  return STATUS_DESCRIPTIONS[code] || `HTTP ${code}`;
}

/**
 * Returns category string: 1xx, 2xx, 3xx, 4xx, 5xx, or error
 * @param {number} code
 * @returns {string}
 */
export function getStatusCategory(code) {
  if (!code || typeof code !== 'number') return 'error';
  if (code >= 100 && code < 200) return '1xx';
  if (code >= 200 && code < 300) return '2xx';
  if (code >= 300 && code < 400) return '3xx';
  if (code >= 400 && code < 500) return '4xx';
  if (code >= 500 && code < 600) return '5xx';
  return 'error';
}

/**
 * Returns severity for status code
 * @param {number} code
 * @returns {string}
 */
export function getStatusSeverity(code) {
  const category = getStatusCategory(code);
  switch (category) {
    case '2xx':
      return SEVERITY.PASSED;
    case '3xx':
      return SEVERITY.INFO;
    case '4xx':
      return SEVERITY.ERROR;
    case '5xx':
      return SEVERITY.ERROR;
    default:
      return SEVERITY.WARNING;
  }
}

/**
 * Returns badge color for status code
 * @param {number} code
 * @returns {string}
 */
export function getStatusBadgeColor(code) {
  const category = getStatusCategory(code);
  switch (category) {
    case '2xx':
      return BADGE_COLORS.SUCCESS_2XX;
    case '3xx':
      return BADGE_COLORS.REDIRECT_3XX;
    case '4xx':
      return BADGE_COLORS.CLIENT_ERROR_4XX;
    case '5xx':
      return BADGE_COLORS.SERVER_ERROR_5XX;
    default:
      return BADGE_COLORS.NETWORK_ERROR;
  }
}
