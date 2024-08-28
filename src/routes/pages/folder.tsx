import { useEffect, useRef } from "react";

import { FileEntry } from "@tauri-apps/api/fs";
import { Store } from "tauri-plugin-store-api";

import { FileList } from "@/components/Card/FileList";
import { setFiles } from "@/lib/Redux/fileList";
import { useAppDispatch, useAppSelector } from "@/lib/Redux/hooks";
import { setRepo } from "@/lib/Redux/repoSlice";

import * as dirFunc from "@/lib/directory";
import * as git from "@/lib/git";

export default function Git() {
  const dispatch = useAppDispatch();
  const dir = useAppSelector((state) => state.repo.directory);
  const diffList = useAppSelector((state) => state.repo.diff);
  const fileList = useAppSelector((state) => state.fileList.files);
  const refFile = useRef("");

  async function getDiff() {
    const diffList = new Store(".diffList.json");
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
    diffList.set("diffList", toEntry);
    diffList.save();
  }
  useEffect(() => {
    if (dir === "") return;
    getDiff();
  }, [dir]);

  const stagedList = useAppSelector((state) => state.repo.staged);
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
  useEffect(() => {
    if (dir === "") return;
    getStaged();
  }, [dir]);

  useEffect(() => {
    const store = new Store(".fileList.json");
    async function setDirectory() {
      refFile.current = dir;
      const allChild = await dirFunc.getAllChildDir(dir);
      dispatch(setFiles(allChild));
      store.set("fileList", allChild);
      store.save();
    }
    if (dir === "") return;
    // if (dir == refFile.current) return;
    setDirectory();
  }, [dir]);

  return (
    <div className="flex flex-col items-center gap-4">
      <FileList
        diffList={diffList}
        dir={dir}
        dirList={fileList}
        stagedList={stagedList}
        getDiff={getDiff}
        getStaged={getStaged}
      />
    </div>
  );
}
