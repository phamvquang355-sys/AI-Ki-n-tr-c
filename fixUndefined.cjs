const fs = require('fs');
const path = require('path');

const cleanFixes = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let text = fs.readFileSync(filePath, 'utf8');

  text = text.replace(/floorPlanImage,\n/g, 'floorPlanImage || undefined,\n');
  text = text.replace(/imageToEdit,\n/g, 'imageToEdit || undefined,\n');
  text = text.replace(/sourceImage,\n/g, 'sourceImage || undefined,\n');
  
  // also fix `editImage(p, floorPlanImage || undefined, 1);` ? wait `1` is third arg. 
  // Let me just replace the remaining known issues.
  
  fs.writeFileSync(filePath, text);
};

const componentsDir = './components';
['FengShui.tsx', 'ImageEditor.tsx', 'InteriorGenerator.tsx', 'MaterialSwapper.tsx', 'Staging.tsx', 'VirtualTour.tsx']
.forEach(f => cleanFixes(path.join(componentsDir, f)));

console.log('Fixed undefined errors.');
