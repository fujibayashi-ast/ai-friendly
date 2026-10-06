// WebLLM の推論を画面と別のスレッドで動かす（`useQwen` が Worker として読み込む）

import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (message: MessageEvent) => {
  handler.onmessage(message);
};
