import { useEffect } from "react";

import { Store } from "tauri-plugin-store-api";
import { FileEntry, readDir } from "@tauri-apps/api/fs";

import { useAppDispatch, useAppSelector } from "@/lib/Redux/hooks";
import { setRepo } from "@/lib/Redux/repoSlice";
import { setFiles } from "@/lib/Redux/fileList";

import { Copy } from "@/components/Card/Copy";
import { Staging } from "@/components/Card/Staging";
import { Commit } from "@/components/Git/Commit";

import * as git from "@/lib/git";
import * as dirFunc from "@/lib/directory";

export default function Git() {
  const dispatch = useAppDispatch();
  const fileList = useAppSelector((state) => state.fileList.files);
  const dir = useAppSelector((state) => state.repo.directory);
  const diffList = useAppSelector((state) => state.repo.diff);

  const store = new Store(".fileList.json");

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

  function recursiveSort(parent: FileEntry[]) {
    parent.sort((a, b) => a.name?.localeCompare(b.name ?? "") ?? 0);
    parent.sort((a, b) => {
      if (a.children && !b.children) return -1;
      if (!a.children && b.children) return 1;
      return 0;
    });

    parent.forEach((child) => {
      delete child.name;
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

  useEffect(() => {
    async function setDirectory() {
      const allChild = await dirFunc.getAllChildDir(dir);
      dispatch(setFiles(allChild));
      store.set("fileList", allChild);
      store.save();
    }
    if (dir === "") return;
    setDirectory();
  }, [dir]);
  return (
    <div className="flex flex-col items-stretch gap-4">
      <Commit />
      <Staging
        diffList={diffList}
        dir={dir}
        dirList={fileList}
        stagedList={stagedList}
        getDiff={getDiff}
        getStaged={getStaged}
      />
      <Copy />
    </div>
  );
}
