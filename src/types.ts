export interface ApiResponse {
  success?: boolean;
  error?: string;
  [key: string]: unknown;
}

export interface LoginResponse extends ApiResponse {
  retryAfter?: number;
}

export interface PublicLinkResponse extends ApiResponse {
  shortUrl: string;
}

export interface SessionResponse extends ApiResponse {
  authenticated: boolean;
  name?: string;
  role?: string;
}

export interface ShortlinkResult {
  slug: string;
  shortUrl: string;
}

export interface SetupStatusResponse {
  initialized: boolean;
}
