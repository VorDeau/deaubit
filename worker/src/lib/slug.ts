const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
const RESERVED = new Set(["api", "dash", "admin", "register", "verify", "login", "setup", "report", "terms", "privacy", "forgot-password", "reset-password", "account-deleted", "_next", "favicon.ico", "icon"]);

export function generateSlug(length = 6): string {
  const buf = new Uint8Array(length);
  crypto.getRandomValues(buf);
  return Array.from(buf).map(b => CHARS[b % CHARS.length]).join("");
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED.has(slug.toLowerCase());
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{1,49}$/.test(slug) && !isReservedSlug(slug);
}
