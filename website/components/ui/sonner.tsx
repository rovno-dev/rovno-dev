"use client"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckCircleIcon, InfoIcon, WarningIcon, OctagonIcon, ProgressActivityIcon } from "@/components/icons"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton={true}
      icons={{
        success: <CheckCircleIcon className="size-5 text-green-500" />,
        info: <InfoIcon className="size-5 text-blue-500" />,
        warning: <WarningIcon className="size-5 text-yellow-500" />,
        error: <OctagonIcon className="size-5 text-red-500" />,
        loading: <ProgressActivityIcon className="size-5 animate-spin text-primary" />,
      }}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:px-4 group-[.toaster]:py-4",
          title: "text-sm font-medium font-sans",
          description: "text-xs text-muted-foreground font-sans",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
