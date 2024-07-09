import { useEffect, useState } from "react";
import { open } from "@tauri-apps/api/dialog";
import { open as openFolder } from "@tauri-apps/api/shell";
import { exists } from "@tauri-apps/api/fs";

import { Button } from "@/components/ui/button";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Info } from "lucide-react";

import * as git from "@/lib/git";

import Clone from "@/components/Dialog/Clone";

import { useAppSelector, useAppDispatch } from "@/lib/Redux/hooks";
import { removeRepo, setRepo } from "@/lib/Redux/repoSlice";

export default function RepoView() {
  const dir = useAppSelector((state) => state.repo.directory);
  const dispatch = useAppDispatch();

  const [isGitRepo, setIsGitRepo] = useState(
    sessionStorage.getItem("isGitRepo") === "true"
  );
  const [errorMsg, setErrorMsg] = useState(
    sessionStorage.getItem("errorMsg") ?? null
  );
  useEffect(() => {
    if (!dir || dir == "") return;
    async function getDiff() {
      const data = await git.showChanged(dir);
      dispatch(setRepo({ diff: data }));
    }
    getDiff();
  }, [dir]);

  useEffect(() => {
    if (!dir || dir == "") return;
    async function getStaged() {
      const data = await git.showStaged(dir);
      dispatch(setRepo({ staged: data }));
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
      if (repoNameNew)
        localStorage.setItem("currentRepoName", repoNameNew.toString());
      dispatch(setRepo({ name: repoNameNew, directory: toOpen }));
      const newParent = await getNearestParent(toOpen);
      console.log("NEWPARENT", newParent);
      if (newParent && toOpen != newParent) {
        dispatch(setRepo({ name: newParent.split("\\").pop() }));
        setParentDialog(true);
      }
    }
  }

  async function checkDir(path: string) {
    const isExist = await exists(path);
    if (!isExist) {
      setIsGitRepo(isExist);
      sessionStorage.setItem("isGitRepo", "false");
      setErrorMsg("Error! Folder does not exist");
      sessionStorage.setItem("errorMsg", "Error! Folder does not exist");
    } else {
      const data = await git.checkGit(path);
      if (data.isGitRepo) {
        sessionStorage.setItem("isGitRepo", data.isGitRepo.toString());
        sessionStorage.setItem("errorMsg", data?.errorMsg?.toString() ?? "");
      } else {
        dispatch(setRepo({ name: "" }));
        sessionStorage.removeItem("repoDir");
        sessionStorage.removeItem("currentRepoName");
      }
      setIsGitRepo(data.isGitRepo);
      setErrorMsg(data.errorMsg);
    }
  }
  useEffect(() => {
    if (!dir || dir == "") {
      setIsGitRepo(true);
      sessionStorage.removeItem("isGitRepo");
      setErrorMsg(null);
      sessionStorage.removeItem("errorMsg");
      return;
    }
    checkDir(dir);
  }, [dir]);

  const [parentDialog, setParentDialog] = useState(false);
  const [parent, setParent] = useState(
    sessionStorage.getItem("parent") ?? null
  );
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
          }}>
          <p className="">
            <code>{dir}</code>
          </p>
        </Button>
        {isGitRepo ? null : (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>
              {errorMsg?.replace("Error!", "") ?? "Not a git repository."}
            </AlertDescription>
          </Alert>
        )}
        <AlertDialog open={parentDialog} onOpenChange={setParentDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Git repository found in the parent directory
              </AlertDialogTitle>
              <AlertDialogDescription>
                <code className="rounded border border-gray-200 bg-gray-100 p-1 dark:border-neutral-700 dark:bg-neutral-800">
                  {parent}
                </code>{" "}
                is the parent of the selected directory. Do you want to open the
                parent directory?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  dispatch(setRepo({ directory: parent?.toString() }));
                  localStorage.setItem("repoDir", parent?.toString() ?? "");
                }}>
                Open
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
      <CardFooter className="flex flex-row gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={async () => {
            await openFile();
          }}>
          Open Repository
        </Button>
        <Clone />
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            localStorage.removeItem("repoDir");
            localStorage.removeItem("currentRepoName");
            dispatch(removeRepo());
            dispatch(setRepo({ directory: "" }));
          }}>
          Close Repository
        </Button>
      </CardFooter>
    </Card>
  );
}
