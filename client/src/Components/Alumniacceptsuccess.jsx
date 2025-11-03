// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./AcceptRequest.css";

// const AcceptRequest = () => {
//   const [status, setStatus] = useState("loading");

//   useEffect(() => {
//     const acceptRequest = async () => {
//       try {
//         const token = window.location.pathname.split("/").pop();
//         const base_url = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

//         const res = await axios.get(`${base_url}/api/student/accept-request/${token}`);
//         if (res.data.success) {
//           setStatus("success");
//         } else {
//           setStatus("error");
//         }
//       } catch (err) {
//         console.error("Accept request error:", err);
//         setStatus("error");
//       }
//     };
//     acceptRequest();
//   }, []);

//   return (
//     <div className="accept-page">
//       {status === "loading" && <p className="loading">Connecting...</p>}

//       {status === "success" && (
//         <div className="accept-card success">
//           <h2>✅ Connection Accepted!</h2>
//           <p>You and the sender are now connected.</p>
//           <a href="http://localhost:3000" className="back-btn">
//             Go to Alumni Portal
//           </a>
//         </div>
//       )}

//       {status === "error" && (
//         <div className="accept-card error">
//           <h2>❌ Link Expired or Invalid</h2>
//           <p>This connection request may have already been used or is invalid.</p>
//           <a href="http://localhost:3000" className="back-btn">
//             Go Back
//           </a>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AcceptRequest;
