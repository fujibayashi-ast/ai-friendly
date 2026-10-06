import { Check, LoaderCircle, X } from "lucide-react";
import type { Translate } from "../i18n/messages";
import type { ToolCall } from "../providers/provider";
import { failureMessage, isFailure } from "./tool-result";

export type ToolCallView = {
  call: ToolCall;
  /** 実行中は `undefined` */
  result: unknown;
  t: Translate;
};

/** ツールの実行を 1 行で見せる: `✓ set_theme(theme: "dark")` */
export function ToolCallLine({ call, result, t }: ToolCallView) {
  const running = result === undefined;
  const failed = !running && isFailure(result);
  const Icon = running ? LoaderCircle : failed ? X : Check;
  const label = t(
    running ? "tool.running" : failed ? "tool.failed" : "tool.done",
  );

  return (
    <div className="self-start max-w-full rounded-md bg-primary px-3 py-2 text-[13px] leading-5 text-primary-foreground">
      <div className="flex items-baseline gap-2">
        <Icon
          role="img"
          aria-label={label}
          className={
            running
              ? "size-3.5 shrink-0 translate-y-[3px] motion-safe:animate-spin"
              : failed
                ? "size-3.5 shrink-0 translate-y-[3px] text-red-700"
                : "size-3.5 shrink-0 translate-y-[3px]"
          }
        />
        <code className="min-w-0 break-all font-mono font-medium">
          {call.name}({formatInput(call.input)})
        </code>
      </div>
      {failed && (
        <p className="mt-1 ml-5.5 break-words">{failureMessage(result)}</p>
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
