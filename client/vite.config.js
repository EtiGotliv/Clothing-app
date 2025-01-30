import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // הפורט שבו האתר ירוץ
    open: true, // פותח אוטומטית את הדפדפן
  },
});
