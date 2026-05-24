const fs = require('fs');
const path = require('path');

const componentsDir = './components';
const AppPath = './App.tsx';
const typesPath = './types.ts';
const statePath = './state/toolState.ts';

// 1. Remove resolution from types.ts
let typesContent = fs.readFileSync(typesPath, 'utf8');
typesContent = typesContent.replace(/export type ImageResolution[\s\S]*?;/, '');
fs.writeFileSync(typesPath, typesContent);

// 2. Remove resolution from state/toolState.ts
let stateContent = fs.readFileSync(statePath, 'utf8');
stateContent = stateContent.replace(/resolution\??: [A-Za-z]+;/g, '');
stateContent = stateContent.replace(/resolution:\s*'[^']+',/g, '');
fs.writeFileSync(statePath, stateContent);

// 3. Remove userCredits, onDeductCredits, resolution
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));
for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove props definition
  content = content.replace(/\buserCredits\?:\s*number;?\s*/g, '');
  content = content.replace(/\bonDeductCredits\?:\s*\(amount:\s*number,\s*description:\s*string\)\s*=>\s*Promise<string>;?\s*/g, '');
  
  // Remove from function signature
  content = content.replace(/,\s*userCredits\s*=\s*\d+/g, '');
  content = content.replace(/,\s*userCredits/g, '');
  content = content.replace(/,\s*onDeductCredits/g, '');

  content = content.replace(/,\s*resolution/g, '');
  
  // Remove ResolutionSelector imports
  content = content.replace(/import ResolutionSelector.*?;\n/g, '');
  
  // Remove handleResolutionChange
  content = content.replace(/const handleResolutionChange[\s\S]*?};\n/g, '');

  // Remove <ResolutionSelector ... />
  // We'll replace the full div wrapper if it contains ResolutionSelector
  content = content.replace(/<div[^>]*>\s*<ResolutionSelector[\s\S]*?<\/div>/g, '');
  content = content.replace(/<ResolutionSelector[^>]*\/>/g, '');

  // Modify geminiService calls. We don't have resolution anymore, so we might need to fix it manually or pass undefined/standard. Wait, the script will break geminiService calls if we aren't careful.
  content = content.replace(/resolution ===/g, "'Standard' ===");
  content = content.replace(/resolution !==/g, "'Standard' !==");
  content = content.replace(/\$\{resolution \|\| 'Standard'\}/g, "Standard");
  content = content.replace(/\$\{resolution\}/g, "Standard");
  
  // Actually, we should just let `resolution: '1K'` or fallback in gemini calls, and we'll fix tsc separately.
  fs.writeFileSync(filePath, content);
}
console.log('Script executed');
