import { COOKIE_NAME } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export type SessionPayload = {
  userId: number;
  username: string;
  name: string;
};

class SDKServer {
  private getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }

  /**
   * Create a session token for a local auth user
   */
  async createSessionToken(
    userId: number,
    username: string,
    options: { expiresInMs?: number; name?: string } = {}
  ): Promise<string> {
    return this.signSession(
      {
        userId,
        username,
        name: options.name || "",
      },
      options
    );
  }

  async signSession(
    payload: SessionPayload,
    options: { expiresInMs?: number } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expiresAt = issuedAt + expiresInMs;

    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(issuedAt / 1000))
      .setExpirationTime(Math.floor(expiresAt / 1000))
      .sign(this.getSessionSecret());

    return jwt;
  }

  async verifySession(token: string | undefined): Promise<SessionPayload | null> {
    if (!token) return null;

    try {
      const { payload } = await jwtVerify(token, this.getSessionSecret());
      return payload as SessionPayload;
    } catch (error) {
      console.error("[SDK] Session verification failed:", error);
      return null;
    }
  }

  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  async authenticateRequest(req: Request): Promise<User> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    
    console.log("[SDK] Authenticating request...");
    console.log("[SDK] Cookie header:", req.headers.cookie);
    console.log("[SDK] Session cookie name:", COOKIE_NAME);
    console.log("[SDK] Session cookie value:", sessionCookie ? "exists" : "missing");

    const session = await this.verifySession(sessionCookie);

    if (!session) {
      console.error("[SDK] Invalid or missing session");
      throw ForbiddenError("Invalid session cookie");
    }

    console.log("[SDK] Session verified for user:", session.username);

    const signedInAt = new Date();
    let user = await db.getUserById(session.userId);

    if (!user) {
      console.error("[SDK] User not found:", session.userId);
      throw ForbiddenError("User not found");
    }

    console.log("[SDK] User authenticated:", user.username);

    // Update last signed in
    await db.updateUserLastSignedIn(user.id, signedInAt);

    return user;
  }
}

function ForbiddenError(message: string) {
  const error = new Error(message);
  (error as any).code = "FORBIDDEN";
  return error;
}

export const sdk = new SDKServer();
