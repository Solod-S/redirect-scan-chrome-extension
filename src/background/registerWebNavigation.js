/**
 * Redirect Scan - Register WebNavigation Listeners
 */

import { clientRedirectTracker } from '../tracking/clientRedirectTracker.js';
import { tabRedirectStore } from '../storage/tabRedirectStore.js';
import { badgeController } from './badgeController.js';

export function registerWebNavigationListeners() {
  if (typeof chrome === 'undefined' || !chrome.webNavigation) {
    console.warn('[Redirect Scan] chrome.webNavigation is not available');
    return;
  }

  // 1. onCommitted: checks transition qualifiers such as client_redirect
  chrome.webNavigation.onCommitted.addListener((details) => {
    // Only track main frame (frameId === 0)
    if (details.frameId !== 0 || details.tabId < 0) return;

    (async () => {
      let state = await tabRedirectStore.get(details.tabId);
      if (!state) return;

      const updatedState = clientRedirectTracker.handleWebNavigationTransition(state, details);
      if (updatedState !== state) {
        await tabRedirectStore.set(details.tabId, updatedState);
        await badgeController.updateBadge(details.tabId, updatedState);
      }
    })().catch(err => {
      console.error('[Redirect Scan] Error in webNavigation.onCommitted:', err);
    });
  });

  // 2. onHistoryStateUpdated: optional awareness for SPA client navigations (P1 preparation)
  chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (details.frameId !== 0 || details.tabId < 0) return;
    // Maintained for future SPA navigation diagnostics
  });
}
