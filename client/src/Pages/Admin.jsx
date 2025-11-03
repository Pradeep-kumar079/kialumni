import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Admin.css";

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  // core data
  const [dashboard, setDashboard] = useState({});
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [connections, setConnections] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [postSearch, setPostSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // message state
  const [recipientType, setRecipientType] = useState("all");
  const [batchYearField, setBatchYearField] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [imageFile, setImageFile] = useState(null);

  // gallery states
  const [newGallery, setNewGallery] = useState({
    title: "",
    description: "",
    file: null,
  });
  const [editItem, setEditItem] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFile, setEditFile] = useState(null);

  // ✅ unified backend URL (works for local + production)
  // ✅ Automatically detect whether running locally or on Render
const backend = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";



  // fetch data for currently selected tab
  const fetchData = async (tab) => {
    try {
      if (tab === "Log out") return handleLogout();
      const res = await axios.get(`${backend}/api/admin/${tab}`);
      if (res.data.success) {
        switch (tab) {
          case "dashboard":
            setDashboard(res.data.data || {});
            break;
          case "users":
            setUsers(res.data.users || []);
            break;
          case "posts":
            setPosts(res.data.posts || []);
            break;
          case "connections":
            setConnections(res.data.connections || []);
            break;
          case "profiles":
            setProfiles(res.data.profiles || []);
            break;
          case "gallery":
            setGallery(res.data.gallery || []);
            break;
          case "sentmessages":
            setSentMessages(res.data.sentMessages || []);
            break;
          default:
            break;
        }
      }
    } catch (err) {
      console.error(`❌ Error fetching ${tab}:`, err);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

  const handleDeleteUser = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this user?")) return;
    try {
      const res = await axios.delete(`${backend}/api/admin/delete-user/${id}`);
      if (res.data.success) {
        alert("User deleted successfully");
        fetchData("users");
      }
    } catch (err) {
      console.error("❌ Delete user error:", err);
    }
  };

  const handleDeletePost = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this post?")) return;
    try {
      const res = await axios.delete(`${backend}/api/admin/delete-post/${id}`);
      if (res.data.success) {
        alert("Post deleted successfully");
        fetchData("posts");
      }
    } catch (err) {
      console.error("❌ Delete post error:", err);
    }
  };

  // Gallery add/edit/delete
  const handleAddGallery = async (e) => {
    e.preventDefault();
    if (!newGallery.title || !newGallery.file) {
      alert("Please provide a title and an image.");
      return;
    }
    const formData = new FormData();
    formData.append("title", newGallery.title);
    formData.append("description", newGallery.description);
    formData.append("image", newGallery.file);
    try {
      const res = await axios.post(`${backend}/api/admin/gallery`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        alert("Gallery item added");
        setNewGallery({ title: "", description: "", file: null });
        fetchData("gallery");
      }
    } catch (err) {
      console.error("❌ Add gallery error:", err);
      alert("Failed to add gallery item");
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setEditTitle(item.title || "");
    setEditDescription(item.description || "");
    setEditFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("description", editDescription);
    if (editFile) formData.append("image", editFile);
    try {
      const res = await axios.put(`${backend}/api/admin/gallery/${editItem._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        alert("Gallery updated");
        setEditItem(null);
        fetchData("gallery");
      }
    } catch (err) {
      console.error("❌ Update gallery error:", err);
      alert("Failed to update gallery item");
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm("Delete this gallery item?")) return;
    try {
      const res = await axios.delete(`${backend}/api/admin/gallery/${id}`);
      if (res.data.success) {
        alert("Gallery item deleted");
        fetchData("gallery");
      }
    } catch (err) {
      console.error("❌ Delete gallery error:", err);
      alert("Failed to delete gallery item");
    }
  };

  // send announcement/message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", e.target.title.value);
      formData.append("description", e.target.description.value);
      formData.append("targetType", recipientType);
      if (recipientType === "batch") formData.append("batchYear", batchYearField);
      if (recipientType === "custom")
        formData.append("selectedEmails", JSON.stringify(selectedUsers));
      if (imageFile) formData.append("image", imageFile);

      const res = await axios.post(`${backend}/api/admin/send-message`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        alert("Message sent");
        fetchData("sentmessages");
        e.target.reset();
        setImageFile(null);
      }
    } catch (err) {
      console.error("❌ Send message error:", err);
      alert("Failed to send message");
    }
  };

  const handlePublishPost = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      const title = e.target.title.value.trim();
      const description = e.target.description.value.trim();
      if (!title || !description || !imageFile) {
        alert("Please fill all fields and select an image");
        return;
      }
      formData.append("title", title);
      formData.append("description", description);
      formData.append("image", imageFile);

      const res = await axios.post(`${backend}/api/admin/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        alert("✅ Post published successfully!");
        e.target.reset();
        setImageFile(null);
        fetchData("posts");
      } else {
        alert("⚠️ Failed to publish post");
      }
    } catch (err) {
      console.error("❌ Publish post error:", err);
      alert("Error publishing post: " + (err.response?.data?.message || err.message));
    }
  };

  // Filters (unchanged)
  const filteredPosts = posts.filter((p) => {
    const title = typeof p.title === "string" ? p.title.toLowerCase() : "";
    const desc = typeof p.description === "string" ? p.description.toLowerCase() : "";
    const date = typeof p.date === "string" ? p.date.toLowerCase() : "";
    return (
      title.includes(postSearch.toLowerCase()) ||
      desc.includes(postSearch.toLowerCase()) ||
      date.includes(postSearch.toLowerCase())
    );
  });

  const filteredUsers = users.filter((u) => {
    const username = typeof u.username === "string" ? u.username.toLowerCase() : "";
    const email = typeof u.email === "string" ? u.email.toLowerCase() : "";
    const role = typeof u.role === "string" ? u.role.toLowerCase() : "";
    const usn = typeof u.usn === "string" ? u.usn.toLowerCase() : "";
    return (
      username.includes(userSearch.toLowerCase()) ||
      email.includes(userSearch.toLowerCase()) ||
      role.includes(userSearch.toLowerCase()) ||
      usn.includes(userSearch.toLowerCase())
    );
  });

  return (
    <div className="admin-wrapper">
      <header className="admin-navbar">
        <h2>Admin Dashboard</h2>
      </header>

      <div className="admin-body">
        <aside className="admin-sidebar">
          {[
            "dashboard",
            "users",
            "posts",
            "connections",
            "profiles",
            "gallery",
            "sentmessages",
            "Log out",
          ].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </aside>

        <main className="admin-content">
          {/* Dashboard */}
         {activeTab === "dashboard" && (
            <div className="dashboard-section">
              <div className="dashboard-cards">
                <div className="card">Users: {dashboard.totalUsers || 0}</div>
                <div className="card">Posts: {dashboard.totalPosts || 0}</div>
                <div className="card">Connections: {dashboard.totalConnections || 0}</div>
                <div className="card">Messages: {dashboard.totalMessages || 0}</div>
              </div>

              {/* ✅ Add Post Form */}
              <div className="publish-form-container">
                <h3>Publish a New Post</h3>
                <form onSubmit={handlePublishPost} className="publish-form">
                  <input type="text" name="title" placeholder="Post Title" required />
                  <textarea name="description" placeholder="Post Description" required />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    required
                  />
                  <button type="submit">Publish</button>
                </form>
              </div>
            </div>
          )}



          {/* Users */}
           {activeTab === "users" && (
            <div className="content-section">
              <h2>All Users</h2>
              <input
                type="text"
                className="search-input"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>USN</th>
                      <th>Batch</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <img
                            src={u.userimg || "/default-user.png"}
                            alt="User"
                            className="table-img"
                          />
                        </td>
                        <td>{u.username}</td>
                        <td>{u.usn}</td>
                        <td>{u.batchYear}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={(e) =>
                              handleDeleteUser(u._id ?? u._id, e)
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Posts */}
         {activeTab === "posts" && (
            <div className="content-section">
              <h2>All Posts</h2>
              <input
                type="text"
                className="search-input"
                placeholder="Search posts..."
                value={postSearch}
                onChange={(e) => setPostSearch(e.target.value)}
              />
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>User</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Likes</th>
                      <th>Comments</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((p) => (
                      <tr key={p._id}>
                        <td>
                          {p.postimg && (
                            <img
                              src={p.postimg}
                              alt="post"
                              className="table-img"
                            />
                          )}
                        </td>
                        <td>{p.user?.username || "Unknown"}</td>
                        <td className="post-desc">{p.title}</td>
                        <td className="post-desc">{p.description}</td>
                        <td>{p.likes?.length || 0}</td>
                        <td>{p.comments?.length || 0}</td>
                        <td>
                          {new Date(p.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={(e) => handleDeletePost(p._id, e)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {/* Connections */}
          {activeTab === "connections" && (
            <div className="connections-section">
              <h3>All Connections</h3>
              {connections.length === 0 ? (
                <p>No connections found.</p>
              ) : (
                <div className="connection-cards">
                  {connections.map((c, i) => (
                    <div key={c._id ?? i} className="connection-card">
                      <h4>
                        {c.fromUser?.username || c.from?.username || "User A"} ↔ {c.toUser?.username || c.to?.username || "User B"}
                      </h4>
                      <p>Status: <span className={`status ${c.status}`}>{c.status}</span></p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profiles (admin list) */}
          {activeTab === "profiles" && (
            <div className="profile-section">
              <h3>Admin Profiles</h3>
              {profiles.length === 0 ? (
                <p>No admin profiles found.</p>
              ) : (
                <div className="profiles-grid">
                  {profiles.map((p) => (
                    <div key={p._id} className="profile-card">
                      <img src={p.userimg || "/default-user.png"} alt={p.username} className="profile-img" />
                      <p><strong>{p.username}</strong></p>
                      <p>{p.email}</p>
                      <p>{p.branch} • {p.batchYear}</p>
                      <p className="role-label">{p.role}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Gallery */}
          {activeTab === "gallery" && (
            <div className="content-section">
              <h2>Gallery</h2>

              {/* Add Gallery Form */}
              <form className="gallery-form" onSubmit={handleAddGallery}>
                <input
                  type="text"
                  placeholder="Title"
                  value={newGallery.title}
                  onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newGallery.description}
                  onChange={(e) => setNewGallery({ ...newGallery, description: e.target.value })}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewGallery({ ...newGallery, file: e.target.files[0] })}
                  required
                />
                <button type="submit">Upload</button>
              </form>

              {/* Gallery items */}
              <div className="gallery-container">
                {gallery.map((item) => (
                  <div key={item._id} className="gallery-card">
                    <img src={item.image || item.media || item.url} alt={item.title} />
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <div className="gallery-actions">
                      <button onClick={() => handleEdit(item)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDeleteGallery(item._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Form */}
              {editItem && (
                <div className="edit-form">
                  <h3>Edit Gallery Post</h3>
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" />
                  <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description" />
                  <input type="file" accept="image/*" onChange={(e) => setEditFile(e.target.files[0])} />
                  <div className="edit-actions">
                    <button onClick={handleUpdate}>Update</button>
                    <button onClick={() => setEditItem(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sent Messages */}
          {activeTab === "sentmessages" && (
            <section className="section">
              <h3>Send Messages / Announcements</h3>

              <div className="send-message-panel">
                <form onSubmit={handleSendMessage} className="send-message-form">
                  <input name="title" placeholder="Title" required />
                  <textarea name="description" placeholder="Description" required />

                  <div className="recipient-controls">
                    <label>
                      <input type="radio" checked={recipientType === "all"} onChange={() => setRecipientType("all")} /> All Users
                    </label>
                    <label>
                      <input type="radio" checked={recipientType === "batch"} onChange={() => setRecipientType("batch")} /> Batch
                    </label>
                    <label>
                      <input type="radio" checked={recipientType === "custom"} onChange={() => setRecipientType("custom")} /> Selected Users
                    </label>
                  </div>

                  {recipientType === "batch" && (
                    <input value={batchYearField} onChange={(e) => setBatchYearField(e.target.value)} placeholder="Batch year (e.g., 2021)" />
                  )}

                  {recipientType === "custom" && (
                    <>
                      <small>Enter comma-separated emails</small>
                      <input placeholder="user1@example.com, user2@example.com" onBlur={(e) => setSelectedUsers(e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
                    </>
                  )}

                  <div>
                    <label>Attach Image (optional):</label>
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                  </div>

                  <button type="submit">Send</button>
                </form>
              </div>

              <hr />

              <h4>Sent Messages</h4>
              <div className="messages-list">
                {sentMessages.length === 0 ? (
                  <p>No messages sent yet.</p>
                ) : (
                  <table className="messages-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Target</th>
                        <th>Recipients</th>
                        <th>Sent At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sentMessages.map((m) => (
                        <tr key={m._id}>
                          <td>{m.title}</td>
                          <td>{m.targetType}{m.batchYear ? ` (${m.batchYear})` : ""}</td>
                          <td>{m.recipients?.length || 0}</td>
                          <td>{new Date(m.sentAt || m.createdAt || m.updatedAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
