// 公開用に、各アプリのビルドを 1 つにまとめる（/ がトップ、/<id>/ が各サンプル）
// 各アプリをビルドした後に、ルートの `bun run build` から呼ぶ

import { cp, rm } from "node:fs/promises";
import { join } from "node:path";
import { samples } from "./samples";

const root = join(import.meta.dir, "../..");
const out = join(root, "dist");

await rm(out, { recursive: true, force: true });
await cp(join(root, "apps/home/dist"), out, { recursive: true });
for (const sample of samples) {
  await cp(join(root, "apps", sample.id, "dist"), join(out, sample.id), {
    recursive: true,
  });
}
console.log(`dist: / and ${samples.map((s) => `/${s.id}/`).join(", ")}`);
