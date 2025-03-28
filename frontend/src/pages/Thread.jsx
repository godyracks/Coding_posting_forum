import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquareReply,
  Clock,
  ChevronDown,
  ChevronUp,
  Camera,
} from "lucide-react";
import { likeMessage, dislikeMessage } from "../services/likeService";

export default function Thread() {
  const { messageId } = useParams();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [replyImage, setReplyImage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const fileInputRef = useRef(null);
  const replyFileInputRefs = useRef({});

  useEffect(() => {
    const fetchMessageAndReplies = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/messages/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const message = response.data.find((msg) => msg._id === messageId);
        if (!message) {
          console.error("Message not found");
          setLoading(false);
          return;
        }

        const flattenReplies = (replies) => {
          let flatReplies = [];
          replies.forEach((reply) => {
            flatReplies.push({
              ...reply,
              userLiked: reply.liked_by?.includes(userId) || false,
              userDisliked: reply.disliked_by?.includes(userId) || false,
            });
            if (reply.replies && reply.replies.length > 0) {
              flatReplies = flatReplies.concat(flattenReplies(reply.replies));
            }
          });
          return flatReplies;
        };

        const updatedReplies = flattenReplies(message.replies || []);
        setThread({
          ...message,
          userLiked: message.liked_by?.includes(userId) || false,
          userDisliked: message.disliked_by?.includes(userId) || false,
          replies: updatedReplies,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching thread or replies:", error);
        setLoading(false);
      }
    };

    fetchMessageAndReplies();
  }, [messageId, token, userId]);

  const handleLike = async (id, isReply = false) => {
    try {
      const url = isReply
        ? `http://localhost:5000/api/replies/${id}/like`
        : `http://localhost:5000/api/messages/${id}/like`;
      const updatedItems = isReply ? thread.replies : [thread];
      const itemIndex = updatedItems.findIndex((item) => item._id === id);
      if (itemIndex === -1) return;

      const updatedItemsCopy = [...updatedItems];
      const item = updatedItemsCopy[itemIndex];

      if (item.userLiked) {
        await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
        item.likes.up -= 1;
        item.userLiked = false;
      } else {
        if (item.userDisliked) {
          item.likes.down -= 1;
          item.userDisliked = false;
        }
        await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
        item.likes.up += 1;
        item.userLiked = true;
      }

      if (isReply) {
        setThread((prev) => ({ ...prev, replies: updatedItemsCopy }));
      } else {
        setThread((prev) => ({ ...prev, ...updatedItemsCopy[0] }));
      }
    } catch (error) {
      console.error(`Failed to like ${isReply ? "reply" : "message"}:`, error);
    }
  };

  const handleDislike = async (id, isReply = false) => {
    try {
      const url = isReply
        ? `http://localhost:5000/api/replies/${id}/dislike`
        : `http://localhost:5000/api/messages/${id}/dislike`;
      const updatedItems = isReply ? thread.replies : [thread];
      const itemIndex = updatedItems.findIndex((item) => item._id === id);
      if (itemIndex === -1) return;

      const updatedItemsCopy = [...updatedItems];
      const item = updatedItemsCopy[itemIndex];

      if (item.userDisliked) {
        await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
        item.likes.down -= 1;
        item.userDisliked = false;
      } else {
        if (item.userLiked) {
          item.likes.up -= 1;
          item.userLiked = false;
        }
        await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
        item.likes.down += 1;
        item.userDisliked = true;
      }

      if (isReply) {
        setThread((prev) => ({ ...prev, replies: updatedItemsCopy }));
      } else {
        setThread((prev) => ({ ...prev, ...updatedItemsCopy[0] }));
      }
    } catch (error) {
      console.error(`Failed to dislike ${isReply ? "reply" : "message"}:`, error);
    }
  };

  const handleReply = async (e, parentId = messageId) => {
    e.preventDefault();
    if (!replyContent.trim() && !replyImage) return;

    const formData = new FormData();
    formData.append("message_id", messageId);
    formData.append("parent_id", parentId);
    formData.append("content", replyContent);
    if (replyImage) {
      formData.append("image", replyImage);
    }

    try {
      const res = await axios.post("http://localhost:5000/api/replies/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const newReply = {
        _id: res.data.replyId,
        parent_id: parentId,
        user: { name: "You", status: "unknown" }, // Placeholder, update with actual user data if available
        content: replyContent,
        imageUrl: res.data.image ? `/uploads/${res.data.image}` : null, // Match controller format
        created_at: new Date().toISOString(),
        likes: { up: 0, down: 0 },
        liked_by: [],
        disliked_by: [],
        userLiked: false,
        userDisliked: false,
      };

      setThread((prev) => ({
        ...prev,
        replies: [...(prev.replies || []), newReply],
      }));

      setReplyContent("");
      setReplyImage(null);
      setReplyingTo(null);
      if (parentId === messageId) {
        fileInputRef.current.value = "";
      } else {
        replyFileInputRefs.current[parentId].value = "";
      }
    } catch (error) {
      console.error("❌ Error posting reply:", error);
    }
  };

  const toggleRepliesExpansion = (replyId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [replyId]: !prev[replyId],
    }));
  };

  const renderReplies = (replies, parentId = messageId, level = 0) => {
    return replies
      .filter((reply) => reply.parent_id === parentId)
      .map((reply) => {
        const nestedRepliesCount = replies.filter((r) => r.parent_id === reply._id).length;

        return (
          <div
            key={reply._id}
            style={{ marginLeft: `${level * 24}px` }}
            className="mt-4 transition-all duration-300 ease-in-out"
          >
            <div className="border-l-4 border-blue-400 pl-4 bg-blue-50 p-4 rounded-lg shadow-sm hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">{reply.user.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded-full">
                    {reply.user.status}
                  </span>
                </div>
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(reply.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-800 mb-3">{reply.content}</p>
              {reply.imageUrl && (
                <div className="relative overflow-hidden rounded-lg shadow-md border border-gray-200 mb-3 hover:shadow-lg transition-shadow duration-300">
                  <img
                    src={`http://localhost:5000${reply.imageUrl}`}
                    alt="Reply attachment"
                    className="max-w-md w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <button
                  onClick={() => handleLike(reply._id, true)}
                  className={`flex items-center ${
                    reply.userLiked ? "text-green-600" : "hover:text-green-600"
                  }`}
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  {reply.likes?.up || 0}
                </button>
                <button
                  onClick={() => handleDislike(reply._id, true)}
                  className={`flex items-center ${
                    reply.userDisliked ? "text-red-600" : "hover:text-red-600"
                  }`}
                >
                  <ThumbsDown className="w-4 h-4 mr-1" />
                  {reply.likes?.down || 0}
                </button>
                <button
                  onClick={() => setReplyingTo(reply._id)}
                  className="flex items-center text-blue-500 hover:text-blue-700"
                >
                  <MessageSquareReply className="w-4 h-4 mr-1" />
                  Reply
                </button>
                {nestedRepliesCount > 0 && (
                  <button
                    onClick={() => toggleRepliesExpansion(reply._id)}
                    className="flex items-center text-gray-500 hover:text-blue-600"
                  >
                    {expandedReplies[reply._id] ? (
                      <ChevronUp className="w-4 h-4 mr-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 mr-1" />
                    )}
                    {nestedRepliesCount} {nestedRepliesCount === 1 ? "Reply" : "Replies"}
                  </button>
                )}
              </div>
              {replyingTo === reply._id && (
                <form onSubmit={(e) => handleReply(e, reply._id)} className="mt-4 space-y-3">
                  <div className="relative">
                    <textarea
                      className="w-full border border-gray-300 p-3 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm resize-none"
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={3}
                    />
                    <Camera
                      className="absolute left-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                      size={20}
                      onClick={() => replyFileInputRefs.current[reply._id]?.click()}
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={(el) => (replyFileInputRefs.current[reply._id] = el)}
                    onChange={(e) => setReplyImage(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="bg-blue-500 text-black px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
                    >
                      Post Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
              {nestedRepliesCount > 0 && expandedReplies[reply._id] && (
                <div className="mt-4">{renderReplies(replies, reply._id, level + 1)}</div>
              )}
            </div>
          </div>
        );
      });
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  if (!thread) return <p className="text-center mt-10 text-red-500">Thread not found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <Link
          to={`/channel/${thread.channel_id}`}
          className="flex items-center text-blue-500 hover:text-blue-600 mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Channel
        </Link>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">{thread.user.name}</span>
            <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded-full">
              {thread.user.status}
            </span>
          </div>
          <span className="text-xs text-gray-500 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {new Date(thread.created_at).toLocaleString()}
          </span>
        </div>
        <h1 className="text-xl font-semibold text-gray-800 mb-3">{thread.content}</h1>
        {thread.imageUrl && (
          <div className="relative overflow-hidden rounded-lg shadow-md border border-gray-200 mb-3 hover:shadow-lg transition-shadow duration-300">
            <img
              src={`http://localhost:5000${thread.imageUrl}`}
              alt="Message attachment"
              className="max-w-md w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <button
            onClick={() => handleLike(thread._id)}
            className={`flex items-center ${
              thread.userLiked ? "text-green-600" : "hover:text-green-600"
            }`}
          >
            <ThumbsUp className="w-4 h-4 mr-1" />
            {thread.likes?.up || 0}
          </button>
          <button
            onClick={() => handleDislike(thread._id)}
            className={`flex items-center ${
              thread.userDisliked ? "text-red-600" : "hover:text-red-600"
            }`}
          >
            <ThumbsDown className="w-4 h-4 mr-1" />
            {thread.likes?.down || 0}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Replies ({thread.replies?.length || 0})
        </h2>
        {thread.replies && thread.replies.length > 0 ? (
          renderReplies(thread.replies)
        ) : (
          <p className="text-gray-500 italic text-sm">No replies yet. Be the first to reply!</p>
        )}
      </div>

      <form
        onSubmit={(e) => handleReply(e, messageId)}
        className="mt-8 bg-white border border-gray-200 rounded-lg p-6"
      >
        <h3 className="text-md font-semibold text-gray-700 mb-4">Post a Reply</h3>
        <div className="relative">
          <textarea
            className="w-full border border-gray-300 p-3 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm resize-none"
            placeholder="Write your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={3}
          />
          <Camera
            className="absolute left-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
            size={20}
            onClick={() => fileInputRef.current?.click()}
          />
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => setReplyImage(e.target.files[0])}
          className="hidden"
        />
        <button
          type="submit"
          className="mt-3 bg-blue-500 text-black px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
        >
          Post Reply
        </button>
      </form>
    </div>
  );
}