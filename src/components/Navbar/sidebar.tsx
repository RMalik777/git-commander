import { clsx } from "clsx";
import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";
import { NavLink, useLocation } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { menuItem } from "@/lib/const/nav";

export function AppSidebar() {
  const { toggleSidebar, state } = useSidebar();
  const location = useLocation();

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarMenu className="gap-2">
            {menuItem.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  size="lg"
                  variant="invert"
                  tooltip={item.name}
                  isActive={location.pathname === item.link}
                  render={
                    <NavLink to={item.link}>
                      {item.icon && <item.icon />}
                      <span>{item.name}</span>
                    </NavLink>
                  }
                />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button className="p-2" variant="outline" onClick={() => toggleSidebar()}>
          <div className="relative size-full">
            <ArrowRightToLine
              className={clsx(
                "absolute inset-0 size-full transition duration-200",
                state === "collapsed" ? "opacity-100" : "opacity-0",
              )}
            />
            <ArrowLeftToLine
              className={clsx(
                "absolute inset-0 size-full transition duration-200",
                state === "expanded" ? "opacity-100" : "opacity-0",
              )}
            />
          </div>
          <span className="sr-only">{state === "collapsed" ? "Expand" : "Collapse"}</span>
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
