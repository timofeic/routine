// Simple script to create app icons
// Run with: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// Create SVG icons that can be converted to PNG
const createIcon = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#a78bfa;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f472b6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".35em" font-size="${size * 0.5}" font-family="Arial, sans-serif">
    ✅
  </text>
</svg>`;
};

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate SVG files (these can be used as-is or converted to PNG)
fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), createIcon(192));
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), createIcon(512));

console.log('✅ Icons generated successfully!');
console.log('📝 SVG icons created at public/icon-192.svg and public/icon-512.svg');
console.log('');
console.log('To convert to PNG (if needed):');
console.log('1. Open each SVG in a browser');
console.log('2. Take a screenshot or use an online converter');
console.log('3. Or install sharp: npm install sharp');
console.log('');
console.log('For now, Next.js will serve the SVG files as fallbacks.');

