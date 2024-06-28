import { useEffect, useState } from "react";
import { open } from "@tauri-apps/api/dialog";
import { fs } from "@tauri-apps/api";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import * as git from "@/lib/git";

import Commit from "@/components/Git/Commit";
import Clone from "@/components/Dialog/Clone";

import { useSelector, useDispatch } from "react-redux";
import { removeRepo, setRepo } from "@/lib/Redux/repoSlice";

export default function Index() {
  const repoName = useSelector((state) => state.repo.name);
  const dir = useSelector((state) => state.repo.directory);
  const dispatch = useDispatch();

  const [isGitRepo, setIsGitRepo] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [dirList, setDirList] = useState([]);

  const diffList = useSelector((state) => state.repo.diff);
  useEffect(() => {
    async function getDiff() {
      const data = await git.showChanged(dir);
      dispatch(setRepo({ diff: data }));
    }
    getDiff();
  }, [dir]);

  const stagedList = useSelector((state) => state.repo.staged);
  useEffect(() => {
    async function getStaged() {
      const data = await git.showStaged(dir);
      dispatch(setRepo({ staged: data }));
    }
    getStaged();
  }, [dir]);

  useEffect(() => {
    async function getAllChildDir(repo) {
      try {
        const dir = await fs.readDir(repo, {});
        console.log(dir);
        return dir;
      } catch (error) {
        console.error(error);
        return [];
      }
    }
    async function setDirectory() {
      setDirList(await getAllChildDir(dir));
    }
    setDirectory();
  }, [repoName, dir]);

  async function openFile() {
    const toOpen = await open({
      multiple: false,
      directory: true,
    });
    if (toOpen) {
      localStorage.setItem("repoDir", toOpen);
      const repoNameNew = toOpen.split("\\").pop();
      localStorage.setItem("currentRepoName", repoNameNew);
      dispatch(setRepo({ name: repoNameNew, directory: toOpen }));
    }
    const data = await git.checkGit(toOpen);
    setIsGitRepo(data.isGitRepo);
    setErrorMsg(data.errorMsg);
  }

  return (
    <>
      <div className="flex min-h-fit flex-col lg:flex-row gap-4">
        <Card className="h-fit flex-grow">
          <CardHeader className="bg-gray-100 pb-3">
            <CardTitle>Git Repository</CardTitle>
            <CardDescription className="flex max-w-full flex-col text-balance leading-relaxed">
              Select your local git repository
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-3">
            <p className="w-fit rounded border bg-gray-100 px-2 py-1 text-gray-900">
              <code className="">{dir}</code>
            </p>
            <span className={isGitRepo ? "text-green-600" : "text-red-600"}>
              {isGitRepo ? "\u00A0" : errorMsg ?? "Error! Not a git repository"}
            </span>
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
              }}>
              Close Repository
            </Button>
          </CardFooter>
        </Card>
        <Commit />
      </div>
      <h1>Index</h1>
    </>
  );
}
