import { useState } from "react";
import { useSelector } from "react-redux";

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
import { Label } from "@/components/ui/label";
import { ToastAction } from "@/components/ui/toast";

import * as git from "@/lib/git";

const formSchema = z.object({
  commitMsg: z
    .string()
    .min(1, { message: "Commit message cannot be empty" })
    .max(75, { message: "Commit message too long" }),
});

export default function Commit() {
  const [commitMsg, setCommitMsg] = useState("");
  const repoName = useSelector((state) => state.repo.name);
  const workDir = useSelector((state) => state.repo.directory);

  const commitForm = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commitMsg: "",
    },
  });
  const { toast } = useToast();
  const { handleSubmit, reset } = commitForm;
  function onSubmit(values) {
    console.log(values.commitMsg);
    // git.commitAll(workDir, values.commitMsg);
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
    reset();
  }
  return (
    <Form {...commitForm}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="w-fit">
          <CardHeader className="bg-gray-100 pb-3">
            <CardTitle>Commit</CardTitle>
            <CardDescription>
              Commit changes made to remote repository
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-3">
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
