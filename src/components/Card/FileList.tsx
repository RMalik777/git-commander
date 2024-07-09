import { useLayoutEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/Redux/hooks";
import { setRepo } from "@/lib/Redux/repoSlice";
import { FileEntry, readDir } from "@tauri-apps/api/fs";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import * as git from "@/lib/git";

export default function FileList() {
  const repoName = useAppSelector((state) => state.repo.name);
  const dir = useAppSelector((state) => state.repo.directory);
  const dispatch = useAppDispatch();

  const [dirList, setDirList] = useState<FileEntry[]>([]);

  const diffList = useAppSelector((state) => state.repo.diff);
  useLayoutEffect(() => {
    if (dir === "") return;
    async function getDiff() {
      const data = await git.showChanged(dir);
      dispatch(setRepo({ diff: data }));
    }
    getDiff();
  }, [dir]);

  const stagedList = useAppSelector((state) => state.repo.staged);
  useLayoutEffect(() => {
    if (dir === "") return;
    async function getStaged() {
      const data = await git.showStaged(dir);
      dispatch(setRepo({ staged: data }));
    }
    getStaged();
  }, [dir]);

  useLayoutEffect(() => {
    if (dir === "") return;
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
    setDirectory();
  }, [repoName, dir]);
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>File List</CardTitle>
        <CardDescription className="flex max-w-full flex-col text-balance leading-relaxed">
          Check the files inside the repository
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
            <ul className="flex flex-col rounded border bg-gray-100 p-2 duration-200 ease-out dark:border-neutral-700 dark:bg-neutral-800">
              {dirList?.map((file) => {
                const isChanged = diffList?.some(
                  (diffFile) =>
                    diffFile === file.name ||
                    diffFile.split("/").shift() ===
                      file.path.replace(dir + "\\", "")
                );
                const isStaged = stagedList?.some(
                  (stagedFile) =>
                    stagedFile === file.name ||
                    stagedFile.split("/").shift() ===
                      file.path.replace(dir + "\\", "")
                );
                return (
                  <li key={file.path} className="w-fit">
                    <code
                      className={
                        (isChanged ?
                          "text-bold text-blue-600 duration-200 ease-out dark:text-blue-400"
                        : "") +
                        (isStaged ?
                          "text-bold text-green-600 duration-200 ease-out dark:text-green-400"
                        : "") +
                        " w-fit text-sm"
                      }>
                      {file.name}
                    </code>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-col">
              <small>
                <span className="text-blue-600 duration-200 ease-out dark:text-blue-400">
                  blue
                </span>{" "}
                = changed file
              </small>
              <small>
                <span className="text-green-600 duration-200 ease-out dark:text-green-400">
                  green
                </span>{" "}
                = staged file
              </small>
            </div>
          </TabsContent>
          <TabsContent value="changed">
            <ul className="flex flex-col rounded border bg-gray-100 p-2 duration-200 ease-out dark:border-neutral-700 dark:bg-neutral-800">
              {dirList?.map((file) => {
                const isChanged = diffList?.some(
                  (diffFile) =>
                    diffFile === file.name ||
                    diffFile.split("/").shift() ===
                      file.path.replace(dir + "\\", "")
                );
                return isChanged ?
                    <li key={file.path} className="w-fit">
                      <code className="w-fit text-sm">{file.name}</code>
                    </li>
                  : null;
              })}
            </ul>
          </TabsContent>
          <TabsContent value="staged">
            <ul className="flex flex-col rounded border bg-gray-100 p-2 duration-200 ease-out dark:border-neutral-700 dark:bg-neutral-800">
              {dirList?.map((file) => {
                const isChanged = stagedList?.some(
                  (diffFile) =>
                    diffFile === file.name ||
                    diffFile.split("/").shift() ===
                      file.path.replace(dir + "\\", "")
                );
                return isChanged ?
                    <li key={file.path} className="w-fit">
                      <code className="w-fit text-sm">{file.name}</code>
                    </li>
                  : null;
              })}
            </ul>
          </TabsContent>
          <TabsContent value="none"></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
