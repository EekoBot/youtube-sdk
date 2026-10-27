#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, 'src');

// The generator writes `@/…` specifiers rooted at src/ (its basePath). tsc
// does not rewrite path aliases, so left as they are every per-file module in
// dist/ would import a path no consumer can resolve. Make them relative.
function toRelativeSpecifier(filePath, specifier) {
  if (!specifier.startsWith('@/')) return specifier;

  const target = path.join(srcDir, specifier.slice(2));
  const relative = path.relative(path.dirname(filePath), target).split(path.sep).join('/');

  return relative.startsWith('.') ? relative : `./${relative}`;
}

function fixImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Resolve `@/` aliases, then replace .ts extensions with .js in imports
  const fixedContent = content
    .replace(/from ['"]([^'"]+)['"]/g, (_, spec) => `from '${toRelativeSpecifier(filePath, spec)}'`)
    .replace(/import\(['"]([^'"]+)['"]\)/g, (_, spec) => `import('${toRelativeSpecifier(filePath, spec)}')`)
    .replace(/from ['"]([^'"]+)\.ts['"]/g, "from '$1.js'")
    .replace(/import\(['"]([^'"]+)\.ts['"]\)/g, "import('$1.js')");
  
  if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent);
    console.log(`Fixed imports in: ${filePath}`);
  }
}

function fixImportsInDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      fixImportsInDirectory(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.ts')) {
      fixImportsInFile(fullPath);
    }
  }
}

// Fix imports in the src directory
fixImportsInDirectory(srcDir);

console.log('✅ Import extensions have been fixed!');