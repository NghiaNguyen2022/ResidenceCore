import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "./connection";
import {
      APPOINTMENT_ROLE_KEYS,
      APP_ROLE_KEYS,
      rolePermissions,
      roles,
      userRoles,
      users,
      type AppRoleKey,
} from "../../drizzle/schema";

export type RoleKey = AppRoleKey;

export type UserRoleInfo = {
      roleId: number;
      roleKey: string;
      roleName: string;
      isPrimary: boolean;
};

export type UserPermissionInfo = {
      moduleKey: string;
      actionKey: string;
      permissionKey: string;
};

const LEGACY_COMPATIBLE_USER_ROLES = ["manager", "resident"] as const;

type LegacyCompatibleUserRole = (typeof LEGACY_COMPATIBLE_USER_ROLES)[number];

function isAppRoleKey(roleKey: string): roleKey is AppRoleKey {
      return (APP_ROLE_KEYS as readonly string[]).includes(roleKey);
}

function isAppointmentRoleKey(roleKey: string) {
      return (APPOINTMENT_ROLE_KEYS as readonly string[]).includes(roleKey);
}

function resolveLegacyCompatibleUserRole(
      roleKeys: string[]
): LegacyCompatibleUserRole {
      if (roleKeys.includes("manager")) {
            return "manager";
      }

      if (roleKeys.includes("resident")) {
            return "resident";
      }

      return "resident";
}

export async function getActiveRoles() {
      const db = await getDb();

      if (!db) {
            console.warn("[Database] Cannot get active roles: database not available");
            return [];
      }

      return db
            .select({
                  id: roles.id,
                  roleKey: roles.roleKey,
                  roleName: roles.roleName,
                  description: roles.description,
                  isSystem: roles.isSystem,
                  isActive: roles.isActive,
                  sortOrder: roles.sortOrder,
            })
            .from(roles)
            .where(eq(roles.isActive, true));
}

export async function getRoleByKey(roleKey: string) {
      const db = await getDb();

      if (!db) {
            console.warn("[Database] Cannot get role by key: database not available");
            return null;
      }

      const [role] = await db
            .select()
            .from(roles)
            .where(and(eq(roles.roleKey, roleKey), eq(roles.isActive, true)))
            .limit(1);

      return role ?? null;
}

export async function getUserRoles(userId: number): Promise<UserRoleInfo[]> {
      const db = await getDb();

      if (!db) {
            console.warn("[Database] Cannot get user roles: database not available");
            return [];
      }

      return db
            .select({
                  roleId: roles.id,
                  roleKey: roles.roleKey,
                  roleName: roles.roleName,
                  isPrimary: userRoles.isPrimary,
            })
            .from(userRoles)
            .innerJoin(roles, eq(userRoles.roleId, roles.id))
            .where(and(eq(userRoles.userId, userId), eq(roles.isActive, true)));
}

export async function getUserRoleKeys(userId: number): Promise<string[]> {
      const rows = await getUserRoles(userId);
      return rows.map((row) => row.roleKey);
}

export async function getUserPrimaryRoleKey(
      userId: number
): Promise<string | null> {
      const rows = await getUserRoles(userId);

      const primaryRole = rows.find((row) => row.isPrimary);
      if (primaryRole) {
            return primaryRole.roleKey;
      }

      return rows[0]?.roleKey ?? null;
}

export async function getUserPermissions(
      userId: number
): Promise<UserPermissionInfo[]> {
      const db = await getDb();

      if (!db) {
            console.warn("[Database] Cannot get user permissions: database not available");
            return [];
      }

      const userRoleRows = await getUserRoles(userId);
      const roleIds = userRoleRows.map((row) => row.roleId);

      if (roleIds.length === 0) {
            return [];
      }

      const rows = await db
            .select({
                  moduleKey: rolePermissions.moduleKey,
                  actionKey: rolePermissions.actionKey,
            })
            .from(rolePermissions)
            .where(
                  and(
                        inArray(rolePermissions.roleId, roleIds),
                        eq(rolePermissions.isAllowed, true)
                  )
            );

      return rows.map((row) => ({
            moduleKey: row.moduleKey,
            actionKey: row.actionKey,
            permissionKey: `${row.moduleKey}.${row.actionKey}`,
      }));
}

export async function assignUserRoles(params: {
      userId: number;
      roleKeys: RoleKey[];
      primaryRoleKey?: RoleKey;
      assignedBy?: number | null;
}) {
      const db = await getDb();

      if (!db) {
            console.warn("[Database] Cannot assign user roles: database not available");
            return [];
      }

      const { userId, roleKeys, primaryRoleKey, assignedBy } = params;

      const normalizedRoleKeys = Array.from(new Set(roleKeys)).filter(isAppRoleKey);

      if (normalizedRoleKeys.length === 0) {
            throw new Error("At least one valid role is required.");
      }

      const selectedRoles = await db
            .select({
                  id: roles.id,
                  roleKey: roles.roleKey,
            })
            .from(roles)
            .where(
                  and(
                        inArray(roles.roleKey, normalizedRoleKeys),
                        eq(roles.isActive, true)
                  )
            );

      const selectedRoleKeys = selectedRoles.map((role) => role.roleKey);

      const missingRoles = normalizedRoleKeys.filter(
            (roleKey) => !selectedRoleKeys.includes(roleKey)
      );

      if (missingRoles.length > 0) {
            throw new Error(`Invalid role(s): ${missingRoles.join(", ")}`);
      }

      const hasAppointmentRole = selectedRoleKeys.some(isAppointmentRoleKey);
      const hasResidentRole = selectedRoleKeys.includes("resident");
      const hasManagerRole = selectedRoleKeys.includes("manager");

      if (hasAppointmentRole && !hasResidentRole && !hasManagerRole) {
            throw new Error(
                  "Appointment roles should be assigned together with resident role."
            );
      }

      const resolvedPrimaryRoleKey =
            primaryRoleKey && selectedRoleKeys.includes(primaryRoleKey)
                  ? primaryRoleKey
                  : selectedRoleKeys.includes("resident")
                        ? "resident"
                        : selectedRoleKeys[0];

      await db.delete(userRoles).where(eq(userRoles.userId, userId));

      await db.insert(userRoles).values(
            selectedRoles.map((role) => ({
                  userId,
                  roleId: role.id,
                  isPrimary: role.roleKey === resolvedPrimaryRoleKey,
                  assignedBy: assignedBy ?? null,
            }))
      );

      await syncUserPrimaryRole(userId);

      return getUserRoles(userId);
}

export async function syncUserPrimaryRole(userId: number) {
      const db = await getDb();

      if (!db) {
            console.warn("[Database] Cannot sync primary role: database not available");
            return null;
      }

      const roleKeys = await getUserRoleKeys(userId);
      const compatibleRole = resolveLegacyCompatibleUserRole(roleKeys);

      await db
            .update(users)
            .set({
                  role: compatibleRole,
            })
            .where(eq(users.id, userId));

      return compatibleRole;
}