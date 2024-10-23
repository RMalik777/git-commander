import { useEffect, useState } from "react";

import { removeLastCommitMessage } from "@/lib/Redux/gitSlice";
import { useAppDispatch, useAppSelector } from "@/lib/Redux/hooks";
import { setRepo } from "@/lib/Redux/repoSlice";
import { NavLink } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

import { Info, TriangleAlert } from "lucide-react";

import { driver } from "driver.js";

import * as git from "@/lib/git";

const formSchema = z.object({
  commitMsg: z
    .string()
    .min(1, { message: "Commit message cannot be empty" })
    .max(75, { message: "Commit message too long" }),
});

export function Commit({
  getDiff,
  getStaged,
}: {
  getDiff: () => Promise<void>;
  getStaged: () => Promise<void>;
}) {
  const highlighter = driver({});

  const lastCommitMessage = useAppSelector((state) => state.git.lastCommitMessage);

  const repoName = useAppSelector((state) => state.repo.name);
  const currentBranch = useAppSelector((state) => state.repo.branch);
  const currentRepoDir = useAppSelector((state) => state.repo.directory);
  const userName = useAppSelector((state) => state.user.value);
  const diffChanges = useAppSelector((state) => state.repo.diff);

  const [showAlert, setShowAlert] = useState(localStorage.getItem("usernameAlert") !== "hide");

  const commitForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commitMsg: lastCommitMessage ?? "",
    },
  });
  useEffect(() => {
    if (!lastCommitMessage || lastCommitMessage == "") return;
    commitForm.reset({ commitMsg: lastCommitMessage });
    setTimeout(async () => {
      await getStaged();
      await getDiff();
    }, 10);
  }, [lastCommitMessage]);

  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { handleSubmit, reset } = commitForm;
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (userName) await git.configUsername(currentRepoDir, userName);
      const response = await git.commit(currentRepoDir, values.commitMsg);
      dispatch(removeLastCommitMessage());
      getDiff();
      getStaged();
      if (RegExp(/no changes/gi).test(response)) {
        toast({
          title: "No Changes",
          description: "No changes to commit, add changed file to staged before commiting.",
        });
      } else if (RegExp(/nothing to commit/gi).test(response)) {
        toast({
          title: "Nothing to Commit",
          description: "No changes to commit",
        });
      } else {
        toast({
          title: "Successfully Commited",
          description: (
            <>
              Commited to{" "}
              <code className="rounded bg-gray-50 p-1 dark:bg-neutral-900">
                {repoName}/{currentBranch}
              </code>
              <br />
              Commit Message: <br />
              <p>{values.commitMsg}</p>
            </>
          ),
          action: (
            <ToastAction
              altText="Push"
              onClick={async () => {
                try {
                  const response = await git.push(currentRepoDir);
                  if (response.toString().includes("fatal")) {
                    toast({
                      title: "Failed to push",
                      description: response.toString().trim(),
                      variant: "destructive",
                    });
                  } else {
                    toast({
                      title: "Pushed Succesfully",
                      description: response.toString().trim(),
                    });
                  }
                  try {
                    const currentHash = await git.getLatestRemoteCommitHash(
                      currentRepoDir,
                      currentBranch,
                    );
                    dispatch(setRepo({ hash: currentHash }));
                    localStorage.setItem("currentRepoHash", currentHash.toString());
                  } catch (error) {
                    throw Error(error as string);
                  }
                } catch (error) {
                  if (error instanceof Error) {
                    console.error(error);
                    toast({
                      title: "Failed to push",
                      description: (
                        <p className="whitespace-pre-wrap break-words">{error.message}</p>
                      ),
                      variant: "destructive",
                    });
                  }
                }
              }}
            >
              Push
            </ToastAction>
          ),
        });
        reset({ commitMsg: "" });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error ? error?.toString() : "An unknown error occured",
          variant: "destructive",
        });
      }
    }
  }
  return (
    <Form {...commitForm}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex-grow">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Commit</CardTitle>
            <CardDescription>Commit changes made to remote repository</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-2">
                <FormField
                  control={commitForm.control}
                  name="commitMsg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="name">Commit Messages</FormLabel>
                      <FormControl>
                        <Input
                          className="CMT_2"
                          disabled={repoName == ""}
                          placeholder={
                            repoName == "" ? "No Repository Opened" : "RFCXXXXX name div"
                          }
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            dispatch(removeLastCommitMessage());
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Alert
                  variant="warning"
                  className={
                    (userName == "" && showAlert ? "block" : "hidden") + " duration-200 ease-out"
                  }
                >
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription className="flex flex-col items-start gap-1">
                    You haven&apos;t set your username. The commit will be made with the default
                    username. <code>git config --get --global user.name</code>
                    <div className="flex gap-4">
                      <NavLink to="/settings" viewTransition>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className=""
                          onClick={() => {
                            setTimeout(() => {
                              highlighter.highlight({
                                element: "#usernameInput",
                                popover: {
                                  title: "Username Configuration",
                                  description: "Add your username here",
                                  showButtons: ["close"],
                                  onCloseClick: () => {
                                    highlighter.destroy();
                                  },
                                },
                              });
                              setTimeout(() => {
                                highlighter.destroy();
                              }, 5000);
                            }, 1);
                          }}
                        >
                          Add Username
                        </Button>
                      </NavLink>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          localStorage.setItem("usernameAlert", "hide");
                          setShowAlert(!showAlert);
                        }}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
                {diffChanges?.length != 0 ?
                  <Alert variant="information">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Information</AlertTitle>
                    <AlertDescription>You have unstaged changes</AlertDescription>
                  </Alert>
                : null}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="reset" variant="outline" size="sm">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={repoName == ""} className="CMT_3">
              Commit
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
