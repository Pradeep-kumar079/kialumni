const User = require("../Models/UserModel");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { Resend } = require("resend");

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// ===============================================
// ✅ Send Reset Link (Using Resend instead of Nodemailer)
// ===============================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    // Create token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    // Send email with Resend
    await resend.emails.send({
      from: "Alumni Support <onboarding@resend.dev>",
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2>Hello ${user.username || "User"},</h2>
        <p>You requested a password reset.</p>
        <p>Click the button below to reset your password (valid for 10 minutes):</p>
        <a href="${resetUrl}" 
          style="background:#007bff;color:white;padding:10px 15px;border-radius:5px;text-decoration:none;">
          Reset Password
        </a>
        <p>If you didn’t request this, please ignore this email.</p>
      `,
    });

    res.json({ success: true, message: "Reset link sent to email!" });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ===============================================
// ✅ Reset Password (No Changes Needed)
// ===============================================
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successfully!" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
