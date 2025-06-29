import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { clsx } from "clsx"

// Check if utils exists, otherwise use clsx directly
const cn = (...classes: (string | undefined)[]) => clsx(classes)

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 luxury-hover-lift",
  {
    variants: {
      variant: {
        default: "bg-luxury-warm-500 hover:bg-luxury-warm-600 text-white focus:ring-luxury-warm-500 shadow-md hover:shadow-lg rounded-lg",
        luxury: "bg-gradient-to-r from-luxury-gold-500 to-luxury-gold-600 hover:from-luxury-gold-600 hover:to-luxury-gold-700 text-white font-semibold focus:ring-luxury-gold-500 shadow-lg hover:shadow-xl border border-luxury-gold-400 rounded-xl",
        secondary: "bg-luxury-cream-200 hover:bg-luxury-cream-300 text-luxury-brown-800 focus:ring-luxury-cream-400 shadow-sm hover:shadow-md rounded-lg",
        outline: "border-2 border-luxury-brown-300 hover:border-luxury-brown-500 text-luxury-brown-700 hover:text-luxury-brown-900 hover:bg-luxury-cream-100 focus:ring-luxury-brown-400 rounded-lg",
        ghost: "text-luxury-brown-700 hover:text-luxury-brown-900 hover:bg-luxury-cream-100 focus:ring-luxury-brown-400 rounded-lg",
        destructive: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 rounded-lg",
        link: "text-luxury-warm-500 underline-offset-4 hover:underline hover:text-luxury-warm-600",
      },
      size: {
        default: "h-10 px-4 py-2 text-base",
        sm: "h-8 px-3 py-1.5 text-sm rounded-md",
        lg: "h-12 px-6 py-3 text-lg rounded-xl",
        xl: "h-14 px-8 py-4 text-xl rounded-2xl",
        icon: "h-10 w-10",
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
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }