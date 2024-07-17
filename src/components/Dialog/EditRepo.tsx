import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useToast } from "@/components/ui/use-toast";

import { Pencil } from "lucide-react";

import * as db from "@/lib/database";

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Please enter a name" })
    .max(255, { message: "Name is too long" }),
  link: z.string().url({ message: "Please enter a valid URL" }),
});

export function EditRepo({
  repoId,
  oldRepoName,
  oldRepoUrl,
  afterEdit,
}: Readonly<{
  repoId: string;
  oldRepoName: string;
  oldRepoUrl: string;
  afterEdit: () => void;
}>) {
  const [open, setOpen] = useState(false);

  const addRepoForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: oldRepoName,
      link: oldRepoUrl,
    },
  });
  const { handleSubmit, reset } = addRepoForm;
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await db.updateRemoteRepoById(repoId, values.name, values.link);
      toast({
        title: `Repository ${oldRepoName} updated.`,
        action: (
          <ToastAction
            altText="Undo"
            onClick={async () => {
              await db.updateRemoteRepoById(repoId, oldRepoName, oldRepoUrl);
              afterEdit();
              toast({
                title: "Undo successful",
              });
            }}>
            Undo
          </ToastAction>
        ),
      });
      afterEdit();
      reset();
      setOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  }
  const { toast } = useToast();
  useEffect(() => {
    reset();
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="flex flex-grow items-center justify-center gap-1"
          variant="outline"
          size="sm">
          <Pencil size={16} className="md:hidden lg:block" />
          <span className="hidden md:block">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[360px] sm:max-w-[480px] md:max-w-[540px] lg:max-w-prose">
        <DialogHeader>
          <DialogTitle>Edit Repository</DialogTitle>
          <DialogDescription>
            Change the repository name or link.
          </DialogDescription>
        </DialogHeader>
        <Form {...addRepoForm}>
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}>
            <FormField
              control={addRepoForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repository Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="New Repository Name"
                      type="search"
                    />
                  </FormControl>
                  <div>
                    <FormDescription>
                      Repository name that will be shown
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={addRepoForm.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repository Link</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="New Repository URL"
                      type="search"
                    />
                  </FormControl>
                  <div>
                    <FormDescription>
                      Link to corresponding remote repository
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary" onClick={() => reset()}>
                  Cancel
                </Button>
              </DialogClose>
              <Button variant="default" type="submit">
                Edit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
