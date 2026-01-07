const fs = require('fs');
const path = require('path');

// Function to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy PNG files from src/utils to dist/utils
const utilsSrc = path.join(__dirname, '../src/utils');
const utilsDest = path.join(__dirname, '../dist/utils');
if (fs.existsSync(utilsSrc)) {
  const pngFiles = fs.readdirSync(utilsSrc).filter(file => file.endsWith('.png'));
  if (pngFiles.length > 0) {
    if (!fs.existsSync(utilsDest)) {
      fs.mkdirSync(utilsDest, { recursive: true });
    }
    pngFiles.forEach(file => {
      fs.copyFileSync(
        path.join(utilsSrc, file),
        path.join(utilsDest, file)
      );
    });
  }
}

// Copy templates directory
const templatesSrc = path.join(__dirname, '../src/templates');
const templatesDest = path.join(__dirname, '../dist/templates');
if (fs.existsSync(templatesSrc)) {
  copyDir(templatesSrc, templatesDest);
}

console.log('Assets copied successfully!');

