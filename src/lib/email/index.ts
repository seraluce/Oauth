import { getTransporter } from "./transporter";
import {
  verificationEmailTemplate,
  passwordResetEmailTemplate,
} from "./templates";

const FROM = process.env.EMAIL_FROM || "noreply@example.com";
const MODE = process.env.EMAIL_MODE || "console";

export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<void> {
  const subject = "Your Verification Code";
  const html = verificationEmailTemplate(code);

  if (MODE === "console") {
    console.log(`\n[EMAIL] To: ${email}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    console.log(`[EMAIL] Code: ${code}\n`);
    return;
  }

  const transporter = getTransporter();
  if (!transporter) return;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject,
    html,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  code: string
): Promise<void> {
  const subject = "Password Reset Code";
  const html = passwordResetEmailTemplate(code);

  if (MODE === "console") {
    console.log(`\n[EMAIL] To: ${email}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    console.log(`[EMAIL] Code: ${code}\n`);
    return;
  }

  const transporter = getTransporter();
  if (!transporter) return;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject,
    html,
  });
}
