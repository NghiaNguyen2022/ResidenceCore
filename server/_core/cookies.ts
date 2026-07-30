import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isLocalhost(host: string | undefined) {
  if (!host) return false;
  return LOCAL_HOSTS.has(host) || isIpAddress(host);
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const hostname = req.hostname;
  const isLocal = isLocalhost(hostname);
  const isSecure = isSecureRequest(req);
  const cookiePath = process.env.COOKIE_PATH || "/";

  console.log("[Cookies] Hostname:", hostname);
  console.log("[Cookies] Is localhost:", isLocal);
  console.log("[Cookies] Is secure:", isSecure);

  // For localhost/development: use lax sameSite with secure: false
  // For production: use none sameSite with secure: true
  if (isLocal) {
    console.log("[Cookies] Using development cookie options");
    return {
      httpOnly: true,
      path: cookiePath,
      sameSite: "lax",
      secure: false,
    };
  }

  // Production settings
  console.log("[Cookies] Using production cookie options");
  return {
    httpOnly: true,
    path: cookiePath,
    sameSite: "none",
    secure: true,
  };
}
