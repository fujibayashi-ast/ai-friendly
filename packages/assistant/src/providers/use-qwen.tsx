import type { MLCEngineInterface } from "@mlc-ai/web-llm";
import { useEffect, useMemo, useState } from "react";
import type { ProviderOption } from "../chat/chat";
import {
  type ChatLanguage,
  createTranslate,
  type MessageKey,
} from "../i18n/messages";
import { ModelSetup } from "../ui/model-setup";
import { createWebLlmProvider } from "./web-llm-provider";

export type QwenModel = "4B" | "9B";

export const qwenModels: Record<
  QwenModel,
  { id: string; label: string; description: MessageKey; note: MessageKey }
> = {
  "4B": {
    id: "Qwen3.5-4B-q4f16_1-MLC",
    label: "Qwen3.5 4B",
    description: "qwen.4b.description",
    note: "qwen.4b.note",
  },
  "9B": {
    id: "Qwen3.5-9B-q4f16_1-MLC",
    label: "Qwen3.5 9B",
    description: "qwen.9b.description",
    note: "qwen.9b.note",
  },
};

type Status = "checking" | "unavailable" | "ready" | "loading" | "available";

/**
 * WebLLM で動かす Qwen3.5（`model` は 4B か 9B。既定は 4B）を `Chat` の `providers` の候補にする
 * WebGPU があれば「モデルを読み込む」を出し、押したときだけダウンロード・読み込みをする（初回は 4B が約 2.4 GB・9B が約 5 GB）
 * 4B と 9B を両方読み込むと、両方がページを閉じるまでメモリに残る
 *
 * @example
 * const qwen = useQwen({ system, language });
 * const qwen9b = useQwen({ system, language, model: "9B" });
 * <FloatingChat providers={[claude, geminiNano, qwen]} … />
 * @see docs/assistant.md
 */
export function useQwen({
  system,
  language,
  model = "4B",
}: {
  system?: string;
  language: ChatLanguage;
  model?: QwenModel;
}): ProviderOption {
  const { id, label, description, note } = qwenModels[model];
  const [status, setStatus] = useState<Status>("checking");
  const [progress, setProgress] = useState(0);
  // 進み具合はダウンロード・GPU への読み込みなどの段階ごとに 0 から数え直すので、段階で文言を変える
  const [downloading, setDownloading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [engine, setEngine] = useState<MLCEngineInterface>();

  useEffect(() => {
    const gpu = (navigator as { gpu?: { requestAdapter(): Promise<unknown> } })
      .gpu;
    if (!gpu) {
      setStatus("unavailable");
      return;
    }
    gpu.requestAdapter().then(
      (adapter) => setStatus(adapter ? "ready" : "unavailable"),
      () => setStatus("unavailable"),
    );
  }, []);

  const load = async () => {
    setFailed(false);
    setProgress(0);
    setStatus("loading");
    let worker: Worker | undefined;
    try {
      // WebLLM は大きいので、押したときに読み込む
      const { CreateWebWorkerMLCEngine } = await import("@mlc-ai/web-llm");
      worker = new Worker(new URL("./web-llm-worker.ts", import.meta.url), {
        type: "module",
      });
      setEngine(
        await CreateWebWorkerMLCEngine(worker, id, {
          initProgressCallback: (report) => {
            setDownloading(report.text.startsWith("Fetching"));
            setProgress(report.progress);
          },
        }),
      );
      setStatus("available");
    } catch {
      worker?.terminate();
      setFailed(true);
      setStatus("ready");
    }
  };

  const provider = useMemo(
    () => (engine ? createWebLlmProvider({ engine, system }) : undefined),
    [engine, system],
  );
  const t = createTranslate(language);

  const handleLoad = () => {
    void load();
  };

  return {
    label,
    provider,
    setup: status !== "available" && (
      <ModelSetup
        status={status}
        progress={progress}
        failed={failed}
        onLoad={handleLoad}
        texts={{
          description: t(description),
          action: t("qwen.load"),
          note: t(note),
          loading: t(downloading ? "qwen.downloading" : "qwen.loading"),
          failed: t("qwen.failed"),
          unavailable: t("qwen.unavailable"),
        }}
      />
    ),
  };
}
