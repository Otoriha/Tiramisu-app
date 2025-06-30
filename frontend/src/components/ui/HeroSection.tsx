import React from 'react'
import { clsx } from 'clsx'
import { Button } from './button'

interface HeroSectionProps {
  title: string
  subtitle?: string
  description?: string
  primaryAction?: {
    text: string
    onClick: () => void
  }
  secondaryAction?: {
    text: string
    onClick: () => void
  }
  backgroundImage?: string
  overlayOpacity?: number
  className?: string
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  backgroundImage: _backgroundImage,
  overlayOpacity = 0.6,
  className
}) => {
  const overlayClasses = clsx(
    'absolute inset-0 bg-black transition-opacity duration-300',
    `opacity-${Math.round(overlayOpacity * 100)}`
  )

  const contentClasses = clsx(
    'relative z-10 flex flex-col items-center justify-center',
    'text-center text-white px-4 py-20 lg:py-32',
    'min-h-[60vh] lg:min-h-[80vh]'
  )

  return (
    <section className={clsx('relative overflow-hidden', className)}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero/tiramisu-hero-1920.jpg"
          alt="美しいティラミス"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overlay */}
      <div 
        className={overlayClasses}
        style={{ opacity: overlayOpacity }}
      />

      {/* Content */}
      <div className={contentClasses}>
        <div className="max-w-4xl mx-auto">
          {/* Subtitle */}
          {subtitle && (
            <p className="text-lg font-medium text-white/80 mb-4 tracking-wide">
              {subtitle}
            </p>
          )}

          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 lg:mb-8">
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="text-lg lg:text-xl text-white/90 mb-8 lg:mb-12 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}

          {/* Actions */}
          {(primaryAction || secondaryAction) && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {primaryAction && (
                <Button
                  variant="luxury"
                  size="lg"
                  onClick={primaryAction.onClick}
                  className="min-w-[200px] luxury-animate-fade-in"
                >
                  {primaryAction.text}
                </Button>
              )}
              
              {secondaryAction && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={secondaryAction.onClick}
                  className="min-w-[200px] border-white text-white hover:bg-white hover:text-luxury-brown-900"
                >
                  {secondaryAction.text}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center text-white/60">
            <p className="text-sm mb-2">スクロール</p>
            <svg 
              className="w-6 h-6 animate-bounce" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection