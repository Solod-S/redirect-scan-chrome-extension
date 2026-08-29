# Redirect Scan — Chrome Permissions Justification

This document provides a detailed justification for the permissions requested in `manifest.json`.

---

### 1. `webRequest`
* **Purpose:** Enables observation of top-level HTTP/HTTPS responses (`onBeforeRedirect`, `onResponseStarted`, `onCompleted`, `onErrorOccurred`).
* **Justification:** Essential for capturing 3xx status codes, response headers, server IP addresses, cache flags, and redirect destinations.
* **Safety:** Redirect Scan does **not** use `webRequestBlocking` and never alters, cancels, or modifies network requests.

---

### 2. `webNavigation`
* **Purpose:** Listens to navigation transition lifecycle and qualifiers (`transitionQualifiers`).
* **Justification:** Required to identify client-side navigations and redirects (`client_redirect`) and distinguish between user navigation and browser transitions.

---

### 3. `storage`
* **Purpose:** Enables access to `chrome.storage.session`.
* **Justification:** Stores temporary redirect chains for currently open tabs across Service Worker suspensions and wake-ups. All data is automatically discarded when Chrome restarts or tabs close.

---

### 4. `host_permissions` (`http://*/*`, `https://*/*`)
* **Purpose:** Grants observation rights on HTTP and HTTPS websites.
* **Justification:** Redirect chains happen before the user clicks on the extension action icon to open the popup. Therefore, `activeTab` alone is insufficient to capture redirects that occurred earlier during navigation.
* **Safety:** Filters strictly isolate `main_frame` traffic. No data is stored persistently or uploaded.

---

### 5. Content Script (`meta-refresh-detector.js` on `document_start`)
* **Purpose:** Scans the DOM `<head>` for `<meta http-equiv="refresh">` tags.
* **Justification:** Meta Refresh tags execute in the browser DOM. Early detection at `document_start` allows capturing redirect destination and delay before the browser unloads the page.
