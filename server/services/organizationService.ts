import {
      CreateOrganizationAssignmentInput,
      CreateOrganizationRoleInput,
      CreateOrganizationTermInput,
      CreateOrganizationUnitInput,
      createOrganizationAssignment,
      createOrganizationRole,
      createOrganizationTerm,
      createOrganizationUnit,
      deleteOrganizationAssignment,
      deleteOrganizationRole,
      deleteOrganizationTerm,
      deleteOrganizationUnit,
      endOrganizationAssignment,
      getActiveOrganizationTerm,
      getOrganizationAssignmentById,
      getOrganizationRoleById,
      getOrganizationTermById,
      getOrganizationUnitById,
      listOrganizationAssignments,
      listOrganizationRoles,
      listOrganizationTerms,
      listOrganizationUnits,
      OrganizationAssignmentFilters,
      OrganizationAssignmentStatus,
      OrganizationRoleCategory,
      OrganizationRoleFilters,
      OrganizationRoleType,
      OrganizationTermFilters,
      OrganizationTermStatus,
      OrganizationUnitFilters,
      OrganizationUnitType,
      setActiveOrganizationTerm,
      updateOrganizationAssignment,
      updateOrganizationRole,
      updateOrganizationTerm,
      updateOrganizationUnit,
      UpdateOrganizationAssignmentInput,
      UpdateOrganizationRoleInput,
      UpdateOrganizationTermInput,
      UpdateOrganizationUnitInput,
} from "../db/organization";
import { getResidentById } from "../db/resident";
import { assignUserRoles, getUserRoleKeys, type RoleKey } from "../db/roles";
import { and, eq, sql } from "drizzle-orm";
import { normalizeText } from '../lib/utils';
import { getDb } from "../db/connection";
import { organizationUnitMembers, organizationUnits, residents, rooms } from "../../drizzle/schema";

/* =========================================================
 * ROLE INPUTS
 * ======================================================= */

export type ListRolesInput = {
      search?: string;
      category?: OrganizationRoleCategory | "all";
      isActive?: boolean;
      limit?: number;
      offset?: number;
};

export type CreateRoleInput = {
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

export type UpdateRoleInput = {
      id: number;
      code?: string;
      name?: string;
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

/* =========================================================
 * UNIT INPUTS
 * ======================================================= */

export type ListUnitsInput = {
      search?: string;
      unitType?: OrganizationUnitType | "all";
      isActive?: boolean;
      limit?: number;
      offset?: number;
};

export type CreateUnitInput = {
      code: string;
      name: string;
      unitType: OrganizationUnitType;
      description?: string | null;
      isActive?: boolean;
      sortOrder?: number;
};

export type UpdateUnitInput = {
      id: number;
      code?: string;
      name?: string;
      unitType?: OrganizationUnitType;
      description?: string | null;
      isActive?: boolean;
      sortOrder?: number;
};

export type UnitMemberRole = "member" | "leader" | "head";

export type ListUnitMembersInput = {
      unitId: number;
      status?: "active" | "inactive" | "all";
};

export type AddUnitMemberInput = {
      unitId: number;
      residentId: number;
      memberRole?: UnitMemberRole;
      startDate?: string | Date;
      notes?: string | null;
};

export type RemoveUnitMemberInput = {
      memberId: number;
      endDate?: string | Date;
};

export type TransferTeamMemberInput = {
      residentId: number;
      fromUnitId?: number | null;
      toUnitId: number;
      startDate?: string | Date;
      notes?: string | null;
};

/* =========================================================
 * TERM INPUTS
 * ======================================================= */

export type ListTermsInput = {
      search?: string;
      status?: OrganizationTermStatus | "all";
      limit?: number;
      offset?: number;
};

export type CreateTermInput = {
      code: string;
      name: string;
      startDate: string | Date;
      endDate: string | Date;
      status?: OrganizationTermStatus;
      description?: string | null;
};

export type UpdateTermInput = {
      id: number;
      code?: string;
      name?: string;
      startDate?: string | Date;
      endDate?: string | Date;
      status?: OrganizationTermStatus;
      description?: string | null;
};

/* =========================================================
 * ASSIGNMENT INPUTS
 * ======================================================= */

export type ListAssignmentsInput = {
      search?: string;
      termId?: number;
      roleId?: number;
      residentId?: number;
      status?: OrganizationAssignmentStatus | "all";
      limit?: number;
      offset?: number;
};

export type CreateAssignmentInput = {
      termId: number;
      roleId: number;
      residentId: number;
      roomId?: number | null;
      unitId?: number | null;
      assignmentTitle?: string | null;
      startDate: string | Date;
      endDate?: string | Date | null;
      status?: OrganizationAssignmentStatus;
      notes?: string | null;
};

export type UpdateAssignmentInput = {
      id: number;
      termId?: number;
      roleId?: number;
      residentId?: number;
      roomId?: number | null;
      unitId?: number | null;
      assignmentTitle?: string | null;
      startDate?: string | Date;
      endDate?: string | Date | null;
      status?: OrganizationAssignmentStatus;
      notes?: string | null;
};


const HOUSE_LEVEL_ROLE_TYPES = ["head", "deputy", "secretary", "treasurer"] as const;

type HouseLevelRoleType = (typeof HOUSE_LEVEL_ROLE_TYPES)[number];

const ORGANIZATION_ROLE_TO_APP_ROLE: Record<string, RoleKey> = {
      head: "house_leader" as RoleKey,
      deputy: "deputy" as RoleKey,
      secretary: "secretary" as RoleKey,
      treasurer: "treasurer" as RoleKey,
      team_leader: "team_leader" as RoleKey,
      committee_head: "committee_head" as RoleKey,
};

const DEFAULT_ORGANIZATION_ROLES: CreateRoleInput[] = [
      {
            code: "TRUONG",
            name: "Trưởng",
            category: "management",
            allowMultipleMembers: false,
            isActive: true,
            sortOrder: 1,
            level: 1,
            roleType: "head",
            minAssignees: 1,
            maxAssignees: 1,
            isSystem: true,
            requiresUnit: false,
      },
      {
            code: "PHO",
            name: "Phó",
            category: "management",
            allowMultipleMembers: true,
            isActive: true,
            sortOrder: 2,
            level: 1,
            roleType: "deputy",
            minAssignees: 0,
            maxAssignees: 2,
            isSystem: true,
            requiresUnit: false,
      },
      {
            code: "THU_KY",
            name: "Thư ký",
            category: "management",
            allowMultipleMembers: false,
            isActive: true,
            sortOrder: 3,
            level: 1,
            roleType: "secretary",
            minAssignees: 0,
            maxAssignees: 1,
            isSystem: true,
            requiresUnit: false,
      },
      {
            code: "THU_QUY",
            name: "Thủ quỹ",
            category: "finance",
            allowMultipleMembers: false,
            isActive: true,
            sortOrder: 4,
            level: 1,
            roleType: "treasurer",
            minAssignees: 0,
            maxAssignees: 1,
            isSystem: true,
            requiresUnit: false,
      },
      {
            code: "TO_TRUONG",
            name: "Tổ trưởng",
            category: "life",
            allowMultipleMembers: true,
            isActive: true,
            sortOrder: 10,
            level: 2,
            roleType: "team_leader",
            minAssignees: 0,
            maxAssignees: 1,
            isSystem: true,
            requiresUnit: true,
      },
      {
            code: "TRUONG_BAN",
            name: "Trưởng ban",
            category: "activity",
            allowMultipleMembers: true,
            isActive: true,
            sortOrder: 20,
            level: 2,
            roleType: "committee_head",
            minAssignees: 0,
            maxAssignees: 1,
            isSystem: true,
            requiresUnit: true,
      },
];

function getAppointmentRoleKey(role: any): RoleKey | null {
      const roleType = String(role?.roleType || "");
      return ORGANIZATION_ROLE_TO_APP_ROLE[roleType] ?? null;
}

function isHouseLevelRole(role: any): boolean {
      return HOUSE_LEVEL_ROLE_TYPES.includes(String(role?.roleType || "") as HouseLevelRoleType);
}


function normalizeRoleKey(value: unknown): string {
      return normalizeText(String(value || ""))
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
}

function normalizeRoleLabel(value: unknown): string {
      return normalizeText(String(value || ""))
            .replace(/[^a-z0-9]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();
}

function isTeamLeaderRole(role: any): boolean {
      const roleType = normalizeRoleKey(role?.roleType);
      const roleCode = normalizeRoleKey(role?.code);
      const roleName = normalizeRoleLabel(role?.name || role?.roleName);

      return (
            roleType === "team_leader" ||
            roleCode === "team_leader" ||
            roleCode === "to_truong" ||
            roleName.includes("to truong")
      );
}

function isCommitteeHeadRole(role: any): boolean {
      const roleType = normalizeRoleKey(role?.roleType);
      const roleCode = normalizeRoleKey(role?.code);
      const roleName = normalizeRoleLabel(role?.name || role?.roleName);

      return (
            roleType === "committee_head" ||
            roleCode === "committee_head" ||
            roleCode === "truong_ban" ||
            roleName.includes("truong ban")
      );
}

function roleRequiresUnit(role: any): boolean {
      return Boolean(
            role?.requiresUnit === true ||
            role?.requiresUnit === 1 ||
            role?.requiresUnit === "1" ||
            isTeamLeaderRole(role) ||
            isCommitteeHeadRole(role)
      );
}

class OrganizationService {

      private isTruthy(value: unknown) {
            return value === true || value === 1 || value === "1";
      }

      private getEffectiveMaxAssignees(role: any) {
            if (role?.maxAssignees !== null && role?.maxAssignees !== undefined) {
                  return Number(role.maxAssignees);
            }

            if (role?.allowMultipleMembers === false) {
                  return 1;
            }

            return null;
      }

      private async grantAppointmentRoleForAssignment(params: {
            residentId: number;
            roleId: number;
      }) {
            const resident = await getResidentById(params.residentId);
            const role = await getOrganizationRoleById(params.roleId);
            const appointmentRoleKey = getAppointmentRoleKey(role);

            if (!appointmentRoleKey) {
                  return;
            }

            if (!resident?.userId) {
                  throw new Error(
                        "Học viên chưa có tài khoản đăng nhập. Vui lòng tạo tài khoản học viên trước khi bổ nhiệm."
                  );
            }

            const currentRoleKeys = await getUserRoleKeys(resident.userId);
            const nextRoleKeys = Array.from(
                  new Set([
                        ...currentRoleKeys,
                        "resident",
                        appointmentRoleKey,
                  ])
            ) as RoleKey[];

            await assignUserRoles({
                  userId: resident.userId,
                  roleKeys: nextRoleKeys,
                  primaryRoleKey: currentRoleKeys.includes("manager")
                        ? "manager"
                        : "resident",
            });
      }

      private async revokeAppointmentRoleIfUnused(params: {
            residentId: number;
            roleId: number;
            excludeAssignmentId?: number;
      }) {
            const resident = await getResidentById(params.residentId);
            const role = await getOrganizationRoleById(params.roleId);
            const appointmentRoleKey = getAppointmentRoleKey(role);

            if (!resident?.userId || !appointmentRoleKey) {
                  return;
            }

            const activeAssignments = await listOrganizationAssignments({
                  residentId: params.residentId,
                  status: "active",
                  limit: 500,
                  offset: 0,
            });

            const stillHasSameAppointmentRole = activeAssignments.some(
                  (assignment: any) => {
                        if (assignment.id === params.excludeAssignmentId) {
                              return false;
                        }

                        const mappedRoleKey = ORGANIZATION_ROLE_TO_APP_ROLE[
                              String(assignment.roleType || "")
                        ];

                        return mappedRoleKey === appointmentRoleKey;
                  }
            );

            if (stillHasSameAppointmentRole) {
                  return;
            }

            const currentRoleKeys = await getUserRoleKeys(resident.userId);
            const nextRoleKeys = currentRoleKeys.filter(
                  (roleKey) => roleKey !== appointmentRoleKey
            ) as RoleKey[];

            if (nextRoleKeys.length === currentRoleKeys.length) {
                  return;
            }

            if (nextRoleKeys.length === 0) {
                  nextRoleKeys.push("resident" as RoleKey);
            }

            await assignUserRoles({
                  userId: resident.userId,
                  roleKeys: nextRoleKeys,
                  primaryRoleKey: nextRoleKeys.includes("manager" as RoleKey)
                        ? ("manager" as RoleKey)
                        : ("resident" as RoleKey),
            });
      }

      private async validateAssignmentRules(
            input: {
                  termId: number;
                  roleId: number;
                  residentId: number;
                  unitId?: number | null;
                  status?: OrganizationAssignmentStatus;
            },
            currentAssignmentId?: number
      ) {
            const term = await getOrganizationTermById(input.termId);

            if (!term) {
                  throw new Error("Không tìm thấy nhiệm kỳ được chọn.");
            }

            if (term.status === "closed") {
                  throw new Error("Nhiệm kỳ đã kết thúc, không thể bổ nhiệm thêm.");
            }

            const role = await getOrganizationRoleById(input.roleId);

            if (!role) {
                  throw new Error("Không tìm thấy chức vụ được chọn.");
            }

            if (!this.isTruthy(role.isActive)) {
                  throw new Error("Chức vụ này đã ngưng sử dụng, không thể bổ nhiệm.");
            }

            const resident = await getResidentById(input.residentId);

            if (!resident) {
                  throw new Error("Không tìm thấy học viên được chọn.");
            }

            if (resident.status !== "active") {
                  throw new Error("Chỉ có thể bổ nhiệm học viên đang lưu trú.");
            }

            if (roleRequiresUnit(role) && !input.unitId) {
                  throw new Error("Chức vụ này cần chọn Tổ/Ban phụ trách.");
            }

            if (input.unitId) {
                  const unit = await getOrganizationUnitById(input.unitId);

                  if (!unit) {
                        throw new Error("Không tìm thấy Tổ/Ban được chọn.");
                  }

                  if (!this.isTruthy(unit.isActive)) {
                        throw new Error("Tổ/Ban này đã ngưng sử dụng, không thể bổ nhiệm.");
                  }
            }

            if (input.status && input.status !== "active") {
                  return;
            }

            const activeAssignments = await listOrganizationAssignments({
                  termId: input.termId,
                  roleId: input.roleId,
                  status: "active",
                  limit: 500,
                  offset: 0,
            });

            const activeRows = activeAssignments.filter(
                  (assignment: any) => assignment.id !== currentAssignmentId
            );

            const duplicatedResident = activeRows.some(
                  (assignment: any) => Number(assignment.residentId) === Number(input.residentId)
            );

            if (duplicatedResident) {
                  throw new Error(
                        "Học viên này đã được bổ nhiệm vào chức vụ này trong nhiệm kỳ đã chọn."
                  );
            }

            if (isHouseLevelRole(role)) {
                  const residentActiveAssignments = await listOrganizationAssignments({
                        termId: input.termId,
                        residentId: input.residentId,
                        status: "active",
                        limit: 500,
                        offset: 0,
                  });

                  const existingHouseRole = residentActiveAssignments.find(
                        (assignment: any) =>
                              assignment.id !== currentAssignmentId &&
                              HOUSE_LEVEL_ROLE_TYPES.includes(
                                    String(assignment.roleType || "") as HouseLevelRoleType
                              )
                  );

                  if (existingHouseRole) {
                        throw new Error(
                              `Học viên này đang giữ vai trò "${existingHouseRole.assignmentTitle || existingHouseRole.roleName}" trong nhiệm kỳ này. Không thể kiêm nhiệm thêm Trưởng/Phó/Thư ký/Thủ quỹ.`
                        );
                  }
            }

            const effectiveMaxAssignees = this.getEffectiveMaxAssignees(role);

            if (effectiveMaxAssignees !== null && effectiveMaxAssignees > 0) {
                  const roleIsTeamLeader = isTeamLeaderRole(role);
                  const roleIsCommitteeHead = isCommitteeHeadRole(role);
                  const roleIsUnitScoped = roleIsTeamLeader || roleIsCommitteeHead;

                  const rowsForLimit = roleIsUnitScoped
                        ? activeRows.filter(
                              (assignment: any) =>
                                    Number(assignment.unitId || 0) === Number(input.unitId || 0)
                        )
                        : activeRows;

                  if (rowsForLimit.length >= effectiveMaxAssignees) {
                        if (roleIsTeamLeader) {
                              throw new Error(
                                    `Tổ này đã có Tổ trưởng. Mỗi Tổ chỉ được phân công tối đa ${effectiveMaxAssignees} Tổ trưởng.`
                              );
                        }

                        if (roleIsCommitteeHead) {
                              throw new Error(
                                    `Ban này đã có Trưởng ban. Mỗi Ban chỉ được phân công tối đa ${effectiveMaxAssignees} Trưởng ban.`
                              );
                        }

                        throw new Error(
                              `Chức vụ này chỉ cho phép tối đa ${effectiveMaxAssignees} người trong nhiệm kỳ này.`
                        );
                  }
            }
      }

      /* =========================================================
       * ROLES
       * ======================================================= */

      async ensureDefaultOrganizationRoles() {
            const existingRoles = await listOrganizationRoles({
                  limit: 500,
                  offset: 0,
            });

            const existingCodes = new Set(
                  existingRoles.map((role: any) => String(role.code || "").toUpperCase())
            );

            let createdCount = 0;

            for (const role of DEFAULT_ORGANIZATION_ROLES) {
                  if (existingCodes.has(String(role.code).toUpperCase())) {
                        continue;
                  }

                  await createOrganizationRole({
                        code: role.code,
                        name: role.name,
                        category: role.category,
                        description: role.description || null,
                        allowMultipleMembers: role.allowMultipleMembers,
                        isActive: role.isActive,
                        sortOrder: role.sortOrder,
                        level: role.level,
                        roleType: role.roleType,
                        minAssignees: role.minAssignees,
                        maxAssignees: role.maxAssignees,
                        isSystem: role.isSystem,
                        requiresUnit: role.requiresUnit,
                  });

                  createdCount += 1;
            }

            return {
                  success: true,
                  createdCount,
                  message:
                        createdCount > 0
                              ? "Đã tạo các chức vụ mặc định."
                              : "Các chức vụ mặc định đã có sẵn.",
            };
      }

      async listRoles(input?: ListRolesInput) {
            const filters: OrganizationRoleFilters = {
                  search: input?.search,
                  category: input?.category,
                  isActive: input?.isActive,
                  limit: input?.limit ?? 200,
                  offset: input?.offset ?? 0,
            };

            return await listOrganizationRoles(filters);
      }

      async getRoleById(id: number) {
            if (!id || id <= 0) {
                  throw new Error("ID vai trò không hợp lệ.");
            }

            const role = await getOrganizationRoleById(id);

            if (!role) {
                  throw new Error("Không tìm thấy vai trò.");
            }

            return role;
      }

      async createRole(input: CreateRoleInput) {
            if (!input.code?.trim()) {
                  throw new Error("Vui lòng nhập mã vai trò.");
            }

            if (!input.name?.trim()) {
                  throw new Error("Vui lòng nhập tên vai trò.");
            }

            const payload: CreateOrganizationRoleInput = {
                  code: input.code,
                  name: input.name,
                  category: input.category || "other",
                  description: input.description || null,
                  allowMultipleMembers: input.allowMultipleMembers ?? true,
                  isActive: input.isActive ?? true,
                  sortOrder: input.sortOrder ?? 0,
                  level: input.level ?? 3,
                  roleType: input.roleType ?? "custom",
                  minAssignees: input.minAssignees ?? 0,
                  maxAssignees: input.maxAssignees ?? null,
                  isSystem: input.isSystem ?? false,
                  requiresUnit: input.requiresUnit ?? false,
            };

            await createOrganizationRole(payload);

            return {
                  success: true,
                  message: "Đã tạo vai trò tổ chức.",
            };
      }

      async updateRole(input: UpdateRoleInput) {
            if (!input.id || input.id <= 0) {
                  throw new Error("ID vai trò không hợp lệ.");
            }

            const existing = await getOrganizationRoleById(input.id);

            if (!existing) {
                  throw new Error("Không tìm thấy vai trò cần cập nhật.");
            }

            const payload: UpdateOrganizationRoleInput = {
                  code: input.code,
                  name: input.name,
                  category: input.category,
                  description: input.description,
                  allowMultipleMembers: input.allowMultipleMembers,
                  isActive: input.isActive,
                  sortOrder: input.sortOrder,
                  level: input.level,
                  roleType: input.roleType,
                  minAssignees: input.minAssignees,
                  maxAssignees: input.maxAssignees,
                  isSystem: input.isSystem,
                  requiresUnit: input.requiresUnit,
            };

            await updateOrganizationRole(input.id, payload);

            return {
                  success: true,
                  message: "Đã cập nhật vai trò tổ chức.",
            };
      }

      async deleteRole(id: number) {
            if (!id || id <= 0) {
                  throw new Error("ID vai trò không hợp lệ.");
            }

            await deleteOrganizationRole(id);

            return {
                  success: true,
                  message: "Đã xóa vai trò tổ chức.",
            };
      }

      async toggleRoleActive(id: number) {
            if (!id || id <= 0) {
                  throw new Error("ID vai trò không hợp lệ.");
            }

            const existing = await getOrganizationRoleById(id);

            if (!existing) {
                  throw new Error("Không tìm thấy vai trò cần cập nhật.");
            }

            await updateOrganizationRole(id, {
                  isActive: !existing.isActive,
            });

            return {
                  success: true,
                  message: existing.isActive
                        ? "Đã ngưng sử dụng vai trò."
                        : "Đã kích hoạt vai trò.",
            };
      }

      /* =========================================================
       * UNITS
       * ======================================================= */

      async listUnits(input?: ListUnitsInput) {
            /*
             * Giữ nguyên logic lấy Tổ/Ban gốc từ db/organization.
             * Chỉ bổ sung số lượng thành viên sau khi đã có danh sách units.
             * Nếu phần đếm member lỗi vì migration/table chưa sẵn sàng,
             * vẫn trả về units để không làm mất dữ liệu Tổ/Ban trên UI.
             */
            const filters: OrganizationUnitFilters = {
                  search: input?.search,
                  unitType: input?.unitType,
                  isActive: input?.isActive,
                  limit: input?.limit ?? 200,
                  offset: input?.offset ?? 0,
            };

            const units = await listOrganizationUnits(filters);

            if (!units.length) {
                  return units;
            }

            try {
                  const db = getDb();

                  const memberCounts = await db
                        .select({
                              unitId: organizationUnitMembers.unitId,
                              activeMemberCount: sql<number>`count(*)`,
                        })
                        .from(organizationUnitMembers)
                        .where(eq(organizationUnitMembers.status, "active"))
                        .groupBy(organizationUnitMembers.unitId);

                  const countByUnitId = new Map(
                        memberCounts.map((item: any) => [
                              Number(item.unitId),
                              Number(item.activeMemberCount || 0),
                        ])
                  );

                  return units.map((unit: any) => ({
                        ...unit,
                        memberCount: countByUnitId.get(Number(unit.id)) || 0,
                        activeMemberCount: countByUnitId.get(Number(unit.id)) || 0,
                  }));
            } catch (error) {
                  console.warn(
                        "[organizationService.listUnits] Cannot load member counts. Returning units without counts.",
                        error
                  );

                  return units.map((unit: any) => ({
                        ...unit,
                        memberCount: Number((unit as any).memberCount || 0),
                        activeMemberCount: Number((unit as any).activeMemberCount || 0),
                  }));
            }
      }

      async getUnitById(id: number) {
            if (!id || id <= 0) {
                  throw new Error("ID Tổ/Ban không hợp lệ.");
            }

            const unit = await getOrganizationUnitById(id);

            if (!unit) {
                  throw new Error("Không tìm thấy Tổ/Ban.");
            }

            return unit;
      }

      async createUnit(input: CreateUnitInput) {
            if (!input.code?.trim()) {
                  throw new Error("Vui lòng nhập mã Tổ/Ban.");
            }

            if (!input.name?.trim()) {
                  throw new Error("Vui lòng nhập tên Tổ/Ban.");
            }

            if (!input.unitType) {
                  throw new Error("Vui lòng chọn loại Tổ/Ban.");
            }

            const payload: CreateOrganizationUnitInput = {
                  code: input.code,
                  name: input.name,
                  unitType: input.unitType,
                  description: input.description || null,
                  isActive: input.isActive ?? true,
                  sortOrder: input.sortOrder ?? 0,
            };

            await createOrganizationUnit(payload);

            return {
                  success: true,
                  message: "Đã tạo Tổ/Ban.",
            };
      }

      async updateUnit(input: UpdateUnitInput) {
            if (!input.id || input.id <= 0) {
                  throw new Error("ID Tổ/Ban không hợp lệ.");
            }

            const existing = await getOrganizationUnitById(input.id);

            if (!existing) {
                  throw new Error("Không tìm thấy Tổ/Ban cần cập nhật.");
            }

            const payload: UpdateOrganizationUnitInput = {
                  code: input.code,
                  name: input.name,
                  unitType: input.unitType,
                  description: input.description,
                  isActive: input.isActive,
                  sortOrder: input.sortOrder,
            };

            await updateOrganizationUnit(input.id, payload);

            return {
                  success: true,
                  message: "Đã cập nhật Tổ/Ban.",
            };
      }

      async deleteUnit(id: number) {
            if (!id || id <= 0) {
                  throw new Error("ID Tổ/Ban không hợp lệ.");
            }

            await deleteOrganizationUnit(id);

            return {
                  success: true,
                  message: "Đã xóa Tổ/Ban.",
            };
      }

      async toggleUnitActive(id: number) {
            if (!id || id <= 0) {
                  throw new Error("ID Tổ/Ban không hợp lệ.");
            }

            const existing = await getOrganizationUnitById(id);

            if (!existing) {
                  throw new Error("Không tìm thấy Tổ/Ban cần cập nhật.");
            }

            await updateOrganizationUnit(id, {
                  isActive: !existing.isActive,
            });

            return {
                  success: true,
                  message: existing.isActive
                        ? "Đã ngưng sử dụng Tổ/Ban."
                        : "Đã kích hoạt Tổ/Ban.",
            };
      }


      /* =========================================================
       * UNIT MEMBERS
       * ======================================================= */

      private normalizeDateInput(value?: string | Date | null) {
            if (!value) {
                  return new Date().toISOString().split("T")[0];
            }

            if (value instanceof Date) {
                  return value.toISOString().split("T")[0];
            }

            return String(value).slice(0, 10);
      }

      private async getActiveTeamMembershipForResident(residentId: number, excludeUnitId?: number | null) {
            const db = getDb();

            const rows = await db
                  .select({
                        id: organizationUnitMembers.id,
                        unitId: organizationUnitMembers.unitId,
                        unitName: organizationUnits.name,
                        unitType: organizationUnits.unitType,
                  })
                  .from(organizationUnitMembers)
                  .innerJoin(
                        organizationUnits,
                        eq(organizationUnitMembers.unitId, organizationUnits.id)
                  )
                  .where(
                        and(
                              eq(organizationUnitMembers.residentId, residentId),
                              eq(organizationUnitMembers.status, "active"),
                              eq(organizationUnits.unitType, "team")
                        )
                  );

            return rows.find((row: any) => Number(row.unitId) !== Number(excludeUnitId || 0)) || null;
      }

      async listUnitMembers(input: ListUnitMembersInput) {
            if (!input.unitId || input.unitId <= 0) {
                  throw new Error("ID Tổ/Ban không hợp lệ.");
            }

            const db = getDb();

            const status = input.status || "active";
            const conditions: any[] = [eq(organizationUnitMembers.unitId, input.unitId)];

            if (status !== "all") {
                  conditions.push(eq(organizationUnitMembers.status, status));
            }

            const rows = await db
                  .select({
                        id: organizationUnitMembers.id,
                        unitId: organizationUnitMembers.unitId,
                        residentId: organizationUnitMembers.residentId,
                        memberRole: organizationUnitMembers.memberRole,
                        status: organizationUnitMembers.status,
                        startDate: organizationUnitMembers.startDate,
                        endDate: organizationUnitMembers.endDate,
                        notes: organizationUnitMembers.notes,
                        residentName: residents.fullName,
                        residentCode: residents.residentCode,
                        holyName: residents.holyName,
                        phoneNumber: residents.phoneNumber,
                        residentStatus: residents.status,
                        roomId: rooms.id,
                        roomCode: rooms.roomCode,
                        roomName: rooms.roomCode,
                  })
                  .from(organizationUnitMembers)
                  .innerJoin(residents, eq(organizationUnitMembers.residentId, residents.id))
                  .leftJoin(rooms, eq(residents.currentRoomId, rooms.id))
                  .where(and(...conditions));

            return rows;
      }

      async getAvailableResidentsForUnit(unitId: number) {
            if (!unitId || unitId <= 0) {
                  throw new Error("ID Tổ/Ban không hợp lệ.");
            }

            const unit = await getOrganizationUnitById(unitId);

            if (!unit) {
                  throw new Error("Không tìm thấy Tổ/Ban.");
            }

            const db = getDb();

            const activeResidents = await db
                  .select({
                        id: residents.id,
                        fullName: residents.fullName,
                        residentCode: residents.residentCode,
                        holyName: residents.holyName,
                        phoneNumber: residents.phoneNumber,
                        currentRoomId: residents.currentRoomId,
                  })
                  .from(residents)
                  .where(eq(residents.status, "active"));

            const activeMemberships = await db
                  .select({
                        residentId: organizationUnitMembers.residentId,
                        unitId: organizationUnitMembers.unitId,
                        unitType: organizationUnits.unitType,
                  })
                  .from(organizationUnitMembers)
                  .innerJoin(
                        organizationUnits,
                        eq(organizationUnitMembers.unitId, organizationUnits.id)
                  )
                  .where(eq(organizationUnitMembers.status, "active"));

            const activeSameUnitResidentIds = new Set(
                  activeMemberships
                        .filter((item: any) => Number(item.unitId) === Number(unitId))
                        .map((item: any) => Number(item.residentId))
            );

            const activeTeamResidentIds = new Set(
                  activeMemberships
                        .filter((item: any) => item.unitType === "team")
                        .map((item: any) => Number(item.residentId))
            );

            return activeResidents
                  .filter((resident: any) => {
                        if (activeSameUnitResidentIds.has(Number(resident.id))) {
                              return false;
                        }

                        if (unit.unitType === "team" && activeTeamResidentIds.has(Number(resident.id))) {
                              return false;
                        }

                        return true;
                  })
                  .map((resident: any) => ({
                        ...resident,
                        displayName: `${resident.holyName ? `${resident.holyName} ` : ""}${resident.fullName}`.trim(),
                  }));
      }

      async addUnitMember(input: AddUnitMemberInput) {
            if (!input.unitId || input.unitId <= 0) {
                  throw new Error("Vui lòng chọn Tổ/Ban.");
            }

            if (!input.residentId || input.residentId <= 0) {
                  throw new Error("Vui lòng chọn học viên.");
            }

            const unit = await getOrganizationUnitById(input.unitId);

            if (!unit) {
                  throw new Error("Không tìm thấy Tổ/Ban.");
            }

            if (!this.isTruthy(unit.isActive)) {
                  throw new Error("Tổ/Ban này đã ngưng sử dụng.");
            }

            const resident = await getResidentById(input.residentId);

            if (!resident) {
                  throw new Error("Không tìm thấy học viên.");
            }

            if (resident.status !== "active") {
                  throw new Error("Chỉ có thể thêm học viên đang lưu trú.");
            }

            const db = getDb();

            const existingSameUnit = await db
                  .select()
                  .from(organizationUnitMembers)
                  .where(
                        and(
                              eq(organizationUnitMembers.unitId, input.unitId),
                              eq(organizationUnitMembers.residentId, input.residentId),
                              eq(organizationUnitMembers.status, "active")
                        )
                  )
                  .limit(1);

            if (existingSameUnit[0]) {
                  throw new Error("Học viên này đã có trong Tổ/Ban.");
            }

            if (unit.unitType === "team") {
                  const existingTeam = await this.getActiveTeamMembershipForResident(
                        input.residentId,
                        input.unitId
                  );

                  if (existingTeam) {
                        throw new Error(
                              `Học viên này đang thuộc ${existingTeam.unitName}. Vui lòng dùng chức năng chuyển tổ.`
                        );
                  }
            }

            await db.insert(organizationUnitMembers).values({
                  unitId: input.unitId,
                  residentId: input.residentId,
                  memberRole: input.memberRole || "member",
                  status: "active",
                  startDate: this.normalizeDateInput(input.startDate),
                  endDate: null,
                  notes: input.notes?.trim() || null,
            } as any);

            return {
                  success: true,
                  message: "Đã thêm thành viên vào Tổ/Ban.",
            };
      }

      async removeUnitMember(input: RemoveUnitMemberInput) {
            if (!input.memberId || input.memberId <= 0) {
                  throw new Error("ID thành viên không hợp lệ.");
            }

            const db = getDb();

            await db
                  .update(organizationUnitMembers)
                  .set({
                        status: "inactive",
                        endDate: this.normalizeDateInput(input.endDate),
                        updatedAt: new Date(),
                  } as any)
                  .where(eq(organizationUnitMembers.id, input.memberId));

            return {
                  success: true,
                  message: "Đã gỡ thành viên khỏi Tổ/Ban.",
            };
      }

      async transferTeamMember(input: TransferTeamMemberInput) {
            if (!input.residentId || input.residentId <= 0) {
                  throw new Error("Vui lòng chọn học viên.");
            }

            if (!input.toUnitId || input.toUnitId <= 0) {
                  throw new Error("Vui lòng chọn Tổ chuyển đến.");
            }

            const targetUnit = await getOrganizationUnitById(input.toUnitId);

            if (!targetUnit || targetUnit.unitType !== "team") {
                  throw new Error("Đơn vị chuyển đến phải là Tổ.");
            }

            if (!this.isTruthy(targetUnit.isActive)) {
                  throw new Error("Tổ chuyển đến đã ngưng sử dụng.");
            }

            const resident = await getResidentById(input.residentId);

            if (!resident || resident.status !== "active") {
                  throw new Error("Chỉ có thể chuyển tổ cho học viên đang lưu trú.");
            }

            const db = getDb();
            const transferDate = this.normalizeDateInput(input.startDate);

            const activeTeamMemberships = await db
                  .select({
                        id: organizationUnitMembers.id,
                        unitId: organizationUnitMembers.unitId,
                        memberRole: organizationUnitMembers.memberRole,
                        unitName: organizationUnits.name,
                  })
                  .from(organizationUnitMembers)
                  .innerJoin(
                        organizationUnits,
                        eq(organizationUnitMembers.unitId, organizationUnits.id)
                  )
                  .where(
                        and(
                              eq(organizationUnitMembers.residentId, input.residentId),
                              eq(organizationUnitMembers.status, "active"),
                              eq(organizationUnits.unitType, "team")
                        )
                  );

            const sameTargetMembership = activeTeamMemberships.find(
                  (membership: any) => Number(membership.unitId) === Number(input.toUnitId)
            );

            if (sameTargetMembership) {
                  throw new Error("Học viên đã thuộc Tổ này.");
            }

            const leaderMembership = activeTeamMemberships.find(
                  (membership: any) => membership.memberRole === "leader"
            );

            if (leaderMembership) {
                  throw new Error(
                        `Học viên này đang là Tổ trưởng của ${leaderMembership.unitName || "một Tổ khác"}. Vui lòng cập nhật hoặc kết thúc vai trò Tổ trưởng trước khi chuyển tổ.`
                  );
            }

            for (const membership of activeTeamMemberships) {
                  await db
                        .update(organizationUnitMembers)
                        .set({
                              status: "inactive",
                              endDate: transferDate,
                              updatedAt: new Date(),
                        } as any)
                        .where(eq(organizationUnitMembers.id, membership.id));
            }

            await db.insert(organizationUnitMembers).values({
                  unitId: input.toUnitId,
                  residentId: input.residentId,
                  memberRole: "member",
                  status: "active",
                  startDate: transferDate,
                  endDate: null,
                  notes: input.notes?.trim() || "Chuyển tổ từ màn quản lý thành viên Tổ/Ban",
            } as any);

            return {
                  success: true,
                  message: `Đã chuyển học viên sang ${targetUnit.name || "Tổ mới"}.`,
            };
      }


      /* =========================================================
       * TERMS
       * ======================================================= */

      async listTerms(input?: ListTermsInput) {
            const filters: OrganizationTermFilters = {
                  search: input?.search,
                  status: input?.status,
                  limit: input?.limit ?? 200,
                  offset: input?.offset ?? 0,
            };

            return await listOrganizationTerms(filters);
      }

      async getTermById(id: number) {
            if (!id || id <= 0) {
                  throw new Error("ID nhiệm kỳ không hợp lệ.");
            }

            const term = await getOrganizationTermById(id);

            if (!term) {
                  throw new Error("Không tìm thấy nhiệm kỳ.");
            }

            return term;
      }

      async getActiveTerm() {
            return await getActiveOrganizationTerm();
      }

      async createTerm(input: CreateTermInput) {
            if (!input.code?.trim()) {
                  throw new Error("Vui lòng nhập mã nhiệm kỳ.");
            }

            if (!input.name?.trim()) {
                  throw new Error("Vui lòng nhập tên nhiệm kỳ.");
            }

            if (!input.startDate) {
                  throw new Error("Vui lòng chọn ngày bắt đầu.");
            }

            if (!input.endDate) {
                  throw new Error("Vui lòng chọn ngày kết thúc.");
            }

            const payload: CreateOrganizationTermInput = {
                  code: input.code,
                  name: input.name,
                  startDate: input.startDate,
                  endDate: input.endDate,
                  status: input.status || "inactive",
                  description: input.description || null,
            };

            await createOrganizationTerm(payload);

            return {
                  success: true,
                  message: "Đã tạo nhiệm kỳ tổ chức.",
            };
      }

      async updateTerm(input: UpdateTermInput) {
            if (!input.id || input.id <= 0) {
                  throw new Error("ID nhiệm kỳ không hợp lệ.");
            }

            const existing = await getOrganizationTermById(input.id);

            if (!existing) {
                  throw new Error("Không tìm thấy nhiệm kỳ cần cập nhật.");
            }

            const payload: UpdateOrganizationTermInput = {
                  code: input.code,
                  name: input.name,
                  startDate: input.startDate,
                  endDate: input.endDate,
                  status: input.status,
                  description: input.description,
            };

            await updateOrganizationTerm(input.id, payload);

            return {
                  success: true,
                  message: "Đã cập nhật nhiệm kỳ tổ chức.",
            };
      }

      async deleteTerm(id: number) {
            if (!id || id <= 0) {
                  throw new Error("ID nhiệm kỳ không hợp lệ.");
            }

            await deleteOrganizationTerm(id);

            return {
                  success: true,
                  message: "Đã xóa nhiệm kỳ tổ chức.",
            };
      }

      async setActiveTerm(id: number) {
            if (!id || id <= 0) {
                  throw new Error("ID nhiệm kỳ không hợp lệ.");
            }

            return await setActiveOrganizationTerm(id);
      }

      /* =========================================================
       * ASSIGNMENTS
       * ======================================================= */

      async listAssignments(input?: ListAssignmentsInput) {
            const filters: OrganizationAssignmentFilters = {
                  search: input?.search,
                  termId: input?.termId,
                  roleId: input?.roleId,
                  residentId: input?.residentId,
                  status: input?.status,
                  limit: input?.limit ?? 200,
                  offset: input?.offset ?? 0,
            };

            return await listOrganizationAssignments(filters);
      }

      async getAssignmentById(id: number) {
            if (!id || id <= 0) {
                  throw new Error("ID phân công không hợp lệ.");
            }

            const assignment = await getOrganizationAssignmentById(id);

            if (!assignment) {
                  throw new Error("Không tìm thấy phân công.");
            }

            return assignment;
      }


      private async ensureUnitMembershipForAssignment(input: {
            residentId: number;
            roleId: number;
            unitId?: number | null;
      }) {
            if (!input.unitId || input.unitId <= 0) return;

            const role = await getOrganizationRoleById(input.roleId);
            if (!role) return;

            const unit = await getOrganizationUnitById(input.unitId);
            if (!unit) return;

            const isTeamLeader = isTeamLeaderRole(role);
            const isCommitteeHead = isCommitteeHeadRole(role);

            if (!isTeamLeader && !isCommitteeHead) return;

            if (isTeamLeader && unit.unitType !== "team") return;
            if (isCommitteeHead && unit.unitType !== "committee") return;

            const db = getDb();

            const existingSameUnit = await db
                  .select()
                  .from(organizationUnitMembers)
                  .where(
                        and(
                              eq(organizationUnitMembers.unitId, input.unitId),
                              eq(organizationUnitMembers.residentId, input.residentId),
                              eq(organizationUnitMembers.status, "active")
                        )
                  )
                  .limit(1);

            if (existingSameUnit[0]) {
                  return;
            }

            if (isTeamLeader) {
                  const existingTeam = await this.getActiveTeamMembershipForResident(
                        input.residentId,
                        input.unitId
                  );

                  if (existingTeam) {
                        throw new Error(
                              `Học viên này đang thuộc ${existingTeam.unitName}. Cần xác nhận chuyển tổ trước khi bổ nhiệm Tổ trưởng sang tổ khác.`
                        );
                  }
            }

            await db.insert(organizationUnitMembers).values({
                  unitId: input.unitId,
                  residentId: input.residentId,
                  memberRole: isTeamLeader ? "leader" : "head",
                  status: "active",
                  startDate: this.normalizeDateInput(),
                  endDate: null,
                  notes: isTeamLeader
                        ? "Tự động thêm khi bổ nhiệm Tổ trưởng."
                        : "Tự động thêm khi bổ nhiệm Trưởng ban.",
            } as any);
      }

      async syncUnitLeadersToMembers() {
            const assignments = await listOrganizationAssignments({
                  status: "active",
                  limit: 1000,
                  offset: 0,
            });

            const result = {
                  createdOrUpdated: 0,
                  skipped: 0,
                  errors: [] as string[],
            };

            for (const assignment of assignments as any[]) {
                  if (!assignment?.residentId || !assignment?.roleId || !assignment?.unitId) {
                        result.skipped += 1;
                        continue;
                  }

                  const role = await getOrganizationRoleById(Number(assignment.roleId));
                  const isSupportedRole = role && (isTeamLeaderRole(role) || isCommitteeHeadRole(role));

                  if (!isSupportedRole) {
                        result.skipped += 1;
                        continue;
                  }

                  try {
                        await this.ensureUnitMembershipForAssignment({
                              residentId: Number(assignment.residentId),
                              roleId: Number(assignment.roleId),
                              unitId: Number(assignment.unitId),
                        });
                        result.createdOrUpdated += 1;
                  } catch (error: any) {
                        result.errors.push(
                              error?.message || `Không thể đồng bộ phân công ${assignment.id || ""}.`
                        );
                  }
            }

            return {
                  success: true,
                  message: `Đã đồng bộ ${result.createdOrUpdated} người phụ trách vào danh sách thành viên.`,
                  ...result,
            };
      }

      async createAssignment(input: CreateAssignmentInput) {
            if (!input.termId || input.termId <= 0) {
                  throw new Error("Vui lòng chọn nhiệm kỳ.");
            }

            if (!input.roleId || input.roleId <= 0) {
                  throw new Error("Vui lòng chọn vai trò.");
            }

            if (!input.residentId || input.residentId <= 0) {
                  throw new Error("Vui lòng chọn học viên.");
            }

            if (!input.startDate) {
                  throw new Error("Vui lòng chọn ngày bắt đầu.");
            }

            await this.validateAssignmentRules({
                  termId: input.termId,
                  roleId: input.roleId,
                  residentId: input.residentId,
                  unitId: input.unitId ?? null,
                  status: input.status || "active",
            });

            const payload: CreateOrganizationAssignmentInput = {
                  termId: input.termId,
                  roleId: input.roleId,
                  residentId: input.residentId,
                  roomId: input.roomId ?? null,
                  unitId: input.unitId ?? null,
                  assignmentTitle: input.assignmentTitle?.trim() || null,
                  startDate: input.startDate,
                  endDate: input.endDate ?? null,
                  status: input.status || "active",
                  notes: input.notes || null,
            };

            await createOrganizationAssignment(payload);

            if (payload.status === "active") {
                  await this.grantAppointmentRoleForAssignment({
                        residentId: payload.residentId,
                        roleId: payload.roleId,
                  });

                  await this.ensureUnitMembershipForAssignment({
                        residentId: payload.residentId,
                        roleId: payload.roleId,
                        unitId: payload.unitId,
                  });
            }

            return {
                  success: true,
                  message: "Đã tạo phân công tổ chức.",
            };
      }

      async updateAssignment(input: UpdateAssignmentInput) {
            if (!input.id || input.id <= 0) {
                  throw new Error("ID phân công không hợp lệ.");
            }

            const existing = await getOrganizationAssignmentById(input.id);

            if (!existing) {
                  throw new Error("Không tìm thấy phân công cần cập nhật.");
            }

            const mergedAssignment = {
                  termId: input.termId ?? existing.termId,
                  roleId: input.roleId ?? existing.roleId,
                  residentId: input.residentId ?? existing.residentId,
                  unitId:
                        input.unitId !== undefined
                              ? input.unitId
                              : existing.unitId ?? null,
                  status: input.status ?? existing.status,
            };

            await this.validateAssignmentRules(mergedAssignment, input.id);

            const payload: UpdateOrganizationAssignmentInput = {
                  termId: input.termId,
                  roleId: input.roleId,
                  residentId: input.residentId,
                  roomId: input.roomId,
                  unitId: input.unitId,
                  assignmentTitle:
                        input.assignmentTitle !== undefined
                              ? input.assignmentTitle?.trim() || null
                              : undefined,
                  startDate: input.startDate,
                  endDate: input.endDate,
                  status: input.status,
                  notes: input.notes,
            };

            const oldResidentId = existing.residentId;
            const oldRoleId = existing.roleId;
            const oldStatus = existing.status;

            await updateOrganizationAssignment(input.id, payload);

            const nextResidentId = mergedAssignment.residentId;
            const nextRoleId = mergedAssignment.roleId;
            const nextStatus = mergedAssignment.status;

            if (oldStatus === "active") {
                  await this.revokeAppointmentRoleIfUnused({
                        residentId: oldResidentId,
                        roleId: oldRoleId,
                        excludeAssignmentId: input.id,
                  });
            }

            if (nextStatus === "active") {
                  await this.grantAppointmentRoleForAssignment({
                        residentId: nextResidentId,
                        roleId: nextRoleId,
                  });

                  await this.ensureUnitMembershipForAssignment({
                        residentId: nextResidentId,
                        roleId: nextRoleId,
                        unitId: mergedAssignment.unitId,
                  });
            }

            return {
                  success: true,
                  message: "Đã cập nhật phân công tổ chức.",
            };
      }

      async endAssignment(id: number) {
            if (!id || id <= 0) {
                  throw new Error("ID phân công không hợp lệ.");
            }

            const existing = await getOrganizationAssignmentById(id);

            if (!existing) {
                  throw new Error("Không tìm thấy phân công cần kết thúc.");
            }

            await endOrganizationAssignment(id);

            await this.revokeAppointmentRoleIfUnused({
                  residentId: existing.residentId,
                  roleId: existing.roleId,
                  excludeAssignmentId: id,
            });

            return {
                  success: true,
                  message: "Đã kết thúc phân công tổ chức.",
            };
      }

      async deleteAssignment(id: number) {
            if (!id || id <= 0) {
                  throw new Error("ID phân công không hợp lệ.");
            }

            const existing = await getOrganizationAssignmentById(id);

            await deleteOrganizationAssignment(id);

            if (existing?.status === "active") {
                  await this.revokeAppointmentRoleIfUnused({
                        residentId: existing.residentId,
                        roleId: existing.roleId,
                        excludeAssignmentId: id,
                  });
            }

            return {
                  success: true,
                  message: "Đã xóa phân công tổ chức.",
            };
      }

      async getActiveAssignmentsByResident(residentId: number) {
            if (!residentId || residentId <= 0) {
                  throw new Error("ID học viên không hợp lệ.");
            }

            return await listOrganizationAssignments({
                  residentId,
                  status: "active",
                  limit: 200,
                  offset: 0,
            });
      }

      async hasActiveAssignmentsByResident(residentId: number) {
            const assignments = await this.getActiveAssignmentsByResident(residentId);

            return {
                  hasActiveAssignments: assignments.length > 0,
                  assignments,
            };
      }
}

export const organizationService = new OrganizationService();
