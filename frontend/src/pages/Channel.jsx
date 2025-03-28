import { useState, useEffect, useRef } from "react";
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
  Camera,
} from "lucide-react";

export default function Channel() {
  const { channelId } = useParams();
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId"); // This might be null
  const fileInputRef = useRef(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/channels/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setChannels(res.data))
      .catch((err) => console.error("Error fetching channels:", err));
  }, [token]);

  useEffect(() => {
    if (channelId) {
      fetchMessages();
      const channel = channels.find((ch) => ch._id === channelId);
      setSelectedChannel(channel);
    }
  }, [channelId, channels]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/messages/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedMessages = res.data
        .filter((msg) => msg.channel_id === channelId)
        .map((msg) => ({
          ...msg,
          userLiked: msg.liked_by?.includes(userId) || false,
          userDisliked: msg.disliked_by?.includes(userId) || false,
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
        await dislikeMessage(messageId);
        message.likes.up -= 1;
        message.userLiked = false;
      } else {
        if (message.userDisliked) {
          message.likes.down -= 1;
          message.userDisliked = false;
        }
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
        await likeMessage(messageId);
        message.likes.down -= 1;
        message.userDisliked = false;
      } else {
        if (message.userLiked) {
          message.likes.up -= 1;
          message.userLiked = false;
        }
        await dislikeMessage(messageId);
        message.likes.down += 1;
        message.userDisliked = true;
      }

      setMessages(updatedMessages);
    } catch (error) {
      console.error("Failed to dislike message:", error);
    }
  };

  const handleNewPost = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !imageFile) return;

    const formData = new FormData();
    formData.append("channel_id", channelId);
    formData.append("content", newMessage);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      // Post the new message
      const res = await axios.post("http://localhost:5000/api/messages/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Create a temporary new message object with fallback user data
      const tempNewMsg = {
        _id: res.data.messageId || `temp-${Date.now()}`, // Fallback ID if not provided
        user: { name: "You", status: "active" }, // Fallback until user fetch
        channel_id: channelId,
        content: newMessage,
        created_at: new Date().toISOString(),
        likes: { up: 0, down: 0 },
        liked_by: [],
        disliked_by: [],
        replies: [],
        imageUrl: res.data.image ? `/uploads/${res.data.image}` : null,
        userLiked: false,
        userDisliked: false,
      };

      // Optimistically update the UI
      setMessages((prevMessages) => [tempNewMsg, ...prevMessages]);

      // Clear inputs immediately
      setNewMessage("");
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Fetch user details if userId is available
      let userData = { name: "You", status: "active" };
      if (userId) {
        try {
          const userRes = await axios.get(`http://localhost:5000/api/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          userData = {
            name: userRes.data.username || "You",
            status: userRes.data.status || "active",
          };
        } catch (userErr) {
          console.warn("Failed to fetch user data:", userErr.response?.data || userErr.message);
        }
      } else {
        console.warn("userId is null; using fallback user data.");
      }

      // Update the message with fetched user data (optional, since fetchMessages will override)
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === tempNewMsg._id ? { ...msg, user: userData } : msg
        )
      );

      // Sync with server
      await fetchMessages();
    } catch (err) {
      console.error("Error posting message:", err.response?.data || err.message);
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Channel Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm flex justify-between items-center">
        <Link to="/channels" className="text-blue-600 font-medium hover:text-blue-800">
          <ArrowLeft className="inline-block mr-2" /> Back
        </Link>
        <h1 className="text-xl font-semibold text-gray-800">
          <MessageCircle className="inline-block mr-2" />
          {selectedChannel ? selectedChannel.name : "Loading..."}
        </h1>
      </div>

      {/* New Post Input */}
      <form onSubmit={handleNewPost} className="bg-white p-4 border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-4 max-w-3xl mx-auto">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="text-gray-600" />
          </div>
          <div className="flex-1 flex items-center space-x-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a new post..."
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Camera
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={handleImageClick}
              />
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => setImageFile(e.target.files[0])}
                className="hidden"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-black p-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </form>

      {/* Messages List */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
        {messages.length > 0 ? (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="text-gray-600" size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{msg.user.name}</span>
                    <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded-full">
                      {msg.user.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 mb-3 text-sm">{msg.content}</p>
                {msg.imageUrl && (
                  <img
                    src={`http://localhost:5000${msg.imageUrl}`}
                    alt="Message attachment"
                    className="w-full h-64 object-cover rounded-md mb-3"
                  />
                )}
                <div className="flex justify-between items-center text-xs text-gray-600 border-t border-gray-200 pt-2">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleLike(msg._id)}
                      className={`flex items-center space-x-1 ${
                        msg.userLiked
                          ? "text-blue-600"
                          : "text-gray-600 hover:text-blue-600"
                      }`}
                    >
                      <ThumbsUp size={14} />
                      <span>{msg.likes?.up || 0}</span>
                    </button>
                    <button
                      onClick={() => handleDislike(msg._id)}
                      className={`flex items-center space-x-1 ${
                        msg.userDisliked
                          ? "text-red-600"
                          : "text-gray-600 hover:text-red-600"
                      }`}
                    >
                      <ThumbsDown size={14} />
                      <span>{msg.likes?.down || 0}</span>
                    </button>
                  </div>
                  <Link
                    to={`/thread/${msg._id}`}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <MessageCircle size={14} />
                    <span>{msg.replies.length} Replies</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-10">No messages in this channel yet.</p>
        )}
      </div>
    </div>
  );
}