export function generateOTP(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(buf[0] % 900000 + 100000); // always 6 digits, 100000-999999
}

export function otpExpiry(minutes = 15): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

export function isOtpExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt) < new Date();
}
