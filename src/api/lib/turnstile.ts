export async function verifyTurnstile(token: string, secretKey: string, ip?: string): Promise<boolean> {
  if (!secretKey) {
    console.error("[turnstile] TURNSTILE_SECRET_KEY is not set");
    return false;
  }

  const params: Record<string, string> = {
    secret: secretKey,
    response: token,
  };
  if (ip) params.remoteip = ip;

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });

  if (!res.ok) {
    console.error("[turnstile] siteverify HTTP error:", res.status);
    return false;
  }

  const data = await res.json() as { success: boolean; "error-codes"?: string[] };

  if (!data.success) {
    console.error("[turnstile] verification failed, error-codes:", data["error-codes"]);
  }

  return data.success === true;
}
