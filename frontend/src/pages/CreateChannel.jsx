import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CreateChannel() {
  const [channelName, setChannelName] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleCreate = () => {
    if (!channelName.trim()) return;
    
    axios.post("http://localhost:5000/api/channels/", 
      { name: channelName }, 
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(() => navigate("/"))
    .catch((err) => console.error("Error creating channel:", err));
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">➕ Create a New Channel</h1>
      <input
        type="text"
        placeholder="Channel Name"
        className="p-2 border rounded-lg mb-2"
        value={channelName}
        onChange={(e) => setChannelName(e.target.value)}
      />
      <button 
        onClick={handleCreate}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        Create Channel
      </button>
    </div>
  );
}
