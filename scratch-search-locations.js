import fs from 'fs';
import path from 'path';

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') searchDir(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('landmark') || content.includes('StructuredLocationSelection')) {
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes('.landmark') || line.includes('StructuredLocationSelection')) {
            console.log(`${fullPath}:${idx+1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

searchDir('src');
