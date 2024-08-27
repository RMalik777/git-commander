import { useState } from "react";

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
import { useToast } from "@/components/ui/use-toast";

import { ConfirmationDialog } from "@/components/Dialog/Confirmation";

import * as db from "@/lib/database";

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Please enter a name" })
    .max(255, { message: "Name is too long" }),
  link: z.string().url({ message: "Please enter a valid URL" }),
});

export function AddRepo({ afterAdd }: Readonly<{ afterAdd: () => void }>) {
  const [formOpen, setFormOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [agree, setAgree] = useState(false);

  const addRepoForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      link: "",
    },
  });
  const { handleSubmit, reset } = addRepoForm;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!agree && (await db.checkNameDup(values.name))) {
      setConfirmationOpen(true);
    } else {
      try {
        let formattedLink = values.link.trim().replaceAll(" ", "");
        if (!formattedLink.endsWith(".git")) formattedLink += ".git";
        await db.insertIntoRepo(values.name, formattedLink);
        reset();
        toast({
          title: "Repository added",
          description: `Repository ${values.name} added successfully`,
        });
        setFormOpen(false);
        setAgree(false);
        afterAdd();
      } catch (error) {
        if (error instanceof Error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
        setAgree(false);
      }
    }
  }

  const { toast } = useToast();
  return (
    <>
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Add Repo</Button>
        </DialogTrigger>
        <DialogContent className="max-w-[360px] sm:max-w-[480px] md:max-w-[540px] lg:max-w-prose">
          <DialogHeader>
            <DialogTitle>Add Repository</DialogTitle>
            <DialogDescription>
              Add a new repository to the list
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
              <DialogFooter className="items-center">
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    type="reset"
                    onClick={() => reset()}>
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
      <ConfirmationDialog
        open={confirmationOpen}
        setOpen={setConfirmationOpen}
        title="Duplicate Repository Name"
        message="The repository name already exists. Having two repositories with the same name can cause confusion. Do you want to continue?"
        onConfirm={() => setAgree(true)}
      />
    </>
  );
}
