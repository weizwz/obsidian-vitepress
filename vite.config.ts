import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
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
    outDir: '.',
    emptyOutDir: false,
    sourcemap: 'inline',
    minify: false,
  },
  css: {
    modules: false,
  },
});