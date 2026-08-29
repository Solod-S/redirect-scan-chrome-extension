/**
 * Redirect Scan - Meta Refresh Detector
 * Content script running at document_start to detect Meta Refresh tags.
 * Note: Must remain self-contained without ES module imports for Chrome Manifest V3 compatibility.
 */

(function initMetaRefreshDetector() {
  const MESSAGE_TYPE_META_REFRESH = 'META_REFRESH_DETECTED';
  const reportedRefreshes = new Set();

  function parseMetaRefreshContent(content, baseUrl) {
    if (!content || typeof content !== 'string') return null;
    const trimmed = content.trim();
    if (!trimmed) return null;

    const parts = trimmed.split(';');
    const delayStr = parts[0].trim();
    const delay = parseInt(delayStr, 10);
    if (isNaN(delay) || delay < 0) return null;

    let rawUrl = '';
    if (parts.length > 1) {
      const urlPart = parts.slice(1).join(';').trim();
      const match = urlPart.match(/url\s*=\s*(.*)/i);
      if (match && match[1]) {
        rawUrl = match[1].trim();
        if (
          (rawUrl.startsWith('"') && rawUrl.endsWith('"')) ||
          (rawUrl.startsWith("'") && rawUrl.endsWith("'"))
        ) {
          rawUrl = rawUrl.slice(1, -1).trim();
        }
      }
    }

    let targetUrl = rawUrl || baseUrl;
    if (rawUrl && baseUrl) {
      try {
        targetUrl = new URL(rawUrl, baseUrl).href;
      } catch {
        targetUrl = rawUrl;
      }
    }

    return { delay, targetUrl };
  }

  function extractMetaRefresh(element, baseUrl) {
    if (!element || !element.getAttribute) return null;
    const httpEquiv = element.getAttribute('http-equiv');
    if (!httpEquiv || httpEquiv.toLowerCase() !== 'refresh') return null;
    const content = element.getAttribute('content');
    return parseMetaRefreshContent(content, baseUrl);
  }

  function notifyServiceWorker(result) {
    if (!result || !result.targetUrl) return;

    const key = `${result.delay}_${result.targetUrl}`;
    if (reportedRefreshes.has(key)) return;
    reportedRefreshes.add(key);

    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({
          type: MESSAGE_TYPE_META_REFRESH,
          url: window.location.href,
          targetUrl: result.targetUrl,
          delay: result.delay,
          timestamp: Date.now()
        }).catch(() => {
          // Background service worker might be sleeping
        });
      }
    } catch {
      // Ignore runtime disconnected
    }
  }

  function scanMetaTags(rootNode) {
    if (!rootNode) return;
    const baseUrl = window.location.href;

    if (rootNode.nodeType === 1 && rootNode.tagName === 'META') {
      const result = extractMetaRefresh(rootNode, baseUrl);
      if (result) notifyServiceWorker(result);
      return;
    }

    if (rootNode.querySelectorAll) {
      const metaTags = rootNode.querySelectorAll('meta');
      for (const meta of metaTags) {
        const result = extractMetaRefresh(meta, baseUrl);
        if (result) notifyServiceWorker(result);
      }
    }
  }

  // 1. Initial scan on document_start
  if (document.documentElement) {
    scanMetaTags(document.documentElement);
  }

  // 2. MutationObserver for dynamically added/updated meta tags
  try {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            scanMetaTags(node);
          }
        } else if (
          mutation.type === 'attributes' &&
          mutation.target &&
          mutation.target.tagName === 'META'
        ) {
          scanMetaTags(mutation.target);
        }
      }
    });

    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['http-equiv', 'content']
    });

    window.addEventListener('load', () => {
      setTimeout(() => {
        observer.disconnect();
      }, 5000);
    }, { once: true });
  } catch (err) {
    console.debug('[Redirect Scan] MutationObserver not supported or error:', err);
  }
})();
