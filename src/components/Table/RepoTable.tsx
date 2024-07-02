import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { open } from "@tauri-apps/api/shell";

import type { RepoFormat } from "@/lib/Types/repo";

import { ConfirmationDialog } from "@/components/Dialog/Confirmation";
import EditRepo from "@/components/Dialog/EditRepo";

export default function RepoTable({
  repos,
  onDeleteRepo,
  fetchData,
}: Readonly<{
  repos: RepoFormat[];
  onDeleteRepo: (repoId: string, repoName: string) => void;
  fetchData: () => void;
}>) {
  const [openDialogId, setOpenDialogId] = useState("");

  useEffect(() => {
    console.log("Changed");
  }, [repos]);
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
            <TableCell
              className="font-medium"
              onClick={async () => {
                await open(repo.repo_url);
              }}>
              {repo.repo_name}
            </TableCell>
            <TableCell>
              <a href={repo.repo_url} target="_blank" rel="noopener noreferrer">
                <code className="whitespace-normal break-all">
                  {repo.repo_url}
                </code>
              </a>
            </TableCell>
            <TableCell align="center">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 md:gap-4">
                <EditRepo
                  key={repo.id + repo.repo_name + repo.repo_url}
                  repoId={repo.id}
                  oldRepoName={repo.repo_name}
                  oldRepoUrl={repo.repo_url}
                  afterEdit={fetchData}
                />
                <Button
                  className="flex flex-grow items-center justify-center gap-1"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setOpenDialogId(repo.id);
                  }}>
                  <Trash2 size={16} className="md:hidden lg:block" />
                  <span className="hidden md:block">Delete</span>
                </Button>
              </div>
              <ConfirmationDialog
                open={openDialogId === repo.id}
                title={"Delete " + repo.repo_name + " ?"}
                setOpen={() => setOpenDialogId("")}
                message={
                  <>
                    {repo.repo_name} will be deleted <b>permanently</b>. Are you
                    sure?
                  </>
                }
                onConfirm={() => onDeleteRepo(repo.id, repo.repo_name)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
