// Email via Resend API — https://resend.com

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface MailEnv {
  RESEND_API_KEY?: string;
  MAIL_FROM?: string;
  MAIL_FROM_NAME?: string;
  APP_HOST: string;
}

export async function sendMail(opts: MailOptions, env: MailEnv): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.warn("[mail] RESEND_API_KEY not set — email not sent");
    return;
  }

  const from = env.MAIL_FROM
    ? `${env.MAIL_FROM_NAME ?? "DeauBit"} <${env.MAIL_FROM}>`
    : `DeauBit <noreply@${env.APP_HOST}>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, html: opts.html }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "unknown");
    throw new Error(`Resend error ${res.status}: ${err}`);
  }
}

// ─── Shared email wrapper ────────────────────────────────────

function emailWrap(host: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DeauBit</title>
  <style>
    body { margin: 0; padding: 0; background-color: #1a1a1a; font-family: monospace; }
    .wrapper { padding: 32px 16px; }
    .card {
      background-color: #0a0a0a;
      border: 1px solid #262626;
      border-radius: 16px;
      padding: 32px;
      max-width: 480px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }
    .tag { font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #a3e635; margin-bottom: 24px; }
    .host { color: #888; }
    h2 { font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.03em; color: #f0f0f0; margin: 0 0 8px; }
    .sub { font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #888; margin-bottom: 24px; }
    .otp-box {
      background: #141414;
      border: 1px solid #262626;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 0.4em;
      margin-bottom: 20px;
    }
    .btn {
      display: inline-block;
      background-color: #a3e635;
      color: #0a0a0a !important;
      font-weight: 900;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      padding: 14px 28px;
      border-radius: 9999px;
      text-decoration: none;
      margin-bottom: 20px;
    }
    .btn-danger { background-color: #ef4444; color: #ffffff !important; }
    .note { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; line-height: 1.6; }
    @media (max-width: 520px) {
      .card { padding: 24px 20px; border-radius: 12px; }
      .otp-box { font-size: 28px; letter-spacing: 0.3em; padding: 20px 16px; }
      h2 { font-size: 18px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="tag">DeauBit <span class="host">/ ${host}</span></div>
      ${content}
    </div>
  </div>
</body>
</html>`;
}

// ─── Email Templates ────────────────────────────────────────

export function otpEmail(otp: string, host: string): string {
  return emailWrap(host, `
    <h2>Verify Account</h2>
    <div class="sub">IDENTITY_VERIFICATION_CODE</div>
    <div class="otp-box" style="color: #a3e635;">${otp}</div>
    <p class="note">Expires in 15 minutes. Do not share this code.</p>
  `);
}

export function resetEmail(link: string, host: string): string {
  return emailWrap(host, `
    <h2>Reset Password</h2>
    <div class="sub">ACCESS_KEY_ROTATION</div>
    <p style="font-size:13px;color:#888;margin-bottom:20px;line-height:1.6;">A password reset was requested for your DeauBit account. Click below to set a new password.</p>
    <a href="${link}" class="btn">Reset Password</a>
    <br>
    <p class="note">Link expires in 1 hour. If you didn't request this, ignore this email.</p>
  `);
}

export function abuseDeleteEmail(deleteLink: string, slug: string, host: string): string {
  return emailWrap(host, `
    <h2 style="color:#ef4444;">Abuse Report</h2>
    <div class="sub">SECURITY_ALERT</div>
    <p style="font-size:13px;color:#888;margin-bottom:8px;">An abuse report was filed for:</p>
    <p style="font-family:monospace;color:#a3e635;font-size:14px;font-weight:900;margin-bottom:20px;">/${slug}</p>
    <a href="${deleteLink}" class="btn btn-danger">Delete Link</a>
    <br>
    <p class="note">Click to permanently remove this link from DeauBit.</p>
  `);
}

export function deleteAccountEmail(otp: string, host: string): string {
  return emailWrap(host, `
    <h2 style="color:#ef4444;">Confirm Deletion</h2>
    <div class="sub">ACCOUNT_TERMINATION_CODE</div>
    <div class="otp-box" style="color:#ef4444;">${otp}</div>
    <p class="note">Expires in 15 minutes. This will permanently delete your account and all data.</p>
  `);
}
