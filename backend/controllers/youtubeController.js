const axios = require('axios');

// @desc    Buscar videoaulas por tema
// @route   GET /api/youtube/search
// @access  Private
const searchVideos = async (req, res) => {
  try {
    const { query } = req.query;
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: 'snippet',
          maxResults: 10,
          q: query,
          type: 'video',
          key: process.env.YOUTUBE_API_KEY,
          relevanceLanguage: 'pt',
          regionCode: 'BR'
        }
      }
    );

    const videos = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    }));

    res.json(videos);
  } catch (error) {
    console.error('Erro ao buscar vídeos:', error);
    res.status(500).json({ message: 'Erro ao buscar videoaulas' });
  }
};

// @desc    Buscar detalhes de um vídeo específico
// @route   GET /api/youtube/video/:id
// @access  Private
const getVideoDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos`,
      {
        params: {
          part: 'snippet,contentDetails,statistics',
          id: id,
          key: process.env.YOUTUBE_API_KEY
        }
      }
    );

    if (response.data.items.length === 0) {
      return res.status(404).json({ message: 'Vídeo não encontrado' });
    }

    const video = response.data.items[0];
    const videoDetails = {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.high.url,
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount
    };

    res.json(videoDetails);
  } catch (error) {
    console.error('Erro ao buscar detalhes do vídeo:', error);
    res.status(500).json({ message: 'Erro ao buscar detalhes do vídeo' });
  }
};

module.exports = {
  searchVideos,
  getVideoDetails
}; 