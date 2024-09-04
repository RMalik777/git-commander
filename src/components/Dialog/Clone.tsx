import { useEffect, useState } from "react";

import { open } from "@tauri-apps/api/dialog";
import { Command as ShellCommand } from "@tauri-apps/api/shell";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAppDispatch, useAppSelector } from "@/lib/Redux/hooks";
import { setRepo } from "@/lib/Redux/repoSlice";

import { Checkbox } from "@/components/ui/checkbox";
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
  Dialog,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

import { Check, ChevronsUpDown, CloudDownload } from "lucide-react";
import { ScaleLoader } from "react-spinners";

import * as db from "@/lib/database";
import * as func from "@/lib/functions";
import * as git from "@/lib/git";

import { RepoFormat } from "@/lib/Types/repo";

const formSchema = z.object({
  target: z.string().url({ message: "Please select a repository!" }),
  location: z.string().min(2, {
    message: "Please select a location!",
  }),
  addToDB: z.boolean().default(false).optional(),
});
export function Clone() {
  const { toast } = useToast();
  const theme = window.localStorage.getItem("theme") ?? "";
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
      target: "",
      location: "",
      addToDB: false,
    },
  });
  const { handleSubmit, reset } = cloneForm;
  const username = useAppSelector((state) => state.user.value);
  const [progress, setProgress] = useState("");
  const [isCloning, setIsCloning] = useState(false);
  async function clone(localRepo: string, remoteRepo: string, username: string) {
    git.configUsername(localRepo, username);
    const response: Promise<string[]> = new Promise((resolve, reject) => {
      const result: string[] = [];
      const command = new ShellCommand("git 3 args", ["clone", "--progress", remoteRepo], {
        cwd: localRepo,
      });
      command.on("close", () => {
        setProgress("");
        setIsCloning(false);
        resolve(result);
      });
      command.on("error", (error) => {
        console.error(`command error: "${error}"`);
        reject(new Error(error));
      });
      command.stdout.on("data", (line) => {
        result.push(line);
        setIsCloning(true);
      });
      command.stderr.on("data", (line) => {
        if (line.toString().includes("fatal") || line.toString().includes("error"))
          reject(new Error(line));
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
    values.target = values.target.trim().replaceAll(" ", "");
    const repository =
      links?.find((link) => link.repo_url === values.target) || values.target.split("/").pop();
    if (!repository) {
      // Add Error Handling
      return;
    }
    try {
      const response = await clone(values.location, values.target, username);
      if (response.toString().startsWith("fatal") || response.toString().startsWith("error")) {
        throw new Error(response.toString());
      }
      if (typeof repository == "string") {
        const newLocation = values.location + "\\" + repository.replace(/.git$/, "");
        localStorage.setItem("currentRepoName", repository);
        localStorage.setItem("repoDir", newLocation);
        dispatch(setRepo({ name: repository, directory: newLocation }));
        toast({
          title: "Repository Cloned",
          description: (
            <p>
              Repository <b>{repository}</b> cloned successfully!
              <br />
              Location: <code className="rounded bg-gray-100 p-1">{newLocation}</code>
            </p>
          ),
        });
      } else {
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
              Location: <code className="rounded bg-gray-100 p-1">{newLocation}</code>
            </p>
          ),
        });
      }
      func.displayNotificationNotFocus("Repository Cloned", "Git Clone Completed Successfully!");
      if (values.addToDB) {
        const repoName = values.target.split("/").pop() ?? "";
        if (!(await db.checkUrlDup(values.target))) {
          if (!values.target?.endsWith(".git")) {
            values.target += ".git";
          }
          try {
            await db.insertIntoRepo(repoName, values.target);
            setTimeout(() => {
              toast({
                title: "Repository added",
                description: `Repository ${repoName} added successfully`,
              });
            }, 3000);
          } catch (error) {
            console.error(error);
            setTimeout(() => {
              toast({
                title: "Error",
                description: "Failed to save repository URL",
                variant: "destructive",
              });
            }, 3000);
          }
        } else {
          setTimeout(() => {
            toast({
              title: "Repository is not saved",
              description: "Repository with same URL already exists.",
              variant: "destructive",
            });
          }, 3000);
        }
      }
      reset();
      setDialogOpen(false);
      setLocation("");
    } catch (error) {
      if (error instanceof Error) {
        func.displayNotificationNotFocus(
          "Error Cloning Repository",
          "An error occurred while cloning the repository. Please try again"
        );
        console.error(error);
        toast({
          title: "Error Cloning Repository",
          description: <>{error.message}</>,
          variant: "destructive",
        });
      }
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
        <Button variant="secondary" size="sm" className="CR_1">
          Clone
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-fit xs:max-w-[360px] sm:max-w-[540px] md:max-w-[640px] lg:max-w-[720px]">
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
                    <div className="CR_2 flex flex-col items-center justify-center gap-1 sm:flex-row">
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={comboOpen}
                            className={cn(
                              "peer h-fit w-full justify-between whitespace-normal break-all text-left",
                              !field.value && "text-muted-foreground"
                            )}>
                            {field.value ?
                              links?.find((link) => link.repo_url === field.value)?.repo_name
                            : "Select remote repository..."}

                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <div className="flex w-full flex-row items-center justify-center gap-4 sm:w-fit sm:gap-1">
                        <Separator orientation="horizontal" className="block shrink grow sm:w-2" />
                        <p>or</p>
                        <Separator orientation="horizontal" className="block shrink grow sm:w-2" />
                      </div>
                      <Input type="text" {...field} placeholder="https://example.com/" />
                    </div>
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
                                    link.repo_url === field.value ? "opacity-100" : "opacity-0"
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
                  <FormDescription>
                    Choose from dropdown or enter the repository URL.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={cloneForm.control}
              name="addToDB"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-2 space-y-0 rounded border p-2 dark:border-neutral-800">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Save URL</FormLabel>
                    <FormDescription>
                      Save the URL from the input field to the remote repository list.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={cloneForm.control}
              name="location"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Location</FormLabel>
                  <FormControl className="CR_3">
                    <div className="flex flex-row gap-2">
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setLocation(e.target.value);
                        }}
                        value={location}
                        placeholder="Location"
                      />
                      <Button
                        variant="outline"
                        type="button"
                        onClick={async () => {
                          const newLocation = await openFile();
                          field.onChange({ target: { value: newLocation } });
                        }}>
                        Open
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>Location to store cloned repository.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              {isCloning ?
                theme == "Dark" ?
                  <ScaleLoader height={16} width={1.5} margin={1.75} radius={8} color="#d4d4d4" />
                : <ScaleLoader height={16} width={1.5} margin={1.75} radius={8} color="#404040" />
              : <Button
                  className="CR_2A"
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}>
                  Close
                </Button>
              }
              {progress ?
                <p className="text-center text-neutral-700 dark:text-neutral-300 sm:text-right">
                  {progress}
                </p>
              : null}

              <Button
                type="submit"
                variant="default"
                disabled={isCloning}
                className="CR_4 flex flex-row items-center gap-1">
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
