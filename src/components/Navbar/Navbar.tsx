import { useLayoutEffect, useState } from "react";
import { NavLink, useLocation } from "react-router";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import {
  ArrowLeftToLine,
  ArrowRightToLine,
  CircleHelp,
  Code2,
  FolderOpen,
  GitBranchPlus,
  Home,
  Package,
  Settings,
} from "lucide-react";
import { clsx } from "clsx";

const iconClass = clsx("z-10 min-w-fit");
const menuItem = [
  {
    name: "Home",
    link: "/",
    icon: <Home className={iconClass} />,
  },
  {
    name: "Source Control",
    link: "/staging",
    icon: <GitBranchPlus className={iconClass} />,
  },
  {
    name: "Copy and Zip",
    link: "/zip",
    icon: <Package className={iconClass} />,
  },
  {
    name: "Content",
    link: "/folder",
    icon: <FolderOpen className={iconClass} />,
  },
  {
    name: "Editor",
    link: "/editor",
    icon: <Code2 className={iconClass} />,
  },
  {
    name: "Settings",
    link: "/settings",
    icon: <Settings className={iconClass} />,
  },
  {
    name: "Help",
    link: "/help",
    icon: <CircleHelp className={iconClass} />,
  },
];

export function Navbar() {
  const [navOpen, setNavOpen] = useState(false);
  const currentPath = useLocation();
  useLayoutEffect(() => {
    setNavOpen(localStorage.getItem("navOpen") == "true" ? true : false);
  }, [navOpen]);

  return (
    <aside
      className={clsx(
        navOpen ? "w-1/6 min-w-fit" : "w-16 min-w-fit",
        "border-r border-neutral-200 bg-white px-3 py-3 transition-all duration-150 ease-out dark:border-neutral-700 dark:bg-neutral-950",
      )}
    >
      <nav
        className={clsx(
          navOpen ? "items-end" : "items-center",
          "flex h-full flex-col justify-between duration-200 ease-out",
        )}
      >
        <TooltipProvider delayDuration={50}>
          <ul className={clsx(navOpen ? "self-end" : "", "flex w-full flex-col gap-4")}>
            {menuItem.map((item) => {
              return (
                <li key={item.link} className="w-full">
                  <Tooltip open={navOpen ? false : undefined}>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        className={clsx(
                          navOpen ? "w-full" : "",
                          "group relative justify-start gap-2 p-2 transition-all duration-150 ease-out",
                        )}
                        size="icon"
                        variant={currentPath.pathname == item.link ? "default" : "ghost"}
                      >
                        <NavLink to={item.link} className="group block h-fit w-full">
                          {item.icon}
                          {navOpen ? item.name : ""}
                        </NavLink>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className={navOpen ? "self-end" : ""}
                onClick={() => {
                  setNavOpen(!navOpen);
                  localStorage.setItem("navOpen", (!navOpen).toString());
                }}
              >
                {navOpen ?
                  <ArrowLeftToLine size={18} className="" />
                : <ArrowRightToLine size={18} className="" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{navOpen ? "Collapse" : "Expand"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
    </aside>
  );
}
