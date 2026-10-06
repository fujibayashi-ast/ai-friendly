import { cn } from "@ai-friendly/ui";
import { Check, LoaderCircle, X } from "lucide-react";
import type { Translate } from "../i18n/messages";
import type { ToolCall } from "../providers/provider";
import { failureMessage, isFailure, isRejected } from "./tool-result";

export type ToolCallView = {
  call: ToolCall;
  /** 実行中は `undefined` */
  result: unknown;
  t: Translate;
  /** 失敗の理由に、LLM 向けの英文のメッセージも出す */
  debug: boolean;
};

/** ツールの実行を 1 行で見せる: `✓ set_theme(theme: "dark")`。実行中は灰、成功は黄、失敗は赤 */
export function ToolCallLine({ call, result, t, debug }: ToolCallView) {
  const running = result === undefined;
  const failed = !running && isFailure(result);
  const Icon = running ? LoaderCircle : failed ? X : Check;
  const label = t(
    running ? "tool.running" : failed ? "tool.failed" : "tool.done",
  );

  return (
    <div
      className={cn(
        "max-w-full self-start rounded-md px-3 py-2 text-[13px] leading-5 transition-colors motion-reduce:transition-none",
        running && "bg-muted text-muted-foreground",
        failed && "bg-destructive/10 text-destructive",
        !running && !failed && "bg-primary text-primary-foreground",
      )}
    >
      <div className="flex items-baseline gap-2">
        <Icon
          role="img"
          aria-label={label}
          className={cn(
            "size-3.5 shrink-0 translate-y-[3px]",
            running && "motion-safe:animate-spin",
          )}
        />
        <code className="min-w-0 break-all font-mono font-medium">
          {call.name}({formatInput(call.input)})
        </code>
      </div>
      {failed && (
        <div className="mt-1 ml-5.5 break-words">
          <p>{t(isRejected(result) ? "tool.rejected" : "tool.error")}</p>
          {debug && (
            <p className="mt-0.5 font-mono text-xs">{failureMessage(result)}</p>
          )}
        </div>
      )}
    </div>
  );
}

function formatInput(input: unknown): string {
  if (typeof input !== "object" || input === null) return "";
  return Object.entries(input)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join(", ");
}
