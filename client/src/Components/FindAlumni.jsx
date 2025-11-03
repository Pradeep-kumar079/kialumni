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

  const API_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  const defaultImg = "uploads/default.jpg";

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // ✅ Decode token to get current user ID
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.id || payload._id || payload.userId);

        // ✅ Fetch all alumni batches
        const res = await axios.get(`${API_BASE}/api/alumni/all-alumni`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          let foundAlumni = [];

          // ✅ Backend sends batches grouped by batchYear
          if (Array.isArray(res.data.batches)) {
            // Try to find matching batch
            const selectedBatch = res.data.batches.find(
              (b) =>
                String(b.batchYear).trim() === String(batchYear).trim()
            );

            if (selectedBatch && Array.isArray(selectedBatch.alumni)) {
              foundAlumni = selectedBatch.alumni;
            }
          }

          // ✅ If still empty, fallback — filter all alumni by admissionyear/batchYear
          if (foundAlumni.length === 0 && res.data.batches) {
            const allAlumni = res.data.batches.flatMap(b => b.alumni);
            foundAlumni = allAlumni.filter(
              (a) =>
                String(a.batchYear).trim() === String(batchYear).trim() ||
                String(a.admissionyear).trim() === String(batchYear).trim()
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

  const handleRequest = async (to) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/api/alumni/send-request`,
        { to },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Connection request sent!");
    } catch (err) {
      console.error("❌ Request error:", err.response?.data || err);
      alert("Failed to send connection request.");
    }
  };

  const handleDisconnect = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/api/alumni/disconnect`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("❎ Disconnected successfully!");
    } catch (err) {
      console.error("❌ Disconnect error:", err.response?.data || err);
      alert("Failed to disconnect.");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  if (!alumniList.length)
    return <div className="no-batch">No alumni found for batch {batchYear}</div>;

  // ✅ Group alumni by branch
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
                        <button onClick={() => handleRequest(alumni._id)}>
                          Connect
                        </button>
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
