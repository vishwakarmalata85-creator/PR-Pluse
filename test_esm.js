const fs = require("fs");
const path = require("path");

function getAllJsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllJsFiles(fullPath));
    } else if (file.endsWith(".js")) {
      results.push(fullPath);
    }
  });
  return results;
}

const jsFiles = getAllJsFiles(path.join(__dirname, "src"));
console.log("Analyzing", jsFiles.length, "JavaScript files in src/ for broken imports...");

let issues = 0;

for (const file of jsFiles) {
  const content = fs.readFileSync(file, "utf8");
  const importRegex = /import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))\s+from\s+["']([^"']+)["']/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const namedImports = match[1] ? match[1].split(",").map((s) => s.trim().split(" as ")[0].trim()) : [];
    const importPath = match[4];

    if (importPath.startsWith(".")) {
      const resolvedPath = path.resolve(path.dirname(file), importPath);
      if (!fs.existsSync(resolvedPath)) {
        console.error(`❌ In ${path.relative(__dirname, file)}: Cannot find module ${importPath}`);
        issues++;
        continue;
      }

      // Check named exports
      if (namedImports.length > 0) {
        const targetContent = fs.readFileSync(resolvedPath, "utf8");
        for (const sym of namedImports) {
          if (!sym) continue;
          const exportPattern = new RegExp(`export\\s+(?:class|const|function|let|var|\\{[^}]*\\b${sym}\\b[^}]*\\})\\s+${sym}\\b`);
          const hasExport =
            exportPattern.test(targetContent) ||
            targetContent.includes(`export { ${sym}`) ||
            targetContent.includes(`export const ${sym}`) ||
            targetContent.includes(`export class ${sym}`) ||
            targetContent.includes(`export function ${sym}`);

          if (!hasExport) {
            console.error(`❌ In ${path.relative(__dirname, file)}: Symbol '${sym}' is not exported by ${importPath}`);
            issues++;
          }
        }
      }
    }
  }
}

if (issues === 0) {
  console.log("🎉 All imports and exported symbols across src/ are 100% VALID!");
} else {
  console.log(`⚠️ Found ${issues} import issues.`);
}
