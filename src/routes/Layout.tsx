import { Outlet } from "react-router";

import { store } from "@/lib/Redux/store";
import { Provider } from "react-redux";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/integrations/theme-provider";
import { QueryProvider } from "@/lib/integrations/query-provider";
import { Devtools } from "@/lib/integrations/devtools";

import { AppSidebar } from "@/components/Navbar/sidebar";
import { Toolbar } from "@/components/Navbar/top-toolbar";
import { Toaster } from "@/components/ui/toaster";
import { TerminalView } from "@/components/Tools/TerminalView";

export default function Layout({ children }: Readonly<{ children?: React.ReactNode }>) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryProvider>
        <div className="[--header-height:calc(--spacing(20))]">
          <Provider store={store}>
            <TooltipProvider delay={150}>
              <SidebarProvider className="flex flex-col">
                <Toolbar />
                <div className="flex flex-1">
                  <AppSidebar />
                  <SidebarInset className="p-2">{children ?? <Outlet />}</SidebarInset>
                </div>
                <TerminalView />
                <Toaster />
              </SidebarProvider>
            </TooltipProvider>
          </Provider>
        </div>
        <Devtools />
      </QueryProvider>
    </ThemeProvider>
  );
}
