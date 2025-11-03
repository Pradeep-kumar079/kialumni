import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AllPosts.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const AllPosts = () => {
  // ✅ Universal image rendering helper
  const renderImage = (path) => {
    if (!path) return `${BACKEND_URL}/uploads/default.jpg`;
    if (path.startsWith("http")) return path;
    return path.startsWith("uploads/")
      ? `${BACKEND_URL}/${path}`
      : `${BACKEND_URL}/uploads/${path}`;
  };

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/user/allposts`);
      if (res.data.success && Array.isArray(res.data.posts)) {
        setPosts(res.data.posts);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error("Error fetching posts:", err.response?.data || err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) return <div>Loading posts...</div>;
  if (!posts.length) return <div>No posts available</div>;

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleProfileClick = (userId) => {
    if (!userId) return;
    navigate(`/profile/${userId}`);
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/user/like/${postId}`);
      if (res.data.success) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? { ...post, likes: res.data.updatedLikes }
              : post
          )
        );
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleComment = async (postId, commentText) => {
    if (!commentText) return;
    try {
      const res = await axios.post(`${BACKEND_URL}/api/user/comment/${postId}`, {
        comment: commentText,
      });
      if (res.data.success) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? { ...post, comments: res.data.updatedComments }
              : post
          )
        );
      }
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  const handleShare = (postId) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Post link copied to clipboard!");
  };

  return (
    <div className="all-post-container">
      <div className="posts-container">
        {posts.map((post) => {
          // ✅ Ensure post.user is always safe
          const user = post.user || {};
          const userImg = renderImage(user.userimg);
          const username = user.username || "Unknown User";
          const userId = user._id || null;

          return (
            <div key={post._id} className="post-card">
              {/* Post Header */}
              <div className="post-header">
                <div
                  className="userprof"
                  onClick={() => handleProfileClick(userId)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={userImg}
                    alt={username}
                    className="post-profile-img"
                  />
                </div>

                <div
                  onClick={() => handleProfileClick(userId)}
                  style={{ cursor: "pointer" }}
                >
                  <h4 className="post-username">{username}</h4>
                  <small>
                    {new Date(post.createdAt).toLocaleString() || ""}
                  </small>
                </div>
              </div>

              {/* Post Content */}
              <div
                className="post-content"
                onClick={() => handlePostClick(post._id)}
                style={{ cursor: "pointer" }}
              >
                {post.title && <h3>{post.title}</h3>}

                {post.postimg && (
                  <img
                    src={renderImage(post.postimg)}
                    alt="Post"
                    className="post-img"
                  />
                )}

                {post.description && <p>{post.description}</p>}
              </div>

              {/* Post Details */}
              <div className="post-details">
                <small>Category: {post.category || "General"}</small>
                {post.hashtags?.length > 0 && (
                  <div className="hashtags">
                    {post.hashtags.map((tag, idx) => (
                      <span key={idx} className="hashtag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <small>Likes: {post.likes?.length || 0}</small>
                <small>Comments: {post.comments?.length || 0}</small>
              </div>

              {/* Post Actions */}
              <div className="post-actions">
                <button onClick={() => handleLike(post._id)}> Like</button>
                <button
                  onClick={() => {
                    const commentText = prompt("Enter your comment:");
                    handleComment(post._id, commentText);
                  }}
                >
                  Comment
                </button>
                <button onClick={() => handleShare(post._id)}>🔗 Share</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllPosts;
