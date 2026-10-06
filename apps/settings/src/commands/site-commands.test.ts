import { describe, expect, mock, test } from "bun:test";
import { createCommandSession } from "@ai-friendly/command";
import { defaultSettings, type Settings } from "../settings/settings";
import { siteCommands } from "./site-commands";

const setup = (confirm?: () => Promise<boolean>) => {
  let state: Settings = { theme: "light", language: "ja" };
  const store = {
    getState: () => state,
    setState: mock((next: Settings) => {
      state = next;
    }),
  };
  const session = createCommandSession({
    store,
    commands: siteCommands,
    confirm,
  });
  return { store, session };
};

describe("site commands from AI", () => {
  test("write a batch to the site's state at once", async () => {
    const { store, session } = setup();
    await session.executeRaw(
      [
        { type: "set_language", language: "en" },
        { type: "set_theme", theme: "dark" },
      ],
      "ai",
    );
    expect(store.getState()).toEqual({ theme: "dark", language: "en" });
    expect(store.setState).toHaveBeenCalledTimes(1);
  });

  test("reset the settings only after confirmation", async () => {
    const approved = setup(async () => true);
    expect(
      await approved.session.executeRaw({ type: "reset_settings" }, "ai"),
    ).toEqual({ ok: true });
    expect(approved.store.getState()).toEqual(defaultSettings);

    const declined = setup(async () => false);
    expect(
      await declined.session.executeRaw({ type: "reset_settings" }, "ai"),
    ).toMatchObject({ ok: false, code: "rejected" });
    expect(declined.store.setState).not.toHaveBeenCalled();
  });
});
