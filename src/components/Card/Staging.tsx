import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/Redux/hooks";
import { setRepo, setDiff, setStaged } from "@/lib/Redux/repoSlice";
import { FileEntry, readDir } from "@tauri-apps/api/fs";
import { open } from "@tauri-apps/api/shell";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/Dialog/Confirmation";

import { RefreshCw } from "lucide-react";

import * as git from "@/lib/git";

export default function FileList() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [openDialogId, setOpenDialogId] = useState("");
  const repoName = useAppSelector((state) => state.repo.name);
  const dir = useAppSelector((state) => state.repo.directory);

  const diffList = useAppSelector((state) => state.repo.diff);
  async function getDiff() {
    const data = await git.showChanged(dir);
    dispatch(setRepo({ diff: data }));
  }
  useEffect(() => {
    if (dir === "") return;
    getDiff();
  }, [dir]);

  const stagedList = useAppSelector((state) => state.repo.staged);
  async function getStaged() {
    const data = await git.showStaged(dir);
    dispatch(setRepo({ staged: data }));
  }
  useEffect(() => {
    if (dir === "") return;
    getStaged();
  }, [dir]);

  const [dirList, setDirList] = useState<FileEntry[]>([]);
  async function getAllChildDir(repo: string) {
    try {
      const dir = await readDir(repo, {});
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
  return (
    <Card className="w-full">
      <CardHeader className="bg-gray-100 pb-3">
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
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="changed">Changed</TabsTrigger>
            <TabsTrigger value="staged">Staged</TabsTrigger>
            <TabsTrigger value="none">None</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-100">
                  <TableHead>File Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Path</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dirList.map((file) => {
                  let fileStatus = "Unchanged";
                  let textColor = "text-black";
                  if (
                    diffList.some((target) => {
                      return (
                        target === file.name ||
                        target.split("/").shift() ===
                          file.path.replace(dir + "\\", "")
                      );
                    })
                  ) {
                    fileStatus = "Changed";
                    textColor = "text-blue-600";
                  } else if (
                    stagedList.some((target) => {
                      return (
                        target === file.name ||
                        target.split("/").shift() ===
                          file.path.replace(dir + "\\", "")
                      );
                    })
                  ) {
                    fileStatus = "Staged";
                    textColor = "text-green-600";
                  }
                  let actionButton;
                  if (fileStatus === "Changed") {
                    actionButton = (
                      <>
                        <Button
                          className="flex-grow"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await git.addFile(dir, file.name);
                            // dispatch(setDiff([file.path]));
                            await getStaged();
                            await getDiff();
                          }}>
                          Stage
                        </Button>
                        <Button
                          className="flex-grow"
                          variant="destructive"
                          size="sm"
                          onClick={() => setOpenDialogId(file.path)}>
                          Undo Edit
                        </Button>
                      </>
                    );
                  } else if (fileStatus === "Staged") {
                    actionButton = (
                      <>
                        <Button
                          className="flex-grow"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await git.unstagedFile(dir, file.name);
                            // dispatch(setStaged([file.path]));
                            await getDiff();
                            await getStaged();
                          }}>
                          Unstage
                        </Button>
                        <Button
                          className="flex-grow"
                          variant="destructive"
                          size="sm"
                          onClick={() => setOpenDialogId(file.path)}>
                          Undo Edit
                        </Button>
                      </>
                    );
                  } else {
                    actionButton = null;
                  }

                  return (
                    <TableRow key={file.name}>
                      <TableCell
                        className={"cursor-pointer font-medium " + textColor}
                        onClick={async () => {
                          await open(file.path);
                        }}>
                        {file.name}
                      </TableCell>
                      <TableCell
                        className={
                          "hidden break-all sm:table-cell " + textColor
                        }>
                        {file.path}
                      </TableCell>
                      <TableCell className={textColor}>{fileStatus}</TableCell>
                      <TableCell className="flex flex-col items-center justify-between gap-2 lg:flex-row">
                        {actionButton}
                        <ConfirmationDialog
                          open={openDialogId === file.path}
                          title="Warning!"
                          setOpen={() => setOpenDialogId("")}
                          message={
                            <>
                              All changes made to {file.name} will be reverted{" "}
                              <b>permanently</b> and can&apos;t be restored. Are
                              you sure?
                            </>
                          }
                          onConfirm={async () => {
                            if (fileStatus === "Staged") {
                              try {
                                await git.unstagedFile(dir, file.name);
                              } catch (error) {
                                console.error(error);
                                if (error instanceof Error) {
                                  toast({
                                    title: "Error Reverting",
                                    description: (
                                      <p>
                                        <code>{file.name}</code> can&apos;t be
                                        reverted
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
                              await getDiff();
                              await getStaged();
                            } catch (error) {
                              console.error(error);
                              if (error instanceof Error) {
                                toast({
                                  title: "Error Reverting",
                                  description: (
                                    <p>
                                      <code>{file.name}</code> can&apos;t be
                                      reverted
                                      <br />
                                      <code>{error.message}</code>
                                    </p>
                                  ),
                                  variant: "destructive",
                                });
                              }
                              return;
                            }
                            dispatch(setDiff([...diffList]));
                            dispatch(setStaged([...stagedList]));
                            toast({
                              title: "Successfully Reverted",
                              description: (
                                <>
                                  Reverted <code>{file.name}</code> to last
                                  commit
                                </>
                              ),
                            });
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="changed">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-100">
                  <TableHead>File Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Path</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dirList.map((file) => {
                  let fileStatus = "Unchanged";
                  let textColor = "text-black";
                  if (
                    diffList.some((target) => {
                      return (
                        target === file.name ||
                        target.split("/").shift() ===
                          file.path.replace(dir + "\\", "")
                      );
                    })
                  ) {
                    fileStatus = "Changed";
                    textColor = "text-blue-600";
                  } else if (
                    stagedList.some((target) => {
                      return (
                        target === file.name ||
                        target.split("/").shift() ===
                          file.path.replace(dir + "\\", "")
                      );
                    })
                  ) {
                    fileStatus = "Staged";
                    textColor = "text-green-600";
                  }
                  let actionButton;
                  if (fileStatus === "Changed") {
                    actionButton = (
                      <>
                        <Button
                          className="flex-grow"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await git.addFile(dir, file.name);
                            // dispatch(setDiff([file.path]));
                            await getStaged();
                            await getDiff();
                          }}>
                          Stage
                        </Button>
                        <Button
                          className="flex-grow"
                          variant="destructive"
                          size="sm"
                          onClick={() => setOpenDialogId(file.path)}>
                          Undo Edit
                        </Button>
                      </>
                    );
                  } else if (fileStatus === "Staged") {
                    actionButton = (
                      <>
                        <Button
                          className="flex-grow"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await git.unstagedFile(dir, file.name);
                            // dispatch(setStaged([file.path]));
                            await getDiff();
                            await getStaged();
                          }}>
                          Unstage
                        </Button>
                        <Button
                          className="flex-grow"
                          variant="destructive"
                          size="sm"
                          onClick={() => setOpenDialogId(file.path)}>
                          Undo Edit
                        </Button>
                      </>
                    );
                  } else {
                    actionButton = null;
                  }

                  return fileStatus === "Changed" ?
                      <TableRow key={file.name}>
                        <TableCell
                          className={"cursor-pointer font-medium " + textColor}
                          onClick={async () => {
                            await open(file.path);
                          }}>
                          {file.name}
                        </TableCell>
                        <TableCell
                          className={
                            "hidden break-all sm:table-cell " + textColor
                          }>
                          {file.path}
                        </TableCell>
                        <TableCell className={textColor}>
                          {fileStatus}
                        </TableCell>
                        <TableCell className="flex flex-col items-center justify-between gap-2 lg:flex-row">
                          {actionButton}
                          <ConfirmationDialog
                            open={openDialogId === file.path}
                            title="Warning!"
                            setOpen={() => setOpenDialogId("")}
                            message={
                              <>
                                All changes made to {file.name} will be reverted{" "}
                                <b>permanently</b> and can&apos;t be restored.
                                Are you sure?
                              </>
                            }
                            onConfirm={async () => {
                              if (fileStatus === "Staged") {
                                try {
                                  await git.unstagedFile(dir, file.name);
                                } catch (error) {
                                  console.error(error);
                                  if (error instanceof Error) {
                                    toast({
                                      title: "Error Reverting",
                                      description: (
                                        <p>
                                          <code>{file.name}</code> can&apos;t be
                                          reverted
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
                                await getDiff();
                                await getStaged();
                              } catch (error) {
                                console.error(error);
                                if (error instanceof Error) {
                                  toast({
                                    title: "Error Reverting",
                                    description: (
                                      <p>
                                        <code>{file.name}</code> can&apos;t be
                                        reverted
                                        <br />
                                        <code>{error.message}</code>
                                      </p>
                                    ),
                                    variant: "destructive",
                                  });
                                }
                                return;
                              }
                              dispatch(setDiff([...diffList]));
                              dispatch(setStaged([...stagedList]));
                              toast({
                                title: "Successfully Reverted",
                                description: (
                                  <>
                                    Reverted <code>{file.name}</code> to last
                                    commit
                                  </>
                                ),
                              });
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    : null;
                })}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="staged">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-100">
                  <TableHead>File Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Path</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dirList.map((file) => {
                  let fileStatus = "Unchanged";
                  let textColor = "text-black";
                  if (
                    diffList.some((target) => {
                      return (
                        target === file.name ||
                        target.split("/").shift() ===
                          file.path.replace(dir + "\\", "")
                      );
                    })
                  ) {
                    fileStatus = "Changed";
                    textColor = "text-blue-600";
                  } else if (
                    stagedList.some((target) => {
                      return (
                        target === file.name ||
                        target.split("/").shift() ===
                          file.path.replace(dir + "\\", "")
                      );
                    })
                  ) {
                    fileStatus = "Staged";
                    textColor = "text-green-600";
                  }
                  let actionButton;
                  if (fileStatus === "Changed") {
                    actionButton = (
                      <>
                        <Button
                          className="flex-grow"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await git.addFile(dir, file.name);
                            // dispatch(setDiff([file.path]));
                            await getStaged();
                            await getDiff();
                          }}>
                          Stage
                        </Button>
                        <Button
                          className="flex-grow"
                          variant="destructive"
                          size="sm"
                          onClick={() => setOpenDialogId(file.path)}>
                          Undo Edit
                        </Button>
                      </>
                    );
                  } else if (fileStatus === "Staged") {
                    actionButton = (
                      <>
                        <Button
                          className="flex-grow"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await git.unstagedFile(dir, file.name);
                            // dispatch(setStaged([file.path]));
                            await getDiff();
                            await getStaged();
                          }}>
                          Unstage
                        </Button>
                        <Button
                          className="flex-grow"
                          variant="destructive"
                          size="sm"
                          onClick={() => setOpenDialogId(file.path)}>
                          Undo Edit
                        </Button>
                      </>
                    );
                  } else {
                    actionButton = null;
                  }

                  return fileStatus == "Staged" ?
                      <TableRow key={file.name}>
                        <TableCell
                          className={"cursor-pointer font-medium " + textColor}
                          onClick={async () => {
                            await open(file.path);
                          }}>
                          {file.name}
                        </TableCell>
                        <TableCell
                          className={
                            "hidden break-all sm:table-cell " + textColor
                          }>
                          {file.path}
                        </TableCell>
                        <TableCell className={textColor}>
                          {fileStatus}
                        </TableCell>
                        <TableCell className="flex flex-col items-center justify-between gap-2 lg:flex-row">
                          {actionButton}
                          <ConfirmationDialog
                            open={openDialogId === file.path}
                            title="Warning!"
                            setOpen={() => setOpenDialogId("")}
                            message={
                              <>
                                All changes made to {file.name} will be reverted{" "}
                                <b>permanently</b> and can&apos;t be restored.
                                Are you sure?
                              </>
                            }
                            onConfirm={async () => {
                              if (fileStatus === "Staged") {
                                try {
                                  await git.unstagedFile(dir, file.name);
                                } catch (error) {
                                  console.error(error);
                                  if (error instanceof Error) {
                                    toast({
                                      title: "Error Reverting",
                                      description: (
                                        <p>
                                          <code>{file.name}</code> can&apos;t be
                                          reverted
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
                                await getDiff();
                                await getStaged();
                              } catch (error) {
                                console.error(error);
                                if (error instanceof Error) {
                                  toast({
                                    title: "Error Reverting",
                                    description: (
                                      <p>
                                        <code>{file.name}</code> can&apos;t be
                                        reverted
                                        <br />
                                        <code>{error.message}</code>
                                      </p>
                                    ),
                                    variant: "destructive",
                                  });
                                }
                                return;
                              }
                              dispatch(setDiff([...diffList]));
                              dispatch(setStaged([...stagedList]));
                              toast({
                                title: "Successfully Reverted",
                                description: (
                                  <>
                                    Reverted <code>{file.name}</code> to last
                                    commit
                                  </>
                                ),
                              });
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    : null;
                })}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="none"></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
