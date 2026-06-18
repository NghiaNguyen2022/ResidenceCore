// @ts-nocheck
import { and, asc, count, desc, eq, like, ne, or } from "drizzle-orm";
import { normalizeText } from '../lib/utils';

import { getDb } from "./connection";
import {
      InsertOrganizationAssignment,
      InsertOrganizationRole,
      InsertOrganizationTerm,
      InsertOrganizationUnit,
      organizationAssignments,
      organizationRoles,
      organizationTerms,
      organizationUnits,
      residents,
} from "../../drizzle/schema";

/* =========================================================
 * COMMON TYPES
 * ======================================================= */

export type OrganizationRoleCategory =
      | "management"
      | "room"
      | "liturgy"
      | "academic"
      | "activity"
      | "finance"
      | "discipline"
      | "life"
      | "other";

export type OrganizationRoleType =
      | "head"
      | "deputy"
      | "secretary"
      | "treasurer"
      | "team_leader"
      | "committee_head"
      | "custom";

export type OrganizationUnitType = "team" | "committee";

export type OrganizationTermStatus = "active" | "inactive" | "closed";

export type OrganizationAssignmentStatus = "active" | "ended";

/* =========================================================
 * ROLE TYPES
 * ======================================================= */

export type OrganizationRoleFilters = {
      search?: string;
      category?: OrganizationRoleCategory | "all";
      isActive?: boolean;
      level?: number | "all";
      roleType?: OrganizationRoleType | "all";
      limit?: number;
      offset?: number;
};

export type CreateOrganizationRoleInput = {
      code: string;
      name: string;
      category?: OrganizationRoleCategory;
      description?: string | null;
      allowMultipleMembers?: boolean;
      isActive?: boolean;
      sortOrder?: number;

      level?: number;
      roleType?: OrganizationRoleType;
      minAssignees?: number;
      maxAssignees?: number | null;
      isSystem?: boolean;
      requiresUnit?: boolean;
};

export type UpdateOrganizationRoleInput =
      Partial<CreateOrganizationRoleInput>;

/* =========================================================
 * UNIT TYPES
 * ======================================================= */

export type OrganizationUnitFilters = {
      search?: string;
      unitType?: OrganizationUnitType | "all";
      isActive?: boolean;
      limit?: number;
      offset?: number;
};

export type CreateOrganizationUnitInput = {
      code: string;
      name: string;
      unitType: OrganizationUnitType;
      description?: string | null;
      isActive?: boolean;
      sortOrder?: number;
};

export type UpdateOrganizationUnitInput =
      Partial<CreateOrganizationUnitInput>;

/* =========================================================
 * TERM TYPES
 * ======================================================= */

export type OrganizationTermFilters = {
      search?: string;
      status?: OrganizationTermStatus | "all";
      limit?: number;
      offset?: number;
};

export type CreateOrganizationTermInput = {
      code: string;
      name: string;
      startDate: string | Date;
      endDate: string | Date;
      status?: OrganizationTermStatus;
      description?: string | null;
};

export type UpdateOrganizationTermInput =
      Partial<CreateOrganizationTermInput>;

/* =========================================================
 * ASSIGNMENT TYPES
 * ======================================================= */

export type OrganizationAssignmentFilters = {
      search?: string;
      termId?: number;
      roleId?: number;
      residentId?: number;
      unitId?: number;
      status?: OrganizationAssignmentStatus | "all";
      limit?: number;
      offset?: number;
};

export type CreateOrganizationAssignmentInput = {
      termId: number;
      roleId: number;
      residentId: number;
      roomId?: number | null;
      unitId?: number | null;
      startDate: string | Date;
      endDate?: string | Date | null;
      status?: OrganizationAssignmentStatus;
      notes?: string | null;
      assignmentTitle?: string | null;
};

export type UpdateOrganizationAssignmentInput =
      Partial<CreateOrganizationAssignmentInput>;

/* =========================================================
 * HELPERS
 * ======================================================= */

export function normalizeOrganizationRoleCode(code: string) {
      return code
            .trim()
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^A-Z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
}

export function normalizeOrganizationUnitCode(code: string) {
      return code
            .trim()
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^A-Z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
}

export function normalizeOrganizationTermCode(code: string) {
      return code
            .trim()
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^A-Z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
}


function toDateOnly(value: string | Date) {
      if (value instanceof Date) {
            return value.toISOString().split("T")[0];
      }

      return value;
}

function validateDateRange(startDate: string | Date, endDate: string | Date) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            throw new Error("Ngày không hợp lệ.");
      }

      if (end <= start) {
            throw new Error("Ngày kết thúc phải lớn hơn ngày bắt đầu.");
      }
}

function normalizeRoleLevel(value?: number | null) {
      if (value === 1 || value === 2 || value === 3) return value;
      return 3;
}

function normalizeRoleType(value?: string | null): OrganizationRoleType {
      const allowedTypes: OrganizationRoleType[] = [
            "head",
            "deputy",
            "secretary",
            "treasurer",
            "team_leader",
            "committee_head",
            "custom",
      ];

      if (value && allowedTypes.includes(value as OrganizationRoleType)) {
            return value as OrganizationRoleType;
      }

      return "custom";
}

function normalizeUnitType(value?: string | null): OrganizationUnitType {
      if (value === "committee") return "committee";
      return "team";
}

function getDefaultMaxAssigneesByRoleType(
      roleType: OrganizationRoleType,
      allowMultipleMembers: boolean
) {
      if (roleType === "head") return 1;
      if (roleType === "deputy") return 2;
      if (roleType === "secretary") return 1;
      if (roleType === "treasurer") return 1;
      if (!allowMultipleMembers) return 1;

      return null;
}

/**
 * Lấy phòng hiện tại của học viên.
 * Nếu schema residents của bạn không có roomId mà là currentRoomId,
 * đổi residents.roomId thành residents.currentRoomId.
 */
async function getResidentCurrentRoomId(_residentId: number) {
      return null;
}

/* =========================================================
 * ROLE COUNTS
 * ======================================================= */

export async function countOrganizationRoleAssignments(roleId: number) {
      const db = getDb();

      const result = await db
            .select({
                  total: count(),
            })
            .from(organizationAssignments)
            .where(eq(organizationAssignments.roleId, roleId));

      return Number(result[0]?.total || 0);
}

export async function countActiveOrganizationRoleAssignments({
      termId,
      roleId,
      unitId,
      editingId,
}: {
      termId: number;
      roleId: number;
      unitId?: number | null;
      editingId?: number;
}) {
      const db = getDb();

      const conditions: any[] = [
            eq(organizationAssignments.termId, termId),
            eq(organizationAssignments.roleId, roleId),
            eq(organizationAssignments.status, "active"),
      ];

      if (unitId) {
            conditions.push(eq(organizationAssignments.unitId, unitId));
      }

      if (editingId) {
            conditions.push(ne(organizationAssignments.id, editingId));
      }

      const result = await db
            .select({
                  total: count(),
            })
            .from(organizationAssignments)
            .where(and(...conditions));

      return Number(result[0]?.total || 0);
}

export async function countOrganizationTermAssignments(termId: number) {
      const db = getDb();

      const result = await db
            .select({
                  total: count(),
            })
            .from(organizationAssignments)
            .where(eq(organizationAssignments.termId, termId));

      return Number(result[0]?.total || 0);
}

export async function countOrganizationUnitAssignments(unitId: number) {
      const db = getDb();

      const result = await db
            .select({
                  total: count(),
            })
            .from(organizationAssignments)
            .where(eq(organizationAssignments.unitId, unitId));

      return Number(result[0]?.total || 0);
}

/* =========================================================
 * ROLES
 * ======================================================= */

export async function listOrganizationRoles(
      filters?: OrganizationRoleFilters
) {
      const db = getDb();
      const conditions: any[] = [];

      if (filters?.search?.trim()) {
            const keyword = `%${filters.search.trim()}%`;

            conditions.push(
                  or(
                        like(organizationRoles.code, keyword),
                        like(organizationRoles.name, keyword),
                        like(organizationRoles.description, keyword)
                  )
            );
      }

      if (filters?.category && filters.category !== "all") {
            conditions.push(eq(organizationRoles.category, filters.category));
      }

      if (typeof filters?.isActive === "boolean") {
            conditions.push(eq(organizationRoles.isActive, filters.isActive));
      }

      if (filters?.level && filters.level !== "all") {
            conditions.push(eq(organizationRoles.level, filters.level));
      }

      if (filters?.roleType && filters.roleType !== "all") {
            conditions.push(eq(organizationRoles.roleType, filters.roleType));
      }

      let query: any = db
            .select()
            .from(organizationRoles)
            .orderBy(
                  asc(organizationRoles.level),
                  asc(organizationRoles.sortOrder),
                  asc(organizationRoles.name)
            );

      if (conditions.length > 0) {
            query = query.where(and(...conditions) as any);
      }

      if (filters?.limit) {
            query = query.limit(filters.limit);
      }

      if (filters?.offset) {
            query = query.offset(filters.offset);
      }

      const rows = await query;

      return await Promise.all(
            rows.map(async (role: any) => ({
                  ...role,
                  assignedCount: await countOrganizationRoleAssignments(role.id),
            }))
      );
}

export async function getOrganizationRoleById(id: number) {
      const db = getDb();

      const result = await db
            .select()
            .from(organizationRoles)
            .where(eq(organizationRoles.id, id))
            .limit(1);

      if (result.length === 0) return null;

      return {
            ...result[0],
            assignedCount: await countOrganizationRoleAssignments(id),
      };
}

export async function getOrganizationRoleByCode(code: string) {
      const db = getDb();
      const normalizedCode = normalizeOrganizationRoleCode(code);

      const result = await db
            .select()
            .from(organizationRoles)
            .where(eq(organizationRoles.code, normalizedCode))
            .limit(1);

      return result.length > 0 ? result[0] : null;
}

export async function createOrganizationRole(
      data: CreateOrganizationRoleInput
) {
      const db = getDb();

      const normalizedCode = normalizeOrganizationRoleCode(data.code);
      const normalizedName = data.name.trim();

      if (!normalizedCode) {
            throw new Error("Mã vai trò không hợp lệ.");
      }

      if (!normalizedName) {
            throw new Error("Tên vai trò không được để trống.");
      }

      const duplicated = await db
            .select()
            .from(organizationRoles)
            .where(
                  or(
                        eq(organizationRoles.code, normalizedCode),
                        eq(organizationRoles.name, normalizedName)
                  )
            )
            .limit(1);

      if (duplicated.length > 0) {
            const item = duplicated[0];

            if (normalizeText(item.code) === normalizeText(normalizedCode)) {
                  throw new Error("Mã vai trò đã tồn tại.");
            }

            if (normalizeText(item.name) === normalizeText(normalizedName)) {
                  throw new Error("Tên vai trò đã tồn tại.");
            }

            throw new Error("Vai trò đã tồn tại.");
      }

      const allowMultipleMembers = data.allowMultipleMembers ?? true;
      const roleType = normalizeRoleType(data.roleType);
      const maxAssignees =
            data.maxAssignees !== undefined
                  ? data.maxAssignees
                  : getDefaultMaxAssigneesByRoleType(roleType, allowMultipleMembers);

      const payload: InsertOrganizationRole = {
            code: normalizedCode,
            name: normalizedName,
            category: data.category || "other",
            description: data.description || null,
            allowMultipleMembers,
            isActive: data.isActive ?? true,
            sortOrder: data.sortOrder ?? 0,

            level: normalizeRoleLevel(data.level),
            roleType,
            minAssignees: data.minAssignees ?? 0,
            maxAssignees,
            isSystem: data.isSystem ?? false,
            requiresUnit:
                  data.requiresUnit ??
                  (roleType === "team_leader" || roleType === "committee_head"),
      };

      return await db.insert(organizationRoles).values(payload);
}

export async function updateOrganizationRole(
      id: number,
      data: UpdateOrganizationRoleInput
) {
      const db = getDb();

      const existing = await getOrganizationRoleById(id);

      if (!existing) {
            throw new Error("Không tìm thấy vai trò cần cập nhật.");
      }

      const normalizedCode =
            data.code !== undefined
                  ? normalizeOrganizationRoleCode(data.code)
                  : existing.code;

      const normalizedName =
            data.name !== undefined ? data.name.trim() : existing.name;

      if (!normalizedCode) {
            throw new Error("Mã vai trò không hợp lệ.");
      }

      if (!normalizedName) {
            throw new Error("Tên vai trò không được để trống.");
      }

      const duplicated = await db
            .select()
            .from(organizationRoles)
            .where(
                  and(
                        ne(organizationRoles.id, id),
                        or(
                              eq(organizationRoles.code, normalizedCode),
                              eq(organizationRoles.name, normalizedName)
                        )
                  )
            )
            .limit(1);

      if (duplicated.length > 0) {
            const item = duplicated[0];

            if (normalizeText(item.code) === normalizeText(normalizedCode)) {
                  throw new Error("Mã vai trò đã tồn tại.");
            }

            if (normalizeText(item.name) === normalizeText(normalizedName)) {
                  throw new Error("Tên vai trò đã tồn tại.");
            }

            throw new Error("Vai trò đã tồn tại.");
      }

      const allowMultipleMembers =
            data.allowMultipleMembers ?? existing.allowMultipleMembers;

      const roleType = normalizeRoleType(data.roleType ?? existing.roleType);

      const maxAssignees =
            data.maxAssignees !== undefined
                  ? data.maxAssignees
                  : existing.maxAssignees ??
                  getDefaultMaxAssigneesByRoleType(
                        roleType,
                        allowMultipleMembers
                  );

      return await db
            .update(organizationRoles)
            .set({
                  code: normalizedCode,
                  name: normalizedName,
                  category: data.category ?? existing.category,
                  description:
                        data.description !== undefined
                              ? data.description || null
                              : existing.description,
                  allowMultipleMembers,
                  isActive: data.isActive ?? existing.isActive,
                  sortOrder: data.sortOrder ?? existing.sortOrder,

                  level: normalizeRoleLevel(data.level ?? existing.level),
                  roleType,
                  minAssignees:
                        data.minAssignees ?? existing.minAssignees ?? 0,
                  maxAssignees,
                  isSystem: data.isSystem ?? existing.isSystem ?? false,
                  requiresUnit:
                        data.requiresUnit ??
                        existing.requiresUnit ??
                        (roleType === "team_leader" || roleType === "committee_head"),

                  updatedAt: new Date(),
            })
            .where(eq(organizationRoles.id, id));
}

export async function deleteOrganizationRole(id: number) {
      const db = getDb();

      const existing = await getOrganizationRoleById(id);

      if (!existing) {
            throw new Error("Không tìm thấy vai trò cần xóa.");
      }

      if (existing.isSystem) {
            throw new Error(
                  "Không thể xóa vai trò hệ thống. Vui lòng chuyển sang trạng thái ngưng dùng nếu không còn sử dụng."
            );
      }

      const assignedCount = await countOrganizationRoleAssignments(id);

      if (assignedCount > 0) {
            throw new Error(
                  "Không thể xóa vai trò đã có nhân sự trong cơ cấu tổ chức. Vui lòng chuyển sang trạng thái ngưng dùng."
            );
      }

      return await db.delete(organizationRoles).where(eq(organizationRoles.id, id));
}

/* =========================================================
 * UNITS - TỔ / BAN
 * ======================================================= */

export async function listOrganizationUnits(
      filters?: OrganizationUnitFilters
) {
      const db = getDb();
      const conditions: any[] = [];

      if (filters?.search?.trim()) {
            const keyword = `%${filters.search.trim()}%`;

            conditions.push(
                  or(
                        like(organizationUnits.code, keyword),
                        like(organizationUnits.name, keyword),
                        like(organizationUnits.description, keyword)
                  )
            );
      }

      if (filters?.unitType && filters.unitType !== "all") {
            conditions.push(eq(organizationUnits.unitType, filters.unitType));
      }

      if (typeof filters?.isActive === "boolean") {
            conditions.push(eq(organizationUnits.isActive, filters.isActive));
      }

      let query: any = db
            .select()
            .from(organizationUnits)
            .orderBy(
                  asc(organizationUnits.unitType),
                  asc(organizationUnits.sortOrder),
                  asc(organizationUnits.name)
            );

      if (conditions.length > 0) {
            query = query.where(and(...conditions) as any);
      }

      if (filters?.limit) {
            query = query.limit(filters.limit);
      }

      if (filters?.offset) {
            query = query.offset(filters.offset);
      }

      const rows = await query;

      return await Promise.all(
            rows.map(async (unit: any) => ({
                  ...unit,
                  assignedCount: await countOrganizationUnitAssignments(unit.id),
            }))
      );
}

export async function getOrganizationUnitById(id: number) {
      const db = getDb();

      const result = await db
            .select()
            .from(organizationUnits)
            .where(eq(organizationUnits.id, id))
            .limit(1);

      if (result.length === 0) return null;

      return {
            ...result[0],
            assignedCount: await countOrganizationUnitAssignments(id),
      };
}

export async function getOrganizationUnitByCode(code: string) {
      const db = getDb();
      const normalizedCode = normalizeOrganizationUnitCode(code);

      const result = await db
            .select()
            .from(organizationUnits)
            .where(eq(organizationUnits.code, normalizedCode))
            .limit(1);

      return result.length > 0 ? result[0] : null;
}

export async function createOrganizationUnit(
      data: CreateOrganizationUnitInput
) {
      const db = getDb();

      const normalizedCode = normalizeOrganizationUnitCode(data.code);
      const normalizedName = data.name.trim();
      const unitType = normalizeUnitType(data.unitType);

      if (!normalizedCode) {
            throw new Error("Mã Tổ/Ban không hợp lệ.");
      }

      if (!normalizedName) {
            throw new Error("Tên Tổ/Ban không được để trống.");
      }

      const duplicated = await db
            .select()
            .from(organizationUnits)
            .where(
                  or(
                        eq(organizationUnits.code, normalizedCode),
                        eq(organizationUnits.name, normalizedName)
                  )
            )
            .limit(1);

      if (duplicated.length > 0) {
            const item = duplicated[0];

            if (normalizeText(item.code) === normalizeText(normalizedCode)) {
                  throw new Error("Mã Tổ/Ban đã tồn tại.");
            }

            if (normalizeText(item.name) === normalizeText(normalizedName)) {
                  throw new Error("Tên Tổ/Ban đã tồn tại.");
            }

            throw new Error("Tổ/Ban đã tồn tại.");
      }

      const payload: InsertOrganizationUnit = {
            code: normalizedCode,
            name: normalizedName,
            unitType,
            description: data.description || null,
            isActive: data.isActive ?? true,
            sortOrder: data.sortOrder ?? 0,
      };

      return await db.insert(organizationUnits).values(payload);
}

export async function updateOrganizationUnit(
      id: number,
      data: UpdateOrganizationUnitInput
) {
      const db = getDb();

      const existing = await getOrganizationUnitById(id);

      if (!existing) {
            throw new Error("Không tìm thấy Tổ/Ban cần cập nhật.");
      }

      const normalizedCode =
            data.code !== undefined
                  ? normalizeOrganizationUnitCode(data.code)
                  : existing.code;

      const normalizedName =
            data.name !== undefined ? data.name.trim() : existing.name;

      if (!normalizedCode) {
            throw new Error("Mã Tổ/Ban không hợp lệ.");
      }

      if (!normalizedName) {
            throw new Error("Tên Tổ/Ban không được để trống.");
      }

      const duplicated = await db
            .select()
            .from(organizationUnits)
            .where(
                  and(
                        ne(organizationUnits.id, id),
                        or(
                              eq(organizationUnits.code, normalizedCode),
                              eq(organizationUnits.name, normalizedName)
                        )
                  )
            )
            .limit(1);

      if (duplicated.length > 0) {
            const item = duplicated[0];

            if (normalizeText(item.code) === normalizeText(normalizedCode)) {
                  throw new Error("Mã Tổ/Ban đã tồn tại.");
            }

            if (normalizeText(item.name) === normalizeText(normalizedName)) {
                  throw new Error("Tên Tổ/Ban đã tồn tại.");
            }

            throw new Error("Tổ/Ban đã tồn tại.");
      }

      return await db
            .update(organizationUnits)
            .set({
                  code: normalizedCode,
                  name: normalizedName,
                  unitType:
                        data.unitType !== undefined
                              ? normalizeUnitType(data.unitType)
                              : existing.unitType,
                  description:
                        data.description !== undefined
                              ? data.description || null
                              : existing.description,
                  isActive: data.isActive ?? existing.isActive,
                  sortOrder: data.sortOrder ?? existing.sortOrder,
                  updatedAt: new Date(),
            })
            .where(eq(organizationUnits.id, id));
}

export async function deleteOrganizationUnit(id: number) {
      const db = getDb();

      const existing = await getOrganizationUnitById(id);

      if (!existing) {
            throw new Error("Không tìm thấy Tổ/Ban cần xóa.");
      }

      const assignedCount = await countOrganizationUnitAssignments(id);

      if (assignedCount > 0) {
            throw new Error(
                  "Không thể xóa Tổ/Ban đã có phân công trong cơ cấu tổ chức. Vui lòng chuyển sang trạng thái ngưng dùng."
            );
      }

      return await db.delete(organizationUnits).where(eq(organizationUnits.id, id));
}

/* =========================================================
 * TERMS
 * ======================================================= */

export async function listOrganizationTerms(
      filters?: OrganizationTermFilters
) {
      const db = getDb();
      const conditions: any[] = [];

      if (filters?.search?.trim()) {
            const keyword = `%${filters.search.trim()}%`;

            conditions.push(
                  or(
                        like(organizationTerms.code, keyword),
                        like(organizationTerms.name, keyword),
                        like(organizationTerms.description, keyword)
                  )
            );
      }

      if (filters?.status && filters.status !== "all") {
            conditions.push(eq(organizationTerms.status, filters.status));
      }

      let query: any = db
            .select()
            .from(organizationTerms)
            .orderBy(desc(organizationTerms.startDate), asc(organizationTerms.name));

      if (conditions.length > 0) {
            query = query.where(and(...conditions) as any);
      }

      if (filters?.limit) {
            query = query.limit(filters.limit);
      }

      if (filters?.offset) {
            query = query.offset(filters.offset);
      }

      const rows = await query;

      return await Promise.all(
            rows.map(async (term: any) => ({
                  ...term,
                  assignedCount: await countOrganizationTermAssignments(term.id),
            }))
      );
}

export async function getOrganizationTermById(id: number) {
      const db = getDb();

      const result = await db
            .select()
            .from(organizationTerms)
            .where(eq(organizationTerms.id, id))
            .limit(1);

      if (result.length === 0) return null;

      return {
            ...result[0],
            assignedCount: await countOrganizationTermAssignments(id),
      };
}

export async function getActiveOrganizationTerm() {
      const db = getDb();

      const result = await db
            .select()
            .from(organizationTerms)
            .where(eq(organizationTerms.status, "active"))
            .limit(1);

      if (result.length === 0) return null;

      return {
            ...result[0],
            assignedCount: await countOrganizationTermAssignments(result[0].id),
      };
}

export async function createOrganizationTerm(
      data: CreateOrganizationTermInput
) {
      const db = getDb();

      const normalizedCode = normalizeOrganizationTermCode(data.code);
      const normalizedName = data.name.trim();

      if (!normalizedCode) {
            throw new Error("Mã nhiệm kỳ không hợp lệ.");
      }

      if (!normalizedName) {
            throw new Error("Tên nhiệm kỳ không được để trống.");
      }

      validateDateRange(data.startDate, data.endDate);

      const duplicated = await db
            .select()
            .from(organizationTerms)
            .where(
                  or(
                        eq(organizationTerms.code, normalizedCode),
                        eq(organizationTerms.name, normalizedName)
                  )
            )
            .limit(1);

      if (duplicated.length > 0) {
            const item = duplicated[0];

            if (normalizeText(item.code) === normalizeText(normalizedCode)) {
                  throw new Error("Mã nhiệm kỳ đã tồn tại.");
            }

            if (normalizeText(item.name) === normalizeText(normalizedName)) {
                  throw new Error("Tên nhiệm kỳ đã tồn tại.");
            }

            throw new Error("Nhiệm kỳ đã tồn tại.");
      }

      if (data.status === "active") {
            const activeTerm = await getActiveOrganizationTerm();

            if (activeTerm) {
                  throw new Error(
                        "Chỉ được có một nhiệm kỳ đang hoạt động. Vui lòng đóng hoặc ngưng nhiệm kỳ hiện tại trước."
                  );
            }
      }

      const payload: InsertOrganizationTerm = {
            code: normalizedCode,
            name: normalizedName,
            startDate: toDateOnly(data.startDate) as any,
            endDate: toDateOnly(data.endDate) as any,
            status: data.status || "inactive",
            description: data.description || null,
      };

      return await db.insert(organizationTerms).values(payload);
}

export async function updateOrganizationTerm(
      id: number,
      data: UpdateOrganizationTermInput
) {
      const db = getDb();

      const existing = await getOrganizationTermById(id);

      if (!existing) {
            throw new Error("Không tìm thấy nhiệm kỳ cần cập nhật.");
      }

      const normalizedCode =
            data.code !== undefined
                  ? normalizeOrganizationTermCode(data.code)
                  : existing.code;

      const normalizedName =
            data.name !== undefined ? data.name.trim() : existing.name;

      const startDate = data.startDate ?? existing.startDate;
      const endDate = data.endDate ?? existing.endDate;

      if (!normalizedCode) {
            throw new Error("Mã nhiệm kỳ không hợp lệ.");
      }

      if (!normalizedName) {
            throw new Error("Tên nhiệm kỳ không được để trống.");
      }

      validateDateRange(startDate, endDate);

      const duplicated = await db
            .select()
            .from(organizationTerms)
            .where(
                  and(
                        ne(organizationTerms.id, id),
                        or(
                              eq(organizationTerms.code, normalizedCode),
                              eq(organizationTerms.name, normalizedName)
                        )
                  )
            )
            .limit(1);

      if (duplicated.length > 0) {
            const item = duplicated[0];

            if (normalizeText(item.code) === normalizeText(normalizedCode)) {
                  throw new Error("Mã nhiệm kỳ đã tồn tại.");
            }

            if (normalizeText(item.name) === normalizeText(normalizedName)) {
                  throw new Error("Tên nhiệm kỳ đã tồn tại.");
            }

            throw new Error("Nhiệm kỳ đã tồn tại.");
      }

      if (data.status === "active" && existing.status !== "active") {
            const activeTerm = await getActiveOrganizationTerm();

            if (activeTerm && activeTerm.id !== id) {
                  throw new Error(
                        "Chỉ được có một nhiệm kỳ đang hoạt động. Vui lòng đóng hoặc ngưng nhiệm kỳ hiện tại trước."
                  );
            }
      }

      return await db
            .update(organizationTerms)
            .set({
                  code: normalizedCode,
                  name: normalizedName,
                  startDate: toDateOnly(startDate) as any,
                  endDate: toDateOnly(endDate) as any,
                  status: data.status ?? existing.status,
                  description:
                        data.description !== undefined
                              ? data.description || null
                              : existing.description,
                  updatedAt: new Date(),
            })
            .where(eq(organizationTerms.id, id));
}

export async function deleteOrganizationTerm(id: number) {
      const db = getDb();

      const existing = await getOrganizationTermById(id);

      if (!existing) {
            throw new Error("Không tìm thấy nhiệm kỳ cần xóa.");
      }

      const assignedCount = await countOrganizationTermAssignments(id);

      if (assignedCount > 0) {
            throw new Error(
                  "Không thể xóa nhiệm kỳ đã có cơ cấu tổ chức. Vui lòng chuyển trạng thái sang Đã kết thúc."
            );
      }

      return await db.delete(organizationTerms).where(eq(organizationTerms.id, id));
}

export async function setActiveOrganizationTerm(id: number) {
      const db = getDb();

      const existing = await getOrganizationTermById(id);

      if (!existing) {
            throw new Error("Không tìm thấy nhiệm kỳ cần kích hoạt.");
      }

      if (existing.status === "active") {
            return {
                  success: true,
                  message: "Nhiệm kỳ này đã đang hoạt động.",
            };
      }

      await db
            .update(organizationTerms)
            .set({
                  status: "inactive",
                  updatedAt: new Date(),
            })
            .where(eq(organizationTerms.status, "active"));

      await db
            .update(organizationTerms)
            .set({
                  status: "active",
                  updatedAt: new Date(),
            })
            .where(eq(organizationTerms.id, id));

      return {
            success: true,
            message: "Đã đặt nhiệm kỳ đang hoạt động.",
      };
}

/* =========================================================
 * ASSIGNMENTS
 * ======================================================= */

async function ensureOrganizationAssignmentValid({
      termId,
      roleId,
      residentId,
      unitId,
      editingId,
      status,
}: {
      termId: number;
      roleId: number;
      residentId: number;
      unitId?: number | null;
      editingId?: number;
      status: OrganizationAssignmentStatus;
}) {
      const db = getDb();

      const term = await getOrganizationTermById(termId);

      if (!term) {
            throw new Error("Không tìm thấy nhiệm kỳ.");
      }

      const role = await getOrganizationRoleById(roleId);

      if (!role) {
            throw new Error("Không tìm thấy vai trò.");
      }

      if (!role.isActive) {
            throw new Error("Không thể gán vai trò đang ngưng dùng.");
      }

      const roleType = normalizeRoleType(role.roleType);
      const requiresUnit = Boolean(role.requiresUnit);

      if (requiresUnit && !unitId) {
            throw new Error("Vui lòng chọn Tổ/Ban phụ trách cho vai trò này.");
      }

      let unit: any = null;

      if (unitId) {
            unit = await getOrganizationUnitById(unitId);

            if (!unit) {
                  throw new Error("Không tìm thấy Tổ/Ban phụ trách.");
            }

            if (!unit.isActive) {
                  throw new Error("Không thể gán vào Tổ/Ban đang ngưng dùng.");
            }

            if (roleType === "team_leader" && unit.unitType !== "team") {
                  throw new Error("Vai trò Tổ trưởng chỉ được gán cho đơn vị loại Tổ.");
            }

            if (
                  roleType === "committee_head" &&
                  unit.unitType !== "committee"
            ) {
                  throw new Error(
                        "Vai trò Trưởng ban chỉ được gán cho đơn vị loại Ban."
                  );
            }
      }

      const residentResult = await db
            .select({
                  id: residents.id,
                  fullName: residents.fullName,
                  status: residents.status,
            })
            .from(residents)
            .where(eq(residents.id, residentId))
            .limit(1);

      const resident = residentResult[0];

      if (!resident) {
            throw new Error("Không tìm thấy học viên.");
      }

      if (resident.status === "transferred_out") {
            throw new Error("Không thể gán vai trò cho học viên đã rời lưu xá.");
      }

      if (status !== "active") {
            return;
      }

      const baseConditions: any[] = [
            eq(organizationAssignments.termId, termId),
            eq(organizationAssignments.roleId, roleId),
            eq(organizationAssignments.status, "active"),
      ];

      if (editingId) {
            baseConditions.push(ne(organizationAssignments.id, editingId));
      }

      const duplicatedSameResident = await db
            .select()
            .from(organizationAssignments)
            .where(
                  and(
                        ...baseConditions,
                        eq(organizationAssignments.residentId, residentId)
                  )
            )
            .limit(1);

      if (duplicatedSameResident.length > 0) {
            throw new Error(
                  "Học viên này đã được gán vai trò này trong nhiệm kỳ đang chọn."
            );
      }

      if (requiresUnit && unitId) {
            const duplicatedSameUnit = await db
                  .select()
                  .from(organizationAssignments)
                  .where(
                        and(
                              ...baseConditions,
                              eq(organizationAssignments.unitId, unitId)
                        )
                  )
                  .limit(1);

            if (duplicatedSameUnit.length > 0) {
                  throw new Error(
                        `${role.name} cho Tổ/Ban này đã có người phụ trách trong nhiệm kỳ đang chọn.`
                  );
            }
      }

      const maxAssignees =
            role.maxAssignees ??
            getDefaultMaxAssigneesByRoleType(
                  roleType,
                  Boolean(role.allowMultipleMembers)
            );

      const isUnitScopedRole =
            requiresUnit ||
            roleType === "team_leader" ||
            roleType === "committee_head";

      if (maxAssignees && maxAssignees > 0) {
            const activeCount = await countActiveOrganizationRoleAssignments({
                  termId,
                  roleId,
                  unitId: isUnitScopedRole ? unitId : null,
                  editingId,
            });

            if (activeCount >= maxAssignees) {
                  const scopeTitle =
                        isUnitScopedRole && unit?.name
                              ? `${role.name} ${unit.name}`
                              : role.name;

                  throw new Error(
                        isUnitScopedRole
                              ? `${scopeTitle} đã đủ số lượng tối đa (${maxAssignees}).`
                              : `Vai trò "${role.name}" chỉ được phân công tối đa ${maxAssignees} người trong cùng nhiệm kỳ.`
                  );
            }
      }

      if (!role.allowMultipleMembers) {
            const roleAlreadyAssignedConditions = [...baseConditions];

            if (isUnitScopedRole && unitId) {
                  roleAlreadyAssignedConditions.push(
                        eq(organizationAssignments.unitId, unitId)
                  );
            }

            const roleAlreadyAssigned = await db
                  .select()
                  .from(organizationAssignments)
                  .where(and(...roleAlreadyAssignedConditions))
                  .limit(1);

            if (roleAlreadyAssigned.length > 0) {
                  const scopeTitle =
                        isUnitScopedRole && unit?.name
                              ? `${role.name} ${unit.name}`
                              : role.name;

                  throw new Error(
                        isUnitScopedRole
                              ? `${scopeTitle} đã có người phụ trách trong nhiệm kỳ đang chọn.`
                              : `Vai trò "${role.name}" chỉ cho phép một người trong cùng nhiệm kỳ.`
                  );
            }
      }
}

export async function listOrganizationAssignments(
      filters?: OrganizationAssignmentFilters
) {
      const db = getDb();
      const conditions: any[] = [];

      if (filters?.termId) {
            conditions.push(eq(organizationAssignments.termId, filters.termId));
      }

      if (filters?.roleId) {
            conditions.push(eq(organizationAssignments.roleId, filters.roleId));
      }

      if (filters?.residentId) {
            conditions.push(eq(organizationAssignments.residentId, filters.residentId));
      }

      if (filters?.unitId) {
            conditions.push(eq(organizationAssignments.unitId, filters.unitId));
      }

      if (filters?.status && filters.status !== "all") {
            conditions.push(eq(organizationAssignments.status, filters.status));
      }

      if (filters?.search?.trim()) {
            const keyword = `%${filters.search.trim()}%`;

            conditions.push(
                  or(
                        like(residents.fullName, keyword),
                        like(residents.residentCode, keyword),
                        like(organizationRoles.name, keyword),
                        like(organizationRoles.code, keyword),
                        like(organizationTerms.name, keyword),
                        like(organizationTerms.code, keyword),
                        like(organizationUnits.name, keyword),
                        like(organizationUnits.code, keyword)
                  )
            );
      }

      let query: any = db
            .select({
                  id: organizationAssignments.id,
                  termId: organizationAssignments.termId,
                  roleId: organizationAssignments.roleId,
                  residentId: organizationAssignments.residentId,
                  roomId: organizationAssignments.roomId,
                  unitId: organizationAssignments.unitId,
                  startDate: organizationAssignments.startDate,
                  endDate: organizationAssignments.endDate,
                  status: organizationAssignments.status,
                  notes: organizationAssignments.notes,
                  createdAt: organizationAssignments.createdAt,
                  updatedAt: organizationAssignments.updatedAt,

                  termCode: organizationTerms.code,
                  termName: organizationTerms.name,

                  roleCode: organizationRoles.code,
                  roleName: organizationRoles.name,
                  roleCategory: organizationRoles.category,
                  allowMultipleMembers: organizationRoles.allowMultipleMembers,
                  roleLevel: organizationRoles.level,
                  roleType: organizationRoles.roleType,
                  minAssignees: organizationRoles.minAssignees,
                  maxAssignees: organizationRoles.maxAssignees,
                  requiresUnit: organizationRoles.requiresUnit,

                  unitCode: organizationUnits.code,
                  unitName: organizationUnits.name,
                  unitType: organizationUnits.unitType,

                  residentCode: residents.residentCode,
                  residentName: residents.fullName,
                  residentStatus: residents.status,
            })
            .from(organizationAssignments)
            .innerJoin(
                  organizationTerms,
                  eq(organizationAssignments.termId, organizationTerms.id)
            )
            .innerJoin(
                  organizationRoles,
                  eq(organizationAssignments.roleId, organizationRoles.id)
            )
            .leftJoin(
                  organizationUnits,
                  eq(organizationAssignments.unitId, organizationUnits.id)
            )
            .innerJoin(residents, eq(organizationAssignments.residentId, residents.id))
            .orderBy(
                  desc(organizationAssignments.startDate),
                  asc(organizationRoles.level),
                  asc(organizationRoles.sortOrder),
                  asc(organizationUnits.sortOrder),
                  asc(residents.fullName)
            );

      if (conditions.length > 0) {
            query = query.where(and(...conditions) as any);
      }

      if (filters?.limit) {
            query = query.limit(filters.limit);
      }

      if (filters?.offset) {
            query = query.offset(filters.offset);
      }

      return await query;
}

export async function getOrganizationAssignmentById(id: number) {
      const db = getDb();

      const result = await db
            .select({
                  id: organizationAssignments.id,
                  termId: organizationAssignments.termId,
                  roleId: organizationAssignments.roleId,
                  residentId: organizationAssignments.residentId,
                  roomId: organizationAssignments.roomId,
                  unitId: organizationAssignments.unitId,
                  startDate: organizationAssignments.startDate,
                  endDate: organizationAssignments.endDate,
                  status: organizationAssignments.status,
                  notes: organizationAssignments.notes,
                  createdAt: organizationAssignments.createdAt,
                  updatedAt: organizationAssignments.updatedAt,

                  termCode: organizationTerms.code,
                  termName: organizationTerms.name,

                  roleCode: organizationRoles.code,
                  roleName: organizationRoles.name,
                  roleCategory: organizationRoles.category,
                  allowMultipleMembers: organizationRoles.allowMultipleMembers,
                  roleLevel: organizationRoles.level,
                  roleType: organizationRoles.roleType,
                  minAssignees: organizationRoles.minAssignees,
                  maxAssignees: organizationRoles.maxAssignees,
                  requiresUnit: organizationRoles.requiresUnit,

                  unitCode: organizationUnits.code,
                  unitName: organizationUnits.name,
                  unitType: organizationUnits.unitType,

                  residentCode: residents.residentCode,
                  residentName: residents.fullName,
                  residentStatus: residents.status,
            })
            .from(organizationAssignments)
            .innerJoin(
                  organizationTerms,
                  eq(organizationAssignments.termId, organizationTerms.id)
            )
            .innerJoin(
                  organizationRoles,
                  eq(organizationAssignments.roleId, organizationRoles.id)
            )
            .leftJoin(
                  organizationUnits,
                  eq(organizationAssignments.unitId, organizationUnits.id)
            )
            .innerJoin(residents, eq(organizationAssignments.residentId, residents.id))
            .where(eq(organizationAssignments.id, id))
            .limit(1);

      return result[0] || null;
}

export async function createOrganizationAssignment(
      data: CreateOrganizationAssignmentInput
) {
      const db = getDb();

      if (!data.termId) {
            throw new Error("Vui lòng chọn nhiệm kỳ.");
      }

      if (!data.roleId) {
            throw new Error("Vui lòng chọn vai trò.");
      }

      if (!data.residentId) {
            throw new Error("Vui lòng chọn học viên.");
      }

      if (!data.startDate) {
            throw new Error("Vui lòng chọn ngày bắt đầu.");
      }

      if (data.endDate) {
            validateDateRange(data.startDate, data.endDate);
      }

      const status = data.status || "active";
      const role = await getOrganizationRoleById(data.roleId);
      const unitId =
            role?.requiresUnit && data.unitId !== undefined ? data.unitId : null;

      await ensureOrganizationAssignmentValid({
            termId: data.termId,
            roleId: data.roleId,
            residentId: data.residentId,
            unitId,
            status,
      });

      const currentRoomId =
            data.roomId !== undefined && data.roomId !== null
                  ? data.roomId
                  : await getResidentCurrentRoomId(data.residentId);

      const payload: InsertOrganizationAssignment = {
            termId: data.termId,
            roleId: data.roleId,
            residentId: data.residentId,
            roomId: currentRoomId,
            unitId,
            assignmentTitle: data.assignmentTitle?.trim() || null,
            startDate: toDateOnly(data.startDate) as any,
            endDate: data.endDate ? (toDateOnly(data.endDate) as any) : null,
            status,
            notes: data.notes || null,
      };

      return await db.insert(organizationAssignments).values(payload);
}

export async function updateOrganizationAssignment(
      id: number,
      data: UpdateOrganizationAssignmentInput
) {
      const db = getDb();

      const existingResult = await db
            .select()
            .from(organizationAssignments)
            .where(eq(organizationAssignments.id, id))
            .limit(1);

      const existing = existingResult[0];

      if (!existing) {
            throw new Error("Không tìm thấy phân công cần cập nhật.");
      }

      const termId = data.termId ?? existing.termId;
      const roleId = data.roleId ?? existing.roleId;
      const residentId = data.residentId ?? existing.residentId;
      const startDate = data.startDate ?? existing.startDate;
      const endDate = data.endDate ?? existing.endDate;
      const status = data.status ?? existing.status;

      if (endDate) {
            validateDateRange(startDate, endDate);
      }

      const role = await getOrganizationRoleById(roleId);
      const unitId =
            role?.requiresUnit && data.unitId !== undefined
                  ? data.unitId
                  : role?.requiresUnit
                        ? existing.unitId
                        : null;

      await ensureOrganizationAssignmentValid({
            termId,
            roleId,
            residentId,
            unitId,
            editingId: id,
            status,
      });

      const currentRoomId =
            data.roomId !== undefined
                  ? data.roomId
                  : existing.roomId ?? (await getResidentCurrentRoomId(residentId));

      return await db
            .update(organizationAssignments)
            .set({
                  termId,
                  roleId,
                  residentId,
                  roomId: currentRoomId,
                  unitId,
                  startDate: toDateOnly(startDate) as any,
                  endDate: endDate ? (toDateOnly(endDate) as any) : null,
                  status,
                  assignmentTitle:
                        data.assignmentTitle !== undefined
                              ? data.assignmentTitle?.trim() || null
                              : existing.assignmentTitle,
                  notes:
                        data.notes !== undefined
                              ? data.notes || null
                              : existing.notes,
                  updatedAt: new Date(),
            })
            .where(eq(organizationAssignments.id, id));
}

export async function endOrganizationAssignment(id: number) {
      const db = getDb();

      const existingResult = await db
            .select()
            .from(organizationAssignments)
            .where(eq(organizationAssignments.id, id))
            .limit(1);

      const existing = existingResult[0];

      if (!existing) {
            throw new Error("Không tìm thấy phân công cần kết thúc.");
      }

      if (existing.status === "ended") {
            return {
                  success: true,
                  message: "Phân công này đã kết thúc.",
            };
      }

      return await db
            .update(organizationAssignments)
            .set({
                  status: "ended",
                  endDate: new Date().toISOString().split("T")[0] as any,
                  updatedAt: new Date(),
            })
            .where(eq(organizationAssignments.id, id));
}

export async function deleteOrganizationAssignment(id: number) {
      const db = getDb();

      const existingResult = await db
            .select()
            .from(organizationAssignments)
            .where(eq(organizationAssignments.id, id))
            .limit(1);

      if (existingResult.length === 0) {
            throw new Error("Không tìm thấy phân công cần xóa.");
      }

      return await db
            .delete(organizationAssignments)
            .where(eq(organizationAssignments.id, id));
}
