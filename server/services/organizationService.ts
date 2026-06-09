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

function normalizeText(value?: string | null) {
      return (value || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
}

function isTeamLeaderRole(role: any): boolean {
      const roleType = normalizeText(String(role?.roleType || ""));
      const roleCode = normalizeText(String(role?.code || ""));
      const roleName = normalizeText(String(role?.name || role?.roleName || ""));

      return (
            roleType === "team_leader" ||
            roleCode === "to_truong" ||
            roleCode.includes("to_truong") ||
            roleName.includes("to truong")
      );
}

function isCommitteeHeadRole(role: any): boolean {
      const roleType = normalizeText(String(role?.roleType || ""));
      const roleCode = normalizeText(String(role?.code || ""));
      const roleName = normalizeText(String(role?.name || role?.roleName || ""));

      return (
            roleType === "committee_head" ||
            roleCode === "truong_ban" ||
            roleCode.includes("truong_ban") ||
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
            const filters: OrganizationUnitFilters = {
                  search: input?.search,
                  unitType: input?.unitType,
                  isActive: input?.isActive,
                  limit: input?.limit ?? 200,
                  offset: input?.offset ?? 0,
            };

            return await listOrganizationUnits(filters);
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
