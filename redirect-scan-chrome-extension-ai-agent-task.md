# Redirect Scan — техническое задание для AI Coding Agent

## 0. Роль AI-агента

Ты — senior frontend / Chrome Extension engineer.

Твоя задача — спроектировать и реализовать production-ready Chrome Extension **Redirect Scan** для отслеживания HTTP-редиректов, HTTP-статусов и основных response headers текущей страницы.

По назначению продукт похож на redirect/header debugging extensions, но должен иметь собственный код, собственный UI, собственный branding и не копировать чужой дизайн или assets.

Главная продуктовая формулировка:

> **Redirect Scan — HTTP Redirect & Header Checker for SEO and Web Development.**

Основной UX:

```text
User navigates to a website
↓
Redirect Scan observes top-level navigation
↓
301 / 302 / 303 / 307 / 308 redirects are recorded
↓
Final HTTP response is recorded
↓
Client-side redirects are detected when possible
↓
User clicks the extension icon
↓
Popup opens over the current page
↓
The user stays on the page
↓
Full redirect chain, statuses, headers and technical details are displayed
```

Расширение должно работать полностью локально.

Запрещено отправлять наружу:

```text
visited URLs
redirect chains
headers
IP addresses
page data
browsing history
```

В первой версии:

```text
No backend
No analytics
No telemetry
No accounts
No authentication
No AI
No cloud sync
No remote scripts
```

---

# 1. Название проекта

Основное название:

```text
Redirect Scan
```

Chrome Web Store title:

```text
Redirect Scan — HTTP Redirect & Header Checker
```

Slug:

```text
redirect-scan
```

---

# 2. Целевая аудитория

```text
SEO specialists
technical SEO specialists
frontend developers
backend developers
QA engineers
webmasters
WordPress developers
site owners
platform/content engineers
```

---

# 3. Основные задачи

Redirect Scan должен:

1. Показывать полную redirect chain текущей страницы.
2. Определять HTTP 3xx redirects.
3. Показывать final HTTP status.
4. Подсвечивать 4xx и 5xx.
5. Best-effort определять client-side redirects.
6. Показывать важные HTTP response headers.
7. Показывать server IP, когда Chrome его предоставляет.
8. Показывать redirect destination.
9. Выявлять длинные redirect chains и loops.
10. Копировать redirect chain и полный technical report.
11. Давать понятные SEO/technical warnings.
12. Работать до открытия popup, чтобы chain не терялась.

---

# 4. HTTP статусы

Архитектура должна поддерживать любой status code.

Особенно корректно обрабатывать:

```text
200
201
204

301
302
303
307
308

400
401
403
404
410
429

500
501
502
503
504
```

---

# 5. Server-side redirects

Основной API:

```text
chrome.webRequest
```

Использовать события:

```text
chrome.webRequest.onBeforeRequest
chrome.webRequest.onHeadersReceived
chrome.webRequest.onBeforeRedirect
chrome.webRequest.onResponseStarted
chrome.webRequest.onCompleted
chrome.webRequest.onErrorOccurred
```

Ключевой event:

```text
onBeforeRedirect
```

Именно он используется для server-side redirect step:

```text
URL A
301
Location: URL B

URL B
302
Location: URL C

URL C
200
```

---

# 6. Только main_frame

В P0 отслеживать только:

```text
type === "main_frame"
```

Не собирать subresource requests:

```text
images
scripts
stylesheets
XHR/fetch
fonts
iframes
analytics
ads
```

Причины:

```text
privacy
performance
clarity
storage size
```

---

# 7. Client-side redirects

Best-effort определять:

```text
Meta Refresh
generic client-side redirect
```

Использовать:

```text
chrome.webNavigation
```

и `transitionQualifiers`:

```text
client_redirect
server_redirect
```

Если присутствует `client_redirect`, это evidence client-side navigation.

Не утверждать, что это JavaScript redirect, если точный механизм неизвестен.

---

# 8. Meta Refresh

Content script должен обнаруживать:

```html
<meta http-equiv="refresh" content="0; url=https://example.com">
```

Поддержать разные регистры:

```html
<meta http-equiv="Refresh">
<meta http-equiv="REFRESH">
```

Извлекать:

```text
delay
destination
source URL
```

Пример:

```text
Meta Refresh
0 sec

https://old.example.com/
→
https://new.example.com/
```

---

# 9. Meta Refresh detector

Content script:

```text
run_at: document_start
```

Использовать initial scan + MutationObserver для `<head>`.

После обнаружения:

```text
send message to service worker
```

Не предотвращать redirect и не менять DOM-логику страницы.

---

# 10. JavaScript/client redirects

Не monkey-patch:

```text
window.location
location.href
location.assign
location.replace
history.pushState
history.replaceState
```

как основной способ.

Основной evidence:

```text
webNavigation transitionQualifiers.includes("client_redirect")
```

Если meta refresh найден — показывать:

```text
Meta Refresh
```

Иначе:

```text
Client-side redirect
```

---

# 11. Смешанные цепочки

Поддержать:

```text
HTTP 301
↓
HTTP 302
↓
Meta Refresh
↓
Client-side redirect
↓
HTTP 200
```

Не предполагать, что chain только server-side.

---

# 12. Toolbar badge

Использовать:

```text
chrome.action.setBadgeText
chrome.action.setBadgeBackgroundColor
chrome.action.setTitle
```

Badge нужен как быстрый сигнал без открытия popup.

---

# 13. Badge logic

Предпочтительное поведение:

### Final 200 без redirects

```text
badge = ""
```

### Redirect chain

Например:

```text
301 → 302 → 200
```

Badge:

```text
301
```

Title:

```text
Redirect Scan: 2 redirects → 200
```

### 4xx

```text
404
```

### 5xx

```text
500
```

### Только client redirect

```text
CR
```

Не использовать `JS`, если механизм неизвестен.

---

# 14. Badge colors

Вынести в constants:

```text
2xx → green
3xx → orange/blue
4xx → red
5xx → dark red
client redirect → purple
network error → gray/red
```

Popup не должен передавать статус только цветом.

---

# 15. Стек

Использовать:

```text
Chrome Extension Manifest V3
React 19
Vite 8
JavaScript ES2022+
```

Без TypeScript.

UI:

```text
React
CSS Modules / modular CSS
lucide-react
```

Tests:

```text
Vitest
React Testing Library
```

Опционально:

```text
Playwright
```

Не использовать CDN.

---

# 16. Manifest V3

Background:

```text
service worker
```

Listeners `webRequest` и `webNavigation` регистрировать в top-level service worker scope.

Не использовать:

```text
webRequestBlocking
```

Расширение только наблюдает и анализирует трафик.

---

# 17. Permissions

Redirect chain происходит до открытия popup, поэтому `activeTab` сам по себе недостаточен.

Рекомендуемый manifest:

```json
{
  "permissions": [
    "webRequest",
    "webNavigation",
    "storage"
  ],
  "host_permissions": [
    "http://*/*",
    "https://*/*"
  ]
}
```

Для Meta Refresh detector:

```json
{
  "content_scripts": [
    {
      "matches": [
        "http://*/*",
        "https://*/*"
      ],
      "js": ["meta-refresh-detector.js"],
      "run_at": "document_start"
    }
  ]
}
```

Не добавлять без необходимости:

```text
cookies
history
downloads
bookmarks
management
webRequestBlocking
```

---

# 18. Privacy principle

Несмотря на host permissions:

```text
analyze main_frame only
store current/latest navigation per tab only
never upload data
never build persistent browsing history
```

---

# 19. Session storage

MV3 service worker может выгружаться.

Не полагаться только на:

```js
const tabs = new Map();
```

Использовать:

```text
in-memory cache
+
chrome.storage.session
```

`chrome.storage.local` — только для будущих settings.

---

# 20. Per-tab state

Пример:

```js
{
  tabId: 123,
  navigationId: "generated-id",

  startedAt: 1720000000000,
  updatedAt: 1720000000500,

  initialUrl: "http://example.com",
  currentUrl: "https://www.example.com",

  steps: [],
  finalResponse: null,
  clientRedirects: [],
  errors: [],

  completed: true
}
```

---

# 21. Redirect step model

```js
{
  id: "step-1",
  type: "http-redirect",

  requestId: "...",

  url: "http://example.com",

  statusCode: 301,
  statusLine: "HTTP/1.1 301 Moved Permanently",

  redirectUrl: "https://example.com",

  responseHeaders: [],

  ip: "203.0.113.10",

  fromCache: false,

  timestamp: 1720000000000
}
```

---

# 22. Final response model

```js
{
  type: "http-response",

  url: "https://example.com",

  statusCode: 200,

  statusLine: "HTTP/2 200",

  responseHeaders: [],

  ip: "203.0.113.10",

  fromCache: false,

  timestamp: 1720000000500
}
```

---

# 23. Client redirect model

```js
{
  type: "client-redirect",

  mechanism: "meta-refresh" | "client-navigation" | "unknown",

  fromUrl: "...",
  toUrl: "...",

  delay: null,

  timestamp: 1720000000200,

  evidence: "meta-tag" | "webNavigation-client_redirect"
}
```

---

# 24. webRequest filter

Основной filter:

```js
{
  urls: [
    "http://*/*",
    "https://*/*"
  ],
  types: ["main_frame"]
}
```

Использовать:

```text
requestId
tabId
frameId
timestamp
```

для correlation.

---

# 25. Navigation reset

Новая независимая top-level navigation должна начать новый state:

```text
typed URL
clicked link
reload
bookmark
form submit
Back/Forward
```

Server redirect не должен сбрасывать текущую chain.

Использовать комбинацию:

```text
webRequest lifecycle
webNavigation
timestamps
active per-tab navigation state
```

---

# 26. Race conditions

Учесть:

```text
rapid navigations
reload during redirect
back/forward
cancelled navigation
tab close
service worker restart
```

Использовать:

```text
navigationId
```

и не позволять stale event изменять новую navigation.

---

# 27. Tab cleanup

При:

```text
chrome.tabs.onRemoved
```

очищать session state.

Не хранить историю закрытых tabs.

---

# 28. Response headers

Для redirect steps и final response сохранять `responseHeaders`, когда Chrome их предоставляет.

Не преобразовывать их сразу в object, чтобы не терять duplicates.

Хранить:

```js
[
  { name: "Cache-Control", value: "..." },
  { name: "Set-Cookie", value: "..." }
]
```

Создать case-insensitive helper.

---

# 29. Основные headers

Отдельно показывать:

```text
Location
Server
Content-Type
Content-Length
Cache-Control
Expires
ETag
Last-Modified
Vary
Age
Via
X-Cache
CF-Cache-Status
X-Redirect-By
X-Powered-By
X-Robots-Tag
Strict-Transport-Security
Content-Security-Policy
Referrer-Policy
X-Content-Type-Options
X-Frame-Options
Permissions-Policy
```

Также:

```text
All Response Headers
```

---

# 30. Header groups

Группы UI:

```text
General
SEO / Crawling
Caching
Security
Server
All Headers
```

### SEO / Crawling

```text
Location
X-Robots-Tag
Link
Content-Language
```

### Caching

```text
Cache-Control
Expires
ETag
Last-Modified
Age
Vary
CF-Cache-Status
X-Cache
```

### Security

```text
Strict-Transport-Security
Content-Security-Policy
X-Content-Type-Options
X-Frame-Options
Referrer-Policy
Permissions-Policy
```

### Server

```text
Server
Via
X-Powered-By
IP
From Cache
```

---

# 31. Sensitive headers

P0 не должен собирать request headers.

Не собирать:

```text
Authorization
Cookie
```

Response `Set-Cookie` не показывать в основном UI.

Если Chrome его предоставляет, скрыть по умолчанию.

P1 можно сделать:

```text
Show sensitive response headers
```

Default OFF.

---

# 32. Server IP

Если `details.ip` есть:

```text
Server IP
203.0.113.10
```

IPv6 отображать как есть.

Если нет:

```text
Not available
```

Не выполнять сторонний DNS lookup.

---

# 33. HTTP protocol

Использовать `statusLine`, когда доступно.

Показывать HTTP version только если она реально присутствует.

Не угадывать:

```text
HTTP/2
HTTP/3
```

---

# 34. Cache

Использовать:

```text
fromCache
```

Показать:

```text
From Cache
Yes / No
```

---

# 35. Network errors

Обрабатывать:

```text
onErrorOccurred
```

Например:

```text
net::ERR_NAME_NOT_RESOLVED
net::ERR_CONNECTION_REFUSED
net::ERR_TOO_MANY_REDIRECTS
net::ERR_CERT_DATE_INVALID
net::ERR_TIMED_OUT
```

Popup:

```text
Network Error
ERR_TOO_MANY_REDIRECTS
```

---

# 36. Redirect loop

Если browser сообщает:

```text
ERR_TOO_MANY_REDIRECTS
```

Issue:

```text
Redirect loop / excessive redirects detected
```

Дополнительно best-effort обнаруживать:

```text
A → B → A
```

по повторяющимся URL.

Не блокировать navigation.

---

# 37. Long redirect chain

Threshold:

```js
LONG_REDIRECT_CHAIN_THRESHOLD = 3;
```

Если 3+ redirects:

```text
Warning
Long redirect chain: 4 redirects
```

---

# 38. Redirect rules engine

Создать отдельный:

```text
redirectRulesEngine.js
```

Каждое issue:

```js
{
  id,
  severity,
  title,
  description,
  stepId
}
```

Severity:

```text
error
warning
info
passed
```

---

# 39. P0 rules

Минимум:

```text
301 → info
302 → info/warning depending context
307 → info
308 → info

long chain → warning
redirect loop → error

HTTP → HTTPS → passed/info
HTTPS → HTTP → warning

final 4xx → error
final 5xx → error
404 → error
410 → warning/error
429 → warning

multiple temporary redirects → warning

client-side redirect → warning/info
Meta Refresh → warning

cross-domain redirect → info
www added/removed → info
trailing slash changed → info
query changed/dropped → info/warning
protocol changed → info
```

Не считать любой 302 ошибкой.

---

# 40. URL comparison

Создать:

```text
compareRedirectUrls()
```

Возвращает:

```js
{
  protocolChanged,
  hostChanged,
  pathChanged,
  queryChanged,
  queryDropped,
  hashChanged,
  wwwChanged,
  trailingSlashChanged
}
```

---

# 41. HTTP → HTTPS / HTTPS → HTTP

Показывать:

```text
HTTP → HTTPS
```

как нормальный сценарий.

Для:

```text
HTTPS → HTTP
```

warning:

```text
Redirect downgrades from HTTPS to HTTP.
```

---

# 42. Cross-domain redirect

Если host изменился:

```text
Cross-domain redirect
example.com → example.org
```

---

# 43. Query loss

Если:

```text
/page?utm_source=x
→
/page
```

Issue:

```text
Query parameters were removed during redirect.
```

Severity не должна автоматически быть error.

---

# 44. Popup UX

При клике пользователь остается на странице.

Popup:

```text
width: ~620–680 px
height: ~540–600 px
```

Подобрать фактически под Chrome.

Light theme only.

---

# 45. Popup header

Пример:

```text
Redirect Scan

rozetka.com.ua

2 redirects → 200

[Reload & Trace] [Copy]
```

---

# 46. Popup tabs

P0:

```text
Path
Headers
Issues
```

---

# 47. Summary

Вверху:

```text
Redirects       2
Final Status  200
Client          0
Errors          0
```

Также:

```text
Initial URL
Final URL
Total steps
```

---

# 48. Path tab

Основной redirect chain.

Пример:

```text
1

301 Moved Permanently

https://example.com/old

→ https://example.com/new

Server: nginx
IP: 203.0.113.10

[Headers] [Copy URL]

↓

2

302 Found

https://example.com/new

→ https://www.example.com/final

↓

3

200 OK

https://www.example.com/final

Final destination
```

---

# 49. Redirect cards

Каждая card показывает:

```text
status code
status label
source URL
destination URL
redirect type
timestamp optional
server
IP
cache
```

Actions:

```text
Copy URL
Copy Destination
View Headers
```

---

# 50. Client redirect card

Пример:

```text
CLIENT REDIRECT

https://example.com/landing
→
https://example.com/home

Type
Meta Refresh

Delay
0 sec
```

Или:

```text
Type
Client-side navigation
```

---

# 51. Final response

Отделить визуально:

```text
✓ 200 OK

https://final.example.com/

Final destination
```

---

# 52. Error card

```text
✕ 404 Not Found
```

или:

```text
✕ Network Error

net::ERR_TOO_MANY_REDIRECTS
```

---

# 53. Headers tab

Step selector:

```text
Step 1 — 301
Step 2 — 302
Final — 200
```

После выбора response показывать grouped headers.

---

# 54. Issues tab

Пример:

```text
Warning
Long redirect chain: 4 redirects

Warning
Meta Refresh detected

Info
HTTP upgraded to HTTPS

Passed
Final response is 200
```

---

# 55. Copy Redirect Chain

Кнопка:

```text
Copy Redirect Chain
```

Результат:

```text
Redirect Scan

1. 301 Moved Permanently
http://example.com
→ https://example.com

2. 302 Found
https://example.com
→ https://www.example.com

3. 200 OK
https://www.example.com
```

---

# 56. Copy Full Report

Включает:

```text
initial/final URL
statuses
redirect destinations
client redirects
server IP
important headers
issues
```

Не включать hidden sensitive response headers по умолчанию.

---

# 57. Reload & Trace

Очень важная функция.

Если current chain не была captured:

```text
No redirect data captured for this navigation.
```

Кнопка:

```text
Reload & Trace
```

Действие:

```text
clear current tab state
↓
reload current tab
↓
capture navigation from beginning
```

Popup после reload закроется — нормально.

---

# 58. Refresh Data

Отдельная кнопка:

```text
Refresh Data
```

Только повторно получает текущий state из service worker.

Не reload page.

---

# 59. Не использовать fetch как основной tracker

Запрещено строить MVP так:

```text
open popup
→ fetch(current URL)
→ follow redirects
```

Это не равно реальной browser navigation и не покрывает:

```text
browser cookies/state
service workers
client redirects
real navigation path
```

Главный source of truth:

```text
actual navigation observed by webRequest/webNavigation
```

---

# 60. Meta Refresh pending

Если meta tag найден, но redirect еще не произошел:

можно сохранить pending evidence.

В chain добавлять после подтверждения соответствующей navigation, где возможно.

Не плодить duplicate steps.

---

# 61. SPA/history navigation

В P0:

```text
pushState / replaceState
```

не считать redirect.

P1 можно показывать:

```text
SPA Navigation
```

отдельно.

---

# 62. URL fragments

Изменение:

```text
/page#a → /page#b
```

не считать HTTP redirect.

---

# 63. Tab isolation

Каждый tab имеет отдельный state.

Tab A никогда не показывает chain Tab B.

---

# 64. Chrome restart

`storage.session` очищается при restart.

Это ожидаемо.

Не восстанавливать старую browsing history.

---

# 65. Incognito

Поддержка зависит от настройки Chrome.

Не сохранять incognito data persistently.

README должен это объяснять.

---

# 66. Unsupported schemes

P0:

```text
http
https
```

Для:

```text
chrome://
chrome-extension://
file://
```

показать:

```text
Redirect Scan tracks HTTP and HTTPS pages only.
```

---

# 67. Service Worker architecture

Modules:

```text
registerWebRequestListeners()
registerWebNavigationListeners()
registerTabListeners()
registerRuntimeMessages()
```

Не полагаться на long-running timers.

---

# 68. TabRedirectStore

Создать abstraction:

```text
TabRedirectStore
```

Methods:

```text
get(tabId)
set(tabId, state)
update(tabId, updater)
clear(tabId)
remove(tabId)
```

Не размазывать `chrome.storage.session` по всему проекту.

---

# 69. Messaging

Popup:

```js
chrome.runtime.sendMessage({
  type: "GET_TAB_STATE",
  tabId
});
```

Service worker возвращает plain serializable object.

Meta content script:

```js
{
  type: "META_REFRESH_DETECTED",
  url,
  targetUrl,
  delay,
  timestamp
}
```

---

# 70. Recommended project structure

```text
redirect-scan/
├── public/
│   ├── manifest.json
│   └── icons/
│
├── src/
│   ├── background/
│   │   ├── service-worker.js
│   │   ├── registerWebRequest.js
│   │   ├── registerWebNavigation.js
│   │   ├── registerTabs.js
│   │   ├── registerMessages.js
│   │   └── badgeController.js
│   │
│   ├── tracking/
│   │   ├── navigationTracker.js
│   │   ├── requestTracker.js
│   │   ├── clientRedirectTracker.js
│   │   ├── chainBuilder.js
│   │   ├── navigationClassifier.js
│   │   └── redirectMatcher.js
│   │
│   ├── storage/
│   │   └── tabRedirectStore.js
│   │
│   ├── content/
│   │   ├── meta-refresh-detector.js
│   │   └── parseMetaRefresh.js
│   │
│   ├── popup/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── popup.css
│   │   ├── components/
│   │   │   ├── Header/
│   │   │   ├── Tabs/
│   │   │   ├── Summary/
│   │   │   ├── RedirectStep/
│   │   │   ├── RedirectArrow/
│   │   │   ├── FinalResponse/
│   │   │   ├── ClientRedirect/
│   │   │   ├── HeaderList/
│   │   │   ├── HeaderGroup/
│   │   │   ├── IssueList/
│   │   │   ├── StatusBadge/
│   │   │   ├── CopyButton/
│   │   │   ├── EmptyState/
│   │   │   ├── ErrorState/
│   │   │   └── Toast/
│   │   ├── sections/
│   │   │   ├── Path/
│   │   │   ├── Headers/
│   │   │   └── Issues/
│   │   ├── hooks/
│   │   │   ├── useTabRedirectState.js
│   │   │   └── useClipboard.js
│   │   └── utils/
│   │       ├── formatStatus.js
│   │       ├── formatUrl.js
│   │       ├── report.js
│   │       └── headerUtils.js
│   │
│   ├── rules/
│   │   ├── redirectRulesEngine.js
│   │   ├── statusRules.js
│   │   ├── chainRules.js
│   │   ├── protocolRules.js
│   │   └── urlRules.js
│   │
│   └── shared/
│       ├── constants.js
│       ├── statusCodes.js
│       └── typedefs.js
│
├── tests/
│   ├── fixtures/
│   └── server/
│
├── store/
│   ├── description.md
│   ├── privacy.md
│   └── permissions.md
│
├── popup.html
├── vite.config.js
├── package.json
├── README.md
└── LICENSE
```

---

# 71. JSDoc

Без TypeScript, но использовать JSDoc для моделей.

---

# 72. Helper modules

Создать:

```text
getStatusCategory()
getStatusLabel()
getStatusSeverity()

normalizeHeaders()
getHeader()
getAllHeaders()
groupHeaders()

compareRedirectUrls()
```

Не hard-code business logic в React components.

---

# 73. Tests — chain builder

Покрыть:

```text
200 only
301 → 200
302 → 200
301 → 302 → 200
301 → 307 → 308 → 200
404 final
500 final
Location extraction
headers preserved
```

---

# 74. Tests — navigation state

Проверить:

```text
Tab A / Tab B isolation
new navigation reset
reload reset
redirect does not reset
tab close cleanup
service worker state restoration from storage.session
```

---

# 75. Tests — Meta Refresh

Проверить:

```html
<meta http-equiv="refresh" content="0;url=/new">
<meta http-equiv="refresh" content="5; URL=https://example.com">
<meta HTTP-EQUIV="REFRESH" content="0; url='https://example.com'">
```

И malformed variants.

---

# 76. Tests — client redirects

Проверить:

```text
webNavigation client_redirect
meta refresh evidence
deduplication when both point to same navigation
```

---

# 77. Tests — headers

Проверить:

```text
case insensitive lookup
duplicate headers
Location
Cache-Control
Server
X-Robots-Tag
security groups
hidden sensitive headers
```

---

# 78. Tests — rules

Проверить:

```text
long chain
loop
404
500
HTTP→HTTPS
HTTPS→HTTP
cross-domain
query dropped
Meta Refresh
generic client redirect
```

---

# 79. Tests — badge

Проверить:

```text
200 no redirect
301 → 200
302 → 200
404
500
client redirect
network error
```

---

# 80. Local test server

Создать dev-only Node.js test server.

Endpoints:

```text
/200
/301-to-200
/302-to-200
/301-302-200
/303
/307
/308
/404
/410
/429
/500
/502
/503
/504
/meta-refresh
/js-redirect
/redirect-loop-a
/redirect-loop-b
/headers
```

Это не backend продукта.

Не включать его в production extension bundle.

---

# 81. Manual QA checklist

```text
[ ] Load unpacked
[ ] Service worker works
[ ] Popup opens
[ ] Page stays open

[ ] 200
[ ] 301
[ ] 302
[ ] 303
[ ] 307
[ ] 308

[ ] 404
[ ] 410
[ ] 429
[ ] 500
[ ] 502
[ ] 503
[ ] 504

[ ] 301 → 200
[ ] 301 → 302 → 200
[ ] long chain

[ ] Meta Refresh
[ ] client_redirect
[ ] deduplication

[ ] Location
[ ] Server
[ ] Cache-Control
[ ] Content-Type
[ ] X-Robots-Tag
[ ] Security headers
[ ] All Headers

[ ] Server IP when available
[ ] fromCache

[ ] network errors
[ ] redirect loop

[ ] tab isolation
[ ] reload reset
[ ] new navigation reset
[ ] tab cleanup

[ ] redirect badge
[ ] 404 badge
[ ] 500 badge
[ ] action title

[ ] Path tab
[ ] Headers tab
[ ] Issues tab

[ ] Copy URL
[ ] Copy chain
[ ] Copy full report

[ ] Reload & Trace
[ ] Refresh Data

[ ] no persistent history
[ ] no request cookies
[ ] no Authorization capture

[ ] light UI

[ ] npm test
[ ] npm run build
[ ] npm run package
```

---

# 82. Visual style

Собственный дизайн, не копировать Redirect Path 1:1.

```text
white background
light gray surfaces
blue accent
green success
orange redirects
red errors
purple client redirects
subtle borders
compact cards
minimal shadows
```

Popup light-only.

---

# 83. Long URLs

UI:

```text
ellipsis or wrap
expand on click
```

Copy всегда копирует full URL.

---

# 84. Chrome Web Store description

Создать:

```text
store/description.md
```

Short:

```text
Track HTTP redirects, status codes, response headers and client-side redirects directly in Chrome.
```

Long description:

```text
301 / 302 / 303 / 307 / 308
4xx / 5xx
redirect chain
response headers
server IP when available
Meta Refresh
client redirects
SEO warnings
local processing
```

---

# 85. Privacy

Создать:

```text
store/privacy.md
```

Смысл:

```text
Redirect Scan observes top-level HTTP/HTTPS navigation locally in Chrome to build redirect chains.

The extension does not upload URLs, headers, IP addresses, redirect chains or browsing data to developer-owned servers.

Redirect data is kept only temporarily for the current browser session and is not used to build persistent browsing history.

No analytics or tracking are included in version 1.0.
```

---

# 86. Permissions explanation

Создать:

```text
store/permissions.md
```

### webRequest

```text
Used to observe top-level HTTP/HTTPS responses, redirect status codes and response headers.
```

### webNavigation

```text
Used to detect navigation transitions and client-side redirect indicators.
```

### storage

```text
Used with session storage to keep the current redirect chain per tab while Chrome is running.
```

### host permissions

```text
Required because redirect chains happen during navigation, before the popup is opened. Redirect Scan only processes top-level navigation and does not upload browsing data.
```

---

# 87. Icon

Собственный icon:

```text
curved redirect arrow
+
small scan/radar motif
```

или:

```text
two arrows
+
magnifying glass
```

Размеры:

```text
16
32
48
128
```

Не использовать чужие logos/assets.

---

# 88. Package scripts

```json
{
  "scripts": {
    "dev": "...",
    "build": "...",
    "test": "...",
    "test:watch": "...",
    "lint": "...",
    "test:server": "...",
    "package": "..."
  }
}
```

---

# 89. Build

После:

```bash
npm run build
```

получить:

```text
dist/
```

Готово для:

```text
chrome://extensions
→ Developer mode
→ Load unpacked
→ dist/
```

---

# 90. ZIP

После:

```bash
npm run package
```

создать:

```text
release/redirect-scan-v1.0.0.zip
```

---

# 91. README

README на английском.

Разделы:

```text
Redirect Scan
Features
How redirect tracking works
Server-side redirects
Client-side redirects
Response headers
Server IP
SEO checks
Privacy
Permissions
Manifest V3 notes
Development
Test server
Build
Load unpacked
Known limitations
Roadmap
```

---

# 92. Known limitations

README должен честно указать:

```text
Redirect data can only be shown for navigations observed after installation/permission.

Use Reload & Trace when the current navigation was not captured.

Client-side redirect detection is best-effort.

Meta Refresh can be identified when the meta tag is observed.

Generic client redirects can sometimes be identified without revealing the exact JavaScript code that caused them.

Server IP is shown only when Chrome exposes it.

Some response headers may not be exposed in every situation.

v1 tracks top-level navigation only.
```

---

# 93. P0 — обязательный MVP

Без этого задача не считается завершенной:

```text
Manifest V3
React 19
Vite 8
JavaScript
Light popup

webRequest
webNavigation
HTTP/HTTPS host permissions
main_frame-only tracking

200
301
302
303
307
308
4xx
5xx

onBeforeRedirect chain
final response
network errors

response headers
Location
Server
Cache-Control
Content-Type
X-Robots-Tag
security headers
all headers

server IP when available
fromCache

per-tab state
storage.session
tab cleanup
service-worker resilience

Meta Refresh detector
client_redirect detection
client evidence deduplication

redirect loop warning
long-chain warning
HTTP→HTTPS
HTTPS→HTTP warning
cross-domain info
query change/drop info

toolbar badge
action title

Popup:
Path
Headers
Issues

Summary
Redirect cards
Final response
Client redirect cards
Header groups
Issues

Copy URL
Copy Redirect Chain
Copy Full Report

Reload & Trace
Refresh Data

Loading
Empty states
Errors

Automated tests
Local test server
Production build
ZIP
README
Store description/privacy/permissions
```

---

# 94. P1

После стабильного P0:

```text
Export JSON
Header search
Issue filters
SPA navigation info
Response timing
More cache diagnostics
TLS/security details where supported
Optional sensitive-response-header view
Improved dynamic Meta Refresh detection
Configurable chain threshold
Custom badge settings
Context-menu copy
```

---

# 95. P2

Не реализовывать до стабильного P0/P1:

```text
Site-wide redirect crawler
Bulk URL checker
CSV import
Sitemap redirect audit
Broken-link crawler
Redirect map visualization
Historical monitoring
Scheduled checks
Cloud sync
Accounts
AI SEO advice
Remote APIs
```

---

# 96. Не делать в v1

```text
backend
Firebase
Supabase
database
accounts
analytics
telemetry
AI
LLM
remote code
webRequestBlocking
request modification
redirect blocking
subresource traffic logging
persistent browsing history
request cookies
Authorization header collection
```

---

# 97. Definition of Done

Готово только если:

1. Extension ставится через Load unpacked.
2. Service worker отслеживает navigation до открытия popup.
3. Per-tab state изолирован.
4. 301 chain работает.
5. 302 chain работает.
6. 303 работает.
7. 307 работает.
8. 308 работает.
9. Multi-step chain работает.
10. Final 200 работает.
11. 404 отображается.
12. 5xx отображаются.
13. Network errors отображаются.
14. Redirect loop определяется.
15. Meta Refresh определяется.
16. `client_redirect` определяется.
17. Duplicate evidence не создает duplicate steps.
18. Response headers отображаются.
19. Location отображается.
20. Server отображается.
21. Cache headers отображаются.
22. X-Robots-Tag отображается.
23. Security headers отображаются.
24. IP отображается, когда доступен.
25. fromCache работает.
26. Badge работает.
27. Path работает.
28. Headers работает.
29. Issues работает.
30. Copy chain работает.
31. Copy full report работает.
32. Reload & Trace работает.
33. Refresh Data работает.
34. storage.session используется для session state.
35. tab state удаляется после tab close.
36. persistent browsing history отсутствует.
37. request cookies/Auth не собираются.
38. tests проходят.
39. local test server покрывает основные cases.
40. build проходит.
41. ZIP создается.
42. README готов.
43. Store files готовы.
44. Backend отсутствует.
45. Analytics/tracking отсутствуют.

---

# 98. План выполнения AI Coding Agent

## Этап 1 — Scaffold

Создать:

```text
React
Vite
Manifest V3
popup.html
service worker
icons
```

Проверить Load unpacked.

## Этап 2 — webRequest tracker

Реализовать main-frame:

```text
onBeforeRequest
onBeforeRedirect
onResponseStarted
onCompleted
onErrorOccurred
```

Сначала добиться корректного:

```text
301 → 302 → 200
```

без сложного UI.

## Этап 3 — TabRedirectStore

Реализовать:

```text
storage.session
per-tab state
navigation reset
tab cleanup
```

## Этап 4 — Badge

Реализовать:

```text
301
404
500
CR
action title
```

## Этап 5 — webNavigation

Добавить:

```text
client_redirect
server_redirect qualifiers
```

Не ломать HTTP chain.

## Этап 6 — Meta Refresh

Реализовать:

```text
document_start content script
meta scan
MutationObserver
runtime message
```

## Этап 7 — Client redirect matching

Связать:

```text
meta evidence
webNavigation client_redirect
actual navigation
```

Убрать duplicates.

## Этап 8 — Headers / IP

Собирать:

```text
response headers
IP
fromCache
statusLine
```

## Этап 9 — Rules Engine

Реализовать SEO/technical rules.

## Этап 10 — Popup

Сделать:

```text
Path
Headers
Issues
```

## Этап 11 — Copy tools

```text
Copy URL
Copy Redirect Chain
Copy Full Report
```

## Этап 12 — Reload & Trace

Сделать:

```text
clear state
reload tab
capture fresh navigation
```

## Этап 13 — Error states

Проверить:

```text
no chain
protected page
network error
not captured
```

## Этап 14 — Test server

Создать dev-only local redirect server.

## Этап 15 — Tests

Покрыть chain/store/rules/headers/meta/badge/client dedupe.

## Этап 16 — Manual QA

Пройти checklist и несколько реальных сайтов.

## Этап 17 — Build

Запустить:

```bash
npm run lint
npm test
npm run build
npm run package
```

Исправить все ошибки.

## Этап 18 — Store preparation

Подготовить:

```text
README
store/description.md
store/privacy.md
store/permissions.md
release ZIP
```

---

# 99. Правила для AI Agent

Не делать fake data.

Не hard-code redirect chain.

Не копировать чужой source code.

Не копировать branding/UI/assets Redirect Path.

Не добавлять TypeScript.

Не добавлять backend.

Не добавлять remote scripts.

Не использовать webRequestBlocking.

Не модифицировать requests.

Не блокировать redirects.

Не логировать subresources в P0.

Не строить persistent history.

Не собирать request cookies.

Не собирать Authorization.

Не отправлять URLs наружу.

Не использовать fetch(currentUrl) как основной redirect tracker.

Не путать HTTP redirect и Meta Refresh.

Не писать `JavaScript redirect`, если известно только `client_redirect`.

---

# 100. Приоритеты

```text
1. Correct redirect chain
2. Privacy
3. Correct status/header capture
4. Per-tab isolation
5. MV3 service-worker reliability
6. Client redirect accuracy
7. SEO usefulness
8. Popup UX
9. Visual polish
```

---

# 101. Итоговый ожидаемый результат

AI Agent должен предоставить:

```text
1. Полный исходный код
2. Рабочий Chrome Extension
3. dist/
4. release/redirect-scan-v1.0.0.zip
5. README.md
6. Automated tests
7. Local redirect test server
8. store/description.md
9. store/privacy.md
10. store/permissions.md
11. Краткий отчет:
    - что реализовано;
    - как строится redirect chain;
    - как отслеживаются client redirects;
    - какие headers собираются;
    - как хранится per-tab state;
    - какие permissions используются;
    - browser limitations;
    - P1/P2 roadmap.
```

---

# 102. Финальная продуктовая формулировка

**Redirect Scan** — Chrome Extension для анализа HTTP navigation текущей страницы.

Он отслеживает:

```text
301
302
303
307
308
4xx
5xx
```

и строит реальный redirect path браузера.

Также показывает:

```text
Final HTTP status
Location
Response headers
Server
Caching headers
X-Robots-Tag
Security headers
Server IP when available
Cache state
Client-side redirect indicators
Meta Refresh
Network errors
SEO redirect warnings
```

Ключевой UX:

```text
Navigate normally
→ click Redirect Scan
→ see the redirect path immediately
```

Redirect Scan не изменяет network requests и не блокирует navigation.

Privacy:

> Redirect Scan processes top-level navigation locally in Chrome. Redirect chains, URLs, headers, IP addresses and browsing data are not uploaded to developer-owned servers.
