import { useAppSelector } from "@/lib/Redux/hooks";
import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToastAction } from "@/components/ui/toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

import { X } from "lucide-react";

export function ChangeView() {
  const { toast } = useToast();

  const [changes, setChanges] = useState("");
  const [tagBranch, setTagBranch] = useState("");
  const [filesChanged, setFilesChanged] = useState(0);
  const [insertions, setInsertions] = useState(0);
  const [deletions, setDeletions] = useState(0);
  const [show, setShow] = useState(true);

  const incomingChanges = useAppSelector((state) => state.pullMsg.changes);
  const incomingTagBranch = useAppSelector((state) => state.pullMsg.tagBranch);
  const incomingFilesChanged = useAppSelector((state) => state.pullMsg.filesChanged);
  const incomingInsertions = useAppSelector((state) => state.pullMsg.insertions);
  const incomingDeletions = useAppSelector((state) => state.pullMsg.deletions);

  useEffect(() => {
    setChanges(incomingChanges.trim().replaceAll(", ", "").replace(",", ""));
    setTagBranch(incomingTagBranch.trim().replaceAll(", ", ""));
    setFilesChanged(incomingFilesChanged);
    setInsertions(incomingInsertions);
    setDeletions(incomingDeletions);
    setShow(true);
  }, [
    incomingChanges,
    incomingTagBranch,
    incomingFilesChanged,
    incomingInsertions,
    incomingDeletions,
  ]);
  // ADD BUTTON TO CLOSE CARD
  return (
      show &&
        (incomingChanges ||
          incomingTagBranch ||
          incomingFilesChanged ||
          incomingInsertions ||
          incomingDeletions)
    ) ?
      <Card className="relative">
        <TooltipProvider>
          <Tooltip disableHoverableContent delayDuration={250}>
            <TooltipTrigger asChild>
              <button
                className="group absolute right-4 top-4"
                onClick={() => {
                  setShow(false);
                  toast({
                    title: "Dismissed",
                    action: (
                      <ToastAction
                        altText="Undoing Closed changes view"
                        onClick={() => {
                          setShow(true);
                        }}>
                        Undo
                      </ToastAction>
                    ),
                  });
                }}>
                <X className="text-neutral-400 duration-75 group-hover:text-neutral-950" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Dismiss</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <CardHeader className="bg-white dark:bg-neutral-950">
          <CardDescription>Latest Changes Since Last Pull </CardDescription>
          <CardTitle>
            <span className="text-blue-500">{filesChanged}</span> files changed,{" "}
            <span className="text-green-500">{insertions} </span>insertions (+),{" "}
            <span className="text-red-500">{deletions} </span>deletions (-)
          </CardTitle>
        </CardHeader>
        <CardContent className="whitespace-pre-wrap leading-7">
          <span className="text-xl font-semibold">Changes:</span>
          <br />
          {changes}
          <br />
          <span className="text-xl font-semibold">Tag and Branch Update:</span>
          <br />
          {tagBranch}
        </CardContent>
      </Card>
    : null;
}
