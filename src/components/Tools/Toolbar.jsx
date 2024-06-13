import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  GitBranch,
  GitCompare,
  ArrowDownToLine,
  ArrowUpToLine,
} from "lucide-react";

export default function Toolbar() {
  return (
    <div className="border-b border-neutral-200 px-3 py-3">
      <TooltipProvider delayDuration={50}>
        <ul className="flex flex-row items-center gap-12">
          <li>
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
          </li>
          <li>
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
          </li>
          <li>
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
          </li>
          <li>
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
          </li>
        </ul>
      </TooltipProvider>
    </div>
  );
}
