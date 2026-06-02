import { hash, compare } from "bcrypt";
import { SignJWT, jwtVerify } from "jose";
import { db } from "../db";
import { users, sessions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
      getUserRoleKeys,
      getUserPrimaryRoleKey,
      getUserPermissions,
} from "../db/roles";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-min-32-chars");
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
      return hash(password, 10);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
      return compare(password, passwordHash);
}

/**
 * Create JWT token
 */
export async function createJWT(userId: number): Promise<string> {
      const token = await new SignJWT({ userId })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("7d")
            .sign(JWT_SECRET);

      return token;
}

/**
 * Verify JWT token
 */
export async function verifyJWT(token: string): Promise<{ userId: number } | null> {
      try {
            const verified = await jwtVerify(token, JWT_SECRET);
            return verified.payload as { userId: number };
      } catch {
            return null;
      }
}

/**
 * Register new user
 */
export async function registerUser(
      username: string,
      password: string,
      name?: string,
      email?: string,
      role: "user" | "admin" | "manager" | "supervisor" | "accountant" | "resident" = "user"
) {
      try {
            // Check if username already exists
            const existingUser = await db
                  .select()
                  .from(users)
                  .where(eq(users.username, username))
                  .limit(1);

            if (existingUser.length > 0) {
                  throw new Error("Username already exists");
            }

            // Check if email already exists (if provided)
            if (email) {
                  const existingEmail = await db
                        .select()
                        .from(users)
                        .where(eq(users.email, email))
                        .limit(1);

                  if (existingEmail.length > 0) {
                        throw new Error("Email already exists");
                  }
            }

            // Hash password
            const passwordHash = await hashPassword(password);

            // Create user
            const result = await db.insert(users).values({
                  username,
                  passwordHash,
                  name: name || null,
                  email: email || null,
                  role,
                  isActive: true,
                  createdAt: new Date(),
                  updatedAt: new Date(),
            });

            return result;
      } catch (error) {
            console.error("[registerUser] Error:", error);
            throw error;
      }
}

/**
 * Login user
 */
export async function loginUser(username: string, password: string) {
      try {
            // Find user
            const userList = await db
                  .select()
                  .from(users)
                  .where(eq(users.username, username))
                  .limit(1);

            if (userList.length === 0) {
                  throw new Error("Invalid username or password");
            }

            const user = userList[0];

            // Check if user is active
            if (!user.isActive) {
                  throw new Error("User account is inactive");
            }

            // Verify password
            const passwordValid = await verifyPassword(password, user.passwordHash);
            if (!passwordValid) {
                  throw new Error("Invalid username or password");
            }

            // Update last signed in
            await db
                  .update(users)
                  .set({ lastSignedIn: new Date() })
                  .where(eq(users.id, user.id));

            // Create JWT token
            const token = await createJWT(user.id);

            // Create session
            const sessionId = nanoid();
            const expiresAt = new Date(Date.now() + SESSION_DURATION);

            await db.insert(sessions).values({
                  id: sessionId,
                  userId: user.id,
                  expiresAt,
                  createdAt: new Date(),
            });

            return {
                  user: {
                        id: user.id,
                        username: user.username,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                  },
                  token,
                  sessionId,
            };
      } catch (error) {
            console.error("[loginUser] Error:", error);
            throw error;
      }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number) {
      try {
            const userList = await db
                  .select()
                  .from(users)
                  .where(eq(users.id, userId))
                  .limit(1);

            if (userList.length === 0) {
                  return null;
            }

            const user = userList[0];
            return {
                  id: user.id,
                  username: user.username,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  isActive: user.isActive,
                  createdAt: user.createdAt,
            };
      } catch (error) {
            console.error("[getUserById] Error:", error);
            return null;
      }
}

/**
 * Logout user (delete session)
 */
export async function logoutUser(sessionId: string) {
      try {
            await db
                  .delete(sessions)
                  .where(eq(sessions.id, sessionId));
      } catch (error) {
            console.error("[logoutUser] Error:", error);
            throw error;
      }
}

/**
 * Verify session
 */
export async function verifySession(sessionId: string) {
      try {
            const sessionList = await db
                  .select()
                  .from(sessions)
                  .where(eq(sessions.id, sessionId))
                  .limit(1);

            if (sessionList.length === 0) {
                  return null;
            }

            const session = sessionList[0];

            // Check if session is expired
            if (new Date() > session.expiresAt) {
                  await db.delete(sessions).where(eq(sessions.id, sessionId));
                  return null;
            }

            return session;
      } catch (error) {
            console.error("[verifySession] Error:", error);
            return null;
      }
}

async function buildAuthUser(baseUser: {
      id: number;
      username: string;
      name: string;
      email?: string | null;
      role: string;
      isActive?: boolean;
}) {
      const roleKeys = await getUserRoleKeys(baseUser.id);
      const primaryRole = await getUserPrimaryRoleKey(baseUser.id);
      const permissions = await getUserPermissions(baseUser.id);

      const resolvedRoles = roleKeys.length > 0 ? roleKeys : [baseUser.role];
      const resolvedPrimaryRole = primaryRole ?? baseUser.role;

      return {
            id: baseUser.id,
            username: baseUser.username,
            name: baseUser.name,
            email: baseUser.email ?? null,

            // giữ field cũ để code hiện tại không vỡ
            role: resolvedPrimaryRole,

            // field mới
            roles: resolvedRoles,
            primaryRole: resolvedPrimaryRole,
            permissions: permissions.map((item) => item.permissionKey),

            isActive: baseUser.isActive ?? true,
      };
}