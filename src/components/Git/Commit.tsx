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
import { Input } from "@/components/ui/input";
import { ToastAction } from "@/components/ui/toast";

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
              <div className="flex flex-col space-y-1.5">
                <FormField
                  control={commitForm.control}
                  name="commitMsg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="name">Commit Messages</FormLabel>
                      <FormControl>
                        <Input placeholder="RFCXXXXX name div" {...field} />
                      </FormControl>
                      <FormDescription>Commit Message</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="reset" variant="outline" size="sm">
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Commit
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
