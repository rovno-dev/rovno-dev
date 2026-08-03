import { cn } from "@/lib/utils"
import { ProgressActivityIcon } from "@/components/icons"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <ProgressActivityIcon className={cn("size-4 animate-spin", className)} {...props} />
  )
}

export { Spinner }
