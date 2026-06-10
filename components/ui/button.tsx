/* LLM context: Forcing SVG internal paths to inherit current color in Button components to fix dark icons on primary buttons in light theme */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export const buttonUnidekaVariants = {
  filled: "bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--state-hover)] cursor-pointer active:scale-[0.98] [&_svg_*]:fill-current",
  outlined: "border border-border bg-transparent text-foreground hover:bg-[var(--state-hover)] cursor-pointer active:scale-[0.98] [&_svg_*]:fill-current",
  tonal: "bg-[var(--primary-card)] text-[var(--on-primary-card)] hover:bg-[var(--state-hover)] cursor-pointer active:scale-[0.98] [&_svg_*]:fill-current",
  "tonal-card": "bg-card text-card-foreground border border-border/50 hover:bg-[var(--state-hover)] cursor-pointer active:scale-[0.98] [&_svg_*]:fill-current",
  "tonal-primary": "bg-[var(--primary-card)] text-primary hover:bg-[var(--state-hover)] cursor-pointer active:scale-[0.98] [&_svg_*]:fill-current",
  text: "bg-transparent text-foreground hover:bg-[var(--state-hover)] cursor-pointer active:scale-[0.98] [&_svg_*]:fill-current",
  glass: "bg-[var(--primary-glass)] backdrop-blur-glass border border-[var(--outline-primary-glass)] text-primary hover:bg-[var(--state-hover)] cursor-pointer active:scale-[0.98] [&_svg_*]:fill-current",
  selected: "bg-[var(--primary-card)] text-primary border border-primary cursor-pointer [&_svg_*]:fill-current",
};

export const chipSizes = {
  "chip-small": "h-[28px] px-3 [&_svg]:size-3.5 text-body-5!",
  "chip-medium": "h-[36px] px-4 [&_svg]:size-4 text-body-4!",
  "chip-large": "h-[46px] px-6 [&_svg]:size-5 text-body-3!",
  "chip-xlarge": "h-[58px] px-8 [&_svg]:size-6 text-body-2!",
}

export const iconButtonSizes = {
  "icon-small": "h-[48px] aspect-square [&_svg]:size-[24px]",
  "icon-medium": "h-[54px] aspect-square [&_svg]:size-[30px]",
  "icon-large": "h-[60px] aspect-square [&_svg]:size-[36px]",
}

export const buttonSizes = {
  small: "h-[36px] px-4 text-xs gap-1 [&_svg]:size-3.5",
  medium: "h-[42px] px-6 text-sm gap-1.5 [&_svg]:size-4",
  large: "h-[54px] px-6 text-base gap-2 [&_svg]:size-5",
}

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: buttonUnidekaVariants,
      size: {
        ...buttonSizes,
        ...iconButtonSizes,
        ...chipSizes,
      },
      shape: {
        square: "rounded-md",
        round: "rounded-full",
      }
    },
    defaultVariants: {
      variant: "filled",
      size: "medium",
      shape: "square",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean,
  ref?: any,
}

function Button({
  className,
  variant,
  size,
  shape,
  asChild = false,
  ref,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, shape, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }