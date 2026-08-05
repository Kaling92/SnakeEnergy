const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const HTMLtoJSX = require('htmltojsx');

const { JSDOM } = jsdom;

const srcDir = path.join(__dirname, 'Project', 'public');
const destDir = path.join(__dirname, 'frontend', 'src', 'pages');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// We will pass jsdom's window to htmltojsx to simulate the browser environment for accurate parsing
const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
const converter = new HTMLtoJSX({
  createClass: false, // We want functional components without boilerplate
});

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const componentName = file.replace('.html', '').replace(/[^a-zA-Z0-9]/g, '');
  const htmlPath = path.join(srcDir, file);
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // Extract body content roughly
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let content = bodyMatch ? bodyMatch[1] : html;
  
  // Clean scripts inside html
  content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  let jsxContent = converter.convert(content);
  
  // Cleanup a few things htmltojsx might do, like comments
  jsxContent = jsxContent.replace(/<!--/g, '{/*').replace(/-->/g, '*/}');
  
  const componentCode = `import React from 'react';
import '../assets/${componentName}.css';

const ${componentName} = () => {
  return (
    <>
      ${jsxContent}
    </>
  );
};

export default ${componentName};
`;

  const destPath = path.join(destDir, `${componentName}.tsx`);
  fs.writeFileSync(destPath, componentCode);
  console.log(`Converted ${file} to ${componentName}.tsx`);
});
