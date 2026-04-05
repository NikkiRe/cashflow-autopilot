import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-[0_2px_12px_rgba(0,128,255,0.3)] hover:shadow-[0_4px_20px_rgba(0,128,255,0.45)] hover:-translate-y-px active:translate-y-0",
        secondary:
          "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60",
        outline:
          "border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700",
        ghost:
          "hover:bg-slate-100 hover:text-slate-900 text-slate-600",
        danger:
          "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-100",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
