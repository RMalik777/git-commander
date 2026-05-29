import { useLayoutEffect } from "react";

import { Store } from "@tauri-apps/plugin-store";
import type { DirEntryWithPath } from "@/lib/Types/Duplicate";

import { useAppDispatch, useAppSelector } from "@/lib/Redux/hooks";
import { setRepo } from "@/lib/Redux/repoSlice";
import { setFiles } from "@/lib/Redux/fileList";

import { Staging } from "@/components/Card/Staging";
import { Commit } from "@/components/Card/Commit";
import { CommitView } from "@/components/Card/CommitView";

import * as git from "@/lib/Backend/git";
import { getAllChildDir } from "@/lib/Backend/functions";

export default function Git() {
  const dispatch = useAppDispatch();
  const fileList = useAppSelector((state) => state.fileList.files);
  const dir = useAppSelector((state) => state.repo.directory);
  const diffList = useAppSelector((state) => state.repo.diff);

  async function getDiff() {
    const diffStore = await Store.load(".diffList.json");
    const data = await git.showChanged(dir);
    const data2 = await git.showUntrackedFiles(dir);
    const toEntry = data.map((item: string) => {
      return {
        name: item.split("/").pop(),
        path: item.replace(/\//gi, "\\"),
      } as unknown as DirEntryWithPath;
    });
    const toEntry2 = await data2.map((item: string) => {
      return {
        name: item.split("/").pop(),
        path: item.replace(/\//gi, "\\"),
      } as unknown as DirEntryWithPath;
    });
    toEntry.push(...toEntry2);
    dispatch(setRepo({ diff: toEntry }));
    diffStore.set("diffList", toEntry);
    diffStore.save();
  }

  const stagedList = useAppSelector((state) => state.repo.staged);
  async function getStaged() {
    const stagedStore = await Store.load(".stagedList.json");
    const data = await git.showStaged(dir);
    const toEntry = data.map((item: string) => {
      return {
        name: item.split("/").pop(),
        path: item.replace(/\//gi, "\\"),
      } as unknown as DirEntryWithPath;
    });
    dispatch(setRepo({ staged: toEntry }));
    stagedStore.set("stagedList", toEntry);
    stagedStore.save();
  }

  useLayoutEffect(() => {
    async function setDirectory() {
      const fileStore = await Store.load(".fileList.json");
      const allChild = await getAllChildDir(dir);
      dispatch(setFiles(allChild));
      fileStore.set("fileList", allChild);
      fileStore.save();
    }
    if (dir === "") return;
    setDirectory();
    getDiff();
    getStaged();
  }, [dir]);
  return (
    <div className="flex flex-col items-stretch gap-4">
      <CommitView
        title="Latest Commit"
        desc="List of local commit that hasn't been pushed to remote repository"
        type="local"
      />
      <Commit getDiff={getDiff} getStaged={getStaged} />
      <Staging
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
