import { useState } from "react";

import { useAppSelector } from "@/lib/Redux/hooks";

import { open } from "@tauri-apps/api/dialog";
import {
  createDir,
  exists,
  type FileEntry,
  readBinaryFile,
  readDir,
  removeDir,
  writeBinaryFile,
  writeTextFile,
} from "@tauri-apps/api/fs";
import { Command, open as openFolder } from "@tauri-apps/api/shell";
import { metadata } from "tauri-plugin-fs-extra-api";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

import { BarLoader } from "react-spinners";
import { clsx } from "clsx";

import { displayNotificationNotFocus } from "@/lib/functions";

const formSchema = z.object({
  archiveName: z.string().min(1, { message: "Please enter a name for the file" }),
  archiveFormat: z.string().min(1, { message: "Please choose a file type" }),
  location: z.string().optional().default(""),
});

const compressionFormat = [
  { value: "zip", label: "Zip" },
  { value: "7z", label: "7z" },
];

export function ZipFunctionDialog({ fileList }: Readonly<{ fileList: FileEntry[] }>) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const currentDir = useAppSelector((state) => state.repo.directory);
  const zipFunctionForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      archiveName: "",
      archiveFormat: localStorage.getItem("format") ?? "",
      location: currentDir,
    },
  });
  const { handleSubmit, reset } = zipFunctionForm;
  async function recursiveCopy(parent: FileEntry, source: string, destination: string) {
    if ((await metadata(parent.path)).isDir) {
      await createDir(`${destination}\\${parent.name}`);
      const childDir = await readDir(parent.path, { recursive: true });
      for (const child of childDir) {
        await recursiveCopy(child, source, `${destination}\\${parent.name}`);
      }
    } else {
      if (!(await exists(parent.path))) throw new Error(`File ${parent.name} not found`);
      await writeBinaryFile({
        path: `${destination}\\${parent.name}`,
        contents: await readBinaryFile(parent.path),
      });
    }
  }
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (fileList.length === 0) {
      toast({
        title: "No File Selected",
        description: "Please add file to the table.",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem("format", values.archiveFormat);
    toast({
      title: "Compressing File",
      description: "Please wait...",
    });
    const tempDir = `${currentDir}\\.$temp`;
    // FLOW: CREATE TEMP FOLDER -> DUPLICATE FILE TO TEMP FOLDER -> RENAME FILE -> CREATE TXT FILE -> ZIP FILE -> DELETE TEMP FOLDER
    try {
      await createDir(tempDir);
      for (const [index, file] of fileList.entries()) {
        const prepend = `${(index + 1).toLocaleString(undefined, { minimumIntegerDigits: 2, useGrouping: false })}.`;
        if ((await metadata(file.path)).isDir) {
          await createDir(`${tempDir}\\${prepend}${file.name}`);
          const childDir = await readDir(file.path, { recursive: true });
          for (const child of childDir) {
            await recursiveCopy(child, child.path, `${tempDir}\\${prepend}${file.name}\\`);
          }
        } else {
          if (!(await exists(file.path))) throw new Error(`File ${file.name} not found`);
          await writeBinaryFile({
            path: `${tempDir}\\${prepend}${file.name}`,
            contents: await readBinaryFile(file.path),
          });
        }
      }
      const newFileList = await readDir(tempDir, { recursive: true });
      const pathList = newFileList.map((item) => `"${item.path}"`);
      const pathListString = `${pathList.join("\n").trim()}`;
      await writeTextFile({ path: `${tempDir}\\zip.txt`, contents: pathListString });

      /**
       * EXPLANATION WHY THE FUNCTION READ A TXT FILE INSTEAD OF PASSING THE PATH DIRECTLY
       *
       * PROBLEM 1: SPACES
       * > If the path contains spaces, the command can't read the path completely.
       * SOLUTION: Enclose the path with double quotes.
       *
       * PROBLEM 2: DOUBLE QUOTES
       * > If the path contains double quotes (because you tried to solve PROBLEM 1), the command will fail too. Because how JavaScript handle double quotes and try to escape the double quotes (" is written as \" in JavaScript) and the command doesn't know that it is an escape character and will try to read it anyway.
       * SOLUTION: currently unknown
       *
       * So the workaround is to write the path to a text file and then read the text file to get the path.
       *
       * Reference:
       * https://7-zip.opensource.jp/chm/cmdline/syntax.htm
       */

      const command = Command.sidecar("../src-tauri/bin/sza", [
        "a",
        `-t${values.archiveFormat}`,
        `${values.location}\\${values.archiveName}.${values.archiveFormat}`,
        `@${tempDir}\\zip.txt`,
      ]);
      const output = await command.execute();
      if (output.code == 0) {
        toast({
          title: "File Compressed Succesfully",
          action: (
            <ToastAction onClick={async () => openFolder(currentDir)} altText="Open Folder">
              Open Folder
            </ToastAction>
          ),
        });
        await displayNotificationNotFocus(
          "Compression Finished",
          "File has been compressed successfully",
        );
      } else {
        toast({
          title: "Problem Occured While Compressing File",
          description: (
            <>
              Error Code: {output.code}
              <br />
              Error Message: {output.stderr}
            </>
          ),
          variant: "destructive",
        });
        await displayNotificationNotFocus("Compression Failed", output.stderr.toString());
      }
      setDialogOpen(false);
      reset({ archiveFormat: values.archiveFormat, archiveName: "", location: currentDir });
      localStorage.setItem("zipLocation", values.location);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        toast({
          title: "Error While Compressing File",
          description: error.message,
          variant: "destructive",
        });
        displayNotificationNotFocus("Compression Failed", error.message);
      } else {
        toast({
          title: "Unknown Error While Compressing File",
          description: error?.toString(),
          variant: "destructive",
        });
        displayNotificationNotFocus(
          "Compression Failed",
          error?.toString() ?? "Unknown Error Occured",
        );
      }
    } finally {
      setIsLoading(false);
      await removeDir(tempDir, { recursive: true });
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button disabled={fileList.length === 0} variant="default" size="sm">
          Zip
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Compress</DialogTitle>
          <DialogDescription>All the files inside the table will be compressed</DialogDescription>
        </DialogHeader>
        <Form {...zipFunctionForm}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              disabled={isLoading}
              control={zipFunctionForm.control}
              name="archiveName"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Archive Name</FormLabel>
                  <FormControl>
                    <>
                      <Input {...field} placeholder="Example Name" />
                      <FormDescription>File name for the output</FormDescription>
                      <FormMessage />
                    </>
                  </FormControl>
                </FormItem>
              )}
            ></FormField>
            <FormField
              disabled={isLoading}
              control={zipFunctionForm.control}
              name="archiveFormat"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Archive Format</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {compressionFormat?.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose the type of the compressed file</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <FormField
              disabled={isLoading}
              control={zipFunctionForm.control}
              name="location"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <>
                      <div className="flex gap-2">
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                          placeholder="path/to/your/folder"
                        />
                        <Button
                          disabled={isLoading}
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            const toOpen = await open({
                              multiple: false,
                              directory: true,
                              defaultPath: localStorage.getItem("zipLocation") ?? currentDir,
                            });
                            if (toOpen) {
                              field.onChange(toOpen);
                            }
                          }}
                        >
                          Open
                        </Button>
                      </div>
                      <FormDescription>Select the location where to store the file</FormDescription>
                      <FormMessage />
                    </>
                  </FormControl>
                </FormItem>
              )}
            ></FormField>
            <DialogFooter>
              <BarLoader
                width="100%"
                speedMultiplier={0.8}
                className={clsx(isLoading ? "" : "!w-0", "transition-all duration-200 ease-out")}
              />
              <DialogClose asChild>
                <Button variant="outline" type="reset" onClick={() => reset()}>
                  Close
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                Zip
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
