/**
 * Redirect Scan - Register Runtime Messages
 */

import { MESSAGE_TYPES } from '../shared/constants.js';
import { tabRedirectStore } from '../storage/tabRedirectStore.js';
import { clientRedirectTracker } from '../tracking/clientRedirectTracker.js';
import { badgeController } from './badgeController.js';

export function registerRuntimeMessages() {
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    console.warn('[Redirect Scan] chrome.runtime is not available');
    return;
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || !message.type) return false;

    // Handle asynchronously
    (async () => {
      try {
        switch (message.type) {
          case MESSAGE_TYPES.GET_TAB_STATE: {
            const tabId = message.tabId || (sender.tab ? sender.tab.id : null);
            if (!tabId) {
              sendResponse({ ok: false, error: 'No tabId provided' });
              return;
            }
            const state = await tabRedirectStore.get(tabId);
            sendResponse({ ok: true, state: state || null });
            break;
          }

          case MESSAGE_TYPES.RELOAD_AND_TRACE: {
            const tabId = message.tabId;
            if (!tabId) {
              sendResponse({ ok: false, error: 'No tabId provided' });
              return;
            }

            // 1. Clear current tab state and memory
            await tabRedirectStore.clear(tabId);
            clientRedirectTracker.clearTab(tabId);
            await badgeController.clearBadge(tabId);

            // 2. Reload tab bypassing cache
            if (chrome.tabs && chrome.tabs.reload) {
              await chrome.tabs.reload(tabId, { bypassCache: true });
            }

            sendResponse({ ok: true });
            break;
          }

          case MESSAGE_TYPES.REFRESH_DATA: {
            const tabId = message.tabId;
            if (!tabId) {
              sendResponse({ ok: false, error: 'No tabId provided' });
              return;
            }
            const state = await tabRedirectStore.get(tabId);
            sendResponse({ ok: true, state: state || null });
            break;
          }

          case MESSAGE_TYPES.META_REFRESH_DETECTED: {
            const tabId = sender.tab ? sender.tab.id : message.tabId;
            if (tabId) {
              clientRedirectTracker.recordMetaRefreshDetected(tabId, message);
            }
            sendResponse({ ok: true });
            break;
          }

          case MESSAGE_TYPES.CLEAR_TAB_STATE: {
            const tabId = message.tabId;
            if (tabId) {
              await tabRedirectStore.clear(tabId);
              clientRedirectTracker.clearTab(tabId);
              await badgeController.clearBadge(tabId);
            }
            sendResponse({ ok: true });
            break;
          }

          default:
            sendResponse({ ok: false, error: `Unknown message type: ${message.type}` });
            break;
        }
      } catch (err) {
        console.error('[Redirect Scan] Error handling message:', err);
        sendResponse({ ok: false, error: err.message });
      }
    })();

    // Return true to indicate asynchronous response
    return true;
  });
}
