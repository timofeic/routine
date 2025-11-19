// Convert SVG icons to PNG
// Run with: node scripts/convert-icons.js

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, '..', 'public');

async function convertIcon(size) {
  const svgPath = path.join(publicDir, `icon-${size}.svg`);
  const pngPath = path.join(publicDir, `icon-${size}.png`);

  try {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(pngPath);

    console.log(`✅ Converted icon-${size}.svg to icon-${size}.png`);
  } catch (error) {
    console.error(`❌ Error converting icon-${size}:`, error.message);
  }
}

async function main() {
  console.log('Converting SVG icons to PNG...');
  await convertIcon(192);
  await convertIcon(512);
  console.log('✅ All icons converted successfully!');
}

main();

