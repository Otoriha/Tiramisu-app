import React from 'react'
import { clsx } from 'clsx'
import OptimizedImage from './OptimizedImage'
import { Card, CardContent } from './Card'
import { Button } from './button'

interface ProductCardProps {
  title: string
  description: string
  image: string
  price?: string
  rating?: number
  reviewCount?: number
  tags?: string[]
  onViewDetails?: () => void
  onAddToCart?: () => void
  className?: string
  variant?: 'default' | 'luxury' | 'compact'
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  description,
  image,
  price,
  rating,
  reviewCount,
  tags,
  onViewDetails,
  onAddToCart,
  className,
  variant = 'default'
}) => {
  const cardClasses = clsx(
    'group cursor-pointer',
    {
      'max-w-sm': variant === 'compact',
      'max-w-md': variant === 'default',
      'max-w-lg': variant === 'luxury'
    },
    className
  )

  const imageClasses = clsx(
    'transition-transform duration-300 group-hover:scale-105',
    {
      'h-48': variant === 'compact',
      'h-64': variant === 'default',
      'h-80': variant === 'luxury'
    }
  )

  return (
    <Card 
      variant={variant === 'luxury' ? 'luxury' : 'default'} 
      className={cardClasses}
      onClick={onViewDetails}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden rounded-t-lg">
        <OptimizedImage
          src={image}
          alt={title}
          width={600}
          height={variant === 'luxury' ? 480 : variant === 'default' ? 384 : 288}
          className={clsx('w-full object-cover', imageClasses)}
        />
        
        {/* Tags Overlay */}
        {tags && tags.length > 0 && (
          <div className="absolute top-4 left-4">
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium bg-luxury-warm-500 text-white rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Rating Overlay */}
        {rating && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center bg-black bg-opacity-50 rounded-full px-3 py-1">
              <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-white text-sm font-medium">
                {rating.toFixed(1)}
              </span>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        {/* Title */}
        <h3 className={clsx(
          'font-semibold text-luxury-brown-900 mb-3',
          {
            'text-lg': variant === 'compact',
            'text-xl': variant === 'default',
            'text-2xl': variant === 'luxury'
          }
        )}>
          {title}
        </h3>

        {/* Description */}
        <p className={clsx(
          'text-luxury-brown-600 mb-4 line-clamp-3',
          {
            'text-sm': variant === 'compact',
            'text-base': variant === 'default' || variant === 'luxury'
          }
        )}>
          {description}
        </p>

        {/* Meta Information */}
        <div className="flex items-center justify-between mb-4">
          {/* Price */}
          {price && (
            <div className="flex items-center">
              <span className={clsx(
                'font-bold text-luxury-warm-600',
                {
                  'text-lg': variant === 'compact',
                  'text-xl': variant === 'default',
                  'text-2xl': variant === 'luxury'
                }
              )}>
                {price}
              </span>
            </div>
          )}

          {/* Review Summary */}
          {rating && reviewCount && (
            <div className="flex items-center text-sm text-luxury-brown-500">
              <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{rating.toFixed(1)} ({reviewCount})</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {onViewDetails && (
            <Button
              variant="outline"
              size={variant === 'compact' ? 'sm' : 'default'}
              onClick={(e) => {
                e.stopPropagation()
                onViewDetails()
              }}
              className="flex-1"
            >
              詳細を見る
            </Button>
          )}
          
          {onAddToCart && (
            <Button
              variant={variant === 'luxury' ? 'luxury' : 'default'}
              size={variant === 'compact' ? 'sm' : 'default'}
              onClick={(e) => {
                e.stopPropagation()
                onAddToCart()
              }}
              className="flex-1"
            >
              注文する
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ProductCard