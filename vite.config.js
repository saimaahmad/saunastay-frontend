import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // <-- add this

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // <-- this maps "@" to your "src" folder
    },
  },
  server: {
    historyApiFallback: true,
  },
});
