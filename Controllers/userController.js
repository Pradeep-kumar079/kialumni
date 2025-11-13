const UserModel = require("../Models/UserModel");
const OtpModel = require("../Models/OtpModel");
const PostModel = require("../Models/PostModel");
const BatchModel = require("../Models/BatchModel");
const FeedBackModel = require("../Models/FeedBackform");
const nodemailer = require("nodemailer");

const SibApiV3Sdk = require("sib-api-v3-sdk");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");
// ==================== SEND OTP ==================== //


 
// ==================== SEND OTP ==================== //
const sendOtpController = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("📩 Received OTP request for:", email); // 👈 ADD THIS LINE

    if (!email)
      return res.status(400).json({ success: false, message: "Email is required" });

    const user = await UserModel.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    await OtpModel.findOneAndUpdate(
      { email },
      { otp, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user:  process.env.EMAIL_USER || "pradeepk9348@gmail.com",
        pass: process.env.EMAIL_PASS || "kycjndaberbichuz",
      },
    });
    console.log("Using email:", process.env.EMAIL_USER ? "loaded" : "not loaded");
    console.log("Using password:", process.env.EMAIL_PASS ? "loaded" : "not loaded");

    await transporter.sendMail({
      from: `"KIT Alumni" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for KIT Alumni Registration",
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    });

    console.log("✅ OTP sent successfully to:", email);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ OTP Error:", error);
      console.error("❌ OTP sending failed:", error.message || error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send OTP. Please try again." });
  }
};




// ✅ Verify OTP
const verifyOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("🟢 VERIFY REQUEST:", { email, otp });

    const record = await OtpModel.findOne({ email });

    if (!record) {
      console.log("⚠️ No record found for email");
      return res.status(400).json({ success: false, message: "OTP not found or expired" });
    }

    console.log("🟠 DB OTP:", record.otp, "| Type:", typeof record.otp);
    console.log("🔵 Entered OTP:", otp, "| Type:", typeof otp);

    if (String(record.otp).trim() !== String(otp).trim()) {
      console.log("❌ Mismatch -> OTP Invalid");
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    await OtpModel.deleteOne({ email });
    console.log("✅ OTP Verified Successfully");
    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("❌ OTP verify error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ================= REGISTER CONTROLLER ================= //
const RegisterController = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      branch,
      admissionyear,
      lateralEntry = false,
      mobileno,
      usn,
      dob,
    } = req.body;

    // ✅ Validate all required fields
    if (!username || !email || !password || !branch || !admissionyear || !usn) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ✅ Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { usn: usn.toUpperCase() }],
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or USN already exists",
      });
    }

    // ✅ Determine role based on year
    const currentYear = new Date().getFullYear();
    const courseDuration = lateralEntry ? 3 : 4;
    const role =
      Number(admissionyear) + courseDuration <= currentYear
        ? "alumni"
        : "student";
    const batchYear = lateralEntry
      ? Number(admissionyear) - 1
      : Number(admissionyear);

    // ✅ Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create new user
    const newUser = new UserModel({
      userimg: req.file ? req.file.path : "uploads/default.jpg",
      username,
      email,
      password: hashedPassword,
      branch,
      admissionyear,
      batchYear,
      lateralEntry,
      role,
      mobileno,
      usn: usn.toUpperCase(),
      dob,
    });

    const savedUser = await newUser.save();

    // ✅ Remove password before sending
    const userWithoutPassword = savedUser.toObject();
    delete userWithoutPassword.password;

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("❌ Register Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error during registration" });
  }
};



// ================= LOGIN CONTROLLER ================= //
const LoginController = async (req, res) => {
  try {
    const { usn, password } = req.body;

    if (!usn || !password)
      return res
        .status(400)
        .json({ success: false, message: "USN and password are required" });

    const user = await UserModel.findOne({ usn: usn.toUpperCase() });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Remove password from response
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      role: user.role, // ✅ explicit role
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error during login" });
  }
};




// ==================== POSTS ==================== //
const PostController = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { title, description, tags } = req.body;
    const newPost = new PostModel({
      title,
      description,
      postimg: req.file ? req.file.filename : null,
      hashtags: tags ? tags.split(",").map(tag => tag.trim()) : [],
      user: req.user.id,
    });
    await newPost.save();
    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const allPostsController = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .populate("user", "username email userimg")
      .populate("likes", "username")

      .sort({ createdAt: -1 })
      .exec();
    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.log("Fetch Posts Error:", error);
    res.status(500).json({ success: false, message: "Error fetching posts" });
  }
};

const GetSinglePost = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id).populate("user");
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== LIKE & COMMENT ==================== //
const FetchLikes = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    const userId = req.user.id;
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }
    await post.save();
    res.json({ success: true, updatedLikes: post.likes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const FetchComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!comment?.trim()) return res.status(400).json({ success: false, message: "Comment cannot be empty" });

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY;
    let toxicity = 0;
    try {
      const analyzeRes = await axios.post(
        `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_API_KEY}`,
        { comment: { text: comment }, languages: ["en"], requestedAttributes: { TOXICITY: {} } }
      );
      toxicity = analyzeRes.data.attributeScores.TOXICITY.summaryScore.value;
    } catch {
      toxicity = 0;
    }
    if (toxicity > 0.6)
      return res.status(400).json({ success: false, message: "Comment rejected due to inappropriate language." });

    const post = await PostModel.findById(id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    post.comments.push({ text: comment.trim(), user: userId, username: user.username, createdAt: new Date() });
    await post.save();
    res.json({ success: true, updatedComments: post.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ==================== PROFILE ==================== //
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId; // ✅ Correct param name
    const user = await UserModel.findById(userId).select("-password");
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const posts = await PostModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "username userimg");

    res.status(200).json({ success: true, user, posts });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getUserConnections = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId)
      return res.status(400).json({ success: false, message: "User ID missing" });

    const user = await UserModel.findById(userId).select("-password");
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const connections = await UserModel.find({
      _id: { $in: user.connections || [] },
    }).select("username userimg email usn");

    res.status(200).json({ success: true, user, connections });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const GetUser = async (req, res) => {
  try {
    console.log("req.user:", req.user); // should show user details
    const user = await UserModel.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// ==================== FEEDBACK ==================== //
const FeedbackController = async (req, res) => {
  try {
    const newFeedback = new FeedBackModel({
      username: req.user.id,
      feedback: req.body.feedback,
    });

    await newFeedback.save();
    res.json({ success: true, message: "Feedback submitted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== EXPORTS ==================== //
module.exports = {
  RegisterController,
  sendOtpController,
  verifyOtpController,
  LoginController,
  PostController,
  allPostsController,
  GetSinglePost,
  FetchLikes,
  FetchComments,
  getUserProfile,
  getUserConnections,
  GetUser,
  FeedbackController,
};
