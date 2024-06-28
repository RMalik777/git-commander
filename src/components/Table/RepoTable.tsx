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
  const [repos, setRepos] = useState<RepoFormat[]>();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await db.getAllRepo();
        setRepos(response);
        console.log("Responses", response);
      } catch (error) {
        console.error("A", error);
      }
    }
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
                onClick={async () => {
                  db.deleteRemoteRepoById(repo.id);
                }}>
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
