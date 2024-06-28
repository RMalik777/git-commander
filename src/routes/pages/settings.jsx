import { useSelector, useDispatch } from "react-redux";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import RepoTable from "@/components/Table/RepoTable";
import AddRepo from "@/components/Dialog/AddRepo";

const formSchema = z.object({
  username: z.string().min(2).max(50),
});

export default function Settings() {
  const dispatch = useDispatch();
  const username = useSelector((state) => state.user.value);

  const usernameForm = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });
  const { handleSubmit, reset } = usernameForm;

  function onSubmit(values) {
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
  const { toast } = useToast();
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="bg-gray-100 pb-3">
          <CardTitle>Profile</CardTitle>
          <CardDescription>Profile configuration</CardDescription>
        </CardHeader>
        <CardContent className="pt-3">
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

      <Card>
        <CardHeader className="bg-gray-100 pb-3">
          <CardTitle>Remote Repositories List</CardTitle>
          <CardDescription>
            Add or remove your predefined remote repositories
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3">
          <RepoTable />
        </CardContent>
        <CardFooter>
          <AddRepo />
        </CardFooter>
      </Card>

      <Button
      className="w-fit self-end"
        variant="destructive"
        onClick={() => {
          localStorage.clear();
        }}>
        Clear Settings
      </Button>
    </div>
  );
}
