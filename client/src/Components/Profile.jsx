import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "./Profile.css";
import { useParams, useNavigate } from "react-router-dom";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const base_url = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Unauthorized. Please log in again.");
          setLoading(false);
          return;
        }

        // ✅ Get logged-in user
        const currentUserRes = await axios.get(`${base_url}/api/user/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (currentUserRes.data.success) {
          setCurrentUserId(currentUserRes.data.user._id);
        }

        // ✅ Fetch target user profile
        const res = await axios.get(`${base_url}/api/user/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          const profileUser = res.data.user;
          setUser(profileUser);
          setPosts(res.data.posts || []);

          // ✅ Check connection status
          const isAlreadyConnected = profileUser.connections?.includes(
            currentUserRes.data.user._id
          );
          setIsConnected(isAlreadyConnected);
        } else {
          setError("User not found");
        }
      } catch (err) {
        console.error("❌ Error fetching profile:", err.response || err.message);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // ✅ Send connection request
  const handleSendRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${base_url}/api/student/send-request`,
        { receiverId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setIsRequestSent(true);
        alert("Connection request sent!");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Request error:", err.response?.data || err.message);
    }
  };

  // ✅ Disconnect
  const handleDisconnect = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${base_url}/api/student/disconnect`,
        { targetUserId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setIsConnected(false);
        alert("Disconnected successfully");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Disconnect error:", err.response?.data || err.message);
    }
  };

  // ✅ Message (only if connected)
  const handleMessage = () => {
    if (!isConnected) {
      alert("⚠️ You must be connected to chat!");
      return;
    }

    // Navigate to chat route
    navigate(`/chat/${userId}`);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!user) return <div className="no-data">No user data found.</div>;

  return (
    <div className="profile-container">
      <Navbar />

      <div className="profile-header">
        <img
          src={
            user.userimg
              ? `${base_url}/uploads/${user.userimg}`
              : `${base_url}/uploads/default.jpg`
          }
          alt={user.username}
          className="profile-pic"
        />

        <div className="profile-info">
          <h2>{user.username}</h2>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Branch:</strong> {user.branch || "N/A"}
          </p>
          <p>
            <strong>Admission Year:</strong> {user.admissionyear || "N/A"}
          </p>
          <p>
            <strong>Role:</strong> {user.role || "User"}
          </p>
          <p>
            <strong>Connections:</strong> {user.connections?.length || 0}
          </p>

          {/* ✅ Buttons Section (no design change) */}
          {currentUserId !== userId && (
            <div className="profile-actions">
              {isConnected ? (
                <>
                  <button className="btn-disconnect" onClick={handleDisconnect}>
                    Disconnect
                  </button>
                  <button className="btn-message" onClick={handleMessage}>
                    Message
                  </button>
                </>
              ) : isRequestSent ? (
                <button className="btn-pending" disabled>
                  Request Sent
                </button>
              ) : (
                <button className="btn-connect" onClick={handleSendRequest}>
                  Connect
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="profile-posts">
        <h3>{user.username}'s Posts</h3>
        {posts.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          <div className="post-list">
            {posts.map((post) => (
              <div key={post._id} className="post-card">
                <p className="post-title">{post.title}</p>
                {post.postimg && (
                  <img
                    src={`${base_url}/uploads/${post.postimg}`}
                    alt="post"
                    className="post-image"
                  />
                )}
                <p className="post-desc">{post.description}</p>
                <span className="post-date">
                  {new Date(post.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
