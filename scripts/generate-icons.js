import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(size) {
  const width = size;
  const height = size;
  const scale = size / 32.0;

  const rawData = [];

  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter: none
    const py = y / scale;

    for (let x = 0; x < width; x++) {
      const px = x / scale;

      // Squircle bounds: x in [2, 30], y in [2, 30], rx=7
      const cornerR = 7.0;
      let inBox = false;

      if (px >= 2.0 && px <= 30.0 && py >= 2.0 && py <= 30.0) {
        const left = 2.0 + cornerR;
        const right = 30.0 - cornerR;
        const top = 2.0 + cornerR;
        const bottom = 30.0 - cornerR;

        if (px >= left && px <= right) inBox = true;
        else if (py >= top && py <= bottom) inBox = true;
        else {
          const cx = px < left ? left : right;
          const cy = py < top ? top : bottom;
          const distSq = (px - cx) * (px - cx) + (py - cy) * (py - cy);
          if (distSq <= cornerR * cornerR) inBox = true;
        }
      }

      if (inBox) {
        const t = (px + py) / 60.0;
        const r = Math.round(37 * (1 - t) + 2 * t);
        const g = Math.round(99 * (1 - t) + 132 * t);
        const b = Math.round(235 * (1 - t) + 199 * t);

        // Arrow path
        const inVert = Math.abs(px - 9.0) <= 1.4 && py >= 15.5 && py <= 22.5;
        const arcDist = Math.sqrt((px - 16.0) * (px - 16.0) + (py - 16.0) * (py - 16.0));
        const inArc = Math.abs(arcDist - 7.0) <= 1.4 && px <= 16.5 && py <= 16.5;
        const inHoriz = Math.abs(py - 9.0) <= 1.4 && px >= 15.5 && px <= 23.5;

        const d1 = distToSegment(px, py, 20.0, 5.5, 24.0, 9.0);
        const d2 = distToSegment(px, py, 20.0, 12.5, 24.0, 9.0);
        const inHead = (d1 <= 1.4 || d2 <= 1.4);

        // Radar
        const dotDist = Math.sqrt((px - 23.0) * (px - 23.0) + (py - 23.0) * (py - 23.0));
        const inDot = dotDist <= 2.2;
        const inRing1 = Math.abs(dotDist - 5.0) <= 0.8 && px >= 16.0 && py >= 16.0;
        const inRing2 = Math.abs(dotDist - 9.0) <= 0.8 && px >= 14.0 && py >= 14.0;

        if (inVert || inArc || inHoriz || inHead) {
          rawData.push(255, 255, 255, 255);
        } else if (inDot) {
          rawData.push(56, 189, 248, 255);
        } else if (inRing1 || inRing2) {
          rawData.push(Math.min(255, r + 70), Math.min(255, g + 70), Math.min(255, b + 50), 255);
        } else {
          rawData.push(r, g, b, 255);
        }
      } else {
        rawData.push(0, 0, 0, 0);
      }
    }
  }

  function makeChunk(tag, dataBuf) {
    const len = dataBuf.length;
    const tagBuf = Buffer.from(tag, 'ascii');
    const toCrc = Buffer.concat([tagBuf, dataBuf]);
    const crcVal = crc32(toCrc);

    const chunk = Buffer.alloc(4 + 4 + len + 4);
    chunk.writeUInt32BE(len, 0);
    tagBuf.copy(chunk, 4);
    dataBuf.copy(chunk, 8);
    chunk.writeUInt32BE(crcVal, 8 + len);
    return chunk;
  }

  const signature = Buffer.from([137, 80, 78, 72, 13, 10, 26, 10]);

  const ihdrBuf = Buffer.alloc(13);
  ihdrBuf.writeUInt32BE(width, 0);
  ihdrBuf.writeUInt32BE(height, 4);
  ihdrBuf[8] = 8; // bit depth
  ihdrBuf[9] = 6; // RGBA
  ihdrBuf[10] = 0;
  ihdrBuf[11] = 0;
  ihdrBuf[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrBuf);

  const compressed = zlib.deflateSync(Buffer.from(rawData), { level: 9 });
  const idat = makeChunk('IDAT', compressed);

  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
}

// Standard CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

const sizes = [16, 32, 48, 128];
const iconsDir = path.resolve(process.cwd(), 'public/icons');
fs.mkdirSync(iconsDir, { recursive: true });

for (const size of sizes) {
  const pngBuf = createPNG(size);
  const outPath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(outPath, pngBuf);
  console.log(`Generated valid PNG icon: ${outPath} (${size}x${size})`);
}
