import { describe, expect, test } from "bun:test";
import { messages } from "../i18n/messages";
import { qwenModels } from "./use-qwen";

describe("qwenModels", () => {
  test("each model has its own WebLLM id, label, and texts in both languages", () => {
    const models = Object.values(qwenModels);
    expect(new Set(models.map((m) => m.id)).size).toBe(models.length);
    expect(models.map((m) => m.label)).toEqual(["Qwen3.5 4B", "Qwen3.5 9B"]);
    for (const { description, note } of models) {
      for (const language of ["ja", "en"] as const) {
        expect(messages[language][description]).toContain("Qwen3.5");
        expect(messages[language][note]).toContain("GB");
      }
    }
  });
});
