import { useEffect, useState } from "react";

import { FileEntry, readDir } from "@tauri-apps/api/fs";

import { useAppDispatch, useAppSelector } from "@/lib/Redux/hooks";
import { setRepo } from "@/lib/Redux/repoSlice";

import { Staging } from "@/components/Card/Staging";

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
  function recursiveSort(parent: FileEntry[]) {
    parent.sort((a, b) => a.name?.localeCompare(b.name ?? "") ?? 0);
    parent.sort((a, b) => {
      if (a.children && !b.children) return -1;
      if (!a.children && b.children) return 1;
      return 0;
    });

    parent.forEach((child) => {
      child.path = child.path?.replace(dir, "");
      if (child.children) {
        child.children.sort((a, b) => a.name?.localeCompare(b.name ?? "") ?? 0);
        child.children.sort((a, b) => {
          if (a.children && !b.children) return -1;
          if (!a.children && b.children) return 1;
          return 0;
        });
        recursiveSort(child.children);
      }
    });
    return parent;
  }
  async function getAllChildDir(repo: string) {
    try {
      const dir = await readDir(repo, { recursive: true });
      recursiveSort(dir);
      localStorage.setItem("dirList", JSON.stringify(dir));
      return dir;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  useEffect(() => {
    async function setDirectory() {
      setDirList(await getAllChildDir(dir));
    }
    if (dir === "") return;
    setDirectory();
  }, [dir]);
  return (
    <div className="flex flex-col items-center gap-4">
      <Staging
        diffList={diffList}
        dir={dir}
        dirList={dirList}
        stagedList={stagedList}
      />
    </div>
  );
}
