const fs = require('fs');
const path = require('path');

const componentsDir = './components';
const files = [
  'AITechnicalDrawings.tsx',
  'FengShui.tsx',
  'ImageEditor.tsx',
  'ImageGenerator.tsx',
  'InteriorGenerator.tsx',
  'LandscapeRendering.tsx',
  'MaterialSwapper.tsx',
  'MoodboardGenerator.tsx',
  'SketchConverter.tsx',
  'Staging.tsx',
  'Upscale.tsx',
  'UrbanPlanning.tsx',
  'VideoGenerator.tsx',
  'ViewSync.tsx',
  'VirtualTour.tsx',
  'FloorPlan.tsx',
  'Renovation.tsx'
];

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // We'll replace the last occurrence of `    );\n};` with `        </div>\n    );\n};`
  // Because the very last thing in the component is the return block closing.
  let idx = content.lastIndexOf('    );\n};');
  if (idx !== -1) {
    content = content.substring(0, idx) + '        </div>\n' + content.substring(idx);
    fs.writeFileSync(filePath, content);
  }
}
console.log('Fixed missing divs');
