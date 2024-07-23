import { useLayoutEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  ArrowLeftToLine,
  ArrowRightToLine,
  CircleHelp,
  FolderOpen,
  Home,
  Settings,
  GitBranchPlus,
} from "lucide-react";

const menuItem = [
  {
    name: "Home",
    link: "/",
    icon: <Home />,
  },
  {
    name: "Source Control",
    link: "/repo",
    icon: <GitBranchPlus />,
  },
  {
    name: "Content",
    link: "/folder",
    icon: <FolderOpen />,
  },
  {
    name: "Settings",
    link: "/settings",
    icon: <Settings />,
  },
  {
    name: "Help",
    link: "/help",
    icon: <CircleHelp />,
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
        "border-r border-neutral-200 bg-white px-3 py-3 transition-all duration-200 ease-out dark:border-neutral-700 dark:bg-neutral-950 " +
        (navOpen ? "w-1/6 min-w-fit" : "w-fit")
      }>
      <nav
        className={
          "flex h-full flex-col justify-between duration-200 ease-out" +
          (navOpen ? "items-end" : "items-center")
        }>
        <TooltipProvider delayDuration={50}>
          <ul
            className={
              "flex w-full flex-col gap-4 " + (navOpen ? "self-end" : "")
            }>
            {menuItem.map((item) => {
              return (
                <li key={item.link} className="w-full">
                  <Tooltip open={navOpen ? false : undefined}>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.link}
                        className="group block h-fit w-full">
                        <Button
                          className={
                            "" +
                            (navOpen ? "w-full justify-start gap-2 p-2" : "")
                          }
                          size="icon"
                          variant={
                            currentPath.pathname == item.link ?
                              "default"
                            : "ghost"
                          }>
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
                }}>
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
