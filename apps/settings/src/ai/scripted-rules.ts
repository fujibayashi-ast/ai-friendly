import type { ScriptedRule } from "@ai-friendly/assistant";

/** 仮のボットが反応する言い回し（本物の LLM をつなぐまでの確認用） */
export const scriptedRules: readonly ScriptedRule[] = [
  { pattern: /ダーク|暗く|dark/i, tool: "set_theme", input: { theme: "dark" } },
  {
    pattern: /ライト|明るく|light/i,
    tool: "set_theme",
    input: { theme: "light" },
  },
  { pattern: /英語|english/i, tool: "set_language", input: { language: "en" } },
  {
    pattern: /日本語|japanese/i,
    tool: "set_language",
    input: { language: "ja" },
  },
  { pattern: /リセット|reset/i, tool: "reset_settings" },
];
