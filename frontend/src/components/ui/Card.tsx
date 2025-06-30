import React from 'react'
import { clsx } from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'luxury' | 'elevated' | 'outlined' | 'premium' | 'glass'
  children: React.ReactNode
  hoverable?: boolean
  interactive?: boolean
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  className,
  hoverable = true,
  interactive = false,
  ...props
}) => {
  const baseClasses = [
    'rounded-lg transition-all duration-300 ease-out relative overflow-hidden',
    hoverable && 'luxury-hover-lift',
    interactive && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
  ]

  const variantClasses = {
    default: [
      'bg-white border border-luxury-cream-300',
      'shadow-md hover:shadow-lg',
      hoverable && 'hover:border-luxury-cream-400'
    ],
    luxury: [
      'bg-gradient-to-br from-luxury-cream-50 via-luxury-cream-100 to-luxury-cream-50',
      'border border-luxury-cream-400 hover:border-luxury-gold-300',
      'luxury-shadow hover:shadow-2xl',
      'before:absolute before:inset-0 before:bg-gradient-to-br before:from-luxury-gold-50/30 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500'
    ],
    elevated: [
      'bg-white backdrop-blur-sm',
      'shadow-lg hover:shadow-2xl',
      'border border-luxury-cream-200 hover:border-luxury-cream-300',
      'hover:-translate-y-1'
    ],
    outlined: [
      'bg-transparent border-2 border-luxury-brown-300',
      'hover:border-luxury-brown-500 hover:bg-luxury-cream-50/80',
      'backdrop-blur-sm'
    ],
    premium: [
      'bg-gradient-to-br from-luxury-brown-900 via-luxury-brown-800 to-luxury-brown-900',
      'border-2 border-luxury-gold-500/30 hover:border-luxury-gold-400/50',
      'shadow-2xl hover:shadow-3xl',
      'text-luxury-gold-100',
      'before:absolute before:inset-0 before:bg-gradient-to-br before:from-luxury-gold-400/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-700',
      'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-luxury-gold-400/20 after:to-transparent after:translate-x-[-100%] hover:after:translate-x-[100%] after:transition-transform after:duration-1000'
    ],
    glass: [
      'bg-white/10 backdrop-blur-md',
      'border border-white/20 hover:border-white/30',
      'shadow-lg hover:shadow-xl',
      'text-luxury-brown-900',
      'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300'
    ]
  }

  const combinedClasses = clsx(
    baseClasses,
    variantClasses[variant],
    className
  )

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  )
}

const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div 
      className={clsx(
        'px-6 py-4 border-b border-luxury-cream-200',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div 
      className={clsx('px-6 py-4', className)} 
      {...props}
    >
      {children}
    </div>
  )
}

const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div 
      className={clsx(
        'px-6 py-4 border-t border-luxury-cream-200 bg-luxury-cream-50 rounded-b-lg',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h3 
      className={clsx(
        'luxury-heading-4 mb-2',
        className
      )} 
      {...props}
    >
      {children}
    </h3>
  )
}

const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p 
      className={clsx(
        'luxury-body-small',
        className
      )} 
      {...props}
    >
      {children}
    </p>
  )
}

export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription }