const fs = require('fs');
const path = require('path');

const componentsDir = './components';

const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove supabase import
  content = content.replace(/import\s*{\s*supabase\s*}\s*from\s*['"]\.\.\/services\/supabaseClient['"];\n/g, '');
  
  // Remove supabase auth get user block
  const authRegex = /const\s*{\s*data\s*:\s*{\s*user\s*}\s*,\s*}\s*=\s*await\s*supabase\.auth\.getUser\(\);\s*if\s*\(user\s*&&\s*logId\)\s*{([^}]+)}/gs;
  content = content.replace(authRegex, (match, inner) => {
    return `if (logId) { ${inner} }`;
  });
  
  // Alternative auth getUser form
  const authRegex2 = /const\s*{\s*data:\s*{\s*user\s*}\s*,\s*}\s*=\s*await\s*supabase\.auth\.getUser\(\);/gs;
  content = content.replace(authRegex2, '');
  
  const authRegex3 = /const\s*{\s*data:\s*{\s*user\s*}\s*}\s*=\s*await\s*supabase\.auth\.getUser\(\);/gs;
  content = content.replace(authRegex3, '');

  // Remove `user.id` dependency in job creation
  content = content.replace(/user_id:\s*user\.id,/g, '');
  
  // Some places might check `user` existence. We just remove the `user &&`
  content = content.replace(/if\s*\(user\s*&&\s*logId\)\s*{/g, 'if (logId) {');
  
  fs.writeFileSync(filePath, content);
}
console.log('Done');
