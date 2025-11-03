import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Gallery.css";

const SingleGallery = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [galleryItem, setGalleryItem] = useState(null);

  // Deployed backend URL
 const base_url = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";


  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`${base_url}/api/user/gallery/${id}`);
        if (res.data.success) setGalleryItem(res.data.item);
      } catch (err) {
        console.error("❌ Single Gallery Fetch Error:", err);
      }
    };
    fetchItem();
  }, [id]);

  const renderImg = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/uploads")) return `${base_url}${img}`;
    return `${base_url}/uploads/${img}`;
  };

  if (!galleryItem) return <p>Loading...</p>;

  return (
    <div className="single-gallery-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className="single-gallery-card">
        {galleryItem.image && (
          <img
            src={renderImg(galleryItem.image)}
            alt={galleryItem.title}
            className="single-gallery-image"
          />
        )}
        <div className="single-gallery-info">
          <h2>{galleryItem.title}</h2>
          <p>{galleryItem.description}</p>
          <small>{new Date(galleryItem.createdAt).toLocaleString()}</small>
        </div>
      </div>
    </div>
  );
};

export default SingleGallery;
