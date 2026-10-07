import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 公開時は /diary/ に置く。ポートはトップ（apps/home/samples.ts）の転送先と揃える
  base: "/diary/",
  server: { port: 5179, strictPort: true },
});
