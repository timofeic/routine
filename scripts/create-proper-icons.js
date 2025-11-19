// Create proper app icons with SVG graphics
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const createIconSVG = (size) => {
  const checkSize = size * 0.4;
  const strokeWidth = size * 0.08;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#a78bfa;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f472b6;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background with rounded corners -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>

  <!-- Circle background for check -->
  <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.32}" fill="white" opacity="0.95"/>

  <!-- Checkmark -->
  <path d="M ${size * 0.35} ${size * 0.5} L ${size * 0.45} ${size * 0.6} L ${size * 0.65} ${size * 0.38}"
        stroke="#8b5cf6"
        stroke-width="${strokeWidth}"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"/>

  <!-- Small stars/sparkles for fun -->
  <circle cx="${size * 0.25}" cy="${size * 0.25}" r="${size * 0.04}" fill="white" opacity="0.9"/>
  <circle cx="${size * 0.75}" cy="${size * 0.25}" r="${size * 0.04}" fill="white" opacity="0.9"/>
  <circle cx="${size * 0.25}" cy="${size * 0.75}" r="${size * 0.04}" fill="white" opacity="0.9"/>
  <circle cx="${size * 0.75}" cy="${size * 0.75}" r="${size * 0.04}" fill="white" opacity="0.9"/>
</svg>`;
};

const publicDir = path.join(__dirname, '..', 'public');

async function createIcons() {
  console.log('Creating proper app icons...');

  // Create SVG files
  const svg192 = createIconSVG(192);
  const svg512 = createIconSVG(512);

  fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), svg192);
  fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), svg512);

  console.log('✅ Created SVG icons');

  // Convert to PNG
  try {
    await sharp(Buffer.from(svg192))
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));

    console.log('✅ Created icon-192.png');

    await sharp(Buffer.from(svg512))
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));

    console.log('✅ Created icon-512.png');

    // Also create apple-touch-icon
    await sharp(Buffer.from(svg192))
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));

    console.log('✅ Created apple-touch-icon.png');

    console.log('\n🎉 All icons created successfully!');
    console.log('The icons feature a gradient background with a checkmark.');

  } catch (error) {
    console.error('❌ Error creating icons:', error);
  }
}

createIcons();

