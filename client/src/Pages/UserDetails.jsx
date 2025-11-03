import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import API from "../api";
import "./UserDetails.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
const socket = io(BACKEND_URL, {
  transports: ["websocket"],
  withCredentials: true,
});

const UserDetails = () => {
  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Helper to format image URLs properly
  const renderImage = (path) => {
    if (!path) return `${BACKEND_URL}/uploads/default.jpg`;
    if (path.startsWith("http")) return path;
    return path.startsWith("uploads/")
      ? `${BACKEND_URL}/${path}`
      : `${BACKEND_URL}/uploads/${path}`;
  };

  useEffect(() => {
    const fetchUserAndConnections = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("⚠️ No token found, redirecting to login");
          navigate("/login");
          return;
        }

        // ✅ Step 1: Fetch current user (absolute backend URL)
        const userRes = await axios.get(`${BACKEND_URL}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        console.log("✅ userRes:", userRes.data);

        if (userRes.data?.success && userRes.data?.user) {
          const fetchedUser = userRes.data.user;
          setUser(fetchedUser);

          // ✅ Step 2: Fetch that user's connections (absolute backend URL)
          const connRes = await axios.get(
            `${BACKEND_URL}/api/user/connections/${fetchedUser._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (connRes.data?.success && connRes.data?.connections) {
            setConnections(connRes.data.connections);
          }

          // ✅ Step 3: Let socket know this user is online
          socket.emit("user-online", fetchedUser._id);
        } else {
          console.error("❌ No user data returned from backend:", userRes.data);
          setUser(null);
        }
      } catch (err) {
        console.error("❌ Error fetching user details:", err.response?.data || err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndConnections();

    // ✅ Real-time online/offline updates
    socket.on("userStatusUpdate", ({ userId, isOnline }) => {
      setConnections((prev) =>
        prev.map((conn) =>
          conn._id === userId ? { ...conn, isOnline } : conn
        )
      );
    });

    return () => {
      socket.off("userStatusUpdate");
    };
  }, [navigate]);

  const handleChat = (id) => {
    navigate(`/chat/${id}`);
  };

  // ✅ Render states
  if (loading) return <div className="loading">Loading user details...</div>;
  if (!user) return <div className="no-user">No user details found</div>;

  return (
    <div className="userdetails-container">
      {/* ✅ Logged-in User Card */}
      <div className="user-card">
        <img src={renderImage(user.userimg)} alt="User" className="user-img" />
        <h2 className="user-name">{user.username}</h2>
        <p className="user-email">{user.email}</p>
        <p className="user-usn">USN: {user.usn}</p>
        <p className="user-role">Role: {user.role}</p>
      </div>

      {/* ✅ Connections Section */}
      <div className="connections-section">
        <h3 className="connections-title">Connections</h3>
        <div className="connections-cards">
          {connections.length > 0 ? (
            connections.map((conn) => (
              <div
                key={conn._id}
                className="connection-card"
                onClick={() => handleChat(conn._id)}
              >
                <div className="connection-avatar">
                  <img
                    src={renderImage(conn.userimg)}
                    alt={conn.username}
                    className="connection-img"
                  />
                  <span
                    className={`status-dot ${
                      conn.isOnline ? "online" : "offline"
                    }`}
                  ></span>
                </div>
                <div className="connection-info">
                  <h4 className="connection-name">{conn.username}</h4>
                  <p className="connection-usn">{conn.usn}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-connections">No connections found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
