import { cn } from "@/lib/utils"
import { ProgressActivityIcon } from "lucide-react"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <ProgressActivityIcon className={cn("size-4 animate-spin", className)} {...props} />
  )
}

export { Spinner }
