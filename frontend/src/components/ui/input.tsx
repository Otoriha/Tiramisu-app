import * as React from "react"
import { clsx } from "clsx"

// Check if utils exists, otherwise use clsx directly
const cn = (...classes: (string | undefined)[]) => clsx(classes)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'luxury' | 'outline' | 'premium' | 'glass'
  isError?: boolean
  hasIcon?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', isError = false, hasIcon = false, ...props }, ref) => {
    const baseClasses = [
      "flex w-full text-base transition-all duration-300 ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium",
      "placeholder:text-luxury-brown-400 relative group",
      hasIcon ? "pl-12 pr-4 py-3" : "px-4 py-3"
    ]

    const variantClasses = {
      default: [
        "h-12 rounded-lg border-2 border-luxury-cream-300",
        "bg-white text-luxury-brown-900",
        "focus:border-luxury-warm-500 focus:ring-luxury-warm-500",
        "hover:border-luxury-cream-400 hover:shadow-sm",
        "focus:shadow-md transition-shadow duration-300"
      ],
      luxury: [
        "h-14 rounded-xl border-2 border-luxury-gold-300",
        "bg-gradient-to-r from-luxury-cream-50 to-white",
        "text-luxury-brown-900 font-medium",
        "focus:border-luxury-gold-500 focus:ring-luxury-gold-500",
        "hover:border-luxury-gold-400 hover:shadow-md",
        "focus:shadow-lg transition-all duration-300",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-luxury-gold-50/30 before:to-transparent before:opacity-0 focus:before:opacity-100 before:transition-opacity before:duration-500 before:rounded-xl before:pointer-events-none"
      ],
      outline: [
        "h-12 rounded-lg border-2 border-luxury-brown-300",
        "bg-transparent text-luxury-brown-900",
        "focus:border-luxury-brown-600 focus:ring-luxury-brown-500",
        "hover:border-luxury-brown-400 hover:bg-luxury-cream-50/50",
        "backdrop-blur-sm transition-all duration-300"
      ],
      premium: [
        "h-16 rounded-2xl border-2 border-luxury-gold-400/50",
        "bg-gradient-to-r from-luxury-brown-900 via-luxury-brown-800 to-luxury-brown-900",
        "text-luxury-gold-100 font-semibold placeholder:text-luxury-gold-300/60",
        "focus:border-luxury-gold-300 focus:ring-luxury-gold-400",
        "hover:border-luxury-gold-300/70 hover:shadow-xl",
        "focus:shadow-2xl transition-all duration-500",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-luxury-gold-400/10 before:to-transparent before:opacity-0 focus:before:opacity-100 before:transition-opacity before:duration-700 before:rounded-2xl before:pointer-events-none"
      ],
      glass: [
        "h-12 rounded-xl border border-white/30",
        "bg-white/10 backdrop-blur-md text-luxury-brown-900",
        "placeholder:text-luxury-brown-600/70",
        "focus:border-white/50 focus:ring-white/30",
        "hover:border-white/40 hover:bg-white/20",
        "focus:bg-white/20 transition-all duration-300",
        "shadow-lg focus:shadow-xl"
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