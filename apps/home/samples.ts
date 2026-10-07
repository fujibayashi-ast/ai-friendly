/**
 * サンプル（題材）の一覧。トップのカード・開発時の転送・公開用のまとめはここから作る
 * 足すときは、題材の `vite.config.ts` の `base`（`/<id>/`）と `server.port` をここと揃え、カードの文言を `src/i18n/messages.ts` に足す
 * `group` は、トップのどの区分に出すか（`main`: 本編・`extra`: おまけ）
 */
export const samples = [
  {
    id: "settings",
    group: "main",
    port: 5174,
    /** カードに載せる例（話しかける文は i18n、呼ばれる Command はそのまま） */
    example: { name: "set_theme", input: { theme: "dark" } },
  },
  {
    id: "tasks",
    group: "main",
    port: 5175,
    example: { name: "clear_completed", input: {} },
  },
  {
    id: "shop",
    group: "main",
    port: 5176,
    example: { name: "sort_products", input: { order: "price_asc" } },
  },
  {
    id: "reservation",
    group: "main",
    port: 5177,
    example: { name: "fill_reservation_form", input: { party_size: 2 } },
  },
  {
    id: "admin",
    group: "main",
    port: 5178,
    example: { name: "show_products", input: { max_stock: 5 } },
  },
  {
    id: "diary",
    group: "extra",
    port: 5179,
    example: { name: "fill_entry", input: { weather: "rainy" } },
  },
] as const;

export type SampleId = (typeof samples)[number]["id"];
