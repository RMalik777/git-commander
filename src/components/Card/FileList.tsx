import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/Redux/hooks";
import { setRepo } from "@/lib/Redux/repoSlice";
import { FileEntry, readDir } from "@tauri-apps/api/fs";
import { writeText } from "@tauri-apps/api/clipboard";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FolderRoot,
  FolderContent,
  FolderItem,
  FolderTrigger,
} from "@/components/ui/folder";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

import { RefreshCw, File } from "lucide-react";

import * as git from "@/lib/git";

export default function FileList() {
  const dispatch = useAppDispatch();
  const repoName = useAppSelector((state) => state.repo.name);
  const dir = useAppSelector((state) => state.repo.directory);

  const diffList = useAppSelector((state) => state.repo.diff);
  async function getDiff() {
    const data = await git.showChanged(dir);
    const toEntry = data.map((item: string) => {
      return {
        name: item.split("/").pop(),
        path: item,
      } as FileEntry;
    });
    dispatch(setRepo({ diff: toEntry }));
  }
  useEffect(() => {
    if (dir === "") return;
    getDiff();
  }, [dir]);

  const stagedList = useAppSelector((state) => state.repo.staged);
  async function getStaged() {
    const data = await git.showStaged(dir);
    const toEntry = data.map((item: string) => {
      return {
        name: item.split("/").pop(),
        path: item,
      } as FileEntry;
    });
    dispatch(setRepo({ staged: toEntry }));
  }
  useEffect(() => {
    if (dir === "") return;
    getStaged();
  }, [dir]);

  const [dirList, setDirList] = useState<FileEntry[]>(
    JSON.parse(localStorage.getItem("dirList") ?? "[]")
  );
  function recursiveSort(parent: FileEntry[]) {
    parent.sort((a, b) => a.name?.localeCompare(b.name ?? "") ?? 0);
    parent.sort((a, b) => {
      if (a.children && !b.children) return -1;
      if (!a.children && b.children) return 1;
      return 0;
    });
    parent.forEach((child) => {
      if (child.children) {
        child.children.sort((a, b) => a.name?.localeCompare(b.name ?? "") ?? 0);
        child.children.sort((a, b) => {
          if (a.children && !b.children) return -1;
          if (!a.children && b.children) return 1;
          return 0;
        });
        recursiveSort(child.children);
      }
    });
    return parent;
  }
  async function getAllChildDir(repo: string) {
    try {
      const dir = await readDir(repo, { recursive: true });
      recursiveSort(dir);
      localStorage.setItem("dirList", JSON.stringify(dir));
      return dir;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  async function setDirectory() {
    setDirList(await getAllChildDir(dir));
  }
  useEffect(() => {
    if (dir === "") return;
    setDirectory();
  }, [repoName, dir, stagedList, diffList]);
  function actionButton(file: FileEntry) {
    let fileStatus = "Unchanged";
    if (
      diffList.some((target) => {
        return (
          target.path === file.name ||
          target.path ===
            file.path.replace(dir, "").replaceAll("\\", "/").replace("/", "") ||
          target.path.startsWith(
            file.path.replace(dir, "").replaceAll("\\", "/").replace("/", "")
          )
        );
      })
    ) {
      fileStatus = "Changed";
    } else if (
      stagedList.some((target) => {
        return (
          target.path === file.name ||
          target.path === file.path.replace(dir + "\\", "")
        );
      })
    ) {
      fileStatus = "Staged";
    }
    return (
      <div className="flex flex-row items-center gap-2">
        <TooltipProvider delayDuration={250} disableHoverableContent>
          {fileStatus === "Changed" ?
            <h4 className="text-sm text-neutral-300 duration-200 dark:text-neutral-600">
              Edited
            </h4>
          : fileStatus === "Staged" ?
            <h4 className="dark:text-neutal-600 text-sm text-neutral-300 duration-200">
              Staged
            </h4>
          : null}
        </TooltipProvider>
      </div>
    );
  }
  function recursiveDirRenderer(
    parent: FileEntry[],
    root: boolean
  ): React.ReactNode {
    return (
      <>
        {parent.map((child) => {
          let fileStatus = "Unchanged";
          if (
            diffList.some((target) => {
              return (
                target.path === child.name ||
                target.path ===
                  child.path
                    .replace(dir, "")
                    .replace(/\\/g, "/")
                    .replace("/", "") ||
                target.path.startsWith(
                  child.path
                    .replace(dir, "")
                    .replace(/\\/g, "/")
                    .replace("/", "")
                )
              );
            })
          ) {
            fileStatus = "Changed";
          } else if (
            stagedList.some((target) => {
              return (
                target.path === child.name ||
                target.path.split("/").shift() ===
                  child.path.replace(dir + "\\", "")
              );
            })
          ) {
            fileStatus = "Staged";
          }
          return (
            <div key={child.path}>
              <ContextMenu>
                <ContextMenuTrigger>
                  {child.children ?
                    <FolderRoot
                      className={"group " + (root ? "" : "ml-4 border-l")}
                      type="multiple">
                      <FolderItem value="item-1" className="">
                        <FolderTrigger className="group p-1 pl-2">
                          <div className="flex w-full justify-between">
                            {child.name}
                            {actionButton(child)}
                          </div>
                        </FolderTrigger>
                        <FolderContent>
                          {recursiveDirRenderer(child.children, false)}
                        </FolderContent>
                      </FolderItem>
                    </FolderRoot>
                  : <div
                      className={
                        "group flex items-center gap-4 p-1 pl-7 hover:bg-neutral-100 dark:hover:bg-neutral-800 " +
                        (root ? "" : "ml-4 border-l")
                      }>
                      <File className="h-4 w-4" />
                      <button className="flex w-full items-center justify-between">
                        {child.name}
                        {actionButton(child)}
                      </button>
                    </div>
                  }
                </ContextMenuTrigger>

                <ContextMenuContent className="w-64">
                  <ContextMenuItem>{child.name}</ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem inset disabled={fileStatus != "Changed"}>
                    Stage
                  </ContextMenuItem>
                  <ContextMenuItem inset disabled={fileStatus != "Staged"}>
                    Unstage
                  </ContextMenuItem>
                  <ContextMenuItem inset>Revert</ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem inset>Open</ContextMenuItem>
                  <ContextMenuItem
                    inset
                    onClick={async () => {
                      await writeText(child.path);
                    }}>
                    Copy Path
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    inset
                    className="font-medium text-red-500 focus:bg-red-500/10">
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </div>
          );
        })}
      </>
    );
  }
  return (
    <Card className="w-full">
      <CardHeader className="">
        <CardTitle className="flex items-center gap-4">
          File List{" "}
          <TooltipProvider delayDuration={50}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-fit w-fit"
                  onClick={async () => {
                    await getDiff();
                    await getStaged();
                  }}>
                  <RefreshCw size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-normal tracking-normal">Refresh</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription className="flex max-w-full flex-col text-balance leading-relaxed">
          Stage your file before committing to the repository.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-4 pt-3">
        {dirList ? recursiveDirRenderer(dirList, true) : null}
      </CardContent>
    </Card>
  );
}
