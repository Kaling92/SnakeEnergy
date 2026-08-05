const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend', 'src', 'pages');
const assetsDir = path.join(__dirname, 'frontend', 'src', 'assets');

const tsxFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

tsxFiles.forEach(file => {
  const name = file.replace('.tsx', '');
  const tsxPath = path.join(pagesDir, file);
  let tsxContent = fs.readFileSync(tsxPath, 'utf8');

  // Replace the first <div> after <> with <div className={`page-${name}`}>
  // htmltojsx usually generates:
  //   return (
  //     <>
  //       <div>
  // OR
  //   return (
  //     <>
  //       <div ...>
  
  let replacedDiv = false;
  tsxContent = tsxContent.replace(/<>\s*<div([^>]*)>/, (match, p1) => {
    replacedDiv = true;
    // If it already has a className, we need to append to it
    if (p1.includes('className=')) {
      return match.replace(/className="([^"]*)"/, `className="$1 page-${name}"`);
    } else {
      return `<>\n      <div className="page-${name}"${p1}>`;
    }
  });

  if (replacedDiv) {
    fs.writeFileSync(tsxPath, tsxContent);
    console.log(`Updated ${file} with page class`);
  }

  // Now update the CSS file
  // Find which CSS file is imported
  const cssMatch = tsxContent.match(/import\s+'\.\.\/assets\/([^']+)\.css'/);
  if (cssMatch) {
    const cssName = cssMatch[1];
    const cssPath = path.join(assetsDir, `${cssName}.css`);
    
    if (fs.existsSync(cssPath)) {
      let cssContent = fs.readFileSync(cssPath, 'utf8');
      
      // Check if already wrapped
      if (!cssContent.startsWith(`.page-${name}`)) {
        // Replace body { with & { to apply it to the wrapper
        cssContent = cssContent.replace(/body\s*{/g, '& {');
        
        // Wrap everything
        cssContent = `.page-${name} {\n  min-height: 100vh;\n  width: 100%;\n  text-align: left;\n\n${cssContent}\n}\n`;
        fs.writeFileSync(cssPath, cssContent);
        console.log(`Wrapped ${cssName}.css`);
      }
    }
  }
});
