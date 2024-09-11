import { useState } from "react";

import { open } from "@tauri-apps/api/dialog";
import { type FileEntry, exists } from "@tauri-apps/api/fs";

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

import { Lightbulb, Plus } from "lucide-react";

const formSchema = z.object({
  location: z
    .string()
    .min(1, { message: "Please choose a location" })
    .or(z.string().array().min(1)),
});

export function ZipTableDialog({
  fileList,
  setFileList,
}: Readonly<{
  fileList: FileEntry[];
  setFileList: (fileList: FileEntry[]) => void;
}>) {
  const { toast } = useToast();
  const [location, setLocation] = useState<string | string[]>("");

  const zipForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
    },
  });

  const { handleSubmit, reset } = zipForm;
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (typeof values.location == "string") {
      if (fileList.find((item) => item.path == values.location)) {
        toast({
          title: "File Already Exist",
        });
        return;
      }
      if (!(await exists(values.location))) {
        toast({
          title: "File Not Found",
          description: "Make sure the file you are trying to add is exist.",
          variant: "destructive",
        });
        return;
      }
      const name = values.location.split("\\").pop();
      setFileList([...fileList, { name: name, path: values.location }]);
    } else {
      if (values.location.length == 0) return;
      else if (values.location.length == 1) {
        const newLocation = values.location.toString();
        const name = newLocation.split("\\").pop();
        setFileList([...fileList, { name: name, path: newLocation }]);
        toast({
          title: "File Added",
        });
      } else {
        const newFileList: FileEntry[] = [];
        const notExist: string[] = [];
        const duplicateList: string[] = [];
        for (let i = values.location.length - 1; i >= 0; i--) {
          if (!(await exists(values.location[i]))) {
            notExist.push(values.location[i]);
            continue;
          }
          if (fileList.find((item) => item.path == values.location[i])) {
            duplicateList.push(values.location[i]);
            continue;
          }
          const newLocation = values.location[i].toString();
          const name = newLocation.split("\\").pop();
          newFileList.push({ name: name, path: newLocation });
        }
        setFileList([...fileList, ...newFileList]);
        toast({
          title:
            newFileList.length > 0 ?
              notExist.length == 0 && duplicateList.length == 0 ?
                "File Added"
              : "File Added with Exception"
            : "No File Added",
          description: `${newFileList.length} added, ${notExist.length} not found, ${duplicateList.length} already exist`,
        });
      }
    }
    setLocation("");
    reset();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Plus size={20} />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add File to Table</DialogTitle>
          <DialogDescription>
            You can add file by inputting the location into the form or use the open button to
            select it directly
          </DialogDescription>
        </DialogHeader>
        <Form {...zipForm}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField
              control={zipForm.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="location">Location</FormLabel>
                  <FormControl>
                    <>
                      <div className="flex gap-2">
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setLocation(e.target.value);
                          }}
                          id="location"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            const toOpen = await open({ multiple: true });
                            if (toOpen) {
                              setLocation(toOpen);
                              field.onChange(toOpen);
                            }
                          }}>
                          Open
                        </Button>
                      </div>
                      <FormDescription>
                        <Lightbulb className="inline" size={16} />
                        TIP: You can select multiple files with open button <br />
                        {typeof location == "string" ? "" : ` (${location.length}) files selected`}
                      </FormDescription>
                      <FormMessage />
                    </>
                  </FormControl>
                </FormItem>
              )}></FormField>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="reset" variant="outline">
                  Close
                </Button>
              </DialogClose>
              <Button type="submit">Add</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
