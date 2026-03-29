import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, existsSync } from 'fs';

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
    // 每次构建完成后将样式和配置同步至 dist 目录，以供打包分发
    plugins: [{
      name: 'sync-assets-to-dist',
      closeBundle() {
        try {
          // 将根目录下静态配置与样式同步至 dist 目录
          if (existsSync('styles.css')) {
            copyFileSync('styles.css', 'dist/styles.css');
            console.log('✓ Copied styles.css → dist/styles.css');
          }
          if (existsSync('manifest.json')) {
            copyFileSync('manifest.json', 'dist/manifest.json');
            console.log('✓ Copied manifest.json → dist/manifest.json');
          }
        } catch (e) {
          console.error('Failed to copy:', e);
        }
      }
    }],
  };
});