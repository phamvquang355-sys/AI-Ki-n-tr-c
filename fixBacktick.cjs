const fs = require('fs');
for (const file of [
  './components/ImageGenerator.tsx',
  './components/InteriorGenerator.tsx',
  './components/VideoGenerator.tsx'
]) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/.*`\);/g, '');
  fs.writeFileSync(file, content);
}
console.log('Fixed backticks forcefully');
