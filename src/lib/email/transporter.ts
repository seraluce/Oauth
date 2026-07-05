import nodemailer from "nodemailer";

let _transporter: nodemailer.Transporter | null = null;

export function getTransporter(): nodemailer.Transporter | null {
  const mode = process.env.EMAIL_MODE || "console";
  if (mode !== "smtp") return null;

  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return _transporter;
}
