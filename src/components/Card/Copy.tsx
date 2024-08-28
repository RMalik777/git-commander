import { open } from "@tauri-apps/api/dialog";
import { copyFile, exists } from "@tauri-apps/api/fs";
import { open as openFolder } from "@tauri-apps/api/shell";

import { useState } from "react";

import { useAppSelector } from "@/lib/Redux/hooks";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

import { MoveRight, TriangleAlert } from "lucide-react";

const formSchema = z.object({
  fileList: z.string().min(1, { message: "Please enter the file name" }),
  overwrite: z.boolean().default(false).optional(),
  source: z.string().min(1, { message: "Please choose source" }),
  destination: z.string().min(1, { message: "Please choose destination" }),
  rememberSource: z.boolean().default(false).optional(),
  rememberDestination: z.boolean().default(false).optional(),
});
export function Copy() {
  const { toast } = useToast();
  const [source, setSource] = useState(localStorage.getItem("source") ?? "");
  const [destination, setDestination] = useState(localStorage.getItem("destination") ?? "");

  const currentRepoDir = useAppSelector((state) => state.repo.directory);

  const copyForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileList: "",
      overwrite: false,
      source: source,
      destination: destination,
      rememberSource: false,
      rememberDestination: false,
    },
  });
  const { handleSubmit, reset } = copyForm;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const list = values.fileList.trim().split("\n");
    const listLength = list.length;
    const duplicateList = [];
    for (let i = listLength - 1; i >= 0; i--) {
      const file = list[i].trim();
      if (file.length === 0) {
        list.splice(i, 1);
      } else {
        list[i] = file;
        if (!(await exists(`${values.source}/${file}`))) {
          toast({
            title: "Copying Cancelled",
            description: (
              <>
                File <code className="rounded bg-red-700 p-1">{file}</code> does not exist in the
                source folder. Please check the file name and location
              </>
            ),
            variant: "destructive",
            action: (
              <ToastAction
                altText="Open Folder"
                onClick={async () => {
                  await openFolder(values.source);
                }}>
                Open Folder
              </ToastAction>
            ),
          });
          return;
        }
        if ((await exists(`${values.destination}/${file}`)) && !values.overwrite) {
          duplicateList.push(file);
        }
      }
    }
    if (list.length === 0) {
      toast({
        title: "Copying Cancelled",
        description: "No file to copy",
        variant: "destructive",
      });
      return;
    }
    if (duplicateList.length > 0) {
      toast({
        title: "Copying Cancelled",
        description: (
          <>
            File{" "}
            <code className="rounded bg-black/10 p-1 font-medium text-white">
              {duplicateList.join(", ")}
            </code>{" "}
            already exists in the destination folder.
          </>
        ),
        variant: "destructive",
        action: (
          <ToastAction
            altText="Open Folder"
            onClick={async () => {
              await openFolder(values.destination);
            }}>
            Open Folder
          </ToastAction>
        ),
      });
      return;
    }
    list.forEach(async (item) => {
      try {
        await copyFile(`${values.source}/${item}`, `${values.destination}/${item}`, {
          append: false,
        });
        toast({
          title: "File Copied",
          description: "The file has been copied successfully",
          action: (
            <ToastAction
              altText="Open Folder"
              onClick={async () => {
                await openFolder(values.destination);
              }}>
              Open Folder
            </ToastAction>
          ),
        });
        reset();
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          toast({
            title: "Copying Cancelled",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Copying Cancelled",
            description: "An unknown error occurred while copying the file.",
            variant: "destructive",
          });
        }
      }
    });
    console.log(list);
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Copy File</CardTitle>
        <CardDescription>Quickly Copy File</CardDescription>
      </CardHeader>
      <CardContent className="">
        <Form {...copyForm}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-end gap-4">
            <FormField
              control={copyForm.control}
              name="fileList"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>File Name</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Textarea
                        className=""
                        {...field}
                        placeholder={`example.txt\nexample2.txt\nexample3.txt`}
                      />
                      <FormDescription>
                        Enter the file name you want to copy, separated by line/
                        {/* */}
                        <span className="rounded bg-neutral-200 px-2 py-1 font-mono text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50">
                          Enter
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormControl>
                </FormItem>
              )}></FormField>
            <FormField
              control={copyForm.control}
              name="overwrite"
              render={({ field }) => (
                <FormItem className="relative flex w-full flex-row items-start gap-2 space-y-0 self-start">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel>Overwrite Files with Same Name in Destination</FormLabel>
                </FormItem>
              )}></FormField>
            <div className="flex w-full flex-col items-start justify-between gap-4 md:flex-row">
              <FormField
                control={copyForm.control}
                name="source"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Source Folder</FormLabel>
                    <FormControl>
                      <div className="flex flex-row gap-2">
                        <div className="w-full">
                          <Input {...field} />
                          <FormDescription>
                            Choose the folder where the source file is located.
                          </FormDescription>
                          <FormMessage />
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            const toOpen = await open({
                              multiple: true,
                              directory: true,
                              defaultPath: currentRepoDir,
                            });
                            if (toOpen) {
                              setSource(toOpen.toString());
                              localStorage.setItem("source", toOpen.toString());
                              field.onChange(toOpen.toString());
                            }
                          }}>
                          Open
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}></FormField>
              <MoveRight className="mt-4 hidden min-w-8 self-center md:block" />
              <FormField
                control={copyForm.control}
                name="destination"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Destination Folder</FormLabel>
                    <FormControl>
                      <div className="flex flex-row gap-2">
                        <div className="w-full">
                          <Input {...field} />
                          <FormDescription>
                            Choose the destination folder where the file will be.
                          </FormDescription>
                          <FormMessage />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            const toOpen = await open({
                              multiple: false,
                              directory: true,
                            });
                            if (toOpen) {
                              setDestination(toOpen.toString());
                              localStorage.setItem("destination", toOpen.toString());
                              field.onChange(toOpen.toString());
                            }
                          }}>
                          Open
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}></FormField>
            </div>
            <div className="flex w-full flex-col gap-2 md:flex-row md:gap-16">
              <FormField
                control={copyForm.control}
                name="rememberSource"
                render={({ field }) => (
                  <FormItem className="relative flex w-full flex-row items-start gap-2 space-y-0 self-start rounded border p-2 dark:border-neutral-800 md:w-1/2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Remember Source</FormLabel>
                      <FormDescription>Remember the source file for next time</FormDescription>
                    </div>
                  </FormItem>
                )}></FormField>
              <FormField
                control={copyForm.control}
                name="rememberDestination"
                render={({ field }) => (
                  <FormItem className="relative flex w-full flex-row items-start gap-2 space-y-0 self-start rounded border p-2 dark:border-neutral-800 md:w-1/2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Remember Destination</FormLabel>
                      <FormDescription>
                        Remember the destination folder for next time
                      </FormDescription>
                    </div>
                  </FormItem>
                )}></FormField>
            </div>

            <div className="flex w-full flex-col items-center justify-end gap-2 md:flex-row md:gap-4">
              <div
                className={
                  (copyForm.getValues("overwrite") ?
                    "scale-100 opacity-100 max-md:translate-y-0 md:translate-x-0"
                  : "scale-0 opacity-0 max-md:translate-y-6 md:translate-x-40") +
                  " flex w-fit items-center gap-1 rounded border border-yellow-500/50 bg-yellow-200/20 p-2 text-yellow-700 duration-200 ease-out dark:border-yellow-500 dark:border-yellow-900/50 dark:dark:border-yellow-900 dark:bg-yellow-800/20 dark:text-yellow-500 [&>svg]:text-yellow-700 dark:[&>svg]:text-yellow-500"
                }>
                <TriangleAlert size={16} />
                <p className="text-center font-medium">
                  Warning! <span className="font-normal">Overwrite option is turned on</span>
                </p>
              </div>
              <Button type="submit">Copy</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
