import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";

const app = express();

// Enable CORS for all origins
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Simple request logger (optional)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.post("/send-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "maksudor18@cse.pstu.ac.bd",
        pass: "oaas mkja ceuz tgur", // Please keep this secret and consider using environment variables
      },
    });

    await transporter.sendMail({
      from: `"MediCampus" <maksudor18@cse.pstu.ac.bd>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px;">
          <h2>Your OTP Code</h2>
          <p>Please use the following OTP to complete your sign up process:</p>
          <div style="font-size: 24px; font-weight: bold; margin: 20px 0;">${otp}</div>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    });

    return res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
