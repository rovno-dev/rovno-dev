import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  variant?: "default" | "underline"
}

function Input({ className, type, variant = "default", ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 bg-transparent text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        variant === "default" && "h-10 rounded-lg border border-input px-2.5 py-1 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-3 dark:bg-input/30 dark:aria-invalid:border-destructive/50 hover:border-(--primary-card)",
        variant === "underline" && "h-10 border-b border-(--outline) px-0 py-1 rounded-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-(--primary) hover:border-(--on-bg-low)/50 transition-colors duration-300 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
