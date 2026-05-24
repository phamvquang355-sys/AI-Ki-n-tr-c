const fs = require('fs');
for (const file of ['./components/FloorPlan.tsx', './components/Renovation.tsx']) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace('        </div>\n    );\n};', '    );\n};');
  fs.writeFileSync(file, content);
}
console.log('Fixed over-fixed files');
