const fs = require('fs');
const path = require('path');

const cleanFixes = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let text = fs.readFileSync(filePath, 'utf8');

  // Regex to remove switch("Standard") { ... } block entirely
  // It's a bit tricky to match multiline {} in JS regex without a parser, but we can try to match up to the end of the getCostPerImage function.
  text = text.replace(/const getCostPerImage[\s\S]*?};\n/g, '');

  text = text.replace(/switch \("Standard"\) \{[\s\S]*?\}/, '');

  text = text.replace(/const cost = \d+ \* getCostPerImage\(\);/g, 'const cost = 0;');
  text = text.replace(/const cost = getCostPerImage\(\);/g, 'const cost = 0;');
  text = text.replace(/floorPlanImage, /g, 'floorPlanImage || undefined, ');
  
  text = text.replace(/user\.id/g, '"local"');

  // Fix generateStandardImage calls that have an extra arg like `resolution || undefined` which I replaced with `"Standard" || undefined`
  text = text.replace(/"Standard" \|\| undefined,/g, '');
  text = text.replace(/"Standard",/g, ''); 
  // Be careful with replacing "Standard", !
  
  fs.writeFileSync(filePath, text);
};

const componentsDir = './components';
['FengShui.tsx', 'ImageEditor.tsx', 'InteriorGenerator.tsx', 'MaterialSwapper.tsx', 'Staging.tsx', 'VirtualTour.tsx']
.forEach(f => cleanFixes(path.join(componentsDir, f)));

console.log('Fixed more errors.');
