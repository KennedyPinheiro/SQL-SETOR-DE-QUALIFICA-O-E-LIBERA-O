import { defineConfig } from 'vite';
import { dirname, join, resolve, sep } from 'node:path';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(fileURLToPath(import.meta.url));

async function collectFiles(directory, prefix = '') {
  const entries = await readdir(join(directory, prefix), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = prefix ? join(prefix, entry.name) : entry.name;
    if (entry.isDirectory()) files.push(...await collectFiles(directory, entryPath));
    else if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

function copyGameRuntimeAssets() {
  return {
    name: 'copy-game-runtime-assets',
    apply: 'build',
    async buildStart() {
      const runtimeScripts = (await collectFiles(join(projectRoot, 'js')))
        .filter(file => file.endsWith('.js') && file !== 'script.js' && file !== 'home.js');
      const audioFiles = await collectFiles(join(projectRoot, 'audio'));
      const sourceFiles = [
        ...runtimeScripts.map(file => ({ source: join(projectRoot, 'js', file), output: join('js', file) })),
        ...audioFiles.map(file => ({ source: join(projectRoot, 'audio', file), output: join('audio', file) })),
        {
          source: join(projectRoot, 'Emblema SQL_ Setor de Liberação.png'),
          output: 'Emblema SQL_ Setor de Liberação.png'
        }
      ];

      for (const file of sourceFiles) {
        this.emitFile({
          type: 'asset',
          fileName: file.output.split(sep).join('/'),
          source: await readFile(file.source)
        });
      }
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [copyGameRuntimeAssets()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(projectRoot, 'index.html'),
        game: resolve(projectRoot, 'game.html'),
        practice: resolve(projectRoot, 'practice.html')
      }
    }
  }
});
