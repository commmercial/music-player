import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const mobileDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..') + path.sep;
const repoDir = path.resolve(mobileDir, '..') + path.sep;
const outDir = path.join(mobileDir, 'www');
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
const html = await readFile(path.join(repoDir, 'index.html'), 'utf8');
const enhanced = html
  .replace('<meta name="viewport" content="width=device-width, initial-scale=1.0">', '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="Risk"><meta name="theme-color" content="#17131d"><link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="assets/icon.png">')
  .replace('<link rel="stylesheet" href="styles.css">', '<link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="mobile.css">')
  .replace('<script src="app.js"></script>', '<script src="mobile-bridge.js"></script><script src="app.js"></script><script>if(location.protocol === "https:" && "serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));</script>');
await writeFile(path.join(outDir, 'index.html'), enhanced);
for (const file of ['styles.css', 'app.js', 'audio-engine.js', 'm3shapes.js', 'lyrics-rtl.js', 'track-sort.js', 'search-text.js', 'library-tools.js']) {
  await cp(path.join(repoDir, file), path.join(outDir, file));
}
await cp(path.join(repoDir, 'assets'), path.join(outDir, 'assets'), { recursive: true });
await cp(path.join(mobileDir, 'mobile-bridge.js'), path.join(outDir, 'mobile-bridge.js'));
await writeFile(path.join(outDir, 'mobile.css'), await readFile(path.join(mobileDir, 'mobile.css'), 'utf8'));
await cp(path.join(mobileDir, 'manifest.webmanifest'), path.join(outDir, 'manifest.webmanifest'));
await cp(path.join(mobileDir, 'sw.js'), path.join(outDir, 'sw.js'));

