import fs from 'fs';

const filePath = 'src/index.css';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the literal \n characters with real newlines
content = content.replace(
  /::view-transition-old\(root\) \{\\n\s*animation: 0.28s cubic-bezier\(0.16, 1, 0.3, 1\) both slide-to-left;\\n\}\\n\\n::view-transition-new\(root\) \{\\n\s*animation: 0.28s cubic-bezier\(0.16, 1, 0.3, 1\) both slide-from-right;\\n\}/g,
  `::view-transition-old(root) {
  animation: 0.28s cubic-bezier(0.16, 1, 0.3, 1) both slide-to-left;
}

::view-transition-new(root) {
  animation: 0.28s cubic-bezier(0.16, 1, 0.3, 1) both slide-from-right;
}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("CSS file fixed successfully.");
