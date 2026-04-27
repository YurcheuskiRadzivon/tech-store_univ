const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const outDir = path.join(root, "public");
const templateDir = path.join(root, "template");
const staticDir = path.join(root, "static");

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
fs.cpSync(staticDir, path.join(outDir, "static"), { recursive: true });

for (const name of fs.readdirSync(templateDir)) {
  if (!name.endsWith(".html")) continue;
  const src = path.join(templateDir, name);
  const html = fs.readFileSync(src, "utf8");
  
  const replaced = html.replace(/\.\.\/static\//g, "static/");
  fs.writeFileSync(path.join(outDir, name), replaced, "utf8");
}

console.log("Built to public/ (HTML + static/ assets).");
