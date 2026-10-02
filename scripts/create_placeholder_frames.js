const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Utility to create uncompressed or deflated PNG in pure Node.js
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const checksum = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(checksum, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, drawFn) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image buffer: (1 byte filter + width * 4 bytes RGBA) per row
  const rowStride = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowStride);

  // Buffer accessor
  function setPixel(x, y, r, g, b, a) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const offset = y * rowStride + 1 + x * 4;
    rawData[offset] = r;
    rawData[offset + 1] = g;
    rawData[offset + 2] = b;
    rawData[offset + 3] = a;
  }

  drawFn(setPixel, width, height);

  const compressed = zlib.deflateSync(rawData, { level: 6 });
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdr, idat, iend]);
}

function drawFrame(type) {
  const W = 1024;
  const H = 1536;

  return createPng(W, H, (setPixel) => {
    // Fill with rich dark navy / slate
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        // Outer dark gradient
        const isBorder = (x < 28 || x >= W - 28 || y < 28 || y >= H - 28);
        const isInnerGold = (
          (x >= 32 && x <= 40 && y >= 32 && y <= H - 32) ||
          (x >= W - 40 && x <= W - 32 && y >= 32 && y <= H - 32) ||
          (y >= 32 && y <= 40 && x >= 32 && x <= W - 32) ||
          (y >= H - 40 && y <= H - 32 && x >= 32 && x <= W - 32)
        );

        if (isInnerGold) {
          // Gold accent
          setPixel(x, y, 212, 175, 55, 255);
        } else if (isBorder) {
          setPixel(x, y, 15, 20, 30, 255);
        } else {
          // Central background
          setPixel(x, y, 22, 28, 42, 255);
        }
      }
    }

    // Window slot outlines
    function drawRect(rx, ry, rw, rh, r, g, b, a, thickness = 4) {
      const x1 = Math.round(rx * W / 100);
      const y1 = Math.round(ry * H / 100);
      const x2 = Math.round((rx + rw) * W / 100);
      const y2 = Math.round((ry + rh) * H / 100);

      for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
          const isEdge = (x < x1 + thickness || x > x2 - thickness || y < y1 + thickness || y > y2 - thickness);
          if (isEdge) {
            setPixel(x, y, r, g, b, a);
          } else {
            // Semi-translucent panel background
            setPixel(x, y, 12, 16, 24, 230);
          }
        }
      }
    }

    // Art window (center)
    drawRect(7.0, 9.1, 86.2, 72.8, 180, 150, 60, 255, 6);

    // Name slot
    if (type === 'arcano') {
      drawRect(7.6, 2.7, 85.0, 5.7, 212, 175, 55, 255, 4);
    } else {
      drawRect(20.0, 2.7, 75.2, 5.7, 212, 175, 55, 255, 4);
      // Cost medallion
      drawRect(3.8, 2.1, 12.9, 8.6, 240, 195, 60, 255, 5);
    }

    // Effect slot
    drawRect(7.6, 83.0, 85.0, 12.7, 212, 175, 55, 255, 4);

    // ATK / DEF badge for monster
    if (type === 'monster') {
      drawRect(67.4, 92.3, 23.4, 2.9, 255, 215, 0, 255, 3);
    }
  });
}

const framesDir = path.join(__dirname, '..', 'public', 'frames');
if (!fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir, { recursive: true });
}

['monster', 'general', 'arcano'].forEach((type) => {
  const filePath = path.join(framesDir, `${type}.png`);
  if (!fs.existsSync(filePath)) {
    console.log(`Generating placeholder frame for ${type}...`);
    const png = drawFrame(type);
    fs.writeFileSync(filePath, png);
    console.log(`Created ${filePath} (${(png.length / 1024).toFixed(1)} KB)`);
  }
});
console.log('All placeholder frames ready.');
