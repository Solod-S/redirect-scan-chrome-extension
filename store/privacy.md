# Redirect Scan — Privacy Policy

Last updated: August 2026

**Redirect Scan** is built with strict privacy and security standards. It is designed solely as a local development and SEO debugging utility.

## 1. Local Data Processing
Redirect Scan observes top-level HTTP and HTTPS navigation events locally in your Google Chrome browser to construct redirect chains, inspect status codes, and display HTTP response headers.

## 2. No Data Collection or Transmission
* **Zero External Communication:** The extension has no remote backend, no cloud database, no telemetry, and no third-party analytics services.
* **No Telemetry:** We do not collect or transmit your visited URLs, IP addresses, redirect paths, request data, or response headers.
* **No Account Required:** The extension does not require user registration, authentication, or personal information.

## 3. Scope of Network Observation
* Redirect Scan only monitors **top-level document navigations** (`main_frame`).
* It does **not** capture or monitor subresource network requests (such as images, scripts, stylesheets, XHR/fetch requests, or iframes).
* It does **not** collect sensitive request credentials, request cookies, or `Authorization` headers.

## 4. Session Storage & Retention
* Redirect chains and headers for active tabs are kept in temporary memory and `chrome.storage.session`.
* When a browser tab is closed, all associated redirect state for that tab is immediately deleted.
* When Chrome is restarted, all session storage is automatically cleared. No persistent browsing history is constructed or retained.

## 5. Contact
If you have any questions or feedback regarding this privacy policy, please contact the developer via the official project repository.
