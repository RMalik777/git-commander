import { useState, useLayoutEffect } from "react";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  ArrowDownToLine,
  ArrowUpToLine,
  GitBranch,
  GitCompare,
} from "lucide-react";

import * as git from "@/lib/git";

export default function Toolbar() {
  const [currentBranch, setCurrentBranch] = useState("");
  const [branchList, setBranchList] = useState([]);

  const username = useSelector((state) => state.user.value);
  const repoName = useSelector((state) => state.repo.value);

  useLayoutEffect(() => {
    async function getBranch() {
      const repoDir = localStorage.getItem("repoDir");
      const target = await git.currentBranch(repoDir);
      const newBranchList = await git.branchList(repoDir);
      setBranchList(newBranchList);
      const showedBranch = newBranchList.find(
        (branch) => branch.toLowerCase() === target.toLowerCase()
      );
      setCurrentBranch(showedBranch.toString());
    }
    getBranch();
  }, [repoName]);

  return (
    <div className="justify- flex h-fit flex-row items-center justify-between border-b border-neutral-200 px-3 py-3">
      <TooltipProvider delayDuration={50}>
        <div className="flex h-full flex-row items-center gap-4">
          <Button variant="outline" size="sm">
            <h1 className="">
              <span>{repoName}</span>/{currentBranch}
            </h1>
          </Button>
          <Separator orientation="vertical" className="h-full" />
          <ul className="flex flex-row items-center gap-12">
            <li>
              <div className="flex gap-4">
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <GitBranch />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Branch</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Branch</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={currentBranch}
                      onValueChange={(e) => {
                        setCurrentBranch(e);
                        // git.switchBranch(e);
                      }}>
                      {branchList.map((branch) => {
                        return (
                          <DropdownMenuRadioItem key={branch} value={branch}>
                            {branch}
                          </DropdownMenuRadioItem>
                        );
                      })}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

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
                      <ArrowDownToLine
                        onClick={() => {
                          git.pull();
                        }}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Pull</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="outline">
                      <ArrowUpToLine
                        onClick={() => {
                          git.push();
                        }}
                      />
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
