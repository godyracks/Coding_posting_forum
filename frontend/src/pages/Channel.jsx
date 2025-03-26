import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { likeMessage, dislikeMessage } from "../services/likeService";
import { 
  Send, 
  ArrowLeft, 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  User, 
  Clock,
  Camera 
} from "lucide-react";

export default function Channel() {
  const { channelId } = useParams();
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("http://localhost:5000/api/channels/", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => setChannels(res.data))
    .catch((err) => console.error("Error fetching channels:", err));
  }, []);

  useEffect(() => {
    if (channelId) {
      fetchMessages();
    }
  }, [channelId, channels]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/messages/", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const updatedMessages = res.data.map((msg) => ({
        ...msg,
        userLiked: msg.likedUsers?.includes(userId) || false,
        userDisliked: msg.dislikedUsers?.includes(userId) || false,
      }));
  
      setMessages(updatedMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };
  
  

  const handleLike = async (messageId) => {
    try {
      const messageIndex = messages.findIndex((msg) => msg._id === messageId);
      if (messageIndex === -1) return;
  
      const updatedMessages = [...messages];
      const message = updatedMessages[messageIndex];
  
      if (message.userLiked) {
        // Remove like
        await dislikeMessage(messageId);
        message.likes.up -= 1;
        message.userLiked = false;
      } else {
        // If previously disliked, remove dislike first
        if (message.userDisliked) {
          message.likes.down -= 1;
          message.userDisliked = false;
        }
        // Add like
        await likeMessage(messageId);
        message.likes.up += 1;
        message.userLiked = true;
      }
  
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Failed to like message:", error);
    }
  };
  
  const handleDislike = async (messageId) => {
    try {
      const messageIndex = messages.findIndex((msg) => msg._id === messageId);
      if (messageIndex === -1) return;
  
      const updatedMessages = [...messages];
      const message = updatedMessages[messageIndex];
  
      if (message.userDisliked) {
        // Remove dislike
        await likeMessage(messageId);
        message.likes.down -= 1;
        message.userDisliked = false;
      } else {
        // If previously liked, remove like first
        if (message.userLiked) {
          message.likes.up -= 1;
          message.userLiked = false;
        }
        // Add dislike
        await dislikeMessage(messageId);
        message.likes.down += 1;
        message.userDisliked = true;
      }
  
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Failed to dislike message:", error);
    }
  };
  
  

  const handleNewPost = () => {
    if (!newMessage.trim()) return;
    
    axios.post("http://localhost:5000/api/messages/", {
      channel_id: channelId,
      content: newMessage,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      const newMsg = {
        _id: res.data.messageId,
        user: "You",
        content: newMessage,
        created_at: new Date().toISOString(),
        likes: { up: 0, down: 0 },
        replies: [],
      };
      setMessages([...messages, newMsg]); 
      setNewMessage("");
    })
    .catch((err) => console.error("Error posting message:", err));
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Channel Header */}
      <div className="bg-white border-b border-gray-300 p-4 shadow-md flex justify-between items-center">
        <Link to="/channels" className="text-blue-500 font-semibold">
          <ArrowLeft className="inline-block mr-2" /> Back
        </Link>
        <h1 className="text-xl font-bold">
          <MessageCircle className="inline-block mr-2" /> 
          {selectedChannel ? selectedChannel.name : "Loading..."}
        </h1>
      </div>

      {/* New Post Input */}
      <div className="bg-white p-4 border-b border-gray-300 shadow-md flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
          <User className="text-gray-600" />
        </div>
        <div className="flex-1 flex items-center space-x-2">
          <div className="relative flex-1">
            <input 
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Write a new post..."
              className="w-full p-3 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Camera size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button 
            onClick={handleNewPost} 
            className="bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4">
        {messages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 max-w-6xl mx-auto">
            {messages.map((msg) => (
              <div 
                key={msg._id} 
                className="bg-white shadow-lg rounded-xl p-6 w-full flex flex-col justify-between hover:shadow-xl transition-all duration-300"
              >
                <div>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{msg.user}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Clock className="mr-2" size={16} /> 
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-900 mb-4">{msg.content}</p>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
                  <div className="flex space-x-4">
                  <button 
                      onClick={() => handleLike(msg._id)}
                      className={`flex items-center space-x-1 ${msg.userLiked ? "text-green-600" : "text-gray-500 hover:text-green-600"}`}
                    >
                      <ThumbsUp size={16} />
                      <span>{msg.likes?.up || 0}</span>
                    </button>

                    <button 
                      onClick={() => handleDislike(msg._id)}
                      className={`flex items-center space-x-1 ${msg.userDisliked ? "text-red-600" : "text-gray-500 hover:text-red-600"}`}
                    >
                      <ThumbsDown size={16} />
                      <span>{msg.likes?.down || 0}</span>
                    </button>


                  </div>
                  <Link to={`/thread/${msg._id}`} className="flex items-center space-x-1 text-blue-500 hover:text-blue-600">
                    <MessageCircle size={16} />
                    <span>{msg.replies.length} Replies</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No messages in this channel yet.</p>
        )}
      </div>
    </div>
  );
}
