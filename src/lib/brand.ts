export const BRAND = {
  name: "Keyterminus",
  domain: "keyterminus.com",
  tagline: "Game keys for every platform, delivered to your account",
} as const;

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || `https://${BRAND.domain}`).replace(/\/+$/, "");
export const COMPANY_REGISTERED = true;

export function getBaseUrl(): string {
  return (process.env.APP_URL?.trim() || SITE_URL).replace(/\/+$/, "");
}
