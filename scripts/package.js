import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const releaseDir = path.join(rootDir, 'release');

// 1. Generate icons & promo banner
console.log('🎨 Generating icons and promo assets...');
execSync('python3 scripts/generate_icons.py', { stdio: 'inherit' });
execSync('node scripts/generate-banner.js', { stdio: 'inherit' });

// 2. Build dist
console.log('📦 Building production bundle...');
execSync('npm run build', { stdio: 'inherit' });

// 3. Ensure release directory exists
fs.mkdirSync(releaseDir, { recursive: true });

// Read version from package.json
const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const zipFileName = `redirect-scan-v${pkg.version}.zip`;
const zipPath = path.join(releaseDir, zipFileName);

const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', {
  zlib: { level: 9 }
});

output.on('close', () => {
  console.log(`\n🎉 Package created successfully!`);
  console.log(`📁 File: ${zipPath}`);
  console.log(`📊 Size: ${(archive.pointer() / 1024).toFixed(2)} KB`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(distDir, false);
archive.finalize();
