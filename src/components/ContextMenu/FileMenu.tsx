import { useState } from "react";

import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { removeFile, type FileEntry } from "@tauri-apps/plugin-fs";
import { open } from "@tauri-apps/plugin-shell";

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
import { PulseLoader } from "react-spinners";

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
  status: "Staged" | "Changed" | "Unchanged";
  getStaged: () => Promise<void>;
  getDiff: () => Promise<void>;
}>) {
  const { toast } = useToast();
  const [openDialogRevert, setOpenDialogRevert] = useState(false);
  const [openDialogDelete, setOpenDialogDelete] = useState(false);
  return (
    <>
      <ContextMenu key={target.path}>
        <ContextMenuTrigger className="w-full">{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem>{target.name}</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            inset
            disabled={status != "Changed"}
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
            disabled={status != "Staged"}
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
          <ContextMenuItem
            disabled={status == "Unchanged"}
            inset
            onClick={() => {
              setOpenDialogRevert(true);
            }}>
            Revert
          </ContextMenuItem>
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
            onClick={async () => await open(dir + target.path)}>
            Open File
          </ContextMenuItem>
          <ContextMenuItem
            inset
            onClick={async () => {
              await writeText(dir + target.path);
            }}>
            Copy Path
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            inset
            className="font-medium text-red-500 focus:bg-red-500/10"
            onClick={() => {
              setOpenDialogDelete(true);
            }}>
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <ConfirmationDialog
        title="Warning!"
        message={
          <p>
            All changes made will be reverted <b>permanently</b> and can&apos;t be restored. Are you
            sure?
          </p>
        }
        open={openDialogRevert}
        setOpen={setOpenDialogRevert}
        onConfirm={async () => {
          toast({
            title: "Reverting...",
            description: <PulseLoader size={6} speedMultiplier={0.8} />,
          });
          if (status === "Staged") {
            try {
              await git.unstageFile(dir, target.path);
            } catch (error) {
              console.error(error);
              if (error instanceof Error) {
                toast({
                  title: "Error Reverting",
                  description: (
                    <p>
                      <code>{target.name}</code> can&apos;t be reverted
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
            await git.revertFile(dir, target.path);
          } catch (error) {
            console.error(error);
            if (error instanceof Error) {
              toast({
                title: "Error Reverting",
                description: (
                  <p>
                    <code>{target.name}</code> can&apos;t be reverted
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
          toast({
            title: "Successfully Reverted",
            description: (
              <>
                Reverted <code>{target.name}</code> to last commit
              </>
            ),
          });
        }}
      />
      <ConfirmationDialog
        title="Warning!"
        message={
          <>
            This will <b>permanently</b> delete <code>{target.name}</code>. Are you sure?
          </>
        }
        open={openDialogDelete}
        setOpen={setOpenDialogDelete}
        onConfirm={async () => {
          await removeFile(dir + "\\" + target.path);
          await getStaged();
          await getDiff();
        }}
      />
    </>
  );
}
