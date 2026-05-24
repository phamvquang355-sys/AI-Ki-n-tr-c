const fs = require('fs');
const path = require('path');

const fixFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix aspectRatio: AspectRatio: ImageResolution,
  content = content.replace(/aspectRatio: AspectRatio: ImageResolution,/g, 'aspectRatio: AspectRatio,');
  content = content.replace(/aspectRatio:\s*AspectRatio,/g, 'aspectRatio: any,'); // just generic for now if needed, no `AspectRatio` is loaded? Let's just do AspectRatio
  
  // Fix unterminated template literal in // 1. Deduct credits...
  // You see, my previous strip replaced partially, leaving ` ảnh) - Standard\`,
  content = content.replace(/[ \t]*ảnh\) - Standard`,\n[ \t]*\);\n[ \t]*}/g, '');
  content = content.replace(/[ \t]*ảnh\)`,\n[ \t]*\);\n[ \t]*}/g, '');
  
  // Clean empty tries?
  
  fs.writeFileSync(filePath, content);
};

const componentsDir = './components';
fixFile(path.join(componentsDir, 'ImageGenerator.tsx'));
fixFile(path.join(componentsDir, 'InteriorGenerator.tsx'));
fixFile(path.join(componentsDir, 'LandscapeRendering.tsx'));
fixFile(path.join(componentsDir, 'Renovation.tsx'));
fixFile(path.join(componentsDir, 'Staging.tsx'));
fixFile(path.join(componentsDir, 'UrbanPlanning.tsx'));
fixFile(path.join(componentsDir, 'VideoGenerator.tsx'));
fixFile(path.join(componentsDir, 'ViewSync.tsx'));
fixFile(path.join(componentsDir, 'SketchConverter.tsx'));
fixFile(path.join(componentsDir, 'FengShui.tsx'));

console.log('Fixed syntaxes');
