import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Proxy /api to your backend during development to avoid CORS issues.
    // By default this forwards to http://localhost:3000. If your backend runs on
    // a different port change the target below or set VITE_API_DEV_PROXY env var
    // and uncomment the line to use it.
    proxy: {
      '/api': {
        target: process.env.VITE_API_DEV_PROXY || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
