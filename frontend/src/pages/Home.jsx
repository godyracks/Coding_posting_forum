import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Plus, Search, User, Hash } from "lucide-react"; // Lucide icons

export default function Home() {
  const [channels, setChannels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    axios
      .get("http://localhost:5000/api/channels/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setChannels(res.data))
      .catch((err) => console.error("Error fetching channels:", err));
  }, [token, navigate]);

  // Filter channels based on search input
  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Create Channel Click
  const handleCreateChannel = () => {
    navigate("/create-channel");
  };
  const fetchData = async () => {
    setLoading(true);
    try {
      const channelsRes = await axios.get(`http://localhost:5000/api/channels/search?query=${searchQuery}`, { headers });
      setChannels(channelsRes.data);
  
      const postsRes = await axios.get(`http://localhost:5000/api/messages/search?query=${searchQuery}`, { headers });
      setPosts(postsRes.data);
  
      const statsRes = await axios.get("http://localhost:5000/api/users/stats", { headers });
      setUserStats(statsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      {/* Header Section */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800 flex items-center">
          <Hash className="w-6 h-6 text-blue-600 mr-2" />
          Available Channels
        </h1>
        <Link
          to="/profile"
          className="flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors duration-200"
        >
          <User className="w-5 h-5 mr-1" />
          Profile
        </Link>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-md mb-8">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Channels..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-sm transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Create Channel Button */}
      <button
        onClick={handleCreateChannel}
        className="w-full max-w-md bg-blue-600 text-black p-3 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 font-medium text-sm flex items-center justify-center mb-8"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Channel
      </button>

      {/* Channel List */}
      <div className="w-full max-w-4xl">
        {filteredChannels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredChannels.map((channel) => (
              <Link
                key={channel._id}
                to={`/channel/${channel._id}`}
                className="block bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 flex flex-col items-center justify-center"
              >
                <Hash className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-lg font-semibold text-gray-800 text-center">
                  {channel.name}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md border border-gray-200 text-center">
            <p className="text-gray-500 text-sm">No channels found</p>
          </div>
        )}
      </div>
    </div>
  );
}