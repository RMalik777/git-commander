import { Outlet } from "react-router-dom";

import { store } from "@/lib/Redux/store";
import { Provider } from "react-redux";

import { Navbar } from "@/components/Navbar/Navbar";
import { Toolbar } from "@/components/Tools/Toolbar";
import { Toaster } from "@/components/ui/toaster";

export default function Layout({
  children,
}: Readonly<{ children?: React.ReactNode }>) {
  return (
    <div className="flex h-dvh max-h-dvh min-h-dvh flex-col overflow-hidden scroll-smooth antialiased">
      <Provider store={store}>
        <Toolbar />
        <div className="min-w-dvw flex h-fit flex-grow flex-row overflow-hidden">
          <Navbar />
          <main className="flex-grow overflow-y-auto bg-white p-3 duration-200 ease-out dark:bg-neutral-950">
            {children ?? <Outlet />}
          </main>
          <Toaster />
        </div>
      </Provider>
    </div>
  );
}
