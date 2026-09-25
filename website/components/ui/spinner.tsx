import { cn } from "@/lib/utils"
import { LoaderCircle } from "@phosphor-icons/react"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderCircle className={cn("size-4 animate-spin", className)} {...props} />
  )
}

export { Spinner }
