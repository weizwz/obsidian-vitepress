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
      // 开发模式输出到 dist/，避免 watch 冲突；生产构建到根目录
      outDir: 'dist',
      emptyOutDir: false,
      sourcemap: 'inline',
      minify: false,
      // 开发模式启用 watch
      watch: isDev ? {} : null,
    },
    css: {
      modules: false,
    },
    // 开发模式构建完成后复制文件到根目录
    plugins: isDev ? [{
      name: 'copy-to-root',
      closeBundle() {
        try {
          copyFileSync('dist/main.js', 'main.js');
          console.log('✓ Copied main.js to root');
        } catch (e) {
          console.error('Failed to copy:', e);
        }
      }
    }] : [],
  };
});