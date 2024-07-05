import { useEffect } from "react";

import Commit from "@/components/Git/Commit";
import RepoView from "@/components/Card/RepoView";

import * as git from "@/lib/git";

export default function Index() {
  useEffect(() => {
    async function setSLL() {
      await git.setSSLFalse();
    }
    setSLL();
  }, []);
  return (
    <div className="flex min-h-fit flex-col gap-4 lg:flex-row">
      <RepoView />
      <Commit />
    </div>
  );
}
