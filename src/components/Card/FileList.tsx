import { useEffect, useState } from "react";
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
  useEffect(() => {
    if (dir === "") return;
    async function getDiff() {
      const data = await git.showChanged(dir);
      dispatch(setRepo({ diff: data }));
    }
    getDiff();
  }, [dir]);

  const stagedList = useAppSelector((state) => state.repo.staged);
  useEffect(() => {
    if (dir === "") return;
    async function getStaged() {
      const data = await git.showStaged(dir);
      dispatch(setRepo({ staged: data }));
    }
    getStaged();
  }, [dir]);

  useEffect(() => {
    if (dir === "") return;
    async function getAllChildDir(repo: string) {
      try {
        const dir = await readDir(repo, {});
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
  return (
    <Card className="w-full">
      <CardHeader className="bg-gray-100 pb-3">
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
          </TabsList>
          <TabsContent value="all">
            <ul className="flex flex-col rounded border bg-gray-100 p-2">
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
                        (isChanged ? "text-bold text-blue-600" : "") +
                        (isStaged ? " text-green-600" : "") +
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
                <span className="text-blue-600">blue</span> = changed file
              </small>
              <small>
                <span className="text-green-600">green</span> = staged file
              </small>
            </div>
          </TabsContent>
          <TabsContent value="changed">
            <ul className="flex flex-col rounded border bg-gray-100 p-2">
              {diffList?.map((file) => {
                return (
                  <li key={file} className="w-fit">
                    <code className="w-fit text-sm">
                      {file?.split("/").shift()}
                    </code>
                  </li>
                );
              })}
            </ul>
          </TabsContent>
          <TabsContent value="staged">
            <ul className="flex flex-col rounded border bg-gray-100 p-2">
              {stagedList?.map((file) => {
                return (
                  <li key={file} className="w-fit">
                    <code className="w-fit text-sm">
                      {file?.split("/").shift()}
                    </code>
                  </li>
                );
              })}
            </ul>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
