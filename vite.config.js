import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';

/** Allow JSX in .js files without renaming every module. */
function jsxInJs() {
  return {
    name: 'jsx-in-js',
    enforce: 'pre',
    async transform(code, id) {
      if (!/\/src\/.*\.js$/.test(id)) return null;
      return transformWithEsbuild(code, id, {
        loader: 'jsx',
        jsx: 'automatic',
      });
    },
  };
}

export default defineConfig({
  plugins: [jsxInJs(), react()],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    port: 3000,
    strictPort: false,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    target: 'es2022',
  },
});
