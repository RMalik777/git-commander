import { useState } from "react";
import { useAppDispatch } from "@/lib/Redux/hooks";
import { setRepo } from "@/lib/Redux/repoSlice";
import { FileEntry } from "@tauri-apps/api/fs";
import { open } from "@tauri-apps/api/shell";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenubarRadioGroup,
  MenubarRadioItem,
} from "@/components/ui/menubar";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/Dialog/Confirmation";

import { RefreshCw, File, Plus, FolderOpen, Undo, Minus } from "lucide-react";

import * as git from "@/lib/git";

export default function Staging({
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
  const [viewMode, setViewMode] = useState("list");
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [openDialogId, setOpenDialogId] = useState("");

  async function getDiff() {
    const data = await git.showChanged(dir);
    const toEntry = data.map((item: string) => {
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
    const toEntry = data.map((item: string) => {
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
      <div className="hidden flex-row items-center gap-2 group-hover:flex group-focus:flex">
        <TooltipProvider delayDuration={250} disableHoverableContent>
          <Tooltip>
            <TooltipTrigger asChild>
              <FolderOpen
                className="h-5 w-5 shrink-0 rounded p-px duration-200 ease-out hover:bg-neutral-200 hover:dark:bg-neutral-800"
                onClick={async () => {
                  await open(file.path);
                }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Open</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              {mode === "Changed" ?
                <Plus
                  className="h-5 w-5 shrink-0 rounded duration-200 ease-out hover:bg-neutral-200 hover:dark:bg-neutral-800"
                  onClick={async () => {
                    toast({
                      title: "Staging File",
                    });
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
                    await getStaged();
                    await getDiff();
                    toast({
                      title: "Successfully Staged",
                    });
                  }}
                />
              : <Minus
                  className="h-5 w-5 shrink-0 rounded duration-200 ease-out hover:bg-neutral-200 hover:dark:bg-neutral-800"
                  onClick={async () => {
                    toast({
                      title: "Unstaging File",
                    });
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
                    toast({
                      title: "Successfully Unstaged",
                    });
                  }}
                />
              }
            </TooltipTrigger>
            <TooltipContent>
              <p>Stage Changes</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Undo
                className="h-5 w-5 shrink-0 rounded p-px duration-200 ease-out hover:bg-neutral-200 hover:dark:bg-neutral-800"
                onClick={() => setOpenDialogId(file.path)}
              />
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
              await git.revertFile(dir, file.name);
              await getStaged();
              await getDiff();
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
            dispatch(setRepo({ diff: [...diffList] }));
            dispatch(setRepo({ staged: [...stagedList] }));
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
      <Accordion type="multiple" defaultValue={["diff", "staged"]}>
        {stagedList.length > 0 ?
          <AccordionItem value="staged">
            <AccordionTrigger>Staged</AccordionTrigger>
            <AccordionContent>
              {stagedList.length > 0 ?
                stagedList?.map((target) => {
                  return (
                    <div
                      key={target.path}
                      className="group flex items-center gap-2 p-1 hover:bg-neutral-100 hover:dark:bg-neutral-900">
                      <File className="h-4 w-4" />
                      <button className="flex w-full items-center justify-between">
                        <div className="flex flex-row items-center gap-4">
                          <h4 className="font-medium">{target.name}</h4>
                          <h4 className="text-xs italic text-neutral-400 dark:text-neutral-600">
                            {target.path}
                          </h4>
                        </div>
                        {actionButton(target, "Staged")}
                      </button>
                    </div>
                  );
                })
              : <h4 className="text-center">Empty...</h4>}
            </AccordionContent>
          </AccordionItem>
        : null}
        {diffList.length > 0 ?
          <AccordionItem value="diff">
            <AccordionTrigger className="py-2">Changed</AccordionTrigger>
            <AccordionContent>
              {diffList?.map((target) => {
                return (
                  <div
                    key={target.path}
                    className="group flex items-center gap-2 p-1 hover:bg-neutral-100 hover:dark:bg-neutral-900">
                    <File className="h-4 w-4" />
                    <button className="flex w-full items-center justify-between">
                      <div className="flex flex-row items-center gap-4">
                        <h4 className="font-medium">{target.name}</h4>
                        <h4 className="text-xs italic text-neutral-400 dark:text-neutral-600">
                          {target.path}
                        </h4>
                      </div>
                      {actionButton(target, "Changed")}
                    </button>
                  </div>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        : null}
      </Accordion>
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
                  <ContextMenuTrigger>
                    {child.children ?
                      <FolderRoot
                        className={" " + (root ? "" : "ml-4 border-l")}
                        type="multiple">
                        <FolderItem value="item-1" className="">
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
                        <button className="flex w-full items-center justify-between">
                          {child.name}
                          {actionButton(child, fileStatus)}
                        </button>
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
    <Card className="w-full">
      <CardHeader className="">
        <CardTitle className="flex items-center gap-4">
          Staging Area{" "}
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
              <MenubarRadioGroup value={viewMode} onValueChange={setViewMode}>
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
