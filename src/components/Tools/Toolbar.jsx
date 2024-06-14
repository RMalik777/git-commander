import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  ArrowDownToLine,
  ArrowUpToLine,
  GitBranch,
  GitCompare,
} from "lucide-react";

export default function Toolbar() {
  const username = localStorage.getItem("username") || "IDxxxxx";
  return (
    <div className="justify- flex h-fit flex-row items-center justify-between border-b border-neutral-200 px-3 py-3">
      <TooltipProvider delayDuration={50}>
        <div className="flex h-full flex-row items-center gap-4">
          <Button variant="outline" size="sm">
            <h1 className="">Current Repo</h1>
          </Button>
          <Separator orientation="vertical" className="h-full" />
          <ul className="flex flex-row items-center gap-12">
            <li>
              <div className="flex gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="outline">
                      <GitBranch />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Branch</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="outline">
                      <GitCompare />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Compare</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </li>
            <li>
              <div className="flex gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="outline">
                      <ArrowDownToLine />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Pull</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="outline">
                      <ArrowUpToLine />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Push</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </li>
          </ul>
        </div>
        <div className="flex h-full w-fit flex-row items-center gap-4">
          <Separator orientation="vertical" className="h-full" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                <p className="text-base">{username}</p>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>
                <b>username</b> used when using git commit
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
