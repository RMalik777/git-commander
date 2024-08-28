import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border border-neutral-200 p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-neutral-950 dark:border-neutral-800 dark:[&>svg]:text-neutral-50 duration-200 ease-out",
  {
    variants: {
      variant: {
        default:
          "bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50",
        destructive:
          "bg-red-200/20 dark:bg-red-900/10 border-red-500/50 text-red-600 dark:border-red-500 [&>svg]:text-red-500 dark:border-red-900/50 dark:text-red-500 dark:dark:border-red-900 dark:[&>svg]:text-red-500",
        warning:
          "bg-yellow-200/20 dark:bg-yellow-800/20 border-yellow-500/50 text-yellow-700 dark:border-yellow-500 [&>svg]:text-yellow-700 dark:border-yellow-900/50 dark:text-yellow-500 dark:dark:border-yellow-900 dark:[&>svg]:text-yellow-500",
        information:
          "bg-blue-200/20 dark:bg-blue-800/20 border-blue-500/50 text-blue-600 dark:border-blue-500 [&>svg]:text-blue-500 dark:border-blue-900/50 dark:text-blue-100 dark:dark:border-blue-900 dark:[&>svg]:text-blue-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
