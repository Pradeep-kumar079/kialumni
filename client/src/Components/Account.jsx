import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "./Account.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";


const Account = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({});
  const [editingPostId, setEditingPostId] = useState(null);
  const [updatedPost, setUpdatedPost] = useState({ title: "", description: "" });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const resUser = await axios.get(`${BACKEND_URL}/api/account`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resUser.data.success) setUser(resUser.data.user);

        const resPosts = await axios.get(`${BACKEND_URL}/api/account/posts/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resPosts.data.success) setPosts(resPosts.data.posts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEditToggle = () => {
    setEditing(!editing);
    setUpdatedUser({ ...user });
    setPreviewImage(null);
    setSelectedImage(null);
  };

  const handleChange = (e) => {
    setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      Object.keys(updatedUser).forEach((key) => {
        formData.append(key, updatedUser[key]);
      });

      if (selectedImage) formData.append("userimg", selectedImage);

      const res = await axios.put(`${BACKEND_URL}/api/account/update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setUser(res.data.user);
        setEditing(false);
        setPreviewImage(null);
        setSelectedImage(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(`${BACKEND_URL}/api/posts/like/${postId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const updated = posts.map((p) =>
          p._id === postId ? { ...p, liked: !p.liked } : p
        );
        setPosts(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditPost = (post) => {
    setEditingPostId(post._id);
    setUpdatedPost({ title: post.title, description: post.description });
  };

  const handleSavePost = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${BACKEND_URL}/api/posts/update/${postId}`, updatedPost, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const updated = posts.map((p) => (p._id === postId ? res.data.post : p));
        setPosts(updated);
        setEditingPostId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${BACKEND_URL}/api/posts/delete/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setPosts(posts.filter((p) => p._id !== postId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user data found</div>;

  return (
    <div className="account-container">
      <Navbar />
      <div className="account-content">
        {/* Left Tabs */}
        <div className="left-tabs">
          <img
            src={
              previewImage
                ? previewImage
                : user.userimg
                ? `${BACKEND_URL}/${user.userimg}`
                : `${BACKEND_URL}/uploads/default.jpg`
            }
            alt="Profile"
            className="profile-img"
          />

          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={activeTab === "posts" ? "active" : ""}
            onClick={() => setActiveTab("posts")}
          >
            Posts
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            Log out
          </button>
        </div>

        {/* Right Content */}
        <div className="right-content">
          {activeTab === "profile" && (
            <>
              {!editing ? (
                <>
                  <button onClick={handleEditToggle}>Edit Profile</button>
                  <form>
                    <input type="text" value={user.username} readOnly />
                    <input type="email" value={user.email} readOnly />
                    <input type="text" value={user.branch} readOnly />
                    <input type="text" value={user.usn} readOnly />
                    <input type="date" value={user.dob?.slice(0, 10)} readOnly />
                    <input type="number" value={user.admissionyear} readOnly />
                    <input type="text" value={user.role} readOnly />
                  </form>
                </>
              ) : (
                <>
                  <button onClick={handleUpdate}>Save</button>
                  <form>
                    <input
                      type="text"
                      name="username"
                      value={updatedUser.username}
                      onChange={handleChange}
                    />
                    <input
                      type="email"
                      name="email"
                      value={updatedUser.email}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      name="branch"
                      value={updatedUser.branch}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      name="usn"
                      value={updatedUser.usn}
                      onChange={handleChange}
                    />
                    <input
                      type="date"
                      name="dob"
                      value={updatedUser.dob?.slice(0, 10)}
                      onChange={handleChange}
                    />
                    <input
                      type="number"
                      name="admissionyear"
                      value={updatedUser.admissionyear}
                      onChange={handleChange}
                    />

                    <label>Profile Image:</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    {previewImage && (
                      <img src={previewImage} alt="Preview" className="profile-img" />
                    )}
                  </form>
                </>
              )}
            </>
          )}

          {activeTab === "posts" && (
            <>
              <h2>User Posts</h2>
              {posts.length === 0 && <p>No posts yet</p>}
              {posts.map((post) => (
                <div key={post._id} className="post-card">
                  {editingPostId === post._id ? (
                    <>
                      <input
                        type="text"
                        value={updatedPost.title}
                        onChange={(e) =>
                          setUpdatedPost({ ...updatedPost, title: e.target.value })
                        }
                      />
                      <textarea
                        value={updatedPost.description}
                        onChange={(e) =>
                          setUpdatedPost({ ...updatedPost, description: e.target.value })
                        }
                      />
                      <button onClick={() => handleSavePost(post._id)}>Save</button>
                      <button onClick={() => setEditingPostId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <h3>{post.title}</h3>
                      <p>{post.description}</p>
                      {post.postimg && (
                        <div className="post-image-container">
                          <img
                            src={`${BACKEND_URL}/uploads/${post.postimg}`}
                            alt="Post"
                          />
                        </div>
                      )}
                      <div className="post-actions">
                        <button onClick={() => handleLike(post._id)}>
                          {post.liked ? "Unlike" : "Like"}
                        </button>
                        <button onClick={() => handleEditPost(post)}>Edit</button>
                        <button onClick={() => handleDeletePost(post._id)}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
