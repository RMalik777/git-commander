import { useState } from "react";
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
  DialogClose,
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

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import * as git from "@/lib/git";

const links = [
  {
    value: "git-commander",
    label: "https://github.com/RMalik777/git-commander",
  },
  {
    value: "porto",
    label: "https://github.com/RMalik777/porto",
  },
  {
    value: "DashOne",
    label: "https://github.com/RMalik777/DashOne",
  },
  {
    value: "web-blog",
    label: "https://github.com/RMalik777/web-blog",
  },
  {
    value: "FileBag",
    label: "https://github.com/RMalik777/FileBag",
  },
];

const formSchema = z.object({
  target: z.string({
    required_error: "Please select a repository!",
  }),
  location: z.string().min(2, {
    message: "Please select a location!",
  }),
});
export default function Clone() {
  const [comboOpen, setComboOpen] = useState(false);
  const cloneForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
    },
  });
  const { handleSubmit, reset } = cloneForm;
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values.target);
    const repository = links.find((link) => link.value === values.target);
    if (!repository) {
      // Add Error Handling
      return;
    }
    git.clone(values.location, repository.label);
    localStorage.setItem("currentRepoName", repository.value);
    setLocation("");
    reset();
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Clone</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[360px] sm:max-w-[480px] md:max-w-[540px] lg:max-w-prose">
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
                            links.find((link) => link.value === field.value)
                              ?.label
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
                            {links.map((link) => (
                              <CommandItem
                                key={link.value}
                                value={link.value}
                                onSelect={() => {
                                  cloneForm.setValue("target", link.value);
                                  setComboOpen(false);
                                }}
                                className="whitespace-normal break-all">
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    link.value === field.value ?
                                      "opacity-100"
                                    : "opacity-0"
                                  )}
                                />
                                {link.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Remote repository to clone.</FormDescription>
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

            <DialogFooter>
              <Button
                type="submit"
                variant="default"
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
