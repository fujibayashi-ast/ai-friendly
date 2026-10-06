import { describe, expect, test } from "bun:test";
import { defaultSettings } from "./settings";
import { loadSettings, saveSettings } from "./storage";

const memoryStorage = (initial?: string) => {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set("ai-friendly:settings", initial);
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
};

describe("storage", () => {
  test("restores saved settings", () => {
    const storage = memoryStorage();
    saveSettings({ theme: "dark", language: "en" }, storage);
    expect(loadSettings(storage)).toEqual({ theme: "dark", language: "en" });
  });

  test("falls back to defaults for missing or broken data", () => {
    expect(loadSettings(memoryStorage())).toEqual(defaultSettings);
    expect(loadSettings(memoryStorage("{not json"))).toEqual(defaultSettings);
    expect(
      loadSettings(memoryStorage('{"theme":"blue","language":"ja"}')),
    ).toEqual(defaultSettings);
  });

  test("ignores storage errors", () => {
    const broken = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    };
    expect(loadSettings(broken)).toEqual(defaultSettings);
    expect(() => saveSettings(defaultSettings, broken)).not.toThrow();
  });
});
