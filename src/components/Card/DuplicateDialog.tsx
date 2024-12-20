import type { FileEntryWithMetadata } from "@/lib/Types/Duplicate";
import { copyFile, exists, type FileEntry } from "@tauri-apps/api/fs";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";

import { clsx } from "clsx";

export function Duplicate({
  open,
  onOpenChange,
  duplicateList,
  uniqueList,
  notFoundList,
  destination,
  overwrite,
  onSubmitClick,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duplicateList: { name: string; duplicate: FileEntryWithMetadata[] }[];
  uniqueList: FileEntry[];
  notFoundList: string[];
  destination: string;
  overwrite?: boolean;
  onSubmitClick: () => void;
}>) {
  const [progress, setProgress] = useState(0);
  const FormSchema = z.object(
    Object.fromEntries(
      duplicateList?.map((name) => [
        // Convert the name to a valid key
        name?.name?.replaceAll(".", "__"),
        z.enum(["skip", ...name.duplicate.map((item) => item.path)] as [string, ...string[]], {
          required_error: "Select which file to copy.",
        }),
      ]),
    ),
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const { toast } = useToast();
  const {
    formState: { errors },
  } = form;

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    try {
      if (notFoundList.length == 0) {
        for (const file of uniqueList) {
          if ((await exists(`${destination}/${file.name}`)) && !overwrite) {
            throw new Error(
              `File [${file.name}] already exists in the destination folder. Please enable overwrite option to overwrite the file`,
            );
          } else {
            await copyFile(file.path, `${destination}/${file.name}`);
          }
        }
      } else {
        throw new Error(
          `File ${notFoundList?.join(", ")} does not exist in the source folder. Please check the file name and location`,
          {
            cause: true,
          },
        );
      }
      for (const name of duplicateList) {
        const key = name.name.replaceAll(".", "__");
        if (values[key] === "skip") continue;
        if (!values[key]) throw new Error("Value Error");
        const file = name.duplicate.find((item) => item.path === values[key]);
        if (!file) throw new Error("Value Error");
        if ((await exists(`${destination}/${file.name}`)) && !overwrite) {
          throw new Error(
            `File ${file.name} already exist in the destination folder. Please enable overwrite option to overwrite the file`,
          );
        } else {
          copyFile(file.path, `${destination}/${file.name}`);
        }
      }
      toast({
        title: "File Copied",
        description: "File has been copied successfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "An error occurred",
          description: error.message ?? error.toString(),
          variant: "destructive",
        });
      } else {
        toast({
          title: "An error occurred",
          description: error?.toString() ?? "An unknown error occurred",
          variant: "destructive",
        });
      }
    } finally {
      form.reset();
      setProgress(0);
      onSubmitClick();
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Found Duplicate</AlertDialogTitle>
          <AlertDialogDescription>
            The program found file with the same name. Please select which file you would like to
            copy.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div
          className={clsx(
            Object.keys(errors).length > 0 ? "text-red-500 dark:text-red-900" : "",
            "flex flex-col items-end gap-0",
          )}
        >
          <small className="ml-px self-start font-medium">Progress</small>
          <Progress
            value={(progress / (duplicateList.length - 1)) * 100}
            indicatorClassName={Object.keys(errors).length > 0 ? "bg-red-500 dark:bg-red-900" : ""}
          />
          <div className="flex w-full flex-row-reverse items-center justify-between px-px">
            <small className="font-mono">
              {progress + 1}/{duplicateList.length - 1 + 1}
            </small>
            <small className={clsx(Object.keys(errors).length === 0 ? "hidden" : "")}>
              Error in:{" "}
              {duplicateList
                ?.filter((item) => Object.keys(errors).includes(item.name.replaceAll(".", "__")))
                .map((item) => duplicateList.findIndex((dupItem) => dupItem.name === item.name) + 1)
                .join(", ")}
            </small>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-6">
            <FormField
              key={duplicateList?.[progress]?.name}
              control={form?.control}
              name={duplicateList?.[progress]?.name?.replaceAll(".", "__")}
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{duplicateList?.[progress]?.name}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col"
                    >
                      {duplicateList?.[progress]?.duplicate?.map((file) => (
                        <FormItem key={file.path}>
                          <FormLabel className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 duration-200 hover:shadow dark:border-neutral-800 dark:hover:border-neutral-700 dark:hover:shadow-neutral-800">
                            <FormControl>
                              <RadioGroupItem value={file.path} />
                            </FormControl>
                            <div className="space-y-1">
                              <span>
                                {file.name}{" "}
                                <span className="font-mono font-normal">
                                  ({file.size / 1000} KB)
                                </span>
                              </span>
                              <FormDescription className="flex flex-col gap-0 font-normal">
                                {file.path}{" "}
                                <small>
                                  Last Edited{" "}
                                  {file.modifiedAt.toLocaleString(undefined, {
                                    dateStyle: "long",
                                    timeStyle: "medium",
                                  })}
                                </small>
                              </FormDescription>
                            </div>
                          </FormLabel>
                        </FormItem>
                      ))}
                      <FormItem>
                        <FormLabel className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 duration-200 hover:shadow dark:border-neutral-800 dark:hover:border-neutral-700 dark:hover:shadow-neutral-800">
                          <FormControl>
                            <RadioGroupItem value="skip" />
                          </FormControl>
                          <span>Skip</span>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-row gap-1 *:flex-grow">
              <Button
                type="button"
                variant="outline"
                disabled={progress === 0}
                onClick={() => setProgress((prev) => prev - 1)}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={progress === duplicateList.length - 1}
                onClick={() => setProgress((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
