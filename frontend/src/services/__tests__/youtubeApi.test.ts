import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import YouTubeApiWrapper from '../youtubeApi';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

// Mock environment variable
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_YOUTUBE_API_KEY: 'test-api-key'
  },
  writable: true
});

describe('YouTubeApiWrapper', () => {
  let youtubeApi: YouTubeApiWrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    youtubeApi = new YouTubeApiWrapper();
  });

  describe('searchVideos', () => {
    it('should return video details when API calls succeed', async () => {
      // Mock search response
      const mockSearchResponse = {
        data: {
          items: [
            {
              id: { videoId: 'video1' },
              snippet: {
                title: 'Test Video 1',
                thumbnails: {
                  medium: { url: 'https://example.com/thumb1.jpg' }
                }
              }
            },
            {
              id: { videoId: 'video2' },
              snippet: {
                title: 'Test Video 2',
                thumbnails: {
                  medium: { url: 'https://example.com/thumb2.jpg' }
                }
              }
            }
          ]
        }
      };

      // Mock video details response
      const mockDetailsResponse = {
        data: {
          items: [
            { contentDetails: { duration: 'PT3M30S' } },
            { contentDetails: { duration: 'PT5M45S' } }
          ]
        }
      };

      mockedAxios.get = vi.fn()
        .mockResolvedValueOnce(mockSearchResponse)
        .mockResolvedValueOnce(mockDetailsResponse);

      const result = await youtubeApi.searchVideos('test query');

      expect(result).toEqual([
        {
          id: 'video1',
          title: 'Test Video 1',
          thumbnail: 'https://example.com/thumb1.jpg',
          duration: 'PT3M30S'
        },
        {
          id: 'video2',
          title: 'Test Video 2',
          thumbnail: 'https://example.com/thumb2.jpg',
          duration: 'PT5M45S'
        }
      ]);

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('should handle missing duration data gracefully', async () => {
      const mockSearchResponse = {
        data: {
          items: [
            {
              id: { videoId: 'video1' },
              snippet: {
                title: 'Test Video 1',
                thumbnails: {
                  medium: { url: 'https://example.com/thumb1.jpg' }
                }
              }
            }
          ]
        }
      };

      const mockDetailsResponse = {
        data: {
          items: [] // No duration data
        }
      };

      mockedAxios.get = vi.fn()
        .mockResolvedValueOnce(mockSearchResponse)
        .mockResolvedValueOnce(mockDetailsResponse);

      const result = await youtubeApi.searchVideos('test query');

      expect(result[0].duration).toBe('PT0S');
    });

    it('should throw error when search API fails', async () => {
      mockedAxios.get = vi.fn().mockRejectedValueOnce(new Error('API Error'));

      await expect(youtubeApi.searchVideos('test query')).rejects.toThrow('Failed to search YouTube videos');
    });

    it('should throw error when details API fails', async () => {
      const mockSearchResponse = {
        data: {
          items: [
            {
              id: { videoId: 'video1' },
              snippet: {
                title: 'Test Video 1',
                thumbnails: {
                  medium: { url: 'https://example.com/thumb1.jpg' }
                }
              }
            }
          ]
        }
      };

      mockedAxios.get
        .mockResolvedValueOnce(mockSearchResponse)
        .mockRejectedValueOnce(new Error('Details API Error'));

      await expect(youtubeApi.searchVideos('test query')).rejects.toThrow('Failed to search YouTube videos');
    });
  });

  describe('constructor', () => {
    it('should throw error when API key is not provided', () => {
      // 現在の環境変数を保存
      const originalEnv = import.meta.env;
      
      // 空のAPIキーでモック
      Object.defineProperty(import.meta, 'env', {
        value: {
          ...originalEnv,
          VITE_YOUTUBE_API_KEY: ''
        },
        writable: true,
        configurable: true
      });

      expect(() => new YouTubeApiWrapper()).toThrow('YouTube API key is required. Please set VITE_YOUTUBE_API_KEY in your .env.local file.');
      
      // 元の環境変数を復元
      Object.defineProperty(import.meta, 'env', {
        value: originalEnv,
        writable: true,
        configurable: true
      });
    });
  });
});