import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Base URL for your backend (update this after hosting)
  const API_URL = 'https://your-backend.onrender.com'; // Replace with your Render URL

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [usersRes, channelsRes, messagesRes] = await Promise.all([
          axios.get(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/channels`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/messages`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUsers(usersRes.data);
        setChannels(channelsRes.data);
        setMessages(messagesRes.data);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load data. Ensure you have admin privileges.');
        if (err.response?.status === 403) {
          navigate('/login'); // Redirect if not authorized
        }
      }
    };
    fetchData();
  }, [token, navigate]);

  const handleDelete = async (type, id) => {
    const urlMap = {
      user: `/api/users/admin/${id}`,
      channel: `/api/channels/admin/${id}`,
      message: `/api/messages/admin/${id}`,
    };

    try {
      await axios.delete(`${API_URL}${urlMap[type]}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update state after successful deletion
      if (type === 'user') setUsers(users.filter((u) => u._id !== id));
      if (type === 'channel') setChannels(channels.filter((c) => c._id !== id));
      if (type === 'message') setMessages(messages.filter((m) => m._id !== id));
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
      setError(`Failed to delete ${type}. ${err.response?.data?.error || 'Server error'}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Admin Panel</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Users Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Manage Users</h2>
        {users.length === 0 ? (
          <p className="text-gray-500">No users found.</p>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email} | Role: {user.role}</p>
                </div>
                <button
                  onClick={() => handleDelete('user', user._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                  disabled={user.role === 'admin'} // Prevent deleting admin
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Channels Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Manage Channels</h2>
        {channels.length === 0 ? (
          <p className="text-gray-500">No channels found.</p>
        ) : (
          <div className="space-y-3">
            {channels.map((channel) => (
              <div
                key={channel._id}
                className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
              >
                <p className="font-medium text-gray-800">{channel.name}</p>
                <button
                  onClick={() => handleDelete('channel', channel._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Messages & Replies Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Manage Messages & Replies</h2>
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages or replies found.</p>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message._id}
                className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {message.content.substring(0, 50)}...
                  </p>
                  <p className="text-sm text-gray-600">
                    Type: {message.type} | User: {message.user_id}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete('message', message._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Admin;