import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { OctagonAlert } from "lucide-react";

import { RepoView } from "@/components/Card/RepoView";
import { ChangeView } from "@/components/Card/ChangeView";

import * as git from "@/lib/git";

export default function Index() {
  const [error, setError] = useState(sessionStorage.getItem("git") == "false");
  useEffect(() => {
    async function setSLL() {
      await git.setSSLFalse();
    }
    async function getVersion() {
      try {
        await git.version();
        sessionStorage.setItem("git", "true");
      } catch (e) {
        console.error(e);
        setError(true);
        sessionStorage.setItem("git", "false");
      }
    }
    getVersion();
    setSLL();
  }, []);
  return (
    <div className="flex flex-col gap-4">
      <Alert variant="destructive" hidden={!error}>
        <OctagonAlert className="h-4 w-4" />
        <AlertTitle>This program may not worked as intended</AlertTitle>
        <AlertDescription>
          No <span className="font-semibold">git</span> detected on your system. Please install git
          to use this program.{" "}
          <a
            href="https://git-scm.com/downloads"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline after:content-['_↗'] hover:opacity-80">
            Download git
          </a>
        </AlertDescription>
      </Alert>
      <RepoView />
      <ChangeView />
    </div>
  );
}
