import type { ReactNode } from "react";
import { Header } from "./header";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      {children}
    </div>
  );
}
