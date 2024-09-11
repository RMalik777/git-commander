import { useAppSelector } from "@/lib/Redux/hooks";

import { open } from "@tauri-apps/api/dialog";
import {
  createDir,
  type FileEntry,
  readBinaryFile,
  readDir,
  removeDir,
  removeFile,
  renameFile,
  writeBinaryFile,
  writeTextFile,
} from "@tauri-apps/api/fs";
import { Command, open as openFolder } from "@tauri-apps/api/shell";

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
  const currentDir = useAppSelector((state) => state.repo.directory);
  const zipFunctionForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      archiveName: "",
      archiveFormat: sessionStorage.getItem("format") ?? "",
      location: currentDir,
    },
  });
  const { handleSubmit, reset } = zipFunctionForm;
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (fileList.length === 0) {
      toast({
        title: "No File Selected",
        description: "Please add file to the table.",
        variant: "destructive",
      });
      return;
    }
    sessionStorage.setItem("format", values.archiveFormat);
    toast({
      title: "Compressing File",
      description: "Please wait...",
    });
    const tempDir = `${currentDir}\\$$temp`;
    // FLOW: CREATE TEMP FOLDER -> DUPLICATE FILE TO TEMP FOLDER -> RENAME FILE -> CREATE TXT FILE -> ZIP FILE -> DELETE TEMP FOLDER
    try {
      await createDir(tempDir);
      for (const [index, file] of fileList.entries()) {
        try {
          await writeBinaryFile({
            path: `${tempDir}\\${file.name}`,
            contents: await readBinaryFile(file.path),
          });
          await renameFile(
            `${tempDir}\\${file.name}`,
            `${tempDir}\\${(index + 1).toLocaleString(undefined, { minimumIntegerDigits: 2, useGrouping: false })}_${file.name}`
          );
        } catch (error) {
          if (error instanceof Error) {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Unknown Error",
              variant: "destructive",
            });
          }
          return;
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
        `${currentDir}\\${values.archiveName}.${values.archiveFormat}`,
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
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        toast({
          title: "Error While Compressing File",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Unknown Error While Compressing File",
          variant: "destructive",
        });
      }
    } finally {
      await removeFile(`${tempDir}\\zip.txt`);
      await removeDir(tempDir, { recursive: true });
    }
    reset();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          Open Zip Dialog
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
              control={zipFunctionForm.control}
              name="archiveName"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Archive Name</FormLabel>
                  <FormControl>
                    <>
                      <Input {...field} placeholder="example.zip" />
                      <FormDescription>File name for the output</FormDescription>
                      <FormMessage />
                    </>
                  </FormControl>
                </FormItem>
              )}></FormField>
            <FormField
              control={zipFunctionForm.control}
              name="archiveFormat"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Archive Format</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              )}></FormField>
            <FormField
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
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            const toOpen = await open({
                              multiple: false,
                              directory: true,
                              defaultPath: currentDir,
                            });
                            if (toOpen) {
                              field.onChange(toOpen);
                            }
                          }}>
                          Open
                        </Button>
                      </div>
                      <FormDescription>Select the location where to store the file</FormDescription>
                      <FormMessage />
                    </>
                  </FormControl>
                </FormItem>
              )}></FormField>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="reset" onClick={() => reset()}>
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit">Zip</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
