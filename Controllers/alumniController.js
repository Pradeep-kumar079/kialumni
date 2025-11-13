const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Request = require("../Models/RequestModel");
const UserModel = require("../Models/UserModel");

// ✅ Use localhost for local testing
const BASE_URL = "https://kialumni-1.onrender.com";

/* ------------------------------------------------------------------
   ✅ Send Connection Request
------------------------------------------------------------------ */
exports.sendRequestController = async (req, res) => {
  try {
    const { to } = req.body;

    // Prevent duplicate requests
    const existing = await Request.findOne({ from: req.user._id, to });
    if (existing) {
      return res.status(400).json({ success: false, message: "Request already sent" });
    }

    // Generate unique token
    const token = crypto.randomBytes(20).toString("hex");

    const newRequest = new Request({
      from: req.user._id,
      to,
      token,
      status: "pending",
    });

    await newRequest.save();

    const receiver = await UserModel.findById(to);
    if (!receiver)
      return res.status(404).json({ success: false, message: "Receiver not found" });

    const sender = await UserModel.findById(req.user._id);

    // ✅ Setup mailer (Gmail)
    const transporter = nodemailer.createTransport({
 host: "smtp.gmail.com",
      port: 465,
      secure: true,
            auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const acceptLink = `https://kialumni-1.onrender.com/api/alumni/accept-request/${token}`;
    const rejectLink = `https://kialumni-1.onrender.com/api/alumni/reject-request/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: receiver.email,
      subject: "New Alumni Connection Request",
      html: `
        <h2>New Connection Request</h2>
        <p><strong>${sender.username}</strong> wants to connect with you.</p>
        <div style="margin-top:10px;">
          <a href="${acceptLink}" style="padding:10px;background:#4CAF50;color:#fff;text-decoration:none;margin-right:10px;">Accept</a>
          <a href="${rejectLink}" style="padding:10px;background:#f44336;color:#fff;text-decoration:none;">Reject</a>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Request sent successfully" });
  } catch (error) {
    console.error("❌ sendRequestController Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------------------------------------------------------
   ✅ Accept Connection Request (via email link)
------------------------------------------------------------------ */
exports.acceptRequestController = async (req, res) => {
  try {
    const { token } = req.params;
    const request = await Request.findOne({ token }).populate("from to");

    if (!request) {
      return res.status(404).json({ success: false, message: "Invalid or expired link" });
    }

    request.status = "connected";
    await request.save();

    await UserModel.findByIdAndUpdate(request.from._id, {
      $addToSet: { connections: request.to._id },
    });

    await UserModel.findByIdAndUpdate(request.to._id, {
      $addToSet: { connections: request.from._id },
    });

    res.json({ success: true, message: "Connection accepted successfully" });
  } catch (error) {
    console.error("❌ acceptRequestController Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------------------------------------------------------
   ✅ Reject Connection Request (via email link)
------------------------------------------------------------------ */
exports.rejectRequestController = async (req, res) => {
  try {
    const { token } = req.params;
    const request = await Request.findOne({ token });

    if (!request) {
      return res.status(404).json({ success: false, message: "Invalid or expired link" });
    }

    request.status = "rejected";
    await request.save();

    res.json({ success: true, message: "Connection request rejected" });
  } catch (error) {
    console.error("❌ rejectRequestController Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------------------------------------------------------
   ✅ Disconnect Alumni Connection
------------------------------------------------------------------ */
exports.disconnectController = async (req, res) => {
  try {
    const { userId } = req.body;

    await UserModel.findByIdAndUpdate(req.user._id, {
      $pull: { connections: userId },
    });

    await UserModel.findByIdAndUpdate(userId, {
      $pull: { connections: req.user._id },
    });

    res.json({ success: true, message: "Disconnected successfully" });
  } catch (error) {
    console.error("❌ disconnectController Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------------------------------------------------------
   ✅ Get Alumni Batches (Group by batchYear)
------------------------------------------------------------------ */
exports.GetAlumniBatchController = async (req, res) => {
  try {
    // Get all alumni (not students)
    const alumni = await UserModel.find({ role: "alumni" }).select(
      "username email branch usn batchYear role connections userimg"
    );

    // ✅ Group by batchYear
    const grouped = {};
    alumni.forEach((a) => {
      if (!grouped[a.batchYear]) grouped[a.batchYear] = [];
      grouped[a.batchYear].push(a);
    });

    // ✅ Convert to array format
    const batches = Object.keys(grouped).map((year) => ({
      batchYear: year,
      alumni: grouped[year],
    }));

    res.json({ success: true, batches });
  } catch (error) {
    console.error("❌ GetAlumniBatchController Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.resendRequestController = async (req, res) => {
  try {
    const { to } = req.body;
    const from = req.user._id;

    // 🔹 Delete existing pending request if exists
    await RequestModel.deleteMany({ from, to, status: "pending" });

    // 🔹 Create new request
    const token = crypto.randomBytes(20).toString("hex");
    const newRequest = new RequestModel({ from, to, token, status: "pending" });
    await newRequest.save();

    const receiver = await UserModel.findById(to);
    const sender = await UserModel.findById(from);

    // 🔹 Send email again
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const acceptLink = `${BASE_URL}/api/alumni/accept-request/${token}`;
    const rejectLink = `${BASE_URL}/api/alumni/reject-request/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: receiver.email,
      subject: "Resent Connection Request",
      html: `<h2>New Connection Request</h2>
             <p><strong>${sender.username}</strong> wants to connect with you.</p>
             <a href="${acceptLink}" style="padding:10px;background:#4CAF50;color:#fff;text-decoration:none;margin-right:10px;">Accept</a>
             <a href="${rejectLink}" style="padding:10px;background:#f44336;color:#fff;text-decoration:none;">Reject</a>`
    });

    res.json({ success: true, message: "Request resent successfully!" });
  } catch (error) {
    console.error("❌ Resend Request Error:", error);
    res.status(500).json({ success: false, message: "Failed to resend request" });
  }
};

