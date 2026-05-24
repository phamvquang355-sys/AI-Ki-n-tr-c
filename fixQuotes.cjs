const fs = require('fs');
const path = require('path');

const fixResolutionString = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let text = fs.readFileSync(filePath, 'utf8');

  // Fix strings that were broken: "high "Standard"."
  text = text.replace(/high "Standard"\./g, 'high resolution.');
  text = text.replace(/high "Standard"/g, 'high resolution');
  
  // Fix property assignment errors where we did:
  // "Standard" = "Standard"
  // or "Standard": "Standard"
  
  // check geminiService.ts line 269
  // services/geminiService.ts(269,3): error TS1003: Identifier expected.
  // services/geminiService.ts(269,13): error TS1138: Parameter declaration expected.
  
  fs.writeFileSync(filePath, text);
};

const componentsDir = './components';
const servicesDir = './services';
const stateDir = './state';

const allDirs = [componentsDir, path.join(componentsDir, 'common'), servicesDir, stateDir];
allDirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
    files.forEach(f => fixResolutionString(path.join(dir, f)));
});
console.log('Fixed quotes');
