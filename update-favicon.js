// update-favicon.js - Fixed version
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const logoPath = path.join(__dirname, 'src/assets/logo.png');
const faviconPath = path.join(__dirname, 'public/favicon.ico');

console.log('🔄 Updating favicon from logo.png...');

try {
  // Check if logo exists
  if (!fs.existsSync(logoPath)) {
    console.log('❌ logo.png not found in src/assets/');
    console.log('📁 Looking in src/assets/ directory:');
    
    const assetsDir = path.join(__dirname, 'src/assets');
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      console.log('Files found:', files);
    }
    return;
  }

  console.log('✅ Found logo.png at:', logoPath);
  
  // Method 1: Try using ImageMagick (if installed)
  try {
    // Check if ImageMagick is installed
    execSync('convert --version', { stdio: 'ignore' });
    
    // Convert PNG to ICO using ImageMagick
    execSync(`convert "${logoPath}" -resize 64x64 -background none "${faviconPath}"`);
    console.log('✅ Converted logo.png to favicon.ico using ImageMagick');
    
  } catch (magickError) {
    console.log('⚠️ ImageMagick not found, using alternative method...');
    
    // Method 2: Use a simple Node.js ICO creation
    createSimpleIco();
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('💡 Try installing ImageMagick:');
  console.log('   Windows: Download from https://imagemagick.org/');
  console.log('   Mac: brew install imagemagick');
  console.log('   Ubuntu: sudo apt-get install imagemagick');
}

// Fallback function to create ICO
function createSimpleIco() {
  try {
    // For now, just copy and rename (some browsers accept PNG as ICO)
    fs.copyFileSync(logoPath, faviconPath);
    console.log('✅ Copied logo.png to favicon.ico');
    console.log('   Note: This is a PNG file renamed to .ico');
    console.log('   For proper ICO format, install ImageMagick');
    
    // Also create a PNG version for better compatibility
    const pngPath = path.join(__dirname, 'public/favicon.png');
    fs.copyFileSync(logoPath, pngPath);
    console.log('✅ Also created favicon.png');
    
  } catch (copyError) {
    console.error('❌ Failed to copy file:', copyError.message);
  }
}