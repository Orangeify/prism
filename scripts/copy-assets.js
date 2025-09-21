import fs from 'fs';
import path from 'path';

async function main() {
  try {
    console.log('Starting asset copy...');
    const projectRoot = process.cwd();
    // Fall back to the expected dist folders inside node_modules
    const uvPath = path.join(projectRoot, 'node_modules', '@titaniumnetwork-dev', 'ultraviolet', 'dist');
    const baremuxPath = path.join(projectRoot, 'node_modules', '@mercuryworkshop', 'bare-mux', 'dist');
    const epoxyPath = path.join(projectRoot, 'node_modules', '@mercuryworkshop', 'epoxy-transport', 'dist');

    const copy = (src, dest) => {
      if (!src) {
        console.warn('Source path is empty, skipping', src, dest);
        return;
      }
      if (!fs.existsSync(src)) {
        console.warn('Source does not exist, skipping:', src);
        return;
      }
      fs.mkdirSync(dest, { recursive: true });
      if (fs.cpSync) {
        fs.cpSync(src, dest, { recursive: true });
      } else {
        const copyRecursive = (s, d) => {
          const stat = fs.statSync(s);
          if (stat.isDirectory()) {
            fs.mkdirSync(d, { recursive: true });
            for (const entry of fs.readdirSync(s)) {
              copyRecursive(path.join(s, entry), path.join(d, entry));
            }
          } else {
            fs.copyFileSync(s, d);
          }
        };
        copyRecursive(src, dest);
      }
      console.log(`Copied ${src} -> ${dest}`);
    };

  const publicDir = path.join(process.cwd(), 'public');
    copy(uvPath, path.join(publicDir, 'uv'));
    copy(baremuxPath, path.join(publicDir, 'baremux'));
    copy(epoxyPath, path.join(publicDir, 'epoxy'));

    console.log('Asset copy completed.');
  } catch (err) {
    console.error('Failed to copy assets:', err);
    process.exitCode = 1;
  }
}

main();

