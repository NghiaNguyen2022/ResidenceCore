'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
      Building2,
      CalendarDays,
      CheckCircle2,
      Crown,
      Edit2,
      LayoutGrid,
      Plus,
      Save,
      Search,
      Settings,
      ShieldCheck,
      UserPlus,
      UsersRound,
      X,
} from 'lucide-react';

import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cx, residenceMediumAccents, residenceMediumStyle } from '@/components/shared/styleMedium';

type SimpleTab = 'structure' | 'assignments' | 'units' | 'terms';
type OrganizationFocusAction = 'add_team_member' | 'transfer_team_member' | 'add_committee_member' | 'create_assignment';

type TermStatus = 'active' | 'inactive' | 'closed';
type AssignmentStatus = 'active' | 'ended';
type UnitType = 'team' | 'committee';

type OrganizationTerm = {
      id: number;
      code: string;
      name: string;
      startDate: string | Date;
      endDate: string | Date;
      status: TermStatus;
      description?: string | null;
      assignedCount?: number;
};

type OrganizationRole = {
      id: number;
      code: string;
      name: string;
      category?: string | null;
      allowMultipleMembers?: boolean;
      isActive: boolean;
      sortOrder: number;
      level?: number | null;
      roleType?: string | null;
      minAssignees?: number | null;
      maxAssignees?: number | null;
      requiresUnit?: boolean | null;
};

type OrganizationUnit = {
      id: number;
      code: string;
      name: string;
      unitType: UnitType | string;
      description?: string | null;
      isActive: boolean;
      sortOrder: number;
      assignedCount?: number;
};

type OrganizationAssignment = {
      id: number;
      termId: number;
      roleId: number;
      residentId: number;
      roomId?: number | null;
      unitId?: number | null;
      assignmentTitle?: string | null;
      startDate: string | Date;
      endDate?: string | Date | null;
      status: AssignmentStatus;
      notes?: string | null;
      termName?: string;
      roleCode?: string;
      roleName?: string;
      residentName?: string;
      residentCode?: string;
      holyName?: string | null;
      residentHolyName?: string | null;
      roomCode?: string | null;
      roomName?: string | null;
      unitCode?: string | null;
      unitName?: string | null;
      unitType?: string | null;
      roleLevel?: number | null;
      roleType?: string | null;
      roleRequiresUnit?: boolean | null;
};

type OrganizationUnitMember = {
      id: number;
      unitId: number;
      residentId: number;
      memberRole: 'member' | 'leader' | 'head';
      status: 'active' | 'inactive';
      startDate?: string | Date | null;
      endDate?: string | Date | null;
      residentName?: string | null;
      residentCode?: string | null;
      holyName?: string | null;
      phoneNumber?: string | null;
      roomCode?: string | null;
      roomName?: string | null;
};

type AssignmentForm = {
      id?: number;
      termId: string;
      roleId: string;
      unitId: string;
      residentId: string;
      assignmentTitle: string;
      startDate: string;
      endDate: string;
      status: AssignmentStatus;
      notes: string;
};

type UnitForm = {
      id?: number;
      code: string;
      name: string;
      unitType: UnitType;
      description: string;
      isActive: boolean;
      sortOrder: string;
};

type TermForm = {
      id?: number;
      code: string;
      name: string;
      startDate: string;
      endDate: string;
      status: TermStatus;
      description: string;
};

const today = new Date().toISOString().split('T')[0];

const emptyAssignmentForm: AssignmentForm = {
      termId: '',
      roleId: '',
      unitId: '',
      residentId: '',
      assignmentTitle: '',
      startDate: today,
      endDate: '',
      status: 'active',
      notes: '',
};

const emptyUnitForm: UnitForm = {
      code: '',
      name: '',
      unitType: 'team',
      description: '',
      isActive: true,
      sortOrder: '10',
};

const emptyTermForm: TermForm = {
      code: '',
      name: '',
      startDate: '',
      endDate: '',
      status: 'inactive',
      description: '',
};

function normalizeText(value?: string | null) {
      return (value || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ');
}

function normalizeCode(value: string) {
      return value
            .trim()
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
}

function toInputDateValue(value?: string | Date | null) {
      if (!value) return '';

      try {
            return new Date(value).toISOString().split('T')[0];
      } catch {
            return '';
      }
}

function formatDate(value?: string | Date | null) {
      if (!value) return '-';

      try {
            return new Date(value).toLocaleDateString('vi-VN');
      } catch {
            return '-';
      }
}

function getTermStatusLabel(status?: string | null) {
      if (status === 'active') return 'Đang áp dụng';
      if (status === 'closed') return 'Đã kết thúc';
      return 'Chưa kích hoạt';
}

function getTermStatusClass(status?: string | null) {
      if (status === 'active') return 'border-green-200 bg-green-50 text-green-700';
      if (status === 'closed') return 'border-neutral-200 bg-neutral-100 text-neutral-600';
      return 'border-orange-200 bg-orange-50 text-orange-700';
}

function getUnitTypeLabel(unitType?: string | null) {
      if (unitType === 'team') return 'Tổ';
      if (unitType === 'committee') return 'Ban';
      return 'Đơn vị';
}

function getUnitTypeClass(unitType?: string | null) {
      if (unitType === 'team') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (unitType === 'committee') return 'border-purple-200 bg-purple-50 text-purple-700';
      return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}


function getUnitMemberRoleLabel(role?: string | null) {
      switch (role) {
            case 'leader':
                  return 'Tổ trưởng';
            case 'head':
                  return 'Trưởng ban';
            default:
                  return 'Thành viên';
      }
}

function getUnitMemberRoleClass(role?: string | null) {
      switch (role) {
            case 'leader':
                  return 'border-blue-100 bg-blue-50 text-blue-700';
            case 'head':
                  return 'border-purple-100 bg-purple-50 text-purple-700';
            default:
                  return 'border-slate-200 bg-slate-50 text-slate-600';
      }
}

function getAssignmentStatusLabel(status?: string | null) {
      if (status === 'active') return 'Đang đảm nhiệm';
      return 'Đã kết thúc';
}

function getAssignmentStatusClass(status?: string | null) {
      if (status === 'active') return 'border-green-200 bg-green-50 text-green-700';
      return 'border-neutral-200 bg-neutral-100 text-neutral-600';
}

function getRoleLevel(role?: OrganizationRole | OrganizationAssignment | null) {
      const level = 'level' in (role || {}) ? (role as OrganizationRole).level : (role as OrganizationAssignment)?.roleLevel;
      if (level === 1 || level === 2 || level === 3) return level;

      const roleType = String((role as any)?.roleType || '');
      if (roleType === 'head') return 1;
      if (['deputy', 'secretary', 'treasurer'].includes(roleType)) return 2;
      return 3;
}

function getLevelLabel(level: number) {
      if (level === 1) return 'Điều hành chính';
      if (level === 2) return 'Hỗ trợ điều hành';
      return 'Tổ / Ban phụ trách';
}

function roleRequiresUnit(role?: OrganizationRole | null) {
      return Boolean(
            role?.requiresUnit ||
                  role?.roleType === 'team_leader' ||
                  role?.roleType === 'committee_head'
      );
}

function getAssignmentDisplayTitle(assignment: OrganizationAssignment) {
      if (assignment.assignmentTitle?.trim()) return assignment.assignmentTitle.trim();

      const unitName = assignment.unitName || assignment.unitCode || '';

      if (assignment.roleType === 'team_leader' && unitName) return `Tổ trưởng ${unitName}`;
      if (assignment.roleType === 'committee_head' && unitName) {
            return `Trưởng ban ${unitName.replace(/^Ban\s+/i, '')}`;
      }

      return assignment.roleName || '-';
}

function getAssignmentPositionKey(assignment: OrganizationAssignment) {
      return [
            assignment.roleId,
            assignment.unitId || 'house',
            getAssignmentDisplayTitle(assignment),
      ].join(':');
}

function getAssignmentPositionTitle(assignment: OrganizationAssignment) {
      return getAssignmentDisplayTitle(assignment);
}

function buildAssignmentTitle(role?: OrganizationRole | null, unit?: OrganizationUnit | null) {
      if (!role) return '';

      if (!unit) return role.name;

      if (role.roleType === 'team_leader') return `Tổ trưởng ${unit.name}`;
      if (role.roleType === 'committee_head') return `Trưởng ban ${unit.name.replace(/^Ban\s+/i, '')}`;

      return `${role.name} ${unit.name}`;
}

function getRoomLabelFromAssignment(assignment: OrganizationAssignment) {
      if (assignment.roomCode && assignment.roomName) return `${assignment.roomCode} - ${assignment.roomName}`;
      if (assignment.roomCode) return assignment.roomCode;
      if (assignment.roomName) return assignment.roomName;
      if (assignment.roomId) return `Phòng ${assignment.roomId}`;
      return 'Chưa có phòng';
}

function getRoomLabelFromMember(member: any) {
      if (member?.currentRoomCode) return member.currentRoomName ? `${member.currentRoomCode} - ${member.currentRoomName}` : member.currentRoomCode;
      if (member?.currentRoomName) return member.currentRoomName;
      if (member?.roomCode) return member.roomName ? `${member.roomCode} - ${member.roomName}` : member.roomCode;
      if (member?.roomName) return member.roomName;
      if (member?.currentRoomId) return `Phòng ${member.currentRoomId}`;
      return 'Chưa gán phòng';
}

function getCurrentRoomIdFromMember(member: any) {
      return (
            member?.currentRoomId ??
            member?.currentroomid ??
            member?.currentRoom?.id ??
            null
      );
}

function getResidentDisplayName(member: any) {
      const holyName = member?.holyName ? `${member.holyName} ` : '';
      return `${holyName}${member?.fullName || member?.name || ''}`.trim();
}

function StatCard({
      label,
      value,
      helper,
      icon,
}: {
      label: string;
      value: string | number;
      helper?: string;
      icon: React.ReactNode;
}) {
      return (
            <div className="rounded-[24px] border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_64%,#fff6ee_100%)] p-4 shadow-[0_18px_42px_rgba(120,53,15,0.075)]">
                  <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">{label}</p>
                              <p className="mt-2 truncate text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
                              {helper && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{helper}</p>}
                        </div>
                        <div className="rounded-2xl border border-amber-100 bg-white/85 p-2.5 text-amber-800 shadow-sm shadow-amber-900/5">{icon}</div>
                  </div>
            </div>
      );
}

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
      return (
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>
                  {children}
            </span>
      );
}


function AssignmentStatusPill({ status }: { status: AssignmentStatus }) {
      return (
            <span
                  className={[
                        'rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
                        status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                              : 'bg-slate-50 text-slate-500 ring-slate-100',
                  ].join(' ')}
            >
                  {status === 'active' ? 'Đang hiệu lực' : 'Đã kết thúc'}
            </span>
      );
}

function AssignmentCard({
      assignment,
      onEdit,
      onEnd,
}: {
      assignment: OrganizationAssignment;
      onEdit: (assignment: OrganizationAssignment) => void;
      onEnd: (assignment: OrganizationAssignment) => void;
}) {
      const isActive = assignment.status === 'active';

      return (
            <div className="rounded-3xl border border-amber-100 bg-white/85 p-4 shadow-sm shadow-amber-900/5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(120,53,15,0.09)]">
                  <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                              <p className="truncate text-base font-bold text-slate-950">
                                    {assignment.residentName || 'Chưa rõ học viên'}
                              </p>
                              <p className="mt-1 line-clamp-2 text-sm font-semibold text-amber-800">
                                    {getAssignmentDisplayTitle(assignment)}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-slate-500">
                                    {assignment.unitName && (
                                          <span className="rounded-full bg-amber-50 px-2.5 py-1 ring-1 ring-amber-100">
                                                {assignment.unitName}
                                          </span>
                                    )}
                                    <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-amber-100">
                                          {formatDate(assignment.startDate)}
                                    </span>
                                    <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-amber-100">
                                          {getRoomLabelFromAssignment(assignment)}
                                    </span>
                              </div>
                        </div>

                        <AssignmentStatusPill status={assignment.status} />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                        <button
                              type="button"
                              onClick={() => onEdit(assignment)}
                              className="rounded-xl border border-amber-100 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50"
                        >
                              Sửa
                        </button>
                        {isActive && (
                              <button
                                    type="button"
                                    onClick={() => onEnd(assignment)}
                                    className="rounded-xl border border-rose-100 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                              >
                                    Kết thúc
                              </button>
                        )}
                  </div>
            </div>
      );
}

function AppointmentHistoryPanel({
      assignments,
      terms,
      roles,
}: {
      assignments: OrganizationAssignment[];
      terms: OrganizationTerm[];
      roles: OrganizationRole[];
}) {
      const sortedTerms = [...terms].sort((a, b) => {
            const aStatus = a.status === 'active' ? 0 : a.status === 'inactive' ? 1 : 2;
            const bStatus = b.status === 'active' ? 0 : b.status === 'inactive' ? 1 : 2;
            if (aStatus !== bStatus) return aStatus - bStatus;
            return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      });

      const termList = sortedTerms.length > 0
            ? sortedTerms
            : Array.from(
                    new Map(
                          assignments.map((assignment) => [
                                assignment.termId,
                                {
                                      id: assignment.termId,
                                      code: '',
                                      name: assignment.termName || `Nhiệm kỳ ${assignment.termId}`,
                                      startDate: assignment.startDate,
                                      endDate: assignment.endDate || assignment.startDate,
                                      status: 'inactive' as TermStatus,
                                      description: '',
                                },
                          ])
                    ).values()
              );

      const roleOrder = new Map(roles.map((role, index) => [Number(role.id), index]));

      const historyTree = termList.map((term) => {
            const termAssignments = assignments
                  .filter((assignment) => Number(assignment.termId) === Number(term.id))
                  .sort((a, b) => {
                        const roleCompare =
                              (roleOrder.get(Number(a.roleId)) ?? 999) -
                              (roleOrder.get(Number(b.roleId)) ?? 999);
                        if (roleCompare !== 0) return roleCompare;
                        return getAssignmentPositionTitle(a).localeCompare(getAssignmentPositionTitle(b));
                  });

            const positions = Array.from(
                  termAssignments.reduce((map, assignment) => {
                        const key = getAssignmentPositionKey(assignment);
                        if (!map.has(key)) {
                              map.set(key, {
                                    title: getAssignmentPositionTitle(assignment),
                                    roleName: assignment.roleName || '',
                                    unitName: assignment.unitName || '',
                                    assignments: [] as OrganizationAssignment[],
                              });
                        }

                        map.get(key)?.assignments.push(assignment);
                        return map;
                  }, new Map<string, { title: string; roleName: string; unitName: string; assignments: OrganizationAssignment[] }>())
            ).map(([key, value]) => ({ key, ...value }));

            return {
                  term,
                  positions,
                  totalAssignments: termAssignments.length,
            };
      });

      const buildAllTermState = (expanded: boolean) =>
            historyTree.reduce((acc, item) => {
                  acc[String(item.term.id)] = expanded;
                  return acc;
            }, {} as Record<string, boolean>);

      const buildAllPositionState = (expanded: boolean) =>
            historyTree.reduce((acc, item) => {
                  item.positions.forEach((position) => {
                        acc[`${item.term.id}:${position.key}`] = expanded;
                  });
                  return acc;
            }, {} as Record<string, boolean>);

      const [expandedTerms, setExpandedTerms] = useState<Record<string, boolean>>(() =>
            historyTree.reduce((acc, item, index) => {
                  acc[String(item.term.id)] = item.term.status === 'active' || index === 0;
                  return acc;
            }, {} as Record<string, boolean>)
      );

      const [expandedPositions, setExpandedPositions] = useState<Record<string, boolean>>(() =>
            historyTree.reduce((acc, item, termIndex) => {
                  item.positions.forEach((position, positionIndex) => {
                        acc[`${item.term.id}:${position.key}`] =
                              item.term.status === 'active' || (termIndex === 0 && positionIndex < 4);
                  });
                  return acc;
            }, {} as Record<string, boolean>)
      );

      const toggleTerm = (termId: number) => {
            setExpandedTerms((current) => ({
                  ...current,
                  [String(termId)]: !current[String(termId)],
            }));
      };

      const togglePosition = (termId: number, positionKey: string) => {
            const key = `${termId}:${positionKey}`;
            setExpandedPositions((current) => ({
                  ...current,
                  [key]: !current[key],
            }));
      };

      const expandAll = () => {
            setExpandedTerms(buildAllTermState(true));
            setExpandedPositions(buildAllPositionState(true));
      };

      const collapseAll = () => {
            setExpandedTerms(buildAllTermState(false));
            setExpandedPositions(buildAllPositionState(false));
      };

      return (
            <div className={residenceMediumStyle.premiumSection}>
                  <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                              <p className={residenceMediumStyle.modalEyebrow}>Lịch sử bổ nhiệm</p>
                              <h3 className="mt-1 text-[22px] font-bold tracking-tight text-slate-950">
                                    Lịch sử bổ nhiệm theo nhiệm kỳ
                              </h3>
                              <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Cấu trúc 3 cấp: nhiệm kỳ → vai trò/vị trí → danh sách người phụ trách. Có thể mở/thu từng cấp để xem gọn hơn.
                              </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                              <button
                                    type="button"
                                    onClick={expandAll}
                                    className="rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm shadow-amber-900/5 transition hover:bg-amber-50"
                              >
                                    Mở tất cả
                              </button>
                              <button
                                    type="button"
                                    onClick={collapseAll}
                                    className="rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm shadow-amber-900/5 transition hover:bg-amber-50"
                              >
                                    Thu gọn tất cả
                              </button>
                              <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-amber-100">
                                    {assignments.length} dòng lịch sử
                              </span>
                        </div>
                  </div>

                  {historyTree.length === 0 ? (
                        <SectionEmpty
                              title="Chưa có nhiệm kỳ"
                              description="Tạo nhiệm kỳ ở tab Nhiệm kỳ để bắt đầu lưu lịch sử bổ nhiệm."
                        />
                  ) : (
                        <div className="space-y-3">
                              {historyTree.map(({ term, positions, totalAssignments }) => {
                                    const termKey = String(term.id);
                                    const isTermExpanded = Boolean(expandedTerms[termKey]);

                                    return (
                                          <section
                                                key={term.id}
                                                className="overflow-hidden rounded-[28px] border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_70%,#fff7ef_100%)] shadow-[0_14px_36px_rgba(120,53,15,0.055)]"
                                          >
                                                <button
                                                      type="button"
                                                      onClick={() => toggleTerm(term.id)}
                                                      className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-amber-50/45"
                                                >
                                                      <div className="flex min-w-0 items-start gap-3">
                                                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-base font-bold text-white shadow-sm shadow-slate-900/15">
                                                                  {isTermExpanded ? '−' : '+'}
                                                            </span>
                                                            <div className="min-w-0">
                                                                  <div className="flex flex-wrap items-center gap-2">
                                                                        <p className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-800 ring-1 ring-amber-100">
                                                                              Cấp 1 · Nhiệm kỳ
                                                                        </p>
                                                                        <Badge className={getTermStatusClass(term.status)}>
                                                                              {getTermStatusLabel(term.status)}
                                                                        </Badge>
                                                                  </div>
                                                                  <h4 className="mt-1 text-lg font-extrabold tracking-tight text-slate-950">
                                                                        {term.status === 'active' ? 'Nhiệm kỳ hiện tại' : term.name}
                                                                  </h4>
                                                                  <p className="mt-1 text-sm font-medium text-slate-500">
                                                                        {term.name} · {formatDate(term.startDate)} - {formatDate(term.endDate)}
                                                                  </p>
                                                            </div>
                                                      </div>

                                                      <div className="flex shrink-0 flex-wrap justify-end gap-2 text-xs font-semibold text-slate-500">
                                                            <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-amber-100">
                                                                  {positions.length} vị trí
                                                            </span>
                                                            <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-amber-100">
                                                                  {totalAssignments} lượt
                                                            </span>
                                                      </div>
                                                </button>

                                                {isTermExpanded && (
                                                      <div className="border-t border-amber-100/70 bg-[linear-gradient(180deg,rgba(255,253,248,0.72)_0%,rgba(255,255,255,0.94)_100%)] py-3 pl-7 pr-3 md:pl-10">
                                                            {positions.length === 0 ? (
                                                                  <div className="rounded-2xl border border-dashed border-amber-100 bg-white/60 p-4 text-sm text-slate-500">
                                                                        Chưa có lịch sử bổ nhiệm trong nhiệm kỳ này.
                                                                  </div>
                                                            ) : (
                                                                  <div className="space-y-2 border-l border-dashed border-amber-100/80 pl-3">
                                                                        {positions.map((position) => {
                                                                              const positionKey = `${term.id}:${position.key}`;
                                                                              const isPositionExpanded = Boolean(expandedPositions[positionKey]);

                                                                              return (
                                                                                    <div
                                                                                          key={position.key}
                                                                                          className="overflow-hidden rounded-2xl border border-slate-200/75 bg-white/82 shadow-sm shadow-slate-900/5"
                                                                                    >
                                                                                          <button
                                                                                                type="button"
                                                                                                onClick={() => togglePosition(term.id, position.key)}
                                                                                                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-slate-50/80"
                                                                                          >
                                                                                                <div className="flex min-w-0 items-center gap-3">
                                                                                                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-500">
                                                                                                            {isPositionExpanded ? '−' : '+'}
                                                                                                      </span>
                                                                                                      <div className="min-w-0">
                                                                                                            <div className="flex flex-wrap items-center gap-2">
                                                                                                                  <p className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                                                                                                        Cấp 2 · Vai trò
                                                                                                                  </p>
                                                                                                                  <span className="rounded-full bg-amber-50/70 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-100">
                                                                                                                        {position.assignments.length} người
                                                                                                                  </span>
                                                                                                            </div>
                                                                                                            <p className="mt-1 truncate text-[14px] font-bold text-slate-700">
                                                                                                                  {position.title}
                                                                                                            </p>
                                                                                                            {(position.unitName || position.roleName) && (
                                                                                                                  <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">
                                                                                                                        {[position.roleName, position.unitName].filter(Boolean).join(' · ')}
                                                                                                                  </p>
                                                                                                            )}
                                                                                                      </div>
                                                                                                </div>
                                                                                          </button>

                                                                                          {isPositionExpanded && (
                                                                                                <div className="space-y-2 border-t border-slate-200/70 bg-slate-50/35 py-3 pl-7 pr-3 md:pl-9">
                                                                                                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                                                                                                            Cấp 3 · Danh sách người phụ trách
                                                                                                      </p>
                                                                                                      {position.assignments.map((assignment) => (
                                                                                                            <div
                                                                                                                  key={assignment.id}
                                                                                                                  className="rounded-2xl border border-slate-200/70 bg-white/82 px-3 py-2 shadow-sm shadow-slate-900/5"
                                                                                                            >
                                                                                                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                                                                                                        <p className="text-sm font-semibold text-slate-700">
                                                                                                                              {getDisplayResidentName(assignment)}
                                                                                                                        </p>
                                                                                                                        <AssignmentStatusPill status={assignment.status} />
                                                                                                                  </div>
                                                                                                                  <p className="mt-1 text-[11px] leading-5 text-slate-400">
                                                                                                                        {formatDate(assignment.startDate)}
                                                                                                                        {' - '}
                                                                                                                        {assignment.endDate ? formatDate(assignment.endDate) : 'Hiện tại'}
                                                                                                                        {assignment.roomCode ? ` · ${assignment.roomCode}` : ''}
                                                                                                                  </p>
                                                                                                            </div>
                                                                                                      ))}
                                                                                                </div>
                                                                                          )}
                                                                                    </div>
                                                                              );
                                                                        })}
                                                                  </div>
                                                            )}
                                                      </div>
                                                )}
                                          </section>
                                    );
                              })}
                        </div>
                  )}
            </div>
      );
}



function isHouseRole(assignment: OrganizationAssignment, roleType?: string | null) {
      const roleName = String(assignment.roleName || assignment.assignmentTitle || '').toLowerCase();

      return (
            roleType === 'house_leader' ||
            roleType === 'deputy' ||
            roleType === 'secretary' ||
            roleType === 'treasurer' ||
            roleName.includes('trưởng') ||
            roleName.includes('phó') ||
            roleName.includes('thư ký') ||
            roleName.includes('thủ quỹ')
      );
}

function getAssignmentRoleKey(assignment: OrganizationAssignment) {
      const title = getAssignmentDisplayTitle(assignment).toLowerCase();
      const roleType = assignment.roleType || '';

      if (roleType === 'house_leader' || title.includes('trưởng lưu xá') || title === 'trưởng') return 'leader';
      if (roleType === 'deputy' || title.includes('phó')) return 'deputy';
      if (roleType === 'secretary' || title.includes('thư ký')) return 'secretary';
      if (roleType === 'treasurer' || title.includes('thủ quỹ')) return 'treasurer';
      if (roleType === 'team_leader') return 'team_leader';
      if (roleType === 'committee_head') return 'committee_head';

      return 'other';
}

function getRoleStructureKey(role?: OrganizationRole | null) {
      if (!role) return 'other';

      const roleType = String(role.roleType || '');
      const roleName = normalizeText(role.name || '');

      if (roleType === 'team_leader' || roleName.includes('to truong')) return 'team_leader';
      if (roleType === 'committee_head' || roleName.includes('truong ban')) return 'committee_head';
      if (roleType === 'house_leader' || roleType === 'head' || roleName === 'truong' || roleName.includes('truong luu xa')) return 'leader';
      if (roleType === 'deputy' || roleName.includes('pho')) return 'deputy';
      if (roleType === 'secretary' || roleName.includes('thu ky')) return 'secretary';
      if (roleType === 'treasurer' || roleName.includes('thu quy')) return 'treasurer';

      return 'other';
}

function findRoleForStructureKey(roles: OrganizationRole[], roleKey?: string | null) {
      if (!roleKey) return null;

      return (
            roles.find((role) => getRoleStructureKey(role) === roleKey && role.isActive) ||
            roles.find((role) => getRoleStructureKey(role) === roleKey) ||
            null
      );
}



function getDisplayRoleTitle(assignment: OrganizationAssignment) {
      return assignment.assignmentTitle || getAssignmentDisplayTitle(assignment);
}

function getDisplayResidentName(assignment?: OrganizationAssignment | null) {
      if (!assignment) return '';

      const holyName = (assignment.holyName || assignment.residentHolyName || '').trim();
      const residentName = (assignment.residentName || 'Chưa rõ học viên').trim();

      if (!holyName || residentName.toLowerCase().startsWith(holyName.toLowerCase())) {
            return residentName;
      }

      return `${holyName} ${residentName}`.trim();
}

function PremiumOrgPersonCard({
      title,
      assignment,
      variant = 'normal',
      onEdit,
      onEnd,
      onCreateAssignment,
}: {
      title: string;
      assignment?: OrganizationAssignment | null;
      variant?: 'head' | 'normal' | 'unit';
      onEdit?: (assignment: OrganizationAssignment) => void;
      onEnd?: (assignment: OrganizationAssignment) => void;
      onCreateAssignment?: () => void;
}) {
      const hasAssignment = Boolean(assignment);
      const displayName = getDisplayResidentName(assignment);

      return (
            <div
                  className={
                        hasAssignment
                              ? variant === 'head'
                                    ? residenceMediumStyle.orgPersonCardHead
                                    : residenceMediumStyle.orgPersonCard
                              : residenceMediumStyle.orgPersonCardEmpty
                  }
            >
                  <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                              <p className={residenceMediumStyle.orgPersonTitle}>
                                    {title}
                              </p>
                              <p className={residenceMediumStyle.orgPersonName}>
                                    {hasAssignment ? displayName : 'Đang trống'}
                              </p>
                        </div>

                        <div
                              className={
                                    hasAssignment
                                          ? residenceMediumStyle.orgAvatarActive
                                          : residenceMediumStyle.orgAvatarEmpty
                              }
                        >
                              {hasAssignment ? displayName.charAt(0).toUpperCase() : '—'}
                        </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                        {assignment ? (
                              <>
                                    {onEdit && (
                                          <button
                                                type="button"
                                                onClick={() => onEdit(assignment)}
                                                className="rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                          >
                                                Sửa
                                          </button>
                                    )}
                                    {onEnd && (
                                          <button
                                                type="button"
                                                onClick={() => onEnd(assignment)}
                                                className="rounded-full border border-rose-100 bg-white/80 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                                          >
                                                Kết thúc
                                          </button>
                                    )}
                              </>
                        ) : (
                              onCreateAssignment && (
                                    <button
                                          type="button"
                                          onClick={onCreateAssignment}
                                          className="rounded-full border border-amber-100 bg-white/80 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50"
                                    >
                                          Phân công
                                    </button>
                              )
                        )}
                  </div>
            </div>
      );
}

function PremiumUnitColumn({
      title,
      units,
      assignments,
      unitType,
      onEdit,
      onEnd,
      onCreateAssignment,
      onOpenUnitMembers,
      onOpenTeamTransfer,
}: {
      title: string;
      units: OrganizationUnit[];
      assignments: OrganizationAssignment[];
      unitType: UnitType;
      onEdit: (assignment: OrganizationAssignment) => void;
      onEnd: (assignment: OrganizationAssignment) => void;
      onCreateAssignment: (unitId?: number, roleKey?: string) => void;
      onOpenUnitMembers: (unit: OrganizationUnit) => void;
      onOpenTeamTransfer: (unit: OrganizationUnit) => void;
}) {
      const activeUnits = units.filter((unit) => unit.unitType === unitType);
      const isTeam = unitType === 'team';
      const headerAccent =
            unitType === 'team'
                  ? 'from-emerald-50 via-teal-50 to-white'
                  : 'from-violet-50 via-indigo-50 to-white';

      return (
            <section className={residenceMediumStyle.orgUnitColumn}>
                  <div className={`bg-gradient-to-r ${headerAccent} px-5 py-4`}>
                        <div className="flex items-end justify-between gap-3">
                              <div>
                                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                                          {title}
                                    </h3>
                                    <p className="mt-1 text-xs font-medium text-slate-500">
                                          {activeUnits.length} đơn vị đang hoạt động
                                    </p>
                              </div>
                              <span className={['rounded-full bg-white/80 px-3 py-1 text-sm font-bold ring-1', isTeam ? 'text-emerald-700 ring-amber-100 bg-white/80' : 'text-violet-700 ring-amber-100 bg-white/80'].join(' ')}>
                                    {activeUnits.length}
                              </span>
                        </div>
                  </div>

                  <div className="space-y-3 p-3 sm:p-4">
                        {activeUnits.length === 0 ? (
                              <SectionEmpty
                                    title={`Chưa có ${title.toLowerCase()}`}
                                    description="Có thể tạo thêm trong tab Tổ / Ban."
                              />
                        ) : (
                              activeUnits.map((unit, index) => {
                                    const accent = residenceMediumAccents[index % residenceMediumAccents.length];
                                    const leaders = assignments.filter(
                                          (assignment) =>
                                                Number(assignment.unitId || 0) === Number(unit.id) &&
                                                assignment.status === 'active' &&
                                                ((unitType === 'team' && getAssignmentRoleKey(assignment) === 'team_leader') ||
                                                      (unitType === 'committee' && getAssignmentRoleKey(assignment) === 'committee_head'))
                                    );

                                    const members = assignments.filter(
                                          (assignment) =>
                                                Number(assignment.unitId || 0) === Number(unit.id) &&
                                                assignment.status === 'active' &&
                                                !leaders.some((leader) => leader.id === assignment.id)
                                    );

                                    return (
                                          <div
                                                key={unit.id}
                                                className={residenceMediumStyle.orgUnitCard}
                                          >
                                                <div>
                                                      <div className="mb-3 flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                  <p className="truncate text-base font-extrabold text-slate-800">
                                                                        {unit.name}
                                                                  </p>
                                                            </div>
                                                            <span
                                                                  className={[
                                                                        'rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold ring-1',
                                                                        isTeam
                                                                              ? 'text-emerald-700 ring-emerald-100'
                                                                              : 'text-violet-700 ring-violet-100',
                                                                  ].join(' ')}
                                                                  title="Số thành viên"
                                                            >
                                                                  {members.length + leaders.length}
                                                            </span>
                                                      </div>

                                                      <div className="space-y-2">
                                                            {leaders.length > 0 ? (
                                                                  leaders.map((leader) => (
                                                                        <PremiumOrgPersonCard
                                                                              key={leader.id}
                                                                              title={isTeam ? 'Tổ trưởng' : 'Trưởng ban'}
                                                                              assignment={leader}
                                                                              variant="unit"
                                                                              onEdit={onEdit}
                                                                              onEnd={onEnd}
                                                                        />
                                                                  ))
                                                            ) : (
                                                                  <PremiumOrgPersonCard
                                                                        title={isTeam ? 'Tổ trưởng' : 'Trưởng ban'}
                                                                        variant="unit"
                                                                        onCreateAssignment={() =>
                                                                              onCreateAssignment(
                                                                                    unit.id,
                                                                                    isTeam ? 'team_leader' : 'committee_head'
                                                                              )
                                                                        }
                                                                  />
                                                            )}

                                                            {members.length > 0 && (
                                                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                                                        {members.slice(0, 8).map((member) => (
                                                                              <span
                                                                                    key={member.id}
                                                                                    className="rounded-full bg-white/75 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200/80"
                                                                                    title={getDisplayRoleTitle(member)}
                                                                              >
                                                                                    {getDisplayResidentName(member)}
                                                                              </span>
                                                                        ))}
                                                                        {members.length > 8 && (
                                                                              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-100">
                                                                                    +{members.length - 8}
                                                                              </span>
                                                                        )}
                                                                  </div>
                                                            )}
                                                      </div>

                                                      <div className="mt-4 flex flex-wrap gap-2">
                                                            <button
                                                                  type="button"
                                                                  onClick={() => onOpenUnitMembers(unit)}
                                                                  className="rounded-full border border-slate-200 bg-white/75 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                                                            >
                                                                  Thành viên
                                                            </button>
                                                            {isTeam && (
                                                                  <button
                                                                        type="button"
                                                                        onClick={() => onOpenTeamTransfer(unit)}
                                                                        className="rounded-full border border-emerald-100 bg-white/75 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                                                                  >
                                                                        Điều chuyển
                                                                  </button>
                                                            )}
                                                      </div>
                                                </div>
                                          </div>
                                    );
                              })
                        )}
                  </div>
            </section>
      );
}

function PremiumOrganizationChart({
      assignments,
      units,
      onEditAssignment,
      onEndAssignment,
      onCreateAssignment,
      onOpenUnitMembers,
      onOpenTeamTransfer,
}: {
      assignments: OrganizationAssignment[];
      roles: OrganizationRole[];
      units: OrganizationUnit[];
      onEditAssignment: (assignment: OrganizationAssignment) => void;
      onEndAssignment: (assignment: OrganizationAssignment) => void;
      onCreateAssignment: (unitId?: number, roleKey?: string) => void;
      onOpenUnitMembers: (unit: OrganizationUnit) => void;
      onOpenTeamTransfer: (unit: OrganizationUnit) => void;
      showActions?: boolean;
}) {
      const activeAssignments = assignments.filter((assignment) => assignment.status === 'active');
      const leader = activeAssignments.find((assignment) => getAssignmentRoleKey(assignment) === 'leader') || null;
      const deputies = activeAssignments.filter((assignment) => getAssignmentRoleKey(assignment) === 'deputy');
      const secretary = activeAssignments.find((assignment) => getAssignmentRoleKey(assignment) === 'secretary') || null;
      const treasurer = activeAssignments.find((assignment) => getAssignmentRoleKey(assignment) === 'treasurer') || null;

      const executiveAssignments = [
            { title: 'Trưởng', roleKey: 'leader', assignment: leader, variant: 'head' as const },
            { title: 'Phó 1', roleKey: 'deputy', assignment: deputies[0] || null, variant: 'normal' as const },
            { title: 'Phó 2', roleKey: 'deputy', assignment: deputies[1] || null, variant: 'normal' as const },
            { title: 'Thư ký', roleKey: 'secretary', assignment: secretary, variant: 'normal' as const },
            { title: 'Thủ quỹ', roleKey: 'treasurer', assignment: treasurer, variant: 'normal' as const },
      ];

      return (
            <div className="space-y-5">
                  <div className={residenceMediumStyle.orgChartPanel}>
                        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                              <div>
                                    <p className={residenceMediumStyle.modalEyebrow}>Cơ cấu hiện tại</p>
                                    <h3 className="mt-1 text-[22px] font-bold tracking-tight text-slate-950">
                                          Sơ đồ tổ chức lưu xá
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                          Nhìn nhanh người đang đảm nhiệm từng vị trí. Có thể phân công hoặc điều chuyển ngay trên sơ đồ.
                                    </p>
                              </div>
                              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                                    {activeAssignments.length} phân công
                              </span>
                        </div>

                        <div className={residenceMediumStyle.orgExecutivePanel}>
                              <div className="mb-4 flex items-end justify-between gap-3">
                                    <div>
                                          <p className={residenceMediumStyle.modalEyebrow}>Ban điều hành</p>
                                          <h4 className="mt-1 text-lg font-bold text-slate-900">Các chức vụ điều hành chính</h4>
                                    </div>
                              </div>

                              <div className="mx-auto max-w-xl">
                                    <PremiumOrgPersonCard
                                          title="Trưởng"
                                          assignment={leader}
                                          variant="head"
                                          onEdit={onEditAssignment}
                                          onEnd={onEndAssignment}
                                          onCreateAssignment={() => onCreateAssignment(undefined, 'leader')}
                                    />
                              </div>

                              <div className="mx-auto my-5 h-7 w-px bg-gradient-to-b from-slate-200 to-transparent" />

                              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                    {executiveAssignments.slice(1).map((item, index) => (
                                          <PremiumOrgPersonCard
                                                key={`${item.title}-${item.assignment?.id || index}`}
                                                title={item.title}
                                                assignment={item.assignment}
                                                variant={item.variant}
                                                onEdit={onEditAssignment}
                                                onEnd={onEndAssignment}
                                                onCreateAssignment={() => onCreateAssignment(undefined, item.roleKey)}
                                          />
                                    ))}
                              </div>
                        </div>
                  </div>

                  <div className={residenceMediumStyle.orgUnitsPanel}>
                        <div className="mb-5">
                              <p className={residenceMediumStyle.modalEyebrow}>Tổ / Ban</p>
                              <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                                    Các đơn vị đang hoạt động
                              </h3>
                              <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Theo dõi Tổ và Ban riêng theo từng khối để dễ quan sát, thêm thành viên và điều chuyển.
                              </p>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                              <PremiumUnitColumn
                                    title="Tổ"
                                    units={units}
                                    assignments={activeAssignments}
                                    unitType="team"
                                    onEdit={onEditAssignment}
                                    onEnd={onEndAssignment}
                                    onCreateAssignment={onCreateAssignment}
                                    onOpenUnitMembers={onOpenUnitMembers}
                                    onOpenTeamTransfer={onOpenTeamTransfer}
                              />
                              <PremiumUnitColumn
                                    title="Ban"
                                    units={units}
                                    assignments={activeAssignments}
                                    unitType="committee"
                                    onEdit={onEditAssignment}
                                    onEnd={onEndAssignment}
                                    onCreateAssignment={onCreateAssignment}
                                    onOpenUnitMembers={onOpenUnitMembers}
                                    onOpenTeamTransfer={onOpenTeamTransfer}
                              />
                        </div>
                  </div>
            </div>
      );
}

function SectionEmpty({ title, description }: { title: string; description: string }) {
      return (
            <div className="rounded-3xl border border-dashed border-amber-100 bg-amber-50/45 p-6 text-center">
                  <p className="font-semibold text-slate-800">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
            </div>
      );
}

export default function OrganizationSimple() {
      const [activeTab, setActiveTab] = useState<SimpleTab>('structure');
      const [selectedTermId, setSelectedTermId] = useState<string>('active');
      const [searchTerm, setSearchTerm] = useState('');
      const [handoverResidentId, setHandoverResidentId] = useState<number | null>(null);

      const [assignmentForm, setAssignmentForm] = useState<AssignmentForm | null>(null);
      const [assignmentRoleLock, setAssignmentRoleLock] = useState<{
            roleId: string;
            unitId?: string;
            returnTab: SimpleTab;
      } | null>(null);
      const [assignmentFormReturnTab, setAssignmentFormReturnTab] = useState<SimpleTab>('assignments');
      const [unitForm, setUnitForm] = useState<UnitForm | null>(null);
      const [selectedUnitForMembers, setSelectedUnitForMembers] = useState<OrganizationUnit | null>(null);
      const [selectedResidentToAdd, setSelectedResidentToAdd] = useState<string>("");
      const [selectedResidentToTransfer, setSelectedResidentToTransfer] = useState<string>("");
      const [selectedTargetUnitToTransfer, setSelectedTargetUnitToTransfer] = useState<string>("");
      const [transferConfirm, setTransferConfirm] = useState<{
            residentId: number;
            residentName: string;
            targetUnitName: string;
      } | null>(null);
      const [termForm, setTermForm] = useState<TermForm | null>(null);

      const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
      const [returnToMembersPath, setReturnToMembersPath] = useState<string | null>(null);
      const [returnToMembersLabel, setReturnToMembersLabel] = useState<string>('Quay lại học viên');
      const [pendingOrganizationFocus, setPendingOrganizationFocus] = useState<{
            residentId: number;
            action: OrganizationFocusAction;
            unitId?: number;
      } | null>(null);

      const utils = trpc.useUtils();
      const selectedUnitId = selectedUnitForMembers?.id ? Number(selectedUnitForMembers.id) : 0;

      const termsQuery = trpc.organization.listTerms.useQuery({
            limit: 500,
            offset: 0,
      });

      const rolesQuery = trpc.organization.listRoles.useQuery({
            isActive: true,
            limit: 500,
            offset: 0,
      });

      const unitsQuery = trpc.organization.listUnits.useQuery({
            limit: 500,
            offset: 0,
      });

      const membersQuery = trpc.members.list.useQuery({
            status: 'active' as any,
      });

      const unitMembersQuery = trpc.organization.listUnitMembers.useQuery(
            {
                  unitId: selectedUnitId,
                  status: 'active',
            },
            {
                  enabled: selectedUnitId > 0,
                  refetchOnWindowFocus: false,
            }
      );

      const availableUnitResidentsQuery = trpc.organization.getAvailableResidentsForUnit.useQuery(
            {
                  unitId: selectedUnitId,
            },
            {
                  enabled: selectedUnitId > 0,
                  refetchOnWindowFocus: false,
            }
      );

      const createAssignmentMutation = trpc.organization.createAssignment.useMutation();
      const updateAssignmentMutation = trpc.organization.updateAssignment.useMutation();
      const endAssignmentMutation = trpc.organization.endAssignment.useMutation();

      const createUnitMutation = trpc.organization.createUnit.useMutation();
      const updateUnitMutation = trpc.organization.updateUnit.useMutation();
      const toggleUnitActiveMutation = trpc.organization.toggleUnitActive.useMutation();
      const addUnitMemberMutation = trpc.organization.addUnitMember.useMutation();
      const removeUnitMemberMutation = trpc.organization.removeUnitMember.useMutation();
      const transferTeamMemberMutation = trpc.organization.transferTeamMember.useMutation();
      const syncUnitLeadersMutation = trpc.organization.syncUnitLeadersToMembers.useMutation();

      const createTermMutation = trpc.organization.createTerm.useMutation();
      const updateTermMutation = trpc.organization.updateTerm.useMutation();
      const setActiveTermMutation = trpc.organization.setActiveTerm.useMutation();

      const markAsLeftMutation = trpc.members.markAsLeft.useMutation();

      useEffect(() => {
            const params = new URLSearchParams(window.location.search);
            const residentId = Number(params.get('handoverResidentId') || 0);

            if (residentId > 0) {
                  setHandoverResidentId(residentId);
                  setActiveTab('assignments');
                  setSelectedTermId('active');
                  setSearchTerm('');
                  setMessage({
                        type: 'info',
                        text: 'Đang xử lý bàn giao chức vụ. Vui lòng kết thúc hoặc cập nhật các phân công của học viên trước khi cho rời lưu xá.',
                  });
            }
      }, []);


      useEffect(() => {
            let residentId = 0;
            let action = '' as OrganizationFocusAction | '';
            let focusUnitId = 0;
            let returnTo = '';
            let returnLabel = '';

            try {
                  residentId = Number(
                        sessionStorage.getItem('residencecare.organization.focusResidentId') || 0
                  );
                  action =
                        (sessionStorage.getItem(
                              'residencecare.organization.focusAction'
                        ) || '') as OrganizationFocusAction | '';
                  focusUnitId = Number(
                        sessionStorage.getItem('residencecare.organization.focusUnitId') || 0
                  );
                  returnTo =
                        sessionStorage.getItem('residencecare.organization.returnTo') || '';
                  returnLabel =
                        sessionStorage.getItem('residencecare.organization.returnLabel') || '';

                  sessionStorage.removeItem('residencecare.organization.focusResidentId');
                  sessionStorage.removeItem('residencecare.organization.focusAction');
                  sessionStorage.removeItem('residencecare.organization.focusUnitId');
                  sessionStorage.removeItem('residencecare.organization.returnTo');
                  sessionStorage.removeItem('residencecare.organization.returnLabel');
            } catch {
                  // Ignore storage errors.
            }

            if (!residentId || !action) return;

            setPendingOrganizationFocus({
                  residentId,
                  action,
                  unitId: focusUnitId || undefined,
            });
            setReturnToMembersPath(returnTo || '/members');
            setReturnToMembersLabel(returnLabel || 'Quay lại học viên');
            setSelectedTermId('active');
            setSearchTerm('');
      }, []);

      const terms = (termsQuery.data || []) as OrganizationTerm[];
      const roles = ((rolesQuery.data || []) as OrganizationRole[]).sort((a, b) => {
            const levelCompare = getRoleLevel(a) - getRoleLevel(b);
            if (levelCompare !== 0) return levelCompare;
            return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
      });
      const units = ((unitsQuery.data || []) as OrganizationUnit[]).sort((a, b) => {
            const typeCompare = String(a.unitType || '').localeCompare(String(b.unitType || ''));
            if (typeCompare !== 0) return typeCompare;
            return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
      });
      const activeMembers = (membersQuery.data || []) as any[];

      const activeTerm = useMemo(() => {
            return terms.find((term) => term.status === 'active') || null;
      }, [terms]);

      const currentTermId =
            selectedTermId === 'active'
                  ? activeTerm?.id
                  : selectedTermId !== 'all'
                        ? Number(selectedTermId)
                        : undefined;

      const assignmentsQuery = trpc.organization.listAssignments.useQuery({
            search: searchTerm || undefined,
            termId: activeTab === 'assignments' ? undefined : currentTermId,
            status: activeTab === 'structure' ? 'active' : undefined,
            limit: 500,
            offset: 0,
      });

      const assignments = (assignmentsQuery.data || []) as OrganizationAssignment[];

      const activeAssignments = assignments.filter((assignment) => assignment.status === 'active');
      const activeUnits = units.filter((unit) => unit.isActive);

      const missingRoles = useMemo(() => {
            if (!currentTermId) return [];

            return roles
                  .filter((role) => role.isActive && Number(role.minAssignees || 0) > 0)
                  .map((role) => {
                        const count = activeAssignments.filter(
                              (assignment) => assignment.roleId === role.id
                        ).length;

                        return {
                              role,
                              count,
                              missing: Math.max(Number(role.minAssignees || 0) - count, 0),
                        };
                  })
                  .filter((item) => item.missing > 0);
      }, [roles, activeAssignments, currentTermId]);

      const selectedRole = assignmentForm?.roleId
            ? roles.find((role) => String(role.id) === String(assignmentForm.roleId)) || null
            : null;

      const selectedUnit = assignmentForm?.unitId
            ? units.find((unit) => String(unit.id) === String(assignmentForm.unitId)) || null
            : null;

      const selectedMember = assignmentForm?.residentId
            ? activeMembers.find((member: any) => String(member.id) === String(assignmentForm.residentId)) || null
            : null;

      const assignmentRoleOptions = assignmentRoleLock?.roleId
            ? roles.filter((role) => String(role.id) === String(assignmentRoleLock.roleId))
            : roles;

      const currentTerm = currentTermId
            ? terms.find((term) => term.id === currentTermId) || null
            : activeTerm;


      const returnToMembers = () => {
            if (!returnToMembersPath) return;

            window.location.assign(returnToMembersPath);
      };

      const openAssignmentCreateFromStructure = (unitId?: number, roleKey?: string) => {
            setMessage(null);

            const role = findRoleForStructureKey(roles, roleKey);
            const unit = unitId ? activeUnits.find((item) => Number(item.id) === Number(unitId)) || null : null;
            const roleId = role ? String(role.id) : '';

            setAssignmentFormReturnTab(activeTab);
            setAssignmentRoleLock(
                  roleId
                        ? {
                                roleId,
                                unitId: unitId ? String(unitId) : undefined,
                                returnTab: activeTab,
                          }
                        : null
            );
            setAssignmentForm({
                  ...emptyAssignmentForm,
                  termId: currentTermId ? String(currentTermId) : '',
                  roleId,
                  unitId: unitId ? String(unitId) : '',
                  assignmentTitle: role ? buildAssignmentTitle(role, unit) : '',
            });
      };

      const openUnitMembersFromStructure = (unit: OrganizationUnit) => {
            openUnitMembers(unit);
            setActiveTab('units');
      };

      const openTeamTransferFromStructure = (unit: OrganizationUnit) => {
            const targetTeam =
                  activeUnits.find(
                        (item) =>
                              item.unitType === 'team' &&
                              Number(item.id) !== Number(unit.id)
                  ) || null;

            setSelectedUnitForMembers(unit);
            setSelectedResidentToAdd('');
            setSelectedResidentToTransfer('');
            setSelectedTargetUnitToTransfer(targetTeam ? String(targetTeam.id) : '');
            setTransferConfirm(null);
            setActiveTab('units');
            setMessage({
                  type: 'info',
                  text: `Đã mở phần điều chuyển cho ${unit.name}. Chọn học viên và Tổ đến để tiếp tục.`,
            });
      };


      useEffect(() => {
            if (!pendingOrganizationFocus) return;
            if (termsQuery.isLoading || rolesQuery.isLoading || unitsQuery.isLoading || membersQuery.isLoading) return;

            const resident = activeMembers.find(
                  (member: any) => Number(member.id) === pendingOrganizationFocus.residentId
            );

            if (!resident) {
                  setMessage({
                        type: 'error',
                        text: 'Không tìm thấy học viên cần thao tác trong danh sách đang lưu trú.',
                  });
                  setPendingOrganizationFocus(null);
                  return;
            }

            if (pendingOrganizationFocus.action === 'create_assignment') {
                  setAssignmentForm({
                        ...emptyAssignmentForm,
                        termId: currentTermId ? String(currentTermId) : '',
                        residentId: String(pendingOrganizationFocus.residentId),
                  });
                  setActiveTab('assignments');
                  setMessage({
                        type: 'info',
                        text: `Đang bổ nhiệm chức vụ cho ${resident.displayName || resident.fullName}.`,
                  });
                  setPendingOrganizationFocus(null);
                  return;
            }

            setActiveTab('units');

            if (pendingOrganizationFocus.action === 'transfer_team_member') {
                  const teams = activeUnits.filter((unit) => unit.unitType === 'team');
                  const currentTeam =
                        teams.find((unit) => Number(unit.id) === Number(pendingOrganizationFocus.unitId || 0)) ||
                        teams[0] ||
                        null;
                  const targetTeam =
                        teams.find((unit) => Number(unit.id) !== Number(currentTeam?.id || 0)) ||
                        null;

                  if (!currentTeam) {
                        setMessage({
                              type: 'error',
                              text: 'Chưa có Tổ đang hoạt động. Vui lòng tạo Tổ trước khi đổi tổ.',
                        });
                        setPendingOrganizationFocus(null);
                        return;
                  }

                  setSelectedUnitForMembers(currentTeam);
                  setSelectedResidentToAdd('');
                  setSelectedResidentToTransfer(String(pendingOrganizationFocus.residentId));
                  setSelectedTargetUnitToTransfer(targetTeam ? String(targetTeam.id) : '');
                  setTransferConfirm(null);
                  setMessage({
                        type: 'info',
                        text: `Đang đổi tổ cho ${resident.displayName || resident.fullName}. Vui lòng chọn Tổ đến rồi bấm Đổi tổ.`,
                  });
                  setPendingOrganizationFocus(null);
                  return;
            }

            const targetUnitType =
                  pendingOrganizationFocus.action === 'add_team_member'
                        ? 'team'
                        : 'committee';

            const targetUnits = activeUnits.filter((unit) => unit.unitType === targetUnitType);

            if (targetUnits.length === 0) {
                  setMessage({
                        type: 'error',
                        text:
                              targetUnitType === 'team'
                                    ? 'Chưa có Tổ đang hoạt động. Vui lòng tạo Tổ trước khi thêm học viên.'
                                    : 'Chưa có Ban đang hoạt động. Vui lòng tạo Ban trước khi thêm học viên.',
                  });
                  setPendingOrganizationFocus(null);
                  return;
            }

            setSelectedUnitForMembers(targetUnits[0]);
            setSelectedResidentToAdd(String(pendingOrganizationFocus.residentId));
            setSelectedResidentToTransfer('');
            setSelectedTargetUnitToTransfer('');
            setTransferConfirm(null);
            setMessage({
                  type: 'info',
                  text: `Đã chọn ${resident.displayName || resident.fullName}. Vui lòng chọn đúng ${
                        targetUnitType === 'team' ? 'Tổ' : 'Ban'
                  } rồi bấm Thêm thành viên.`,
            });
            setPendingOrganizationFocus(null);
      }, [
            pendingOrganizationFocus,
            termsQuery.isLoading,
            rolesQuery.isLoading,
            unitsQuery.isLoading,
            membersQuery.isLoading,
            activeMembers,
            activeUnits,
            currentTermId,
      ]);

      const refetchOrganization = async () => {
            await Promise.all([
                  termsQuery.refetch(),
                  rolesQuery.refetch(),
                  unitsQuery.refetch(),
                  assignmentsQuery.refetch(),
                  membersQuery.refetch(),
            ]);
      };

      const openAssignmentCreate = (residentId?: number) => {
            setMessage(null);
            setAssignmentRoleLock(null);
            setAssignmentFormReturnTab('assignments');
            setAssignmentForm({
                  ...emptyAssignmentForm,
                  termId: currentTermId ? String(currentTermId) : '',
                  residentId: residentId ? String(residentId) : '',
            });
            setActiveTab('assignments');
      };

      const openAssignmentEdit = (assignment: OrganizationAssignment) => {
            setMessage(null);
            setAssignmentFormReturnTab(activeTab);
            setAssignmentRoleLock({
                  roleId: String(assignment.roleId),
                  unitId: assignment.unitId ? String(assignment.unitId) : undefined,
                  returnTab: activeTab,
            });
            setAssignmentForm({
                  id: assignment.id,
                  termId: String(assignment.termId),
                  roleId: String(assignment.roleId),
                  unitId: assignment.unitId ? String(assignment.unitId) : '',
                  residentId: String(assignment.residentId),
                  assignmentTitle: assignment.assignmentTitle || getAssignmentDisplayTitle(assignment),
                  startDate: toInputDateValue(assignment.startDate),
                  endDate: toInputDateValue(assignment.endDate),
                  status: assignment.status,
                  notes: assignment.notes || '',
            });
      };

      const closeAssignmentForm = () => {
            setAssignmentForm(null);
            setAssignmentRoleLock(null);
            setActiveTab(assignmentFormReturnTab);
            if (returnToMembersPath) returnToMembers();
      };

      const validateAssignment = () => {
            if (!assignmentForm) return 'Không có dữ liệu bổ nhiệm.';
            if (!assignmentForm.termId) return 'Vui lòng chọn nhiệm kỳ.';
            if (!assignmentForm.roleId) return 'Vui lòng chọn chức vụ.';
            if (!assignmentForm.residentId) return 'Vui lòng chọn học viên.';
            if (!assignmentForm.startDate) return 'Vui lòng chọn ngày bắt đầu.';

            if (roleRequiresUnit(selectedRole) && !assignmentForm.unitId) {
                  return 'Chức vụ này cần chọn Tổ/Ban phụ trách.';
            }

            if (selectedRole?.roleType === 'team_leader' && selectedUnit?.unitType !== 'team') {
                  return 'Tổ trưởng chỉ được chọn đơn vị loại Tổ.';
            }

            if (selectedRole?.roleType === 'committee_head' && selectedUnit?.unitType !== 'committee') {
                  return 'Trưởng ban chỉ được chọn đơn vị loại Ban.';
            }

            const activeSameRole = activeAssignments.filter(
                  (assignment) =>
                        assignment.termId === Number(assignmentForm.termId) &&
                        assignment.roleId === Number(assignmentForm.roleId) &&
                        assignment.status === 'active' &&
                        assignment.id !== assignmentForm.id
            );

            const isUnitScopedRole =
                  selectedRole?.roleType === 'team_leader' ||
                  selectedRole?.roleType === 'committee_head';

            const activeSameRoleForLimit = isUnitScopedRole
                  ? activeSameRole.filter(
                          (assignment) =>
                                Number(assignment.unitId || 0) === Number(assignmentForm.unitId || 0)
                    )
                  : activeSameRole;

            const selectedRoleMax = selectedRole?.maxAssignees ?? null;
            const roleAllowsMultiple = Boolean(selectedRole?.allowMultipleMembers);

            if (selectedRoleMax && activeSameRoleForLimit.length >= selectedRoleMax) {
                  if (selectedRole?.roleType === 'team_leader') {
                        return `Tổ này đã có Tổ trưởng. Mỗi Tổ chỉ được phân công tối đa ${selectedRoleMax} Tổ trưởng.`;
                  }

                  if (selectedRole?.roleType === 'committee_head') {
                        return `Ban này đã có Trưởng ban. Mỗi Ban chỉ được phân công tối đa ${selectedRoleMax} Trưởng ban.`;
                  }

                  return `Chức vụ này đã đủ số lượng tối đa (${selectedRoleMax}).`;
            }

            if (!selectedRoleMax && !roleAllowsMultiple && activeSameRoleForLimit.length >= 1) {
                  if (selectedRole?.roleType === 'team_leader') {
                        return 'Tổ này đã có Tổ trưởng.';
                  }

                  if (selectedRole?.roleType === 'committee_head') {
                        return 'Ban này đã có Trưởng ban.';
                  }

                  return 'Chức vụ này chỉ cho một người đảm nhiệm trong cùng nhiệm kỳ.';
            }

            const duplicated = activeAssignments.some(
                  (assignment) =>
                        assignment.termId === Number(assignmentForm.termId) &&
                        assignment.roleId === Number(assignmentForm.roleId) &&
                        assignment.residentId === Number(assignmentForm.residentId) &&
                        assignment.status === 'active' &&
                        assignment.id !== assignmentForm.id
            );

            if (duplicated) {
                  return 'Học viên này đang đảm nhiệm chức vụ đã chọn trong nhiệm kỳ này.';
            }

            if (assignmentForm.endDate) {
                  const startDate = new Date(assignmentForm.startDate);
                  const endDate = new Date(assignmentForm.endDate);

                  if (endDate <= startDate) return 'Ngày kết thúc phải lớn hơn ngày bắt đầu.';
            }

            return null;
      };

      const saveAssignment = async () => {
            const error = validateAssignment();

            if (error) {
                  setMessage({ type: 'error', text: error });
                  return;
            }

            if (!assignmentForm) return;

            const roomId = getCurrentRoomIdFromMember(selectedMember);

            const payload = {
                  termId: Number(assignmentForm.termId),
                  roleId: Number(assignmentForm.roleId),
                  unitId: assignmentForm.unitId ? Number(assignmentForm.unitId) : null,
                  assignmentTitle: assignmentForm.assignmentTitle.trim() || null,
                  residentId: Number(assignmentForm.residentId),
                  roomId: roomId ? Number(roomId) : null,
                  startDate: assignmentForm.startDate,
                  endDate: assignmentForm.endDate || null,
                  status: assignmentForm.status,
                  notes: assignmentForm.notes.trim() || null,
            };

            try {
                  if (assignmentForm.id) {
                        await updateAssignmentMutation.mutateAsync({
                              id: assignmentForm.id,
                              ...payload,
                        });
                        setMessage({ type: 'success', text: 'Đã cập nhật phân công.' });
                  } else {
                        await createAssignmentMutation.mutateAsync(payload);
                        setMessage({ type: 'success', text: 'Đã bổ nhiệm học viên.' });
                  }

                  setAssignmentForm(null);
                  setAssignmentRoleLock(null);
                  await refetchOrganization();
                  setActiveTab(assignmentFormReturnTab);

                  if (returnToMembersPath) {
                        returnToMembers();
                  }
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể lưu phân công.',
                  });
            }
      };

      const endAssignment = async (assignment: OrganizationAssignment) => {
            if (assignment.status === 'ended') return;

            try {
                  await endAssignmentMutation.mutateAsync({ id: assignment.id });
                  setMessage({ type: 'success', text: 'Đã kết thúc vai trò. Lịch sử phân công vẫn được giữ lại.' });
                  await refetchOrganization();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể kết thúc vai trò.',
                  });
            }
      };

      const openUnitCreate = () => {
            setMessage(null);
            setUnitForm({
                  ...emptyUnitForm,
                  sortOrder: String(Math.max(...units.map((unit) => Number(unit.sortOrder || 0)), 0) + 10),
            });
            setActiveTab('units');
      };

      const openUnitEdit = (unit: OrganizationUnit) => {
            setMessage(null);
            setUnitForm({
                  id: unit.id,
                  code: unit.code,
                  name: unit.name,
                  unitType: unit.unitType === 'committee' ? 'committee' : 'team',
                  description: unit.description || '',
                  isActive: Boolean(unit.isActive),
                  sortOrder: String(unit.sortOrder || 0),
            });
            setActiveTab('units');
      };

      const saveUnit = async () => {
            if (!unitForm) return;

            const code = normalizeCode(unitForm.code);
            const name = unitForm.name.trim();

            if (!code) {
                  setMessage({ type: 'error', text: 'Vui lòng nhập mã Tổ/Ban.' });
                  return;
            }

            if (!name) {
                  setMessage({ type: 'error', text: 'Vui lòng nhập tên Tổ/Ban.' });
                  return;
            }

            const sortOrder = Number(unitForm.sortOrder || 0);

            if (!Number.isFinite(sortOrder) || sortOrder < 0) {
                  setMessage({ type: 'error', text: 'Thứ tự hiển thị phải là số lớn hơn hoặc bằng 0.' });
                  return;
            }

            const duplicated = units.some(
                  (unit) =>
                        unit.id !== unitForm.id &&
                        normalizeText(unit.code) === normalizeText(code)
            );

            if (duplicated) {
                  setMessage({ type: 'error', text: 'Mã Tổ/Ban đã tồn tại.' });
                  return;
            }

            const payload = {
                  code,
                  name,
                  unitType: unitForm.unitType,
                  description: unitForm.description.trim() || null,
                  isActive: unitForm.isActive,
                  sortOrder,
            };

            try {
                  if (unitForm.id) {
                        await updateUnitMutation.mutateAsync({
                              id: unitForm.id,
                              ...payload,
                        });
                        setMessage({ type: 'success', text: 'Đã cập nhật Tổ/Ban.' });
                  } else {
                        await createUnitMutation.mutateAsync(payload);
                        setMessage({ type: 'success', text: 'Đã thêm Tổ/Ban.' });
                  }

                  setUnitForm(null);
                  await refetchOrganization();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể lưu Tổ/Ban.',
                  });
            }
      };

      const toggleUnit = async (unit: OrganizationUnit) => {
            try {
                  await toggleUnitActiveMutation.mutateAsync({
                        id: unit.id,
                        isActive: !unit.isActive,
                  });
                  setMessage({
                        type: 'success',
                        text: unit.isActive ? 'Đã ngừng sử dụng Tổ/Ban.' : 'Đã kích hoạt Tổ/Ban.',
                  });
                  await refetchOrganization();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể cập nhật trạng thái Tổ/Ban.',
                  });
            }
      };


      const openUnitMembers = (unit: OrganizationUnit) => {
            setMessage(null);
            setSelectedUnitForMembers(unit);
            setSelectedResidentToAdd("");
            setSelectedResidentToTransfer("");
            setSelectedTargetUnitToTransfer("");
            setTransferConfirm(null);
      };

      const closeUnitMembers = () => {
            setSelectedUnitForMembers(null);
            setSelectedResidentToAdd("");
            setSelectedResidentToTransfer("");
            setSelectedTargetUnitToTransfer("");
            setTransferConfirm(null);

            if (returnToMembersPath) {
                  returnToMembers();
            }
      };

      const addSelectedUnitMember = async () => {
            if (!selectedUnitForMembers) return;

            const residentId = Number(selectedResidentToAdd);

            if (!residentId) {
                  setMessage({ type: 'error', text: 'Vui lòng chọn học viên cần thêm.' });
                  return;
            }

            try {
                  await addUnitMemberMutation.mutateAsync({
                        unitId: selectedUnitForMembers.id,
                        residentId,
                        memberRole: 'member',
                        startDate: today,
                  });

                  setMessage({ type: 'success', text: 'Đã thêm thành viên.' });
                  setSelectedResidentToAdd("");

                  await Promise.all([
                        utils.organization.listUnitMembers.invalidate({
                              unitId: selectedUnitForMembers.id,
                              status: 'active',
                        }),
                        utils.organization.getAvailableResidentsForUnit.invalidate({
                              unitId: selectedUnitForMembers.id,
                        }),
                        utils.organization.listUnits.invalidate(),
                  ]);

                  if (returnToMembersPath) {
                        returnToMembers();
                  }
            } catch (err: any) {
                  const errorMessage = err?.message || 'Không thể thêm thành viên.';

                  if (
                        selectedUnitForMembers?.unitType === 'team' &&
                        errorMessage.toLowerCase().includes('chuyển tổ')
                  ) {
                        setSelectedResidentToTransfer(String(residentId));
                  }

                  setMessage({
                        type: 'error',
                        text: errorMessage,
                  });
            }
      };

      const requestTransferSelectedResident = () => {
            if (!selectedUnitForMembers || selectedUnitForMembers.unitType !== 'team') {
                  setMessage({ type: 'error', text: 'Chỉ có thể đổi học viên giữa các Tổ.' });
                  return;
            }

            const residentId = Number(selectedResidentToTransfer);
            const toUnitId = Number(selectedTargetUnitToTransfer);

            if (!residentId) {
                  setMessage({ type: 'error', text: 'Vui lòng chọn học viên cần đổi tổ.' });
                  return;
            }

            if (!toUnitId) {
                  setMessage({ type: 'error', text: 'Vui lòng chọn Tổ đến.' });
                  return;
            }

            if (toUnitId === Number(selectedUnitForMembers.id)) {
                  setMessage({ type: 'error', text: 'Tổ đến phải khác Tổ hiện tại.' });
                  return;
            }

            const resident = activeMembers.find(
                  (item: any) => Number(item.id) === residentId
            ) as any;
            const targetUnit = activeUnits.find((unit) => Number(unit.id) === toUnitId);

            const residentName = `${resident?.holyName ? `${resident.holyName} ` : ''}${resident?.fullName || resident?.displayName || 'Học viên được chọn'}`.trim();

            setTransferConfirm({
                  residentId,
                  residentName,
                  targetUnitName: targetUnit?.name || 'Tổ đã chọn',
            });
      };

      const confirmTransferSelectedResident = async () => {
            if (!selectedUnitForMembers || !transferConfirm) return;

            const toUnitId = Number(selectedTargetUnitToTransfer);

            if (!toUnitId) {
                  setMessage({ type: 'error', text: 'Vui lòng chọn Tổ đến.' });
                  return;
            }

            try {
                  await transferTeamMemberMutation.mutateAsync({
                        residentId: transferConfirm.residentId,
                        fromUnitId: selectedUnitForMembers.id,
                        toUnitId,
                        startDate: today,
                        notes: `Đổi từ ${selectedUnitForMembers.name} sang ${transferConfirm.targetUnitName}`,
                  });

                  setMessage({ type: 'success', text: `Đã đổi ${transferConfirm.residentName} sang ${transferConfirm.targetUnitName}.` });
                  setSelectedResidentToTransfer('');
                  setSelectedTargetUnitToTransfer('');
                  setTransferConfirm(null);

                  await Promise.all([
                        utils.organization.listUnitMembers.invalidate({
                              unitId: selectedUnitForMembers.id,
                              status: 'active',
                        }),
                        utils.organization.getAvailableResidentsForUnit.invalidate({
                              unitId: selectedUnitForMembers.id,
                        }),
                        utils.organization.listUnits.invalidate(),
                  ]);

                  if (returnToMembersPath) {
                        returnToMembers();
                  }
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể đổi tổ cho học viên.',
                  });
            }
      };

      const cancelTransferSelectedResident = () => {
            setTransferConfirm(null);
      };

      const removeSelectedUnitMember = async (member: OrganizationUnitMember) => {
            try {
                  await removeUnitMemberMutation.mutateAsync({
                        memberId: member.id,
                        endDate: today,
                  });

                  setMessage({ type: 'success', text: 'Đã gỡ thành viên.' });

                  if (selectedUnitForMembers?.id) {
                        await Promise.all([
                              utils.organization.listUnitMembers.invalidate({
                                    unitId: selectedUnitForMembers.id,
                                    status: 'active',
                              }),
                              utils.organization.getAvailableResidentsForUnit.invalidate({
                                    unitId: selectedUnitForMembers.id,
                              }),
                              utils.organization.listUnits.invalidate(),
                        ]);
                  }
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể gỡ thành viên.',
                  });
            }
      };

      const syncUnitLeadersToMembers = async () => {
            try {
                  const result = await syncUnitLeadersMutation.mutateAsync();

                  setMessage({
                        type: 'success',
                        text:
                              result?.message ||
                              `Đã đồng bộ ${result?.created || 0} người phụ trách vào danh sách thành viên.`,
                  });

                  await Promise.all([
                        utils.organization.listUnits.invalidate(),
                        selectedUnitForMembers?.id
                              ? utils.organization.listUnitMembers.invalidate({
                                      unitId: selectedUnitForMembers.id,
                                      status: 'active',
                                })
                              : Promise.resolve(),
                        selectedUnitForMembers?.id
                              ? utils.organization.getAvailableResidentsForUnit.invalidate({
                                      unitId: selectedUnitForMembers.id,
                                })
                              : Promise.resolve(),
                  ]);
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text:
                              err?.message ||
                              'Không thể đồng bộ người phụ trách vào danh sách thành viên.',
                  });
            }
      };

      const openTermCreate = () => {
            setMessage(null);
            setTermForm(emptyTermForm);
            setActiveTab('terms');
      };

      const openTermEdit = (term: OrganizationTerm) => {
            setMessage(null);
            setTermForm({
                  id: term.id,
                  code: term.code,
                  name: term.name,
                  startDate: toInputDateValue(term.startDate),
                  endDate: toInputDateValue(term.endDate),
                  status: term.status,
                  description: term.description || '',
                  copyFromTermId: '',
                  copyAssignments: false,
            });
            setActiveTab('terms');
      };

      const selectedCopyTermAssignments = useMemo(() => {
            if (!termForm?.copyAssignments || !termForm.copyFromTermId || termForm.id) return [];

            return assignments.filter(
                  (assignment) =>
                        Number(assignment.termId) === Number(termForm.copyFromTermId) &&
                        assignment.status === 'active'
            );
      }, [assignments, termForm?.copyAssignments, termForm?.copyFromTermId, termForm?.id]);

      const saveTerm = async () => {
            if (!termForm) return;

            const code = normalizeCode(termForm.code);
            const name = termForm.name.trim();

            if (!code) {
                  setMessage({ type: 'error', text: 'Vui lòng nhập mã nhiệm kỳ.' });
                  return;
            }

            if (!name) {
                  setMessage({ type: 'error', text: 'Vui lòng nhập tên nhiệm kỳ.' });
                  return;
            }

            if (!termForm.startDate || !termForm.endDate) {
                  setMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc.' });
                  return;
            }

            if (new Date(termForm.endDate) <= new Date(termForm.startDate)) {
                  setMessage({ type: 'error', text: 'Ngày kết thúc phải lớn hơn ngày bắt đầu.' });
                  return;
            }

            const duplicated = terms.some(
                  (term) =>
                        term.id !== termForm.id &&
                        normalizeText(term.code) === normalizeText(code)
            );

            if (duplicated) {
                  setMessage({ type: 'error', text: 'Mã nhiệm kỳ đã tồn tại.' });
                  return;
            }

            if (termForm.copyAssignments && !termForm.copyFromTermId) {
                  setMessage({ type: 'error', text: 'Vui lòng chọn nhiệm kỳ nguồn để copy cơ cấu.' });
                  return;
            }

            const payload = {
                  code,
                  name,
                  startDate: termForm.startDate,
                  endDate: termForm.endDate,
                  status: termForm.status,
                  description: termForm.description.trim() || null,
            };

            try {
                  if (termForm.id) {
                        await updateTermMutation.mutateAsync({
                              id: termForm.id,
                              ...payload,
                        });
                        setMessage({ type: 'success', text: 'Đã cập nhật nhiệm kỳ.' });
                  } else {
                        const createdTerm = await createTermMutation.mutateAsync(payload);
                        const newTermId = Number(
                              (createdTerm as any)?.id ||
                                    (createdTerm as any)?.term?.id ||
                                    (createdTerm as any)?.data?.id ||
                                    0
                        );

                        let copiedCount = 0;

                        if (termForm.copyAssignments && selectedCopyTermAssignments.length > 0) {
                              if (!newTermId) {
                                    setMessage({
                                          type: 'info',
                                          text: 'Đã thêm nhiệm kỳ. Chưa thể copy cơ cấu vì API chưa trả về ID nhiệm kỳ mới.',
                                    });
                              } else {
                                    for (const assignment of selectedCopyTermAssignments) {
                                          await createAssignmentMutation.mutateAsync({
                                                termId: newTermId,
                                                roleId: Number(assignment.roleId),
                                                unitId: assignment.unitId ? Number(assignment.unitId) : null,
                                                assignmentTitle: getAssignmentDisplayTitle(assignment),
                                                residentId: Number(assignment.residentId),
                                                roomId: assignment.roomId ? Number(assignment.roomId) : null,
                                                startDate: termForm.startDate,
                                                endDate: null,
                                                status: 'active',
                                                notes: assignment.notes || null,
                                          });
                                          copiedCount += 1;
                                    }

                                    setMessage({
                                          type: 'success',
                                          text: `Đã thêm nhiệm kỳ và copy ${copiedCount} phân công từ nhiệm kỳ trước.`,
                                    });
                              }
                        } else {
                              setMessage({ type: 'success', text: 'Đã thêm nhiệm kỳ.' });
                        }
                  }

                  setTermForm(null);
                  await refetchOrganization();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể lưu nhiệm kỳ.',
                  });
            }
      };

      const setActiveTerm = async (term: OrganizationTerm) => {
            try {
                  await setActiveTermMutation.mutateAsync({ id: term.id });
                  setSelectedTermId('active');
                  setMessage({ type: 'success', text: 'Đã đặt nhiệm kỳ hiện tại.' });
                  await refetchOrganization();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể đặt nhiệm kỳ hiện tại.',
                  });
            }
      };

      const filteredAssignments = useMemo(() => {
            const keyword = normalizeText(searchTerm);

            return assignments
                  .filter((assignment) => {
                        if (
                              handoverResidentId &&
                              Number(assignment.residentId) !== Number(handoverResidentId)
                        ) {
                              return false;
                        }

                        if (!keyword) return true;

                        return [
                              assignment.residentName,
                              assignment.roleName,
                              assignment.assignmentTitle,
                              assignment.unitName,
                              assignment.roomCode,
                        ]
                              .filter(Boolean)
                              .some((value) => normalizeText(String(value)).includes(keyword));
                  })
                  .sort((a, b) => {
                        const levelCompare = getRoleLevel(a) - getRoleLevel(b);
                        if (levelCompare !== 0) return levelCompare;
                        return getAssignmentDisplayTitle(a).localeCompare(getAssignmentDisplayTitle(b));
                  });
      }, [assignments, searchTerm, handoverResidentId]);

      const activeHandoverAssignments = useMemo(() => {
            if (!handoverResidentId) return [];

            return assignments.filter(
                  (assignment) =>
                        Number(assignment.residentId) === Number(handoverResidentId) &&
                        assignment.status === 'active'
            );
      }, [assignments, handoverResidentId]);

      const assignmentsByLevel = useMemo(() => {
            const groups: Record<number, OrganizationAssignment[]> = {
                  1: [],
                  2: [],
                  3: [],
            };

            activeAssignments.forEach((assignment) => {
                  const level = getRoleLevel(assignment);
                  groups[level].push(assignment);
            });

            return groups;
      }, [activeAssignments]);

      const completeHandoverAndLeave = async () => {
            if (!handoverResidentId) return;

            if (activeHandoverAssignments.length > 0) {
                  setMessage({
                        type: 'error',
                        text: 'Học viên vẫn còn chức vụ đang đảm nhiệm. Vui lòng kết thúc hoặc bàn giao tất cả chức vụ trước khi hoàn tất rời lưu xá.',
                  });
                  return;
            }

            try {
                  await markAsLeftMutation.mutateAsync({
                        id: handoverResidentId,
                        departureDate: new Date(),
                        forceAfterHandover: true,
                  } as any);

                  setMessage({
                        type: 'success',
                        text: 'Đã hoàn tất rời lưu xá và khóa tài khoản liên kết sau khi bàn giao chức vụ.',
                  });

                  await refetchOrganization();

                  window.location.href = '/members';
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text:
                              err?.message ||
                              'Không thể hoàn tất rời lưu xá sau khi bàn giao chức vụ.',
                  });
            }
      };

      const tabs: Array<{ key: SimpleTab; label: string; icon: React.ReactNode }> = [
            { key: 'structure', label: 'Cơ cấu hiện tại', icon: <LayoutGrid className="h-4 w-4" /> },
            { key: 'assignments', label: 'Lịch sử bổ nhiệm', icon: <UserPlus className="h-4 w-4" /> },
            { key: 'units', label: 'Tổ / Ban', icon: <Building2 className="h-4 w-4" /> },
            { key: 'terms', label: 'Nhiệm kỳ', icon: <CalendarDays className="h-4 w-4" /> },
      ];

      const isLoading =
            termsQuery.isLoading ||
            rolesQuery.isLoading ||
            unitsQuery.isLoading ||
            assignmentsQuery.isLoading ||
            membersQuery.isLoading;

      return (
            <ResidenceCareLayout>
                  <div className={residenceMediumStyle.page}>
                        <div className={residenceMediumStyle.pageShell}>
                        <div className={residenceMediumStyle.topArea}>
                              <div className={residenceMediumStyle.actionBar}>
                                    {returnToMembersPath && (
                                          <button
                                                type="button"
                                                onClick={returnToMembers}
                                                className={residenceMediumStyle.secondaryButton}
                                          >
                                                {returnToMembersLabel}
                                          </button>
                                    )}

                                    <button
                                          type="button"
                                          disabled
                                          title="Bộ chức vụ mặc định hiện đã đủ dùng. Khi cần mở rộng sẽ bật cấu hình sau."
                                          className={residenceMediumStyle.disabledActionButton}
                                    >
                                          <Settings className="h-4 w-4" />
                                          Cấu hình chức vụ
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => openAssignmentCreate()}
                                          className={`${residenceMediumStyle.warmPrimaryButton} inline-flex items-center gap-2`}
                                    >
                                          <Plus className="h-4 w-4" />
                                          Bổ nhiệm
                                    </button>
                              </div>

                              <div className={`${residenceMediumStyle.topInner} text-center`}>
                                    <p className={residenceMediumStyle.modalEyebrow}>Tổ chức lưu xá</p>
                                    <h1 className={residenceMediumStyle.topTitle}>
                                          Cơ cấu tổ chức lưu xá
                                    </h1>
                                    <p className={`${residenceMediumStyle.topSubtitle} mx-auto`}>
                                          Một màn hình để nhìn tổng thể cơ cấu, nhiệm kỳ, Tổ/Ban và các chức vụ đang phụ trách.
                                    </p>
                              </div>

                              <div className="grid gap-3 md:grid-cols-3">
                                    <StatCard
                                          label="Nhiệm kỳ hiện tại"
                                          value={activeTerm?.name || 'Chưa có'}
                                          helper={activeTerm ? `${formatDate(activeTerm.startDate)} - ${formatDate(activeTerm.endDate)}` : 'Tạo hoặc đặt nhiệm kỳ hiện tại'}
                                          icon={<CalendarDays className="h-5 w-5" />}
                                    />
                                    <StatCard
                                          label="Vai trò đang hiệu lực"
                                          value={activeAssignments.length}
                                          helper="Tổng số phân công đang phụ trách"
                                          icon={<ShieldCheck className="h-5 w-5" />}
                                    />
                                    <StatCard
                                          label="Tổ / Ban hoạt động"
                                          value={`${activeUnits.filter((unit) => unit.unitType === 'team').length} / ${activeUnits.filter((unit) => unit.unitType === 'committee').length}`}
                                          helper={`${activeUnits.length} đơn vị đang hoạt động`}
                                          icon={<UsersRound className="h-5 w-5" />}
                                    />
                              </div>
                        </div>

                        {message && (
                              <div
                                    className={[
                                          'rounded-2xl border px-4 py-3 text-sm font-medium',
                                          message.type === 'success'
                                                ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                                                : message.type === 'error'
                                                      ? 'border-red-100 bg-red-50 text-red-700'
                                                      : 'border-amber-100 bg-amber-50 text-amber-800',
                                    ].join(' ')}
                              >
                                    {message.text}
                              </div>
                        )}

                        <div className="rounded-[28px] border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_72%,#fff6ee_100%)] p-3 shadow-[0_14px_34px_rgba(120,53,15,0.055)]">
                              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                    <div className="flex flex-wrap gap-2">
                                          {tabs.map((tab) => (
                                                <button
                                                      key={tab.key}
                                                      type="button"
                                                      onClick={() => setActiveTab(tab.key)}
                                                      className={[
                                                            residenceMediumStyle.chipBase,
                                                            activeTab === tab.key
                                                                  ? residenceMediumStyle.chipActive
                                                                  : residenceMediumStyle.chipIdle,
                                                      ].join(' ')}
                                                >
                                                      {tab.icon}
                                                      {tab.label}
                                                </button>
                                          ))}
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                          <select
                                                value={selectedTermId}
                                                onChange={(event) => setSelectedTermId(event.target.value)}
                                                className="h-10 rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow-[0_8px_18px_rgba(120,53,15,0.055)] outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-100"
                                          >
                                                <option value="active">Nhiệm kỳ hiện tại</option>
                                                <option value="all">Tất cả nhiệm kỳ</option>
                                                {terms.map((term) => (
                                                      <option key={term.id} value={term.id}>
                                                            {term.name}
                                                      </option>
                                                ))}
                                          </select>

                                          <div className="relative">
                                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                                <Input
                                                      value={searchTerm}
                                                      onChange={(event) => setSearchTerm(event.target.value)}
                                                      placeholder="Tìm học viên, chức vụ, Tổ/Ban..."
                                                      className="h-10 min-w-[260px] rounded-xl border-amber-100 bg-white/90 pl-9 text-sm shadow-[0_8px_18px_rgba(120,53,15,0.055)]"
                                                />
                                          </div>
                                    </div>
                              </div>
                        </div>

                        {isLoading && (
                              <div className="rounded-3xl border border-amber-100 bg-white/85 p-8 text-center text-sm text-slate-500">
                                    Đang tải dữ liệu tổ chức...
                              </div>
                        )}

                        {!isLoading && activeTab === 'structure' && (
                              <div className="space-y-4">
                                    {!currentTerm && (
                                          <SectionEmpty
                                                title="Chưa có nhiệm kỳ hiện tại"
                                                description="Tạo hoặc chọn một nhiệm kỳ để bắt đầu thiết lập cơ cấu tổ chức."
                                          />
                                    )}

                                    {currentTerm && (
                                          <PremiumOrganizationChart
                                                assignments={activeAssignments}
                                                roles={roles}
                                                units={activeUnits}
                                                onEditAssignment={openAssignmentEdit}
                                                onEndAssignment={endAssignment}
                                                onCreateAssignment={openAssignmentCreateFromStructure}
                                                onOpenUnitMembers={openUnitMembersFromStructure}
                                                onOpenTeamTransfer={openTeamTransferFromStructure}
                                                showActions
                                          />
                                    )}

                                    {missingRoles.length > 0 && (
                                          <div className="rounded-3xl border border-amber-100 bg-amber-50/70 p-5">
                                                <h3 className="font-bold text-amber-900">Vị trí cần bổ sung</h3>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                      {missingRoles.map((item) => (
                                                            <Badge key={item.role.id} className="border-amber-200 bg-white text-amber-800">
                                                                  {item.role.name}: thiếu {item.missing}
                                                            </Badge>
                                                      ))}
                                                </div>
                                          </div>
                                    )}
                              </div>
                        )}

                        {!isLoading && activeTab === 'assignments' && (
                              <div className="space-y-4">
                                    {handoverResidentId && (
                                          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                      <div>
                                                            <p className="text-sm font-bold text-amber-800">
                                                                  Đang bàn giao chức vụ trước khi rời lưu xá
                                                            </p>
                                                            <p className="mt-1 text-sm text-amber-700">
                                                                  Danh sách bên dưới chỉ hiển thị các phân công của học viên cần bàn giao.
                                                                  Hãy kết thúc hoặc cập nhật tất cả chức vụ đang đảm nhiệm trước khi hoàn tất rời lưu xá.
                                                            </p>
                                                            <p className="mt-2 text-xs font-semibold text-amber-700">
                                                                  Còn {activeHandoverAssignments.length} chức vụ đang đảm nhiệm.
                                                            </p>
                                                      </div>

                                                      <div className="flex flex-wrap gap-2">
                                                            <button
                                                                  type="button"
                                                                  onClick={() => {
                                                                        setHandoverResidentId(null);
                                                                        window.history.replaceState(null, '', '/organization');
                                                                        setMessage(null);
                                                                  }}
                                                                  className="rounded-2xl border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                                                            >
                                                                  Hủy bàn giao
                                                            </button>
                                                            <button
                                                                  type="button"
                                                                  onClick={completeHandoverAndLeave}
                                                                  disabled={markAsLeftMutation.isPending}
                                                                  className="rounded-2xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                  {markAsLeftMutation.isPending
                                                                        ? 'Đang hoàn tất...'
                                                                        : 'Hoàn tất rời lưu xá'}
                                                            </button>
                                                      </div>
                                                </div>
                                          </div>
                                    )}

                                    <AppointmentHistoryPanel
                                          assignments={filteredAssignments}
                                          terms={terms}
                                          roles={roles}
                                    />
                              </div>
                        )}

                        {!isLoading && activeTab === 'units' && (
                              <div className={residenceMediumStyle.premiumSection}>
                                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                          <div>
                                                <h2 className="text-lg font-bold text-slate-950">Tổ / Ban</h2>
                                                <p className="mt-1 text-sm text-slate-500">
                                                      Quản lý các tổ và ban đang sử dụng trong lưu xá.
                                                </p>
                                          </div>
                                          <div className="flex flex-wrap gap-2">
                                                <button
                                                      type="button"
                                                      onClick={syncUnitLeadersToMembers}
                                                      disabled={syncUnitLeadersMutation.isPending}
                                                      className={`${residenceMediumStyle.secondaryButton} inline-flex items-center gap-2 disabled:opacity-60`}
                                                >
                                                      <UsersRound className="h-4 w-4" />
                                                      {syncUnitLeadersMutation.isPending
                                                            ? 'Đang đồng bộ...'
                                                            : 'Đồng bộ phụ trách'}
                                                </button>

                                                <button
                                                      type="button"
                                                      onClick={openUnitCreate}
                                                      className={`${residenceMediumStyle.primaryButton} inline-flex items-center gap-2`}
                                                >
                                                      <Plus className="h-4 w-4" />
                                                      Thêm Tổ/Ban
                                                </button>
                                          </div>
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                          {units.map((unit) => (
                                                <div key={unit.id} className="rounded-3xl border border-amber-100 bg-white/85 p-4 shadow-sm shadow-amber-900/5">
                                                      <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                  <p className="font-bold text-slate-950">{unit.name}</p>
                                                                  <p className="mt-1 text-xs text-slate-500">{unit.code}</p>
                                                                  <p className="mt-2 text-xs font-semibold text-slate-600">
                                                                        Thành viên: {(unit as any).memberCount ?? (unit as any).membersCount ?? (unit as any).activeMemberCount ?? 0}
                                                                  </p>
                                                            </div>
                                                            <Badge className={getUnitTypeClass(unit.unitType)}>
                                                                  {getUnitTypeLabel(unit.unitType)}
                                                            </Badge>
                                                      </div>

                                                      {unit.description && (
                                                            <p className="mt-3 text-sm leading-6 text-slate-600">{unit.description}</p>
                                                      )}

                                                      <div className="mt-4 flex flex-wrap gap-2">
                                                            <button
                                                                  type="button"
                                                                  onClick={() => openUnitMembers(unit)}
                                                                  className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                                                            >
                                                                  Thành viên
                                                            </button>
                                                            <button
                                                                  type="button"
                                                                  onClick={() => openUnitEdit(unit)}
                                                                  className="rounded-xl border border-amber-100 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50"
                                                            >
                                                                  Sửa
                                                            </button>
                                                            <button
                                                                  type="button"
                                                                  onClick={() => toggleUnit(unit)}
                                                                  className={[
                                                                        'rounded-xl border px-3 py-2 text-xs font-semibold',
                                                                        unit.isActive
                                                                              ? 'border-orange-100 bg-orange-50 text-orange-700 hover:bg-orange-100'
                                                                              : 'border-green-100 bg-green-50 text-green-700 hover:bg-green-100',
                                                                  ].join(' ')}
                                                            >
                                                                  {unit.isActive ? 'Ngừng dùng' : 'Kích hoạt'}
                                                            </button>
                                                      </div>
                                                </div>
                                          ))}
                                    </div>
                              </div>
                        )}

                        {!isLoading && activeTab === 'terms' && (
                              <div className={residenceMediumStyle.premiumSection}>
                                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                          <div>
                                                <h2 className="text-lg font-bold text-slate-950">Nhiệm kỳ</h2>
                                                <p className="mt-1 text-sm text-slate-500">
                                                      Tạo, cập nhật và chọn nhiệm kỳ hiện tại.
                                                </p>
                                          </div>
                                          <button
                                                type="button"
                                                onClick={openTermCreate}
                                                className={`${residenceMediumStyle.primaryButton} inline-flex items-center gap-2`}
                                          >
                                                <Plus className="h-4 w-4" />
                                                Thêm nhiệm kỳ
                                          </button>
                                    </div>

                                    <div className="space-y-3">
                                          {terms.map((term) => (
                                                <div
                                                      key={term.id}
                                                                                                            className={cx(residenceMediumStyle.orgUnitCard, 'flex flex-col gap-3 md:flex-row md:items-center md:justify-between')}
                                                >
                                                      <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                  <p className="font-bold text-slate-950">{term.name}</p>
                                                                  <Badge className={getTermStatusClass(term.status)}>
                                                                        {getTermStatusLabel(term.status)}
                                                                  </Badge>
                                                            </div>
                                                            <p className="mt-1 text-sm text-slate-500">
                                                                  {term.code} · {formatDate(term.startDate)} - {formatDate(term.endDate)}
                                                            </p>
                                                      </div>

                                                      <div className="flex flex-wrap gap-2">
                                                            <button
                                                                  type="button"
                                                                  onClick={() => openTermEdit(term)}
                                                                  className="rounded-xl border border-amber-100 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50"
                                                            >
                                                                  Sửa
                                                            </button>
                                                            {term.status !== 'active' && (
                                                                  <button
                                                                        type="button"
                                                                        onClick={() => setActiveTerm(term)}
                                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100"
                                                                  >
                                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                                        Đặt hiện tại
                                                                  </button>
                                                            )}
                                                      </div>
                                                </div>
                                          ))}
                                    </div>
                              </div>
                        )}

                        {assignmentForm && (
                              <div className={residenceMediumStyle.modalOverlay}>
                                    <div className={`${residenceMediumStyle.modalShell} max-w-3xl`}>
                                          <div className={residenceMediumStyle.modalHeader}>
                                                <div>
                                                      <p className={residenceMediumStyle.modalEyebrow}>Phân công</p>
                                                      <h2 className={residenceMediumStyle.modalTitle}>
                                                            {assignmentForm.id ? 'Cập nhật phân công' : 'Bổ nhiệm / Phân công'}
                                                      </h2>
                                                      <p className={residenceMediumStyle.modalSubtitle}>
                                                            Chọn học viên, chức vụ và nhiệm kỳ phù hợp.
                                                      </p>
                                                </div>
                                                <button
                                                      type="button"
                                                      onClick={closeAssignmentForm}
                                                      className="rounded-xl p-2 text-slate-500 transition hover:bg-white/70 hover:text-slate-700"
                                                >
                                                      <X className="h-4 w-4" />
                                                </button>
                                          </div>

                                          <div className="grid gap-3 overflow-y-auto px-5 py-4 md:grid-cols-2">
                                                <label className="space-y-1.5">
                                                      <Label>Nhiệm kỳ</Label>
                                                      <select
                                                            value={assignmentForm.termId}
                                                            onChange={(event) =>
                                                                  setAssignmentForm((current) =>
                                                                        current ? { ...current, termId: event.target.value } : current
                                                                  )
                                                            }
                                                            className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm text-slate-800 shadow-[0_8px_18px_rgba(120,53,15,0.055)] outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-100"
                                                      >
                                                            <option value="">Chọn nhiệm kỳ</option>
                                                            {terms.map((term) => (
                                                                  <option key={term.id} value={term.id}>
                                                                        {term.name}
                                                                  </option>
                                                            ))}
                                                      </select>
                                                </label>

                                                <label className="space-y-1.5">
                                                      <Label>Chức vụ</Label>
                                                      <select
                                                            value={assignmentForm.roleId}
                                                            disabled={Boolean(assignmentRoleLock?.roleId)}
                                                            onChange={(event) => {
                                                                  const role = roles.find((item) => String(item.id) === event.target.value) || null;
                                                                  const nextUnitId = roleRequiresUnit(role) ? assignmentForm.unitId : '';
                                                                  const unit = nextUnitId
                                                                        ? units.find((item) => String(item.id) === nextUnitId) || null
                                                                        : null;

                                                                  setAssignmentForm((current) =>
                                                                        current
                                                                              ? {
                                                                                      ...current,
                                                                                      roleId: event.target.value,
                                                                                      unitId: nextUnitId,
                                                                                      assignmentTitle: buildAssignmentTitle(role, unit),
                                                                                }
                                                                              : current
                                                                  );
                                                            }}
                                                            className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm text-slate-800 shadow-[0_8px_18px_rgba(120,53,15,0.055)] outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-100"
                                                      >
                                                            <option value="">Chọn chức vụ</option>
                                                            {assignmentRoleOptions.map((role) => (
                                                                  <option key={role.id} value={role.id}>
                                                                        {role.name}
                                                                  </option>
                                                            ))}
                                                      </select>
                                                </label>

                                                {roleRequiresUnit(selectedRole) && (
                                                      <label className="space-y-1.5">
                                                            <Label>Tổ/Ban</Label>
                                                            <select
                                                                  value={assignmentForm.unitId}
                                                                  disabled={Boolean(assignmentRoleLock?.unitId)}
                                                                  onChange={(event) => {
                                                                        const unit = units.find((item) => String(item.id) === event.target.value) || null;
                                                                        setAssignmentForm((current) =>
                                                                              current
                                                                                    ? {
                                                                                            ...current,
                                                                                            unitId: event.target.value,
                                                                                            assignmentTitle: buildAssignmentTitle(selectedRole, unit),
                                                                                      }
                                                                                    : current
                                                                        );
                                                                  }}
                                                                  className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm text-slate-800 shadow-[0_8px_18px_rgba(120,53,15,0.055)] outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-100"
                                                            >
                                                                  <option value="">Chọn Tổ/Ban</option>
                                                                  {activeUnits.map((unit) => (
                                                                        <option key={unit.id} value={unit.id}>
                                                                              {getUnitTypeLabel(unit.unitType)} - {unit.name}
                                                                        </option>
                                                                  ))}
                                                            </select>
                                                      </label>
                                                )}

                                                <label className="space-y-1.5">
                                                      <Label>Học viên</Label>
                                                      <select
                                                            value={assignmentForm.residentId}
                                                            onChange={(event) =>
                                                                  setAssignmentForm((current) =>
                                                                        current ? { ...current, residentId: event.target.value } : current
                                                                  )
                                                            }
                                                            className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm text-slate-800 shadow-[0_8px_18px_rgba(120,53,15,0.055)] outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-100"
                                                      >
                                                            <option value="">Chọn học viên</option>
                                                            {activeMembers.map((member: any) => (
                                                                  <option key={member.id} value={member.id}>
                                                                        {getResidentDisplayName(member)} · {getRoomLabelFromMember(member)}
                                                                  </option>
                                                            ))}
                                                      </select>
                                                </label>

                                                <label className="space-y-1.5 md:col-span-2">
                                                      <Label>Chức danh hiển thị</Label>
                                                      <Input
                                                            value={assignmentForm.assignmentTitle}
                                                            onChange={(event) =>
                                                                  setAssignmentForm((current) =>
                                                                        current ? { ...current, assignmentTitle: event.target.value } : current
                                                                  )
                                                            }
                                                            placeholder="Ví dụ: Tổ trưởng Tổ 1"
                                                            className={residenceMediumStyle.formInput}
                                                      />
                                                </label>

                                                <label className="space-y-1.5">
                                                      <Label>Ngày bắt đầu</Label>
                                                      <Input
                                                            type="date"
                                                            value={assignmentForm.startDate}
                                                            onChange={(event) =>
                                                                  setAssignmentForm((current) =>
                                                                        current ? { ...current, startDate: event.target.value } : current
                                                                  )
                                                            }
                                                            className={residenceMediumStyle.formInput}
                                                      />
                                                </label>

                                                <label className="space-y-1.5">
                                                      <Label>Ngày kết thúc</Label>
                                                      <Input
                                                            type="date"
                                                            value={assignmentForm.endDate}
                                                            onChange={(event) =>
                                                                  setAssignmentForm((current) =>
                                                                        current ? { ...current, endDate: event.target.value } : current
                                                                  )
                                                            }
                                                            className={residenceMediumStyle.formInput}
                                                      />
                                                </label>

                                                {!termForm.id && (
                                                      <div className="md:col-span-2 rounded-2xl border border-amber-100 bg-white/70 p-4">
                                                            <label className="flex items-start gap-3">
                                                                  <input
                                                                        type="checkbox"
                                                                        checked={termForm.copyAssignments}
                                                                        onChange={(event) =>
                                                                              setTermForm((current) =>
                                                                                    current
                                                                                          ? {
                                                                                                  ...current,
                                                                                                  copyAssignments: event.target.checked,
                                                                                                  copyFromTermId: event.target.checked ? current.copyFromTermId : '',
                                                                                            }
                                                                                          : current
                                                                              )
                                                                        }
                                                                        className="mt-1"
                                                                  />
                                                                  <span>
                                                                        <span className="block text-sm font-bold text-slate-900">
                                                                              Copy cơ cấu từ nhiệm kỳ trước
                                                                        </span>
                                                                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                                                                              Hệ thống sẽ copy các phân công đang hiệu lực của nhiệm kỳ nguồn sang nhiệm kỳ mới, giữ cùng chức vụ, Tổ/Ban và học viên.
                                                                        </span>
                                                                  </span>
                                                            </label>

                                                            {termForm.copyAssignments && (
                                                                  <div className="mt-3">
                                                                        <Label>Nhiệm kỳ nguồn</Label>
                                                                        <select
                                                                              value={termForm.copyFromTermId}
                                                                              onChange={(event) =>
                                                                                    setTermForm((current) =>
                                                                                          current
                                                                                                ? { ...current, copyFromTermId: event.target.value }
                                                                                                : current
                                                                                    )
                                                                              }
                                                                              className="mt-1 h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm text-slate-800 shadow-[0_8px_18px_rgba(120,53,15,0.055)] outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-100"
                                                                        >
                                                                              <option value="">Chọn nhiệm kỳ cần copy</option>
                                                                              {terms.map((term) => (
                                                                                    <option key={term.id} value={term.id}>
                                                                                          {term.name} · {formatDate(term.startDate)} - {formatDate(term.endDate)}
                                                                                    </option>
                                                                              ))}
                                                                        </select>
                                                                        <p className="mt-2 text-xs font-semibold text-amber-800">
                                                                              Sẽ copy {selectedCopyTermAssignments.length} phân công đang hiệu lực.
                                                                        </p>
                                                                  </div>
                                                            )}
                                                      </div>
                                                )}

                                                <label className="space-y-1.5 md:col-span-2">
                                                      <Label>Ghi chú</Label>
                                                      <Textarea
                                                            value={assignmentForm.notes}
                                                            onChange={(event) =>
                                                                  setAssignmentForm((current) =>
                                                                        current ? { ...current, notes: event.target.value } : current
                                                                  )
                                                            }
                                                            rows={3}
                                                            className={residenceMediumStyle.formTextarea}
                                                      />
                                                </label>
                                          </div>

                                          <div className="mt-5 flex justify-end gap-2">
                                                <button
                                                      type="button"
                                                      onClick={() => { setAssignmentForm(null); if (returnToMembersPath) returnToMembers(); }}
                                                      className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                                                >
                                                      Hủy
                                                </button>
                                                <button
                                                      type="button"
                                                      onClick={saveAssignment}
                                                      disabled={createAssignmentMutation.isPending || updateAssignmentMutation.isPending}
                                                      className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                                                >
                                                      <Save className="h-4 w-4" />
                                                      Lưu
                                                </button>
                                          </div>
                                    </div>
                              </div>
                        )}

                        {unitForm && (
                              <div className={residenceMediumStyle.modalOverlay}>
                                    <div className={`${residenceMediumStyle.modalShell} max-w-xl`}>
                                          <div className={residenceMediumStyle.modalHeader}>
                                                <div>
                                                      <p className={residenceMediumStyle.modalEyebrow}>Tổ / Ban</p>
                                                      <h2 className={residenceMediumStyle.modalTitle}>
                                                            {unitForm.id ? 'Cập nhật Tổ/Ban' : 'Thêm Tổ/Ban'}
                                                      </h2>
                                                      <p className={residenceMediumStyle.modalSubtitle}>Quản lý đơn vị phụ trách trong lưu xá.</p>
                                                </div>
                                                <button
                                                      type="button"
                                                      onClick={() => setUnitForm(null)}
                                                      className="rounded-xl border border-amber-100 bg-white/80 p-2 text-slate-500 hover:bg-amber-50"
                                                >
                                                      <X className="h-4 w-4" />
                                                </button>
                                          </div>

                                          <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
                                                <label className="space-y-1.5">
                                                      <Label>Mã</Label>
                                                      <Input
                                                            value={unitForm.code}
                                                            onChange={(event) =>
                                                                  setUnitForm((current) =>
                                                                        current ? { ...current, code: event.target.value } : current
                                                                  )
                                                            }
                                                            className={residenceMediumStyle.formInput}
                                                      />
                                                </label>
                                                <label className="space-y-1.5">
                                                      <Label>Loại</Label>
                                                      <select
                                                            value={unitForm.unitType}
                                                            onChange={(event) =>
                                                                  setUnitForm((current) =>
                                                                        current
                                                                              ? { ...current, unitType: event.target.value as UnitType }
                                                                              : current
                                                                  )
                                                            }
                                                            className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm text-slate-800 shadow-[0_8px_18px_rgba(120,53,15,0.055)] outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-100"
                                                      >
                                                            <option value="team">Tổ</option>
                                                            <option value="committee">Ban</option>
                                                      </select>
                                                </label>
                                                <label className="space-y-1.5 md:col-span-2">
                                                      <Label>Tên</Label>
                                                      <Input
                                                            value={unitForm.name}
                                                            onChange={(event) =>
                                                                  setUnitForm((current) =>
                                                                        current ? { ...current, name: event.target.value } : current
                                                                  )
                                                            }
                                                            className={residenceMediumStyle.formInput}
                                                      />
                                                </label>
                                                <label className="space-y-1.5">
                                                      <Label>Thứ tự</Label>
                                                      <Input
                                                            type="number"
                                                            value={unitForm.sortOrder}
                                                            onChange={(event) =>
                                                                  setUnitForm((current) =>
                                                                        current ? { ...current, sortOrder: event.target.value } : current
                                                                  )
                                                            }
                                                            className={residenceMediumStyle.formInput}
                                                      />
                                                </label>
                                                <label className="mt-7 flex items-center gap-2">
                                                      <input
                                                            type="checkbox"
                                                            checked={unitForm.isActive}
                                                            onChange={(event) =>
                                                                  setUnitForm((current) =>
                                                                        current ? { ...current, isActive: event.target.checked } : current
                                                                  )
                                                            }
                                                      />
                                                      <span className="text-sm font-semibold text-neutral-700">Đang sử dụng</span>
                                                </label>
                                                <label className="space-y-1.5 md:col-span-2">
                                                      <Label>Ghi chú</Label>
                                                      <Textarea
                                                            value={unitForm.description}
                                                            onChange={(event) =>
                                                                  setUnitForm((current) =>
                                                                        current ? { ...current, description: event.target.value } : current
                                                                  )
                                                            }
                                                            rows={3}
                                                            className={residenceMediumStyle.formTextarea}
                                                      />
                                                </label>
                                          </div>

                                          <div className="flex justify-end gap-2 border-t border-amber-100 px-5 py-4">
                                                <button
                                                      type="button"
                                                      onClick={() => setUnitForm(null)}
                                                      className={residenceMediumStyle.secondaryButton}
                                                >
                                                      Hủy
                                                </button>
                                                <button
                                                      type="button"
                                                      onClick={saveUnit}
                                                      className={residenceMediumStyle.primaryButton}
                                                >
                                                      Lưu
                                                </button>
                                          </div>
                                    </div>
                              </div>
                        )}

                        {termForm && (
                              <div className={residenceMediumStyle.modalOverlay}>
                                    <div className={`${residenceMediumStyle.modalShell} max-w-xl`}>
                                          <div className={residenceMediumStyle.modalHeader}>
                                                <div>
                                                      <p className={residenceMediumStyle.modalEyebrow}>Nhiệm kỳ</p>
                                                      <h2 className={residenceMediumStyle.modalTitle}>
                                                            {termForm.id ? 'Cập nhật nhiệm kỳ' : 'Thêm nhiệm kỳ'}
                                                      </h2>
                                                      <p className={residenceMediumStyle.modalSubtitle}>Quản lý thời gian áp dụng cơ cấu tổ chức.</p>
                                                </div>
                                                <button
                                                      type="button"
                                                      onClick={() => setTermForm(null)}
                                                      className="rounded-xl border border-amber-100 bg-white/80 p-2 text-slate-500 hover:bg-amber-50"
                                                >
                                                      <X className="h-4 w-4" />
                                                </button>
                                          </div>

                                          <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
                                                <label className="space-y-1.5">
                                                      <Label>Mã nhiệm kỳ</Label>
                                                      <Input
                                                            value={termForm.code}
                                                            onChange={(event) =>
                                                                  setTermForm((current) =>
                                                                        current ? { ...current, code: event.target.value } : current
                                                                  )
                                                            }
                                                            className={residenceMediumStyle.formInput}
                                                      />
                                                </label>
                                                <label className="space-y-1.5">
                                                      <Label>Trạng thái</Label>
                                                      <select
                                                            value={termForm.status}
                                                            onChange={(event) =>
                                                                  setTermForm((current) =>
                                                                        current ? { ...current, status: event.target.value as TermStatus } : current
                                                                  )
                                                            }
                                                            className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm text-slate-800 shadow-[0_8px_18px_rgba(120,53,15,0.055)] outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-100"
                                                      >
                                                            <option value="inactive">Chưa kích hoạt</option>
                                                            <option value="active">Đang áp dụng</option>
                                                            <option value="closed">Đã kết thúc</option>
                                                      </select>
                                                </label>
                                                <label className="space-y-1.5 md:col-span-2">
                                                      <Label>Tên nhiệm kỳ</Label>
                                                      <Input
                                                            value={termForm.name}
                                                            onChange={(event) =>
                                                                  setTermForm((current) =>
                                                                        current ? { ...current, name: event.target.value } : current
                                                                  )
                                                            }
                                                            className={residenceMediumStyle.formInput}
                                                      />
                                                </label>
                                                <label className="space-y-1.5">
                                                      <Label>Ngày bắt đầu</Label>
                                                      <Input
                                                            type="date"
                                                            value={termForm.startDate}
                                                            onChange={(event) =>
                                                                  setTermForm((current) =>
                                                                        current ? { ...current, startDate: event.target.value } : current
                                                                  )
                                                            }
                                                            className={residenceMediumStyle.formInput}
                                                      />
                                                </label>
                                                <label className="space-y-1.5">
                                                      <Label>Ngày kết thúc</Label>
                                                      <Input
                                                            type="date"
                                                            value={termForm.endDate}
                                                            onChange={(event) =>
                                                                  setTermForm((current) =>
                                                                        current ? { ...current, endDate: event.target.value } : current
                                                                  )
                                                            }
                                                            className={residenceMediumStyle.formInput}
                                                      />
                                                </label>
                                                <label className="space-y-1.5 md:col-span-2">
                                                      <Label>Ghi chú</Label>
                                                      <Textarea
                                                            value={termForm.description}
                                                            onChange={(event) =>
                                                                  setTermForm((current) =>
                                                                        current ? { ...current, description: event.target.value } : current
                                                                  )
                                                            }
                                                            rows={3}
                                                            className={residenceMediumStyle.formTextarea}
                                                      />
                                                </label>
                                          </div>

                                          <div className="flex justify-end gap-2 border-t border-amber-100 px-5 py-4">
                                                <button
                                                      type="button"
                                                      onClick={() => setTermForm(null)}
                                                      className={residenceMediumStyle.secondaryButton}
                                                >
                                                      Hủy
                                                </button>
                                                <button
                                                      type="button"
                                                      onClick={saveTerm}
                                                      disabled={createTermMutation.isPending || updateTermMutation.isPending || createAssignmentMutation.isPending}
                                                      className={residenceMediumStyle.primaryButton}
                                                >
                                                      Lưu
                                                </button>
                                          </div>
                                    </div>
                              </div>
                        )}

                        {selectedUnitForMembers && (
                              <div className={residenceMediumStyle.modalOverlay}>
                                    <div className={`${residenceMediumStyle.modalShell} max-w-4xl`}>
                                          <div className={residenceMediumStyle.modalHeader}>
                                                <div>
                                                      <p className={residenceMediumStyle.modalEyebrow}>
                                                            {getUnitTypeLabel(selectedUnitForMembers.unitType)}
                                                      </p>
                                                      <h2 className={residenceMediumStyle.modalTitle}>
                                                            Thành viên {selectedUnitForMembers.name}
                                                      </h2>
                                                      <p className={residenceMediumStyle.modalSubtitle}>
                                                            Quản lý danh sách học viên thuộc {selectedUnitForMembers.unitType === 'team' ? 'Tổ' : 'Ban'}.
                                                      </p>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                      {returnToMembersPath && (
                                                            <button
                                                                  type="button"
                                                                  onClick={returnToMembers}
                                                                  className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                                                            >
                                                                  {returnToMembersLabel}
                                                            </button>
                                                      )}

                                                      <button
                                                            type="button"
                                                            onClick={closeUnitMembers}
                                                                                                                        className={residenceMediumStyle.secondaryButton}
                                                      >
                                                            Đóng
                                                      </button>
                                                </div>
                                          </div>

                                          <div className={cx(residenceMediumStyle.premiumNestedSection, 'mx-5 mt-5')}>
                                                <div className="mb-3 grid gap-3 md:grid-cols-[220px_1fr]">
                                                      <div>
                                                            <Label>
                                                                  {selectedUnitForMembers.unitType === 'team' ? 'Chọn Tổ' : 'Chọn Ban'}
                                                            </Label>
                                                            <select
                                                                  value={selectedUnitForMembers.id}
                                                                  onChange={(event) => {
                                                                        const nextUnit = activeUnits.find(
                                                                              (unit) => Number(unit.id) === Number(event.target.value)
                                                                        );

                                                                        if (nextUnit) {
                                                                              setSelectedUnitForMembers(nextUnit);
                                                                              setSelectedResidentToAdd(selectedResidentToAdd);
                                                                              setSelectedResidentToTransfer('');
                                                                              setSelectedTargetUnitToTransfer('');
                                                                              setTransferConfirm(null);
                                                                        }
                                                                  }}
                                                                  className="mt-2 h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm text-slate-800 shadow-[0_8px_18px_rgba(120,53,15,0.055)] outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-100"
                                                            >
                                                                  {activeUnits
                                                                        .filter((unit) => unit.unitType === selectedUnitForMembers.unitType)
                                                                        .map((unit) => (
                                                                              <option key={unit.id} value={unit.id}>
                                                                                    {unit.name}
                                                                              </option>
                                                                        ))}
                                                            </select>
                                                      </div>

                                                      <div className="rounded-2xl bg-white/85 px-4 py-3 text-sm text-slate-600 ring-1 ring-amber-100">
                                                            Đang thao tác với <span className="font-semibold text-neutral-900">{selectedUnitForMembers.name}</span>.
                                                            {returnToMembersPath && (
                                                                  <span> Sau khi thêm thành viên, hệ thống sẽ quay lại trang học viên.</span>
                                                            )}
                                                      </div>
                                                </div>

                                                <Label>Thêm học viên</Label>
                                                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                                                      <select
                                                            value={selectedResidentToAdd}
                                                            onChange={(event) => setSelectedResidentToAdd(event.target.value)}
                                                            className="h-10 flex-1 rounded-xl border border-amber-100 bg-white/90 px-3 text-sm text-slate-800 shadow-[0_8px_18px_rgba(120,53,15,0.055)] outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-100"
                                                      >
                                                            <option value="">Chọn học viên đang lưu trú</option>
                                                            {(availableUnitResidentsQuery.data || []).map((resident: any) => (
                                                                  <option key={resident.id} value={resident.id}>
                                                                        {resident.displayName || resident.fullName} · {resident.residentCode}
                                                                  </option>
                                                            ))}
                                                      </select>

                                                      <button
                                                            type="button"
                                                            onClick={addSelectedUnitMember}
                                                            disabled={addUnitMemberMutation.isPending}
                                                            className={residenceMediumStyle.primaryButton}
                                                      >
                                                            {addUnitMemberMutation.isPending ? 'Đang thêm...' : 'Thêm thành viên'}
                                                      </button>
                                                </div>
                                                {selectedUnitForMembers.unitType === 'team' && (
                                                      <p className="mt-2 text-xs leading-5 text-neutral-500">
                                                            Một học viên chỉ thuộc một Tổ tại một thời điểm. Nếu học viên đã thuộc Tổ khác, dùng chức năng chuyển tổ bên dưới.
                                                      </p>
                                                )}
                                          </div>

                                          {selectedUnitForMembers.unitType === 'team' && (
                                                <div className={cx(residenceMediumStyle.premiumNestedSection, 'mt-4')}>
                                                      <div className="flex flex-col gap-3">
                                                            <div>
                                                                  <p className="text-sm font-bold text-amber-900">Đổi tổ cho học viên</p>
                                                                  <p className="mt-1 text-xs leading-5 text-amber-800">
                                                                        Đứng tại {selectedUnitForMembers.name}, chọn học viên trong Tổ này và chọn Tổ đến. Hệ thống vẫn kiểm tra vai trò Tổ trưởng trước khi cho đổi.
                                                                  </p>
                                                            </div>

                                                            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
                                                                  <label className="space-y-1.5">
                                                                        <span className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                                                                              Học viên trong {selectedUnitForMembers.name}
                                                                        </span>
                                                                        <select
                                                                              value={selectedResidentToTransfer}
                                                                              onChange={(event) => {
                                                                                    setSelectedResidentToTransfer(event.target.value);
                                                                                    setTransferConfirm(null);
                                                                              }}
                                                                              className="h-11 w-full rounded-2xl border border-amber-200 bg-white px-3 text-sm"
                                                                        >
                                                                              <option value="">Chọn học viên cần đổi tổ</option>
                                                                              {(unitMembersQuery.data || []).map((member: OrganizationUnitMember) => (
                                                                                    <option key={member.id} value={member.residentId}>
                                                                                          {`${member.holyName ? `${member.holyName} ` : ''}${member.residentName || 'Chưa rõ tên'}`.trim()} · {member.residentCode}
                                                                                    </option>
                                                                              ))}
                                                                        </select>
                                                                  </label>

                                                                  <label className="space-y-1.5">
                                                                        <span className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                                                                              Tổ đến
                                                                        </span>
                                                                        <select
                                                                              value={selectedTargetUnitToTransfer}
                                                                              onChange={(event) => {
                                                                                    setSelectedTargetUnitToTransfer(event.target.value);
                                                                                    setTransferConfirm(null);
                                                                              }}
                                                                              className="h-11 w-full rounded-2xl border border-amber-200 bg-white px-3 text-sm"
                                                                        >
                                                                              <option value="">Chọn Tổ đến</option>
                                                                              {activeUnits
                                                                                    .filter(
                                                                                          (unit) =>
                                                                                                unit.unitType === 'team' &&
                                                                                                Number(unit.id) !== Number(selectedUnitForMembers.id)
                                                                                    )
                                                                                    .map((unit) => (
                                                                                          <option key={unit.id} value={unit.id}>
                                                                                                {unit.name}
                                                                                          </option>
                                                                                    ))}
                                                                        </select>
                                                                  </label>

                                                                  <button
                                                                        type="button"
                                                                        onClick={requestTransferSelectedResident}
                                                                        disabled={
                                                                              transferTeamMemberMutation.isPending ||
                                                                              !selectedResidentToTransfer ||
                                                                              !selectedTargetUnitToTransfer
                                                                        }
                                                                        className="h-11 rounded-2xl border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-60"
                                                                  >
                                                                        Đổi tổ
                                                                  </button>
                                                            </div>
                                                      </div>

                                                      {transferConfirm && (
                                                            <div className="mt-4 rounded-2xl border border-amber-300 bg-white p-4">
                                                                  <p className="text-sm font-semibold text-neutral-950">
                                                                        Xác nhận đổi {transferConfirm.residentName} sang {transferConfirm.targetUnitName}?
                                                                  </p>
                                                                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                                                                        Membership Tổ cũ sẽ được kết thúc. Thao tác này không tự cập nhật chức vụ Tổ trưởng nếu học viên đang phụ trách Tổ khác.
                                                                  </p>
                                                                  <div className="mt-3 flex flex-wrap gap-2">
                                                                        <button
                                                                              type="button"
                                                                              onClick={confirmTransferSelectedResident}
                                                                              disabled={transferTeamMemberMutation.isPending}
                                                                              className="rounded-xl bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
                                                                        >
                                                                              {transferTeamMemberMutation.isPending ? 'Đang đổi...' : 'Xác nhận đổi'}
                                                                        </button>
                                                                        <button
                                                                              type="button"
                                                                              onClick={cancelTransferSelectedResident}
                                                                              disabled={transferTeamMemberMutation.isPending}
                                                                              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
                                                                        >
                                                                              Hủy
                                                                        </button>
                                                                  </div>
                                                            </div>
                                                      )}
                                                </div>
                                          )}

                                          <div className="mt-5 space-y-3">
                                                {unitMembersQuery.isLoading || unitMembersQuery.isFetching ? (
                                                      <SectionEmpty
                                                            title="Đang tải thành viên"
                                                            description="Vui lòng chờ trong giây lát."
                                                      />
                                                ) : unitMembersQuery.error ? (
                                                      <SectionEmpty
                                                            title="Không tải được danh sách thành viên"
                                                            description={
                                                                  unitMembersQuery.error.message ||
                                                                  "Vui lòng kiểm tra lại dữ liệu Tổ/Ban."
                                                            }
                                                      />
                                                ) : (unitMembersQuery.data || []).length === 0 ? (
                                                      <SectionEmpty
                                                            title="Chưa có thành viên"
                                                            description="Thêm học viên vào Tổ/Ban để Tổ trưởng hoặc Trưởng ban có thể theo dõi phạm vi phụ trách."
                                                      />
                                                ) : (
                                                      (unitMembersQuery.data || []).map((member: OrganizationUnitMember) => (
                                                            <div
                                                                  key={member.id}
                                                                  className="rounded-2xl border border-neutral-200 bg-white p-4"
                                                            >
                                                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                                        <div>
                                                                              <p className="font-semibold text-neutral-950">
                                                                                    {`${member.holyName ? `${member.holyName} ` : ''}${member.residentName || 'Chưa rõ tên'}`.trim()}
                                                                              </p>
                                                                              <p className="mt-1 text-sm text-neutral-500">
                                                                                    {member.residentCode || 'Chưa có mã'} · {member.roomCode || member.roomName || 'Chưa gán phòng'}
                                                                              </p>
                                                                        </div>

                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                              <span
                                                                                    className={[
                                                                                          'rounded-full border px-3 py-1 text-xs font-semibold',
                                                                                          getUnitMemberRoleClass(member.memberRole),
                                                                                    ].join(' ')}
                                                                              >
                                                                                    {getUnitMemberRoleLabel(member.memberRole)}
                                                                              </span>

                                                                              <button
                                                                                    type="button"
                                                                                    onClick={() => removeSelectedUnitMember(member)}
                                                                                    disabled={removeUnitMemberMutation.isPending}
                                                                                    className="w-fit rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                                                                              >
                                                                                    Gỡ khỏi {selectedUnitForMembers.unitType === 'team' ? 'Tổ' : 'Ban'}
                                                                              </button>
                                                                        </div>
                                                                  </div>
                                                            </div>
                                                      ))
                                                )}
                                          </div>
                                    </div>
                              </div>
                        )}

                        </div>
                  </div>
            </ResidenceCareLayout>
      );
}
