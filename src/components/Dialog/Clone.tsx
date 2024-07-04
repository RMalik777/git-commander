import { useEffect, useState } from "react";
import { open } from "@tauri-apps/api/dialog";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { Check, ChevronsUpDown, CloudDownload } from "lucide-react";
import { ScaleLoader } from "react-spinners";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useAppDispatch, useAppSelector } from "@/lib/Redux/hooks";
import { setRepo } from "@/lib/Redux/repoSlice";

import * as db from "@/lib/database";
import * as git from "@/lib/git";

import { Command as ShellCommand } from "@tauri-apps/api/shell";

import { RepoFormat } from "@/lib/Types/repo";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  target: z.string({
    required_error: "Please select a repository!",
  }),
  location: z.string().min(2, {
    message: "Please select a location!",
  }),
});
export default function Clone() {
  const { toast } = useToast();
  const [comboOpen, setComboOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const dispatch = useAppDispatch();

  const [links, setLinks] = useState<RepoFormat[]>([]);
  async function fetchData() {
    try {
      const response = await db.getAllRepo();
      setLinks(response);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    fetchData();
  }, []);

  const cloneForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
    },
  });
  const { handleSubmit, reset } = cloneForm;
  const username = useAppSelector((state) => state.user.value);
  const [progress, setProgress] = useState("");
  const [isCloning, setIsCloning] = useState(false);
  async function clone(
    localRepo: string,
    remoteRepo: string,
    username: string
  ) {
    git.configUsername(localRepo, username);
    const response: Promise<string[]> = new Promise((resolve, reject) => {
      const result: string[] = [];
      const command = new ShellCommand(
        "git 3 args",
        ["clone", "--progress", remoteRepo],
        {
          cwd: localRepo,
        }
      );
      command.on("close", (data) => {
        console.log(
          `command finished with code ${data.code} and signal ${data.signal}`
        );
        setProgress("");
        setIsCloning(false);
        resolve(result);
      });
      command.on("error", (error) => {
        console.error(`command error: "${error}"`);
        reject(new Error(error));
      });
      command.stdout.on("data", (line) => {
        console.log(`stdout: "${line}"`);
        result.push(line);
        setIsCloning(true);
      });
      command.stderr.on("data", (line) => {
        if (
          line.toString().includes("fatal") ||
          line.toString().includes("error")
        )
          reject(new Error(line));
        console.log(`stderr: "${line}"`);
        setProgress(line);
        setIsCloning(true);
        result.push(line);
      });
      command.spawn().catch((error) => {
        console.error(error);
        setProgress("");
        setIsCloning(false);
        reject(new Error(error));
      });
    });
    return await response;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Cloning Repository",
      description: "Please wait while we clone the repository...",
      duration: 7000,
    });
    console.log(values.target);
    const repository = links?.find((link) => link.repo_url === values.target);
    if (!repository) {
      // Add Error Handling
      return;
    }
    try {
      const response = await clone(values.location, values.target, username);
      if (
        response.toString().startsWith("fatal") ||
        response.toString().startsWith("error")
      ) {
        throw new Error(response.toString());
      }
      const newLocation = values.location + "\\" + repository.repo_name;
      localStorage.setItem("currentRepoName", repository.repo_name);
      localStorage.setItem("repoDir", newLocation);
      dispatch(setRepo({ name: repository.repo_name, directory: newLocation }));
      toast({
        title: "Repository Cloned",
        description: (
          <p>
            Repository <b>{repository.repo_name}</b> cloned successfully!
            <br />
            Location:{" "}
            <code className="rounded bg-gray-100 p-1">{newLocation}</code>
          </p>
        ),
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        toast({
          title: "Error Cloning Repository",
          description: <>{error.message}</>,
          variant: "destructive",
        });
      }
    } finally {
      setLocation("");
      reset();
      setDialogOpen(false);
    }
  }

  const [location, setLocation] = useState("");
  async function openFile() {
    const toOpen = await open({
      multiple: false,
      directory: true,
    });
    if (toOpen) {
      setLocation(toOpen.toString());
      return toOpen;
    }
    return "";
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          Clone
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[360px] sm:max-w-[480px] md:max-w-[540px] lg:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Clone Remote Repository</DialogTitle>
          <DialogDescription>
            Clone a remote repository to your local repositories.
          </DialogDescription>
        </DialogHeader>
        <Form {...cloneForm}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={cloneForm.control}
              name="target"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Repository</FormLabel>
                  <Popover open={comboOpen} onOpenChange={setComboOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={comboOpen}
                          className={cn(
                            "h-fit w-full justify-between whitespace-normal break-all text-left",
                            !field.value && "text-muted-foreground"
                          )}>
                          {field.value ?
                            links?.find((link) => link.repo_url === field.value)
                              ?.repo_name
                          : "Select remote repository..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search repositories..." />
                        <CommandList>
                          <CommandEmpty>No link found.</CommandEmpty>
                          <CommandGroup>
                            {links?.map((link) => (
                              <CommandItem
                                key={link.repo_url}
                                value={link.repo_url}
                                onSelect={() => {
                                  cloneForm.setValue("target", link.repo_url);
                                  setComboOpen(false);
                                }}
                                className="whitespace-normal break-all">
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    link.repo_url === field.value ?
                                      "opacity-100"
                                    : "opacity-0"
                                  )}
                                />
                                {link.repo_url}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Remote repository to clone. Add more in settings</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={cloneForm.control}
              name="location"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <div className="flex flex-row gap-2">
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e); // Handle field change
                          setLocation(e.target.value); // Also update local state
                        }}
                        value={location}
                        placeholder="Location"
                      />
                      <Button
                        variant="outline"
                        type="button"
                        onClick={async () => {
                          const newLocation = await openFile();
                          field.onChange({ target: { value: newLocation } }); // Update form control's value
                        }}>
                        Open
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Location to store cloned repository.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="items-center">
              {isCloning ?
                <ScaleLoader height={16} width={1.5} margin={1.75} radius={8} />
              : null}
              <p className="text-center text-gray-800 sm:text-right">
                {progress}
              </p>
              <Button
                type="submit"
                variant="default"
                disabled={isCloning}
                className="flex flex-row items-center gap-2">
                <CloudDownload size={20} />
                Clone
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
