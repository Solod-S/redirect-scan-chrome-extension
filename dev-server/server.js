import http from 'http';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  console.log(`[Test Server] ${req.method} ${pathname}`);

  switch (pathname) {
    case '/': {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Redirect Scan - Test Server</title>
          <style>
            body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 40px auto; line-height: 1.6; padding: 0 20px; }
            h1 { color: #1e3a8a; }
            h2 { color: #374151; margin-top: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
            ul { list-style: none; padding: 0; }
            li { margin: 8px 0; }
            a { color: #2563eb; text-decoration: none; font-weight: 500; }
            a:hover { text-decoration: underline; }
            .tag { font-size: 11px; padding: 2px 6px; border-radius: 4px; background: #e5e7eb; margin-left: 6px; }
            .tag-3xx { background: #fef3c7; color: #92400e; }
            .tag-4xx { background: #fee2e2; color: #991b1b; }
            .tag-5xx { background: #fecaca; color: #7f1d1d; }
          </style>
        </head>
        <body>
          <h1>Redirect Scan Local Test Server</h1>
          <p>Click any link below to test redirect tracking in Chrome:</p>

          <h2>HTTP Redirects (3xx)</h2>
          <ul>
            <li><a href="/301-to-200">/301-to-200</a> <span class="tag tag-3xx">301 Moved Permanently</span></li>
            <li><a href="/302-to-200">/302-to-200</a> <span class="tag tag-3xx">302 Found</span></li>
            <li><a href="/301-302-200">/301-302-200</a> <span class="tag tag-3xx">Multi-hop (301 → 302 → 200)</span></li>
            <li><a href="/303">/303</a> <span class="tag tag-3xx">303 See Other</span></li>
            <li><a href="/307">/307</a> <span class="tag tag-3xx">307 Temporary Redirect</span></li>
            <li><a href="/308">/308</a> <span class="tag tag-3xx">308 Permanent Redirect</span></li>
          </ul>

          <h2>Direct Status Codes (2xx, 4xx, 5xx)</h2>
          <ul>
            <li><a href="/200">/200</a> <span class="tag">200 OK</span></li>
            <li><a href="/404">/404</a> <span class="tag tag-4xx">404 Not Found</span></li>
            <li><a href="/410">/410</a> <span class="tag tag-4xx">410 Gone</span></li>
            <li><a href="/429">/429</a> <span class="tag tag-4xx">429 Too Many Requests</span></li>
            <li><a href="/500">/500</a> <span class="tag tag-5xx">500 Internal Server Error</span></li>
            <li><a href="/502">/502</a> <span class="tag tag-5xx">502 Bad Gateway</span></li>
            <li><a href="/503">/503</a> <span class="tag tag-5xx">503 Service Unavailable</span></li>
            <li><a href="/504">/504</a> <span class="tag tag-5xx">504 Gateway Timeout</span></li>
          </ul>

          <h2>Client-side Redirects</h2>
          <ul>
            <li><a href="/meta-refresh">/meta-refresh</a> <span class="tag">Meta Refresh (0s)</span></li>
            <li><a href="/js-redirect">/js-redirect</a> <span class="tag">JavaScript client navigation</span></li>
          </ul>

          <h2>Loops & Headers</h2>
          <ul>
            <li><a href="/redirect-loop-a">/redirect-loop-a</a> <span class="tag tag-4xx">Redirect Loop (A ↔ B)</span></li>
            <li><a href="/headers">/headers</a> <span class="tag">Rich Security & Cache Headers</span></li>
          </ul>
        </body>
        </html>
      `);
      break;
    }

    case '/200': {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Server': 'Node-Test-Server/1.0',
        'Cache-Control': 'public, max-age=3600',
        'X-Robots-Tag': 'index, follow',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff'
      });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>200 OK</title></head>
        <body style="font-family: sans-serif; padding: 40px;">
          <h1>200 OK</h1>
          <p>Destination reached successfully.</p>
          <a href="/">Back to Index</a>
        </body>
        </html>
      `);
      break;
    }

    case '/301-to-200': {
      res.writeHead(301, {
        'Location': '/200',
        'Server': 'Node-Test-Server/1.0',
        'Cache-Control': 'public, max-age=86400',
        'X-Redirect-By': 'TestServer'
      });
      res.end();
      break;
    }

    case '/302-to-200': {
      res.writeHead(302, {
        'Location': '/200',
        'Server': 'Node-Test-Server/1.0',
        'Cache-Control': 'no-cache'
      });
      res.end();
      break;
    }

    case '/301-302-200': {
      res.writeHead(301, {
        'Location': '/302-to-200',
        'Server': 'Node-Test-Server/1.0'
      });
      res.end();
      break;
    }

    case '/303': {
      res.writeHead(303, { 'Location': '/200', 'Server': 'Node-Test-Server/1.0' });
      res.end();
      break;
    }

    case '/307': {
      res.writeHead(307, { 'Location': '/200', 'Server': 'Node-Test-Server/1.0' });
      res.end();
      break;
    }

    case '/308': {
      res.writeHead(308, { 'Location': '/200', 'Server': 'Node-Test-Server/1.0' });
      res.end();
      break;
    }

    case '/404': {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Server': 'Node-Test-Server/1.0' });
      res.end('<h1>404 Not Found</h1>');
      break;
    }

    case '/410': {
      res.writeHead(410, { 'Content-Type': 'text/html; charset=utf-8', 'Server': 'Node-Test-Server/1.0' });
      res.end('<h1>410 Gone</h1>');
      break;
    }

    case '/429': {
      res.writeHead(429, { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '60', 'Server': 'Node-Test-Server/1.0' });
      res.end('<h1>429 Too Many Requests</h1>');
      break;
    }

    case '/500': {
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8', 'Server': 'Node-Test-Server/1.0' });
      res.end('<h1>500 Internal Server Error</h1>');
      break;
    }

    case '/502': {
      res.writeHead(502, { 'Content-Type': 'text/html; charset=utf-8', 'Server': 'Node-Test-Server/1.0' });
      res.end('<h1>502 Bad Gateway</h1>');
      break;
    }

    case '/503': {
      res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8', 'Server': 'Node-Test-Server/1.0' });
      res.end('<h1>503 Service Unavailable</h1>');
      break;
    }

    case '/504': {
      res.writeHead(504, { 'Content-Type': 'text/html; charset=utf-8', 'Server': 'Node-Test-Server/1.0' });
      res.end('<h1>504 Gateway Timeout</h1>');
      break;
    }

    case '/meta-refresh': {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Server': 'Node-Test-Server/1.0' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta http-equiv="refresh" content="0; url=/200">
          <title>Meta Refresh Page</title>
        </head>
        <body style="font-family: sans-serif; padding: 40px;">
          <h1>Meta Refreshing to /200...</h1>
          <p>If not redirected automatically, <a href="/200">click here</a>.</p>
        </body>
        </html>
      `);
      break;
    }

    case '/js-redirect': {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Server': 'Node-Test-Server/1.0' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>JavaScript Redirect Page</title>
        </head>
        <body style="font-family: sans-serif; padding: 40px;">
          <h1>Redirecting via JavaScript...</h1>
          <script>
            setTimeout(() => {
              window.location.href = '/200';
            }, 100);
          </script>
        </body>
        </html>
      `);
      break;
    }

    case '/redirect-loop-a': {
      res.writeHead(302, { 'Location': '/redirect-loop-b', 'Server': 'Node-Test-Server/1.0' });
      res.end();
      break;
    }

    case '/redirect-loop-b': {
      res.writeHead(302, { 'Location': '/redirect-loop-a', 'Server': 'Node-Test-Server/1.0' });
      res.end();
      break;
    }

    case '/headers': {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Server': 'Nginx-Test-Gateway/1.24',
        'Via': '1.1 varnish, 1.1 google',
        'X-Powered-By': 'Next.js / Node.js',
        'Cache-Control': 'public, max-age=7200, stale-while-revalidate=86400',
        'Expires': new Date(Date.now() + 7200000).toUTCString(),
        'ETag': '"abcdef123456789"',
        'Last-Modified': new Date(Date.now() - 86400000).toUTCString(),
        'Vary': 'Accept-Encoding, User-Agent',
        'Age': '42',
        'CF-Cache-Status': 'HIT',
        'X-Cache': 'HIT',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'Link': '<https://example.com/canonical>; rel="canonical"',
        'Content-Language': 'en-US',
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      });
      res.end('<h1>Headers Demonstration Page</h1><a href="/">Back</a>');
      break;
    }

    default: {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      break;
    }
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Redirect Scan Local Test Server running on http://localhost:${PORT}`);
  console.log(`Available routes:`);
  console.log(`  - 3xx redirects: /301-to-200, /302-to-200, /301-302-200, /303, /307, /308`);
  console.log(`  - Direct statuses: /200, /404, /410, /429, /500, /502, /503, /504`);
  console.log(`  - Client redirects: /meta-refresh, /js-redirect`);
  console.log(`  - Loops & diagnostics: /redirect-loop-a, /headers\n`);
});
