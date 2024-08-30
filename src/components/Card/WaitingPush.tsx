import { useEffect, useState } from "react";

import { setWaitingPush, type CommitFormat } from "@/lib/Redux/gitSlice";
import { useAppDispatch, useAppSelector } from "@/lib/Redux/hooks";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import * as git from "@/lib/git";

export function WaitingPush() {
  const dispatch = useAppDispatch();
  const commitWaitingPush = useAppSelector((state) => state.git.waitingPush);
  const currentBranch = useAppSelector((state) => state.repo.branch);
  const currentRepoDir = useAppSelector((state) => state.repo.directory);
  const currentRepoName = useAppSelector((state) => state.repo.name);
  const currentRepoHash = useAppSelector((state) => state.repo.hash);

  const [formattedWaitingPush, setFormattedWaitingPush] =
    useState<CommitFormat[]>(commitWaitingPush);

  useEffect(() => {
    async function getWaitingPush() {
      const waitingPush = await git.getCommitNotPushedFull(currentRepoDir);
      const result = waitingPush.map((commit: string) => {
        const split = commit.replaceAll(/(^"|"$)/g, "").split(" $|$ ");
        const hash = split[0];
        const date = new Date(split[1]).toISOString();
        const author = split[2];
        const message = split.slice(3).join(" ");
        return { hash, date, author, message };
      });
      dispatch(setWaitingPush(result));
      setFormattedWaitingPush(result);
    }
    getWaitingPush();
  }, [currentBranch, currentRepoDir, currentRepoName, currentRepoHash]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Commit</CardTitle>
        <CardDescription>
          List of local commit that hasn&apos;t been pushed to remote repository
        </CardDescription>
      </CardHeader>
      <CardContent>
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
            {formattedWaitingPush.map((commit, index) => (
              <TableRow key={index + commit.hash}>
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
