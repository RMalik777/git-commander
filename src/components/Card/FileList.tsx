import { FileEntry } from "@tauri-apps/api/fs";
import { open } from "@tauri-apps/api/shell";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderContent, FolderItem, FolderRoot, FolderTrigger } from "@/components/ui/folder";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { Lightbulb, RefreshCw } from "lucide-react";

import { FileMenu } from "@/components/ContextMenu/FileMenu";

import { Icons } from "@/components/Icons";

export function FileList({
  dir,
  dirList,
  diffList,
  stagedList,
  getDiff,
  getStaged,
}: Readonly<{
  dir: string;
  dirList: FileEntry[];
  diffList: FileEntry[];
  stagedList: FileEntry[];
  getDiff: () => Promise<void>;
  getStaged: () => Promise<void>;
}>) {
  function currentStatus(file: FileEntry) {
    let fileStatus = "Unchanged";
    if (
      diffList.some((target) => {
        return (
          target.path === file.name ||
          target.path === file.path ||
          target.path.startsWith(file.path.replace(dir, ""))
        );
      })
    ) {
      fileStatus = "Changed";
    } else if (
      stagedList.some((target) => {
        return (
          target.path === file.name ||
          target.path === file.path ||
          target.path.startsWith(file.path.replace(dir, ""))
        );
      })
    ) {
      fileStatus = "Staged";
    }
    return (
      <div className="hidden flex-row items-center gap-2 2xs:flex">
        {fileStatus === "Changed" ?
          <h4 className="text-sm text-neutral-300 duration-200 dark:text-neutral-600">Edited</h4>
        : fileStatus === "Staged" ?
          <h4 className="dark:text-neutal-600 text-sm text-neutral-300 duration-200">Staged</h4>
        : null}
      </div>
    );
  }
  function recursiveDirRenderer(parent: FileEntry[], root: boolean): React.ReactNode {
    return (
      <>
        {parent?.map((placeholder) => {
          const child = { ...placeholder };
          child.path = child.path.replace(/^\\/g, "");
          child.name = child.name ?? child.path.split("\\").pop();
          let fileStatus: "Unchanged" | "Changed" | "Staged" = "Unchanged";
          if (
            diffList.some((target) => {
              return (
                target.path === child.name ||
                target.path === child.path ||
                target.path.startsWith(child.path.replace(dir, ""))
              );
            })
          ) {
            fileStatus = "Changed";
          } else if (
            stagedList.some((target) => {
              return (
                target.path === child.name ||
                target.path === child.path ||
                target.path.startsWith(child.path.replace(dir, ""))
              );
            })
          ) {
            fileStatus = "Staged";
          }
          return (
            <div key={child.path}>
              <FileMenu
                dir={dir}
                target={child}
                status={fileStatus}
                getDiff={getDiff}
                getStaged={getStaged}>
                {child.children ?
                  <FolderRoot
                    className={
                      "group duration-200 ease-out " +
                      (root ? "" : "ml-4 border-l border-neutral-200 dark:border-neutral-800")
                    }
                    type="multiple">
                    <FolderItem value="item-1" className="">
                      <FolderTrigger className="group p-1 pl-2 hover:bg-neutral-100 dark:hover:bg-neutral-900">
                        <div className="flex w-full justify-between text-left">
                          {child.name}
                          {currentStatus(child)}
                        </div>
                      </FolderTrigger>
                      <FolderContent>{recursiveDirRenderer(child.children, false)}</FolderContent>
                    </FolderItem>
                  </FolderRoot>
                : <div
                    className={
                      "group flex items-center gap-4 p-1 pl-7 duration-200 ease-out hover:bg-neutral-100 dark:hover:bg-neutral-800 " +
                      (root ? "" : "ml-4 border-l border-neutral-200 dark:border-neutral-800")
                    }>
                    <button
                      className="flex w-full items-center gap-1"
                      onClick={async () => {
                        await open(dir + "\\" + child.path);
                      }}>
                      <Icons name={child.name} />
                      <div className="flex w-full items-center justify-between text-left">
                        {child.name}
                        {currentStatus(child)}
                      </div>
                    </button>
                  </div>
                }
              </FileMenu>
            </div>
          );
        })}
      </>
    );
  }
  return (
    <Card className="FE_1 w-full">
      <CardHeader className="">
        <CardTitle className="flex items-center gap-4">
          File List
          <TooltipProvider delayDuration={50}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="FE_3 h-fit w-fit"
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
      <CardContent className="overflow-auto pl-4 pt-3">
        {dirList ? recursiveDirRenderer(dirList, true) : null}
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="flex w-fit flex-col items-center justify-center gap-1 rounded border border-blue-500 bg-blue-200/20 p-2 dark:bg-blue-700/20 xs:flex-row">
          <Lightbulb size={20} className="min-w-fit text-blue-600 dark:text-blue-500" />
          <p className="text-center text-neutral-600 dark:text-neutral-300">
            File and folder referenced inside{" "}
            <code className="rounded bg-neutral-100/50 p-1 dark:bg-neutral-900/50">.gitignore</code>{" "}
            will not be shown.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
