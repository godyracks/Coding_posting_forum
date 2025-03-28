import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Added Link for navigation
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedStatus, setEditedStatus] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !userId) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setEditedName(res.data.name);
        setEditedStatus(res.data.status);
      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/login");
      }
    };

    fetchUser();
  }, [token, userId, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = {
        name: editedName,
        status: editedStatus,
      };
      const res = await axios.put(
        `http://localhost:5000/api/users/${userId}`,
        updatedUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(res.data);
      setIsEditing(false);
      setError("");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full mx-4 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Update Profile</h1>

        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={editedStatus}
                onChange={(e) => setEditedStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-black p-3 rounded-md hover:bg-blue-700 transition-colors duration-300 font-medium text-sm"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-md hover:bg-gray-400 transition-colors duration-300 font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-medium text-gray-800 mt-3">{user.name}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Status:</span> {user.status}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Role:</span> {user.role}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Joined:</span>{" "}
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
            <Link
              to="/channels"
              className="block w-full bg-blue-600 text-black p-3 rounded-md hover:bg-blue-700 transition-colors duration-300 font-medium text-sm text-center"
            >
              Go to Channels
            </Link>
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-blue-600 text-black p-3 rounded-md hover:bg-blue-700 transition-colors duration-300 font-medium text-sm"
            >
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-black p-3 rounded-md hover:bg-red-600 transition-colors duration-300 font-medium text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}