const fs = require('fs');
const path = require('path');

const cleanFixes = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let text = fs.readFileSync(filePath, 'utf8');

  // Remove `if (user) {\s*}` 
  text = text.replace(/if\s*\(user\)\s*{\s*}/g, '');
  
  // Replace `someArg || undefined` or `someArg ? someArg : undefined` where someArg is FileData|null
  // It's easier: just globally replace `| null` with `| undefined` in those files... wait no.
  // We can just add `|| undefined` to the calls.
  text = text.replace(/floorPlanImage,\s*jobId/g, 'floorPlanImage || undefined, jobId');
  text = text.replace(/sourceImage,\s*jobId/g, 'sourceImage || undefined, jobId');
  text = text.replace(/imageToEdit,\s*maskImage,\s*jobId/g, 'imageToEdit || undefined, maskImage || undefined, jobId');
  text = text.replace(/sourceImage,\s*referenceImage,\s*jobId/g, 'sourceImage || undefined, referenceImage || undefined, jobId');
  text = text.replace(/imageToEdit,\s*maskImage,/g, 'imageToEdit || undefined, maskImage || undefined,');
  text = text.replace(/sourceImage,\s*referenceImage,/g, 'sourceImage || undefined, referenceImage || undefined,');

  fs.writeFileSync(filePath, text);
};

const componentsDir = './components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));
files.forEach(f => cleanFixes(path.join(componentsDir, f)));

console.log('Fixed filedata null issues.');
