// update-favicon.js
const fs = require('fs');
const path = require('path');

// Copy logo.png to favicon.ico in public folder
const logoPath = path.join(__dirname, 'src/assets/logo.png');
const faviconPath = path.join(__dirname, 'public/favicon.ico');

try {
  // If logo exists, copy it as favicon
  if (fs.existsSync(logoPath)) {
    fs.copyFileSync(logoPath, faviconPath);
    console.log('✅ Favicon updated with logo.png');
  } else {
    console.log('⚠️ logo.png not found in src/assets/');
  }
} catch (error) {
  console.error('❌ Error updating favicon:', error);
}