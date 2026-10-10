// src/config/cookies.ts
const isProd = process.env.NODE_ENV === "production";

export const cookieBase = {
  httpOnly: true,
  secure: isProd,
  sameSite: "strict" as const,
  domain: isProd ? process.env.COOKIE_DOMAIN : undefined, // e.g. ".yourdomain.com"
};
export const accessCookieOptions = { ...cookieBase, maxAge: 15 * 60 * 1000 };
export const refreshCookieOptions = {
  ...cookieBase,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
export const csrfCookieOptions = { ...cookieBase, httpOnly: false };
