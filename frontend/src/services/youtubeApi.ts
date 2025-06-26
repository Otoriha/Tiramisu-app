import axios from 'axios';

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
      const searchResponse = await axios.get<YouTubeSearchResponse>(`${this.baseUrl}/search`, {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          key: this.apiKey,
          maxResults: 10,
        },
      });

      const videoIds = searchResponse.data.items.map(item => item.id.videoId).join(',');

      // Get video details including duration
      const detailsResponse = await axios.get<YouTubeVideoDetailsResponse>(`${this.baseUrl}/videos`, {
        params: {
          part: 'contentDetails',
          id: videoIds,
          key: this.apiKey,
        },
      });

      // Combine search results with video details
      const videoDetails: VideoDetails[] = searchResponse.data.items.map((item, index) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        duration: detailsResponse.data.items[index]?.contentDetails.duration || 'PT0S',
      }));

      return videoDetails;
    } catch (error) {
      console.error('Error searching YouTube videos:', error);
      throw new Error('Failed to search YouTube videos');
    }
  }
}

export default YouTubeApiWrapper;