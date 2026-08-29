/**
 * Redirect Scan - Chain Builder
 * Manages construction of redirect chains, steps, and final responses.
 */

import { normalizeHeaders } from '../shared/headerUtils.js';

/**
 * Creates a fresh navigation state for a tab
 * @param {number} tabId
 * @param {string} initialUrl
 * @param {string} [navigationId]
 * @returns {import('../shared/typedefs.js').TabNavigationState}
 */
export function createInitialNavigationState(tabId, initialUrl, navigationId = null) {
  const now = Date.now();
  return {
    tabId,
    navigationId: navigationId || `nav_${tabId}_${now}_${Math.random().toString(36).slice(2, 8)}`,
    startedAt: now,
    updatedAt: now,
    initialUrl: initialUrl || '',
    currentUrl: initialUrl || '',
    steps: [],
    finalResponse: null,
    clientRedirects: [],
    errors: [],
    completed: false,
    isTraceReload: false
  };
}

/**
 * Appends a redirect step to the state
 * @param {import('../shared/typedefs.js').TabNavigationState} state
 * @param {Object} stepData
 * @returns {import('../shared/typedefs.js').TabNavigationState}
 */
export function appendRedirectStep(state, stepData) {
  if (!state) return state;

  const now = Date.now();
  const stepId = `step-${state.steps.length + 1}`;

  const redirectStep = {
    id: stepId,
    type: 'http-redirect',
    requestId: stepData.requestId || '',
    url: stepData.url,
    statusCode: Number(stepData.statusCode) || 302,
    statusLine: stepData.statusLine || `HTTP/1.1 ${stepData.statusCode || 302}`,
    redirectUrl: stepData.redirectUrl,
    responseHeaders: normalizeHeaders(stepData.responseHeaders),
    ip: stepData.ip || null,
    fromCache: Boolean(stepData.fromCache),
    timestamp: stepData.timestamp || now
  };

  // Avoid duplicate steps with exact same requestId and url
  const isDuplicate = state.steps.some(
    s => s.requestId === redirectStep.requestId && s.url === redirectStep.url && s.statusCode === redirectStep.statusCode
  );

  if (!isDuplicate) {
    state.steps.push(redirectStep);
  }

  state.currentUrl = stepData.redirectUrl;
  state.updatedAt = now;

  return state;
}

/**
 * Sets final HTTP response on navigation state
 * @param {import('../shared/typedefs.js').TabNavigationState} state
 * @param {Object} responseData
 * @returns {import('../shared/typedefs.js').TabNavigationState}
 */
export function setFinalResponse(state, responseData) {
  if (!state) return state;

  const now = Date.now();

  state.finalResponse = {
    type: 'http-response',
    requestId: responseData.requestId || '',
    url: responseData.url,
    statusCode: Number(responseData.statusCode) || 200,
    statusLine: responseData.statusLine || `HTTP/1.1 ${responseData.statusCode || 200}`,
    responseHeaders: normalizeHeaders(responseData.responseHeaders),
    ip: responseData.ip || null,
    fromCache: Boolean(responseData.fromCache),
    timestamp: responseData.timestamp || now
  };

  state.currentUrl = responseData.url;
  state.completed = true;
  state.updatedAt = now;

  return state;
}

/**
 * Appends a client-side redirect to the state
 * @param {import('../shared/typedefs.js').TabNavigationState} state
 * @param {Object} clientData
 * @returns {import('../shared/typedefs.js').TabNavigationState}
 */
export function appendClientRedirect(state, clientData) {
  if (!state) return state;

  const now = Date.now();

  const clientRedirect = {
    type: 'client-redirect',
    mechanism: clientData.mechanism || 'client-navigation',
    fromUrl: clientData.fromUrl,
    toUrl: clientData.toUrl,
    delay: clientData.delay !== undefined ? clientData.delay : null,
    timestamp: clientData.timestamp || now,
    evidence: clientData.evidence || 'webNavigation-client_redirect'
  };

  // Avoid duplicate client redirects
  const isDuplicate = state.clientRedirects.some(
    cr => cr.fromUrl === clientRedirect.fromUrl &&
          cr.toUrl === clientRedirect.toUrl &&
          Math.abs(cr.timestamp - clientRedirect.timestamp) < 3000
  );

  if (!isDuplicate) {
    state.clientRedirects.push(clientRedirect);
  }

  state.updatedAt = now;
  return state;
}

/**
 * Records a network error
 * @param {import('../shared/typedefs.js').TabNavigationState} state
 * @param {Object} errorData
 * @returns {import('../shared/typedefs.js').TabNavigationState}
 */
export function recordNetworkError(state, errorData) {
  if (!state) return state;

  const now = Date.now();

  state.errors.push({
    error: errorData.error || 'Network error occurred',
    url: errorData.url,
    timestamp: errorData.timestamp || now
  });

  state.completed = true;
  state.updatedAt = now;

  return state;
}
