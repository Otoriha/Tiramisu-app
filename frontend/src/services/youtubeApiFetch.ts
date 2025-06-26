interface VideoDetails {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
}

interface YouTubeSearchResponse {
  items: Array<{
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      thumbnails: {
        medium: {
          url: string;
        };
      };
    };
  }>;
}

interface YouTubeVideoDetailsResponse {
  items: Array<{
    contentDetails: {
      duration: string;
    };
  }>;
}

class YouTubeApiWrapper {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    this.apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!this.apiKey) {
      throw new Error('YouTube API key is required. Please set VITE_YOUTUBE_API_KEY in your .env.local file.');
    }
  }

  async searchVideos(query: string): Promise<VideoDetails[]> {
    try {
      // Search for videos
      const searchUrl = new URL(`${this.baseUrl}/search`);
      searchUrl.searchParams.append('part', 'snippet');
      searchUrl.searchParams.append('q', query);
      searchUrl.searchParams.append('type', 'video');
      searchUrl.searchParams.append('key', this.apiKey);
      searchUrl.searchParams.append('maxResults', '10');

      const searchResponse = await fetch(searchUrl.toString());
      if (!searchResponse.ok) {
        throw new Error(`Search failed: ${searchResponse.statusText}`);
      }
      const searchData: YouTubeSearchResponse = await searchResponse.json();

      const videoIds = searchData.items.map(item => item.id.videoId).join(',');

      // Get video details including duration
      const detailsUrl = new URL(`${this.baseUrl}/videos`);
      detailsUrl.searchParams.append('part', 'contentDetails');
      detailsUrl.searchParams.append('id', videoIds);
      detailsUrl.searchParams.append('key', this.apiKey);

      const detailsResponse = await fetch(detailsUrl.toString());
      if (!detailsResponse.ok) {
        throw new Error(`Details failed: ${detailsResponse.statusText}`);
      }
      const detailsData: YouTubeVideoDetailsResponse = await detailsResponse.json();

      // Combine search results with video details
      const videoDetails: VideoDetails[] = searchData.items.map((item, index) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        duration: detailsData.items[index]?.contentDetails.duration || 'PT0S',
      }));

      return videoDetails;
    } catch (error) {
      console.error('Error searching YouTube videos:', error);
      throw new Error('Failed to search YouTube videos');
    }
  }
}

export default YouTubeApiWrapper;