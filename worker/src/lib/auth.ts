import { SignJWT, jwtVerify } from "jose";

export interface JWTPayload {
  id: number;
  email: string;
  name: string | null;
  role: string;
  jti: string;
}

function getSecret(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

function makeJti(): string {
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  return Array.from(buf).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function signToken(payload: Omit<JWTPayload, "jti">, secret: string, expiresIn = "7d"): Promise<{ token: string; jti: string }> {
  const jti = makeJti();
  const token = await new SignJWT({ ...payload, jti })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret(secret));
  return { token, jti };
}

export async function verifyToken(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(secret));
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}
