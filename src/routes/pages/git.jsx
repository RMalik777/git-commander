import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { CloudDownload } from "lucide-react";

const frameworks = [
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

export default function Git() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <>
      <h1>Git</h1>
      <Card>
        <CardHeader className="bg-gray-100 pb-3">
          <CardTitle>Clone Repository</CardTitle>
          <CardDescription>Select remote repository to clone</CardDescription>
        </CardHeader>
        <CardContent className="pt-3">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[480px] justify-between overflow-hidden lg:w-[720px]">
                {value ?
                  frameworks.find((framework) => framework.value === value)
                    ?.label
                : "Select remote repository..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[480px] p-0 lg:w-[720px]">
              <Command>
                <CommandInput placeholder="Search repositories..." />
                <CommandList>
                  <CommandEmpty>No framework found.</CommandEmpty>
                  <CommandGroup>
                    {frameworks.map((framework) => (
                      <CommandItem
                        key={framework.value}
                        value={framework.value}
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? "" : currentValue);
                          setOpen(false);
                        }}
                        className="break-all">
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === framework.value ?
                              "opacity-100"
                            : "opacity-0"
                          )}
                        />
                        {framework.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
        <CardFooter>
          <Button
            variant="default"
            className="flex flex-row items-center gap-2">
            <CloudDownload size={20} />
            Clone
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
