import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "/",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "/",
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
