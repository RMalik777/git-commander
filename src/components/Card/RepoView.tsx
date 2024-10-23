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

import * as dirFunc from "@/lib/directory";
import * as git from "@/lib/git";

import { Clone } from "@/components/Dialog/Clone";

import { useAppDispatch, useAppSelector } from "@/lib/Redux/hooks";
import { removeRepo, setRepo } from "@/lib/Redux/repoSlice";
import { removePullMsg } from "@/lib/Redux/pullMsg";
import { removeFiles, setFiles } from "@/lib/Redux/fileList";

export function RepoView() {
  const dir = useAppSelector((state) => state.repo.directory);
  const dispatch = useAppDispatch();

  const [isGitRepo, setIsGitRepo] = useState(sessionStorage.getItem("isGitRepo") === "true");
  const [errorMsg, setErrorMsg] = useState(sessionStorage.getItem("errorMsg") ?? null);
  const [showError, setShowError] = useState(sessionStorage.getItem("showError") == "true");
  useEffect(() => {
    if (!dir || dir == "") return;
    async function getDiff() {
      const diffStore = new Store(".diffList.json");
      const data = await git.showChanged(dir);
      const data2 = await git.ShowUntrackedFiles(dir);
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
    getDiff();
  }, [dir]);

  useEffect(() => {
    if (!dir || dir == "") return;
    async function getStaged() {
      const stagedStore = new Store(".stagedList.json");
      const data = await git.showStaged(dir);
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
    getStaged();
  }, [dir]);

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

      const fileList = await dirFunc.getAllChildDir(toOpen);
      dispatch(setFiles(fileList));
      await fileStore.set("fileList", fileList);
      await fileStore.save();

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
      const data = await git.checkGit(path);
      if (data.isGitRepo) {
        sessionStorage.setItem("isGitRepo", data.isGitRepo.toString());
        sessionStorage.setItem("showError", (!data.isGitRepo).toString());
        sessionStorage.setItem("errorMsg", data?.errorMsg?.toString() ?? "");
      } else {
        dispatch(setRepo({ name: "" }));
        sessionStorage.setItem("showError", "true");
        localStorage.removeItem("currentRepoName");
      }
      setIsGitRepo(data.isGitRepo);
      setShowError(!data.isGitRepo);
      sessionStorage.setItem("showError", (!data.isGitRepo).toString());
      setErrorMsg(data.errorMsg);
    }
  }
  useEffect(() => {
    if (!dir || dir == "") {
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
    checkDir(dir);
  }, [dir]);

  const [parentDialog, setParentDialog] = useState(false);
  const [parent, setParent] = useState(sessionStorage.getItem("parent") ?? null);
  async function getNearestParent(dir: string) {
    const data = await git.getParent(dir);
    setParent(data);
    sessionStorage.setItem("parent", data);
    return data;
  }
  useEffect(() => {
    if (!dir || dir == "") return;
    if (isGitRepo) {
      getNearestParent(dir);
    }
  }, [dir]);

  return (
    <Card className="h-fit flex-grow">
      <CardHeader className="">
        <CardTitle>Git Repository</CardTitle>
        <CardDescription className="flex max-w-full flex-col text-balance leading-relaxed">
          Select your local git repository
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button
          disabled={dir == ""}
          variant="link"
          className={
            (dir ? "" : "hidden") +
            " h-fit w-fit whitespace-normal break-all rounded border bg-gray-100 px-2 py-1 text-left text-base text-gray-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 xl:text-lg"
          }
          onClick={() => {
            if (dir) openFolder(dir);
          }}
        >
          <p className="">
            <code>{dir}</code>
          </p>
        </Button>
        {showError ?
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>
              {errorMsg?.replace("Error!", "") ?? "Folder is not a git repository"}
            </AlertDescription>
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
