import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const copyDir = (src, dest) => {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

console.log("🚀 Creating self-contained Netlify Drop bundle...");

const deployDir = './netlify-deploy';
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir);

// 1. Copy Vite static assets
if (fs.existsSync('./dist')) {
  copyDir('./dist', deployDir);
  console.log("✅ Copied frontend build (dist)");
} else {
  console.error("❌ Error: 'dist' folder not found. Please run 'npm run build' first.");
  process.exit(1);
}

// 2. Copy netlify.toml
fs.copyFileSync('./netlify.toml', path.join(deployDir, 'netlify.toml'));
console.log("✅ Copied netlify.toml");

// 3. Compile serverless functions using Vercel NCC (bundles express, serverless-http, etc.)
console.log("📦 Compiling and bundling serverless backend (this includes all dependencies)...");
try {
  if (fs.existsSync('./temp-functions-build')) {
    fs.rmSync('./temp-functions-build', { recursive: true, force: true });
  }
  
  execSync('npx -y @vercel/ncc build netlify/functions/api.js -o temp-functions-build', { stdio: 'inherit' });
  
  fs.mkdirSync(path.join(deployDir, 'netlify/functions'), { recursive: true });
  fs.copyFileSync('./temp-functions-build/index.js', path.join(deployDir, 'netlify/functions/api.js'));
  
  fs.rmSync('./temp-functions-build', { recursive: true, force: true });
  console.log("✅ Successfully compiled serverless backend into a single self-contained file");
} catch (err) {
  console.error("❌ Failed to compile serverless functions:", err.message);
  process.exit(1);
}

// Clean up test-out if it exists
if (fs.existsSync('./test-out')) {
  fs.rmSync('./test-out', { recursive: true, force: true });
}

console.log("\n🎉 Ready! Drag and drop the 'netlify-deploy' folder into Netlify Drop.");
