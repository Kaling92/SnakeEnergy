const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend', 'src', 'pages');

const tsxFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

tsxFiles.forEach(file => {
  const name = file.replace('.tsx', '');
  const tsxPath = path.join(pagesDir, file);
  let tsxContent = fs.readFileSync(tsxPath, 'utf8');

  const isAuth = name === 'Login' || name === 'SignUp';
  const bodyClass = isAuth ? 'auth-body' : 'app-body';

  // Replace <div className="page-X"> or <div> after <> with <div className="app-body">
  // Since we ran scope_css.js, we have <div className="page-X"> or similar
  tsxContent = tsxContent.replace(/<>\s*<div[^>]*>/, `<>\n      <div className="${bodyClass}">`);

  // Ensure Homepage.css is imported for app pages
  if (!isAuth && !tsxContent.includes("import '../assets/Homepage.css'")) {
    tsxContent = tsxContent.replace(/(import React[^;]*;)/, `$1\nimport '../assets/Homepage.css';`);
  }
  
  // Actually wait! Some files might have `// @ts-nocheck\nimport React...`. Let's just place it after the first import.
  if (!isAuth && !tsxContent.includes("import '../assets/Homepage.css'")) {
      tsxContent = tsxContent.replace(/import React(.*?)\n/, `import React$1\nimport '../assets/Homepage.css';\n`);
  }

  fs.writeFileSync(tsxPath, tsxContent);
  console.log(`Fixed layout for ${file}`);
});
