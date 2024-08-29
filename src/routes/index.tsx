import { useEffect } from "react";

import { RepoView } from "@/components/Card/RepoView";
import { WaitingPush } from "@/components/Card/WaitingPush";
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
      <RepoView />
      <WaitingPush />
      <ChangeView />
    </div>
  );
}
