import * as db from "../db";
import {
      getActiveOrganizationTerm,
      listOrganizationAssignments,
} from "../db/organization";
import { organizationService } from "./organizationService";

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
      assignmentId?: number | null;
      memberId?: number | null;
      residentId: number;
      residentName: string;
      residentCode?: string | null;
      holyName?: string | null;
      phoneNumber?: string | null;
      roomCode?: string | null;
      roleName: string;
      memberRole?: "member" | "leader" | "head" | string | null;
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

type ResidentPortalDutyTarget = {
      assignedToType: "resident" | "team" | "committee" | "room";
      assignedToId: number;
      scopeLabel: string;
      source: "direct" | "team" | "committee" | "room";
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


function isInactiveResidentStatus(status?: string | null) {
      return ["inactive", "transferred_out", "left"].includes(String(status || "").toLowerCase());
}

function assertActiveLinkedResidentForPortal(resident: any) {
      if (!resident?.id) {
            return;
      }

      if (isInactiveResidentStatus(resident.status)) {
            throw new Error("Hồ sơ học viên đã ngừng/rời lưu xá, không thể truy cập cổng học viên.");
      }
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

function getUnitMemberRoleLabel(role?: string | null) {
      switch (role) {
            case "leader":
                  return "Tổ trưởng";
            case "head":
                  return "Trưởng ban";
            default:
                  return "Thành viên";
      }
}

function mapUnitMemberToScopeMember(row: any, unit: {
      unitId?: number | null;
      unitName?: string | null;
      unitType: "team" | "committee";
}): OrganizationScopeMember {
      const memberRole = row.memberRole || "member";

      return {
            memberId: row.id || null,
            residentId: Number(row.residentId || 0),
            residentName: row.residentName || row.fullName || "Chưa rõ tên",
            residentCode: row.residentCode || null,
            holyName: row.holyName || null,
            phoneNumber: row.phoneNumber || null,
            roomCode: row.roomCode || row.roomName || null,
            roleName: getUnitMemberRoleLabel(memberRole),
            memberRole,
            unitId: unit.unitId || row.unitId || null,
            unitName: unit.unitName || row.unitName || null,
            unitType: unit.unitType,
      };
}

async function buildScopedUnit(input: {
      unitId?: number | null;
      unitName?: string | null;
      unitType: "team" | "committee";
      myRoleName?: string | null;
}): Promise<OrganizationScopeUnit> {
      const members = input.unitId
            ? await organizationService.listUnitMembers({
                    unitId: Number(input.unitId),
                    status: "active",
              } as any)
            : [];

      return {
            unitId: input.unitId || null,
            unitName:
                  input.unitName ||
                  (input.unitType === "team" ? "Tổ chưa xác định" : "Ban chưa xác định"),
            unitType: input.unitType,
            myRoleName: input.myRoleName || null,
            members: members.map((member: any) =>
                  mapUnitMemberToScopeMember(member, {
                        unitId: input.unitId,
                        unitName: input.unitName,
                        unitType: input.unitType,
                  })
            ),
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

      assertActiveLinkedResidentForPortal(linkedResident);

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
                  holyName: linkedResident.holyName,
                  fullName: linkedResident.fullName,
                  status: linkedResident.status,
                  currentRoomId: linkedResident.currentRoomId,
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

      const teams = await Promise.all(
            teamRoles.map((role: ResidentPortalRoleContext) =>
                  buildScopedUnit({
                        unitId: role.unitId,
                        unitName: role.unitName,
                        unitType: "team",
                        myRoleName: role.roleName,
                  })
            )
      );

      const committees = await Promise.all(
            committeeRoles.map((role: ResidentPortalRoleContext) =>
                  buildScopedUnit({
                        unitId: role.unitId,
                        unitName: role.unitName,
                        unitType: "committee",
                        myRoleName: role.roleName,
                  })
            )
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



function getDayOfWeekKey(date: Date) {
      const day = date.getDay();

      switch (day) {
            case 0:
                  return "sunday";
            case 1:
                  return "monday";
            case 2:
                  return "tuesday";
            case 3:
                  return "wednesday";
            case 4:
                  return "thursday";
            case 5:
                  return "friday";
            case 6:
                  return "saturday";
            default:
                  return "monday";
      }
}

function getDayOfWeekLabel(dayOfWeek: string) {
      switch (dayOfWeek) {
            case "monday":
                  return "Thứ 2";
            case "tuesday":
                  return "Thứ 3";
            case "wednesday":
                  return "Thứ 4";
            case "thursday":
                  return "Thứ 5";
            case "friday":
                  return "Thứ 6";
            case "saturday":
                  return "Thứ 7";
            case "sunday":
                  return "Chúa nhật";
            default:
                  return dayOfWeek;
      }
}

async function getTodayStudySchedules(input: {
      residentId: number;
      dayOfWeek: string;
}) {
      try {
            const residentDb: any = await import("../db/resident");

            if (typeof residentDb.getResidentStudySchedulesByResidentId === "function") {
                  const rows = await residentDb.getResidentStudySchedulesByResidentId(
                        input.residentId
                  );

                  return (rows || [])
                        .filter((row: any) => {
                              const rowDay = String(row.dayOfWeek || "");
                              const isActive = row.isActive === undefined ? true : Boolean(row.isActive);
                              return rowDay === input.dayOfWeek && isActive;
                        })
                        .map((row: any) => ({
                              id: Number(row.id || 0),
                              dayOfWeek: row.dayOfWeek,
                              dayLabel: getDayOfWeekLabel(row.dayOfWeek),
                              startTime: formatTimeOnly(row.startTime),
                              endTime: formatTimeOnly(row.endTime),
                              timeRange: `${formatTimeOnly(row.startTime) || "--:--"} - ${
                                    formatTimeOnly(row.endTime) || "--:--"
                              }`,
                              subjectName: row.subjectName || null,
                              location: row.location || null,
                              notes: row.notes || null,
                        }));
            }
      } catch (error) {
            console.warn(
                  "[residentPortalAccessService] Cannot load study schedules from resident DB helper.",
                  error
            );
      }

      return [];
}

function getResidentRoomText(resident: any) {
      return (
            resident?.roomName ||
            resident?.currentRoomName ||
            resident?.roomCode ||
            resident?.currentRoomCode ||
            null
      );
}

function getDutyTargetKey(target: Pick<ResidentPortalDutyTarget, "assignedToType" | "assignedToId">) {
      return `${target.assignedToType}:${Number(target.assignedToId || 0)}`;
}

function getDutyAssignmentTargetKey(row: any) {
      const assignedToType = String(row?.assignedToType || (row?.residentId ? "resident" : ""));
      const assignedToId = Number(row?.assignedToId || row?.residentId || 0);

      if (!assignedToType || !assignedToId) return "";

      return `${assignedToType}:${assignedToId}`;
}

async function getResidentPortalDutyTargets(input: {
      residentId: number;
      currentRoomId?: number | null;
}): Promise<ResidentPortalDutyTarget[]> {
      const targets: ResidentPortalDutyTarget[] = [
            {
                  assignedToType: "resident",
                  assignedToId: Number(input.residentId),
                  scopeLabel: "Cá nhân",
                  source: "direct",
            },
      ];

      if (input.currentRoomId) {
            targets.push({
                  assignedToType: "room",
                  assignedToId: Number(input.currentRoomId),
                  scopeLabel: "Phòng hiện tại",
                  source: "room",
            });
      }

      try {
            const memberships = await organizationService.listResidentUnitMemberships({
                  residentId: Number(input.residentId),
                  status: "active",
            } as any);

            for (const membership of memberships || []) {
                  const unitId = Number((membership as any).unitId || 0);
                  const unitType = String((membership as any).unitType || "");

                  if (!unitId) continue;

                  if (unitType === "team") {
                        targets.push({
                              assignedToType: "team",
                              assignedToId: unitId,
                              scopeLabel: `Tổ: ${(membership as any).unitName || unitId}`,
                              source: "team",
                        });
                  }

                  if (unitType === "committee") {
                        targets.push({
                              assignedToType: "committee",
                              assignedToId: unitId,
                              scopeLabel: `Ban: ${(membership as any).unitName || unitId}`,
                              source: "committee",
                        });
                  }
            }
      } catch (error) {
            console.warn(
                  "[residentPortalAccessService] Cannot load resident duty membership targets.",
                  error
            );
      }

      const unique = new Map<string, ResidentPortalDutyTarget>();
      for (const target of targets) {
            if (!target.assignedToId) continue;
            unique.set(getDutyTargetKey(target), target);
      }

      return Array.from(unique.values());
}

async function getAssignmentsForResidentDutyTargets(input: {
      residentId: number;
      currentRoomId?: number | null;
      startDate: Date;
      endDate: Date;
}) {
      const dutyDb = await import("../db/duty");
      const targets = await getResidentPortalDutyTargets({
            residentId: input.residentId,
            currentRoomId: input.currentRoomId,
      });
      const targetMap = new Map(targets.map((target) => [getDutyTargetKey(target), target]));
      const rows: any[] = [];

      for (const target of targets) {
            const scopedRows =
                  target.assignedToType === "resident"
                        ? await dutyDb.getAssignmentsByResident(input.residentId, {
                                startDate: input.startDate,
                                endDate: input.endDate,
                          } as any)
                        : await dutyDb.getAssignmentsByAssignee(
                                target.assignedToType,
                                target.assignedToId,
                                {
                                      startDate: input.startDate,
                                      endDate: input.endDate,
                                } as any
                          );

            for (const row of scopedRows || []) {
                  rows.push(row);
            }
      }

      const normalized = await normalizeDutyAssignmentRows(rows);
      const unique = new Map<number, any>();

      for (const assignment of normalized) {
            const id = Number(assignment.id || 0);
            if (!id) continue;

            const target = targetMap.get(getDutyAssignmentTargetKey(assignment));
            unique.set(id, {
                  ...assignment,
                  assignmentScopeLabel: target?.scopeLabel || "Công tác",
                  assignmentScope: target?.source || "direct",
                  isAssignedToMe: Boolean(target),
                  canComplete:
                        Boolean(target) &&
                        !["completed", "skipped", "absent", "cancelled"].includes(
                              String(assignment.status || "pending")
                        ),
            });
      }

      return {
            assignments: Array.from(unique.values()),
            targets,
      };
}

export async function getResidentPortalTodayOverview(userId: number) {
      const accessContext = await getResidentPortalAccessContext(userId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dateText = toDateOnlyText(today);
      const dayOfWeek = getDayOfWeekKey(today);

      if (!accessContext.resident?.id) {
            return {
                  ...accessContext,
                  today: {
                        date: dateText,
                        dayOfWeek,
                        dayLabel: getDayOfWeekLabel(dayOfWeek),
                  },
                  studySchedules: [],
                  duties: [],
                  room: null,
                  summary: {
                        studyCount: 0,
                        dutyCount: 0,
                        roleCount: 0,
                  },
            };
      }

      const residentId = Number(accessContext.resident.id);

      let fullResident: any = accessContext.resident;
      try {
            const residentDb: any = await import("../db/resident");
            if (typeof residentDb.getResidentById === "function") {
                  fullResident = (await residentDb.getResidentById(residentId)) || fullResident;
            }
      } catch (error) {
            console.warn(
                  "[residentPortalAccessService] Cannot load resident detail for today overview.",
                  error
            );
      }

      const studySchedules = await getTodayStudySchedules({
            residentId,
            dayOfWeek,
      });

      let duties: any[] = [];
      try {
            const targetResult = await getAssignmentsForResidentDutyTargets({
                  residentId,
                  currentRoomId: Number(accessContext.resident.currentRoomId || 0) || null,
                  startDate: today,
                  endDate: today,
            });
            duties = targetResult.assignments;
      } catch (error) {
            console.warn(
                  "[residentPortalAccessService] Cannot load resident duties for today overview.",
                  error
            );
      }

      const activeDuties = duties.filter((duty: any) => duty.status !== "cancelled");

      const dutyStats = {
            total: activeDuties.length,
            pending: activeDuties.filter((duty: any) =>
                  ["pending", "in_progress", "confirmed"].includes(
                        String(duty.status || "pending")
                  )
            ).length,
            completed: activeDuties.filter(
                  (duty: any) => String(duty.status || "") === "completed"
            ).length,
            skipped: activeDuties.filter((duty: any) =>
                  ["skipped", "absent"].includes(String(duty.status || ""))
            ).length,
      };

      let scopeDuties: any = {
            executive: { enabled: false, assignments: [] },
            teams: [],
            committees: [],
            summary: { total: 0, pending: 0, completed: 0, skipped: 0, cancelled: 0 },
      };

      try {
            const roleScope = await getResidentPortalDutyScope(userId, {
                  startDate: dateText,
                  endDate: dateText,
            });

            scopeDuties = {
                  executive: roleScope.executive || { enabled: false, assignments: [] },
                  teams: roleScope.teams || [],
                  committees: roleScope.committees || [],
                  summary: roleScope.summary || {
                        total: 0,
                        pending: 0,
                        completed: 0,
                        skipped: 0,
                        cancelled: 0,
                  },
            };
      } catch (error) {
            console.warn(
                  "[residentPortalAccessService] Cannot load role-scope duties for today overview.",
                  error
            );
      }

      return {
            resident: {
                  id: residentId,
                  residentCode:
                        fullResident?.residentCode || accessContext.resident.residentCode || null,
                  fullName: fullResident?.fullName || accessContext.resident.fullName || "Học viên",
                  roomName: getResidentRoomText(fullResident),
            },
            activeTerm: accessContext.activeTerm || null,
            roles: accessContext.roles || [],
            roleKeys: accessContext.roleKeys || [],
            access: accessContext.access,
            today: {
                  date: dateText,
                  dayOfWeek,
                  dayLabel: getDayOfWeekLabel(dayOfWeek),
            },
            studySchedules,
            duties: activeDuties,
            scopeDuties,
            room: getResidentRoomText(fullResident)
                  ? {
                          name: getResidentRoomText(fullResident),
                    }
                  : null,
            summary: {
                  studyCount: studySchedules.length,
                  dutyCount: activeDuties.length,
                  scopeDutyCount: Number(scopeDuties?.summary?.total || 0),
                  roleCount: (accessContext.roles || []).length,
                  dutyStats,
                  scopeDutyStats: scopeDuties?.summary || {
                        total: 0,
                        pending: 0,
                        completed: 0,
                        skipped: 0,
                        cancelled: 0,
                  },
            },
      };
}

export async function completeResidentPortalTodayDuty(input: {
      userId: number;
      assignmentId: number;
      notes?: string | null;
}) {
      if (!input.userId) {
            throw new Error("Vui lòng đăng nhập để tiếp tục.");
      }

      if (!input.assignmentId) {
            throw new Error("Không xác định được công tác cần hoàn thành.");
      }

      const linkedResident = await db.getResidentLinkedToUser(input.userId);

      if (!linkedResident?.id) {
            throw new Error("Không tìm thấy hồ sơ học viên được liên kết với tài khoản này.");
      }

      assertActiveLinkedResidentForPortal(linkedResident);

      const residentId = Number(linkedResident.id);
      const dutyTargets = await getResidentPortalDutyTargets({
            residentId,
            currentRoomId: Number((linkedResident as any).currentRoomId || 0) || null,
      });
      const dutyTargetKeys = new Set(dutyTargets.map(getDutyTargetKey));
      const dutyDb = await import("../db/duty");
      const assignment = await dutyDb.getAssignmentById(input.assignmentId);

      if (!assignment) {
            throw new Error("Không tìm thấy phân công công tác.");
      }

      const assignmentTargetKey = getDutyAssignmentTargetKey(assignment);

      if (!dutyTargetKeys.has(assignmentTargetKey)) {
            throw new Error("Bạn chỉ có thể hoàn thành công tác được giao cho cá nhân, phòng, tổ hoặc ban của mình.");
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayText = toDateOnlyText(today);
      const assignmentDateText = toDateOnlyText((assignment as any).assignedDate);

      if (assignmentDateText !== todayText) {
            throw new Error("Chỉ có thể hoàn thành công tác của hôm nay trong màn hình này.");
      }

      const status = String((assignment as any).status || "pending");

      if (status === "completed") {
            return {
                  success: true,
                  message: "Công tác này đã được hoàn thành trước đó.",
                  assignmentId: input.assignmentId,
            };
      }

      if (["cancelled", "skipped", "absent"].includes(status)) {
            throw new Error("Công tác này đã kết thúc trạng thái, không thể đánh dấu hoàn thành.");
      }

      await dutyDb.updateAssignmentForResident(residentId, input.assignmentId, {
            status: "completed" as any,
            completedAt: new Date(),
            notes: input.notes || undefined,
      } as any);

      return {
            success: true,
            message: "Đã đánh dấu hoàn thành công tác.",
            assignmentId: input.assignmentId,
      };
}

export const residentPortalAccessService = {
      getMyAccessContext: getResidentPortalAccessContext,
      getMyOrganizationScope: getResidentPortalOrganizationScope,
      getMyDutyScope: getResidentPortalDutyScope,
      getTodayOverview: getResidentPortalTodayOverview,
      completeTodayDuty: completeResidentPortalTodayDuty,
};
