import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Chat.css";
import { Edit, Trash2, X } from "lucide-react";
import { socket } from "../socket"; // ✅ Import shared socket instance

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const Chat = ({ currentUserId, otherUserId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [receiver, setReceiver] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [selectedMsgId, setSelectedMsgId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState("");

  // ✅ Fetch chat and receiver info
  useEffect(() => {
    socket.emit("user-online", currentUserId);

    const fetchChatData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // ✅ Fetch receiver details
        const receiverRes = await axios.get(`${BACKEND_URL}/api/chat/receiver/${otherUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (receiverRes.data.success) setReceiver(receiverRes.data.user);

        // ✅ Fetch chat history
        const chatRes = await axios.get(`${BACKEND_URL}/api/chat/${currentUserId}/${otherUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (chatRes.data.success) setMessages(chatRes.data.chats);
      } catch (err) {
        console.error("❌ Error fetching chat:", err);
      }
    };

    fetchChatData();

    // ✅ Socket listeners
    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data.chat]);
    });

    socket.on("message-edited", ({ chat }) => {
      setMessages((prev) => prev.map((m) => (m._id === chat._id ? chat : m)));
    });

    socket.on("message-deleted", ({ chatId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== chatId));
    });

    socket.on("userStatusUpdate", ({ userId, isOnline }) => {
      if (userId === otherUserId) setIsOnline(isOnline);
    });

    return () => {
      socket.off("receive-message");
      socket.off("message-edited");
      socket.off("message-deleted");
      socket.off("userStatusUpdate");
    };
  }, [currentUserId, otherUserId]);

  // ✅ Send Message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const tempId = Date.now().toString();
    const msgData = {
      fromUserId: currentUserId,
      toUserId: otherUserId,
      message: input,
    };

    // Temporary show message before backend confirm
    setMessages((prev) => [...prev, { ...msgData, _id: tempId, sender: currentUserId }]);
    setInput("");

    try {
      const res = await axios.post(`${BACKEND_URL}/api/chat/send`, msgData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      socket.emit("send-message", res.data.chat);
    } catch (err) {
      console.error("❌ Send message error:", err);
    }
  };

  // ✅ Start edit mode
  const handleEditStart = () => {
    const msg = messages.find((m) => m._id === selectedMsgId);
    if (msg) {
      setEditText(msg.message);
      setEditMode(true);
    }
  };

  // ✅ Submit edit
  const handleEditSubmit = async () => {
    try {
      const res = await axios.put(
        `${BACKEND_URL}/api/chat/edit/${selectedMsgId}`,
        { message: editText, userId: currentUserId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setMessages((prev) => prev.map((m) => (m._id === selectedMsgId ? res.data.chat : m)));
      socket.emit("edit-message", res.data.chat);
      setEditMode(false);
      setSelectedMsgId(null);
      setEditText("");
    } catch (err) {
      console.error("❌ Edit message error:", err);
    }
  };

  // ✅ Delete message
  const handleDelete = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/api/chat/delete/${selectedMsgId}/${currentUserId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessages((prev) => prev.filter((m) => m._id !== selectedMsgId));
      socket.emit("delete-message", { chatId: selectedMsgId, userId: currentUserId });
      setSelectedMsgId(null);
    } catch (err) {
      console.error("❌ Delete message error:", err);
    }
  };

  return (
    <div className="whole-chat">
      <div className="chat-container">
        {/* ===== HEADER ===== */}
        <div className="chat-header">
          {selectedMsgId ? (
            <div className="selected-actions">
              <button onClick={handleEditStart}>
                <Edit size={18} />
              </button>
              <button onClick={handleDelete}>
                <Trash2 size={18} />
              </button>
              <button onClick={() => setSelectedMsgId(null)}>
                <X size={18} />
              </button>
            </div>
          ) : receiver ? (
            <>
              <img
                src={
                  receiver.userimg
                    ? receiver.userimg.startsWith("http")
                      ? receiver.userimg
                      : receiver.userimg.startsWith("uploads/")
                      ? `${BACKEND_URL}/${receiver.userimg}`
                      : `${BACKEND_URL}/uploads/${receiver.userimg}`
                    : `${BACKEND_URL}/uploads/default.jpg`
                }
                alt={receiver.username}
                className="chat-header-img"
              />

              <div className="chat-header-info">
                <h3>{receiver.username}</h3>
                <p className={isOnline ? "status-online" : "status-offline"}>
                  {isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        {/* ===== MESSAGES ===== */}
        <div className="chat-messages">
          {messages.map((msg) => {
            const isMe = msg.sender === currentUserId;
            const isSelected = selectedMsgId === msg._id;
            return (
              <div
                key={msg._id}
                className={`chat-message ${isMe ? "me" : "them"} ${
                  isSelected ? "selected" : ""
                }`}
                onClick={() => setSelectedMsgId(isSelected ? null : msg._id)}
              >
                {editMode && isSelected ? (
                  <div className="edit-box">
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                    />
                    <button onClick={handleEditSubmit}>Save</button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setSelectedMsgId(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <span>{msg.message}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* ===== INPUT ===== */}
        <div className="chat-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>➤</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
