import { useState, useLayoutEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Home,
  GitGraph,
  ArrowRightToLine,
  ArrowLeftToLine,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Navbar() {
  const [navOpen, setNavOpen] = useState(false);
  const currentPath = useLocation();
  useLayoutEffect(() => {
    setNavOpen(localStorage.getItem("navOpen") == "true" ? true : false);
    console.log(navOpen);
  }, [navOpen]);

  return (
    <aside
      className={
        "border-r border-neutral-200 px-3 py-3 transition-all duration-200 ease-out" +
        (navOpen ? "w-1/6" : "w-fit")
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
            <li className="w-full">
              <Tooltip open={navOpen ? false : undefined}>
                <TooltipTrigger asChild>
                  <NavLink to={"/"} className="group block h-fit w-full">
                    <Button
                      className={
                        "" + (navOpen ? "w-full justify-start gap-2 p-2" : "")
                      }
                      size="icon"
                      variant={
                        currentPath.pathname == "/" ? "default" : "ghost"
                      }>
                      <Home className="" />
                      {navOpen ? "Home" : ""}
                    </Button>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Home</p>
                </TooltipContent>
              </Tooltip>
            </li>
            <li className="w-full">
              <Tooltip open={navOpen ? false : undefined}>
                <TooltipTrigger asChild>
                  <NavLink to={"/git"} className="group block h-fit w-full">
                    <Button
                      className={
                        "" + (navOpen ? "w-full justify-start gap-2 p-2" : "")
                      }
                      size="icon"
                      variant={
                        currentPath.pathname == "/git" ? "default" : "ghost"
                      }>
                      <GitGraph className="" />
                      {navOpen ? "Source" : ""}
                    </Button>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Git</p>
                </TooltipContent>
              </Tooltip>
            </li>
            <li className="w-full">
              <Tooltip open={navOpen ? false : undefined}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={"/settings"}
                    className="group block h-fit w-full">
                    <Button
                      className={
                        "" + (navOpen ? "w-full justify-start gap-2 p-2" : "")
                      }
                      size="icon"
                      variant={
                        currentPath.pathname == "/settings" ?
                          "default"
                        : "ghost"
                      }>
                      <Settings className="" />
                      {navOpen ? "Settings" : ""}
                    </Button>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
            </li>
          </ul>
          <Button
            size="icon"
            variant="ghost"
            className={navOpen ? "self-end" : ""}
            onClick={() => {
              setNavOpen(!navOpen);
              localStorage.setItem("navOpen", !navOpen);
            }}>
            {navOpen ?
              <ArrowLeftToLine size={18} className="" />
            : <ArrowRightToLine size={18} className="" />}
          </Button>
        </TooltipProvider>
      </nav>
    </aside>
  );
}
