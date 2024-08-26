import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/Redux/hooks";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ChangeView() {
  const [changes, setChanges] = useState("");
  const [tagBranch, setTagBranch] = useState("");
  const [filesChanged, setFilesChanged] = useState(0);
  const [insertions, setInsertions] = useState(0);
  const [deletions, setDeletions] = useState(0);

  const incomingChanges = useAppSelector((state) => state.pullMsg.changes);
  const incomingTagBranch = useAppSelector((state) => state.pullMsg.tagBranch);
  const incomingFilesChanged = useAppSelector(
    (state) => state.pullMsg.filesChanged
  );
  const incomingInsertions = useAppSelector(
    (state) => state.pullMsg.insertions
  );
  const incomingDeletions = useAppSelector((state) => state.pullMsg.deletions);

  useEffect(() => {
    setChanges(incomingChanges.trim().replaceAll(", ", "").replace(",", ""));
    setTagBranch(incomingTagBranch.trim().replaceAll(", ", ""));
    setFilesChanged(incomingFilesChanged);
    setInsertions(incomingInsertions);
    setDeletions(incomingDeletions);
  }, [
    incomingChanges,
    incomingTagBranch,
    incomingFilesChanged,
    incomingInsertions,
    incomingDeletions,
  ]);

  return (
    <Card>
      <CardHeader className="bg-white dark:bg-neutral-950">
        <CardDescription>Latest Changes Since Last Pull</CardDescription>
        <CardTitle>
          {filesChanged} files changed, {insertions} insertions (+), {deletions}{" "}
          deletions (-)
        </CardTitle>
      </CardHeader>
      <CardContent className="whitespace-pre">
        <span className="text-xl font-semibold">Changes:</span>
        <br />
        {changes}
        <br />
        <span className="text-xl font-semibold">Tag Changes:</span>
        <br />
        {tagBranch}
      </CardContent>
    </Card>
  );
}
