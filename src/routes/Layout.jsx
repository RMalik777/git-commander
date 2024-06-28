import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar/Navbar";
import Toolbar from "@/components/Tools/Toolbar";
import { store } from "@/lib/Redux/store";
import { Provider } from "react-redux";

export default function Layout({ children }) {
  return (
    <div className="flex h-dvh max-h-dvh min-h-dvh flex-col overflow-hidden scroll-smooth antialiased">
      <Provider store={store}>
        <Toolbar />
        <div className="min-w-dvw flex h-fit flex-grow flex-row overflow-hidden">
          <Navbar />
          <main className="flex-grow overflow-y-auto bg-neutral-50 p-3">
            {children ?? <Outlet />}
          </main>
          <Toaster />
        </div>
      </Provider>
    </div>
  );
}
