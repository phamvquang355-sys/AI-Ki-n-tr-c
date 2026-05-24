const fs = require('fs');
const files = [
  './components/ImageGenerator.tsx',
  './components/InteriorGenerator.tsx',
  './components/VideoGenerator.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import\s+\{\s*refundCredits\s*\}\s+from\s+['"\.\/]+services\/paymentService['"];?/, '');
  // Also need to remove the refund call
  content = content.replace(/await\s+refundCredits\([\s\S]*?\);?/g, '');
  fs.writeFileSync(file, content);
}
console.log('Cleaned refundCredits');
