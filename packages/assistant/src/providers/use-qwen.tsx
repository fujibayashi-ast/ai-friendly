import type { MLCEngineInterface } from "@mlc-ai/web-llm";
import { useEffect, useMemo, useState } from "react";
import type { ProviderOption } from "../chat/chat";
import { type ChatLanguage, createTranslate } from "../i18n/messages";
import { ModelSetup } from "../ui/model-setup";
import { createWebLlmProvider } from "./web-llm-provider";

const modelId = "Qwen3.5-4B-q4f16_1-MLC";

type Status = "checking" | "unavailable" | "ready" | "loading" | "available";

/**
 * WebLLM で動かす Qwen3.5 4B を `Chat` の `providers` の候補にする
 * WebGPU があれば「モデルを読み込む」を出し、押したときだけダウンロード・読み込みをする（初回は約 2.4 GB）
 *
 * @example
 * const qwen = useQwen({ system, language });
 * <FloatingChat providers={[claude, geminiNano, qwen]} … />
 * @see docs/assistant.md
 */
export function useQwen({
  system,
  language,
}: {
  system?: string;
  language: ChatLanguage;
}): ProviderOption {
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
        await CreateWebWorkerMLCEngine(worker, modelId, {
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
    label: "Qwen3.5 4B",
    provider,
    setup: status !== "available" && (
      <ModelSetup
        status={status}
        progress={progress}
        failed={failed}
        onLoad={handleLoad}
        texts={{
          description: t("qwen.description"),
          action: t("qwen.load"),
          note: t("qwen.note"),
          loading: t(downloading ? "qwen.downloading" : "qwen.loading"),
          failed: t("qwen.failed"),
          unavailable: t("qwen.unavailable"),
        }}
      />
    ),
  };
}
