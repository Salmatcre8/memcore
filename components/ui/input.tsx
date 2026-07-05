import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl bg-surface hairline px-4 text-sm text-warmwhite placeholder:text-muted focus-ring",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
