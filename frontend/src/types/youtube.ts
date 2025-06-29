export interface VideoDetails {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
}

// YouTube API から取得するVideo型
export interface Video {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      high?: { url: string };
    };
  };
}

export interface UseYouTubeSearchOptions {
  enabled?: boolean;
  staleTime?: number;
  retry?: number;
}