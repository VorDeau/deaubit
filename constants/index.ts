//constants/index.ts

export const SESSION_COOKIE_NAME = "deaubit_session";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const SLUG_BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(
    /\/+$/,
    ""
);

export const RESERVED_SLUGS = new Set([
    "",
    "login",
    "dash",
    "api",
    "register",
    "verify",
    "forgot-password",
    "reset-password",
    "account-deleted",
    "favicon.ico",
    "robots.txt",
    "sitemap.xml",
    "_next",
    "static",
    "images",
]);

