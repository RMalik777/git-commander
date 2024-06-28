import { useEffect, useState } from "react";

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
import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
("use client");

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const formSchema = z.object({
  username: z.string().min(2).max(50),
});

export default function Settings() {
  const [username, setUsername] = useState("IDxxxxx");
  useEffect(() => {
    setUsername(localStorage.getItem("username") || "IDxxxxx");
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  function onSubmit(values) {
    localStorage.setItem("username", values.username);
  }
  return (
    <Card>
      <CardHeader className="px-6 pb-3">
        <CardTitle>Profile</CardTitle>
        <CardDescription>Profile configuration</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder={username} {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be the <b>user.name</b> used when committing
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
