import type { ReactNode } from "react";

/** AI の返事。吹き出しなしの地の文 */
export function AssistantMessage({ children }: { children: ReactNode }) {
  return <p className="text-sm whitespace-pre-wrap break-words">{children}</p>;
}
