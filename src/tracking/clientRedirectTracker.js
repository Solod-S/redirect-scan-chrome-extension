/**
 * Redirect Scan - Client Redirect Tracker
 * Correlates Meta Refresh events with webNavigation client_redirect qualifiers.
 */

import { appendClientRedirect } from './chainBuilder.js';
import { urlsMatchFuzzy } from './redirectMatcher.js';

export class ClientRedirectTracker {
  constructor() {
    /** @type {Map<number, Array<{url: string, targetUrl: string, delay: number, timestamp: number}>>} */
    this.pendingMetaRefreshes = new Map();
  }

  /**
   * Registers a meta refresh detected by content script
   * @param {number} tabId
   * @param {Object} data
   */
  recordMetaRefreshDetected(tabId, data) {
    if (!tabId || !data) return;

    if (!this.pendingMetaRefreshes.has(tabId)) {
      this.pendingMetaRefreshes.set(tabId, []);
    }

    const pending = this.pendingMetaRefreshes.get(tabId);
    // Keep only recent detections (< 30s)
    const now = Date.now();
    const fresh = pending.filter(p => (now - p.timestamp) < 30000);

    fresh.push({
      url: data.url,
      targetUrl: data.targetUrl,
      delay: typeof data.delay === 'number' ? data.delay : 0,
      timestamp: data.timestamp || now
    });

    this.pendingMetaRefreshes.set(tabId, fresh);
  }

  /**
   * Correlates webNavigation transition with any pending meta refresh
   * @param {import('../shared/typedefs.js').TabNavigationState} state
   * @param {Object} navDetails
   * @returns {import('../shared/typedefs.js').TabNavigationState}
   */
  handleWebNavigationTransition(state, navDetails) {
    if (!state || !navDetails) return state;

    const tabId = navDetails.tabId;
    const toUrl = navDetails.url;
    const fromUrl = state.currentUrl || state.initialUrl || '';
    const now = Date.now();

    const qualifiers = navDetails.transitionQualifiers || [];
    const isClientRedirect = qualifiers.includes('client_redirect');

    if (!isClientRedirect) return state;

    // Check if there is a pending meta refresh for this tab matching destination
    const pendingList = this.pendingMetaRefreshes.get(tabId) || [];
    const matchedMetaIndex = pendingList.findIndex(
      p => urlsMatchFuzzy(p.targetUrl, toUrl) || urlsMatchFuzzy(p.url, fromUrl)
    );

    if (matchedMetaIndex !== -1) {
      const matchedMeta = pendingList[matchedMetaIndex];
      // Remove used pending
      pendingList.splice(matchedMetaIndex, 1);
      this.pendingMetaRefreshes.set(tabId, pendingList);

      return appendClientRedirect(state, {
        mechanism: 'meta-refresh',
        fromUrl: matchedMeta.url || fromUrl,
        toUrl: matchedMeta.targetUrl || toUrl,
        delay: matchedMeta.delay,
        evidence: 'meta-tag',
        timestamp: now
      });
    }

    // Generic client-side navigation
    return appendClientRedirect(state, {
      mechanism: 'client-navigation',
      fromUrl,
      toUrl,
      delay: null,
      evidence: 'webNavigation-client_redirect',
      timestamp: now
    });
  }

  /**
   * Cleans pending records for tab
   * @param {number} tabId
   */
  clearTab(tabId) {
    this.pendingMetaRefreshes.delete(tabId);
  }
}

export const clientRedirectTracker = new ClientRedirectTracker();
