import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '@pages': path.resolve(__dirname, 'src/components/pages'),
      '@utils': path.resolve(__dirname, 'src/components/utils'),
      '@layouts': path.resolve(__dirname, 'src/components/layouts'),
      '@styles': path.resolve(__dirname, 'src/components/styles'),
      '@components': path.resolve(__dirname, 'src/components/common'),
      '@redux': path.resolve(__dirname, 'src/redux'),
      // '@types': path.resolve(__dirname, 'src/types'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@subscriptions': path.resolve(__dirname, 'src/api/subscriptions'),
      '@mutations': path.resolve(__dirname, 'src/api/mutations'),
      '@queries': path.resolve(__dirname, 'src/api/queries'),
      '@containers': path.resolve(__dirname, 'src/containers'),
      '@config': path.resolve(__dirname, 'src/config'),

      
    },
  },

})
