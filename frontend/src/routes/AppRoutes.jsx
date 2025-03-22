import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing";
import Home from "../pages/Home";
import Channel from "../pages/Channel";
import Profile from "../pages/Profile";
import CreateChannel from "../pages/CreateChannel";
import Thread from "../pages/Thread";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Admin from "../pages/Admin";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/channels" element={<Home />} />
        <Route path="/channel/:channelId" element={<Channel />} />
        <Route path="/thread/:messageId" element={<Thread />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-channel" element={<CreateChannel />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
