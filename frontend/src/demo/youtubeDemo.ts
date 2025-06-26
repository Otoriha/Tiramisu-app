import YouTubeApiWrapper from '../services/youtubeApiFetch';

// デモ用の関数
export async function testYouTubeApi() {
  try {
    console.log('YouTube API テスト開始...');
    
    const youtube = new YouTubeApiWrapper();
    const results = await youtube.searchVideos('JavaScript tutorial');
    
    console.log('検索結果:', results);
    console.log(`${results.length}件の動画が見つかりました`);
    
    // 最初の動画の詳細を表示
    if (results.length > 0) {
      const firstVideo = results[0];
      console.log('最初の動画:', {
        タイトル: firstVideo.title,
        ID: firstVideo.id,
        サムネイル: firstVideo.thumbnail,
        時間: firstVideo.duration
      });
    }
    
    return results;
  } catch (error) {
    console.error('YouTube APIテストでエラーが発生しました:', error);
    throw error;
  }
}

// ブラウザのコンソールで実行できるように window に追加
if (typeof window !== 'undefined') {
  (window as any).testYouTubeApi = testYouTubeApi;
}