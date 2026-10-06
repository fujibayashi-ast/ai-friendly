import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 公開時は /settings/ に置く。ポートはトップ（apps/home/samples.ts）の転送先と揃える
  base: "/settings/",
  server: { port: 5174, strictPort: true },
});
