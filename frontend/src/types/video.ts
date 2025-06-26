export interface VideoData {
  id: string
  title: string
  thumbnail: string
  duration: string
  description?: string
  channelTitle?: string
  publishedAt?: string
  viewCount?: number
}

export interface VideoCardData {
  videoId: string
  title: string
  thumbnail: string
  duration: string
}