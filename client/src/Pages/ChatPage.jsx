import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import ChatLayout from "../Components/ChatLayout";
import axios from "axios";

const ChatPage = () => {
  const [user, setUser] = useState(null);

  // ✅ Use Render backend (your actual URL)
  const backend = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${backend}/api/account`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user);
    } catch (err) {
      console.error("❌ Error fetching current user:", err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  if (!user) return <div>Loading user details...</div>;

  return (
    <div>
      <Navbar />
      <ChatLayout userId={user._id} />
    </div>
  );
};

export default ChatPage;
