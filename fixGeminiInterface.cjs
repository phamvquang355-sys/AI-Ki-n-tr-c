const fs = require('fs');

const filePath = './services/geminiService.ts';
let text = fs.readFileSync(filePath, 'utf8');

// replace `sourceImage?: FileData,` with `sourceImage?: FileData | null,`
text = text.replace(/sourceImage\?: FileData,/g, 'sourceImage?: FileData | null,');
text = text.replace(/imageToEdit\?: FileData,/g, 'imageToEdit?: FileData | null,');
text = text.replace(/maskImage\?: FileData,/g, 'maskImage?: FileData | null,');
text = text.replace(/image\?: FileData,/g, 'image?: FileData | null,');

fs.writeFileSync(filePath, text);

console.log('Fixed geminiService parameters.');
