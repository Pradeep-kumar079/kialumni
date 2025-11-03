import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./Students.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const Alumni = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlumniBatches = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${BACKEND_URL}/api/alumni/all-alumni`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setBatches(res.data.batches || []);
        }
      } catch (err) {
        console.error(err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumniBatches();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="batch-container">
      <Navbar />
      <h2>Find Alumni By Batch Year :</h2>

      {batches.length === 0 ? (
        <p className="no-batch">No alumni batches found yet.</p>
      ) : (
        <div className="allbatchs">
          {batches.map((batch, index) => (
            <div
              key={index}
              className="batch-box"
              onClick={() => navigate(`/findalumni/${batch.batchYear}`)}
            >
              <h3>{batch.batchYear}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alumni;
