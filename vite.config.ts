
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Define environment variables that should be available in the client
  define: {
    'process.env.GOOGLE_MAPS_API_KEY': JSON.stringify('AIzaSyCrSTkKN9Og1iHVqbf1dUHslx1HEJ1krYA')
  }
}));
