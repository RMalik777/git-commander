import { useAppDispatch, useAppSelector } from "@/lib/Redux/hooks";
import { setUser } from "@/lib/Redux/userSlice";

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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const formSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Username can't be empty" })
    .max(50, { message: "Username can't be more than 50 characters" }),
});

export function UsernameConfig() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const usernameForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });
  const { handleSubmit, reset } = usernameForm;

  const username = useAppSelector((state) => state.user.value);
  function onSubmit(values: z.infer<typeof formSchema>) {
    dispatch(setUser(values.username));
    localStorage.setItem("username", values.username);
    toast({
      title: "Username Changed",
      description: (
        <>
          Your username has been changed to{" "}
          <code className="rounded bg-gray-100 p-1">{values.username}</code>
        </>
      ),
    });
    reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Profile configuration</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...usernameForm}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={usernameForm.control}
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
            <Button type="submit">Change</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
