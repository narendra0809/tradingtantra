import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "tradingtantra47@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: '"Trading Tantra Team" <tradingtantra47@gmail.com>',
      to: email,
      subject: "Verify Email",
      text: `Your OTP is: ${otp}`,
    });
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendEmail;
