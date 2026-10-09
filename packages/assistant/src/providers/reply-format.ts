/** チャットは返事を文のまま出す（Markdown を表示に変換しない）ので、どのプロバイダでも LLM にこう伝える */
export const plainTextRule =
  "Write your replies in plain text without Markdown (no **, #, or tables). The chat shows them as is.";
