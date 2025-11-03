import React from "react";
import { useNavigate } from "react-router-dom";

const AcceptFailed = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2 style={{ color: "red" }}>❌ Request Failed!</h2>
      <p>The link may be expired or invalid.</p>
      <button
        onClick={() => navigate("/home")}
        style={{
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Go to Home
      </button>
    </div>
  );
};

export default AcceptFailed;
