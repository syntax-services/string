import fs from 'fs';
import path from 'path';

const keywords = ['heatmap', 'swipe', 'touch', 'slide', 'service', 'discover'];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  });
}

console.log("=== SEARCHING CODEBASE ===");
walkDir('.', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = [];
    keywords.forEach(kw => {
      if (content.toLowerCase().includes(kw)) {
        matches.push(kw);
      }
    });
    if (matches.length > 0) {
      if (filePath.includes('Business') || filePath.includes('Discover') || filePath.includes('Layout') || filePath.includes('App') || filePath.includes('index.css') || filePath.includes('navigation')) {
        console.log(`File: ${filePath} contains [${matches.join(', ')}]`);
      }
    }
  }
});
