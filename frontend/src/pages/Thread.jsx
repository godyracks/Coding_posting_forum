import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function Thread() {
  const { messageId } = useParams();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // Track which reply is being replied to
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

        // Ensure all replies have a `likes` object
        const updatedReplies = (message.replies || []).map((reply) => ({
          ...reply,
          likes: reply.likes || { up: 0, down: 0 },
        }));

        // Update state with the message and its replies
        setThread({
          ...message,
          replies: updatedReplies,
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

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  if (!thread) return <p className="text-center mt-10 text-red-500">Message not found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      {/* Back Button */}
      <Link to={`/channel/${thread.channel_id}`} className="text-blue-500">
        🔙 Back to Channel
      </Link>

      {/* Main Message */}
      <div className="mt-4 p-4 border border-gray-300 rounded-md shadow-sm">
        <h1 className="text-xl font-bold">{thread.content}</h1>
        <p className="text-gray-500 text-sm">Posted by: {thread.user_id}</p>
        <p className="text-gray-400 text-sm">
          🕒 {new Date(thread.created_at).toLocaleString()}
        </p>

        {/* Like/Dislike Buttons */}
        <div className="flex mt-2 space-x-4">
          <button className="text-green-600">👍 {thread.likes?.up || 0}</button>
          <button className="text-red-600">👎 {thread.likes?.down || 0}</button>
        </div>
      </div>

      {/* Replies Section */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Replies:</h2>

        {thread.replies && thread.replies.length > 0 ? (
          thread.replies.map((reply) => (
            <div
              key={reply._id}
              className="ml-6 border-l-4 border-gray-400 pl-4 mt-2 bg-gray-100 p-3 rounded-md"
            >
              <p className="text-gray-800">{reply.content}</p>
              <p className="text-gray-500 text-sm">
                🕒 {new Date(reply.created_at).toLocaleString()}
              </p>

              {/* Reply to Reply Button */}
              <button
                onClick={() => setReplyingTo(reply._id)} // Set the reply being replied to
                className="text-blue-500 text-sm mt-2 hover:underline"
              >
                💬 Reply
              </button>

              {/* Nested Reply Form */}
              {replyingTo === reply._id && (
                <div className="mt-4">
                  <textarea
                    className="w-full border border-gray-300 p-2 rounded-md"
                    placeholder="Type your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  ></textarea>
                  <button
                    onClick={() => handleReply(reply._id)} // Pass the reply ID as parent_id
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No replies yet. Be the first to reply!</p>
        )}
      </div>

      {/* Main Reply Form */}
      <div className="mt-6 p-4 border-t border-gray-300">
        <h2 className="text-lg font-semibold mb-2">Add a Reply</h2>
        <textarea
          className="w-full border border-gray-300 p-2 rounded-md"
          placeholder="Type your reply..."
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
        ></textarea>
        <button
          onClick={() => handleReply(messageId)} // Pass the message ID as parent_id
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Reply
        </button>
      </div>
    </div>
  );
}