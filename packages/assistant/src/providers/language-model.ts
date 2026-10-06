// Chrome の Prompt API（`LanguageModel`）のうち、使う分だけの型

export type LanguageModelAvailability =
  | "unavailable"
  | "downloadable"
  | "downloading"
  | "available";

export type LanguageModelMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type LanguageModelSession = {
  prompt(
    input: LanguageModelMessage[],
    options?: { responseConstraint?: Record<string, unknown> },
  ): Promise<string>;
  destroy(): void;
};

type DownloadMonitor = EventTarget & {
  addEventListener(
    type: "downloadprogress",
    listener: (event: Event & { loaded: number }) => void,
  ): void;
};

type LanguageModelOptions = {
  expectedInputs?: { type: "text"; languages: string[] }[];
  expectedOutputs?: { type: "text"; languages: string[] }[];
};

type LanguageModelStatic = {
  availability(
    options?: LanguageModelOptions,
  ): Promise<LanguageModelAvailability>;
  create(
    options?: LanguageModelOptions & {
      initialPrompts?: LanguageModelMessage[];
      monitor?: (monitor: DownloadMonitor) => void;
    },
  ): Promise<LanguageModelSession>;
};

/** ない（Chrome 以外・古い Chrome）ときは undefined */
export function getLanguageModel(): LanguageModelStatic | undefined {
  return (globalThis as { LanguageModel?: LanguageModelStatic }).LanguageModel;
}

/** availability() と create() で同じものを渡す */
export const languageModelOptions: LanguageModelOptions = {
  expectedInputs: [{ type: "text", languages: ["en", "ja"] }],
  expectedOutputs: [{ type: "text", languages: ["en", "ja"] }],
};
