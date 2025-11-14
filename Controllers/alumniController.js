const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const crypto = require("crypto");
const UserModel = require("../Models/UserModel");
const RequestModel = require("../Models/RequestModel");
const { Resend } = require("resend");

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const BASE_URL = "https://kialumni-1.onrender.com";

/* -----------------------------------------------------------
   ✅ Get Alumni
------------------------------------------------------------ */
const GetAlumniBatchController = async (req, res) => {
  try {
    const alumni = await UserModel.find({ role: "alumni" }).select("-password");
    res.status(200).json({ success: true, alumni });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch alumni" });
  }
};

/* -----------------------------------------------------------
   ✅ Send Connection Request (Using Resend)
------------------------------------------------------------ */
const sendRequestController = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    const sender = await UserModel.findById(senderId);
    const receiver = await UserModel.findById(receiverId);

    if (!receiver)
      return res.status(404).json({ success: false, message: "Receiver not found" });

    if (sender._id.equals(receiver._id))
      return res.status(400).json({ success: false, message: "Cannot send request to yourself" });

    const existingRequest = await RequestModel.findOne({
      from: senderId,
      to: receiverId,
      status: "pending",
    });

    if (existingRequest)
      return res.status(400).json({ success: false, message: "Request already sent" });

    const token = jwt.sign(
      { senderId, receiverId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const newRequest = new RequestModel({
      from: senderId,
      to: receiverId,
      token,
      status: "pending",
    });

    await newRequest.save();

    const acceptUrl = `${BASE_URL}/api/alumni/accept-request/${token}`;
    const rejectUrl = `${BASE_URL}/api/alumni/reject-request/${token}`;

    // ----------------------------
    // 🚀 Send Email Using RESEND
    // ----------------------------
    await resend.emails.send({
      from: "KIT Alumni <onboarding@resend.dev>",
      to: receiver.email,
      subject: "New Connection Request",
      html: `
        <div style="font-family:sans-serif;padding:20px;">
          <h3>Hello ${receiver.username},</h3>
          <p>${sender.username} has sent you a connection request.</p>
          <a href="${acceptUrl}" style="padding:10px 15px;background:#4CAF50;color:white;text-decoration:none;margin-right:10px;">Accept</a>
          <a href="${rejectUrl}" style="padding:10px 15px;background:#f44336;color:white;text-decoration:none;">Reject</a>
        </div>
      `,
    });

    res.json({ success: true, message: "Connection request sent successfully!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error sending connection request" });
  }
};

/* -----------------------------------------------------------
   ✅ Accept Request
------------------------------------------------------------ */
const acceptRequestController = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { senderId, receiverId } = decoded;

    const request = await RequestModel.findOne({ token, status: "pending" });
    if (!request) return res.status(400).send("Request already handled or expired.");

    const sender = await UserModel.findById(senderId);
    const receiver = await UserModel.findById(receiverId);

    if (!sender || !receiver)
      return res.status(404).send("User not found or link expired.");

    if (!sender.connections.includes(receiverId))
      sender.connections.push(receiverId);

    if (!receiver.connections.includes(senderId))
      receiver.connections.push(senderId);

    await sender.save();
    await receiver.save();

    request.status = "connected";
    await request.save();

    res.send(`<h2>✅ Connection Accepted! You and ${sender.username} are now connected.</h2>`);

  } catch (error) {
    console.error(error);
    res.status(500).send("Invalid or expired link.");
  }
};

/* -----------------------------------------------------------
   ❌ Reject Request
------------------------------------------------------------ */
const rejectRequestController = async (req, res) => {
  try {
    const { token } = req.params;
    const request = await RequestModel.findOne({ token });

    if (!request) return res.status(400).send("Invalid or expired link.");

    request.status = "rejected";
    await request.save();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const sender = await UserModel.findById(decoded.senderId);

    res.send(`<h2>❌ Connection Request Rejected. You rejected request from ${sender?.username || "user"}.</h2>`);

  } catch (error) {
    console.error(error);
    res.status(500).send("Invalid or expired link.");
  }
};

/* -----------------------------------------------------------
   🔌 Disconnect Users
------------------------------------------------------------ */
const disconnectController = async (req, res) => {
  try {
    const { targetUserId } = req.body;

    const currentUser = await UserModel.findById(req.user._id);
    const targetUser = await UserModel.findById(targetUserId);

    if (!currentUser || !targetUser)
      return res.status(404).json({ success: false, message: "User not found" });

    currentUser.connections = currentUser.connections.filter(
      (id) => id.toString() !== targetUserId
    );

    targetUser.connections = targetUser.connections.filter(
      (id) => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await targetUser.save();

    res.json({ success: true, message: "Disconnected successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error disconnecting" });
  }
};

/* -----------------------------------------------------------
   🔁 Resend Request (Using Resend)
------------------------------------------------------------ */
const resendRequestController = async (req, res) => {
  try {
    const { to } = req.body;
    const from = req.user._id;

    await RequestModel.deleteMany({ from, to, status: "pending" });

    const token = crypto.randomBytes(20).toString("hex");

    const newRequest = new RequestModel({ from, to, token, status: "pending" });
    await newRequest.save();

    const receiver = await UserModel.findById(to);
    const sender = await UserModel.findById(from);

    const acceptLink = `${BASE_URL}/api/alumni/accept-request/${token}`;
    const rejectLink = `${BASE_URL}/api/alumni/reject-request/${token}`;

    // ----------------------------
    // 🚀 Send Email Using RESEND
    // ----------------------------
    await resend.emails.send({
      from: "KIT Alumni <onboarding@resend.dev>",
      to: receiver.email,
      subject: "Resent Connection Request",
      html: `
        <h2>New Connection Request</h2>
        <p><strong>${sender.username}</strong> wants to connect with you again.</p>
        <a href="${acceptLink}" style="padding:10px;background:#4CAF50;color:#fff;text-decoration:none;margin-right:10px;">Accept</a>
        <a href="${rejectLink}" style="padding:10px;background:#f44336;color:#fff;text-decoration:none;">Reject</a>
      `,
    });

    res.json({ success: true, message: "Request resent successfully!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to resend request" });
  }
};

/* ----------------------------------------------------------- */

module.exports = {
  GetAlumniBatchController,
  sendRequestController,
  acceptRequestController,
  rejectRequestController,
  disconnectController,
  resendRequestController,
};
