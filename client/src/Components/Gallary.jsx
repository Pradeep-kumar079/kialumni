import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Gallery.css";

const Gallary = () => {
  const [gallery, setGallery] = useState([]);
  const navigate = useNavigate();

  // ✅ Use your deployed backend URL
 const base_url = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";


  const fetchGallery = async () => {
    try {
      const res = await axios.get(`${base_url}/api/user/gallery`);
      if (res.data.success) setGallery(res.data.gallery);
    } catch (err) {
      console.error("❌ Fetch Gallery Error:", err);
    }
  };

  useEffect(() => {
    fetchGallery();
    const interval = setInterval(fetchGallery, 10000);
    return () => clearInterval(interval);
  }, []);

  const renderImg = (img) => {
    if (!img) return "";
    if (img.startsWith("http") || img.startsWith("https")) return img;
    if (img.startsWith("/uploads")) return `${base_url}${img}`;
    return `${base_url}/uploads/${img}`;
  };

  return (
    <div className="gallery-page">
      <h2>🎉 College Announcements & Gallery</h2>
      <div className="gallery-grid">
        {gallery.length === 0 ? (
          <p>No announcements yet.</p>
        ) : (
          gallery.map((item) => (
            <div
              key={item._id}
              className="gallery-card"
              onClick={() => navigate(`/gallery/${item._id}`)} // Navigate to single item view
              style={{ cursor: "pointer" }}
            >
              {item.image && (
                <img
                  src={renderImg(item.image)}
                  alt={item.title}
                  className="gallery-image"
                />
              )}
              <div className="gallery-info">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Gallary;
