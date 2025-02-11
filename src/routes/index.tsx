/*
  Tangerang Selatan, 2025.

  Selamat datang di git commander.
  Jika anda diminta untuk mengerjakan program ini, saya ingin meminta maaf jika repository ini tidak terlalu rapi. Silahkan baca `README.md` untuk informasi lebih lanjut.

  Jika ada yang ingin ditanyakan, jangan sungkan untuk menghubungi saya melalui email:
  Rafli.Malik@gmail.com

  Terima Kasih,
  Rafli Malik
*/

import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { OctagonAlert } from "lucide-react";

import { RepoView } from "@/components/Card/RepoView";
import { ChangeView } from "@/components/Card/ChangeView";

import * as git from "@/lib/Backend/git";

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
          No <span className="font-semibold">git</span> detected on your system. Make sure you
          install git properly to use this program.{" "}
          <a
            href="https://git-scm.com/downloads"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline after:content-['_↗'] hover:opacity-80"
          >
            Download git
          </a>
        </AlertDescription>
      </Alert>
      <RepoView />
      <ChangeView />
    </div>
  );
}
