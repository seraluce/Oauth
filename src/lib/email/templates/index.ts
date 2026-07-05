export function verificationEmailTemplate(code: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">Verification Code</h2>
      <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        Your verification code is:
      </p>
      <div style="background: #f5f5f5; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; text-align: center;">
        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; font-family: monospace;">${code}</span>
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">
        This code expires in 10 minutes. Do not share this code with anyone.
      </p>
    </div>
  `;
}

export function passwordResetEmailTemplate(code: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">Password Reset</h2>
      <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        Your password reset code is:
      </p>
      <div style="background: #f5f5f5; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; text-align: center;">
        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; font-family: monospace;">${code}</span>
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">
        This code expires in 10 minutes. If you did not request this, please ignore this email.
      </p>
    </div>
  `;
}
