import { useEffect } from "react";

import { RepoView } from "@/components/Card/RepoView";
import { Commit } from "@/components/Git/Commit";
import { ChangeView } from "@/components/Card/ChangeView";

import * as git from "@/lib/git";

export default function Index() {
  useEffect(() => {
    async function setSLL() {
      await git.setSSLFalse();
    }
    setSLL();
  }, []);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-h-fit flex-col gap-4 lg:flex-row">
        <RepoView />
        <Commit />
      </div>
      <ChangeView />
    </div>
  );
}
