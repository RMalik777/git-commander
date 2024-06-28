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

import * as git from "@/lib/git";

import Commit from "@/components/Git/Commit";

import { useSelector, useDispatch } from "react-redux";
import { setRepo } from "@/lib/Redux/repoSlice";
import { setDir } from "@/lib/Redux/dirSlice";

export default function Index() {
  const [isGitRepo, setIsGitRepo] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [dirList, setDirList] = useState([]);

  const repoName = useSelector((state) => state.repo.value);
  const dir = useSelector((state) => state.dir.value);
  const dispatch = useDispatch();

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
      setDir(toOpen);
      const repoNameNew = toOpen.split("\\").pop();
      localStorage.setItem("currentRepoName", repoNameNew);
      dispatch(setRepo(repoNameNew));
      dispatch(setDir(toOpen));
    }
    const data = await git.checkGit(toOpen);
    console.log(data);
    setIsGitRepo(data.isGitRepo);
    setErrorMsg(data.errorMsg);
  }

  return (
    <>
      <div className="flex min-h-fit flex-row gap-4">
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
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                localStorage.removeItem("repoDir");
                setDir("no directory selected");
              }}>
              Close Repository
            </Button>
            <Button size="sm" variant="outline" onClick={() => {}}>
              Trial
            </Button>
          </CardFooter>
        </Card>

        <Card className="w-1/3 min-w-[33.33%]">
          <CardHeader className="bg-gray-100 pb-3">
            <CardTitle>File List</CardTitle>
            <CardDescription className="flex max-w-full flex-col text-balance leading-relaxed">
              Check the files inside the repository
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-3">
            <ul className="flex flex-col rounded border bg-gray-100 p-2">
              {dirList?.map((file) => {
                return (
                  <li key={file.path} className="w-fit">
                    <code className="w-fit text-sm">{file.name}</code>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
      <Commit />
      <h1>Index</h1>
    </>
  );
}
