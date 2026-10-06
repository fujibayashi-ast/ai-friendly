import type { AiTool } from "@ai-friendly/command";
import type { ChatMessage, ChatProvider } from "../providers/provider";

export type RunChatOptions = {
  provider: ChatProvider;
  messages: readonly ChatMessage[];
  /** 状態が変わるとツールが作り直されるので、ステップごとに最新を読む */
  getTools: () => readonly AiTool[];
  onMessage: (message: ChatMessage) => void;
  maxSteps?: number;
};

export type RunChatResult = "done" | "too_many_steps";

/** LLM → ツール → 結果を LLM に返す、を返事だけになるまで繰り返す */
export async function runChat({
  provider,
  messages,
  getTools,
  onMessage,
  maxSteps = 5,
}: RunChatOptions): Promise<RunChatResult> {
  const history = [...messages];
  const push = (message: ChatMessage) => {
    history.push(message);
    onMessage(message);
  };

  for (let step = 0; step < maxSteps; step++) {
    const reply = await provider.complete({
      messages: [...history],
      tools: getTools(),
    });
    push({ role: "assistant", ...reply });
    if (!reply.toolCalls?.length) return "done";

    for (const call of reply.toolCalls) {
      const tools = getTools();
      const tool = tools.find((t) => t.name === call.name);
      const result = tool
        ? await tool.execute(call.input)
        : {
            ok: false,
            code: "invalid_command",
            message: `unknown tool "${call.name}" (available: ${tools.map((t) => t.name).join(", ")})`,
          };
      push({ role: "tool", toolCallId: call.id, result });
    }
  }
  return "too_many_steps";
}
