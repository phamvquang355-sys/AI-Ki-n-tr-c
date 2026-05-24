const fs = require('fs');
const files = [
  './components/ImageGenerator.tsx',
  './components/InteriorGenerator.tsx',
  './components/VideoGenerator.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\/\/ Refund logic:[\s\S]*?`\);\n\s*\}/g, '// Refund logic removed');
  fs.writeFileSync(file, content);
}
console.log('Fixed broken backticks in catch blocks');
