import { Command } from "@tauri-apps/api/shell";

import { useLayoutEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/lib/Redux/hooks";
import { setPullMsg } from "@/lib/Redux/pullMsg";
import { setRepo } from "@/lib/Redux/repoSlice";
import { setLastCommitMessage } from "@/lib/Redux/gitSlice";

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

import {
  ArrowDownToLine,
  ArrowUpToLine,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Menu,
  Moon,
  Sun,
  SunMoon,
  Undo2,
} from "lucide-react";
import { HashLoader, PulseLoader } from "react-spinners";

import * as git from "@/lib/git";

import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function Toolbar() {
  const navigate = useNavigate();
  const [themeMode, setThemeMode] = useState<string | null>(null);
  useLayoutEffect(() => {
    setThemeMode(window.localStorage.getItem("theme") ?? "System");
  }, []);
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (e.matches && !localStorage.getItem("theme")) {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.className = "dark";
        document.documentElement.style.colorScheme = "dark";
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.style.colorScheme = "light";
      }
    }
  });

  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (e) => {
    if (e.matches && !localStorage.getItem("theme")) {
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
    if (repoName === "" || currentBranch === "") {
      setBranchList({ local: [], remote: [] });
    }
    async function getBranch() {
      try {
        const target: string = await git.currentBranch(dirLocation);
        const newBranchList: { local: string[]; remote: string[] } =
          await git.branchList(dirLocation);
        setBranchList(newBranchList);
        const showedBranch = newBranchList?.local?.find(
          (branch) => branch?.toLowerCase() === target?.toLowerCase()
        );
        dispatch(setRepo({ branch: showedBranch }));
        localStorage.setItem("currentBranch", showedBranch?.toString() ?? "");
      } catch (error) {
        console.error(error);
      }
    }
    getBranch();
  }, [currentBranch, repoName]);

  const [isSwitching, setIsSwitching] = useState(false);
  const [switchPercentage, setSwitchPercentage] = useState(0);
  const [switchMessage, setSwitchMessage] = useState(`${repoName}/${currentBranch}`);

  async function switchBranch(path: string, branch: string) {
    const response = new Promise((resolve, reject) => {
      const resultNormal: string[] = [],
        resultReject: string[] = [];
      const command = new Command("git 3 args", ["switch", branch, "--progress"], {
        cwd: path,
      });
      command.on("close", () => {
        setSwitchPercentage(0);
        if (resultReject.length > 1) {
          const result = resultReject.join("").trim();
          const leadingError = /(^error:)([\S\s]+)(aborting)/gi;
          const newError = RegExp(leadingError).exec(result);
          if (newError) reject(new Error(newError?.[2].trim()));
          else resolve(result);
        }
        resolve(resultNormal);
      });
      command.on("error", (error) => reject(new Error(error)));
      command.stdout.on("data", (data) => resultNormal.push(data));
      command.stderr.on("data", (data) => {
        const output: string = data.toString();
        if (output.startsWith("Updating")) {
          const percentage = /(\d+)%/g;
          setSwitchMessage(output);
          setSwitchPercentage(parseInt(percentage.exec(output)?.[1] ?? "0"));
        } else {
          resultReject.push(output);
        }
      });
      command.spawn().catch((error) => reject(new Error(error)));
    });
    return (await response) as string;
  }

  const [isPulling, setIsPulling] = useState(false);
  const [isPushing, setIsPushing] = useState(false);

  const highlighter = driver({});

  return (
    <header className="TB_1 flex flex-col">
      <div className="flex w-full grow flex-row">
        <TooltipProvider delayDuration={350}>
          <div className="relative flex h-full w-full items-center justify-center border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            <Tooltip>
              <TooltipTrigger asChild>
                <h1 className="TB_2 text-base font-medium">
                  {repoName === "" ?
                    ""
                  : isSwitching ?
                    <>
                      <span>{switchMessage}</span>
                    </>
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
            <span
              className="absolute bottom-0 left-0 h-[2px] animate-pulse bg-black dark:bg-white"
              style={{ width: `${switchPercentage}%` }}></span>
          </div>
          <Select
            value={currentBranch}
            onValueChange={async (e) => {
              setIsSwitching(true);
              const toSwitch = e.replace(/origin\//gi, "").trim();
              toast({
                title: "Switching Branch",
                description: (
                  <PulseLoader
                    size={6}
                    speedMultiplier={0.8}
                    color={themeMode === "Dark" ? "#FFFFFF" : "#000000"}
                  />
                ),
                duration: 6000,
              });
              try {
                const response = await switchBranch(dirLocation, toSwitch);
                toast({
                  title: "Switched Branch",
                  description: <p className="whitespace-pre-wrap break-words">{response}</p>,
                });
                setIsSwitching(false);
                dispatch(setRepo({ branch: e }));
                localStorage.setItem("currentBranch", e);
              } catch (error) {
                if (error instanceof Error) {
                  console.error(error);
                  toast({
                    title: "Failed to switch branch",
                    description: <p className="whitespace-pre-wrap break-words">{error.message}</p>,
                    variant: "destructive",
                  });
                }
              } finally {
                setIsSwitching(false);
                setSwitchMessage(`${repoName}/${toSwitch}`);
              }
            }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" asChild className="TB_3">
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
                    className="TB_4"
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
            </TooltipProvider>
            <TooltipProvider delayDuration={550}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={window.history.state.idx == window.history.length - 1}
                    className="TB_5 max-xs:hidden"
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
                        className="TB_6"
                        size="icon"
                        variant="outline"
                        onClick={async () => {
                          setIsPulling(true);
                          toast({
                            title: "Pulling Repository",
                            description: (
                              <PulseLoader
                                size={6}
                                speedMultiplier={0.8}
                                color={themeMode === "Dark" ? "#FFFFFF" : "#000000"}
                              />
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
                            } else if (response.toString().includes("Already up to date")) {
                              toast({
                                title: "Already up to date",
                              });
                            } else {
                              const toCompare = response.toString().trim();
                              console.log(toCompare);
                              const regexTag = new RegExp(
                                String.raw`From[\s\S]+${repoName}\s*, ([\s\S]+),(?:already up to date|updating \w+)`,
                                "i"
                              );
                              const regexChanges =
                                /Fast-forward\s([\s\S]+)\s\d+ files changed, \d+ insertions\(\+\), \d+ deletions\(-\)/i;
                              const regexSummary =
                                /(\d+) files changed, (\d+) insertions\(\+\), (\d+) deletions\(-\)/i;
                              const matchTag = toCompare.match(regexTag);
                              const matchChanges = toCompare.match(regexChanges);
                              const matchSummary = toCompare.match(regexSummary);
                              dispatch(
                                setPullMsg({
                                  tagBranch: matchTag?.[1]?.toString() ?? "",
                                  changes: matchChanges?.[1]?.toString() ?? "",
                                  filesChanged: parseInt(matchSummary?.[1] ?? 0),
                                  insertions: parseInt(matchSummary?.[2] ?? 0),
                                  deletions: parseInt(matchSummary?.[3] ?? 0),
                                })
                              );
                              const desc = (): string => {
                                if (matchSummary) {
                                  return `${matchSummary?.[1] ?? 0} files changed, ${matchSummary?.[2] ?? 0} insertions (+), ${matchSummary?.[3] ?? 0} deletions (-)`;
                                } else {
                                  return response;
                                }
                              };
                              toast({
                                title: "Pulled Succesfully",
                                description: desc(),
                              });
                            }
                          } catch (error) {
                            if (error instanceof Error) {
                              console.error(error);
                              toast({
                                title: "Failed to pull",
                                description: (
                                  <p className="whitespace-pre-wrap break-words">{error.message}</p>
                                ),
                                variant: "destructive",
                              });
                            }
                          } finally {
                            setIsPulling(false);
                          }
                        }}>
                        <HashLoader
                          size={24}
                          speedMultiplier={1.2}
                          color={themeMode === "Dark" ? "#FFFFFF" : "#000000"}
                          className={
                            (isPulling ? "!scale-100 !opacity-100" : "!scale-0 !opacity-0") +
                            " relative duration-300 ease-out"
                          }
                        />
                        <ArrowDownToLine
                          className={
                            (isPulling ?
                              "-rotate-90 scale-0 opacity-0"
                            : "rotate-0 scale-100 opacity-100") + " absolute duration-300 ease-out"
                          }
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Pull</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="TB_7"
                        size="icon"
                        variant="outline"
                        onClick={async () => {
                          setIsPushing(true);
                          toast({
                            title: "Pushing Repository",
                            description: (
                              <PulseLoader
                                size={6}
                                speedMultiplier={0.8}
                                color={themeMode === "Dark" ? "#FFFFFF" : "#000000"}
                              />
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
                            try {
                              const currentHash = await git.getLatestRemoteCommitHash(
                                dirLocation,
                                currentBranch
                              );
                              dispatch(setRepo({ hash: currentHash }));
                              localStorage.setItem("currentRepoHash", currentHash.toString());
                            } catch (error) {
                              throw Error(error as string);
                            }
                          } catch (error) {
                            if (error instanceof Error) {
                              console.error(error);
                              toast({
                                title: "Failed to push",
                                description: (
                                  <p className="whitespace-pre-wrap break-words">{error.message}</p>
                                ),
                                variant: "destructive",
                              });
                            }
                          } finally {
                            setIsPushing(false);
                          }
                        }}>
                        <HashLoader
                          size={24}
                          speedMultiplier={1.2}
                          color={themeMode === "Dark" ? "#FFFFFF" : "#000000"}
                          className={
                            (isPushing ? "!scale-100 !opacity-100" : "!scale-0 !opacity-0") +
                            " relative duration-300 ease-out"
                          }
                        />

                        <ArrowUpToLine
                          className={
                            (isPushing ?
                              "-rotate-90 scale-0 opacity-0"
                            : "rotate-0 scale-100 opacity-100") + " absolute duration-300 ease-out"
                          }
                        />
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
                        className="TB_8"
                        size="icon"
                        variant="outline"
                        onClick={async () => {
                          const lastCommitMessage = await git.getLastCommitMessage(dirLocation);
                          dispatch(
                            setLastCommitMessage(
                              lastCommitMessage.toString().trim().replace(/,$/g, "")
                            )
                          );
                          try {
                            const response = await git.undoLastCommit(dirLocation);
                            toast({
                              title: "Undo Succesfully",
                              description: response,
                            });
                          } catch (error) {
                            console.error(error);
                            if (error instanceof Error) {
                              toast({
                                title: "Failed to undo",
                                description: error.message,
                                variant: "destructive",
                              });
                            }
                            toast({
                              title: "Failed to undo",
                              description: "An unknown error occured while undoing last commit",
                              variant: "destructive",
                            });
                          }
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
                    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                      document.documentElement.classList.add("dark");
                      document.documentElement.style.colorScheme = "dark";
                    } else {
                      document.documentElement.classList.remove("dark");
                      document.documentElement.style.removeProperty("color-scheme");
                    }
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
                  <Sun className="duration-200" />
                : themeMode == "Dark" ?
                  <Moon className="duration-200" />
                : <SunMoon className="duration-200" />}
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
                  className="TB_9 hidden sm:block"
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
                  <Button variant="outline" size="sm" className="CMT_1">
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
                  className="TB_10"
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
                      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                        document.documentElement.classList.add("dark");
                        document.documentElement.style.colorScheme = "dark";
                      } else {
                        document.documentElement.classList.remove("dark");
                        document.documentElement.style.removeProperty("color-scheme");
                      }
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
                  <Sun
                    className={
                      (themeMode == "Light" ? "rotate-0 scale-100" : "rotate-90 scale-0") +
                      " absolute duration-200 ease-out"
                    }
                  />
                  <Moon
                    className={
                      (themeMode == "Dark" ? "rotate-0 scale-100" : "rotate-90 scale-0") +
                      " absolute duration-200 ease-out"
                    }
                  />
                  <SunMoon
                    className={
                      (themeMode !== "Dark" && themeMode !== "Light" ?
                        "rotate-0 scale-100"
                      : "-rotate-90 scale-0") + " absolute duration-200 ease-out"
                    }
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{themeMode}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
