/**
 * Redirect Scan - Navigation Tracker
 * Coordinates webRequest lifecycle events and maintains per-tab state.
 */

import { tabRedirectStore } from '../storage/tabRedirectStore.js';
import {
  createInitialNavigationState,
  appendRedirectStep,
  setFinalResponse,
  recordNetworkError
} from './chainBuilder.js';
import { isRedirectContinuation } from './redirectMatcher.js';
import { badgeController } from '../background/badgeController.js';

export class NavigationTracker {
  constructor() {
    /** @type {Map<string, string>} Maps requestId to navigationId */
    this.requestToNavMap = new Map();
  }

  /**
   * Handles onBeforeRequest event
   * @param {Object} details
   */
  async handleBeforeRequest(details) {
    if (details.type !== 'main_frame' || details.tabId < 0) return;

    const tabId = details.tabId;
    const url = details.url;
    const requestId = details.requestId;

    let state = await tabRedirectStore.get(tabId);

    // Check if this request is part of an ongoing redirect chain
    const isContinuation = state && (
      isRedirectContinuation(state, url) ||
      (state.steps.length > 0 && state.currentUrl === url)
    );

    if (!state || !isContinuation) {
      // Start a brand new navigation
      state = createInitialNavigationState(tabId, url);
      this.requestToNavMap.set(requestId, state.navigationId);
      await tabRedirectStore.set(tabId, state);
      await badgeController.updateBadge(tabId, state);
    } else {
      // Continuation of existing redirect chain
      this.requestToNavMap.set(requestId, state.navigationId);
      state.currentUrl = url;
      await tabRedirectStore.set(tabId, state);
    }
  }

  /**
   * Handles onBeforeRedirect event (HTTP 3xx redirects)
   * @param {Object} details
   */
  async handleBeforeRedirect(details) {
    if (details.type !== 'main_frame' || details.tabId < 0) return;

    const tabId = details.tabId;
    let state = await tabRedirectStore.get(tabId);

    if (!state) {
      state = createInitialNavigationState(tabId, details.url);
    }

    state = appendRedirectStep(state, {
      requestId: details.requestId,
      url: details.url,
      statusCode: details.statusCode,
      statusLine: details.statusLine,
      redirectUrl: details.redirectUrl,
      responseHeaders: details.responseHeaders || [],
      ip: details.ip || null,
      fromCache: details.fromCache || false,
      timestamp: details.timeStamp || Date.now()
    });

    await tabRedirectStore.set(tabId, state);
    await badgeController.updateBadge(tabId, state);
  }

  /**
   * Handles onResponseStarted event
   * @param {Object} details
   */
  async handleResponseStarted(details) {
    if (details.type !== 'main_frame' || details.tabId < 0) return;

    const tabId = details.tabId;
    const statusCode = details.statusCode;

    // Ignore 3xx responses here as onBeforeRedirect handles them
    if (statusCode >= 300 && statusCode < 400) return;

    let state = await tabRedirectStore.get(tabId);
    if (!state) {
      state = createInitialNavigationState(tabId, details.url);
    }

    state = setFinalResponse(state, {
      requestId: details.requestId,
      url: details.url,
      statusCode: details.statusCode,
      statusLine: details.statusLine,
      responseHeaders: details.responseHeaders || [],
      ip: details.ip || null,
      fromCache: details.fromCache || false,
      timestamp: details.timeStamp || Date.now()
    });

    await tabRedirectStore.set(tabId, state);
    await badgeController.updateBadge(tabId, state);
  }

  /**
   * Handles onCompleted event
   * @param {Object} details
   */
  async handleCompleted(details) {
    if (details.type !== 'main_frame' || details.tabId < 0) return;

    const tabId = details.tabId;
    let state = await tabRedirectStore.get(tabId);
    if (!state) return;

    // Ensure final response is populated if responseStarted was skipped
    if (!state.finalResponse && details.statusCode && (details.statusCode < 300 || details.statusCode >= 400)) {
      state = setFinalResponse(state, {
        requestId: details.requestId,
        url: details.url,
        statusCode: details.statusCode,
        statusLine: details.statusLine,
        responseHeaders: details.responseHeaders || [],
        ip: details.ip || null,
        fromCache: details.fromCache || false,
        timestamp: details.timeStamp || Date.now()
      });
    }

    state.completed = true;
    await tabRedirectStore.set(tabId, state);
    await badgeController.updateBadge(tabId, state);

    // Clean up requestId map
    if (details.requestId) {
      this.requestToNavMap.delete(details.requestId);
    }
  }

  /**
   * Handles onErrorOccurred event
   * @param {Object} details
   */
  async handleErrorOccurred(details) {
    if (details.type !== 'main_frame' || details.tabId < 0) return;

    const tabId = details.tabId;
    let state = await tabRedirectStore.get(tabId);

    if (!state) {
      state = createInitialNavigationState(tabId, details.url);
    }

    state = recordNetworkError(state, {
      error: details.error,
      url: details.url,
      timestamp: details.timeStamp || Date.now()
    });

    await tabRedirectStore.set(tabId, state);
    await badgeController.updateBadge(tabId, state);

    if (details.requestId) {
      this.requestToNavMap.delete(details.requestId);
    }
  }

  /**
   * Cleans tab state and memory
   * @param {number} tabId
   */
  async cleanTab(tabId) {
    await tabRedirectStore.remove(tabId);
    await badgeController.clearBadge(tabId);
  }
}

export const navigationTracker = new NavigationTracker();
