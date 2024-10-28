import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAppDispatch } from "@/lib/Redux/hooks";
import { removeRepo } from "@/lib/Redux/repoSlice";
import { removeUser } from "@/lib/Redux/userSlice";
import { removeFiles } from "@/lib/Redux/fileList";
import { removeLastCommitMessage } from "@/lib/Redux/gitSlice";
import { removePullMsg } from "@/lib/Redux/pullMsg";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";

import { PulseLoader } from "react-spinners";

import { ConfirmationDialog } from "@/components/Dialog/Confirmation";

import * as db from "@/lib/database";

const FormSchema = z.object({
  all: z.boolean().default(false).optional(),
  username: z.boolean().default(false).optional(),
  theme: z.boolean().default(false).optional(),
  repoList: z.boolean().default(false).optional(),
});

export function ClearSettings({
  open,
  setOpen,
}: Readonly<{ open: boolean; setOpen: (open: boolean) => void }>) {
  const [openConfirmation, setOpenConfirmation] = useState(false);

  const clearSettingsForm = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      all: false,
      username: false,
      theme: false,
      repoList: false,
    },
  });

  const dispatch = useAppDispatch();

  const { handleSubmit, reset, watch, setValue } = clearSettingsForm;
  const allChecked = watch("all");
  const themeChecked = watch("theme");
  const repoListChecked = watch("repoList");
  const usernameChecked = watch("username");
  useEffect(() => {
    if (allChecked) {
      setValue("username", true);
      setValue("theme", true);
      setValue("repoList", true);
    } else if (!allChecked && usernameChecked && themeChecked && repoListChecked) {
      setValue("username", false);
      setValue("theme", false);
      setValue("repoList", false);
    }
  }, [allChecked]);

  useEffect(() => {
    if (usernameChecked && themeChecked && repoListChecked) {
      setValue("all", usernameChecked && themeChecked && repoListChecked);
    } else if (!usernameChecked || !themeChecked || !repoListChecked) {
      setValue("all", false);
    }
  }, [usernameChecked, themeChecked, repoListChecked]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "Clearing Settings",
      description: <PulseLoader size={6} speedMultiplier={0.8} />,
      duration: 3000,
    });
    const removedItems = [];
    if (data.all) {
      localStorage.clear();
      sessionStorage.clear();
      dispatch(removeUser());
      dispatch(removeRepo());
      dispatch(removeFiles());
      dispatch(removeLastCommitMessage());
      dispatch(removePullMsg());
      removedItems.push("All settings");
    } else {
      if (data.username) {
        localStorage.removeItem("username");
        dispatch(removeUser());
        removedItems.push("Username");
      }
      if (data.theme) {
        localStorage.removeItem("theme");
        removedItems.push("Theme");
      }
      if (data.repoList) {
        localStorage.removeItem("repoDir");
        localStorage.removeItem("currentRepoName");
        sessionStorage.clear();
        dispatch(removeRepo());
        removedItems.push("Repository list");
        try {
          await db.deleteAllRemoteRepo();
        } catch (error) {
          toast({
            title: "Error",
            description: "An error occurred while clearing the repository list",
            duration: 3000,
            variant: "destructive",
          });
          console.error(error);
          return;
        }
      }
    }
    toast({
      title: "Removed Settings",
      description: <p>{removedItems.join(", ")} removed successfully</p>,
      duration: 3000,
    });
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[360px] sm:max-w-[480px] md:max-w-[540px] lg:max-w-prose">
        <DialogHeader>
          <DialogTitle>Clear Settings</DialogTitle>
          <DialogDescription>Choose what you want to clear</DialogDescription>
        </DialogHeader>
        <Form {...clearSettingsForm}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-1">
            <FormField
              control={clearSettingsForm.control}
              name="all"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2 dark:border-neutral-800">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>All</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={clearSettingsForm.control}
              name="username"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2 dark:border-neutral-800">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Username</FormLabel>
                    <FormDescription>Clear your username from the settings.</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={clearSettingsForm.control}
              name="theme"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2 dark:border-neutral-800">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Theme</FormLabel>
                    <FormDescription>Reset your theme to default.</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={clearSettingsForm.control}
              name="repoList"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2 dark:border-neutral-800">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Repository List</FormLabel>
                    <FormDescription>Clear all repositories from the list.</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline" type="reset" onClick={() => reset()}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                type="button"
                onClick={() => {
                  if (!allChecked && !usernameChecked && !themeChecked && !repoListChecked) {
                    toast({
                      title: "No Category Selected",
                      description: "Please select the settings you want to clear",
                      duration: 3000,
                    });
                    return;
                  }
                  setOpenConfirmation(true);
                }}
              >
                Clear Settings
              </Button>
            </DialogFooter>
            <ConfirmationDialog
              message="This action will remove all "
              open={openConfirmation}
              setOpen={setOpenConfirmation}
              onConfirm={handleSubmit(onSubmit)}
              title="Are you sure"
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
