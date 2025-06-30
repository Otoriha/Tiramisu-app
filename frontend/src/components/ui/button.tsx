import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { clsx } from "clsx"

// Check if utils exists, otherwise use clsx directly
const cn = (...classes: (string | undefined)[]) => clsx(classes)

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 luxury-hover-lift relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-luxury-warm-500 hover:bg-luxury-warm-600 text-white focus:ring-luxury-warm-500 shadow-md hover:shadow-lg rounded-lg before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        luxury: "bg-gradient-to-r from-luxury-gold-500 to-luxury-gold-600 hover:from-luxury-gold-600 hover:to-luxury-gold-700 text-white font-semibold focus:ring-luxury-gold-500 shadow-lg hover:shadow-2xl border border-luxury-gold-400 rounded-xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 hover:scale-105",
        secondary: "bg-luxury-cream-200 hover:bg-luxury-cream-300 text-luxury-brown-800 focus:ring-luxury-cream-400 shadow-sm hover:shadow-md rounded-lg border border-luxury-cream-300 hover:border-luxury-cream-400",
        outline: "border-2 border-luxury-brown-300 hover:border-luxury-brown-500 text-luxury-brown-700 hover:text-luxury-brown-900 hover:bg-luxury-cream-100 focus:ring-luxury-brown-400 rounded-lg backdrop-blur-sm hover:shadow-md",
        ghost: "text-luxury-brown-700 hover:text-luxury-brown-900 hover:bg-luxury-cream-100 focus:ring-luxury-brown-400 rounded-lg hover:shadow-sm",
        destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 rounded-lg shadow-md hover:shadow-lg",
        link: "text-luxury-warm-500 underline-offset-4 hover:underline hover:text-luxury-warm-600 transition-colors duration-200",
        premium: "bg-gradient-to-r from-luxury-brown-800 via-luxury-brown-700 to-luxury-brown-800 hover:from-luxury-brown-900 hover:via-luxury-brown-800 hover:to-luxury-brown-900 text-luxury-gold-300 font-bold focus:ring-luxury-brown-600 shadow-xl hover:shadow-2xl rounded-2xl border-2 border-luxury-gold-500/30 hover:border-luxury-gold-400/50 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-luxury-gold-400/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000",
      },
      size: {
        default: "h-10 px-4 py-2 text-base",
        sm: "h-8 px-3 py-1.5 text-sm",
        lg: "h-12 px-6 py-3 text-lg",
        xl: "h-14 px-8 py-4 text-xl",
        icon: "h-10 w-10 p-2",
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