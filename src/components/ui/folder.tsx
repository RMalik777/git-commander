import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, Folder } from "lucide-react";

import { cn } from "@/lib/utils";

const FolderRoot = AccordionPrimitive.Root;

const FolderItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn(className)} {...props} />
));
FolderItem.displayName = "AccordionItem";

const FolderTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex w-full">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex w-full flex-1 items-center justify-between pl-2 font-medium transition-all ease-out [&[data-state=open]>div>svg]:rotate-0",
        className
      )}
      {...props}>
      <div className="flex w-full items-center gap-1">
        <ChevronDown className="h-4 w-4 shrink-0 -rotate-90 transition-transform" />
        <Folder className="h-4 w-4 shrink-0 fill-yellow-400 text-yellow-400 duration-150 ease-out dark:fill-yellow-500 dark:text-yellow-500" />
        {children}
      </div>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
FolderTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const FolderContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}>
    <div className={cn("pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));

FolderContent.displayName = AccordionPrimitive.Content.displayName;

export { FolderRoot, FolderItem, FolderTrigger, FolderContent };
