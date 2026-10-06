import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { samples } from "./samples.ts";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    // 開発中も公開後と同じ /<id>/ で各サンプルを開けるよう、各サンプルの開発サーバーに転送する
    proxy: Object.fromEntries(
      samples.map((sample) => [
        `/${sample.id}/`,
        { target: `http://localhost:${sample.port}`, ws: true },
      ]),
    ),
  },
});
