/**
 * User Database Functions
 * Các hàm liên quan đến user management
 */

import { and, desc, eq, like, ne, or, type SQL } from "drizzle-orm";
import { getDb } from "./connection";
import { InsertUser, residents, users } from "../../drizzle/schema";
import { isNull } from "drizzle-orm";
import { hashPassword } from "../_core/password";
import { assignUserRoles } from "./roles";
/**
 * Upsert user (insert or update)
 *
 * Giữ lại hàm này để tương thích auth/login hiện tại.
 */
export async function upsertUser(user: InsertUser): Promise<void> {
      if (!user.username) {
            throw new Error("User username is required for upsert");
      }

      const db = await getDb();
      if (!db) {
            console.warn("[Database] Cannot upsert user: database not available");
            return;
      }

      try {
            const values: InsertUser = {
                  username: user.username,
                  passwordHash: user.passwordHash || "",
            };

            const updateSet: Record<string, unknown> = {};

            const textFields = ["name", "email"] as const;
            type TextField = (typeof textFields)[number];

            const assignNullable = (field: TextField) => {
                  const value = user[field];
                  if (value === undefined) return;

                  const normalized = value ?? null;
                  values[field] = normalized;
                  updateSet[field] = normalized;
            };

            textFields.forEach(assignNullable);

            if (user.lastSignedIn !== undefined) {
                  values.lastSignedIn = user.lastSignedIn;
                  updateSet.lastSignedIn = user.lastSignedIn;
            }

            if (user.role !== undefined) {
                  values.role = user.role;
                  updateSet.role = user.role;
            }

            if (user.isActive !== undefined) {
                  values.isActive = user.isActive;
                  updateSet.isActive = user.isActive;
            }

            if (user.mustChangePassword !== undefined) {
                  values.mustChangePassword = user.mustChangePassword;
                  updateSet.mustChangePassword = user.mustChangePassword;
            }

            if (!values.lastSignedIn) {
                  values.lastSignedIn = new Date();
            }

            if (Object.keys(updateSet).length === 0) {
                  updateSet.lastSignedIn = new Date();
            }

            await db.insert(users).values(values).onDuplicateKeyUpdate({
                  set: updateSet,
            });
      } catch (error) {
            console.error("[Database] Failed to upsert user:", error);
            throw error;
      }
}

/**
 * Get user by ID
 *
 * Giữ nguyên kiểu trả về full user để auth/context hiện tại còn dùng được.
 * Không dùng hàm này để trả dữ liệu trực tiếp ra FE.
 */
export async function getUserById(id: number) {
      const db = await getDb();
      if (!db) {
            console.warn("[Database] Cannot get user: database not available");
            return undefined;
      }

      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user by username
 *
 * Giữ nguyên kiểu trả về full user vì login cần passwordHash.
 * Không dùng hàm này để trả dữ liệu trực tiếp ra FE.
 */
export async function getUserByUsername(username: string) {
      const db = await getDb();
      if (!db) {
            console.warn("[Database] Cannot get user: database not available");
            return undefined;
      }

      const result = await db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1);

      return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
      const db = await getDb();
      if (!db) {
            console.warn("[Database] Cannot get user by email: database not available");
            return undefined;
      }

      const result = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

      return result.length > 0 ? result[0] : undefined;
}

/**
 * Update user last signed in
 */
export async function updateUserLastSignedIn(userId: number, date: Date) {
      const db = await getDb();
      if (!db) {
            console.warn("[Database] Cannot update user: database not available");
            return;
      }

      try {
            await db
                  .update(users)
                  .set({ lastSignedIn: date })
                  .where(eq(users.id, userId));
      } catch (error) {
            console.error("[Database] Failed to update lastSignedIn:", error);
      }
}

export type ListUsersInput = {
      search?: string;
      role?: InsertUser["role"];
      isActive?: boolean;
      limit?: number;
      offset?: number;
};

export type CreateManagedUserInput = {
      username: string;
      passwordHash: string;
      name: string;
      email?: string | null;
      role: NonNullable<InsertUser["role"]>;
      isActive?: boolean;
      mustChangePassword?: boolean;
};

export type UpdateManagedUserInput = {
      id: number;
      name?: string;
      email?: string | null;
      role?: InsertUser["role"];
      isActive?: boolean;
      mustChangePassword?: boolean;
};

/**
 * Select an application-safe user shape for management screens.
 * Không trả passwordHash ra FE.
 */
function managementUserSelect() {
      return {
            id: users.id,
            username: users.username,
            name: users.name,
            email: users.email,
            role: users.role,
            isActive: users.isActive,
            lastSignedIn: users.lastSignedIn,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,

            residentId: residents.id,
            residentCode: residents.residentCode,
            residentFullName: residents.fullName,
      };
}

/**
 * List users for management screen.
 */
export async function listUsers(input: ListUsersInput = {}) {
      const db = await getDb();
      if (!db) {
            console.warn("[Database] Cannot list users: database not available");
            return [];
      }

      const limit = input.limit ?? 50;
      const offset = input.offset ?? 0;
      const conditions: SQL[] = [];

      if (input.search?.trim()) {
            const keyword = `%${input.search.trim()}%`;
            const searchCondition = or(
                  like(users.username, keyword),
                  like(users.name, keyword),
                  like(users.email, keyword)
            );

            if (searchCondition) {
                  conditions.push(searchCondition);
            }
      }

      if (input.role) {
            conditions.push(eq(users.role, input.role));
      }

      if (typeof input.isActive === "boolean") {
            conditions.push(eq(users.isActive, input.isActive));
      }

      return db
            .select(managementUserSelect())
            .from(users)
            .leftJoin(residents, eq(residents.userId, users.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(users.createdAt))
            .limit(limit)
            .offset(offset);
}

/**
 * Get user detail for management screen.
 * Không trả passwordHash.
 */
export async function getManagedUserById(id: number) {
      const db = await getDb();
      if (!db) {
            console.warn("[Database] Cannot get managed user: database not available");
            return undefined;
      }

      const result = await db
            .select(managementUserSelect())
            .from(users)
            .leftJoin(residents, eq(residents.userId, users.id))
            .where(eq(users.id, id))
            .limit(1);

      return result.length > 0 ? result[0] : undefined;
}

/**
 * Check username duplicated.
 */
export async function checkUsernameExists(
      username: string,
      excludeUserId?: number
) {
      const db = await getDb();
      if (!db) {
            console.warn("[Database] Cannot check username: database not available");
            return false;
      }

      const conditions: SQL[] = [eq(users.username, username)];

      if (excludeUserId) {
            conditions.push(ne(users.id, excludeUserId));
      }

      const result = await db
            .select({ id: users.id })
            .from(users)
            .where(and(...conditions))
            .limit(1);

      return result.length > 0;
}

/**
 * Check email duplicated.
 */
export async function checkEmailExists(email: string, excludeUserId?: number) {
      const db = await getDb();
      if (!db) {
            console.warn("[Database] Cannot check email: database not available");
            return false;
      }

      const conditions: SQL[] = [eq(users.email, email)];

      if (excludeUserId) {
            conditions.push(ne(users.id, excludeUserId));
      }

      const result = await db
            .select({ id: users.id })
            .from(users)
            .where(and(...conditions))
            .limit(1);

      return result.length > 0;
}

/**
 * Create user from management screen.
 *
 * Role truyền vào nên là primary role để giữ tương thích users.role.
 * Multi-role sẽ xử lý ở rolesDb.assignUserRoles.
 */
export async function createManagedUser(input: CreateManagedUserInput) {
      const db = await getDb();
      if (!db) {
            console.warn("[Database] Cannot create user: database not available");
            return undefined;
      }

      await db.insert(users).values({
            username: input.username,
            passwordHash: input.passwordHash,
            name: input.name,
            email: input.email ?? null,
            role: input.role,
            isActive: input.isActive ?? true,
            mustChangePassword: input.mustChangePassword ?? false,
      });

      const createdUser = await getUserByUsername(input.username);
      if (!createdUser) {
            return undefined;
      }

      return getManagedUserById(createdUser.id);
}

/**
 * Update user basic information.
 *
 * Không update password ở đây.
 * Reset password dùng updatePasswordHash.
 */
export async function updateManagedUser(input: UpdateManagedUserInput) {
      const db = await getDb();
      if (!db) {
            console.warn("[Database] Cannot update user: database not available");
            return undefined;
      }

      const updateValues: Partial<InsertUser> = {};

      if (typeof input.name !== "undefined") {
            updateValues.name = input.name;
      }

      if (typeof input.email !== "undefined") {
            updateValues.email = input.email;
      }

      if (typeof input.role !== "undefined") {
            updateValues.role = input.role;
      }

      if (typeof input.isActive !== "undefined") {
            updateValues.isActive = input.isActive;
      }
      if (typeof input.mustChangePassword !== "undefined") {
            updateValues.mustChangePassword = input.mustChangePassword;
      }

      if (Object.keys(updateValues).length === 0) {
            return getManagedUserById(input.id);
      }

      await db.update(users).set(updateValues).where(eq(users.id, input.id));

      return getManagedUserById(input.id);
}

/**
 * Reset password hash.
 */
export async function updatePasswordHash(
      userId: number,
      passwordHash: string,
      options?: {
            mustChangePassword?: boolean;
      }
) {
      const db = await getDb();
      if (!db) {
            console.warn("[Database] Cannot update password: database not available");
            return undefined;
      }

      await db
            .update(users)
            .set({
                  passwordHash,
                  ...(typeof options?.mustChangePassword === "boolean"
                        ? { mustChangePassword: options.mustChangePassword }
                        : {}),
            })
            .where(eq(users.id, userId));

      return getManagedUserById(userId);
}

/**
 * Deactivate user instead of deleting.
 */
export async function deactivateUser(userId: number) {
      const db = await getDb();
      if (!db) {
            console.warn("[Database] Cannot deactivate user: database not available");
            return undefined;
      }

      await db
            .update(users)
            .set({
                  isActive: false,
                  updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

      return getManagedUserById(userId);
}

/**
 * Activate user.
 */
export async function activateUser(userId: number) {
      const db = await getDb();
      if (!db) {
            console.warn("[Database] Cannot activate user: database not available");
            return undefined;
      }

      await db
            .update(users)
            .set({
                  isActive: true,
            })
            .where(eq(users.id, userId));

      return getManagedUserById(userId);
}

/**
 * Link user to resident profile.
 *
 * Dùng khi tạo tài khoản cho học viên.
 */
export async function linkUserToResident(params: {
      userId: number;
      residentId: number;
}) {
      const db = await getDb();
      if (!db) {
            console.warn("[Database] Cannot link user to resident: database not available");
            return undefined;
      }

      await db
            .update(residents)
            .set({
                  userId: params.userId,
            })
            .where(eq(residents.id, params.residentId));

      return getManagedUserById(params.userId);
}

/**
 * Unlink user from resident profile.
 */
export async function unlinkUserFromResident(userId: number) {
      const db = await getDb();
      if (!db) {
            console.warn("[Database] Cannot unlink user from resident: database not available");
            return undefined;
      }

      await db
            .update(residents)
            .set({
                  userId: null,
            })
            .where(eq(residents.userId, userId));

      return getManagedUserById(userId);
}

/**
 * Get resident linked to user.
 */
export async function getResidentLinkedToUser(userId: number) {
      const db = await getDb();
      if (!db) {
            console.warn("[Database] Cannot get linked resident: database not available");
            return undefined;
      }

      const result = await db
            .select({
                  id: residents.id,
                  residentCode: residents.residentCode,
                  fullName: residents.fullName,
                  userId: residents.userId,
            })
            .from(residents)
            .where(eq(residents.userId, userId))
            .limit(1);

      return result.length > 0 ? result[0] : undefined;
}
export async function updateMyProfile(input: {
      userId: number;
      name: string;
      email?: string | null;
}) {
      const db = await getDb();

      if (!db) {
            console.warn("[Database] Cannot update my profile: database not available");
            return undefined;
      }

      await db
            .update(users)
            .set({
                  name: input.name,
                  email: input.email ?? null,
            })
            .where(eq(users.id, input.userId));

      return getManagedUserById(input.userId);
}
export async function changeMyPassword(input: {
      userId: number;
      passwordHash: string;
}) {
      const db = await getDb();

      if (!db) {
            console.warn("[Database] Cannot change password: database not available");
            return undefined;
      }

      await db
            .update(users)
            .set({
                  passwordHash: input.passwordHash,
                  mustChangePassword: false,
            })
            .where(eq(users.id, input.userId));

      return getManagedUserById(input.userId);
}
function normalizeVietnameseText(value: string) {
      return value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
}

export function generateResidentUsernameBase(fullName: string) {
      const normalizedName = normalizeVietnameseText(fullName);
      const parts = normalizedName.split(" ").filter(Boolean);

      if (parts.length === 0) {
            return "hocvien";
      }

      if (parts.length === 1) {
            return parts[0];
      }

      const familyName = parts[0];
      const givenName = parts[parts.length - 1];

      return `${givenName}.${familyName}`;
}
export async function findAvailableUsername(baseUsername: string) {
      const cleanBase =
            normalizeVietnameseText(baseUsername)
                  .replace(/\s+/g, ".")
                  .replace(/\.+/g, ".")
                  .replace(/^\.|\.$/g, "") || "hocvien";

      const db = await getDb();

      if (!db) {
            console.warn("[Database] Cannot find username: database not available");
            return cleanBase;
      }

      const existingUsers = await db
            .select({
                  username: users.username,
            })
            .from(users)
            .where(like(users.username, `${cleanBase}%`));

      const existingUsernames = new Set(
            existingUsers.map((item) => item.username.toLowerCase())
      );

      if (!existingUsernames.has(cleanBase.toLowerCase())) {
            return cleanBase;
      }

      let index = 1;
      let candidate = `${cleanBase}${index}`;

      while (existingUsernames.has(candidate.toLowerCase())) {
            index += 1;
            candidate = `${cleanBase}${index}`;
      }

      return candidate;
}
export async function getResidentForUserCreation(residentId: number) {
      const db = await getDb();

      if (!db) {
            console.warn("[Database] Cannot get resident: database not available");
            return undefined;
      }

      const result = await db
            .select({
                  id: residents.id,
                  residentCode: residents.residentCode,
                  holyName: residents.holyName,
                  fullName: residents.fullName,
                  userId: residents.userId,
            })
            .from(residents)
            .where(eq(residents.id, residentId))
            .limit(1);

      return result.length > 0 ? result[0] : undefined;
}
export async function createResidentUserForResident(input: {
      residentId: number;
      username?: string;
      temporaryPassword?: string;
      mustChangePassword?: boolean;
      assignedBy?: number | null;
}) {
      const resident = await getResidentForUserCreation(input.residentId);

      if (!resident) {
            throw new Error("Không tìm thấy học viên.");
      }

      if (resident.userId) {
            throw new Error("Học viên đã có tài khoản đăng nhập.");
      }

      const baseUsername =
            input.username?.trim() || generateResidentUsernameBase(resident.fullName);

      const username = await findAvailableUsername(baseUsername);

      const temporaryPassword = input.temporaryPassword || "123456";
      const passwordHash = await hashPassword(temporaryPassword);

      const createdUser = await createManagedUser({
            username,
            passwordHash,
            name: resident.fullName,
            email: null,
            role: "resident",
            isActive: true,
            mustChangePassword: input.mustChangePassword ?? true,
      });

      if (!createdUser) {
            throw new Error("Không thể tạo tài khoản cho học viên.");
      }

      await assignUserRoles({
            userId: createdUser.id,
            roleKeys: ["resident"],
            primaryRoleKey: "resident",
            assignedBy: input.assignedBy ?? null,
      });

      await linkUserToResident({
            userId: createdUser.id,
            residentId: resident.id,
      });

      const linkedUser = await getManagedUserById(createdUser.id);

      return {
            user: linkedUser,
            username,
            temporaryPassword,
            residentId: resident.id,
            residentName: resident.fullName,
      };
}
export async function listResidentsWithoutUser() {
      const db = await getDb();

      if (!db) {
            console.warn("[Database] Cannot list residents without user: database not available");
            return [];
      }

      return db
            .select({
                  id: residents.id,
                  residentCode: residents.residentCode,
                  holyName: residents.holyName,
                  fullName: residents.fullName,
                  userId: residents.userId,
            })
            .from(residents)
            .where(isNull(residents.userId));
}
export async function bulkCreateResidentUsers(input: {
      residentIds?: number[];
      temporaryPassword?: string;
      mustChangePassword?: boolean;
      assignedBy?: number | null;
}) {
      const targetResidents = input.residentIds?.length
            ? input.residentIds
            : (await listResidentsWithoutUser()).map((resident) => resident.id);

      const results: Array<{
            residentId: number;
            success: boolean;
            username?: string;
            temporaryPassword?: string;
            message?: string;
      }> = [];

      for (const residentId of targetResidents) {
            try {
                  const result = await createResidentUserForResident({
                        residentId,
                        temporaryPassword: input.temporaryPassword,
                        mustChangePassword: input.mustChangePassword,
                        assignedBy: input.assignedBy,
                  });

                  results.push({
                        residentId,
                        success: true,
                        username: result.username,
                        temporaryPassword: result.temporaryPassword,
                  });
            } catch (error: any) {
                  results.push({
                        residentId,
                        success: false,
                        message: error?.message || "Không thể tạo tài khoản.",
                  });
            }
      }

      return {
            total: results.length,
            success: results.filter((item) => item.success).length,
            failed: results.filter((item) => !item.success).length,
            results,
      };
}
