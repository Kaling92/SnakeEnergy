const fs = require('fs');
const path = require('path');

const root = process.cwd();
const assetsDir = path.join(root, 'frontend', 'src', 'assets');
const srcDir = path.join(root, 'frontend', 'src');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walk(fullPath));
    } else if (entry.isFile() && /\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

for (const entry of fs.readdirSync(assetsDir)) {
  const fullPath = path.join(assetsDir, entry);
  if (fs.statSync(fullPath).isFile() && entry.endsWith('.css') && !entry.endsWith('.module.css')) {
    const newPath = path.join(assetsDir, entry.replace(/\.css$/, '.module.css'));
    if (!fs.existsSync(newPath)) {
      fs.renameSync(fullPath, newPath);
    }
  }
}

const files = walk(srcDir);
for (const filePath of files) {
  let text = fs.readFileSync(filePath, 'utf8');
  const originalText = text;

  text = text.replace(/import\s+['"](\.\.?\/.*?\/[^'"]+)\.css['"];?/g, (_match, importPath) => {
    return `import styles from '${importPath}.module.css';`;
  });

  if (text.includes("import styles from") && !text.includes('const classes =')) {
    const insertAfter = text.match(/^(import[\s\S]*?;\n\n)/m);
    if (insertAfter) {
      const helper = `const classes = (value: string) =>\n  value\n    .split(/\\s+/)\n    .filter(Boolean)\n    .map((name) => (styles as Record<string, string>)[name] ?? name)\n    .join(' ');\n\n`;
      text = text.replace(insertAfter[1], insertAfter[1] + helper);
    }
  }

  text = text.replace(/className="([^"]*)"/g, (_match, classesValue) => `className={classes("${classesValue}")}`);

  if (text !== originalText) {
    fs.writeFileSync(filePath, text);
  }
}
