import { useEffect, useState } from "react";

import { FileEntry } from "@tauri-apps/api/fs";

import { useAppDispatch, useAppSelector } from "@/lib/Redux/hooks";
import { setRepo } from "@/lib/Redux/repoSlice";

import { FileList } from "@/components/Card/FileList";

import * as dirFunc from "@/lib/directory";
import * as git from "@/lib/git";

export default function Git() {
  const dispatch = useAppDispatch();
  const dir = useAppSelector((state) => state.repo.directory);
  const diffList = useAppSelector((state) => state.repo.diff);

  async function getDiff() {
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
    localStorage.setItem("diffList", JSON.stringify(toEntry));
  }
  useEffect(() => {
    if (dir === "") return;
    getDiff();
  }, [dir]);

  const stagedList = useAppSelector((state) => state.repo.staged);
  async function getStaged() {
    const data = await git.showStaged(dir);
    const toEntry = data.map((item: string) => {
      return {
        name: item.split("/").pop(),
        path: item.replace(/\//gi, "\\"),
      } as FileEntry;
    });
    dispatch(setRepo({ staged: toEntry }));
    localStorage.setItem("stagedList", JSON.stringify(toEntry));
  }
  useEffect(() => {
    if (dir === "") return;
    getStaged();
  }, [dir]);

  const [dirList, setDirList] = useState<FileEntry[]>(
    JSON.parse(localStorage.getItem("dirList") ?? "[]")
  );

  useEffect(() => {
    async function setDirectory() {
      setDirList(await dirFunc.getAllChildDir(dir));
    }
    if (dir === "") return;
    setDirectory();
  }, [dir]);
  return (
    <div className="flex flex-col items-center gap-4">
      <FileList
        diffList={diffList}
        dir={dir}
        dirList={dirList}
        stagedList={stagedList}
      />
    </div>
  );
}
