import * as nodemailer from "nodemailer";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM = process.env.SMTP_FROM || '"Kesariya" <noreply@kesariya.com>';

export async function sendOtpEmail(to: string, otp: string, subject: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`\n========================================`);
    console.log(`[DEV MODE] OTP for ${to} (${subject}): ${otp}`);
    console.log(`========================================\n`);
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: FROM,
      to,
      subject,
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
      html: `<p>Your OTP is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email via SMTP:", error);
    console.log(`[FALLBACK] Generated OTP for ${to}: ${otp}`);
  }
}

export async function sendRegistrationOtp(to: string, otp: string) {
  return sendOtpEmail(to, otp, "Verify your Kesariya Account");
}

export async function sendForgotPasswordOtp(to: string, otp: string) {
  return sendOtpEmail(to, otp, "Password Reset OTP - Kesariya");
}
