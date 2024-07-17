import { useState } from "react";

import { writeText } from "@tauri-apps/api/clipboard";
import { FileEntry } from "@tauri-apps/api/fs";
import { open } from "@tauri-apps/api/shell";

import { useAppDispatch } from "@/lib/Redux/hooks";
import { setRepo } from "@/lib/Redux/repoSlice";

import {
  List,
  ListContent,
  ListHeader,
  ListItem,
  ListTrigger,
} from "@/components/ui/accordion-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  FolderContent,
  FolderItem,
  FolderRoot,
  FolderTrigger,
} from "@/components/ui/folder";
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

import { File, FolderOpen, Minus, Plus, RefreshCw, Undo } from "lucide-react";

import { ConfirmationDialog } from "@/components/Dialog/Confirmation";

import * as git from "@/lib/git";

export function Staging({
  dir,
  dirList,
  diffList,
  stagedList,
}: Readonly<{
  dir: string;
  dirList: FileEntry[];
  diffList: FileEntry[];
  stagedList: FileEntry[];
}>) {
  const [viewMode, setViewMode] = useState(
    localStorage.getItem("viewMode")?.toString() ?? "list"
  );
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [openDialogId, setOpenDialogId] = useState("");

  async function getDiff() {
    const data = await git.showChanged(dir);
    const toEntry = await data.map((item: string) => {
      return {
        name: item.split("/").pop(),
        path: item,
      } as FileEntry;
    });
    dispatch(setRepo({ diff: toEntry }));
    localStorage.setItem("diffList", JSON.stringify(toEntry));
  }

  async function getStaged() {
    const data = await git.showStaged(dir);
    const toEntry = await data.map((item: string) => {
      return {
        name: item.split("/").pop(),
        path: item,
      } as FileEntry;
    });
    dispatch(setRepo({ staged: toEntry }));
    localStorage.setItem("stagedList", JSON.stringify(toEntry));
  }

  function actionButton(file: FileEntry, mode: string) {
    return (
      <div className="STG_5A STG_5 UST_5 UST_5A hidden flex-row items-center gap-2 group-hover:flex group-focus:flex">
        <TooltipProvider delayDuration={250} disableHoverableContent>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="STG_6 UST_6 h-5 w-5 shrink-0 rounded p-px duration-200 ease-out hover:bg-neutral-200 hover:dark:bg-neutral-800"
                onClick={async () => {
                  await open(file.path);
                }}>
                <FolderOpen className="h-full w-full" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              {mode === "Changed" ?
                <button
                  className="STG_7 h-5 w-5 shrink-0 rounded duration-200 ease-out hover:bg-neutral-200 hover:dark:bg-neutral-800"
                  onClick={async () => {
                    try {
                      await git.addFile(dir, file.path);
                    } catch (error) {
                      console.error(error);
                      if (error instanceof Error) {
                        toast({
                          title: "Error Staging",
                          description: (
                            <p>
                              <code>{file.name}</code> can&apos;t be staged
                              <br />
                              <code>{error.message}</code>
                            </p>
                          ),
                          variant: "destructive",
                        });
                      }
                      return;
                    }
                    await getDiff();
                    await getStaged();
                  }}>
                  <Plus className="h-full w-full" />
                </button>
              : <button
                  className="UST_7 h-5 w-5 shrink-0 rounded duration-200 ease-out hover:bg-neutral-200 hover:dark:bg-neutral-800"
                  onClick={async () => {
                    try {
                      await git.unstageFile(dir, file.path);
                    } catch (error) {
                      if (error instanceof Error) {
                        toast({
                          title: "Error Unstaging",
                          description: (
                            <p>
                              <code>{file.name}</code> can&apos;t be unstaged
                              <br />
                              <code>{error.message}</code>
                            </p>
                          ),
                          variant: "destructive",
                        });
                      }
                      return;
                    }
                    await getStaged();
                    await getDiff();
                  }}>
                  <Minus className="h-full w-full" />
                </button>
              }
            </TooltipTrigger>
            <TooltipContent>
              <p>Stage Changes</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="h-5 w-5 shrink-0 rounded p-px duration-200 ease-out hover:bg-neutral-200 hover:dark:bg-neutral-800"
                onClick={() => setOpenDialogId(file.path)}>
                <Undo className="h-full w-full" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Revert Changes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <ConfirmationDialog
          open={openDialogId === file.path}
          title="Warning!"
          setOpen={() => setOpenDialogId("")}
          message={
            <>
              All changes made to {file.name} will be reverted{" "}
              <b>permanently</b> and can&apos;t be restored. Are you sure?
            </>
          }
          onConfirm={async () => {
            if (mode === "Staged") {
              try {
                await git.unstageFile(dir, file.name);
              } catch (error) {
                console.error(error);
                if (error instanceof Error) {
                  toast({
                    title: "Error Reverting",
                    description: (
                      <p>
                        <code>{file.name}</code> can&apos;t be reverted
                        <br />
                        <code>{error.message}</code>
                      </p>
                    ),
                    variant: "destructive",
                  });
                }
                return;
              }
            }
            try {
              await git.revertFile(dir, file.path);
            } catch (error) {
              console.error(error);
              if (error instanceof Error) {
                toast({
                  title: "Error Reverting",
                  description: (
                    <p>
                      <code>{file.name}</code> can&apos;t be reverted
                      <br />
                      <code>{error.message}</code>
                    </p>
                  ),
                  variant: "destructive",
                });
              }
              return;
            } finally {
              dispatch(setRepo({ diff: [...diffList] }));
              dispatch(setRepo({ staged: [...stagedList] }));
              await getDiff();
              await getStaged();
            }
            toast({
              title: "Successfully Reverted",
              description: (
                <>
                  Reverted <code>{file.name}</code> to last commit
                </>
              ),
            });
          }}
        />
      </div>
    );
  }

  function listView() {
    return (
      <List type="multiple" defaultValue={["diff", "staged"]}>
        {stagedList.length > 0 ?
          <ListItem value="staged">
            <ListHeader className="group">
              <ListTrigger>Staged</ListTrigger>
              <div className="UST_8A hidden flex-row items-center gap-2 px-1 group-hover:flex">
                <button
                  className="UST_8 h-5 w-5 shrink-0 rounded duration-200 ease-out hover:bg-neutral-200 hover:dark:bg-neutral-800"
                  onClick={async () => {
                    try {
                      await git.unstageAll(dir);
                    } catch (error) {
                      if (error instanceof Error) {
                        toast({
                          title: "Error Unstaging",
                          description: (
                            <p>
                              can&apos;t unstage file
                              <br />
                              <code>{error.message}</code>
                            </p>
                          ),
                          variant: "destructive",
                        });
                      }
                      return;
                    } finally {
                      await getDiff();
                      await getStaged();
                    }
                  }}>
                  <Minus className="h-full w-full" />
                </button>
                <button className="h-5 w-5 shrink-0 rounded p-px duration-200 ease-out hover:bg-neutral-200 hover:dark:bg-neutral-800">
                  <Undo className="h-full w-full" />
                </button>
              </div>
            </ListHeader>
            <ListContent className="UST_2">
              {stagedList.length > 0 ?
                stagedList?.map((target) => {
                  return (
                    <ContextMenu key={target.path}>
                      <ContextMenuTrigger>
                        <div className="group flex items-center gap-2 p-1 hover:bg-neutral-100 hover:dark:bg-neutral-900">
                          <File className="h-4 w-4" />
                          <div className="flex w-full items-center justify-between">
                            <div className="flex flex-row items-center gap-4">
                              <h4 className="UST_3 font-medium">
                                {target.name}
                              </h4>
                              <h4 className="UST_4 text-xs italic text-neutral-400 dark:text-neutral-600">
                                {target.path}
                              </h4>
                            </div>
                            {actionButton(target, "Staged")}
                          </div>
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-64">
                        <ContextMenuItem>{target.name}</ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem inset disabled>
                          Stage
                        </ContextMenuItem>
                        <ContextMenuItem
                          inset
                          onClick={async () => {
                            try {
                              await git.unstageFile(dir, target.path);
                            } catch (error) {
                              if (error instanceof Error) {
                                toast({
                                  title: "Error Unstaging",
                                  description: (
                                    <p>
                                      <code>{target.name}</code> can&apos;t be
                                      unstaged
                                      <br />
                                      <code>{error.message}</code>
                                    </p>
                                  ),
                                  variant: "destructive",
                                });
                              }
                              return;
                            }
                            await getStaged();
                            await getDiff();
                          }}>
                          Unstage
                        </ContextMenuItem>
                        <ContextMenuItem inset>Revert</ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem inset>Open</ContextMenuItem>
                        <ContextMenuItem
                          inset
                          onClick={async () => {
                            await writeText(target.path);
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
                  );
                })
              : <h4 className="text-center">Empty...</h4>}
            </ListContent>
          </ListItem>
        : null}
        {diffList.length > 0 ?
          <ListItem value="diff">
            <ListHeader className="group">
              <ListTrigger>Changed</ListTrigger>
              <div className="STG_8A hidden flex-row items-center gap-2 px-1 group-hover:flex">
                <button
                  className="STG_8 STG_9A h-5 w-5 shrink-0 rounded duration-200 ease-out hover:bg-neutral-200 hover:dark:bg-neutral-800"
                  onClick={async () => {
                    try {
                      await git.addAll(dir);
                    } catch (error) {
                      console.error(error);
                      if (error instanceof Error) {
                        toast({
                          title: "Error Staging",
                          description: (
                            <p>
                              can&apos;t stage file
                              <br />
                              <code>{error.message}</code>
                            </p>
                          ),
                          variant: "destructive",
                        });
                      }
                      return;
                    } finally {
                      // THIS IS TEMPORARY FIX
                      await getDiff();
                      await getStaged();
                      await getDiff();
                    }
                  }}>
                  <Plus className="h-full w-full" />
                </button>
                <button className="h-5 w-5 shrink-0 rounded p-px duration-200 ease-out hover:bg-neutral-200 hover:dark:bg-neutral-800">
                  <Undo className="h-full w-full" />
                </button>
              </div>
            </ListHeader>
            <ListContent className="STG_2">
              {diffList?.map((target) => {
                return (
                  <ContextMenu key={target.path}>
                    <ContextMenuTrigger>
                      <div
                        key={target.path}
                        className="group flex cursor-default items-center gap-2 p-1 hover:bg-neutral-100 hover:dark:bg-neutral-900">
                        <File className="h-4 w-4" />
                        <div className="flex w-full items-center justify-between">
                          <div className="flex flex-row items-center gap-4">
                            <h4 className="STG_3 font-medium">{target.name}</h4>
                            <h4 className="STG_4 text-xs italic text-neutral-400 dark:text-neutral-600">
                              {target.path}
                            </h4>
                          </div>
                          {actionButton(target, "Changed")}
                        </div>
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-64">
                      <ContextMenuItem>{target.name}</ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        inset
                        onClick={async () => {
                          try {
                            await git.addFile(dir, target.path);
                          } catch (error) {
                            console.error(error);
                            if (error instanceof Error) {
                              toast({
                                title: "Error Staging",
                                description: (
                                  <p>
                                    <code>{target.name}</code> can&apos;t be
                                    staged
                                    <br />
                                    <code>{error.message}</code>
                                  </p>
                                ),
                                variant: "destructive",
                              });
                            }
                            return;
                          }
                          await getDiff();
                          await getStaged();
                        }}>
                        Stage
                      </ContextMenuItem>
                      <ContextMenuItem inset disabled>
                        Unstage
                      </ContextMenuItem>
                      <ContextMenuItem inset>Revert</ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem inset>Open</ContextMenuItem>
                      <ContextMenuItem
                        inset
                        onClick={async () => {
                          await writeText(target.path);
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
                );
              })}
            </ListContent>
          </ListItem>
        : null}
      </List>
    );
  }
  function treeView(parent: FileEntry[], root: boolean): React.ReactNode {
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
                  child.path.replace(dir + "\\", "") ||
                target.path.startsWith(
                  child.path
                    .replace(dir, "")
                    .replace(/\\/g, "/")
                    .replace("/", "")
                )
              );
            })
          ) {
            fileStatus = "Staged";
          }
          if (fileStatus === "Unchanged") return null;
          else if (fileStatus === "Changed" || fileStatus === "Staged") {
            return (
              <div key={child.path}>
                <ContextMenu>
                  <ContextMenuTrigger className="STG_2 UST_2 STG_4 UST_4">
                    {child.children ?
                      <FolderRoot
                        className={" " + (root ? "" : "ml-4 border-l")}
                        type="multiple"
                        defaultValue={["item"]}>
                        <FolderItem value="item" className="">
                          <div className="group flex w-full justify-between hover:bg-neutral-100 dark:hover:bg-neutral-900">
                            <FolderTrigger className="p-1 pl-2">
                              {child.name}
                            </FolderTrigger>
                            {actionButton(child, fileStatus)}
                          </div>
                          <FolderContent>
                            {treeView(child.children, false)}
                          </FolderContent>
                        </FolderItem>
                      </FolderRoot>
                    : <div
                        className={
                          "group flex items-center gap-4 p-1 pl-7 hover:bg-neutral-100 hover:underline hover:dark:bg-neutral-900 " +
                          (root ? "" : "ml-4 border-l")
                        }>
                        <File className="h-4 w-4" />
                        <div className="STG_3 UST_3 flex w-full items-center justify-between">
                          {child.name}
                          {actionButton(child, fileStatus)}
                        </div>
                      </div>
                    }
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-64">
                    <ContextMenuItem>{child.name}</ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem inset>Stage</ContextMenuItem>
                    <ContextMenuItem inset disabled>
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
          }
        })}
      </>
    );
  }
  return (
    <Card className="STG_1 UST_1 w-full">
      <CardHeader className="">
        <CardTitle className="flex items-center gap-4">
          Staging Area
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
      <CardContent className="pt-3">
        <Menubar className="w-fit">
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup
                value={viewMode}
                onValueChange={(e) => {
                  localStorage.setItem("viewMode", e);
                  setViewMode(e);
                }}>
                <MenubarRadioItem value="list">List</MenubarRadioItem>
                <MenubarRadioItem value="tree">Tree</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        {viewMode === "list" ? listView() : treeView(dirList, true)}
      </CardContent>
    </Card>
  );
}
