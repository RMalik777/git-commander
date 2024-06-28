import { useState, useLayoutEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/Redux/hooks";
import { setRepo } from "@/lib/Redux/repoSlice";

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
import { useToast } from "@/components/ui/use-toast";

import {
  ArrowDownToLine,
  ArrowUpToLine,
  GitBranch,
  GitCompare,
  Undo2,
} from "lucide-react";

import * as git from "@/lib/git";

export default function Toolbar() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const currentBranch = useAppSelector((state) => state.repo.branch);
  const [branchList, setBranchList] = useState([]);

  const username = useAppSelector((state) => state.user.value);
  const repoName = useAppSelector((state) => state.repo.name);
  const dirLocation = useAppSelector((state) => state.repo.directory);

  useLayoutEffect(() => {
    async function getBranch() {
      const target = await git.currentBranch(dirLocation);
      const newBranchList = await git.branchList(dirLocation);
      setBranchList(newBranchList);
      const showedBranch = newBranchList?.find(
        (branch) => branch.toLowerCase() === target.toLowerCase()
      );
      dispatch(setRepo({ branch: showedBranch }));
    }
    getBranch();
  }, [currentBranch, repoName]);

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
                      onValueChange={async (e) => {
                        try {
                          const response = await git.switchBranch(
                            dirLocation,
                            e
                          );
                          toast({
                            title: "Switched Branch",
                            description: (
                              <p className="whitespace-pre-wrap break-words">
                                {response}
                              </p>
                            ),
                          });
                          dispatch(setRepo({ branch: e }));
                        } catch (error) {
                          console.error(error);
                          toast({
                            title: "Failed to switch branch",
                            description: (
                              <p className="whitespace-pre-wrap break-words">
                                {error.message}
                              </p>
                            ),
                            variant: "destructive",
                          });
                        }
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
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={async () => {
                        const response = await git.pull(dirLocation);
                        toast({
                          title: "Pulled Succesfully",
                          description: response,
                        });
                      }}>
                      <ArrowDownToLine />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Pull</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={async () => {
                        const response = await git.push(dirLocation);
                        toast({
                          title: "Pushed Succesfully",
                          description: response,
                        });
                      }}>
                      <ArrowUpToLine />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Push</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </li>
            <li>
              <div className="flex gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={async () => {
                        const response = await git.undoLastCommit(dirLocation);
                        toast({
                          title: "Undo Succesfully",
                          description: response,
                        });
                      }}>
                      <Undo2 />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Undo Last Commit</p>
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
