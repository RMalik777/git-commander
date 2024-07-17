import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const List = AccordionPrimitive.Root;

const ListItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
));
ListItem.displayName = "AccordionItem";

const ListHeader = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Header>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Header>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header
    ref={ref}
    className={cn(
      "flex w-full hover:bg-neutral-100 dark:bg-neutral-900",
      className
    )}
    {...props}>
    {children}
  </AccordionPrimitive.Header>
));
ListHeader.displayName = AccordionPrimitive.Header.displayName;

const ListTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex w-full flex-1 items-center justify-between p-1 font-medium transition-all ease-out [&[data-state=open]>div>svg]:rotate-0",
      className
    )}
    {...props}>
    <div className="flex w-full items-center gap-1">
      <ChevronDown className="h-4 w-4 shrink-0 -rotate-90 transition-transform" />
      {children}
    </div>
  </AccordionPrimitive.Trigger>
));
ListTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const ListContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="ml-3 overflow-hidden border-l pl-2 text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}>
    <div className={cn("pb-2 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));

ListContent.displayName = AccordionPrimitive.Content.displayName;

export { List, ListItem, ListTrigger, ListContent, ListHeader };
