import { useAppSelector, useAppDispatch } from "@/lib/Redux/hooks";
import { removeLastCommitMessage } from "@/lib/Redux/gitSlice";
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
import { useEffect } from "react";

const formSchema = z.object({
  commitMsg: z
    .string()
    .min(1, { message: "Commit message cannot be empty" })
    .max(75, { message: "Commit message too long" }),
});

export function Commit({ getDiff, getStaged }: { getDiff: () => void; getStaged: () => void }) {
  const highlighter = driver({});

  const lastCommitMessage = useAppSelector((state) => state.git.lastCommitMessage);

  const repoName = useAppSelector((state) => state.repo.name);
  const currentBranch = useAppSelector((state) => state.repo.branch);
  const workDir = useAppSelector((state) => state.repo.directory);
  const userName = useAppSelector((state) => state.user.value);
  const diffChanges = useAppSelector((state) => state.repo.diff);

  const commitForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commitMsg: lastCommitMessage ?? "",
    },
  });
  useEffect(() => {
    if (!lastCommitMessage || lastCommitMessage == "") return;
    commitForm.reset({ commitMsg: lastCommitMessage });
  }, [lastCommitMessage]);

  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { handleSubmit, reset } = commitForm;
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await git.commit(workDir, values.commitMsg);
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
              <code className="rounded bg-gray-50 p-1">
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
              onClick={() => {
                git.push(workDir);
              }}>
              Push
            </ToastAction>
          ),
        });
      }
      reset({ commitMsg: "" });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
      toast({
        title: "Error",
        description: "An unknown error occured while commiting changes",
        variant: "destructive",
      });
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
                <Alert variant="warning" className={userName == "" ? "block" : "hidden"}>
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription className="flex flex-col items-start gap-1">
                    You haven&apos;t set your username.
                    <NavLink to="/settings">
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
                        }}>
                        Add Username
                      </Button>
                    </NavLink>
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
