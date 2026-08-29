/**
 * Redirect Scan - useTabRedirectState Hook
 * Fetches and synchronizes redirect state for the active Chrome tab.
 */

import { useState, useEffect, useCallback } from 'react';
import { MESSAGE_TYPES } from '../../shared/constants.js';

export function useTabRedirectState() {
  const [activeTab, setActiveTab] = useState(null);
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unsupportedScheme, setUnsupportedScheme] = useState(null);

  const isHttpOrHttps = useCallback((url) => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  }, []);

  const fetchTabState = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabs.query) {
        // Mock fallback for standalone dev/testing
        setLoading(false);
        return;
      }

      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0) {
        setError('No active tab found.');
        setLoading(false);
        return;
      }

      const currentTab = tabs[0];
      setActiveTab(currentTab);

      if (!isHttpOrHttps(currentTab.url)) {
        setUnsupportedScheme(currentTab.url || 'Unsupported scheme');
        setLoading(false);
        return;
      }

      setUnsupportedScheme(null);

      // Query service worker for state
      chrome.runtime.sendMessage(
        {
          type: MESSAGE_TYPES.GET_TAB_STATE,
          tabId: currentTab.id
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.debug('[Redirect Scan] Runtime error:', chrome.runtime.lastError);
            // Non-fatal, state might just be empty
            setState(null);
          } else if (response && response.ok) {
            setState(response.state || null);
          } else {
            setState(null);
          }
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('[Redirect Scan] Failed to load tab redirect state:', err);
      setError(err.message || 'Failed to communicate with extension background.');
      setLoading(false);
    }
  }, [isHttpOrHttps]);

  useEffect(() => {
    fetchTabState();
  }, [fetchTabState]);

  const reloadAndTrace = useCallback(async () => {
    if (!activeTab || !activeTab.id) return;
    try {
      setLoading(true);
      await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.RELOAD_AND_TRACE,
        tabId: activeTab.id
      });
      // Close popup so user sees trace reload
      window.close();
    } catch (err) {
      console.error('[Redirect Scan] Failed to reload and trace:', err);
      setLoading(false);
    }
  }, [activeTab]);

  const refreshData = useCallback(async () => {
    await fetchTabState();
  }, [fetchTabState]);

  return {
    activeTab,
    state,
    loading,
    error,
    unsupportedScheme,
    reloadAndTrace,
    refreshData
  };
}
