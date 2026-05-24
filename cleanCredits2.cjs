const fs = require('fs');
const path = require('path');

const componentsDir = './components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/<div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800\/50 rounded-lg px-4 py-2 mt-4 mb-2 border border-gray-200 dark:border-gray-700">[\s\S]*?<button/g, '<button');
  
  fs.writeFileSync(filePath, content);
}
console.log('Script 2 ran successfully');
