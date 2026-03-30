//lib/mail.ts

import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2"
  },
  requireTLS: Number(process.env.SMTP_PORT) === 587,
  debug: true,
  logger: true
});

function getEmailTemplate(title: string, bodyContent: string, isDanger = false) {
  const accentColor = isDanger ? "#dc2626" : "#4f46e5";
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e4e4e7; }
        .header { background-color: ${accentColor}; padding: 24px; text-align: center; color: white; }
        .content { padding: 32px 24px; color: #1f2937; line-height: 1.6; }
        .otp-box { background-color: #f3f4f6; border: 1px dashed ${accentColor}; color: ${accentColor}; font-size: 28px; font-weight: 700; text-align: center; padding: 16px; margin: 24px 0; letter-spacing: 4px; }
        .footer { background-color: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>DeauBit</h1></div>
        <div class="content">
          <h2 style="color: ${accentColor};">${title}</h2>
          ${bodyContent}
        </div>
        <div class="footer"><p>&copy; ${new Date().getFullYear()} DeauBit</p></div>
      </div>
    </body>
    </html>
  `;
}

async function safeSendMail(options: nodemailer.SendMailOptions) {
    try {
        const fromRaw = process.env.SMTP_FROM || process.env.SMTP_USER || "";
        const fromClean = fromRaw.replace(/["\\]/g, "").trim();
        
        console.log(`[SMTP] Attempting to send email to: ${options.to}`);
        const info = await transporter.sendMail({
            ...options,
            from: fromClean.includes("<") ? fromClean : `"${fromClean}" <${process.env.SMTP_USER}>`,
        });
        console.log(`[SMTP] Success! MessageID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`[SMTP] FAILED to send email to ${options.to}:`, error);
        throw error;
    }
}

export async function sendVerificationEmail(email: string, otp: string) {
  const htmlContent = `
    <p>Please verify your email address to complete your registration.</p>
    <div class="otp-box">${otp}</div>
  `;
  return await safeSendMail({
    to: email,
    subject: `Verify your email - DeauBit`,
    html: getEmailTemplate("Registration Verification", htmlContent),
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const appHost = process.env.NEXT_PUBLIC_APP_HOST || "localhost:3000";
  const protocol = process.env.NEXT_PUBLIC_PROTOCOL || "http";
  const resetLink = `${protocol}://${appHost}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  const htmlContent = `
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>
  `;
  return await safeSendMail({
    to: email,
    subject: "Reset Password - DeauBit",
    html: getEmailTemplate("Password Reset", htmlContent),
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  const htmlContent = `<p>Welcome, <strong>${name}</strong>! Your account is now active.</p>`;
  return await safeSendMail({
    to: email,
    subject: "Welcome to DeauBit! 🚀",
    html: getEmailTemplate("Account Verified", htmlContent),
  });
}

export async function sendAccountDeletedEmail(email: string, name: string) {
  const htmlContent = `<p>Hi ${name}, your account has been deleted.</p>`;
  return await safeSendMail({
    to: email,
    subject: "Account Deleted",
    html: getEmailTemplate("Goodbye", htmlContent),
  });
}

export async function sendAdminVerificationEmail(email: string, otp: string) {
  const htmlContent = `
    <p><strong>Admin Setup Verification</strong></p>
    <div class="otp-box">${otp}</div>
  `;
  return await safeSendMail({
    to: email,
    subject: `Admin Verification Code: ${otp}`,
    html: getEmailTemplate("Confirm Admin Setup", htmlContent, true), 
  });
}

export async function sendAdminWelcomeEmail(email: string, name: string) {
  const htmlContent = `<p>Administrator access has been granted to <strong>${name}</strong>.</p>`;
  return await safeSendMail({
    to: email,
    subject: "Admin Access Granted",
    html: getEmailTemplate("Setup Complete", htmlContent),
  });
}

export async function sendAdminDeletionCodeEmail(email: string, otp: string) {
  const htmlContent = `
    <p><strong>Reset Confirmation</strong></p>
    <div class="otp-box" style="color: #dc2626; border-color: #dc2626;">${otp}</div>
  `;
  return await safeSendMail({
    to: email,
    subject: `Reset Confirmation Code: ${otp}`,
    html: getEmailTemplate("Critical Action", htmlContent, true),
  });
}

export async function sendAdminGoodbyeEmail(email: string, name: string) {
  const htmlContent = `<p>The system database has been cleared by ${name}.</p>`;
  return await safeSendMail({
    to: email,
    subject: "System Reset Successful",
    html: getEmailTemplate("Reset Complete", htmlContent, true),
  });
}

export async function sendAbuseReportEmail(data: { linkUrl: string; reason: string; details: string; reporter: string; adminEmail?: string; }) {
  const targetEmail = data.adminEmail || process.env.SMTP_USER || "";
  let slug = "";
  try { 
    const urlParts = new URL(data.linkUrl); 
    slug = urlParts.pathname.replace(/^\//, ""); 
  } catch {}
  
  const deleteToken = jwt.sign({ slug, action: 'delete_abuse' }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  const appHost = process.env.NEXT_PUBLIC_APP_HOST || "localhost:3000";
  const protocol = process.env.NEXT_PUBLIC_PROTOCOL || "http";
  const deleteLink = `${protocol}://${appHost}/admin/delete?slug=${slug}&token=${deleteToken}`;
  
  const htmlContent = `
    <p><strong>User Report</strong></p>
    <p>URL: ${data.linkUrl}</p>
    <p>Reason: ${data.reason}</p>
    <a href="${deleteLink}">Review & Delete</a>
  `;
  return await safeSendMail({ 
      to: targetEmail, 
      subject: `Link Review Request: /${slug || 'Unknown'}`, 
      html: getEmailTemplate("Report Received", htmlContent), 
  });
}
