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

class OrganizationService {
      /* =========================================================
       * ROLES
       * ======================================================= */

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

            await updateOrganizationAssignment(input.id, payload);

            return {
                  success: true,
                  message: "Đã cập nhật phân công tổ chức.",
            };
      }

      async endAssignment(id: number) {
            if (!id || id <= 0) {
                  throw new Error("ID phân công không hợp lệ.");
            }

            await endOrganizationAssignment(id);

            return {
                  success: true,
                  message: "Đã kết thúc phân công tổ chức.",
            };
      }

      async deleteAssignment(id: number) {
            if (!id || id <= 0) {
                  throw new Error("ID phân công không hợp lệ.");
            }

            await deleteOrganizationAssignment(id);

            return {
                  success: true,
                  message: "Đã xóa phân công tổ chức.",
            };
      }
}

export const organizationService = new OrganizationService();
