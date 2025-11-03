import React, { useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import "./Post.css";

const Post = () => {
 const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    postimg: null,
    tags: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first!");

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("tags", formData.tags);
    if (formData.postimg) data.append("postimg", formData.postimg);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/user/posts`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        alert("✅ Post created successfully!");
        setFormData({ title: "", description: "", postimg: null, tags: "" });
      }
    } catch (err) {
      console.error("❌ Error creating post:", err.response?.data || err.message);
      alert("⚠️ Error creating post. Check console for details.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="addpost-wrapper">
        <div className="addpost-container">
          <h2>Create a New Post</h2>
          <form className="post-content" onSubmit={handleSubmit}>
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter your post title"
              required
            />

            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write something about your post..."
              required
            />

            <label>Image (optional)</label>
            <input
              type="file"
              name="postimg"
              onChange={handleChange}
              accept="image/*"
            />

            <label>Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="#alumni #college"
            />

            <button type="submit">Publish Post</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Post;
