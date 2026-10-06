import { cn } from "@ai-friendly/ui";
import { Check, LoaderCircle, X } from "lucide-react";

export type ToolCallStatus = "running" | "done" | "failed";

export type ToolCallLineProps = {
  name: string;
  input: unknown;
  status: ToolCallStatus;
  /** 読み上げ用の状態（「完了」など） */
  statusLabel: string;
  /** 失敗の理由（人向けの短い文） */
  error?: string;
  /** 失敗の理由の詳しい内容（デバッグ用の英文） */
  detail?: string;
};

/** ツールの実行を 1 行で見せる: `✓ set_theme(theme: "dark")`。実行中は灰、成功は黄、失敗は赤 */
export function ToolCallLine({
  name,
  input,
  status,
  statusLabel,
  error,
  detail,
}: ToolCallLineProps) {
  const Icon =
    status === "running" ? LoaderCircle : status === "failed" ? X : Check;

  return (
    <div
      className={cn(
        "max-w-full self-start rounded-md px-3 py-2 text-[13px] leading-5 transition-colors motion-reduce:transition-none",
        status === "running" && "bg-muted text-muted-foreground",
        status === "failed" && "bg-destructive/10 text-destructive",
        status === "done" && "bg-primary text-primary-foreground",
      )}
    >
      <div className="flex items-baseline gap-2">
        <Icon
          role="img"
          aria-label={statusLabel}
          className={cn(
            "size-3.5 shrink-0 translate-y-[3px]",
            status === "running" && "motion-safe:animate-spin",
          )}
        />
        <code className="min-w-0 break-all font-mono font-medium">
          {name}({formatInput(input)})
        </code>
      </div>
      {(error || detail) && (
        <div className="mt-1 ml-5.5 break-words">
          {error && <p>{error}</p>}
          {detail && <p className="mt-0.5 font-mono text-xs">{detail}</p>}
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
