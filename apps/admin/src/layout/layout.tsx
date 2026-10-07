import { Outlet } from "react-router";
import { Header } from "./header";
import { SideNav } from "./side-nav";

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <div className="mx-auto grid w-full max-w-6xl flex-1 content-start gap-6 px-4 py-6 sm:px-6 md:grid-cols-[180px_1fr] md:gap-10 md:py-10">
        <SideNav />
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
