import * as db from "../db";
import {
      getActiveOrganizationTerm,
      listOrganizationAssignments,
} from "../db/organization";

type ResidentPortalRoleKey =
      | "head"
      | "house_leader"
      | "deputy"
      | "secretary"
      | "treasurer"
      | "team_leader"
      | "committee_head";

type ResidentPortalRoleContext = {
      id: number;
      assignmentId: number;
      roleCode: ResidentPortalRoleKey;
      roleName: string;
      sourceRoleCode?: string | null;
      sourceRoleName?: string | null;
      sourceRoleType?: string | null;
      termId?: number | null;
      termName?: string | null;
      unitType?: "team" | "committee" | "room" | null;
      unitId?: number | null;
      unitName?: string | null;
};

type OrganizationScopeMember = {
      assignmentId: number;
      residentId: number;
      residentName: string;
      residentCode?: string | null;
      roleName: string;
      roleCode?: string | null;
      roleType?: string | null;
      unitId?: number | null;
      unitName?: string | null;
      unitType?: string | null;
};

type OrganizationScopeUnit = {
      unitId: number | null;
      unitName: string;
      unitType: "team" | "committee";
      myRoleName?: string | null;
      members: OrganizationScopeMember[];
};

function normalizeText(value?: string | null) {
      return (value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
}

function resolvePortalRoleKey(input: {
      roleCode?: string | null;
      roleName?: string | null;
      roleType?: string | null;
}): ResidentPortalRoleKey | null {
      const code = normalizeText(input.roleCode);
      const name = normalizeText(input.roleName);
      const type = normalizeText(input.roleType);
      const combined = `${type}_${code}_${name}`;

      if (
            combined.includes("team_leader") ||
            combined.includes("to_truong") ||
            combined.includes("leader_team")
      ) {
            return "team_leader";
      }

      if (
            combined.includes("committee_head") ||
            combined.includes("truong_ban") ||
            combined.includes("ban_truong")
      ) {
            return "committee_head";
      }

      if (combined.includes("deputy") || combined.includes("pho")) {
            return "deputy";
      }

      if (combined.includes("secretary") || combined.includes("thu_ky")) {
            return "secretary";
      }

      if (combined.includes("treasurer") || combined.includes("thu_quy")) {
            return "treasurer";
      }

      if (
            type === "head" ||
            code === "head" ||
            combined.includes("house_leader") ||
            combined.includes("truong_luu_xa") ||
            combined.includes("truong_nha") ||
            combined.includes("truong")
      ) {
            return "house_leader";
      }

      return null;
}

function getRoleLabel(roleKey: ResidentPortalRoleKey, fallback?: string | null) {
      if (fallback) return fallback;

      switch (roleKey) {
            case "house_leader":
            case "head":
                  return "Trưởng";
            case "deputy":
                  return "Phó";
            case "secretary":
                  return "Thư ký";
            case "treasurer":
                  return "Thủ quỹ";
            case "team_leader":
                  return "Tổ trưởng";
            case "committee_head":
                  return "Trưởng ban";
            default:
                  return roleKey;
      }
}

function getUnitTypeFromRole(roleKey: ResidentPortalRoleKey) {
      if (roleKey === "team_leader") return "team" as const;
      if (roleKey === "committee_head") return "committee" as const;
      return null;
}

function buildAccessFlags(roleKeys: string[]) {
      const hasExecutiveRole = roleKeys.some((role) =>
            ["head", "house_leader", "deputy", "secretary", "treasurer"].includes(role)
      );

      return {
            hasExecutiveRole,
            hasTeamLeaderRole: roleKeys.includes("team_leader"),
            hasCommitteeHeadRole: roleKeys.includes("committee_head"),
      };
}

function mapAssignmentToRole(row: any): ResidentPortalRoleContext | null {
      const roleKey = resolvePortalRoleKey({
            roleCode: row.roleCode,
            roleName: row.roleName,
            roleType: row.roleType,
      });

      if (!roleKey) return null;

      return {
            id: Number(row.roleId || 0),
            assignmentId: Number(row.id || row.assignmentId || 0),
            roleCode: roleKey,
            roleName: getRoleLabel(roleKey, row.roleName),
            sourceRoleCode: row.roleCode || null,
            sourceRoleName: row.roleName || null,
            sourceRoleType: row.roleType || null,
            termId: row.termId || null,
            termName: row.termName || null,
            unitType: (row.unitType as any) || getUnitTypeFromRole(roleKey),
            unitId: row.unitId || null,
            unitName: row.unitName || null,
      };
}

function uniqueRoles(roles: ResidentPortalRoleContext[]) {
      const map = new Map<string, ResidentPortalRoleContext>();

      for (const role of roles) {
            const key = [
                  role.roleCode,
                  role.unitType || "",
                  role.unitId || "",
            ].join(":");

            if (!map.has(key)) {
                  map.set(key, role);
            }
      }

      return Array.from(map.values());
}

function getRoleKeysFromRoles(roles: ResidentPortalRoleContext[]) {
      return Array.from(
            new Set(
                  roles.flatMap((role) => {
                        if (role.roleCode === "house_leader") {
                              return ["house_leader", "head"];
                        }

                        return [role.roleCode];
                  })
            )
      );
}

function mapAssignmentToScopeMember(row: any): OrganizationScopeMember {
      return {
            assignmentId: Number(row.id || row.assignmentId || 0),
            residentId: Number(row.residentId || 0),
            residentName: row.residentName || row.fullName || "Chưa rõ tên",
            residentCode: row.residentCode || null,
            roleName: row.roleName || "Chức vụ",
            roleCode: row.roleCode || null,
            roleType: row.roleType || null,
            unitId: row.unitId || null,
            unitName: row.unitName || null,
            unitType: row.unitType || null,
      };
}

function buildScopedUnit(input: {
      unitId?: number | null;
      unitName?: string | null;
      unitType: "team" | "committee";
      myRoleName?: string | null;
      allAssignments: any[];
}): OrganizationScopeUnit {
      const members = input.allAssignments
            .filter((assignment: any) => {
                  if (!input.unitId) return false;
                  return Number(assignment.unitId || 0) === Number(input.unitId);
            })
            .map(mapAssignmentToScopeMember);

      return {
            unitId: input.unitId || null,
            unitName:
                  input.unitName ||
                  (input.unitType === "team" ? "Tổ chưa xác định" : "Ban chưa xác định"),
            unitType: input.unitType,
            myRoleName: input.myRoleName || null,
            members,
      };
}

export async function getResidentPortalAccessContext(userId: number) {
      if (!userId) {
            throw new Error("Vui lòng đăng nhập để tiếp tục.");
      }

      const linkedResident = await db.getResidentLinkedToUser(userId);

      if (!linkedResident?.id) {
            return {
                  resident: null,
                  roles: [],
                  roleKeys: [],
                  access: buildAccessFlags([]),
            };
      }

      const activeTerm = await getActiveOrganizationTerm();
      const assignments = await listOrganizationAssignments({
            residentId: linkedResident.id,
            termId: activeTerm?.id,
            status: "active",
            limit: 500,
            offset: 0,
      } as any);

      const roles = uniqueRoles(
            assignments
                  .map((assignment: any) => mapAssignmentToRole(assignment))
                  .filter(Boolean) as ResidentPortalRoleContext[]
      );

      const roleKeys = getRoleKeysFromRoles(roles);

      return {
            resident: {
                  id: linkedResident.id,
                  residentCode: linkedResident.residentCode,
                  fullName: linkedResident.fullName,
            },
            activeTerm: activeTerm
                  ? {
                          id: activeTerm.id,
                          name: activeTerm.name,
                          code: activeTerm.code,
                          status: activeTerm.status,
                    }
                  : null,
            roles,
            roleKeys,
            access: buildAccessFlags(roleKeys),
      };
}

export async function getResidentPortalOrganizationScope(userId: number) {
      const accessContext = await getResidentPortalAccessContext(userId);
      const activeTerm = await getActiveOrganizationTerm();

      if (!accessContext.resident?.id) {
            return {
                  ...accessContext,
                  executive: {
                        enabled: false,
                        assignments: [],
                  },
                  teams: [],
                  committees: [],
            };
      }

      const allAssignments = await listOrganizationAssignments({
            termId: activeTerm?.id,
            status: "active",
            limit: 1000,
            offset: 0,
      } as any);

      const roleKeys = accessContext.roleKeys || [];
      const hasExecutiveRole = accessContext.access.hasExecutiveRole;

      const executiveAssignments = allAssignments
            .filter((assignment: any) => {
                  const roleKey = resolvePortalRoleKey({
                        roleCode: assignment.roleCode,
                        roleName: assignment.roleName,
                        roleType: assignment.roleType,
                  });

                  return ["house_leader", "deputy", "secretary", "treasurer"].includes(
                        String(roleKey || "")
                  );
            })
            .map(mapAssignmentToScopeMember);

      const teamRoles = accessContext.roles.filter(
            (role: ResidentPortalRoleContext) => role.roleCode === "team_leader"
      );
      const committeeRoles = accessContext.roles.filter(
            (role: ResidentPortalRoleContext) => role.roleCode === "committee_head"
      );

      const teams = teamRoles.map((role: ResidentPortalRoleContext) =>
            buildScopedUnit({
                  unitId: role.unitId,
                  unitName: role.unitName,
                  unitType: "team",
                  myRoleName: role.roleName,
                  allAssignments,
            })
      );

      const committees = committeeRoles.map((role: ResidentPortalRoleContext) =>
            buildScopedUnit({
                  unitId: role.unitId,
                  unitName: role.unitName,
                  unitType: "committee",
                  myRoleName: role.roleName,
                  allAssignments,
            })
      );

      return {
            ...accessContext,
            executive: {
                  enabled: hasExecutiveRole,
                  assignments: hasExecutiveRole ? executiveAssignments : [],
            },
            teams,
            committees,
            debug: {
                  roleKeys,
                  activeTermId: activeTerm?.id || null,
            },
      };
}


function addDays(date: Date, days: number) {
      const next = new Date(date);
      next.setDate(next.getDate() + days);
      return next;
}

function parseDateInput(value?: string | null) {
      if (!value) return null;
      const text = String(value).slice(0, 10);
      const date = new Date(`${text}T00:00:00`);
      return Number.isNaN(date.getTime()) ? null : date;
}

function toDateOnlyText(value: any) {
      if (!value) return "";

      if (typeof value === "string") {
            if (value.includes("T")) return value.slice(0, 10);
            return value.slice(0, 10);
      }

      if (value instanceof Date && !Number.isNaN(value.getTime())) {
            const year = value.getFullYear();
            const month = String(value.getMonth() + 1).padStart(2, "0");
            const day = String(value.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
      }

      return String(value).slice(0, 10);
}

function formatTimeOnly(value: any) {
      if (!value) return "";

      if (typeof value === "string") {
            const text = value.trim();
            const match = text.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
            if (match) return `${match[1]}:${match[2]}`;

            if (text.includes("T")) {
                  const date = new Date(text);
                  if (!Number.isNaN(date.getTime())) {
                        return `${String(date.getUTCHours()).padStart(2, "0")}:${String(
                              date.getUTCMinutes()
                        ).padStart(2, "0")}`;
                  }
            }

            return text.slice(0, 5);
      }

      if (value instanceof Date && !Number.isNaN(value.getTime())) {
            return `${String(value.getUTCHours()).padStart(2, "0")}:${String(
                  value.getUTCMinutes()
            ).padStart(2, "0")}`;
      }

      return String(value).slice(0, 5);
}

function getDutyStatusLabel(status?: string | null) {
      switch (String(status || "pending")) {
            case "completed":
                  return "Đã hoàn thành";
            case "skipped":
            case "absent":
                  return "Vắng / Không làm";
            case "cancelled":
                  return "Đã hủy";
            case "in_progress":
                  return "Đang thực hiện";
            default:
                  return "Chưa làm";
      }
}

async function normalizeDutyAssignmentRows(rows: any[]) {
      const dutyDb = await import("../db/duty");
      const cache = new Map<number, any>();

      const getConfig = async (id?: number | null) => {
            const configId = Number(id || 0);
            if (!configId) return null;
            if (cache.has(configId)) return cache.get(configId);
            const config = await dutyDb.getDutyConfig(configId);
            cache.set(configId, config);
            return config;
      };

      return Promise.all(
            rows.map(async (row: any) => {
                  const config = await getConfig(row.dutyConfigId);
                  const assignedDate = toDateOnlyText(row.assignedDate);
                  const startTime =
                        formatTimeOnly(row.startTime) ||
                        formatTimeOnly(row.startDateTime) ||
                        formatTimeOnly(config?.startTime);
                  const endTime =
                        formatTimeOnly(row.endTime) ||
                        formatTimeOnly(row.endDateTime) ||
                        formatTimeOnly(config?.endTime);

                  return {
                        id: Number(row.id || 0),
                        dutyConfigId: row.dutyConfigId || null,
                        dutyName:
                              row.dutyName ||
                              config?.dutyName ||
                              config?.name ||
                              config?.title ||
                              "Công tác",
                        dutyCode: config?.dutyCode || row.dutyCode || null,
                        dutyType: config?.dutyType || row.dutyType || null,
                        description: config?.description || row.description || null,
                        assignedDate,
                        startTime,
                        endTime,
                        timeRange: startTime || endTime ? `${startTime || "--:--"} - ${endTime || "--:--"}` : "",
                        status: row.status || "pending",
                        statusLabel: getDutyStatusLabel(row.status),
                        assignedToType: row.assignedToType || null,
                        assignedToId: row.assignedToId || row.residentId || null,
                        residentId: row.residentId || null,
                        notes: row.notes || null,
                  };
            })
      );
}

async function getAssignmentsForScope(input: {
      assignedToType?: "team" | "committee" | null;
      assignedToId?: number | null;
      startDate: Date;
      endDate: Date;
}) {
      const dutyDb = await import("../db/duty");

      if (!input.assignedToType || !input.assignedToId) {
            return [];
      }

      const rows = await dutyDb.getAssignmentsByAssignee(input.assignedToType, input.assignedToId, {
            startDate: input.startDate,
            endDate: input.endDate,
      } as any);

      return normalizeDutyAssignmentRows(rows as any[]);
}

export async function getResidentPortalDutyScope(
      userId: number,
      filters?: {
            startDate?: string | null;
            endDate?: string | null;
      }
) {
      const accessContext = await getResidentPortalAccessContext(userId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startDate = parseDateInput(filters?.startDate) || today;
      const endDate = parseDateInput(filters?.endDate) || addDays(startDate, 7);

      const dutyDb = await import("../db/duty");

      const hasExecutiveRole = Boolean(accessContext.access?.hasExecutiveRole);
      const executiveRows = hasExecutiveRole
            ? await dutyDb.getAssignmentsByDateRange(startDate, endDate)
            : [];

      const executiveAssignments = hasExecutiveRole
            ? await normalizeDutyAssignmentRows(executiveRows as any[])
            : [];

      const teamRoles = (accessContext.roles || []).filter(
            (role: ResidentPortalRoleContext) => role.roleCode === "team_leader"
      );
      const committeeRoles = (accessContext.roles || []).filter(
            (role: ResidentPortalRoleContext) => role.roleCode === "committee_head"
      );

      const teams = await Promise.all(
            teamRoles.map(async (role: ResidentPortalRoleContext) => ({
                  unitId: role.unitId || null,
                  unitName: role.unitName || "Tổ chưa xác định",
                  unitType: "team" as const,
                  myRoleName: role.roleName || "Tổ trưởng",
                  assignments: await getAssignmentsForScope({
                        assignedToType: "team",
                        assignedToId: role.unitId,
                        startDate,
                        endDate,
                  }),
            }))
      );

      const committees = await Promise.all(
            committeeRoles.map(async (role: ResidentPortalRoleContext) => ({
                  unitId: role.unitId || null,
                  unitName: role.unitName || "Ban chưa xác định",
                  unitType: "committee" as const,
                  myRoleName: role.roleName || "Trưởng ban",
                  assignments: await getAssignmentsForScope({
                        assignedToType: "committee",
                        assignedToId: role.unitId,
                        startDate,
                        endDate,
                  }),
            }))
      );

      const allAssignments = [
            ...executiveAssignments,
            ...teams.flatMap((team: any) => team.assignments || []),
            ...committees.flatMap((committee: any) => committee.assignments || []),
      ];

      const summary = {
            total: allAssignments.length,
            pending: allAssignments.filter((item: any) => ["pending", "in_progress"].includes(item.status)).length,
            completed: allAssignments.filter((item: any) => item.status === "completed").length,
            skipped: allAssignments.filter((item: any) => ["skipped", "absent"].includes(item.status)).length,
            cancelled: allAssignments.filter((item: any) => item.status === "cancelled").length,
      };

      return {
            ...accessContext,
            range: {
                  startDate: toDateOnlyText(startDate),
                  endDate: toDateOnlyText(endDate),
            },
            executive: {
                  enabled: hasExecutiveRole,
                  assignments: executiveAssignments,
            },
            teams,
            committees,
            summary,
      };
}


export const residentPortalAccessService = {
      getMyAccessContext: getResidentPortalAccessContext,
      getMyOrganizationScope: getResidentPortalOrganizationScope,
      getMyDutyScope: getResidentPortalDutyScope,
};
