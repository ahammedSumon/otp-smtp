const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const otps = new Map(); // Stores { email: { otp, expiresAt } }

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // from environment
    pass: process.env.EMAIL_PASS             // Use an "App Password" if 2FA enabled
  },
});

// Send OTP
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otps.set(email, { otp, expiresAt });

  try {
    await transporter.sendMail({
      from: '"OTP Service" <your-email@gmail.com>',
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    });

    res.json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

// Verify OTP
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  const record = otps.get(email);

  if (!record) {
    return res.status(400).json({ success: false, message: "No OTP found for this email" });
  }

  if (Date.now() > record.expiresAt) {
    otps.delete(email);
    return res.status(400).json({ success: false, message: "OTP expired" });
  }

  if (record.otp.toString() !== otp.toString()) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  otps.delete(email);
  res.json({ success: true, message: "OTP verified successfully" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
