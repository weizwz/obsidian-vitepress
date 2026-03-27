import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/main.ts'),
        formats: ['cjs'],
        fileName: () => 'main.js',
      },
      rollupOptions: {
        external: [
          'obsidian',
          '@codemirror/view',
          '@codemirror/state',
          '@codemirror/language',
          'moment'
        ],
        output: {
          exports: 'default',
        },
      },
      outDir: 'dist',
      emptyOutDir: false,
      sourcemap: isDev ? 'inline' : false,
      minify: !isDev,
    },
    css: {
      modules: false,
    },
    // 每次构建完成后将 main.js 复制到根目录（Obsidian 插件要求）
    plugins: [{
      name: 'copy-to-root',
      closeBundle() {
        try {
          copyFileSync('dist/main.js', 'main.js');
          console.log('✓ Copied dist/main.js → main.js');
        } catch (e) {
          console.error('Failed to copy:', e);
        }
      }
    }],
  };
});