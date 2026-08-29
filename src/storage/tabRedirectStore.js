/**
 * Redirect Scan - TabRedirectStore
 * Manages per-tab redirect state with in-memory cache and chrome.storage.session persistence.
 */

import { STORAGE_KEYS } from '../shared/constants.js';

export class TabRedirectStore {
  constructor() {
    /** @type {Map<number, import('../shared/typedefs.js').TabNavigationState>} */
    this.memoryCache = new Map();
    this.initialized = false;
  }

  /**
   * Helper to get storage key for tab
   * @param {number} tabId
   * @returns {string}
   */
  _getKey(tabId) {
    return `${STORAGE_KEYS.TAB_PREFIX}${tabId}`;
  }

  /**
   * Checks if chrome.storage.session is available
   * @returns {boolean}
   */
  _hasSessionStorage() {
    return (
      typeof chrome !== 'undefined' &&
      chrome.storage &&
      chrome.storage.session &&
      typeof chrome.storage.session.get === 'function'
    );
  }

  /**
   * Gets state for a tab
   * @param {number} tabId
   * @returns {Promise<import('../shared/typedefs.js').TabNavigationState|null>}
   */
  async get(tabId) {
    if (!tabId || tabId < 0) return null;

    // Check memory cache first
    if (this.memoryCache.has(tabId)) {
      return this.memoryCache.get(tabId);
    }

    // Try reading from chrome.storage.session
    if (this._hasSessionStorage()) {
      try {
        const key = this._getKey(tabId);
        const data = await chrome.storage.session.get(key);
        if (data && data[key]) {
          this.memoryCache.set(tabId, data[key]);
          return data[key];
        }
      } catch (err) {
        console.warn(`[TabRedirectStore] Failed to read from session storage for tab ${tabId}:`, err);
      }
    }

    return null;
  }

  /**
   * Sets state for a tab
   * @param {number} tabId
   * @param {import('../shared/typedefs.js').TabNavigationState} state
   * @returns {Promise<void>}
   */
  async set(tabId, state) {
    if (!tabId || tabId < 0 || !state) return;

    this.memoryCache.set(tabId, state);

    if (this._hasSessionStorage()) {
      try {
        const key = this._getKey(tabId);
        await chrome.storage.session.set({ [key]: state });
      } catch (err) {
        console.warn(`[TabRedirectStore] Failed to write to session storage for tab ${tabId}:`, err);
      }
    }
  }

  /**
   * Updates state atomically for a tab
   * @param {number} tabId
   * @param {function(import('../shared/typedefs.js').TabNavigationState|null): import('../shared/typedefs.js').TabNavigationState} updater
   * @returns {Promise<import('../shared/typedefs.js').TabNavigationState>}
   */
  async update(tabId, updater) {
    const currentState = await this.get(tabId);
    const newState = updater(currentState ? JSON.parse(JSON.stringify(currentState)) : null);
    if (newState) {
      await this.set(tabId, newState);
    }
    return newState;
  }

  /**
   * Clears state for a tab (creates a fresh empty navigation state)
   * @param {number} tabId
   * @returns {Promise<void>}
   */
  async clear(tabId) {
    if (!tabId || tabId < 0) return;

    this.memoryCache.delete(tabId);

    if (this._hasSessionStorage()) {
      try {
        const key = this._getKey(tabId);
        await chrome.storage.session.remove(key);
      } catch (err) {
        console.warn(`[TabRedirectStore] Failed to clear session storage for tab ${tabId}:`, err);
      }
    }
  }

  /**
   * Removes tab completely on tab close
   * @param {number} tabId
   * @returns {Promise<void>}
   */
  async remove(tabId) {
    return this.clear(tabId);
  }
}

export const tabRedirectStore = new TabRedirectStore();
