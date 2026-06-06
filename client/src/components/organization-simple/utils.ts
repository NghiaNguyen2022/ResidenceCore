import type {
      OrganizationAssignment,
      OrganizationRole,
      OrganizationUnit,
} from './types';

export const today = new Date().toISOString().split('T')[0];

export function normalizeText(value?: string | null) {
      return (value || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ');
}

export function normalizeCode(value: string) {
      return value
            .trim()
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
}

export function toInputDateValue(value?: string | Date | null) {
      if (!value) return '';

      try {
            return new Date(value).toISOString().split('T')[0];
      } catch {
            return '';
      }
}

export function formatDate(value?: string | Date | null) {
      if (!value) return '-';

      try {
            return new Date(value).toLocaleDateString('vi-VN');
      } catch {
            return '-';
      }
}

export function getTermStatusLabel(status?: string | null) {
      if (status === 'active') return 'Đang áp dụng';
      if (status === 'closed') return 'Đã kết thúc';
      return 'Chưa kích hoạt';
}

export function getTermStatusClass(status?: string | null) {
      if (status === 'active') return 'border-green-200 bg-green-50 text-green-700';
      if (status === 'closed') return 'border-neutral-200 bg-neutral-100 text-neutral-600';
      return 'border-orange-200 bg-orange-50 text-orange-700';
}

export function getUnitTypeLabel(unitType?: string | null) {
      if (unitType === 'team') return 'Tổ';
      if (unitType === 'committee') return 'Ban';
      return 'Đơn vị';
}

export function getUnitTypeClass(unitType?: string | null) {
      if (unitType === 'team') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (unitType === 'committee') return 'border-purple-200 bg-purple-50 text-purple-700';
      return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

export function getAssignmentStatusLabel(status?: string | null) {
      if (status === 'active') return 'Đang đảm nhiệm';
      return 'Đã kết thúc';
}

export function getAssignmentStatusClass(status?: string | null) {
      if (status === 'active') return 'border-green-200 bg-green-50 text-green-700';
      return 'border-neutral-200 bg-neutral-100 text-neutral-600';
}

export function getRoleLevel(role?: OrganizationRole | OrganizationAssignment | null) {
      const level =
            'level' in (role || {})
                  ? (role as OrganizationRole).level
                  : (role as OrganizationAssignment)?.roleLevel;

      if (level === 1 || level === 2 || level === 3) return level;

      const roleType = String((role as any)?.roleType || '');
      if (roleType === 'head') return 1;
      if (['deputy', 'secretary', 'treasurer'].includes(roleType)) return 2;
      return 3;
}

export function roleRequiresUnit(role?: OrganizationRole | null) {
      return Boolean(
            role?.requiresUnit ||
                  role?.roleType === 'team_leader' ||
                  role?.roleType === 'committee_head'
      );
}

export function getAssignmentDisplayTitle(assignment: OrganizationAssignment) {
      if (assignment.assignmentTitle?.trim()) return assignment.assignmentTitle.trim();

      const unitName = assignment.unitName || assignment.unitCode || '';

      if (assignment.roleType === 'team_leader' && unitName) return `Tổ trưởng ${unitName}`;
      if (assignment.roleType === 'committee_head' && unitName) {
            return `Trưởng ban ${unitName.replace(/^Ban\s+/i, '')}`;
      }

      return assignment.roleName || '-';
}

export function buildAssignmentTitle(role?: OrganizationRole | null, unit?: OrganizationUnit | null) {
      if (!role) return '';
      if (!unit) return role.name;

      if (role.roleType === 'team_leader') return `Tổ trưởng ${unit.name}`;
      if (role.roleType === 'committee_head') return `Trưởng ban ${unit.name.replace(/^Ban\s+/i, '')}`;

      return `${role.name} ${unit.name}`;
}

export function getRoomLabelFromAssignment(assignment: OrganizationAssignment) {
      if (assignment.roomCode && assignment.roomName) return `${assignment.roomCode} - ${assignment.roomName}`;
      if (assignment.roomCode) return assignment.roomCode;
      if (assignment.roomName) return assignment.roomName;
      if (assignment.roomId) return `Phòng ${assignment.roomId}`;
      return 'Chưa có phòng';
}

export function getRoomLabelFromMember(member: any) {
      if (member?.currentRoomCode) return member.currentRoomName ? `${member.currentRoomCode} - ${member.currentRoomName}` : member.currentRoomCode;
      if (member?.currentRoomName) return member.currentRoomName;
      if (member?.roomCode) return member.roomName ? `${member.roomCode} - ${member.roomName}` : member.roomCode;
      if (member?.roomName) return member.roomName;
      if (member?.currentRoomId) return `Phòng ${member.currentRoomId}`;
      return 'Chưa gán phòng';
}

export function getCurrentRoomIdFromMember(member: any) {
      return (
            member?.currentRoomId ??
            member?.currentroomid ??
            member?.currentRoom?.id ??
            null
      );
}

export function getResidentDisplayName(member: any) {
      const holyName = member?.holyName ? `${member.holyName} ` : '';
      return `${holyName}${member?.fullName || member?.name || ''}`.trim();
}

export function isAssignmentRole(assignment: OrganizationAssignment, targets: string[]) {
      const roleName = normalizeText(assignment.roleName || assignment.assignmentTitle || '');
      return targets.some((target) => roleName === normalizeText(target));
}

export function isTeamAssignment(assignment: OrganizationAssignment) {
      return assignment.roleType === 'team_leader' || assignment.unitType === 'team';
}

export function isCommitteeAssignment(assignment: OrganizationAssignment) {
      return assignment.roleType === 'committee_head' || assignment.unitType === 'committee';
}
