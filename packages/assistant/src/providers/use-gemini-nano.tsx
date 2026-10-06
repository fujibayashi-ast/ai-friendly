import { useEffect, useMemo, useState } from "react";
import type { ProviderOption } from "../chat/chat";
import { type ChatLanguage, createTranslate } from "../i18n/messages";
import { ModelSetup } from "../ui/model-setup";
import { createGeminiNanoProvider } from "./gemini-nano-provider";
import { getLanguageModel, languageModelOptions } from "./language-model";

type Status =
  | "checking"
  | "unavailable"
  | "downloadable"
  | "downloading"
  | "available";

/**
 * Gemini Nano を `Chat` の `providers` の候補にする
 * 使えるか確かめ、モデルがなければ「ダウンロード」を出す（ダウンロードはユーザーが押したときだけ）
 *
 * @example
 * const geminiNano = useGeminiNano({ system, language });
 * <FloatingChat providers={[claude, geminiNano]} … />
 * @see docs/assistant.md
 */
export function useGeminiNano({
  system,
  language,
}: {
  system?: string;
  language: ChatLanguage;
}): ProviderOption {
  const [status, setStatus] = useState<Status>("checking");
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const LanguageModel = getLanguageModel();
    if (!LanguageModel) {
      setStatus("unavailable");
      return;
    }
    LanguageModel.availability(languageModelOptions).then(
      // ほかのタブでダウンロード中でも、ここでは押せば続きを待てる
      (next) => setStatus(next === "downloading" ? "downloadable" : next),
      () => setStatus("unavailable"),
    );
  }, []);

  const download = async () => {
    const LanguageModel = getLanguageModel();
    if (!LanguageModel) return;
    setFailed(false);
    setProgress(0);
    setStatus("downloading");
    try {
      const session = await LanguageModel.create({
        ...languageModelOptions,
        monitor(monitor) {
          monitor.addEventListener("downloadprogress", (event) =>
            setProgress(event.loaded),
          );
        },
      });
      session.destroy();
      setStatus("available");
    } catch {
      setFailed(true);
      setStatus("downloadable");
    }
  };

  const provider = useMemo(
    () =>
      status === "available" ? createGeminiNanoProvider({ system }) : undefined,
    [status, system],
  );
  const t = createTranslate(language);

  const handleLoad = () => {
    void download();
  };

  return {
    label: "Gemini Nano",
    provider,
    setup: status !== "available" && (
      <ModelSetup
        status={
          status === "downloadable"
            ? "ready"
            : status === "downloading"
              ? "loading"
              : status
        }
        progress={progress}
        failed={failed}
        onLoad={handleLoad}
        texts={{
          description: t("nano.description"),
          action: t("nano.download"),
          note: t("nano.downloadNote"),
          loading: t("nano.downloading"),
          failed: t("nano.downloadFailed"),
          unavailable: t("nano.unavailable"),
        }}
      />
    ),
  };
}
