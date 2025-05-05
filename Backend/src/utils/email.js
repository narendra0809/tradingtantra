import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (email, otp) => {
  const info = await transporter.sendMail({
    from: "Hello from Trading Tantra Team!",
    to: email,
    subject: "Verify Email",
    text: otp,
  });
  console.log('email',info)
};

export default sendEmail;
