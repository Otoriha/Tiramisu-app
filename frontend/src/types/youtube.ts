export interface VideoDetails {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
}

export interface UseYouTubeSearchOptions {
  enabled?: boolean;
  staleTime?: number;
  retry?: number;
}