import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
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
    sourcemap: false,
    target: 'es2022',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/recharts')) return 'recharts';
          if (id.includes('node_modules/react-router')) return 'router';
          if (id.includes('node_modules/react-dom')) return 'react-vendor';
          if (id.includes('node_modules/react/')) return 'react-vendor';
          if (id.includes('/features/cockpit/lib/cockpitData')) return 'cockpit-data';
          if (id.includes('/features/cockpit/components/cockpitWidgets')) return 'cockpit-widgets';
          if (id.includes('/features/risk-and-resilience/')) return 'risk-resilience';
          if (id.includes('/features/cloud-migration/')) return 'cloud-migration';
        },
      },
    },
  },
});
