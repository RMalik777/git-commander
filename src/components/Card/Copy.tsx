import { open } from "@tauri-apps/api/dialog";
import { copyFile, exists, readDir, type FileEntry } from "@tauri-apps/api/fs";
import { open as openFolder } from "@tauri-apps/api/shell";
import { metadata } from "tauri-plugin-fs-extra-api";

import { useState } from "react";

import { useAppSelector } from "@/lib/Redux/hooks";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { FileEntryWithMetadata } from "@/lib/Types/Duplicate";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

import { clsx } from "clsx";
import { MoveRight, TriangleAlert } from "lucide-react";
import { PulseLoader } from "react-spinners";

import { Duplicate } from "@/components/Card/DuplicateDialog";

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
  const [openDialogDuplicate, setOpenDialogDuplicate] = useState(false);
  const [duplicateList, setDuplicateList] = useState<
    { name: string; duplicate: FileEntryWithMetadata[] }[]
  >([]);
  const [uniqueList, setUniqueList] = useState<FileEntry[]>([]);
  const [notFoundList, setNotFoundList] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);

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
    try {
      setIsLoading(true);
      const list = values.fileList.trim().split("\n");
      const dir: FileEntry[] = await readDir(values.source, { recursive: true });
      const found: FileEntry[] = [];
      const uniqueFound: FileEntry[] = [];
      const localDuplicateList: { name: string; duplicate: FileEntryWithMetadata[] }[] = [];

      if (values.rememberSource) localStorage.setItem("source", values.source);
      if (values.rememberDestination) localStorage.setItem("destination", values.destination);
      if (!(await exists(values.destination))) throw new Error("Destination folder does not exist");
      if (!(await exists(values.source))) throw new Error("Source folder does not exist");

      if (list.length === 0) {
        throw new Error("No file to copy");
      }

      await search(dir);
      async function search(parent: FileEntry[]) {
        for (const file of parent) {
          const duplicate =
            uniqueFound.find((item) => item.name === file.name) ??
            localDuplicateList
              .map((item) => item.duplicate)
              .flat()
              .find((item) => item.name === file.name);
          if (duplicate) {
            const duplicateAlreadyAdded = localDuplicateList.find(
              (item) => item.name === file.name,
            );
            if (duplicateAlreadyAdded) {
              duplicateAlreadyAdded.duplicate.push({ ...file, ...(await metadata(file.path)) });
            } else {
              localDuplicateList.push({
                name: file.name ?? "",
                duplicate: [
                  { ...duplicate, ...(await metadata(duplicate.path)) },
                  { ...file, ...(await metadata(file.path)) },
                ],
              });
              uniqueFound.splice(uniqueFound.indexOf(duplicate), 1);
            }
          } else if (file.name /** to satisy TypeScript */ && list.includes(file.name)) {
            found.push(file);
            uniqueFound.push(file);
          }
          if (file.children) {
            await search(file.children);
          }
        }
      }

      const notExistList = list.filter((item) => !found.find((file) => file.name === item));
      if (localDuplicateList.length > 0) {
        localDuplicateList.sort((a, b) => a.name.localeCompare(b.name));
        setDuplicateList(localDuplicateList);
        setOpenDialogDuplicate(true);
        setUniqueList(uniqueFound);
        setNotFoundList(notExistList);
      } else {
        if (found.length > 0) {
          for (const file of uniqueFound) {
            if ((await exists(`${values.destination}/${file.name}`)) && !values.overwrite) {
              throw new Error(
                `File [${file.name}] already exists in the destination folder. Please enable overwrite option to overwrite the file`,
              );
            } else {
              await copyFile(file.path, `${values.destination}/${file.name}`);
            }
          }
        } else {
          throw new Error(
            `File ${notExistList?.join(", ")} does not exist in the source folder. Please check the file name and location`,
            {
              cause: true,
            },
          );
        }
        toast({
          title: "File Copied",
          description: "File has been copied successfully",
        });
      }
      reset({
        fileList: "",
        destination: values.destination,
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Copying Cancelled",
          description: error?.message ?? error.toString(),
          variant: "destructive",
          action:
            error.cause ?
              <ToastAction
                altText="Open Folder"
                onClick={async () => {
                  await openFolder(values.source);
                }}
              >
                Open Folder
              </ToastAction>
            : undefined,
        });
      } else {
        toast({
          title: "Copying Cancelled",
          description: error?.toString() ?? "An unknown error occured",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }
  console.log("Destination:", copyForm.getValues("destination"));

  return (
    <>
      <AlertDialog open={isLoading} onOpenChange={setIsLoading}>
        <AlertDialogContent>
          <AlertDialogHeader className="sr-only">
            <AlertDialogTitle>Loading</AlertDialogTitle>
            <AlertDialogDescription>Validating file to copy</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col items-center gap-1">
            <PulseLoader speedMultiplier={0.7} size={14} margin={7} />
            <h2 className="text-center text-xl font-medium">Loading</h2>
            <p>Please Wait</p>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Duplicate
        open={openDialogDuplicate}
        onOpenChange={setOpenDialogDuplicate}
        duplicateList={duplicateList}
        uniqueList={uniqueList}
        notFoundList={notFoundList}
        destination={copyForm.getValues("destination")}
        overwrite={copyForm.getValues("overwrite")}
        onSubmitClick={() => setOpenDialogDuplicate(false)}
      />

      <Card>
        <CardHeader>
          <CardTitle>Copy File</CardTitle>
          <CardDescription>Quickly Copy File</CardDescription>
        </CardHeader>
        <CardContent className="">
          <Form {...copyForm}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-end gap-2">
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
                          Enter the file name you want to copy, separated by line(
                          {/* */}
                          <span className="rounded bg-neutral-200 px-2 py-1 font-mono text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50">
                            Enter
                          </span>
                          ). Case Sensitive.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              ></FormField>
              <FormField
                control={copyForm.control}
                name="overwrite"
                render={({ field }) => (
                  <FormItem className="relative flex w-full flex-row items-start gap-2 space-y-0 self-start pb-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Overwrite Files with Same Name in Destination</FormLabel>
                  </FormItem>
                )}
              ></FormField>
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
                            }}
                          >
                            Open
                          </Button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                ></FormField>
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
                            }}
                          >
                            Open
                          </Button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                ></FormField>
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
                  )}
                ></FormField>
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
                  )}
                ></FormField>
              </div>

              <div className="flex w-full flex-col items-center justify-end gap-2 md:flex-row md:gap-4">
                <div
                  className={clsx(
                    copyForm.getValues("overwrite") ?
                      "scale-100 opacity-100 max-md:translate-y-0 md:translate-x-0"
                    : "scale-0 opacity-0 max-md:translate-y-6 md:translate-x-40",
                    "flex w-fit items-center gap-1 rounded border border-yellow-500/50 bg-yellow-200/20 p-2 text-yellow-700 duration-200 ease-out dark:border-yellow-500 dark:border-yellow-900/50 dark:dark:border-yellow-900 dark:bg-yellow-800/20 dark:text-yellow-500 [&>svg]:text-yellow-700 dark:[&>svg]:text-yellow-500",
                  )}
                >
                  <TriangleAlert size={16} className="max-xs:hidden" />
                  <p className="text-center font-normal tracking-normal">
                    <span className="font-medium tracking-tight">Warning! </span>Overwrite option is
                    turned on
                  </p>
                </div>
                <Button className="max-md:w-full" type="submit">
                  Copy
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
