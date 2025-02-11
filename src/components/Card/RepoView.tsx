import { useEffect, useState } from "react";

import { open } from "@tauri-apps/api/dialog";
import { exists, FileEntry } from "@tauri-apps/api/fs";
import { open as openFolder } from "@tauri-apps/api/shell";
import { Store } from "tauri-plugin-store-api";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Info } from "lucide-react";

import { getAllChildDir } from "@/lib/functions";
import * as git from "@/lib/git";

import { Clone } from "@/components/Dialog/Clone";

import { useAppDispatch, useAppSelector } from "@/lib/Redux/hooks";
import { removeRepo, setRepo } from "@/lib/Redux/repoSlice";
import { removePullMsg } from "@/lib/Redux/pullMsg";
import { removeFiles, setFiles } from "@/lib/Redux/fileList";
import { clsx } from "clsx";

export function RepoView() {
  const repoDir = useAppSelector((state) => state.repo.directory);
  const repoName = useAppSelector((state) => state.repo.name);
  const remoteUrl = useAppSelector((state) => state.repo.remoteUrl);
  const dispatch = useAppDispatch();

  const [isGitRepo, setIsGitRepo] = useState(sessionStorage.getItem("isGitRepo") === "true");
  const [errorMsg, setErrorMsg] = useState(sessionStorage.getItem("errorMsg") ?? null);
  const [showError, setShowError] = useState(sessionStorage.getItem("showError") == "true");

  async function getDiff() {
    const diffStore = new Store(".diffList.json");
    const data = await git.showChanged(repoDir);
    const data2 = await git.showUntrackedFiles(repoDir);
    const toEntry = data.map((item: string) => {
      return {
        name: item.split("/").pop(),
        path: item.replace(/\//gi, "\\"),
      } as FileEntry;
    });
    const toEntry2 = await data2.map((item: string) => {
      return {
        name: item.split("/").pop(),
        path: item.replace(/\//gi, "\\"),
      } as FileEntry;
    });
    toEntry.push(...toEntry2);
    dispatch(setRepo({ diff: toEntry }));
    diffStore.set("diffList", toEntry);
    diffStore.save();
  }
  async function getStaged() {
    const stagedStore = new Store(".stagedList.json");
    const data = await git.showStaged(repoDir);
    const toEntry = data.map((item: string) => {
      return {
        name: item.split("/").pop(),
        path: item.replace(/\//gi, "\\"),
      } as FileEntry;
    });
    dispatch(setRepo({ staged: toEntry }));
    stagedStore.set("stagedList", toEntry);
    stagedStore.save();
  }
  async function openFile() {
    const toOpen = await open({
      multiple: false,
      directory: true,
    });
    if (typeof toOpen === "string") {
      localStorage.setItem("repoDir", toOpen.toString());
      const repoNameNew = toOpen.split("\\").pop();
      if (repoNameNew) localStorage.setItem("currentRepoName", repoNameNew.toString());
      dispatch(setRepo({ name: repoNameNew, directory: toOpen }));
      const newParent = await getNearestParent(toOpen);
      if (newParent && toOpen != newParent) {
        dispatch(setRepo({ name: newParent.split("\\").pop() }));
        setParentDialog(true);
      }
      dispatch(removeFiles());
      dispatch(removePullMsg());
      const fileStore = new Store(".fileList.json");
      const diffStore = new Store(".diffList.json");
      const stagedStore = new Store(".stagedList.json");
      await fileStore.clear();
      await diffStore.clear();
      await stagedStore.clear();
      await fileStore.save();
      await diffStore.save();
      await stagedStore.save();

      const fileList = await getAllChildDir(toOpen);
      dispatch(setFiles(fileList));
      await fileStore.set("fileList", fileList);
      await fileStore.save();

      localStorage.removeItem("zipLocation");
      localStorage.removeItem("fetchAmount");
    }
  }

  async function checkDir(path: string) {
    const isExist = await exists(path);
    if (!isExist) {
      setIsGitRepo(isExist);
      setShowError(true);
      sessionStorage.setItem("showError", "true");
      sessionStorage.setItem("isGitRepo", "false");
      setErrorMsg("Error! Folder does not exist");
      sessionStorage.setItem("errorMsg", "Error! Folder does not exist");
    } else {
      try {
        await git.checkRepository(path);
        setIsGitRepo(true);
        sessionStorage.setItem("isGitRepo", "true");
        setShowError(false);
        sessionStorage.setItem("showError", "false");
        setErrorMsg("");
        sessionStorage.removeItem("errorMsg");
        const remoteOrigin = await git.getRemoteOrigin(path);
        dispatch(setRepo({ remoteUrl: remoteOrigin }));
        localStorage.setItem("remoteUrl", remoteOrigin);
        const commitcount = await git.getCommitCount(path);
        dispatch(setRepo({ commitcount }));
        localStorage.setItem("commitCount", commitcount.toString());
      } catch (error) {
        dispatch(setRepo({ name: "" }));
        setShowError(true);
        sessionStorage.setItem("showError", "true");
        localStorage.removeItem("currentRepoName");
        if (error?.toString().includes("not a git repository")) {
          setIsGitRepo(false);
          sessionStorage.setItem("isGitRepo", "false");
          setErrorMsg("Folder is not a git repository");
          sessionStorage.setItem("errorMsg", "Folder is not a git repository");
        } else {
          setErrorMsg(error?.toString() ?? "Unknown error");
          sessionStorage.setItem("errorMsg", error?.toString() ?? "");
        }
      }
    }
  }
  useEffect(() => {
    if (!repoDir || repoDir == "") {
      setShowError(false);
      sessionStorage.setItem("showError", "false");
      sessionStorage.removeItem("isGitRepo");
      sessionStorage.removeItem("errorMsg");
      setErrorMsg(null);
      localStorage.removeItem("fetchAmount");
      const fileStore = new Store(".fileList.json");
      const diffStore = new Store(".diffList.json");
      const stagedStore = new Store(".stagedList.json");
      fileStore.clear();
      diffStore.clear();
      stagedStore.clear();
      fileStore.save();
      diffStore.save();
      stagedStore.save();
      fileStore.save();

      localStorage.removeItem("fetchAmount");
      return;
    }
    checkDir(repoDir);
    getDiff();
    getStaged();
  }, [repoDir]);

  const [parentDialog, setParentDialog] = useState(false);
  const [parent, setParent] = useState(sessionStorage.getItem("parent") ?? null);
  async function getNearestParent(dir: string) {
    const data = await git.getParent(dir);
    setParent(data);
    sessionStorage.setItem("parent", data);
    return data;
  }
  useEffect(() => {
    if (!repoDir || repoDir == "") return;
    if (isGitRepo) {
      getNearestParent(repoDir);
    }
  }, [repoDir]);
  return (
    <Card className="h-fit flex-grow">
      <CardHeader className="">
        <CardTitle>{repoName !== "" ? repoName : "Repository"}</CardTitle>
        <CardDescription className="flex max-w-full flex-col text-balance leading-relaxed">
          {remoteUrl !== "" ?
            <a
              href={remoteUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="hover:underline"
            >
              {remoteUrl}
            </a>
          : "Select your local git repository"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button
          disabled={repoDir == ""}
          variant="link"
          className={clsx(
            repoDir ? "" : "hidden",
            "h-fit w-fit whitespace-normal break-all rounded border bg-gray-100 px-2 py-1 text-left text-base text-gray-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 xl:text-lg",
          )}
          onClick={() => {
            if (repoDir) openFolder(repoDir);
          }}
        >
          <p className="">
            <code>{repoDir}</code>
          </p>
        </Button>
        {showError ?
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{errorMsg ?? "Unknown Error"}</AlertDescription>
          </Alert>
        : null}
        <AlertDialog open={parentDialog} onOpenChange={setParentDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Git repository found in the parent directory</AlertDialogTitle>
              <AlertDialogDescription>
                <code className="rounded border border-gray-200 bg-gray-100 p-1 dark:border-neutral-700 dark:bg-neutral-800">
                  {parent}
                </code>{" "}
                is the parent of the selected directory. Do you want to open the parent directory?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  dispatch(setRepo({ directory: parent?.toString() }));
                  localStorage.setItem("repoDir", parent?.toString() ?? "");
                }}
              >
                Open
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
      <CardFooter className="flex flex-row flex-wrap gap-2">
        <Button
          className="OR_1"
          size="sm"
          variant="default"
          onClick={async () => {
            await openFile();
          }}
        >
          Open Repository
        </Button>
        <Clone />
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            const fileStore = new Store(".fileList.json");
            const diffStore = new Store(".diffList.json");
            const stagedStore = new Store(".stagedList.json");
            localStorage.removeItem("repoDir");
            localStorage.removeItem("currentRepoName");
            localStorage.removeItem("currentBranch");
            localStorage.removeItem("stagedList");
            localStorage.removeItem("fetchAmount");
            localStorage.removeItem("zipLocation");
            localStorage.removeItem("remoteUrl");
            localStorage.removeItem("commitCount");
            dispatch(removeRepo());
            dispatch(removePullMsg());
            dispatch(removeFiles());
            fileStore.clear();
            diffStore.clear();
            stagedStore.clear();
            fileStore.save();
            diffStore.save();
            stagedStore.save();
          }}
        >
          Close Repository
        </Button>
      </CardFooter>
    </Card>
  );
}
