import { copyFile } from "@tauri-apps/api/fs";
import { open } from "@tauri-apps/api/dialog";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";

import { MoveRight } from "lucide-react";

const formSchema = z.object({
  source: z.string().min(1, { message: "Please choose source" }),
  destination: z.string().min(1, { message: "Please choose destination" }),
});
export function Copy() {
  const copyForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      source: "",
      destination: "",
    },
  });
  const { handleSubmit, reset } = copyForm;

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      await copyFile(data.source, data.destination);
      reset();
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent className="">
        <Form {...copyForm}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col items-end gap-4">
            <div className="flex w-full flex-row items-center justify-between gap-4">
              <FormField
                control={copyForm.control}
                name="source"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Source</FormLabel>
                    <FormControl>
                      <div className="flex flex-row gap-2">
                        <Input {...field} />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            const toOpen = await open({
                              multiple: false,
                              directory: true,
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
              <MoveRight className="mt-6 min-w-8" />
              <FormField
                control={copyForm.control}
                name="destination"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <div className="flex flex-row gap-2">
                        <Input {...field} />
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
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>Copy info</CardFooter>
    </Card>
  );
}
