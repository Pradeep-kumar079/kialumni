const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "KIT Alumni <onboarding@resend.dev>", // Use Resend's default domain
      to,
      subject,
      html,
    });

    if (error) {
      console.error("❌ Email error:", error);
      throw error;
    }

    console.log("✅ Email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw error;
  }
};

module.exports = { sendEmail };