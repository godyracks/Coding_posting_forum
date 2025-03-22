import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("userEmail"); // ✅ Get stored email
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/users/", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      const loggedInUser = res.data.find(u => u.email === userEmail);
      if (loggedInUser) {
        setUser(loggedInUser);
      } else {
        navigate("/login"); // Redirect if user not found
      }
    })
    .catch(() => navigate("/login"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail"); // ✅ Clear stored email
    navigate("/login");
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      {user ? (
        <div className="bg-white p-6 shadow-lg rounded-lg w-80 text-center">
          <h1 className="text-2xl font-bold">👤 {user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
          <button 
            onClick={handleLogout}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
