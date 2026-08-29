/**
 * Redirect Scan - Register Tab Lifecycle Listeners
 */

import { navigationTracker } from '../tracking/navigationTracker.js';
import { clientRedirectTracker } from '../tracking/clientRedirectTracker.js';
import { badgeController } from './badgeController.js';
import { tabRedirectStore } from '../storage/tabRedirectStore.js';

export function registerTabListeners() {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    console.warn('[Redirect Scan] chrome.tabs is not available');
    return;
  }

  // 1. Tab closed: clean up session memory completely
  chrome.tabs.onRemoved.addListener((tabId) => {
    navigationTracker.cleanTab(tabId).catch(() => {});
    clientRedirectTracker.clearTab(tabId);
  });

  // 2. Tab replaced (e.g., prerendering)
  if (chrome.tabs.onReplaced) {
    chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
      (async () => {
        const oldState = await tabRedirectStore.get(removedTabId);
        if (oldState) {
          await tabRedirectStore.set(addedTabId, { ...oldState, tabId: addedTabId });
          await badgeController.updateBadge(addedTabId, oldState);
        }
        await navigationTracker.cleanTab(removedTabId);
        clientRedirectTracker.clearTab(removedTabId);
      })().catch(err => {
        console.error('[Redirect Scan] Error in tabs.onReplaced:', err);
      });
    });
  }

  // 3. Tab activated: refresh badge if needed
  if (chrome.tabs.onActivated) {
    chrome.tabs.onActivated.addListener(({ tabId }) => {
      (async () => {
        const state = await tabRedirectStore.get(tabId);
        if (state) {
          await badgeController.updateBadge(tabId, state);
        }
      })().catch(() => {});
    });
  }
}
