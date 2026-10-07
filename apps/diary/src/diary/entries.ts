import type { Entry } from "./diary";

/** ダミーの日記 */
export const initialEntries: readonly Entry[] = [
  {
    id: 1,
    date: "2026-10-02",
    weather: "sunny",
    title: "公園でお昼",
    body: "天気がよかったので、お弁当を持って近くの公園へ。ベンチで食べるおにぎりは、なぜかいつもよりおいしい。",
  },
  {
    id: 2,
    date: "2026-10-03",
    weather: "cloudy",
    title: "本屋さん",
    body: "駅前の本屋さんで、気になっていた料理の本を買った。週末に何か作ってみたい。",
  },
  {
    id: 3,
    date: "2026-10-04",
    weather: "rainy",
    title: "雨の日の映画",
    body: "一日中雨だったので、家で古い映画を観た。紅茶をいれて、のんびり過ごした。",
  },
  {
    id: 4,
    date: "2026-10-05",
    weather: "sunny",
    title: "朝の散歩",
    body: "早起きして川沿いを散歩。金木犀の香りがして、秋だなと思った。",
  },
  {
    id: 5,
    date: "2026-10-06",
    weather: "cloudy",
    title: "パンを焼いた",
    body: "買った料理の本を見ながら、初めてパンを焼いた。少しかたかったけれど、次はもっとうまくできそう。",
  },
];
