/**
 * Redirect Scan - Register WebRequest Listeners
 */

import { navigationTracker } from '../tracking/navigationTracker.js';

export function registerWebRequestListeners() {
  if (typeof chrome === 'undefined' || !chrome.webRequest) {
    console.warn('[Redirect Scan] chrome.webRequest is not available');
    return;
  }

  const filter = {
    urls: ['http://*/*', 'https://*/*'],
    types: ['main_frame']
  };

  // 1. onBeforeRequest
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      navigationTracker.handleBeforeRequest(details).catch(err => {
        console.error('[Redirect Scan] Error in onBeforeRequest:', err);
      });
    },
    filter
  );

  // Helper for extraHeaders capability
  const extraInfoSpec = ['responseHeaders'];
  try {
    if (chrome.webRequest.OnBeforeRedirectOptions && 'EXTRA_HEADERS' in chrome.webRequest.OnBeforeRedirectOptions) {
      extraInfoSpec.push('extraHeaders');
    }
  } catch {
    // Fallback without extraHeaders
  }

  // 2. onBeforeRedirect (3xx redirects)
  chrome.webRequest.onBeforeRedirect.addListener(
    (details) => {
      navigationTracker.handleBeforeRedirect(details).catch(err => {
        console.error('[Redirect Scan] Error in onBeforeRedirect:', err);
      });
    },
    filter,
    extraInfoSpec
  );

  // 3. onResponseStarted (Final response started)
  chrome.webRequest.onResponseStarted.addListener(
    (details) => {
      navigationTracker.handleResponseStarted(details).catch(err => {
        console.error('[Redirect Scan] Error in onResponseStarted:', err);
      });
    },
    filter,
    extraInfoSpec
  );

  // 4. onCompleted (Request completed)
  chrome.webRequest.onCompleted.addListener(
    (details) => {
      navigationTracker.handleCompleted(details).catch(err => {
        console.error('[Redirect Scan] Error in onCompleted:', err);
      });
    },
    filter,
    extraInfoSpec
  );

  // 5. onErrorOccurred (Network errors)
  chrome.webRequest.onErrorOccurred.addListener(
    (details) => {
      navigationTracker.handleErrorOccurred(details).catch(err => {
        console.error('[Redirect Scan] Error in onErrorOccurred:', err);
      });
    },
    filter
  );
}
