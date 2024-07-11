import { useAppDispatch, useAppSelector } from "@/lib/Redux/hooks";
import { setRepo } from "@/lib/Redux/repoSlice";
import { useLayoutEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

import {
  ArrowDownToLine,
  ArrowUpToLine,
  GitBranch,
  Menu,
  Moon,
  Sun,
  SunMoon,
  Undo2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import * as git from "@/lib/git";
import { PulseLoader } from "react-spinners";

import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function Toolbar() {
  const navigate = useNavigate();
  const [themeMode, setThemeMode] = useState<string | null>(null);
  useLayoutEffect(() => {
    setThemeMode(window.localStorage.getItem("theme") ?? "System");
  }, []);
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (e.matches && !localStorage.theme) {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.className = "dark";
          document.documentElement.style.colorScheme = "dark";
        } else {
          document.documentElement.classList.remove("dark");
          document.documentElement.style.colorScheme = "light";
        }
      }
    });

  window
    .matchMedia("(prefers-color-scheme: light)")
    .addEventListener("change", (e) => {
      if (e.matches && !localStorage.theme) {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.className = "dark";
          document.documentElement.style.colorScheme = "dark";
        } else {
          document.documentElement.classList.remove("dark");
          document.documentElement.style.colorScheme = "light";
        }
      }
    });

  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const currentBranch = useAppSelector((state) => state.repo.branch);
  const [branchList, setBranchList] = useState<{
    local: string[];
    remote: string[];
  }>();
  const username = useAppSelector((state) => state.user.value);
  const repoName = useAppSelector((state) => state.repo.name);
  const dirLocation = useAppSelector((state) => state.repo.directory);
  useLayoutEffect(() => {
    if (repoName === "") return;
    async function getBranch() {
      try {
        const target: string = await git.currentBranch(dirLocation);
        const newBranchList: { local: string[]; remote: string[] } =
          await git.branchList(dirLocation);
        setBranchList(newBranchList);
        const showedBranch = newBranchList?.local?.find(
          (branch) => branch.toLowerCase() === target.toLowerCase()
        );
        dispatch(setRepo({ branch: showedBranch }));
        localStorage.setItem("currentBranch", showedBranch?.toString() ?? "");
      } catch (error) {
        console.error(error);
      }
    }
    getBranch();
  }, [currentBranch, repoName]);

  const highlighter = driver({});

  return (
    <div className="flex flex-col">
      <div className="flex w-full grow flex-row">
        <TooltipProvider delayDuration={350}>
          <div className="flex h-full w-full items-center justify-center border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            <Tooltip>
              <TooltipTrigger asChild>
                <h1 className="text-base font-medium">
                  {repoName === "" ?
                    ""
                  : <>
                      <span>{repoName}</span>/{currentBranch}
                    </>
                  }
                </h1>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Current Repo and Branch</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            value={currentBranch}
            onValueChange={async (e) => {
              toast({
                title: "Switching Branch",
                description: <PulseLoader size={6} speedMultiplier={0.8} />,
              });
              try {
                const toSwitch = e.replace(/origin\//gi, "").trim();
                const response = await git.switchBranch(dirLocation, toSwitch);
                toast({
                  title: "Switched Branch",
                  description: (
                    <p className="whitespace-pre-wrap break-words">
                      {response}
                    </p>
                  ),
                });
                dispatch(setRepo({ branch: e }));
                localStorage.setItem("currentBranch", e);
              } catch (error) {
                if (error instanceof Error) {
                  console.error(error);
                  toast({
                    title: "Failed to switch branch",
                    description: (
                      <p className="whitespace-pre-wrap break-words">
                        {error.message}
                      </p>
                    ),
                    variant: "destructive",
                  });
                }
              }
            }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" asChild>
                  <SelectTrigger className="w-fit rounded-none">
                    <GitBranch />
                  </SelectTrigger>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Change Branch</p>
              </TooltipContent>
            </Tooltip>

            <SelectContent className="h-fit max-h-[80dvh]">
              <SelectGroup>
                <SelectLabel>Local</SelectLabel>
                {branchList?.local?.map((branch) => {
                  return (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Remote</SelectLabel>
                {branchList?.remote?.map((branch) => {
                  return (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </TooltipProvider>
      </div>
      <div className="flex h-fit flex-row items-center justify-between border-b border-neutral-200 bg-white px-3 py-3 duration-200 ease-out dark:border-neutral-700 dark:bg-neutral-950">
        <div className="flex h-full flex-row items-center gap-2 sm:gap-4">
          <div className="flex w-fit flex-row items-center gap-1">
            <TooltipProvider delayDuration={550}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={window.history.state.idx == 0}
                    size="icon"
                    variant="ghost"
                    onClick={() => navigate(-1)}>
                    <ChevronLeft />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Back</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={
                      window.history.state.idx == window.history.length - 1
                    }
                    className="max-xs:hidden"
                    size="icon"
                    variant="ghost"
                    onClick={() => navigate(1)}>
                    <ChevronRight />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Forward</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Separator orientation="vertical" className="h-full" />
          <TooltipProvider delayDuration={100}>
            <ul className="flex flex-row items-center gap-6 sm:gap-12">
              <li>
                <div className="flex gap-2 sm:gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={async () => {
                          toast({
                            title: "Pulling Repository",
                            description: (
                              <PulseLoader size={6} speedMultiplier={0.8} />
                            ),
                          });
                          try {
                            const response = await git.pull(dirLocation);
                            if (response.toString().startsWith("fatal")) {
                              toast({
                                title: "Error",
                                description: response,
                                variant: "destructive",
                              });
                            } else {
                              toast({
                                title: "Pulled Succesfully",
                                description: response,
                              });
                            }
                          } catch (error) {
                            if (error instanceof Error) {
                              console.error(error);
                              toast({
                                title: "Failed to pull",
                                description: (
                                  <p className="whitespace-pre-wrap break-words">
                                    {error.message}
                                  </p>
                                ),
                                variant: "destructive",
                              });
                            }
                          }
                        }}>
                        <ArrowDownToLine />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Pull</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={async () => {
                          toast({
                            title: "Pushing Repository",
                            description: (
                              <PulseLoader size={6} speedMultiplier={0.8} />
                            ),
                          });
                          try {
                            const response = await git.push(dirLocation);
                            if (response.toString().includes("fatal")) {
                              toast({
                                title: "Failed to push",
                                description: response.toString().trim(),
                                variant: "destructive",
                              });
                            } else {
                              toast({
                                title: "Pushed Succesfully",
                                description: response.toString().trim(),
                              });
                            }
                          } catch (error) {
                            if (error instanceof Error) {
                              console.error(error);
                              toast({
                                title: "Failed to push",
                                description: (
                                  <p className="whitespace-pre-wrap break-words">
                                    {error.message}
                                  </p>
                                ),
                                variant: "destructive",
                              });
                            }
                          }
                        }}>
                        <ArrowUpToLine />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Push</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </li>
              <li>
                <div className="flex gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={async () => {
                          const response =
                            await git.undoLastCommit(dirLocation);
                          toast({
                            title: "Undo Succesfully",
                            description: response,
                          });
                        }}>
                        <Undo2 />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Undo Last Commit</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </li>
            </ul>
          </TooltipProvider>
        </div>
        <Menubar className="sm:hidden">
          <MenubarMenu>
            <MenubarTrigger>
              <Menu />
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem asChild>
                <NavLink to="/settings" className="">
                  <p className="text-base">{username}</p>
                </NavLink>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem
                className="flex flex-row items-center gap-2"
                onClick={() => {
                  // if the theme is dark, change to light
                  if (
                    document.documentElement.classList.contains("dark") &&
                    window.localStorage.getItem("theme") === "Dark"
                  ) {
                    document.documentElement.classList.remove("dark");
                    document.documentElement.style.colorScheme = "light";
                    window.localStorage.setItem("theme", "Light");
                    setThemeMode("Light");
                  }
                  // if the theme is light, change to follow system
                  else if (
                    !document.documentElement.classList.contains("dark") &&
                    window.localStorage.getItem("theme") === "Light"
                  ) {
                    document.documentElement.classList.remove("dark");
                    document.documentElement.style.removeProperty(
                      "color-scheme"
                    );
                    window.localStorage.removeItem("theme");
                    setThemeMode("System");
                  }
                  // if the theme is following system, change to dark
                  else {
                    document.documentElement.classList.add("dark");
                    document.documentElement.style.colorScheme = "dark";
                    window.localStorage.setItem("theme", "Dark");
                    setThemeMode("Dark");
                  }
                }}>
                {themeMode == "Light" ?
                  <Sun />
                : themeMode == "Dark" ?
                  <Moon />
                : <SunMoon />}
                {themeMode}
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <div className="hidden h-full w-fit flex-row items-center gap-2 sm:flex md:gap-4">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/settings"
                  className="hidden sm:block"
                  onClick={() => {
                    if (localStorage.getItem("username") !== null) return;
                    setTimeout(() => {
                      highlighter.highlight({
                        element: "#usernameInput",
                        popover: {
                          title: "Username Configuration",
                          description: "Change your username here",
                          showButtons: ["close"],
                          onCloseClick: () => {
                            highlighter.destroy();
                          },
                        },
                      });
                      setTimeout(() => {
                        highlighter.destroy();
                      }, 5000);
                    }, 1);
                  }}>
                  <Button variant="outline" size="sm">
                    <p className="text-base">{username}</p>
                  </Button>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>
                  <b>username</b> used when using git commit
                </p>
              </TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="h-full" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    // if the theme is dark, change to light
                    if (
                      document.documentElement.classList.contains("dark") &&
                      window.localStorage.getItem("theme") === "Dark"
                    ) {
                      document.documentElement.classList.remove("dark");
                      document.documentElement.style.colorScheme = "light";
                      window.localStorage.setItem("theme", "Light");
                      setThemeMode("Light");
                    }
                    // if the theme is light, change to follow system
                    else if (
                      !document.documentElement.classList.contains("dark") &&
                      window.localStorage.getItem("theme") === "Light"
                    ) {
                      document.documentElement.classList.remove("dark");
                      document.documentElement.style.removeProperty(
                        "color-scheme"
                      );
                      window.localStorage.removeItem("theme");
                      setThemeMode("System");
                    }
                    // if the theme is following system, change to dark
                    else {
                      document.documentElement.classList.add("dark");
                      document.documentElement.style.colorScheme = "dark";
                      window.localStorage.setItem("theme", "Dark");
                      setThemeMode("Dark");
                    }
                  }}>
                  {themeMode == "Light" ?
                    <Sun />
                  : themeMode == "Dark" ?
                    <Moon />
                  : <SunMoon />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{themeMode}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
