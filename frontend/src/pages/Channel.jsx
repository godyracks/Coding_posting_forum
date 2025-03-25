import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { 
  Send, 
  ArrowLeft, 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  User, 
  Clock 
} from "lucide-react";

// Redesigned New Post Input Component
const NewPostInput = ({ newMessage, setNewMessage, onPost }) => {
  return (
    <div className="bg-white p-4 border-b border-gray-300 shadow-md flex items-center space-x-4">
      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
        <User className="text-gray-600" />
      </div>
      <div className="flex-1 flex items-center space-x-2">
        <input 
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write a new post..."
          className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={onPost} 
          className="bg-black text-black p-3 rounded-full hover:bg-gray-800 transition-colors "
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

// Redesigned Channel Navigation Buttons
const ChannelNavigationButtons = ({ channels, currentChannelId }) => {
  return (
    <div className="flex justify-center gap-4 p-14 bg-gray border-b border-gray-300 overflow-x-auto">
      {channels.map(channel => (
        <Link key={channel._id} to={`/channel/${channel._id}`}>
          <button className={`
            px-4 py-2 rounded-full font-medium transition-all duration-300 
            ${currentChannelId === channel._id 
              ? "bg-blue-600 text-blue" 
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {channel.name}
          </button>
        </Link>
      ))}
    </div>
  );
};

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

      {/* New Post Input Component */}
      <NewPostInput 
        newMessage={newMessage} 
        setNewMessage={setNewMessage} 
        onPost={handleNewPost} 
      />

      {/* Channel Navigation Buttons Component */}
      <ChannelNavigationButtons 
        channels={channels} 
        currentChannelId={channelId} 
      />

      {/* Messages Container */}
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
                  <p className="text-gray-900 mb-4 line-clamp-3">{msg.content}</p>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
                  <div className="flex space-x-4">
                    <button className="flex items-center space-x-1 text-green-600 hover:text-green-700">
                      <ThumbsUp size={16} />
                      <span>{msg.likes.up}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-red-600 hover:text-red-700">
                      <ThumbsDown size={16} />
                      <span>{msg.likes.down}</span>
                    </button>
                  </div>
                  <Link 
                    to={`/thread/${msg._id}`} 
                    className="flex items-center space-x-1 text-blue-500 hover:text-blue-600"
                  >
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