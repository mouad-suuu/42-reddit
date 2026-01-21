import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-2 border-primary hover:bg-background hover:text-foreground manga-shadow-sm hover:manga-shadow screentone-hover",
        destructive:
          "bg-destructive text-destructive-foreground border-2 border-destructive hover:bg-background hover:text-destructive",
        outline:
          "border-2 border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground manga-shadow-sm hover:manga-shadow",
        secondary:
          "bg-secondary text-secondary-foreground border-2 border-border hover:bg-primary hover:text-primary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground border-2 border-transparent hover:border-border",
        link: "text-foreground underline-offset-4 hover:underline border-none",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-12 px-8 has-[>svg]:px-6 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(
        buttonVariants({ variant, size, className }),
        "irregular-border"
      )}
      {...props}
    />
  )
}

export { Button, buttonVariants }
