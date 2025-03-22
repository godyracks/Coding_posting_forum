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

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === parentId
            ? { ...msg, replies: [...(msg.replies || []), newReply] }
            : msg
        )
      );
  
      setReplyContent(""); // ✅ Clear input after sending reply
    } catch (error) {
      console.error("❌ Error posting reply:", error);
    }
  };
  

  return (
    <div className="h-screen flex bg-gray-100 text-gray-900">
      
      {/* Sidebar - Channel List */}
      <div className="w-1/4 bg-white border-r border-gray-300 p-4 flex flex-col">
        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Search Channels..."
            className="w-full p-3 bg-gray-200 text-gray-800 rounded-md border border-gray-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Channels List */}
        <ul className="space-y-2 overflow-y-auto flex-1">
          {filteredChannels.map(channel => (
            <Link key={channel._id} to={`/channel/${channel._id}`} className="block">
              <li className={`p-3 rounded-lg cursor-pointer text-lg font-semibold ${
                channelId === channel._id ? "bg-blue-600 text-white" : "hover:bg-gray-300"
              }`}>
                #️⃣ {channel.name}
              </li>
            </Link>
          ))}
        </ul>
      </div>

      {/* Main Chat Section */}
      <div className="w-3/4 flex flex-col h-screen">
        
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

                {/* Render replies */}
               
              </div>
            ))
          ) : (
            <p className="text-gray-500">No messages in this channel yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
