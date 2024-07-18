import { useState } from "react";
import { writeText } from "@tauri-apps/api/clipboard";
import { removeFile, type FileEntry } from "@tauri-apps/api/fs";
import { open } from "@tauri-apps/api/shell";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useToast } from "@/components/ui/use-toast";

import { ConfirmationDialog } from "@/components/Dialog/Confirmation";

import * as git from "@/lib/git";

export function FileMenu({
  children,
  target,
  dir,
  status,
  getStaged,
  getDiff,
}: Readonly<{
  children: React.ReactNode;
  target: FileEntry;
  dir: string;
  status: "Staged" | "Changed";
  getStaged: () => Promise<void>;
  getDiff: () => Promise<void>;
}>) {
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  return (
    <>
      <ContextMenu key={target.path}>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem>{target.name}</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            inset
            disabled={status == "Staged"}
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
                        <code>{target.name}</code> can&apos;t be staged
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
          <ContextMenuItem
            inset
            disabled={status == "Changed"}
            onClick={async () => {
              try {
                await git.unstageFile(dir, target.path);
              } catch (error) {
                if (error instanceof Error) {
                  toast({
                    title: "Error Unstaging",
                    description: (
                      <p>
                        <code>{target.name}</code> can&apos;t be unstaged
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
          <ContextMenuItem
            inset
            onClick={async () => {
              if (target.path.includes(dir)) {
                if (target.children) {
                  await open(target.path);
                } else {
                  const newPath = target.path.split("\\");
                  newPath.pop();
                  await open(newPath.join("\\"));
                }
              } else {
                const newPath = target.path.split("\\");
                newPath.pop();
                await open(dir + "\\" + newPath.join("\\"));
              }
            }}>
            Open Folder
          </ContextMenuItem>
          <ContextMenuItem
            inset
            disabled={target.children ? true : false}
            onClick={async () => await open(dir + "\\" + target.path)}>
            Open File
          </ContextMenuItem>
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
            className="font-medium text-red-500 focus:bg-red-500/10"
            onClick={() => {
              setOpenDialog(true);
            }}>
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <ConfirmationDialog
        title="Warning!"
        message={
          <>
            This will <b>permanently</b> delete <code>{target.name}</code>. Are
            you sure?
          </>
        }
        open={openDialog}
        setOpen={setOpenDialog}
        onConfirm={async () => {
          await removeFile(dir + "\\" + target.path);
          await getStaged();
          await getDiff();
          setOpenDialog(false);
        }}
      />
    </>
  );
}
