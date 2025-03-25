import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function Channel() {
  const { channelId } = useParams();
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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
      axios.get("http://localhost:5000/api/messages/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const filteredMessages = res.data.filter(msg => msg.channel_id === channelId);
        setMessages(filteredMessages);
        setSelectedChannel(channels.find(c => c._id === channelId) || null);
      })
      .catch((err) => console.error("Error fetching messages:", err));
    }
  }, [channelId, channels]);

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
    <div className="h-screen flex flex-col bg-gray-100 text-gray-900">
      {/* Channel Header */}
      <div className="bg-white border-b border-gray-300 p-4 shadow-md flex justify-between items-center">
        <Link to="/channels" className="text-blue-500 font-semibold">🔙 Back</Link>
        <h1 className="text-xl font-bold">{selectedChannel ? `📢 ${selectedChannel.name}` : "Loading..."}</h1>
      </div>

      {/* New Post Section */}
      <div className="bg-white p-4 border-b border-gray-300 shadow-md">
        <input 
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="➕ New Post..."
          className="w-full p-3 border border-gray-400 rounded-lg"
        />
        <button onClick={handleNewPost} className="mt-2 w-full bg-blue-600 text-white p-2 rounded-lg">Post</button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 p-4 bg-white border-b border-gray-300 shadow-md overflow-x-auto">
        {channels.map(channel => (
          <Link key={channel._id} to={`/channel/${channel._id}`}>
            <button className={`p-2 rounded-md font-semibold ${channelId === channel._id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}>
              {channel.name}
            </button>
          </Link>
        ))}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto space-y-4 p-6">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg._id} className="bg-white shadow-md p-4 rounded-lg max-w-lg">
              <p className="font-semibold">🧑 {msg.user} <span className="text-gray-500">🕒 {new Date(msg.created_at).toLocaleTimeString()}</span></p>
              <p className="text-gray-900">{msg.content}</p>
              <div className="text-sm text-gray-500 mt-2 flex justify-between">
                <div>
                  <button className="mr-2 text-green-600">👍 {msg.likes.up}</button>
                  <button className="text-red-600">👎 {msg.likes.down}</button>
                </div>
                <Link to={`/thread/${msg._id}`} className="text-blue-500 hover:underline">
                  💬 {msg.replies.length} Replies
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No messages in this channel yet.</p>
        )}
      </div>
    </div>
  );
}
