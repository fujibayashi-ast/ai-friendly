/**
 * サンプル（題材）の一覧。トップのカード・開発時の転送・公開用のまとめはここから作る
 * 足すときは、題材の `vite.config.ts` の `base`（`/<id>/`）と `server.port` をここと揃え、カードの文言を `src/i18n/messages.ts` に足す
 */
export const samples = [
  {
    id: "settings",
    port: 5174,
    /** カードに載せる例（話しかける文は i18n、呼ばれる Command はそのまま） */
    example: { name: "set_theme", input: { theme: "dark" } },
  },
  {
    id: "tasks",
    port: 5175,
    example: { name: "clear_completed", input: {} },
  },
  {
    id: "shop",
    port: 5176,
    example: { name: "sort_products", input: { order: "price_asc" } },
  },
  {
    id: "reservation",
    port: 5177,
    example: { name: "fill_reservation_form", input: { party_size: 2 } },
  },
  {
    id: "admin",
    port: 5178,
    example: { name: "show_products", input: { max_stock: 5 } },
  },
] as const;

export type SampleId = (typeof samples)[number]["id"];
