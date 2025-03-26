// src/services/likeService.js
import axios from 'axios';

const token = localStorage.getItem('token');

export const likeMessage = async (messageId) => {
  try {
    const response = await axios.post(
      `http://localhost:5000/api/messages/${messageId}/like`, 
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.likes;
  } catch (error) {
    console.error('Error liking message:', error);
    throw error;
  }
};

export const dislikeMessage = async (messageId) => {
  try {
    const response = await axios.post(
      `http://localhost:5000/api/messages/${messageId}/dislike`, 
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.likes;
  } catch (error) {
    console.error('Error disliking message:', error);
    throw error;
  }
};