# Chrome Web Store Listing — Redirect Scan

---

## 📌 Extension Details

* **Extension Name:** Redirect Scan — HTTP Redirect & Header Checker
* **Short Name:** Redirect Scan
* **Version:** 1.0.0
* **Category:** Developer Tools / Productivity
* **Primary Language:** English

---

## 📝 Short Description (Max 132 characters)
> Track HTTP redirects, status codes, response headers, and client-side redirects directly in Chrome. 100% private and local.

---

## 📄 Detailed Description (Formatted for Chrome Web Store)

**Redirect Scan** is a fast, accurate, and privacy-first Chrome Extension for technical SEO specialists, web developers, webmasters, and QA engineers. It records and inspects HTTP redirect chains, status codes, response headers, and client-side redirects in real time.

Unlike simple fetch-based tools, Redirect Scan observes actual browser top-level navigations, capturing the exact redirect path, server IP, and response headers before the popup is opened.

---

### 🚀 Key Features

* **Complete HTTP Redirect Chain Capture:**
  * Real-time observation of `301`, `302`, `303`, `307`, and `308` redirect hops.
  * Preserves full redirect order, source URLs, and destination locations.

* **Final Status & Error Diagnostics:**
  * Instant status reporting for `200 OK`, `4xx` client errors (`404 Not Found`, `410 Gone`, `429 Rate Limit`), `5xx` server errors (`500`, `502`, `503`, `504`), and browser network errors (`ERR_TOO_MANY_REDIRECTS`, `ERR_CONNECTION_REFUSED`).

* **Client-Side Redirect & Meta Refresh Tracking:**
  * Early DOM detection of `<meta http-equiv="refresh">` tags with delay and destination URL.
  * Identifies client-side transitions via `webNavigation` transition qualifiers with deduplication.

* **Grouped HTTP Response Headers:**
  * **SEO / Crawling:** `Location`, `X-Robots-Tag`, `Link`, `Canonical`, `Content-Language`.
  * **Caching:** `Cache-Control`, `Expires`, `ETag`, `Last-Modified`, `Age`, `Vary`, `CF-Cache-Status`.
  * **Security:** `Strict-Transport-Security` (HSTS), `Content-Security-Policy` (CSP), `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`.
  * **Server:** `Server`, `Via`, `X-Powered-By`, `Server IP`, `From Cache`.
  * **All Headers:** Alphabetically sorted with real-time search filtering.

* **Intelligent SEO & Technical Rules Engine:**
  * ⚠️ Long redirect chain alerts (3+ hops).
  * 🚨 Circular redirect loop detection ($A \rightarrow B \rightarrow A$).
  * 🔒 Protocol checks (HTTP $\rightarrow$ HTTPS security upgrade vs. HTTPS $\rightarrow$ HTTP downgrade).
  * 🌍 Cross-domain redirect detection.
  * 🏷️ Stripped or lost URL query parameters (e.g. `utm_*` marketing tags).
  * 🔀 Canonical hostname (`www`) and trailing slash adjustments.

* **Dynamic Toolbar Badge:**
  * Instant badge on the extension icon displaying status code (`301`, `404`, `500`, `CR`, `ERR`) or clearing automatically on clean `200 OK` pages.

* **Export & Trace Tools:**
  * **Copy URL:** Copy individual hop or destination URLs.
  * **Copy Chain:** Copy concise plain text redirect path.
  * **Copy Full Report:** Copy comprehensive technical audit report ready for Slack, Notion, Jira, or GitHub issues.
  * **Reload & Trace:** Clear tab state and re-trace the entire navigation lifecycle from scratch bypassing cache.

---

### 🔒 Privacy by Design

* **100% Local Processing:** Runs entirely inside your browser.
* **Zero Telemetry / Zero Tracking:** No analytics, no external API requests, no background syncing.
* **Main Frame Only:** Analyzes top-level document navigations only — never logs background subresources, images, or third-party scripts.
* **No History Retention:** Redirect session data is stored temporarily in `chrome.storage.session` and automatically cleared when tabs are closed.
* **Sensitive Header Protection:** Sensitive request headers and cookie data are never collected.

---

## 🛡️ Permissions Justification (For CWS Reviewers)

* **`webRequest`**: Observes top-level HTTP/HTTPS responses (`onBeforeRedirect`, `onResponseStarted`, `onCompleted`, `onErrorOccurred`) to capture redirect status codes, headers, and destinations. (Non-blocking).
* **`webNavigation`**: Detects transition qualifiers (`client_redirect`) and navigation lifecycles.
* **`storage`**: Uses `chrome.storage.session` to persist tab redirect state during service worker lifecycle.
* **`host_permissions` (`http://*/*`, `https://*/*`)**: Required because redirect chains happen before the user clicks on the extension action icon to open the popup.
