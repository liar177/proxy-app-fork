const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const uiDir = path.resolve(__dirname, '..', '..', 'proxy-ui');
const publicDir = path.resolve(__dirname, '..', 'public');

console.log('[copy-ui] Building proxy-ui with vite...');
execSync('npm run build', { cwd: uiDir, stdio: 'inherit' });

if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true, force: true });
}
fs.mkdirSync(publicDir, { recursive: true });

const src = path.join(uiDir, 'dist');
const entries = fs.readdirSync(src);
for (const entry of entries) {
  fs.cpSync(path.join(src, entry), path.join(publicDir, entry), { recursive: true });
}

console.log(`[copy-ui] Done — ${entries.length} entries copied to ${publicDir}`);
