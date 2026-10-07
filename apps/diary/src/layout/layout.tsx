import { Outlet } from "react-router";
import { Header } from "./header";

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <Outlet />
      </main>
    </div>
  );
}
