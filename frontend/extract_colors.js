const fs = require('fs');
const path = require('path');

const colorRegex = /\b(bg|text|border|ring|divide)-([a-zA-Z0-9]+(?:-[0-9]+)?(?:-[0-9a-zA-Z]+)?(?:\/[0-9]+)?)\b/g;
const colors = new Set();

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      let match;
      while ((match = colorRegex.exec(content)) !== null) {
        colors.add(match[0]);
      }
    }
  }
}

walk('/media/dell/9CB8D8ADB8D88764/gym/frontend/src/components');
walk('/media/dell/9CB8D8ADB8D88764/gym/frontend/app');

console.log(Array.from(colors).sort().join('\n'));
