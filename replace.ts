import fs from 'fs';
import path from 'path';

function walk(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('#b71c1c')) {
        content = content.replace(/#b71c1c/g, '#d32f2f');
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

walk('./src');
console.log('Done replacement in src');
