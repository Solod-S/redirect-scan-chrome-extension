# Redirect Scan — HTTP Redirect & Header Checker

> **Redirect Scan** is a fast, accurate, privacy-first Google Chrome Extension (Manifest V3) for technical SEO specialists, web developers, webmasters, and QA engineers. It records and inspects HTTP redirect chains, response headers, server metadata, and client-side redirects directly in your browser.

---

## 🌟 Features

* **Complete HTTP Redirect Chains:** Real-time capture of `301`, `302`, `303`, `307`, and `308` redirect hops.
* **Final Status & Errors:** Instant reporting of `200 OK`, `4xx` client errors (`404`, `410`, `429`), `5xx` server errors (`500`, `502`, `503`, `504`), and browser network errors (`ERR_TOO_MANY_REDIRECTS`, `ERR_CONNECTION_REFUSED`).
* **Client-Side Redirect Tracking:** Best-effort detection of `<meta http-equiv="refresh">` tags (with delay) and client-side navigations.
* **Grouped HTTP Response Headers:**
  * **SEO / Crawling:** `Location`, `X-Robots-Tag`, `Link`, `Content-Language`, `Canonical`
  * **Caching:** `Cache-Control`, `Expires`, `ETag`, `Last-Modified`, `Age`, `Vary`, `CF-Cache-Status`
  * **Security:** `HSTS`, `CSP`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`
  * **Server:** `Server`, `Via`, `X-Powered-By`, `Server IP`, `From Cache`
  * **All Headers:** Alphabetically sorted with real-time search filtering.
* **Smart SEO & Technical Rules Engine:**
  * Long redirect chain warning ($\ge 3$ redirects)
  * Redirect loop detection ($A \rightarrow B \rightarrow A$ or excessive redirects)
  * Protocol transitions: HTTP $\rightarrow$ HTTPS upgrades and HTTPS $\rightarrow$ HTTP security downgrades
  * Cross-domain redirect detection
  * Stripped / lost URL query parameters (e.g. `utm_*` marketing tags)
  * Canonical hostname (`www`) and trailing slash adjustments
* **Toolbar Badge:** Instant visual feedback with status codes (`301`, `404`, `500`, `CR`), colors, and detailed tooltips.
* **Export & Trace Tools:**
  * **Copy URL:** Copy individual step or destination URLs.
  * **Copy Chain:** Copy concise plain text redirect path.
  * **Copy Full Report:** Copy comprehensive technical audit report.
  * **Reload & Trace:** Clear tab state and re-trace the entire navigation lifecycle from the beginning.
  * **Refresh Data:** Resynchronize state with background service worker without reloading the page.

---

## 🔍 How Redirect Tracking Works

### Server-Side Redirects
Redirect Scan uses `chrome.webRequest` events (`onBeforeRequest`, `onBeforeRedirect`, `onResponseStarted`, `onCompleted`, `onErrorOccurred`) filtered strictly to `main_frame` navigations. When the browser receives a `3xx` redirect, `onBeforeRedirect` captures the source URL, destination `Location`, status code, status line, IP address, cache status, and response headers.

### Client-Side Redirects
1. **Meta Refresh:** A lightweight content script runs at `document_start` to scan the DOM `<head>` for `<meta http-equiv="refresh">` tags and monitors dynamic DOM modifications via `MutationObserver`. When detected, it messages the background service worker.
2. **Client Navigation:** The extension monitors `chrome.webNavigation.onCommitted` for `client_redirect` transition qualifiers. When paired with a pending Meta Refresh, it correlates them into a single deduplicated client redirect step.

---

## 🔒 Privacy Principle

* **100% Local Execution:** All network analysis and rule evaluations are executed locally within your browser.
* **No Telemetry / No Backend:** No visited URLs, headers, IP addresses, or chains are ever uploaded to remote servers.
* **Main Frame Only:** Background subresource requests (images, stylesheets, scripts, tracking pixels, ads) are intentionally excluded.
* **Zero Request Header / Cookie Collection:** Request cookies and `Authorization` credentials are never captured.
* **Session Lifetime:** Navigation state is maintained per tab in `chrome.storage.session` and memory. It is automatically purged when the tab is closed or Chrome is restarted.

---

## 🛡️ Permissions

| Permission | Purpose |
| :--- | :--- |
| `webRequest` | Observes top-level HTTP/HTTPS responses and status codes. *(Non-blocking)* |
| `webNavigation` | Detects transition qualifiers (`client_redirect`) and navigation lifecycles. |
| `storage` | Utilizes `chrome.storage.session` to persist tab redirect state during service worker lifecycle. |
| `host_permissions` | Required to observe redirects across websites before the popup is opened. |

---

## ⚙️ Tech Stack & Architecture

* **Chrome Extension:** Manifest V3
* **Frontend UI:** React 19, CSS Modules / scoped CSS, `lucide-react`
* **Build System:** Vite 6 / ES2022+ (Zero TypeScript)
* **Testing:** Vitest 3, React Testing Library, JSDOM
* **Storage:** `TabRedirectStore` with in-memory caching and `chrome.storage.session`

---

## 🛠️ Development & Testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Unit Tests
```bash
npm test
```

### 3. Start Local Test Server
Run the dev test server offering various redirect and status scenarios:
```bash
npm run test:server
```
Visit `http://localhost:3000` to test 301, 302, 303, 307, 308, 404, 500, Meta Refresh, JS redirects, and loops.

### 4. Build Production Bundle
```bash
npm run build
```
The compiled unpacked extension will be generated in `dist/`.

### 5. Create Distribution ZIP
```bash
npm run package
```
Generates `release/redirect-scan-v1.0.0.zip`.

---

## 📥 Loading Unpacked Extension in Chrome

1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** using the toggle switch in the top right corner.
3. Click the **Load unpacked** button.
4. Select the `dist` folder located in this repository.
5. The **Redirect Scan** icon will appear in your Chrome toolbar.

---

## ⚠️ Known Limitations

1. **Pre-installation Navigations:** Redirect Scan can only capture redirect chains for navigations observed while the extension is active. Use **Reload & Trace** if a page was already opened prior to loading the extension.
2. **Client-Side Redirect Mechanism:** While `Meta Refresh` tags can be identified explicitly, generic client-side redirects (`client_redirect`) indicate that a script or user agent navigation took place without decompiling the specific inline JavaScript code.
3. **Server IP Availability:** Chrome exposes `details.ip` depending on DNS and socket connection properties. If Chrome does not provide an IP, "Not available" is displayed without performing third-party DNS queries.
4. **Top-Level Navigations Only:** Version 1.0 focuses strictly on `main_frame` documents to maximize privacy and performance.

---

## 🗺️ Roadmap (P1 / P2)

* [ ] **P1:** Export redirect chains and reports as JSON.
* [ ] **P1:** Response timing breakdown (TTFB / redirect latency).
* [ ] **P1:** Configurable long-chain threshold and badge customization in options page.
* [ ] **P1:** Context-menu quick copy for active link redirect trace.
* [ ] **P2:** Bulk URL checker and CSV import.
* [ ] **P2:** Site-wide redirect crawler.
