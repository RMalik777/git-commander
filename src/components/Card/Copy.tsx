import { open } from "@tauri-apps/api/dialog";
import { copyFile, exists } from "@tauri-apps/api/fs";
import { open as openFolder } from "@tauri-apps/api/shell";

import { useState } from "react";

import { useAppSelector } from "@/lib/Redux/hooks";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

import { MoveRight } from "lucide-react";

const formSchema = z.object({
  source: z.string().min(1, { message: "Please choose source" }),
  destination: z.string().min(1, { message: "Please choose destination" }),
  rememberSource: z.boolean().default(false).optional(),
  rememberDestination: z.boolean().default(false).optional(),
});
export function Copy() {
  const { toast } = useToast();
  const [source, setSource] = useState(localStorage.getItem("source") ?? "");
  const [destination, setDestination] = useState(
    localStorage.getItem("destination") ?? ""
  );

  const currentRepoDir = useAppSelector((state) => state.repo.directory);

  const copyForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      source: source,
      destination: destination,
      rememberSource: false,
      rememberDestination: false,
    },
  });
  const { handleSubmit, reset } = copyForm;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const targetFileName = values.source.split("\\").pop();
    try {
      if (await exists(values.destination + "\\" + targetFileName)) {
        throw new Error(
          "File with same name already exists in destination folder."
        );
      }
      if (!(await exists(values.source))) {
        throw new Error(
          "Source file does not exist. Make sure the file is not moved or deleted."
        );
      }
      try {
        await copyFile(
          values.source,
          values.destination + "\\" + targetFileName
        );
        reset();
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
        if (values.rememberSource) {
          localStorage.setItem("source", values.source);
        }
        if (values.rememberDestination) {
          localStorage.setItem("destination", values.destination);
        }
      } catch (error) {
        throw Error(error as string);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error Copying File",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error Copying File",
          description: "An unknown error occured while copying the file",
          variant: "destructive",
        });
      }
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Copy File</CardTitle>
        <CardDescription>Quickly Copy File</CardDescription>
      </CardHeader>
      <CardContent className="">
        <Form {...copyForm}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col items-end gap-4">
            <div className="flex w-full flex-col items-start justify-between gap-4 md:flex-row">
              <FormField
                control={copyForm.control}
                name="source"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Source</FormLabel>
                    <FormControl>
                      <div className="flex flex-row gap-2">
                        <div className="w-full">
                          <Input {...field} />
                          <FormDescription>
                            Choose the file you want to copy
                          </FormDescription>
                          <FormMessage />
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            const toOpen = await open({
                              multiple: true,
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
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <div className="flex flex-row gap-2">
                        <div className="w-full">
                          <Input {...field} />
                          <FormDescription>
                            Choose the destination folder
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
                              localStorage.setItem(
                                "destination",
                                toOpen.toString()
                              );
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
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Remember Source</FormLabel>
                      <FormDescription>
                        Remember the source file for next time
                      </FormDescription>
                    </div>
                  </FormItem>
                )}></FormField>
              <FormField
                control={copyForm.control}
                name="rememberDestination"
                render={({ field }) => (
                  <FormItem className="relative flex w-full flex-row items-start gap-2 space-y-0 self-start rounded border p-2 dark:border-neutral-800 md:w-1/2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
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

            <div className="space-x-2">
              <Button type="submit">Copy</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
