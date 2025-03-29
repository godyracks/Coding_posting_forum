import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Plus, Search, User, Hash } from "lucide-react";

export default function Home() {
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    // Initial fetch of all channels
    axios
      .get("http://localhost:5000/api/channels/", { headers })
      .then((res) => setChannels(res.data || []))
      .catch((err) => console.error("Error fetching channels:", err));
  }, [token, navigate]);

  const fetchData = async () => {
    if (!searchQuery) return; // Skip if no query
    setLoading(true);

    // Fetch channels
    axios
      .get(`http://localhost:5000/api/channels/search?query=${searchQuery}`, { headers })
      .then((res) => setChannels(res.data || []))
      .catch((err) => {
        console.error("Error fetching channels:", err);
        setChannels([]);
      });

    // Fetch messages
    axios
      .get(`http://localhost:5000/api/messages/search?query=${searchQuery}`, { headers })
      .then((res) => setMessages(res.data || []))
      .catch((err) => {
        console.error("Error fetching messages:", err);
        setMessages([]);
      });

    // Fetch user stats
    axios
      .get("http://localhost:5000/api/users/stats", { headers })
      .then((res) => setUserStats(res.data || []))
      .catch((err) => {
        console.error("Error fetching user stats:", err);
        setUserStats([]);
      });

    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleCreateChannel = () => navigate("/create-channel");

  const mostPosts = userStats.length ? userStats.reduce((prev, curr) => (curr.postCount > prev.postCount ? curr : prev), userStats[0]) : null;
  const leastPosts = userStats.length ? userStats.reduce((prev, curr) => (curr.postCount < prev.postCount ? curr : prev), userStats[0]) : null;
  const highestRanked = userStats.length ? userStats.reduce((prev, curr) => (curr.totalLikes > prev.totalLikes ? curr : prev), userStats[0]) : null;
  const lowestRanked = userStats.length ? userStats.reduce((prev, curr) => (curr.totalLikes < prev.totalLikes ? curr : prev), userStats[0]) : null;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800 flex items-center">
          <Hash className="w-6 h-6 text-blue-600 mr-2" />
          Forum Home
        </h1>
        <Link to="/profile" className="flex items-center text-blue-600 font-medium hover:text-blue-700">
          <User className="w-5 h-5 mr-1" />
          Profile
        </Link>
      </div>

      <form onSubmit={handleSearch} className="w-full max-w-md mb-8">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search channels, or user stats..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button type="submit" className="mt-2 w-full bg-gray-600 text-black p-2 rounded-md hover:bg-blue-700">
          Search
        </button>
      </form>

      <button onClick={handleCreateChannel} className="w-full max-w-md bg-blue-600 text-black p-3 rounded-md hover:bg-blue-700 flex items-center justify-center mb-8">
        <Plus className="w-4 h-4 mr-2" />
        Create Channel
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="w-full max-w-4xl mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {searchQuery ? `Search Results for "${searchQuery}"` : "All Content"}
          </h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Channels</h3>
            {channels.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {channels.map((channel) => (
                  <Link key={channel._id} to={`/channel/${channel._id}`} className="bg-white border rounded-lg shadow-md hover:shadow-lg p-4 flex flex-col items-center">
                    <Hash className="w-6 h-6 text-blue-600 mb-2" />
                    <span className="text-lg font-semibold text-gray-800">{channel.name}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">{searchQuery ? "No channels found" : "No channels available"}</p>
            )}
          </div>

          {/* <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Messages</h3>
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg._id} className="bg-white p-4 rounded-lg shadow-md">
                    <p className="font-medium">{msg.content}</p>
                    <p className="text-sm text-gray-600">By: {msg.user.name} | Likes: {msg.likes.up} | Dislikes: {msg.likes.down}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">{searchQuery ? "No messages found" : "No messages available"}</p>
            )}
          </div> */}

          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">User Stats</h3>
            {userStats.length > 0 && mostPosts ? (
              <div className="space-y-4">
                <p>Most Posts: {mostPosts.name} ({mostPosts.postCount} posts)</p>
                <p>Least Posts: {leastPosts.name} ({leastPosts.postCount} posts)</p>
                <p>Highest Ranked: {highestRanked.name} ({highestRanked.totalLikes} likes)</p>
                <p>Lowest Ranked: {lowestRanked.name} ({lowestRanked.totalLikes} likes)</p>
              </div>
            ) : (
              <p className="text-gray-500">{searchQuery ? "No user stats available" : "No user stats available"}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}