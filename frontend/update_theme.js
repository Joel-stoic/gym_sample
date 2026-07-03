const fs = require('fs');
const path = require('path');

function replaceTokensInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  content = content.replace(/bg-surface-popover/g, 'bg-gunmetal-800');
  content = content.replace(/bg-surface-raised/g, 'bg-gunmetal-800');
  content = content.replace(/bg-surface-base/g, 'bg-gunmetal-900');
  content = content.replace(/border-border-subtle/g, 'border-gunmetal-600');
  content = content.replace(/border-border-strong/g, 'border-gunmetal-600');
  
  // text colors
  content = content.replace(/text-zinc-400/g, 'text-gunmetal-400');
  content = content.replace(/text-zinc-500/g, 'text-gunmetal-400');
  content = content.replace(/text-zinc-300/g, 'text-gunmetal-100');
  
  // hex colors used as fallback in some places
  content = content.replace(/#0F0F0F/gi, 'var(--color-gunmetal-900)');
  content = content.replace(/#202020/gi, 'var(--color-gunmetal-800)');
  content = content.replace(/#F8F8F8/gi, '#ffffff');

  // violet -> crayola mapping
  content = content.replace(/violet-600\/20/g, 'crayola-100');
  content = content.replace(/violet-500\/10/g, 'crayola-100');
  content = content.replace(/violet-500\/20/g, 'crayola\/20');
  content = content.replace(/violet-500\/30/g, 'crayola\/30');
  content = content.replace(/violet-500\/50/g, 'crayola\/50');
  content = content.replace(/violet-600/g, 'crayola');
  content = content.replace(/violet-700/g, 'crayola-600');
  content = content.replace(/violet-500/g, 'crayola');
  content = content.replace(/violet-400/g, 'crayola');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated: ' + filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceTokensInFile(fullPath);
    }
  }
}

walk('/media/dell/9CB8D8ADB8D88764/gym/frontend/src/components');
walk('/media/dell/9CB8D8ADB8D88764/gym/frontend/app');

console.log('Done replacing tokens.');
