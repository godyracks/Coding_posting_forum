import axios from 'axios';

const API_URL = 'http://localhost:5000/api/messages';

export const likeMessage = async (messageId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/${messageId}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data.likes;
  } catch (error) {
    if (error.response?.status === 400) {
      // User already liked/disliked
      return error.response.data.likes;
    }
    console.error('Like error:', error);
    throw error;
  }
};

export const dislikeMessage = async (messageId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/${messageId}/dislike`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data.likes;
  } catch (error) {
    if (error.response?.status === 400) {
      // User already liked/disliked
      return error.response.data.likes;
    }
    console.error('Dislike error:', error);
    throw error;
  }
};