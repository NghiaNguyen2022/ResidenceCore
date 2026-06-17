export type OrganizationUnitKind = 'team' | 'committee' | 'other';

export type OrganizationUnitDisplay = {
      unitId?: number | null;
      unitName: string;
      unitCode?: string | null;
      unitType: OrganizationUnitKind;
      isLeader: boolean;
      leaderLabel?: string;
      colorClass: string;
};

export type OrganizationRoleDisplay = {
      id?: number | null;
      title: string;
      roleName?: string | null;
      roleCode?: string | null;
      roleType?: string | null;
      unitName?: string | null;
      unitType?: OrganizationUnitKind;
      rank: number;
      isTeamLeader: boolean;
      isCommitteeHead: boolean;
};

export type MemberOrganizationDisplay = {
      teams: OrganizationUnitDisplay[];
      committees: OrganizationUnitDisplay[];
      roles: OrganizationRoleDisplay[];
};

function isUnitMembershipOnly(item: any) {
      return (
            item?.source === 'unit_membership' ||
            item?.membershipSource === 'unit_membership' ||
            (
                  item?.memberRole !== undefined &&
                  !item?.roleId &&
                  !item?.roleName &&
                  !item?.roleCode &&
                  !item?.assignmentTitle
            )
      );
}

const UNIT_COLOR_CLASSES = [
      'bg-blue-50 text-blue-700 ring-blue-100',
      'bg-emerald-50 text-emerald-700 ring-emerald-100',
      'bg-violet-50 text-violet-700 ring-violet-100',
      'bg-amber-50 text-amber-700 ring-amber-100',
      'bg-cyan-50 text-cyan-700 ring-cyan-100',
      'bg-rose-50 text-rose-700 ring-rose-100',
      'bg-indigo-50 text-indigo-700 ring-indigo-100',
      'bg-teal-50 text-teal-700 ring-teal-100',
];

function normalizeText(value: unknown) {
      return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/đ/g, 'd')
            .trim();
}

function normalizeKey(value: unknown) {
      return normalizeText(value)
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
}

function getStableColorIndex(value: unknown) {
      const text = String(value || 'default');

      let total = 0;
      for (let index = 0; index < text.length; index += 1) {
            total += text.charCodeAt(index) * (index + 1);
      }

      return Math.abs(total) % UNIT_COLOR_CLASSES.length;
}

export function getOrganizationUnitColorClass(value: unknown) {
      return UNIT_COLOR_CLASSES[getStableColorIndex(value)];
}

export function isTeamLeaderRole(role: any) {
      const roleType = normalizeKey(role?.roleType);
      const roleCode = normalizeKey(role?.roleCode || role?.code);
      const roleName = normalizeText(role?.roleName || role?.name || role?.assignmentTitle);

      return (
            roleType === 'team_leader' ||
            roleCode === 'team_leader' ||
            roleCode === 'to_truong' ||
            roleName.includes('to truong')
      );
}

export function isCommitteeHeadRole(role: any) {
      const roleType = normalizeKey(role?.roleType);
      const roleCode = normalizeKey(role?.roleCode || role?.code);
      const roleName = normalizeText(role?.roleName || role?.name || role?.assignmentTitle);

      return (
            roleType === 'committee_head' ||
            roleCode === 'committee_head' ||
            roleCode === 'truong_ban' ||
            roleName.includes('truong ban')
      );
}

export function getOrganizationRoleRank(role: any) {
      const roleType = normalizeKey(role?.roleType);
      const roleCode = normalizeKey(role?.roleCode || role?.code);
      const roleName = normalizeText(role?.roleName || role?.name || role?.assignmentTitle);

      if (roleType === 'head' || roleCode === 'head' || roleName === 'truong') return 10;
      if (roleType === 'deputy' || roleCode === 'deputy' || roleName.includes('pho')) return 20;
      if (roleType === 'secretary' || roleCode === 'secretary' || roleName.includes('thu ky')) return 30;
      if (roleType === 'treasurer' || roleCode === 'treasurer' || roleName.includes('thu quy')) return 40;
      if (isCommitteeHeadRole(role)) return 50;
      if (isTeamLeaderRole(role)) return 60;

      return 90;
}

function inferUnitType(assignment: any): OrganizationUnitKind {
      const unitType = normalizeKey(assignment?.unitType || assignment?.organizationUnitType);
      const unitName = normalizeText(assignment?.unitName || assignment?.unitCode);

      if (unitType === 'team' || unitName.startsWith('to ')) return 'team';
      if (unitType === 'committee' || unitName.startsWith('ban ')) return 'committee';

      if (isTeamLeaderRole(assignment)) return 'team';
      if (isCommitteeHeadRole(assignment)) return 'committee';

      return 'other';
}

function buildRoleTitle(assignment: any) {
      const roleName =
            assignment?.assignmentTitle ||
            assignment?.roleName ||
            assignment?.roleCode ||
            'Chức vụ';

      const unitName = assignment?.unitName || assignment?.unitCode || '';

      if (unitName && !String(roleName).toLowerCase().includes(String(unitName).toLowerCase())) {
            return `${roleName} · ${unitName}`;
      }

      return String(roleName);
}

function addUniqueUnit(
      units: OrganizationUnitDisplay[],
      unit: OrganizationUnitDisplay
) {
      const existing = units.find((item) => {
            if (item.unitId && unit.unitId) return Number(item.unitId) === Number(unit.unitId);

            return (
                  item.unitName.toLowerCase() === unit.unitName.toLowerCase() &&
                  item.unitType === unit.unitType
            );
      });

      if (existing) {
            existing.isLeader = existing.isLeader || unit.isLeader;
            existing.leaderLabel = existing.leaderLabel || unit.leaderLabel;
            return;
      }

      units.push(unit);
}

export function buildMemberOrganizationDisplay(assignments: any[] = []) {
      const display: MemberOrganizationDisplay = {
            teams: [],
            committees: [],
            roles: [],
      };

      assignments.forEach((assignment) => {
            const unitName = assignment?.unitName || assignment?.unitCode || null;
            const unitType = inferUnitType(assignment);
            const membershipOnly = isUnitMembershipOnly(assignment);
            const memberRole = String(assignment?.memberRole || '');

            if (unitName) {
                  const unit: OrganizationUnitDisplay = {
                        unitId: assignment?.unitId ?? null,
                        unitCode: assignment?.unitCode ?? null,
                        unitName,
                        unitType,
                        isLeader:
                              isTeamLeaderRole(assignment) ||
                              isCommitteeHeadRole(assignment) ||
                              memberRole === 'leader' ||
                              memberRole === 'head',
                        leaderLabel:
                              isTeamLeaderRole(assignment) || memberRole === 'leader'
                                    ? 'Tổ trưởng'
                                    : isCommitteeHeadRole(assignment) || memberRole === 'head'
                                          ? 'Trưởng ban'
                                          : undefined,
                        colorClass: getOrganizationUnitColorClass(
                              `${unitType}:${assignment?.unitId || unitName}`
                        ),
                  };

                  if (unit.unitType === 'team') {
                        addUniqueUnit(display.teams, unit);
                  } else if (unit.unitType === 'committee') {
                        addUniqueUnit(display.committees, unit);
                  }
            }

            if (membershipOnly) return;

            const role: OrganizationRoleDisplay = {
                  id: assignment?.id ?? null,
                  title: buildRoleTitle(assignment),
                  roleName: assignment?.roleName ?? null,
                  roleCode: assignment?.roleCode ?? null,
                  roleType: assignment?.roleType ?? null,
                  unitName,
                  unitType,
                  rank: getOrganizationRoleRank(assignment),
                  isTeamLeader: isTeamLeaderRole(assignment),
                  isCommitteeHead: isCommitteeHeadRole(assignment),
            };

            const duplicateRole = display.roles.some((item) => item.title === role.title);
            if (!duplicateRole) {
                  display.roles.push(role);
            }
      });

      display.roles.sort((a, b) => a.rank - b.rank || a.title.localeCompare(b.title, 'vi'));
      display.teams.sort((a, b) => a.unitName.localeCompare(b.unitName, 'vi'));
      display.committees.sort((a, b) => a.unitName.localeCompare(b.unitName, 'vi'));

      return display;
}

export function createEmptyOrganizationDisplay(): MemberOrganizationDisplay {
      return {
            teams: [],
            committees: [],
            roles: [],
      };
}
