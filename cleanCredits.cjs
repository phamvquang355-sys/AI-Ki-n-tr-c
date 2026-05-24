const fs = require('fs');
const path = require('path');

const componentsDir = './components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove supabase import
  content = content.replace(/import\s*{\s*supabase\s*}\s*from\s*['"]\.\.\/services\/supabaseClient['"];\n/g, '');
  
  // Fix the whole credit deduction and job creation chunk.
  // Instead of complex regex, let's just strip out any mention of `onDeductCredits` or `logId`.
  
  // Find standard chunks of `// 1. Deduct credits...` to `// 2. Create Job...` to `// 3. Generate Image`
  // Actually, we can just replace lines that contain `onDeductCredits`.
  
  content = content.replace(/if\s*\(onDeductCredits\)\s*{[\s\S]*?}/g, '');
  content = content.replace(/let\s+logId:\s*string\s*\|\s*null\s*=\s*null;/g, '');
  
  content = content.replace(/const\s*{\s*data:\s*{\s*user\s*}\s*(?:,\s*)?}\s*=\s*await\s*supabase\.auth\.getUser\(\);/gs, '');
  
  // Replace job creation
  content = content.replace(/if\s*\((?:user\s*&&\s*)?logId\)\s*{([\s\S]*?)}/g, '$1');
  
  // Job creation may reference logId
  content = content.replace(/usage_log_id:\s*logId,/g, '');
  content = content.replace(/user_id:\s*user(?:\?.id|\.id),/g, '');
  
  // Remove the block checking if logId && !jobId
  content = content.replace(/if\s*\(logId\s*&&\s*!jobId\)\s*{[\s\S]*?}/g, '');

  // Remove refund logic and catch block logging
  // Actually if we just remove `logId` entirely
  content = content.replace(/if\s*\(logId(?:\s*&&\s*![a-zA-Z]+)?\)\s*{[^}]*}/g, '');
  
  fs.writeFileSync(filePath, content);
}
console.log('Done');
