import * as React from "react"
import { clsx } from "clsx"

// Check if utils exists, otherwise use clsx directly
const cn = (...classes: (string | undefined)[]) => clsx(classes)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'luxury' | 'outline'
  isError?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', isError = false, ...props }, ref) => {
    const baseClasses = [
      "flex w-full px-4 py-3 text-base transition-all duration-300",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium",
      "placeholder:text-luxury-brown-400"
    ]

    const variantClasses = {
      default: [
        "h-12 rounded-lg border-2 border-luxury-cream-300",
        "bg-white text-luxury-brown-900",
        "focus:border-luxury-warm-500 focus:ring-luxury-warm-500",
        "hover:border-luxury-cream-400"
      ],
      luxury: [
        "h-14 rounded-xl border-2 border-luxury-gold-300",
        "bg-gradient-to-r from-luxury-cream-50 to-white",
        "text-luxury-brown-900 font-medium",
        "focus:border-luxury-gold-500 focus:ring-luxury-gold-500",
        "hover:border-luxury-gold-400",
        "shadow-sm focus:shadow-md"
      ],
      outline: [
        "h-12 rounded-lg border-2 border-luxury-brown-300",
        "bg-transparent text-luxury-brown-900",
        "focus:border-luxury-brown-600 focus:ring-luxury-brown-500",
        "hover:border-luxury-brown-400"
      ]
    }

    const errorClasses = isError ? [
      "border-red-400 focus:border-red-500 focus:ring-red-500",
      "bg-red-50"
    ] : []

    const combinedClasses = cn(
      ...baseClasses,
      ...variantClasses[variant],
      ...errorClasses,
      className
    )

    return (
      <input
        type={type}
        className={combinedClasses}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }