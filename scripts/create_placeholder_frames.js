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
    // Fill background with rich dark fantasy navy
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const isBorderOuter = (x < 18 || x >= W - 18 || y < 18 || y >= H - 18);
        const isOuterGold = (
          (x >= 22 && x <= 26 && y >= 22 && y <= H - 22) ||
          (x >= W - 26 && x <= W - 22 && y >= 22 && y <= H - 22) ||
          (y >= 22 && y <= 26 && x >= 22 && x <= W - 22) ||
          (y >= H - 26 && y <= H - 22 && x >= 22 && x <= W - 22)
        );

        if (isOuterGold) {
          // Double golden fillet border
          setPixel(x, y, 218, 175, 55, 255);
        } else if (isBorderOuter) {
          // Deep dark rim
          setPixel(x, y, 10, 14, 20, 255);
        } else {
          // Dark textured slate background
          setPixel(x, y, 15, 20, 28, 255);
        }
      }
    }

    // Window slot helper: draws golden ornamental border and fills panel background
    function drawSlotBox(rx, ry, rw, rh, fillAlpha = 220, borderThickness = 4) {
      const x1 = Math.round(rx * W / 100);
      const y1 = Math.round(ry * H / 100);
      const x2 = Math.round((rx + rw) * W / 100);
      const y2 = Math.round((ry + rh) * H / 100);

      for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
          const isEdge = (x < x1 + borderThickness || x > x2 - borderThickness || y < y1 + borderThickness || y > y2 - borderThickness);
          if (isEdge) {
            // Elegant gold border
            setPixel(x, y, 212, 175, 55, 255);
          } else if (fillAlpha > 0) {
            // Deep dark transparent panel
            setPixel(x, y, 12, 16, 24, fillAlpha);
          } else {
            // Completely transparent (for art window)
            setPixel(x, y, 0, 0, 0, 0);
          }
        }
      }
    }

    // 1. Art window (center): fillAlpha = 0 (TRANSPARENT so card art shines through!)
    drawSlotBox(4.8, 9.2, 90.4, 70.8, 0, 5);

    // 2. Name slot and Cost medallion
    if (type === 'arcano') {
      // Arcano: Full width name slot
      drawSlotBox(4.8, 2.2, 90.4, 6.2, 230, 4);
    } else {
      // Cost medallion
      drawSlotBox(4.8, 2.2, 11.5, 6.2, 235, 4);
      // Name bar
      drawSlotBox(17.5, 2.2, 77.7, 6.2, 230, 4);
    }

    // 3. Wide Effect slot (consistent 90.4% width!)
    drawSlotBox(4.8, 81.0, 90.4, 15.6, 235, 4);
  });
}

const framesDir = path.join(__dirname, '..', 'public', 'frames');
if (!fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir, { recursive: true });
}

['monster', 'general', 'arcano'].forEach((type) => {
  const filePath = path.join(framesDir, `${type}.png`);
  console.log(`Generating placeholder frame for ${type}...`);
  const png = drawFrame(type);
  fs.writeFileSync(filePath, png);
  console.log(`Created ${filePath} (${(png.length / 1024).toFixed(1)} KB)`);
});
console.log('All placeholder frames regenerated successfully.');
