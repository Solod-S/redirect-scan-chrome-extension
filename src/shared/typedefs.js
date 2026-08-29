/**
 * Redirect Scan - JSDoc Type Definitions
 */

/**
 * @typedef {Object} HeaderItem
 * @property {string} name
 * @property {string} value
 * @property {boolean} [isSynthetic]
 */

/**
 * @typedef {Object} RedirectStep
 * @property {string} id - e.g. "step-1"
 * @property {'http-redirect'} type
 * @property {string} [requestId]
 * @property {string} url
 * @property {number} statusCode
 * @property {string} statusLine
 * @property {string} redirectUrl
 * @property {HeaderItem[]} responseHeaders
 * @property {string|null} ip
 * @property {boolean} fromCache
 * @property {number} timestamp
 */

/**
 * @typedef {Object} FinalResponse
 * @property {'http-response'} type
 * @property {string} [requestId]
 * @property {string} url
 * @property {number} statusCode
 * @property {string} statusLine
 * @property {HeaderItem[]} responseHeaders
 * @property {string|null} ip
 * @property {boolean} fromCache
 * @property {number} timestamp
 */

/**
 * @typedef {Object} ClientRedirect
 * @property {'client-redirect'} type
 * @property {'meta-refresh'|'client-navigation'|'unknown'} mechanism
 * @property {string} fromUrl
 * @property {string} toUrl
 * @property {number|null} delay
 * @property {number} timestamp
 * @property {'meta-tag'|'webNavigation-client_redirect'} evidence
 */

/**
 * @typedef {Object} NetworkErrorInfo
 * @property {string} error - e.g. "net::ERR_TOO_MANY_REDIRECTS"
 * @property {string} url
 * @property {number} timestamp
 */

/**
 * @typedef {Object} TabNavigationState
 * @property {number} tabId
 * @property {string} navigationId
 * @property {number} startedAt
 * @property {number} updatedAt
 * @property {string} initialUrl
 * @property {string} currentUrl
 * @property {RedirectStep[]} steps
 * @property {FinalResponse|null} finalResponse
 * @property {ClientRedirect[]} clientRedirects
 * @property {NetworkErrorInfo[]} errors
 * @property {boolean} completed
 * @property {boolean} isTraceReload
 */

/**
 * @typedef {Object} SEOIssue
 * @property {string} id
 * @property {'error'|'warning'|'info'|'passed'} severity
 * @property {string} title
 * @property {string} description
 * @property {string} [stepId]
 */

export {};
