import { useState, useLayoutEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/lib/Redux/hooks";
import { setRepo } from "@/lib/Redux/repoSlice";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

import { useToast } from "@/components/ui/use-toast";

import {
  ArrowDownToLine,
  ArrowUpToLine,
  GitBranch,
  GitCompare,
  Undo2,
  SunMoon,
  Sun,
  Moon,
} from "lucide-react";

import * as git from "@/lib/git";
import { PulseLoader } from "react-spinners";

export default function Toolbar() {
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
  const [branchList, setBranchList] = useState<string[]>([]);

  const username = useAppSelector((state) => state.user.value);
  const repoName = useAppSelector((state) => state.repo.name);
  const dirLocation = useAppSelector((state) => state.repo.directory);
  useLayoutEffect(() => {
    if (repoName === "") return;
    async function getBranch() {
      try {
        const target: string = await git.currentBranch(dirLocation);
        const newBranchList: string[] = await git.branchList(dirLocation);
        setBranchList(newBranchList);
        const showedBranch = newBranchList?.find(
          (branch) => branch.toLowerCase() === target.toLowerCase()
        );
        dispatch(setRepo({ branch: showedBranch }));
      } catch (error) {
        console.error(error);
      }
    }
    getBranch();
  }, [currentBranch, repoName]);

  return (
    <div className="flex h-fit flex-row items-center justify-between border-b border-neutral-200 bg-white px-3 py-3 duration-200 ease-out dark:border-neutral-700 dark:bg-neutral-950">
      <TooltipProvider delayDuration={50}>
        <div className="flex h-full flex-row items-center gap-4">
          <Button variant="outline" size="sm">
            <h1 className="">
              {repoName === "" ?
                ""
              : <>
                  <span>{repoName}</span>/{currentBranch}
                </>
              }
            </h1>
          </Button>
          <Separator orientation="vertical" className="h-full" />
          <ul className="flex flex-row items-center gap-12">
            <li>
              <div className="flex gap-4">
                <Select
                  value={currentBranch}
                  onValueChange={async (e) => {
                    toast({
                      title: "Switching Branch",
                      description: (
                        <PulseLoader size={6} speedMultiplier={0.8} />
                      ),
                    });
                    try {
                      const response = await git.switchBranch(dirLocation, e);
                      toast({
                        title: "Switched Branch",
                        description: (
                          <p className="whitespace-pre-wrap break-words">
                            {response}
                          </p>
                        ),
                      });
                      dispatch(setRepo({ branch: e }));
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
                        <SelectTrigger className="w-fit">
                          <GitBranch />
                        </SelectTrigger>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Branch</p>
                    </TooltipContent>
                  </Tooltip>
                  <SelectContent className="h-fit max-h-[80dvh]">
                    {branchList?.map((branch) => {
                      return (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {/* <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="outline">
                      <GitCompare />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Compare</p>
                  </TooltipContent>
                </Tooltip> */}
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
                        try {
                          const response = await git.push(dirLocation);
                          if (response.toString().startsWith("fatal")) {
                            toast({
                              title: "Error",
                              description: response,
                              variant: "destructive",
                            });
                          } else {
                            toast({
                              title: "Pushed Succesfully",
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
                        const response = await git.undoLastCommit(dirLocation);
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
        </div>
        <div className="flex h-full w-fit flex-row items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink to="/settings">
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
        </div>
      </TooltipProvider>
    </div>
  );
}
