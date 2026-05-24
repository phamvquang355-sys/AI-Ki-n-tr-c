const fs = require('fs');
for (const file of [
  './components/ImageGenerator.tsx',
  './components/InteriorGenerator.tsx',
  './components/VideoGenerator.tsx'
]) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import\s+\*\s+as\s+paymentService\s+from\s+['"\.\/]+services\/paymentService['"];?/, '');
  fs.writeFileSync(file, content);
}
console.log('Removed paymentService import');
