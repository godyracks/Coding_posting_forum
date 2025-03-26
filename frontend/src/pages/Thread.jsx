import { useEffect, useState } from "react";
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
  Camera
} from "lucide-react";

export default function Thread() {
  const { messageId } = useParams();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const token = localStorage.getItem("token");

   // Fetch the message and its replies
   useEffect(() => {
    const fetchMessageAndReplies = async () => {
      try {
        // Fetch all messages
        const response = await axios.get("http://localhost:5000/api/messages/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Find the specific message by its ID
        const message = response.data.find((msg) => msg._id === messageId);

        if (!message) {
          console.error("Message not found");
          setLoading(false);
          return;
        }

        // Flatten the nested replies structure
        const flattenReplies = (replies) => {
          let flatReplies = [];
          replies.forEach((reply) => {
            flatReplies.push(reply); // Add the current reply
            if (reply.replies && reply.replies.length > 0) {
              flatReplies = flatReplies.concat(flattenReplies(reply.replies)); // Recursively flatten nested replies
            }
          });
          return flatReplies;
        };

        // Flatten the replies array
        const updatedReplies = flattenReplies(message.replies || []);

        // Ensure all replies have a `likes` object
        const repliesWithLikes = updatedReplies.map((reply) => ({
          ...reply,
          likes: reply.likes || { up: 0, down: 0 },
        }));

        // Update state with the message and its replies
        setThread({
          ...message,
          replies: repliesWithLikes,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching thread or replies:", error);
        setLoading(false);
      }
    };

    fetchMessageAndReplies();
  }, [messageId]);
 // Handle posting a new reply
 const handleReply = async (parentId = messageId) => {
  if (!replyContent.trim()) return;

  try {
    const res = await axios.post(
      "http://localhost:5000/api/replies/",
      {
        message_id: messageId, // ✅ Always reference the original message
        parent_id: parentId,   // ✅ Associate reply with the message or another reply
        content: replyContent,
        likes: { up: 0, down: 0 }, // ✅ Initialize likes object
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const newReply = {
      _id: res.data.replyId,
      parent_id: parentId, // ✅ Ensures replies stay linked properly
      content: replyContent,
      created_at: new Date().toISOString(),
      likes: { up: 0, down: 0 }, // ✅ Ensure likes are included
    };

    // ✅ Update UI immediately
    setThread((prev) => ({
      ...prev,
      replies: [...(prev.replies || []), newReply],
    }));

    setReplyContent(""); // ✅ Clear input after sending reply
    setReplyingTo(null); // ✅ Reset replyingTo state
  } catch (error) {
    console.error("❌ Error posting reply:", error);
  }
};
  // Toggle nested replies expansion
  const toggleRepliesExpansion = (replyId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [replyId]: !prev[replyId]
    }));
  };

  // Recursive function to render replies with proper indentation
  const renderReplies = (replies, parentId = messageId, level = 0) => {
    return replies
      .filter((reply) => reply.parent_id === parentId)
      .map((reply) => {
        // Count the number of nested replies
        const nestedRepliesCount = replies.filter(
          (r) => r.parent_id === reply._id
        ).length;

        return (
          <div 
            key={reply._id} 
            style={{ marginLeft: `${level * 20}px` }} 
            className="mt-3 transition-all duration-300 ease-in-out"
          >
            <div className="border-l-4 border-blue-300 pl-4 bg-blue-50 p-3 rounded-lg shadow-sm hover:shadow-md">
              {/* Reply Content */}
              <p className="text-gray-800 mb-2">{reply.content}</p>
              <div className="flex items-center text-gray-500 text-sm mb-2">
                <Clock className="w-4 h-4 mr-2" />
                {new Date(reply.created_at).toLocaleString()}
              </div>

              {/* Like/Dislike Buttons */}
              <div className="flex space-x-4 mb-2">
                <button className="flex items-center text-green-600 hover:text-green-700">
                  <ThumbsUp className="w-5 h-5 mr-1" />
                  {reply.likes?.up || 0}
                </button>
                <button className="flex items-center text-red-600 hover:text-red-700">
                  <ThumbsDown className="w-5 h-5 mr-1" />
                  {reply.likes?.down || 0}
                </button>
              </div>

              {/* Reply to Reply Button */}
              <button
                onClick={() => setReplyingTo(reply._id)}
                className="flex items-center text-blue-500 text-sm hover:text-blue-600 mr-4"
              >
                <MessageSquareReply className="w-4 h-4 mr-1" />
                Reply
              </button>

              {/* Nested Replies Count with Expand/Collapse */}
              {nestedRepliesCount > 0 && (
                <button
                  onClick={() => toggleRepliesExpansion(reply._id)}
                  className="flex items-center text-gray-500 text-sm hover:text-blue-600"
                >
                  {expandedReplies[reply._id] ? (
                    <ChevronUp className="w-4 h-4 mr-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 mr-1" />
                  )}
                  {nestedRepliesCount} {nestedRepliesCount === 1 ? "reply" : "replies"}
                </button>
              )}

              {/* Nested Reply Form */}
              {replyingTo === reply._id && (
                <div className="mt-4 space-y-2 relative">
                  <div className="relative">
                    <textarea
                      className="w-full border border-gray-300 p-2 pl-10 rounded-md focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="Type your reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                    ></textarea>
                    <Camera 
                      className="absolute left-3 top-3 text-gray-400" 
                      size={20} 
                    />
                  </div>
                  <button
                    onClick={() => handleReply(reply._id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Reply
                  </button>
                </div>
              )}

              {/* Recursively render nested replies (only if expanded) */}
              {nestedRepliesCount > 0 && expandedReplies[reply._id] && (
                <div className="mt-2">
                  {renderReplies(replies, reply._id, level + 1)}
                </div>
              )}
            </div>
          </div>
        );
      });
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  if (!thread) return <p className="text-center mt-10 text-red-500">Message not found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      {/* Back Button */}
      <Link 
        to={`/channel/${thread.channel_id}`} 
        className="flex items-center text-blue-500 hover:text-blue-600 mb-4"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Channel
      </Link>

      {/* Main Message */}
      <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
        <h1 className="text-xl font-bold text-gray-800 mb-2">{thread.content}</h1>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <p>Posted by: {thread.user_id}</p>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            {new Date(thread.created_at).toLocaleString()}
          </div>
        </div>

        {/* Like/Dislike Buttons */}
        <div className="flex space-x-4 mt-2">
          <button className="flex items-center text-green-600 hover:text-green-700">
            <ThumbsUp className="w-5 h-5 mr-1" />
            {thread.likes?.up || 0}
          </button>
          <button className="flex items-center text-red-600 hover:text-red-700">
            <ThumbsDown className="w-5 h-5 mr-1" />
            {thread.likes?.down || 0}
          </button>
        </div>
      </div>

      {/* Replies Section */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Replies:</h2>

        {thread.replies && thread.replies.length > 0 ? (
          renderReplies(thread.replies)
        ) : (
          <p className="text-gray-500 italic">No replies yet. Be the first to reply!</p>
        )}
      </div>

      {/* Main Reply Form */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Add a Reply</h2>
        <div className="relative">
          <textarea
            className="w-full border border-gray-300 p-3 pl-10 rounded-md focus:ring-2 focus:ring-blue-200 transition-all mb-3"
            placeholder="Type your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          ></textarea>
          <Camera 
            className="absolute left-3 top-3 text-gray-400" 
            size={20} 
          />
        </div>
        <button
          onClick={() => handleReply(messageId)}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Reply
        </button>
      </div>
    </div>
  );
}