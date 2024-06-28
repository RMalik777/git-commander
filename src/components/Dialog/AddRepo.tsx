import { Button } from "@/components/ui/button";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import { useToast } from "../ui/use-toast";

import * as db from "@/lib/database";
import { useState } from "react";

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Please enter a name" })
    .max(255, { message: "Name is too long" }),
  link: z.string().url({ message: "Please enter a valid URL" }),
});

export default function AddRepo({ afterAdd }: { afterAdd: () => void }) {
  const [open, setOpen] = useState(false);

  const addRepoForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      link: "",
    },
  });
  const { handleSubmit, reset } = addRepoForm;
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    const response = await db.insertIntoRepo(values.name, values.link);
    console.log(await response);
    if (response instanceof Error) {
      toast({
        title: "Error",
        description: response.message,
        variant: "destructive",
      });
    } else {
      reset();
      toast({
        title: "Repository added",
        description: `Repository ${values.name} added successfully`,
      });
      setOpen(false);
      afterAdd();
    }
  }
  const { toast } = useToast();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Repo</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[360px] sm:max-w-[480px] md:max-w-[540px] lg:max-w-prose">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
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
                      placeholder="Repository Name"
                      type="text"
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
                      placeholder="Repository Link"
                      type="text"
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
                Add
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
