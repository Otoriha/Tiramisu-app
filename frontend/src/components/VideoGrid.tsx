import * as React from "react"
import { VideoCard } from './VideoCard'
import type { VideoCardProps } from './VideoCard'

export interface VideoGridProps {
  videos: VideoCardProps[]
  columns?: 1 | 2 | 3 | 4
  gap?: number
  maxRows?: number
  className?: string
}

const VideoGrid = React.forwardRef<HTMLDivElement, VideoGridProps>(
  ({ videos, columns = 3, gap = 16, maxRows, className, ...props }, ref) => {
    const displayVideos = React.useMemo(() => {
      if (!maxRows) return videos
      const maxItems = columns * maxRows
      return videos.slice(0, maxItems)
    }, [videos, columns, maxRows])

    const getGridColumns = () => {
      switch (columns) {
        case 1:
          return 'grid-cols-1'
        case 2:
          return 'grid-cols-1 sm:grid-cols-2'
        case 3:
          return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        case 4:
          return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        default:
          return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }
    }

    const getGapClass = () => {
      if (gap <= 8) return 'gap-2'
      if (gap <= 12) return 'gap-3'
      if (gap <= 16) return 'gap-4'
      if (gap <= 20) return 'gap-5'
      if (gap <= 24) return 'gap-6'
      return 'gap-8'
    }

    return (
      <div
        ref={ref}
        className={`grid ${getGridColumns()} ${getGapClass()} ${className || ""}`}
        style={{ gap: `${gap}px` }}
        {...props}
      >
        {displayVideos.map((video, index) => (
          <VideoCard
            key={`${video.videoId}-${index}`}
            {...video}
          />
        ))}
      </div>
    )
  }
)

VideoGrid.displayName = "VideoGrid"

export { VideoGrid }