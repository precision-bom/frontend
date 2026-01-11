import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@example.com";
const APP_NAME = "PrecisionBOM";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!SENDGRID_API_KEY) {
    console.log("SendGrid not configured. Email would be sent:", options);
    return true; // Allow development without SendGrid
  }

  try {
    await sgMail.send({
      to: options.to,
      from: FROM_EMAIL,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<boolean> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  return sendEmail({
    to: email,
    subject: `Reset your ${APP_NAME} password`,
    text: `
Reset your password

You requested a password reset for your ${APP_NAME} account.

Click here to reset your password: ${resetUrl}

This link expires in 1 hour.

If you didn't request this, you can safely ignore this email.

- The ${APP_NAME} Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; background-color: #0a0a0a; color: #e5e5e5; padding: 40px 20px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #171717; border: 1px solid #2a2a2a; border-radius: 8px; overflow: hidden;">
    <div style="background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%); padding: 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #0a0a0a; letter-spacing: -0.025em;">RESET PASSWORD</h1>
    </div>
    <div style="padding: 32px;">
      <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #a3a3a3;">
        You requested a password reset for your <span style="color: #22c55e;">${APP_NAME}</span> account.
      </p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #22c55e; color: #0a0a0a; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; margin: 8px 0 24px;">
        Reset Password →
      </a>
      <p style="margin: 0; font-size: 12px; color: #737373;">
        This link expires in 1 hour. If you didn't request this, ignore this email.
      </p>
    </div>
    <div style="background-color: #0f0f0f; padding: 16px 32px; border-top: 1px solid #2a2a2a;">
      <p style="margin: 0; font-size: 11px; color: #525252; text-align: center;">
        ${APP_NAME} — Precision sourcing for every component.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  });
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<boolean> {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  return sendEmail({
    to: email,
    subject: `Verify your ${APP_NAME} account`,
    text: `
Welcome to ${APP_NAME}!

Please verify your email address to get started.

Click here to verify: ${verifyUrl}

This link expires in 24 hours.

- The ${APP_NAME} Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; background-color: #0a0a0a; color: #e5e5e5; padding: 40px 20px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #171717; border: 1px solid #2a2a2a; border-radius: 8px; overflow: hidden;">
    <div style="background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%); padding: 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #0a0a0a; letter-spacing: -0.025em;">VERIFY EMAIL</h1>
    </div>
    <div style="padding: 32px;">
      <p style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #e5e5e5;">
        Welcome to ${APP_NAME}
      </p>
      <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #a3a3a3;">
        Click below to verify your email and start sourcing.
      </p>
      <a href="${verifyUrl}" style="display: inline-block; background-color: #22c55e; color: #0a0a0a; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; margin: 8px 0 24px;">
        Verify Email →
      </a>
      <p style="margin: 0; font-size: 12px; color: #737373;">
        This link expires in 24 hours.
      </p>
    </div>
    <div style="background-color: #0f0f0f; padding: 16px 32px; border-top: 1px solid #2a2a2a;">
      <p style="margin: 0; font-size: 11px; color: #525252; text-align: center;">
        ${APP_NAME} — Precision sourcing for every component.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  });
}

export async function sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Welcome to ${APP_NAME}`,
    text: `
Welcome${name ? ` ${name}` : ""}!

Your ${APP_NAME} account is ready. Start uploading BOMs and get intelligent sourcing suggestions.

Get started: ${APP_URL}/app

- The ${APP_NAME} Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; background-color: #0a0a0a; color: #e5e5e5; padding: 40px 20px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #171717; border: 1px solid #2a2a2a; border-radius: 8px; overflow: hidden;">
    <div style="background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%); padding: 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #0a0a0a; letter-spacing: -0.025em;">WELCOME</h1>
    </div>
    <div style="padding: 32px;">
      <p style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #e5e5e5;">
        ${name ? `Hey ${name}!` : "Hey there!"}
      </p>
      <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #a3a3a3;">
        Your account is ready. Upload your first BOM and let our AI find the best parts at the best prices.
      </p>
      <a href="${APP_URL}/app" style="display: inline-block; background-color: #22c55e; color: #0a0a0a; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; margin: 8px 0 24px;">
        Open Dashboard →
      </a>
    </div>
    <div style="background-color: #0f0f0f; padding: 16px 32px; border-top: 1px solid #2a2a2a;">
      <p style="margin: 0; font-size: 11px; color: #525252; text-align: center;">
        ${APP_NAME} — Precision sourcing for every component.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  });
}
