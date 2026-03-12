//lib/validation.ts

import { RESERVED_SLUGS } from "@/constants";

export function isValidSlug(slug: string): boolean {
    if (!slug || typeof slug !== "string") return false;
    if (RESERVED_SLUGS.has(slug)) return false;

    const slugRegex = /^[a-zA-Z0-9_-]+$/;
    return slugRegex.test(slug);
}

export function sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, "");
}

export function sanitizeAndValidateUrl(url: string): string | null {
    if (!url || typeof url !== "string") return null;
    
    let cleaned = url.trim();

    if (!/^https?:\/\//i.test(cleaned)) {
        cleaned = "https://" + cleaned;
    }

    try {
        const parsed = new URL(cleaned);
        if (!["http:", "https:"].includes(parsed.protocol)) return null;
        if (parsed.hostname.length < 3) return null;
        if (!parsed.hostname.includes(".")) return null;
        
        return parsed.toString();
    } catch {
        return null;
    }
}
