import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import "./Students.css";

const FindAlumni = () => {
  const { batchYear } = useParams();
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  const API_BASE = "https://kialumni-1.onrender.com";
  const defaultImg = "uploads/default.jpg";

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.id || payload._id || payload.userId);

        const res = await axios.get(`${API_BASE}/api/alumni/all-alumni`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          let foundAlumni = [];

          if (Array.isArray(res.data.alumni)) {
            foundAlumni = res.data.alumni.filter(
              (a) => String(a.batchYear).trim() === String(batchYear).trim()
            );
          }

          setAlumniList(foundAlumni);
        }
      } catch (err) {
        console.error("❌ Fetch alumni error:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, [batchYear]);

  const handleRequest = async (receiverId) => {
    if (!receiverId) return alert("Invalid user ID");
    if (receiverId === currentUserId) return alert("Cannot connect to yourself");

    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first");

    console.log("Sending alumni request to:", receiverId);

    try {
      const res = await axios.post(
        `${API_BASE}/api/alumni/send-request`,
        { receiverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send request";
      if (msg === "Request already sent") {
        const resend = window.confirm(
          "You have already sent a request. Do you want to resend it?"
        );
        if (resend) {
          try {
            await axios.post(
              `${API_BASE}/api/alumni/resend-request`,
              { to: receiverId },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("✅ Request resent successfully!");
          } catch (resendErr) {
            alert(resendErr.response?.data?.message || "Failed to resend request");
          }
        }
      } else {
        alert(msg);
      }
    }
  };

  const handleDisconnect = async (userId) => {
    if (userId === currentUserId) return alert("Cannot disconnect yourself");

    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first");

    try {
      await axios.post(
        `${API_BASE}/api/alumni/disconnect`,
        { targetUserId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("❎ Disconnected successfully!");
      setAlumniList((prev) =>
        prev.map((a) =>
          a._id === userId
            ? { ...a, connections: a.connections.filter((id) => id !== currentUserId) }
            : a
        )
      );
    } catch (err) {
      console.error("❌ Disconnect error:", err.response?.data || err);
      alert("Failed to disconnect.");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!alumniList.length)
    return <div className="no-batch">No alumni found for batch {batchYear}</div>;

  const groupedByBranch = alumniList.reduce((acc, a) => {
    if (!acc[a.branch]) acc[a.branch] = [];
    acc[a.branch].push(a);
    return acc;
  }, {});

  return (
    <div className="batch-container">
      <Navbar />
      <h2>Alumni in {batchYear}</h2>

      {Object.entries(groupedByBranch).map(([branch, list]) => (
        <div key={branch} className="branch-group">
          <h3>{branch}</h3>
          <div className="table-wrapper">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Batch Year</th>
                  <th>USN</th>
                  <th>Email</th>
                  <th>Connections</th>
                  <th>Action</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {list.map((alumni) => (
                  <tr key={alumni._id}>
                    <td>
                      <img
                        src={
                          alumni.userimg
                            ? `${API_BASE}/${alumni.userimg}`
                            : `${API_BASE}/${defaultImg}`
                        }
                        alt={alumni.username}
                        className="profile-img"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/profile/${alumni._id}`)}
                      />
                    </td>
                    <td>{alumni.username}</td>
                    <td>{alumni.role}</td>
                    <td>{alumni.batchYear}</td>
                    <td>{alumni.usn}</td>
                    <td>{alumni.email}</td>
                    <td>{alumni.connections?.length || 0}</td>
                    <td>
                      {currentUserId === alumni._id ? (
                        "Myself"
                      ) : alumni.connections?.includes(currentUserId) ? (
                        <>
                          <button disabled>Connected</button>
                          <button
                            onClick={() => handleDisconnect(alumni._id)}
                            className="disconnect-btn"
                            style={{
                              backgroundColor: "#dc3545",
                              color: "white",
                              marginLeft: "8px",
                            }}
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <button onClick={() => handleRequest(alumni._id)}>Connect</button>
                      )}
                    </td>
                    <td>
                      {alumni.connections?.includes(currentUserId)
                        ? "Connected"
                        : "Not Connected"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FindAlumni;
