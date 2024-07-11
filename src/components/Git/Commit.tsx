import { useAppSelector } from "@/lib/Redux/hooks";
import { NavLink } from "react-router-dom";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useToast } from "@/components/ui/use-toast";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { ToastAction } from "@/components/ui/toast";

import { TriangleAlert, Info } from "lucide-react";

import * as git from "@/lib/git";

const formSchema = z.object({
  commitMsg: z
    .string()
    .min(1, { message: "Commit message cannot be empty" })
    .max(75, { message: "Commit message too long" }),
});

export default function Commit() {
  const repoName = useAppSelector((state) => state.repo.name);
  const workDir = useAppSelector((state) => state.repo.directory);
  const userName = useAppSelector((state) => state.user.value);
  const stagedChanges = useAppSelector((state) => state.repo.staged);
  const diffChanges = useAppSelector((state) => state.repo.diff);

  const commitForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commitMsg: "",
    },
  });
  const { toast } = useToast();
  const { handleSubmit, reset } = commitForm;
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await git.commitAll(workDir, values.commitMsg);
    if (RegExp(/no changes/gi).test(response)) {
      toast({
        title: "No Changes",
        description:
          "No changes to commit, add changed file to staged before commiting",
        action: (
          <ToastAction altText="Add" onClick={() => {}} asChild>
            <NavLink to="/folder">Staging Area</NavLink>
          </ToastAction>
        ),
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
            <code className="rounded bg-gray-50 p-1">{repoName}/Branch</code>
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
    reset();
  }
  return (
    <Form {...commitForm}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex-grow">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Commit</CardTitle>
            <CardDescription>
              Commit changes made to remote repository
            </CardDescription>
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
                            repoName == "" ?
                              "No Repository Opened"
                            : "RFCXXXXX name div"
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Alert
                  variant="warning"
                  className={userName == "" ? "block" : "hidden"}>
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    You haven&apos;t set your username.
                  </AlertDescription>
                </Alert>
                {diffChanges?.length != 0 ?
                  <Alert variant="information">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Information</AlertTitle>
                    <AlertDescription>
                      You have unstaged changes
                    </AlertDescription>
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
