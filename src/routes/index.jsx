import { useEffect, useState } from "react";
import { open } from "@tauri-apps/api/dialog";
import { fs } from "@tauri-apps/api";

import { Button } from "@/components/ui/button";
import { Command } from "@tauri-apps/api/shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import * as git from "@/lib/git";

import { invoke } from "@tauri-apps/api/tauri";

import Commit from "@/components/Git/Commit";

export default function Index() {
  const [isGitRepo, setIsGitRepo] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [dirList, setDirList] = useState([]);

  async function clone(path = repo) {
    const command = new Command(
      "git 2 args",
      ["clone", "https://github.com/RMalik777/tigabot.git"],
      { cwd: path }
    );
    command.stdout.on("data", (data) => {
      console.log("stdout: ", data);
    });
    command.stderr.on("data", (line) => {
      console.log(`command stderr: "${line}"`);
    });
    await command.spawn().catch((error) => {
      console.error(error);
    });
  }

  async function checkGit(path = repo) {
    setErrorMsg(null);
    const command = new Command("git 1 args", ["status"], { cwd: path });
    command.on("close", (data) => {
      console.log(
        `command finished with code ${data.code} and signal ${data.signal}`
      );
    });
    command.on("error", (error) => console.error(`command error: "${error}"`));
    command.stdout.on("data", (data) => {
      setIsGitRepo(true);
      console.log("stdout: ", data);
    });
    command.stderr.on("data", (line) => {
      setIsGitRepo(false);
      console.log(`command stderr: "${line}"`);
    });

    await command.spawn().catch((error) => {
      setErrorMsg(error);
      console.error(error);
    });
  }

  const [repo, setRepo] = useState("path/to/repo");
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
      setDirList(await getAllChildDir(repo));
    }
    setRepo(localStorage.getItem("repoDir") || "path/to/repo");
    setDirectory();
  }, [repo]);
  async function openFile() {
    const toOpen = await open({
      multiple: false,
      directory: true,
    });
    if (toOpen) {
      localStorage.setItem("repoDir", toOpen);
      setRepo(toOpen);
      const repoName = toOpen.split("\\").pop();
      localStorage.setItem("currentRepoName", repoName);
    }
    await checkGit(toOpen);
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
              <code className="">{repo}</code>
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
                setRepo("no directory selected");
              }}>
              Close Repository
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await invoke("get_all_remote_repo").then((data) =>
                  console.log(data)
                );
              }}>
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
