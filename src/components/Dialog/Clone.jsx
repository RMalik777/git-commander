import { Check, ChevronsUpDown, CloudDownload } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
    value: "dashone",
    label: "https://github.com/RMalik777/DashOne",
  },
  {
    value: "web-blog",
    label: "https://github.com/RMalik777/web-blog",
  },
  {
    value: "filebag",
    label: "https://github.com/RMalik777/FileBag",
  },
];

const FormSchema = z.object({
  target: z.string({
    required_error: "Please select a language.",
  }),
});
export default function Clone() {
  const cloneForm = useForm({
    resolver: zodResolver(FormSchema),
  });
  const { handleSubmit, reset } = cloneForm;
  function onSubmit(values) {
    console.log(values);
  }

  const [open, setOpen] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Clone</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[480px] lg:max-w-[720px]">
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
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className={cn(
                            "w-full justify-between",
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
                                  setOpen(false);
                                }}
                                className="break-all">
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
