import * as React from "react"

export interface VideoCardProps {
  videoId: string
  title: string
  thumbnail: string
  duration: string
  className?: string
  onClick?: () => void
}

const VideoCard = React.forwardRef<HTMLDivElement, VideoCardProps>(
  ({ videoId, title, thumbnail, duration, className, onClick, ...props }, ref) => {
    const handleClick = () => {
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`
      window.open(youtubeUrl, '_blank', 'noopener,noreferrer')
      onClick?.()
    }

    return (
      <div
        ref={ref}
        className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${className || ""}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
        aria-label={`動画を再生: ${title}`}
        {...props}
      >
        <div className="relative">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
            {duration}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
            {title}
          </h3>
        </div>
      </div>
    )
  }
)

VideoCard.displayName = "VideoCard"

export { VideoCard }