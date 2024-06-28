import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import type { RepoFormat } from "@/lib/Types/repo";

import { ConfirmationDialog } from "@/components/Dialog/Confirmation";

export default function RepoTable({
  repos,
  onDeleteRepo,
}: Readonly<{
  repos: RepoFormat[];
  onDeleteRepo: (repoId: string, repoName: string) => void;
}>) {
  const [openDialogId, setOpenDialogId] = useState("");
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
                onConfirm={() => onDeleteRepo(repo.id, repo.repo_name)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
