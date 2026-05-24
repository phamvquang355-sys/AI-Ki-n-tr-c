const fs = require('fs');
const path = require('path');

const replaceInFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let text = fs.readFileSync(filePath, 'utf8');

  // Remove ImageResolution import
  text = text.replace(/,\s*ImageResolution/g, '');
  text = text.replace(/ImageResolution\s*,?/g, '');
  
  // Replace:
  // if ('Standard' === "1K" || 'Standard' === "2K" || 'Standard' === "4K") { ... }
  // Since 'Standard' will never equal '1K', we can just strip the if block?
  // Actually, wait: sometimes we might want it to fall back to generateStandardImage.
  // The structure is usually:
  // if ('Standard' === "1K" || 'Standard' === "2K" || 'Standard' === "4K") { ... block1 ... }
  // return await geminiService.generateStandardImage(...);
  // It's safer to just replace `'Standard' === "1K"` with `false` or let it be but TypeScript warns about comparison without overlap.
  
  text = text.replace(/'Standard' === "1K"/g, 'false');
  text = text.replace(/'Standard' === "2K"/g, 'false');
  text = text.replace(/'Standard' === "4K"/g, 'false');
  
  // Fix `Cannot find name 'resolution'` which was left from `const getCostPerImage = () => { switch(resolution) ...`
  text = text.replace(/switch\s*\(\s*resolution\s*\)/g, 'switch ("Standard")');
  text = text.replace(/resolution\s*\|\|\s*"Standard"/g, '"Standard"');
  text = text.replace(/\$\{resolution\}/g, 'Standard');
  text = text.replace(/\bresolution\b/g, '"Standard"'); // Very aggressive, but should only hit leftover `resolution` variables.
  
  // Fix InteriorGenerator `Cannot find name 'user'`.
  text = text.replace(/user_id:\s*user\.id,/g, '');

  fs.writeFileSync(filePath, text);
};

const componentsDir = './components';
const servicesDir = './services';
const stateDir = './state';

const allDirs = [componentsDir, path.join(componentsDir, 'common'), servicesDir, stateDir];
allDirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
    files.forEach(f => replaceInFile(path.join(dir, f)));
});

console.log('Fixed more errors.');
