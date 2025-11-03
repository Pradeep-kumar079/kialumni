import React from "react";
import { useParams } from "react-router-dom";
import Chat from "./Chat";

const ChatWrapper = () => {
  const { otherUserId } = useParams();
  const token = localStorage.getItem("token");

  let currentUserId = null;
  try {
    if (token) {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      currentUserId = decoded.id || decoded._id; // handle both id/_id formats
    }
  } catch (error) {
    console.error("Invalid token:", error);
  }

  if (!currentUserId) {
    return (
      <div style={{ textAlign: "center", marginTop: "80px" }}>
        <h2>⚠️ Please log in to start chatting</h2>
      </div>
    );
  }

  return <Chat currentUserId={currentUserId} otherUserId={otherUserId} />;
};

export default ChatWrapper;
