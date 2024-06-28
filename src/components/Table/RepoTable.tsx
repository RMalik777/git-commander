import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import * as db from "@/lib/database";
import type { RepoFormat } from "@/lib/Types/repo";

import { ConfirmationDialog } from "@/components/Dialog/Confirmation";
import { useToast } from "@/components/ui/use-toast";

const repo_data = [
  {
    name: "git-commander",
    link: "https://github.com/RMalik777/git-commander",
    provider: "GitHub",
  },
  {
    name: "porto",
    link: "https://github.com/RMalik777/porto",
    provider: "GitHub",
  },
  {
    name: "DashOne",
    link: "https://github.com/RMalik777/DashOne",
    provider: "GitHub",
  },
  {
    name: "web-blog",
    link: "https://github.com/RMalik777/web-blog",
    provider: "GitHub",
  },
  {
    name: "FileBag",
    link: "https://github.com/RMalik777/FileBag",
    provider: "GitHub",
  },
];

export default function RepoTable() {
  const { toast } = useToast();
  const [repos, setRepos] = useState<RepoFormat[]>();
  const [openDialogId, setOpenDialogId] = useState("");

  async function fetchData() {
    try {
      const response = await db.getAllRepo();
      setRepos(response);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Link</TableHead>
          <TableHead className="text-center">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {repos?.map((repo) => (
          <TableRow key={repo.id}>
            <TableCell className="font-medium">{repo.repo_name}</TableCell>
            <TableCell>
              <a href={repo.repo_url} target="_blank" rel="noopener noreferrer">
                <code>{repo.repo_url}</code>
              </a>
            </TableCell>
            <TableCell className="text-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setOpenDialogId(repo.id);
                }}>
                Delete
              </Button>
              <ConfirmationDialog
                open={openDialogId === repo.id}
                repoName={repo.repo_name}
                setOpen={() => setOpenDialogId("")}
                message={
                  <>
                    {repo.repo_name} will be deleted <b>permanently</b>. Are you
                    sure?
                  </>
                }
                onConfirm={async () => {
                  await db.deleteRemoteRepoById(repo.id);
                  fetchData();
                  toast({
                    title: "Repository Deleted",
                    description: (
                      <>
                        <code>{repo.repo_name}</code> deleted successfully,
                      </>
                    ),
                  });
                }}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
