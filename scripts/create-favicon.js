// Create a proper favicon
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const createFaviconSVG = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#a78bfa;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f472b6;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="32" height="32" rx="6" fill="url(#grad)"/>

  <!-- Circle for check -->
  <circle cx="16" cy="16" r="10" fill="white" opacity="0.95"/>

  <!-- Checkmark -->
  <path d="M 12 16 L 14.5 18.5 L 20 13"
        stroke="#8b5cf6"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"/>
</svg>`;
};

const publicDir = path.join(__dirname, '..', 'public');
const appDir = path.join(__dirname, '..', 'app');

async function createFavicon() {
  console.log('Creating favicon...');

  const svgContent = createFaviconSVG();

  try {
    // Create ICO file (32x32)
    await sharp(Buffer.from(svgContent))
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));

    console.log('✅ Created favicon-32x32.png');

    // Create 16x16 favicon
    await sharp(Buffer.from(svgContent))
      .resize(16, 16)
      .png()
      .toFile(path.join(publicDir, 'favicon-16x16.png'));

    console.log('✅ Created favicon-16x16.png');

    // Create a larger favicon for high-DPI displays
    await sharp(Buffer.from(svgContent))
      .resize(48, 48)
      .png()
      .toFile(path.join(publicDir, 'favicon-48x48.png'));

    console.log('✅ Created favicon-48x48.png');

    // Create SVG favicon (modern browsers)
    fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
    console.log('✅ Created favicon.svg');

    console.log('\n🎉 Favicons created successfully!');

  } catch (error) {
    console.error('❌ Error creating favicons:', error);
  }
}

createFavicon();

