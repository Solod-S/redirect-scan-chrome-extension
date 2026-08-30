import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateBanner() {
  const width = 1400;
  const height = 560;

  const assetsDir = path.resolve(process.cwd(), 'store/assets');
  fs.mkdirSync(assetsDir, { recursive: true });

  const screenshotPath = path.resolve(process.cwd(), 'assets/screenshots/screenshot-overview.png');
  let screenshotBuf;

  if (fs.existsSync(screenshotPath)) {
    screenshotBuf = await sharp(screenshotPath)
      .resize({
        width: 700,
        height: 480,
        fit: 'cover',
        position: 'top'
      })
      .toBuffer();
  }

  let screenshotBase64 = '';
  if (screenshotBuf) {
    const roundedScreenshot = await sharp(screenshotBuf)
      .composite([{
        input: Buffer.from(`
          <svg width="700" height="480">
            <rect x="0" y="0" width="700" height="480" rx="12" ry="12" fill="#fff"/>
          </svg>
        `),
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();
    screenshotBase64 = `data:image/png;base64,${roundedScreenshot.toString('base64')}`;
  }

  // Pure SVG vector icons for 100% reliable rendering without font dependencies
  const checkIcon = `
    <g transform="translate(14, 18)">
      <path d="M 0 6.5 L 4.5 11 L 12 1.5" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  `;

  const boltIcon = `
    <g transform="translate(16, 9)">
      <path d="M 6 0 L 0 7.5 L 5 7.5 L 4 14 L 11 5.5 L 6 5.5 Z" fill="#38BDF8"/>
    </g>
  `;

  const lockIcon = `
    <g transform="translate(0, -11)">
      <rect x="1" y="5" width="12" height="9" rx="2" fill="#38BDF8"/>
      <path d="M 4 5 V 3.5 C 4 1.8 5.3 0.5 7 0.5 C 8.7 0.5 10 1.8 10 3.5 V 5" fill="none" stroke="#38BDF8" stroke-width="1.6"/>
      <circle cx="7" cy="9" r="1.2" fill="#080E1D"/>
    </g>
  `;

  const svgContent = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Background Gradient -->
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#070c18" />
        <stop offset="50%" stop-color="#0b1329" />
        <stop offset="100%" stop-color="#080e1d" />
      </linearGradient>

      <!-- Glow radial gradients -->
      <radialGradient id="glowLeft" cx="20%" cy="30%" r="60%">
        <stop offset="0%" stop-color="#1d4ed8" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="glowRight" cx="80%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#0284c7" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#0284c7" stop-opacity="0" />
      </radialGradient>

      <!-- Grid Pattern -->
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1" />
      </pattern>

      <!-- Card Background Gradient -->
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(30, 41, 59, 0.85)" />
        <stop offset="100%" stop-color="rgba(15, 23, 42, 0.7)" />
      </linearGradient>

      <!-- Drop Shadow Filter for Floating Mockup -->
      <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.65" />
      </filter>
    </defs>

    <!-- Base Background -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
    <rect width="${width}" height="${height}" fill="url(#glowLeft)" />
    <rect width="${width}" height="${height}" fill="url(#glowRight)" />
    <rect width="${width}" height="${height}" fill="url(#grid)" />

    <!-- Left Content Column -->
    <g transform="translate(60, 48)">
      <!-- Top Pill Tag -->
      <g>
        <rect x="0" y="0" width="280" height="34" rx="17" fill="rgba(37, 99, 235, 0.2)" stroke="#2563eb" stroke-width="1.2" />
        ${boltIcon}
        <text x="36" y="21.5" font-family="Arial, Helvetica, sans-serif" font-size="11.5" font-weight="bold" fill="#38bdf8" letter-spacing="0.5">100% IN-BROWSER REDIRECT AUDIT</text>
      </g>

      <!-- Main Title -->
      <text x="0" y="88" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="bold" fill="#ffffff" letter-spacing="-0.5">Redirect Scan</text>

      <!-- Subtitle -->
      <text x="0" y="122" font-family="Arial, Helvetica, sans-serif" font-size="15" fill="#94a3b8">HTTP Redirect &amp; Header Checker for Google Chrome</text>

      <!-- Feature Cards Grid (2 columns x 3 rows) -->
      <g transform="translate(0, 152)">
        <!-- Col 1, Row 1 -->
        <g transform="translate(0, 0)">
          <rect width="265" height="52" rx="8" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
          ${checkIcon}
          <text x="36" y="32" font-family="Arial, Helvetica, sans-serif" font-size="12.5" font-weight="bold" fill="#f1f5f9">
            301, 302, 307 &amp; 308 Chains
          </text>
        </g>

        <!-- Col 2, Row 1 -->
        <g transform="translate(280, 0)">
          <rect width="265" height="52" rx="8" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
          ${checkIcon}
          <text x="36" y="32" font-family="Arial, Helvetica, sans-serif" font-size="12.5" font-weight="bold" fill="#f1f5f9">
            Response Headers &amp; Security
          </text>
        </g>

        <!-- Col 1, Row 2 -->
        <g transform="translate(0, 64)">
          <rect width="265" height="52" rx="8" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
          ${checkIcon}
          <text x="36" y="32" font-family="Arial, Helvetica, sans-serif" font-size="12.5" font-weight="bold" fill="#f1f5f9">
            Meta Refresh &amp; Client Redirects
          </text>
        </g>

        <!-- Col 2, Row 2 -->
        <g transform="translate(280, 64)">
          <rect width="265" height="52" rx="8" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
          ${checkIcon}
          <text x="36" y="32" font-family="Arial, Helvetica, sans-serif" font-size="12.5" font-weight="bold" fill="#f1f5f9">
            Server IP &amp; Cache Diagnostics
          </text>
        </g>

        <!-- Col 1, Row 3 -->
        <g transform="translate(0, 128)">
          <rect width="265" height="52" rx="8" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
          ${checkIcon}
          <text x="36" y="32" font-family="Arial, Helvetica, sans-serif" font-size="12.5" font-weight="bold" fill="#f1f5f9">
            SEO Warnings &amp; Loop Alerts
          </text>
        </g>

        <!-- Col 2, Row 3 -->
        <g transform="translate(280, 128)">
          <rect width="265" height="52" rx="8" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
          ${checkIcon}
          <text x="36" y="32" font-family="Arial, Helvetica, sans-serif" font-size="12.5" font-weight="bold" fill="#f1f5f9">
            One-Click Full Report Export
          </text>
        </g>
      </g>

      <!-- Bottom Privacy Callout -->
      <g transform="translate(0, 420)">
        ${lockIcon}
        <text x="20" y="0" font-family="Arial, Helvetica, sans-serif" font-size="12.5" font-weight="bold" fill="#38bdf8" letter-spacing="0.2">
          Zero Servers  |  Zero Tracking  |  100% Client-Side Privacy
        </text>
      </g>
    </g>

    <!-- Right Column: Browser & Extension Mockup -->
    <g transform="translate(650, 40)" filter="url(#shadow)">
      ${screenshotBase64 ? `
        <image href="${screenshotBase64}" x="0" y="0" width="700" height="480" preserveAspectRatio="xMidYMid slice" />
        <rect x="0" y="0" width="700" height="480" rx="12" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
      ` : ''}
    </g>
  </svg>
  `;

  const outPath = path.join(assetsDir, 'promo_marquee_1400x560.png');
  await sharp(Buffer.from(svgContent))
    .png({ quality: 100 })
    .toFile(outPath);

  console.log(`Generated marquee promo banner: ${outPath} (1400x560)`);
}

generateBanner().catch(err => {
  console.error('Error generating banner:', err);
  process.exit(1);
});
