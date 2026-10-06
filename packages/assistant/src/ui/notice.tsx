import type { ReactNode } from "react";

/** 返事を受け取れなかったなどのお知らせ */
export function Notice({ children }: { children: ReactNode }) {
  return <p className="text-sm text-destructive">{children}</p>;
}
