import { Command } from "@tauri-apps/plugin-shell";

import { useEffect, useLayoutEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";

import { setLastCommitMessage } from "@/lib/Redux/gitSlice";
import { useAppDispatch, useAppSelector } from "@/lib/Redux/hooks";
import { setPullMsg } from "@/lib/Redux/pullMsg";
import { setRepo } from "@/lib/Redux/repoSlice";
import { setUser } from "@/lib/Redux/userSlice";

import { useTheme } from "@/components/provider/theme-provider";
import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
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
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

import { clsx } from "clsx";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Menu,
  Moon,
  MoveDown,
  RefreshCcw,
  Sun,
  SunMoon,
  Undo2,
} from "lucide-react";
import { HashLoader, PulseLoader } from "react-spinners";

import * as git from "@/lib/Backend/git";

import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function Toolbar() {
  const navigate = useNavigate();
  const { setTheme, theme, activeTheme } = useTheme();

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
    if (!dirLocation) return;

    async function readUserName() {
      const username = await git.configGetUsername(dirLocation);
      dispatch(setUser(username));
    }
    readUserName();

    if (repoName === "" || currentBranch === "") {
      setBranchList({ local: [], remote: [] });
    }
    async function getBranch() {
      try {
        const target: string = await git.currentBranch(dirLocation);
        const newBranchList: { local: string[]; remote: string[] } =
          await git.getBranchList(dirLocation);
        setBranchList(newBranchList);
        const showedBranch = newBranchList?.local?.find(
          (branch) => branch?.toLowerCase() === target?.toLowerCase(),
        );
        dispatch(setRepo({ branch: showedBranch }));
        localStorage.setItem("currentBranch", showedBranch?.toString() ?? "");
        setSwitchMessage(`${repoName}/${showedBranch}`);
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
      const command = Command.create("git 3 args", ["switch", branch, "--progress"], {
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

  const [isFetching, setIsFetching] = useState(false);
  const [fetchAmount, setFetchAmount] = useState<number>(() => {
    const amountFromStorage = parseInt(localStorage.getItem("fetchAmount") ?? "0");
    if (Number.isNaN(amountFromStorage)) return 0;
    return amountFromStorage;
  });

  useEffect(() => {
    localStorage.setItem("fetchAmount", fetchAmount.toString());
  }, [fetchAmount]);
  useEffect(() => {
    setFetchAmount(0);
  }, [dirLocation]);

  const highlighter = driver({});

  return (
    <header className="TB_1 bg-background sticky top-0 z-50 flex w-full items-center">
      <div className="flex h-auto w-full flex-col items-center">
        <div className="flex h-auto w-full grow flex-row">
          <div className="relative flex h-auto w-full items-center justify-center border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            <Tooltip>
              <TooltipTrigger
                render={
                  <h1 className="TB_2 text-base font-medium">
                    {repoName === "" ?
                      ""
                    : isSwitching ?
                      <span>{switchMessage}</span>
                    : <>
                        <span>{repoName}</span>/{currentBranch}
                      </>
                    }
                  </h1>
                }
              />
              <TooltipContent side="bottom">
                <p>Current Repo and Branch</p>
              </TooltipContent>
            </Tooltip>
            <span
              className="absolute bottom-0 left-0 h-0.5 animate-pulse bg-black dark:bg-white"
              style={{ width: `${switchPercentage}%` }}
            ></span>
          </div>
          <Select
            value={currentBranch}
            onValueChange={async (e) => {
              if (e === null) return;
              setIsSwitching(true);
              const toSwitch = e.replace(/origin\//gi, "").trim();
              toast({
                title: "Switching Branch",
                description: (
                  <PulseLoader
                    size={6}
                    speedMultiplier={0.8}
                    color={theme === "dark" ? "#FFFFFF" : "#000000"}
                  />
                ),
                duration: 6000,
              });
              try {
                const response = await switchBranch(dirLocation, toSwitch);
                toast({
                  title: "Switched Branch",
                  description: <p className="wrap-break-word whitespace-pre-wrap">{response}</p>,
                });
                setIsSwitching(false);
                dispatch(setRepo({ branch: e }));
                localStorage.setItem("currentBranch", e);
              } catch (error) {
                if (error instanceof Error) {
                  console.error(error);
                  toast({
                    title: "Failed to switch branch",
                    description: (
                      <p className="wrap-break-word whitespace-pre-wrap">{error.message}</p>
                    ),
                    variant: "destructive",
                  });
                }
              } finally {
                setIsSwitching(false);
                setSwitchMessage(`${repoName}/${toSwitch}`);
              }
            }}
          >
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="TB_3 h-fit w-fit rounded-none px-1 py-0"
                    render={<SelectTrigger className="w-fit rounded-none" />}
                  >
                    <GitBranch />
                  </Button>
                }
              />
              <TooltipContent side="bottom">
                <p>Change Branch</p>
              </TooltipContent>
            </Tooltip>

            <SelectContent className="h-fit max-h-[80svh] w-full">
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
        </div>
        <div className="flex h-fit w-full flex-row items-center justify-between border-b border-neutral-200 bg-white p-1 duration-200 ease-out dark:border-neutral-700 dark:bg-neutral-950">
          <div className="flex h-full flex-row items-center gap-2 sm:gap-4">
            <div className="flex w-fit flex-row items-center gap-1">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      className="TB_4"
                      disabled={window.history.state.idx == 0}
                      size="icon"
                      variant="ghost"
                      onClick={() => navigate(-1)}
                    >
                      <ChevronLeft />
                    </Button>
                  }
                />
                <TooltipContent side="bottom">
                  <p>Back</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      disabled={window.history.state.idx == window.history.length - 1}
                      className="TB_5 max-xs:hidden"
                      size="icon"
                      variant="ghost"
                      onClick={() => navigate(1)}
                    >
                      <ChevronRight />
                    </Button>
                  }
                />
                <TooltipContent side="bottom">
                  <p>Forward</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Separator orientation="vertical" className="h-full" />
            <ul className="flex flex-row items-center gap-6 sm:gap-12">
              <li
                className={clsx(
                  fetchAmount > 0 ? "border-t border-r border-b pr-2" : "",
                  "box-border flex h-10 items-center rounded-md duration-200 ease-out dark:border-neutral-800",
                )}
              >
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        className="TB_6"
                        size="icon"
                        variant="outline"
                        onClick={async () => {
                          try {
                            setIsFetching(true);
                            const result = await git.fetch(dirLocation);
                            const response = await git.getDiffCommit(dirLocation, currentBranch);
                            setFetchAmount(response.length);
                            if (result.startsWith("fatal") || result.startsWith("error")) {
                              toast({
                                title: "Error",
                                description: result,
                                variant: "destructive",
                              });
                            } else if (result == "") {
                              toast({
                                title: "Repository Up To Date",
                              });
                            } else {
                              toast({
                                title: "Repository Synced",
                                description: (
                                  <p>
                                    {result} <br /> Pull to integrate changes to local repository
                                  </p>
                                ),
                              });
                            }
                          } catch (error) {
                            if (error instanceof Error) {
                              console.error(error);
                              toast({
                                title: "Failed to fetch",
                                description: (
                                  <p className="wrap-break-word whitespace-pre-wrap">
                                    {error.message}
                                  </p>
                                ),
                                variant: "destructive",
                              });
                            } else {
                              toast({
                                title: "Failed to fetch",
                                description: error?.toString(),
                                variant: "destructive",
                              });
                            }
                          } finally {
                            setIsFetching(false);
                          }
                        }}
                      >
                        {isFetching ?
                          <Spinner />
                        : <RefreshCcw />}
                      </Button>
                    }
                  />
                  <TooltipContent side="bottom">
                    <p>Sync</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip disableHoverablePopup>
                  <TooltipTrigger
                    className={clsx(
                      fetchAmount > 0 ?
                        "visible w-fit min-w-5 opacity-100"
                      : "invisible w-0 opacity-100",
                      "flex h-full items-center text-lg font-medium duration-200 ease-out",
                    )}
                  >
                    <MoveDown
                      className={clsx(
                        fetchAmount > 0 ?
                          "translate-x-0 scale-100 opacity-100"
                        : "-translate-x-8 scale-0 opacity-0",
                        "min-w-fit duration-200 ease-out",
                      )}
                    />
                    <span
                      className={clsx(
                        fetchAmount > 0 ?
                          "translate-x-0 scale-100 opacity-100"
                        : "-translate-x-10 scale-0 opacity-0",
                        "duration-200 ease-out",
                      )}
                    >
                      {fetchAmount}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>
                      {fetchAmount > 0 ?
                        `${fetchAmount} incoming commit, press pull to integrate incoming commit`
                      : "Amount of incoming commit from origin"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </li>
              <li>
                <div className="flex gap-2 sm:gap-4">
                  <Tooltip>
                    <TooltipTrigger
                      render={
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
                                  color={activeTheme === "dark" ? "#FFFFFF" : "#000000"}
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
                                const regexTag = new RegExp(
                                  String.raw`From[\s\S]+${repoName}\s*, ([\s\S]+),(?:already up to date|updating \w+)`,
                                  "i",
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
                                    filesChanged: parseInt(matchSummary?.[1] ?? "0"),
                                    insertions: parseInt(matchSummary?.[2] ?? "0"),
                                    deletions: parseInt(matchSummary?.[3] ?? "0"),
                                  }),
                                );
                                const desc = (): string => {
                                  if (matchSummary) {
                                    return `${matchSummary?.[1] ?? 0} files changed, ${matchSummary?.[2] ?? 0} insertions (+), ${matchSummary?.[3] ?? 0} deletions (-)`;
                                  } else {
                                    return response.toString();
                                  }
                                };
                                toast({
                                  title: "Pulled Succesfully",
                                  description: desc(),
                                });
                                setFetchAmount(0);
                              }
                            } catch (error) {
                              if (error instanceof Error) {
                                console.error(error);
                                toast({
                                  title: "Failed to pull",
                                  description: (
                                    <p className="wrap-break-word whitespace-pre-wrap">
                                      {error.message}
                                    </p>
                                  ),
                                  variant: "destructive",
                                });
                              }
                            } finally {
                              setIsPulling(false);
                            }
                          }}
                        >
                          <HashLoader
                            size={24}
                            speedMultiplier={1.2}
                            color={activeTheme === "dark" ? "#FFFFFF" : "#000000"}
                            className={clsx(
                              isPulling ? "scale-100! opacity-100!" : "scale-0! opacity-0!",
                              "relative duration-300 ease-out",
                            )}
                          />
                          <ArrowDownToLine
                            className={clsx(
                              isPulling ?
                                "scale-0 -rotate-90 opacity-0"
                              : "scale-100 rotate-0 opacity-100",
                              "absolute duration-300 ease-out",
                            )}
                          />
                        </Button>
                      }
                    />
                    <TooltipContent side="bottom">
                      <p>Pull</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger
                      render={
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
                                  color={activeTheme === "dark" ? "#FFFFFF" : "#000000"}
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
                                const currentHash = await git.getLatestCommitHash(
                                  dirLocation,
                                  currentBranch,
                                  "remote",
                                );
                                dispatch(setRepo({ remoteHash: currentHash }));
                                localStorage.setItem("remoteRepoHash", currentHash.toString());
                              } catch (error) {
                                throw Error(error as string);
                              }
                            } catch (error) {
                              if (error instanceof Error) {
                                console.error(error);
                                toast({
                                  title: "Failed to push",
                                  description: (
                                    <p className="wrap-break-word whitespace-pre-wrap">
                                      {error.message}
                                    </p>
                                  ),
                                  variant: "destructive",
                                });
                              }
                            } finally {
                              setIsPushing(false);
                            }
                          }}
                        >
                          <HashLoader
                            size={24}
                            speedMultiplier={1.2}
                            color={activeTheme === "dark" ? "#FFFFFF" : "#000000"}
                            className={clsx(
                              isPushing ? "scale-100! opacity-100!" : "scale-0! opacity-0!",
                              "relative duration-300 ease-out",
                            )}
                          />
                          <ArrowUpToLine
                            className={clsx(
                              isPushing ?
                                "scale-0 -rotate-90 opacity-0"
                              : "scale-100 rotate-0 opacity-100",
                              "absolute duration-300 ease-out",
                            )}
                          />
                        </Button>
                      }
                    />
                    <TooltipContent side="bottom">
                      <p>Push</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </li>
              <li>
                <div className="flex gap-4">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          className="TB_8"
                          size="icon"
                          variant="outline"
                          onClick={async () => {
                            const lastCommitMessage = await git.getLastCommitMessage(dirLocation);
                            dispatch(
                              setLastCommitMessage(
                                lastCommitMessage.toString().trim().replace(/,$/g, ""),
                              ),
                            );
                            try {
                              const response = await git.undoLastCommit(dirLocation);
                              toast({
                                title: "Undo Succesfully",
                                description: response,
                              });
                              const localHash = await git.getLatestCommitHash(
                                dirLocation,
                                currentBranch,
                                "local",
                              );
                              dispatch(setRepo({ localHash: localHash }));
                              localStorage.setItem("localRepoHash", localHash);
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
                          }}
                        >
                          <Undo2 />
                        </Button>
                      }
                    />
                    <TooltipContent side="bottom">
                      <p>Undo Last Commit</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </li>
            </ul>
          </div>
          <Menubar className="sm:hidden">
            <MenubarMenu>
              <MenubarTrigger>
                <Menu />
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem
                  render={
                    <NavLink to="/settings">
                      <p>{username}</p>
                    </NavLink>
                  }
                />
                <MenubarSeparator />
                <MenubarGroup>
                  <MenubarSub>
                    <MenubarSubTrigger>
                      {theme === "light" ?
                        <Sun />
                      : theme === "dark" ?
                        <Moon />
                      : <SunMoon />}
                      Theme
                    </MenubarSubTrigger>
                    <MenubarSubContent>
                      <MenubarGroup>
                        <MenubarItem onClick={() => setTheme("light")}>
                          <Sun />
                          Light
                        </MenubarItem>
                        <MenubarItem onClick={() => setTheme("dark")}>
                          <Moon />
                          Dark
                        </MenubarItem>
                        <MenubarItem onClick={() => setTheme("system")}>
                          <SunMoon />
                          System
                        </MenubarItem>
                      </MenubarGroup>
                    </MenubarSubContent>
                  </MenubarSub>
                </MenubarGroup>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <div className="hidden h-full w-fit flex-row items-center gap-2 sm:flex md:gap-4">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    render={
                      <NavLink
                        to="/settings"
                        className="TB_9"
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
                          }, 50);
                        }}
                      />
                    }
                    variant="outline"
                    size="sm"
                    className="CMT_1 max-xs:hidden text-base"
                  >
                    {username}
                  </Button>
                }
              />
              <TooltipContent side="bottom">
                <p>
                  <b>username</b> used when using git commit
                </p>
              </TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" />
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
