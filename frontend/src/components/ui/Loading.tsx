import React from 'react'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

interface LoadingProps {
  variant?: 'default' | 'luxury' | 'spinner' | 'dots' | 'pulse' | 'brand'
  size?: 'sm' | 'default' | 'lg' | 'xl'
  text?: string
  className?: string
  fullscreen?: boolean
}

const Loading: React.FC<LoadingProps> = ({
  variant = 'default',
  size = 'default',
  text,
  className,
  fullscreen = false
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'gap-2',
      icon: 'w-4 h-4',
      text: 'text-sm',
      dots: 'w-2 h-2'
    },
    default: {
      container: 'gap-3',
      icon: 'w-6 h-6',
      text: 'text-base',
      dots: 'w-3 h-3'
    },
    lg: {
      container: 'gap-4',
      icon: 'w-8 h-8',
      text: 'text-lg',
      dots: 'w-4 h-4'
    },
    xl: {
      container: 'gap-6',
      icon: 'w-12 h-12',
      text: 'text-xl',
      dots: 'w-6 h-6'
    }
  }

  const config = sizeConfig[size]

  // Container classes
  const containerClasses = clsx(
    'flex items-center justify-center',
    config.container,
    fullscreen ? 'fixed inset-0 z-50 bg-white/80 backdrop-blur-sm' : '',
    className
  )

  // Render different loading variants
  const renderLoadingVariant = () => {
    switch (variant) {
      case 'luxury':
        return (
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-luxury-gold-400 to-luxury-warm-500 rounded-full animate-pulse opacity-30"></div>
              <Loader2 className={`${config.icon} text-luxury-gold-600 animate-spin relative z-10`} />
            </div>
            {text && (
              <p className={`${config.text} text-luxury-brown-700 mt-4 animate-pulse font-medium`}>
                {text}
              </p>
            )}
          </div>
        )

      case 'spinner':
        return (
          <div className="flex flex-col items-center">
            <Loader2 className={`${config.icon} text-luxury-warm-600 animate-spin`} />
            {text && (
              <p className={`${config.text} text-luxury-brown-600 mt-3`}>
                {text}
              </p>
            )}
          </div>
        )

      case 'dots':
        return (
          <div className="flex flex-col items-center">
            <div className={`flex space-x-2 ${config.container}`}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`${config.dots} bg-luxury-warm-500 rounded-full animate-bounce`}
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '1.4s'
                  }}
                />
              ))}
            </div>
            {text && (
              <p className={`${config.text} text-luxury-brown-600 mt-4`}>
                {text}
              </p>
            )}
          </div>
        )

      case 'pulse':
        return (
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className={`${config.icon} bg-luxury-cream-200 rounded-full animate-pulse`} />
              <div className={`absolute inset-0 ${config.icon} bg-luxury-warm-500 rounded-full animate-ping opacity-20`} />
            </div>
            {text && (
              <p className={`${config.text} text-luxury-brown-600 mt-4 animate-pulse`}>
                {text}
              </p>
            )}
          </div>
        )

      case 'brand':
        return (
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* Tiramisu-inspired loading animation */}
              <div className="flex flex-col items-center space-y-1">
                <div className={`${config.dots} bg-luxury-brown-600 rounded-sm animate-bounce`} style={{ animationDelay: '0s' }} />
                <div className={`${config.dots} bg-luxury-cream-400 rounded-sm animate-bounce`} style={{ animationDelay: '0.1s' }} />
                <div className={`${config.dots} bg-luxury-brown-600 rounded-sm animate-bounce`} style={{ animationDelay: '0.2s' }} />
                <div className={`${config.dots} bg-luxury-cream-400 rounded-sm animate-bounce`} style={{ animationDelay: '0.3s' }} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-gold-400/20 to-transparent rounded-lg animate-pulse" />
            </div>
            {text && (
              <p className={`${config.text} text-luxury-brown-700 mt-4 font-medium`}>
                {text}
              </p>
            )}
          </div>
        )

      default:
        return (
          <div className="flex flex-col items-center">
            <Loader2 className={`${config.icon} text-luxury-brown-500 animate-spin`} />
            {text && (
              <p className={`${config.text} text-luxury-brown-600 mt-3`}>
                {text}
              </p>
            )}
          </div>
        )
    }
  }

  return (
    <div className={containerClasses}>
      {renderLoadingVariant()}
    </div>
  )
}

// Skeleton Loading Component
interface SkeletonProps {
  className?: string
  variant?: 'default' | 'luxury' | 'rounded' | 'circle'
  children?: React.ReactNode
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  variant = 'default',
  children 
}) => {
  const variantClasses = {
    default: 'rounded-md',
    luxury: 'rounded-xl bg-gradient-to-r from-luxury-cream-200 via-luxury-cream-100 to-luxury-cream-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite]',
    rounded: 'rounded-lg',
    circle: 'rounded-full'
  }

  return (
    <div className={clsx(
      'bg-luxury-cream-200 animate-pulse',
      variantClasses[variant],
      className
    )}>
      {children}
    </div>
  )
}

// Loading Button
interface LoadingButtonProps {
  loading?: boolean
  children: React.ReactNode
  loadingText?: string
  variant?: 'default' | 'luxury'
  className?: string
  disabled?: boolean
  onClick?: () => void
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  children,
  loadingText,
  variant = 'default',
  className,
  disabled,
  onClick
}) => {
  return (
    <button
      className={clsx(
        'relative inline-flex items-center justify-center px-4 py-2 transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        variant === 'luxury' 
          ? 'bg-gradient-to-r from-luxury-gold-500 to-luxury-gold-600 text-white rounded-xl shadow-lg hover:shadow-xl focus:ring-luxury-gold-500' 
          : 'bg-luxury-warm-500 text-white rounded-lg shadow-md hover:shadow-lg focus:ring-luxury-warm-500',
        (loading || disabled) && 'opacity-75 cursor-not-allowed',
        className
      )}
      disabled={loading || disabled}
      onClick={onClick}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {loading ? (loadingText || children) : children}
    </button>
  )
}

export { Loading, Skeleton, LoadingButton }
export type { LoadingProps, SkeletonProps, LoadingButtonProps }