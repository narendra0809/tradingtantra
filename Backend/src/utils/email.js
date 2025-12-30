import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL,          // ✅ FROM ENV
    pass: process.env.EMAIL_PASSWORD, // ✅ APP PASSWORD
  },
});

const sendEmail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"Trading Tantra Team" <${process.env.EMAIL}>`,
      to: email,
      subject: "Password Reset OTP",
      html: `
        <h2>Password Reset</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      `,
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email send failed:", error.message);
    throw new Error("Email not sent");
  }
};

export default sendEmail;
