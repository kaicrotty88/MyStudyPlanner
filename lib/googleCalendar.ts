import crypto from "node:crypto";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_API_ROOT = "https://www.googleapis.com/calendar/v3";

export type GoogleTokenPayload = {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
};

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}.`);
  return value;
}

export function googleClientId() { return required("GOOGLE_CALENDAR_CLIENT_ID"); }
export function googleClientSecret() { return required("GOOGLE_CALENDAR_CLIENT_SECRET"); }
export function googleRedirectUri() { return required("GOOGLE_CALENDAR_REDIRECT_URI"); }

function stateSecret() {
  return process.env.GOOGLE_CALENDAR_STATE_SECRET || googleClientSecret();
}

export function createOAuthState(userId: string) {
  const payload = Buffer.from(JSON.stringify({ userId, issuedAt: Date.now() })).toString("base64url");
  const signature = crypto.createHmac("sha256", stateSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyOAuthState(state: string) {
  const [payload, signature] = state.split(".");
  if (!payload || !signature) return null;
  const expected = crypto.createHmac("sha256", stateSecret()).update(payload).digest("base64url");
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { userId: string; issuedAt: number };
    if (!parsed.userId || Date.now() - parsed.issuedAt > 10 * 60 * 1000) return null;
    return parsed;
  } catch { return null; }
}

export function buildGoogleAuthUrl(userId: string) {
  const params = new URLSearchParams({
    client_id: googleClientId(),
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    state: createOAuthState(userId),
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string): Promise<GoogleTokenPayload> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: googleClientId(), client_secret: googleClientSecret(), redirect_uri: googleRedirectUri(), grant_type: "authorization_code" }),
    cache: "no-store",
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error_description || body?.error || "Google token exchange failed.");
  return body as GoogleTokenPayload;
}

export async function refreshGoogleAccessToken(refreshToken: string): Promise<GoogleTokenPayload> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ refresh_token: refreshToken, client_id: googleClientId(), client_secret: googleClientSecret(), grant_type: "refresh_token" }),
    cache: "no-store",
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error_description || body?.error || "Google token refresh failed.");
  return body as GoogleTokenPayload;
}

export async function googleApi<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`${GOOGLE_API_ROOT}${path}`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error?.message || "Google Calendar request failed.");
  return body as T;
}