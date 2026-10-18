import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Porta fixa: a API só aceita chamadas desta origem (CORS_ORIGIN no backend).
  // Se a 5173 estiver ocupada, o Vite avisa em vez de trocar de porta.
  server: { port: 5173, strictPort: true },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
