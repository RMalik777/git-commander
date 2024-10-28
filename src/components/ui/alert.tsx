import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border border-neutral-200 p-4 duration-200 ease-out animate-in fade-in dark:border-neutral-800 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-neutral-950 dark:[&>svg]:text-neutral-50 [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50",
        destructive:
          "border-red-500/50 bg-red-200/20 text-red-600 dark:border-red-500 dark:border-red-900/50 dark:dark:border-red-900 dark:bg-red-900/10 dark:text-red-500 [&>svg]:text-red-500 dark:[&>svg]:text-red-500",
        warning:
          "border-yellow-500/50 bg-yellow-200/20 text-yellow-700 dark:border-yellow-500 dark:border-yellow-900/50 dark:dark:border-yellow-900 dark:bg-yellow-800/20 dark:text-yellow-500 [&>svg]:text-yellow-700 dark:[&>svg]:text-yellow-500",
        information:
          "border-blue-500/50 bg-blue-200/20 text-blue-600 dark:border-blue-500 dark:border-blue-900/50 dark:dark:border-blue-900 dark:bg-blue-800/20 dark:text-blue-100 [&>svg]:text-blue-500 dark:[&>svg]:text-blue-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  ),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
