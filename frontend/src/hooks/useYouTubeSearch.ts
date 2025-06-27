import { useQuery } from '@tanstack/react-query';
import YouTubeApiWrapper from '../services/youtubeApiFetch';
import type { VideoDetails, UseYouTubeSearchOptions } from '../types/youtube';

const useYouTubeSearch = (
  query: string,
  options: UseYouTubeSearchOptions = {}
) => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    retry = 3,
  } = options;

  const youtubeApi = new YouTubeApiWrapper();

  return useQuery<VideoDetails[], Error>({
    queryKey: ['youtube-search', query],
    queryFn: () => youtubeApi.searchVideos(query),
    enabled: enabled && !!query.trim(),
    staleTime,
    retry,
    // Don't refetch on window focus for better UX
    refetchOnWindowFocus: false,
    // Cache for longer to reduce API calls
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export default useYouTubeSearch;