import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Students.css";

const FindStudent = () => {
  const { admissionyear } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${BACKEND_URL}/api/student/all-students`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success && Array.isArray(res.data.students)) {
          const filtered = res.data.students.filter(
            (s) => s.admissionyear?.toString() === admissionyear
          );
          const payload = JSON.parse(atob(token.split(".")[1]));
          setCurrentUserId(payload.id || payload._id || payload.userId);
          setStudents(filtered);
        }
      } catch (err) {
        console.error("❌ Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [admissionyear]);

  const handleRequest = async (receiverId) => {
    try {
      const token = localStorage.getItem("token");
      console.log("🎯 Sending request to receiverId:", receiverId);
      const res = await axios.post(
        `${BACKEND_URL}/api/student/send-request`,
        { receiverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request");
    }
  };

  const handleDisconnect = async (targetUserId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${BACKEND_URL}/api/student/disconnect`,
        { targetUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert("🔌 Disconnected successfully!");
        setStudents((prev) =>
          prev.map((s) =>
            s._id === targetUserId
              ? { ...s, connections: s.connections.filter((id) => id !== currentUserId) }
              : s
          )
        );
      }
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!students.length) return <div>No students found for {admissionyear}</div>;

  const grouped = students.reduce((acc, s) => {
    if (!acc[s.branch]) acc[s.branch] = [];
    acc[s.branch].push(s);
    return acc;
  }, {});

  return (
    <div className="batch-container">
      <h2>Students in {admissionyear}</h2>
      {Object.entries(grouped).map(([branch, list]) => (
        <div key={branch} className="branch-group">
          <h3>{branch}</h3>
          <div className="table-wrapper">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Admission Year</th>
                  <th>USN</th>
                  <th>Email</th>
                  <th>Connections</th>
                  <th>Action</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => {
                  const isConnected = s.connections?.includes(currentUserId);
                  return (
                    <tr key={s._id}>
                      <td>
                        <img
                          src={`${BACKEND_URL}/${s.userimg || "uploads/default.jpg"}`}
                          alt={s.username}
                          className="profile-img"
                          onClick={() => navigate(`/profile/${s._id}`)}
                        />
                      </td>
                      <td
                        style={{ cursor: "pointer", color: "#2563eb" }}
                        onClick={() => navigate(`/profile/${s._id}`)}
                      >
                        {s.username}
                      </td>
                      <td>{s.role}</td>
                      <td>{s.admissionyear}</td>
                      <td>{s.usn}</td>
                      <td>{s.email}</td>
                      <td>{s.connections?.length || 0}</td>
                      <td>
                        {currentUserId === s._id ? (
                          "Myself"
                        ) : isConnected ? (
                          <>
                            <button
                              style={{ backgroundColor: "#ef4444", color: "#fff" }}
                              onClick={() => handleDisconnect(s._id)}
                            >
                              Disconnect
                            </button>
                            &nbsp;
                            <button
                              style={{ backgroundColor: "#3b82f6", color: "#fff" }}
                              onClick={() => navigate(`/chat/${s._id}`)}
                            >
                              Message
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleRequest(s._id)}>Connect</button>
                        )}
                      </td>
                      <td>{isConnected ? "Connected" : "Not connected"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FindStudent;
