import { useEffect, useState, useMemo } from "react";

import { setLocalCommit, setRemoteCommit, type CommitFormat } from "@/lib/Redux/gitSlice";
import { useAppDispatch, useAppSelector } from "@/lib/Redux/hooks";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import * as git from "@/lib/git";

export function CommitView({
  title,
  desc,
  type,
}: Readonly<{ title: string; desc: string; type: "Local" | "Remote" | "All" }>) {
  const dispatch = useAppDispatch();
  const localCommit = useAppSelector((state) => state.git.localCommit);
  const remoteCommit = useAppSelector((state) => state.git.remoteCommit);
  const allCommit = localCommit.concat(remoteCommit);
  const currentBranch = useAppSelector((state) => state.repo.branch);
  const currentRepoDir = useAppSelector((state) => state.repo.directory);
  const currentRepoName = useAppSelector((state) => state.repo.name);
  const currentRepoHash = useAppSelector((state) => state.repo.hash);

  const [formattedCommit, setFormattedCommit] = useState<CommitFormat[]>(
    type === "Local" ? localCommit
    : type === "Remote" ? remoteCommit
    : allCommit,
  );

  function formatCommit(commit: string[]) {
    const result = commit.map((commit: string) => {
      const split = commit.replaceAll(/(^"|"$)/g, "").split(" $|$ ");
      const hash = split[0];
      const date = new Date(split[1]).toISOString();
      const author = split[2];
      const message = split.slice(3).join(" ");
      return { hash, date, author, message };
    });
    return result as CommitFormat[];
  }
  async function getCommit() {
    let result;
    if (type === "Local" || type === "Remote") {
      const commit = await git.getAllCommit(currentRepoDir, currentBranch, type);
      result = formatCommit(commit);
      dispatch(setLocalCommit(result));
    } else {
      const local = await git.getAllCommit(currentRepoDir, currentBranch, "Local");
      const localCommit = formatCommit(local);
      dispatch(setLocalCommit(localCommit));
      const remote = await git.getAllCommit(currentRepoDir, currentBranch, "Remote");
      const remoteCommit = formatCommit(remote);
      dispatch(setRemoteCommit(remoteCommit));
      result = localCommit.concat(remoteCommit);
    }
    setFormattedCommit(result);
  }
  useEffect(() => {
    getCommit();
  }, [currentBranch, currentRepoDir, currentRepoName, currentRepoHash]);

  const [search, setSearch] = useState("");
  const filteredCommit = useMemo(() => {
    const find = search.trim().toLowerCase();
    return formattedCommit?.filter(
      (commit) =>
        commit.message.toLowerCase().includes(find) ||
        commit.author.toLowerCase().includes(find) ||
        commit.hash.toLowerCase().includes(find),
    );
  }, [formattedCommit, search]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="mb-4 flex flex-col items-stretch justify-center gap-2 xs:flex-row xs:items-center xs:justify-end">
          <Label>Search</Label>
          <Input
            disabled={formattedCommit.length === 0}
            className="w-full xs:w-1/3"
            type="search"
            placeholder="Search by Hash, Author or Message"
            onChange={(e) => setTimeout(() => setSearch(e.target.value), 150)}
          />
        </form>
        <Table className="border-collapse border dark:border-neutral-700">
          <TableHeader className="">
            <TableRow>
              <TableHead>Date and Time</TableHead>
              <TableHead>Hash</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCommit.length > 0 ?
              filteredCommit.map((commit) => (
                <TableRow key={commit.hash}>
                  <TableCell>
                    {new Date(commit.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    {new Date(commit.date).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="break-all font-mono">{commit.hash}</TableCell>
                  <TableCell>{commit.author}</TableCell>
                  <TableCell className="">{commit.message}</TableCell>
                </TableRow>
              ))
            : <TableRow>
                <TableCell colSpan={4} className="text-center">
                  {type === "Local" ? "No Commit waiting to be pushed" : "No Commit"}
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
