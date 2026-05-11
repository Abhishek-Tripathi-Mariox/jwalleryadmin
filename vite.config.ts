import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 9007,
    // Bind to all interfaces so the dev server is reachable from outside the
    // VM (e.g. via the public IP). Without this Vite only listens on
    // 127.0.0.1 and `http://<server-ip>:9007` returns ERR_CONNECTION_REFUSED.
    host: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
