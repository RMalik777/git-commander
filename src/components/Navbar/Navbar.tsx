import { useLayoutEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

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

const iconClass = "min-w-fit z-10";
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
      className={
        "border-r border-neutral-200 bg-white px-3 py-3 transition-all duration-150 ease-out dark:border-neutral-700 dark:bg-neutral-950 " +
        (navOpen ? "w-1/6 min-w-fit" : "w-16 min-w-fit")
      }
    >
      <nav
        className={
          "flex h-full flex-col justify-between duration-200 ease-out" +
          (navOpen ? "items-end" : "items-center")
        }
      >
        <TooltipProvider delayDuration={50}>
          <ul className={"flex w-full flex-col gap-4 " + (navOpen ? "self-end" : "")}>
            {menuItem.map((item) => {
              return (
                <li key={item.link} className="w-full">
                  <Tooltip open={navOpen ? false : undefined}>
                    <TooltipTrigger asChild>
                      <NavLink to={item.link} className="group block h-fit w-full" viewTransition>
                        <Button
                          className={
                            "group relative justify-start gap-2 p-2 transition-all duration-150 ease-out " +
                            (navOpen ? "w-full" : "")
                          }
                          size="icon"
                          variant={currentPath.pathname == item.link ? "default" : "ghost"}
                        >
                          {item.icon}
                          {navOpen ? item.name : ""}
                        </Button>
                      </NavLink>
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
