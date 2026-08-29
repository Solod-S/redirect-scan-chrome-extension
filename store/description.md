# Redirect Scan — Chrome Web Store Listing

## Title
**Redirect Scan — HTTP Redirect & Header Checker**

## Short Description
Track HTTP redirects, status codes, response headers, and client-side redirects directly in Chrome.

## Detailed Description
**Redirect Scan** is a fast, accurate, and privacy-first Chrome Extension designed for SEO specialists, web developers, webmasters, and QA engineers to inspect and debug HTTP navigations, status codes, response headers, and redirect chains.

### 🚀 Key Features

* **Complete HTTP Redirect Chains:** Real-time capture of 301, 302, 303, 307, and 308 redirect sequences before opening the popup.
* **Final Status & Errors:** Instant detection of 200 OK, 4xx client errors (404, 410, 429), 5xx server errors (500, 502, 503), and browser network errors (`ERR_TOO_MANY_REDIRECTS`, `ERR_NAME_NOT_RESOLVED`).
* **Client-Side Redirect Detection:** Best-effort identification of `<meta http-equiv="refresh">` tags and JavaScript / client-side navigations with delay details.
* **Categorized Response Headers:** Cleanly grouped headers for SEO/Crawling, Caching (`Cache-Control`, `ETag`, `Age`), Security (`HSTS`, `CSP`, `X-Frame-Options`), and Server metadata.
* **Server IP & Cache Diagnostics:** Displays actual server IP addresses and cached status (`fromCache`) when provided by Chrome.
* **Smart SEO & Technical Warnings:**
  * Long redirect chain alerts (3+ hops)
  * Redirect loop detection (A → B → A)
  * Protocol transitions (HTTP → HTTPS upgrades and insecure HTTPS → HTTP downgrades)
  * Domain migrations (Cross-domain redirects)
  * Stripped or lost URL query parameters (e.g. `utm_*` tags)
  * Trailing slash normalizations and canonical www changes
* **One-Click Export:** Fast copy buttons for URLs, concise redirect paths, and full formatted technical audit reports.
* **Reload & Trace:** Easily bypass cache and re-trace the entire navigation lifecycle from the beginning.
* **Instant Badge:** Toolbar icon badge dynamically shows the first redirect status (e.g., `301`), error status (`404`), client redirect (`CR`), or clears on clean 200 OK responses.

---

### 🔒 Privacy by Design

* **100% Local Processing:** Runs entirely inside your browser.
* **No Telemetry or Tracking:** Zero analytics, zero external API requests, zero background syncing.
* **Main Frame Only:** Analyzes top-level document navigations only — never logs background subresources, images, or third-party scripts.
* **No History Retention:** Redirect session data is stored temporarily in `chrome.storage.session` and automatically cleared when tabs are closed.
* **Sensitive Header Protection:** Sensitive request headers and cookie data are never collected.
