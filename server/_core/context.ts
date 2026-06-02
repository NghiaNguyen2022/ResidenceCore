import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import {
      getUserPermissions,
      getUserPrimaryRoleKey,
      getUserRoleKeys,
} from "../db/roles";

export type AuthenticatedUser = User & {
      role: User["role"];
      roles: string[];
      primaryRole: string;
      permissions: string[];
};

export type TrpcContext = {
      req: CreateExpressContextOptions["req"];
      res: CreateExpressContextOptions["res"];
      user: AuthenticatedUser | null;
};

function fallbackAuthenticatedUser(user: User): AuthenticatedUser {
      return {
            ...user,
            role: user.role,
            roles: [user.role],
            primaryRole: user.role,
            permissions: [],
      };
}

async function enrichAuthenticatedUser(user: User): Promise<AuthenticatedUser> {
      try {
            const roleKeys = await getUserRoleKeys(user.id);
            const primaryRoleKey = await getUserPrimaryRoleKey(user.id);
            const permissions = await getUserPermissions(user.id);

            const resolvedRoles = roleKeys.length > 0 ? roleKeys : [user.role];
            const resolvedPrimaryRole = primaryRoleKey ?? user.role;

            return {
                  ...user,
                  role: user.role,
                  roles: resolvedRoles,
                  primaryRole: resolvedPrimaryRole,
                  permissions: permissions.map((permission) => permission.permissionKey),
            };
      } catch (error) {
            console.error("[Context] Failed to enrich authenticated user:", error);

            /**
             * Quan trọng:
             * Không được đá user ra login chỉ vì lỗi đọc roles/permissions.
             * Nếu enrich lỗi, vẫn cho user đăng nhập bằng users.role cũ.
             */
            return fallbackAuthenticatedUser(user);
      }
}

export async function createContext(
      opts: CreateExpressContextOptions
): Promise<TrpcContext> {
      let user: AuthenticatedUser | null = null;

      try {
            const authenticatedUser = await sdk.authenticateRequest(opts.req);

            if (authenticatedUser) {
                  user = await enrichAuthenticatedUser(authenticatedUser);
            }
      } catch (error) {
            /**
             * Chỉ authentication thật sự lỗi thì mới user = null.
             */
            console.error("[Context] Authentication failed:", error);
            user = null;
      }

      return {
            req: opts.req,
            res: opts.res,
            user,
      };
}