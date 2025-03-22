import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Home() {
  const [channels, setChannels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/channels/", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => setChannels(res.data))
    .catch((err) => console.error("Error fetching channels:", err));
  }, []);

  // Filter channels based on search input
  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Create Channel Click
  const handleCreateChannel = () => {
    navigate("/create-channel");
  };

  return (
    <div className="h-screen flex flex-col items-center bg-gray-100 text-gray-900 p-6">
      
      {/* Header Section */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📢 Available Channels</h1>
        <Link to="/profile" className="text-blue-600 font-semibold hover:underline">
          👤 Profile
        </Link>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-md mb-4">
        <input
          type="text"
          placeholder="🔍 Search Channels..."
          className="w-full p-3 bg-white text-gray-900 rounded-md border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Create Channel Button */}
      <button
        onClick={handleCreateChannel}
        className="w-full max-w-lg bg-blue-600 text-white p-3 rounded-lg shadow-md mb-4 hover:bg-blue-700 transition"
      >
        ➕ Create Channel
      </button>

      {/* Channel List */}
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-4">
        <ul className="space-y-2">
          {filteredChannels.length > 0 ? (
            filteredChannels.map(channel => (
              <Link key={channel._id} to={`/channel/${channel._id}`} className="block">
                <li className="p-3 rounded-lg bg-gray-200 hover:bg-blue-300 cursor-pointer transition text-lg font-semibold">
                  #️⃣ {channel.name}
                </li>
              </Link>
            ))
          ) : (
            <li className="text-gray-500 text-center p-4">No channels found</li>
          )}
        </ul>
      </div>
    </div>
  );
}
