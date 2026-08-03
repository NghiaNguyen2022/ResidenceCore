export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_BASE_PATH = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");

export const toAppUrl = (path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${APP_BASE_PATH}${normalizedPath}`;
};

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  return toAppUrl("/login");
};
