import * as React from "react"

export interface SkeletonCardProps {
  className?: string
}

const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white rounded-lg shadow-md overflow-hidden animate-pulse ${className || ""}`}
        {...props}
      >
        <div className="relative">
          <div className="w-full h-48 bg-gray-300" />
          <div className="absolute bottom-2 right-2 bg-gray-400 text-transparent text-xs px-2 py-1 rounded">
            00:00
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-300 rounded w-1/2" />
          </div>
        </div>
      </div>
    )
  }
)

SkeletonCard.displayName = "SkeletonCard"

export { SkeletonCard }