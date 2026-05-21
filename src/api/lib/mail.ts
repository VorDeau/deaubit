export interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface MailEnv {
  APP_HOST: string;
  AUTH_URL: string;
  SERVICE_SECRET: string;
}

export async function sendMail(opts: MailOptions, env: MailEnv): Promise<void> {
  const res = await fetch(`${env.AUTH_URL}/email/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Service-Key": env.SERVICE_SECRET,
    },
    body: JSON.stringify({ to: opts.to, subject: opts.subject, html: opts.html }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "unknown");
    throw new Error(`Mail service error ${res.status}: ${err}`);
  }
}

export function abuseDeleteEmail(deleteLink: string, slug: string, host: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
body{margin:0;padding:32px 16px;background:#1a1a1a;font-family:monospace}
.card{background:#0a0a0a;border:1px solid #262626;border-radius:16px;padding:32px;max-width:480px;margin:0 auto}
.tag{font-size:10px;text-transform:uppercase;letter-spacing:.2em;color:#a3e635;margin-bottom:24px}
h2{font-size:20px;font-weight:900;text-transform:uppercase;color:#ef4444;margin:0 0 8px}
.sub{font-size:10px;text-transform:uppercase;letter-spacing:.15em;color:#888;margin-bottom:24px}
.slug{font-family:monospace;color:#a3e635;font-size:14px;font-weight:900;margin-bottom:20px}
.btn{display:inline-block;background:#ef4444;color:#fff;font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:.15em;padding:14px 28px;border-radius:9999px;text-decoration:none;margin-bottom:20px}
.note{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#555;line-height:1.6}
</style></head><body><div class="card">
<div class="tag">DeauBit / ${host}</div>
<h2>Abuse Report</h2>
<div class="sub">SECURITY_ALERT</div>
<p style="font-size:13px;color:#888;margin-bottom:8px">An abuse report was filed for:</p>
<p class="slug">/${slug}</p>
<a href="${deleteLink}" class="btn">Delete Link</a>
<br>
<p class="note">Click to permanently remove this link from DeauBit.</p>
</div></body></html>`;
}
