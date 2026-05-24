const fs = require('fs');
const path = require('path');

const fixDestructuring = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let text = fs.readFileSync(filePath, 'utf8');

  // Regex to fix `sourceImage || undefined, referenceImage || undefined,` inside default props/state destructuring
  text = text.replace(/floorPlanImage\s*\|\|\s*undefined,/g, 'floorPlanImage,');
  text = text.replace(/imageToEdit\s*\|\|\s*undefined,/g, 'imageToEdit,');
  text = text.replace(/sourceImage\s*\|\|\s*undefined,/g, 'sourceImage,');

  fs.writeFileSync(filePath, text);
};

const componentsDir = './components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));
files.forEach(f => fixDestructuring(path.join(componentsDir, f)));

console.log('Fixed destructuring errors.');
