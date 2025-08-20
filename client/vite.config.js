import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    port: 3000,
    host: "0.0.0.0",
    base: "/",
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "8623772d-42f2-4847-92b4-3b6c3e49b220-00-1xro0juetxdg.riker.replit.dev",
      "https://lokalhunt.up.railway.app",
      "https://www.lokalhunt.com/",
      "https://lokalhunt.com/"
    ],
    proxy: {
      "/api": {
        target: "https://lokalhunt.up.railway.app",
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log(
              "Received Response from the Target:",
              proxyRes.statusCode,
              req.url,
            );
          });
        },
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
