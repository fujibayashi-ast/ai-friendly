import type { Language } from "../settings/settings";

const ja = {
  siteName: "サンプルサイト",
  heading: "ようこそ",
  lead: "表示の設定は、右上から変えられます。",
  "theme.label": "テーマ",
  "theme.light": "ライト",
  "theme.dark": "ダーク",
  "language.label": "言語",
  "reset.title": "設定をリセットしますか？",
  "reset.description": "テーマと言語が初期設定に戻ります。",
  "reset.confirm": "リセットする",
  "confirm.cancel": "やめる",
};

export type MessageKey = keyof typeof ja;

const en: Record<MessageKey, string> = {
  siteName: "Sample Site",
  heading: "Welcome",
  lead: "You can change the display settings in the top right.",
  "theme.label": "Theme",
  "theme.light": "Light",
  "theme.dark": "Dark",
  "language.label": "Language",
  "reset.title": "Reset your settings?",
  "reset.description": "The theme and language will go back to the defaults.",
  "reset.confirm": "Reset",
  "confirm.cancel": "Cancel",
};

export const messages: Record<Language, Record<MessageKey, string>> = {
  ja,
  en,
};

export type Translate = (key: MessageKey) => string;

export function createTranslate(language: Language): Translate {
  return (key) => messages[language][key];
}
