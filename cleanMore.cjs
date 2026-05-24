const fs = require('fs');
const path = require('path');

const cleanFixes = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let text = fs.readFileSync(filePath, 'utf8');

  // Remove getCostPerImage and switch resolution
  // Wait, I can just remove switch ("Standard") ...
  text = text.replace(/const getCostPerImage[\s\S]*?};\n/g, '');
  
  // Replace cost calculation with 0 or just ignore cost since we don't deduct credits anyway
  text = text.replace(/const cost = numberOfImages \* getCostPerImage\(\);/g, 'const cost = 0;');
  text = text.replace(/const cost = getCostPerImage\(\);/g, 'const cost = 0;');
  text = text.replace(/const cost = \d+;/g, 'const cost = 0;');
  
  // Fix InteriorGenerator `Cannot find name 'user'`
  text = text.replace(/user\.id/g, '"local"');

  // Fix geminiService argument that I corrupted to "Standard"
  // e.g. generateStandardImage(..., "Standard", ...)
  text = text.replace(/, "Standard",/g, ',');
  
  // Also fengshui `null is not assignable to FileData`
  text = text.replace(/floorPlanImage \|\| null/g, 'floorPlanImage || undefined');

  fs.writeFileSync(filePath, text);
};

const componentsDir = './components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));
files.forEach(f => cleanFixes(path.join(componentsDir, f)));

console.log('Fixed more errors.');
