import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar/Navbar";
import Toolbar from "@/components/Tools/Toolbar";

export default function Layout({ children }) {
  return (
    <div className="flex max-h-dvh min-h-dvh flex-col overflow-hidden">
      <Toolbar />
      <div className="min-w-dvw flex h-fit flex-grow flex-row overflow-hidden scroll-smooth">
        <Navbar />
        <main className="flex-grow overflow-y-auto bg-neutral-50 p-3">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
