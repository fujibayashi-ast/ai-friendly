import { ToolCallLine } from "@ai-friendly/assistant";

/** サンプルへのリンク。話しかける例と、そのとき AI が呼ぶ Command を添える */
export function SampleCard({
  href,
  title,
  description,
  example,
  call,
}: {
  href: string;
  title: string;
  description: string;
  example: string;
  call: { name: string; input: unknown };
}) {
  return (
    <a
      href={href}
      className="flex h-full flex-col gap-4 rounded-xl border p-5 outline-none transition-colors hover:border-foreground/30 focus-visible:ring-[3px] focus-visible:ring-ring motion-reduce:transition-none"
    >
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
          {description}
        </p>
      </div>
      <div aria-hidden className="mt-auto flex flex-col items-start gap-2">
        <span className="rounded-2xl rounded-br-sm bg-muted px-3 py-1.5 text-sm">
          {example}
        </span>
        <ToolCallLine {...call} status="done" statusLabel="" />
      </div>
    </a>
  );
}
