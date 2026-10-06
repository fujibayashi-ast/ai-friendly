import type { ReactNode } from "react";

/** あなたのメッセージ。右寄せの吹き出し */
export function UserMessage({
  label,
  children,
}: {
  /** 読み上げ用の話し手の名前（「あなた」） */
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm whitespace-pre-wrap break-words">
        <span className="sr-only">{label}: </span>
        {children}
      </p>
    </div>
  );
}
