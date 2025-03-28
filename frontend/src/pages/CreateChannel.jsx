import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Plus, AlertCircle } from "lucide-react"; // Import Lucide icons

export default function CreateChannel() {
  const [channelName, setChannelName] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleCreate = () => {
    if (!channelName.trim()) {
      setError("Please enter a channel name.");
      return;
    }

    axios
      .post(
        "http://localhost:5000/api/channels/",
        { name: channelName },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => navigate("/channels"))
      .catch((err) => {
        console.error("Error creating channel:", err);
        setError(err.response?.data?.message || "Failed to create channel.");
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <Plus className="w-6 h-6 text-blue-600 mr-2" />
          <h1 className="text-2xl font-semibold text-gray-800">Create Channel</h1>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label htmlFor="channelName" className="block text-sm font-medium text-black-700 mb-1">
              Channel Name
            </label>
            <input
              id="channelName"
              type="text"
              placeholder="e.g., JavaScript Help"
              value={channelName}
              onChange={(e) => {
                setChannelName(e.target.value);
                setError(""); // Clear error on input
              }}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-sm transition-all duration-200"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center text-red-500 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleCreate}
            className="w-full bg-blue-600 text-black p-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 font-medium text-sm flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Channel
          </button>
        </div>
      </div>
    </div>
  );
}