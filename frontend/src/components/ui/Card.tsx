import React from 'react'
import { clsx } from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'luxury' | 'elevated' | 'outlined'
  children: React.ReactNode
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
  ...props
}) => {
  const baseClasses = [
    'rounded-lg transition-all duration-300 luxury-hover-lift'
  ]

  const variantClasses = {
    default: [
      'bg-white border border-luxury-cream-300',
      'shadow-md hover:shadow-lg'
    ],
    luxury: [
      'bg-gradient-to-br from-luxury-cream-50 to-luxury-cream-100',
      'border border-luxury-cream-400',
      'luxury-shadow hover:shadow-xl'
    ],
    elevated: [
      'bg-white',
      'shadow-lg hover:shadow-xl',
      'border border-luxury-cream-200'
    ],
    outlined: [
      'bg-transparent border-2 border-luxury-brown-300',
      'hover:border-luxury-brown-500 hover:bg-luxury-cream-50'
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