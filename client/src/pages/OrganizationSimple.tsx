'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { normalizeText } from '@/lib/text';
import { formatDate } from '@/lib/format';
import { AssignmentsTab } from '@/components/organization-simple/AssignmentsTab';

type SimpleTab = 'structure' | 'assignments' | 'units' | 'terms';

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
      roomCode?: string | null;
      roomName?: string | null;
      unitCode?: string | null;
      unitName?: string | null;
      unitType?: string | null;
      roleLevel?: number | null;
      roleType?: string | null;
      roleRequiresUnit?: boolean | null;
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
            <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                        <div>
                              <p className="text-sm font-medium text-neutral-500">{label}</p>
                              <p className="mt-2 text-2xl font-bold text-neutral-950">{value}</p>
                              {helper && <p className="mt-1 text-xs text-neutral-500">{helper}</p>}
                        </div>
                        <div className="rounded-2xl bg-neutral-100 p-2 text-neutral-700">{icon}</div>
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

function SectionEmpty({ title, description }: { title: string; description: string }) {
      return (
            <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
                  <p className="font-semibold text-neutral-800">{title}</p>
                  <p className="mt-1 text-sm text-neutral-500">{description}</p>
            </div>
      );
}

export default function OrganizationSimple() {
      const [activeTab, setActiveTab] = useState<SimpleTab>('structure');
      const [selectedTermId, setSelectedTermId] = useState<string>('active');
      const [searchTerm, setSearchTerm] = useState('');
      const [handoverResidentId, setHandoverResidentId] = useState<number | null>(null);

      const [assignmentForm, setAssignmentForm] = useState<AssignmentForm | null>(null);
      const [unitForm, setUnitForm] = useState<UnitForm | null>(null);
      const [termForm, setTermForm] = useState<TermForm | null>(null);

      const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

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

      const createAssignmentMutation = trpc.organization.createAssignment.useMutation();
      const updateAssignmentMutation = trpc.organization.updateAssignment.useMutation();
      const endAssignmentMutation = trpc.organization.endAssignment.useMutation();

      const createUnitMutation = trpc.organization.createUnit.useMutation();
      const updateUnitMutation = trpc.organization.updateUnit.useMutation();
      const toggleUnitActiveMutation = trpc.organization.toggleUnitActive.useMutation();

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
            termId: currentTermId,
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

      const currentTerm = currentTermId
            ? terms.find((term) => term.id === currentTermId) || null
            : activeTerm;

      const refetchOrganization = async () => {
            await Promise.all([
                  termsQuery.refetch(),
                  rolesQuery.refetch(),
                  unitsQuery.refetch(),
                  assignmentsQuery.refetch(),
                  membersQuery.refetch(),
            ]);
      };

      const openAssignmentCreate = () => {
            setMessage(null);
            setAssignmentForm({
                  ...emptyAssignmentForm,
                  termId: currentTermId ? String(currentTermId) : '',
            });
            setActiveTab('assignments');
      };

      const openAssignmentEdit = (assignment: OrganizationAssignment) => {
            setMessage(null);
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
            setActiveTab('assignments');
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

            const selectedRoleMax = selectedRole?.maxAssignees ?? null;
            const roleAllowsMultiple = Boolean(selectedRole?.allowMultipleMembers);

            if (selectedRoleMax && activeSameRole.length >= selectedRoleMax) {
                  return `Chức vụ này đã đủ số lượng tối đa (${selectedRoleMax}).`;
            }

            if (!selectedRoleMax && !roleAllowsMultiple && activeSameRole.length >= 1) {
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
                  await refetchOrganization();
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
                  setMessage({ type: 'success', text: 'Đã kết thúc vai trò.' });
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
            });
            setActiveTab('terms');
      };

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
                        await createTermMutation.mutateAsync(payload);
                        setMessage({ type: 'success', text: 'Đã thêm nhiệm kỳ.' });
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

      const organizationChartGroups = useMemo(() => {
            const normalizeRoleTypeValue = (assignment: OrganizationAssignment) =>
                  String(assignment.roleType || assignment.roleCode || assignment.roleName || '')
                        .trim()
                        .toLowerCase();

            const isTeamAssignment = (assignment: OrganizationAssignment) => {
                  const roleText = normalizeText(
                        `${assignment.roleType || ''} ${assignment.roleCode || ''} ${assignment.roleName || ''} ${assignment.assignmentTitle || ''}`
                  );
                  const unitType = String(assignment.unitType || '').toLowerCase();

                  return (
                        assignment.roleType === 'team_leader' ||
                        unitType === 'team' ||
                        roleText.includes('to truong') ||
                        roleText.includes(' to ')
                  );
            };

            const isCommitteeAssignment = (assignment: OrganizationAssignment) => {
                  const roleText = normalizeText(
                        `${assignment.roleType || ''} ${assignment.roleCode || ''} ${assignment.roleName || ''} ${assignment.assignmentTitle || ''}`
                  );
                  const unitType = String(assignment.unitType || '').toLowerCase();

                  return (
                        assignment.roleType === 'committee_head' ||
                        unitType === 'committee' ||
                        roleText.includes('truong ban') ||
                        roleText.includes(' ban ')
                  );
            };

            const getRoleSearchText = (assignment: OrganizationAssignment) =>
                  normalizeText(
                        `${assignment.roleType || ''} ${assignment.roleCode || ''} ${assignment.roleName || ''} ${assignment.assignmentTitle || ''}`
                  );

            const isHouseHead = (assignment: OrganizationAssignment) => {
                  const roleType = normalizeRoleTypeValue(assignment);
                  const roleText = getRoleSearchText(assignment);

                  if (assignment.roleType === 'head' || roleType === 'head') return true;

                  const isHeadText =
                        roleText === 'truong' ||
                        roleText.includes(' truong ') ||
                        roleText.startsWith('truong ') ||
                        roleText.endsWith(' truong') ||
                        roleText.includes('truong luu xa') ||
                        roleText.includes('truong nha') ||
                        roleText.includes('house head');

                  const isAnotherHeadRole =
                        roleText.includes('pho') ||
                        roleText.includes('thu ky') ||
                        roleText.includes('thu quy') ||
                        roleText.includes('to truong') ||
                        roleText.includes('truong ban') ||
                        roleText.includes('ban truong') ||
                        roleText.includes('team leader') ||
                        roleText.includes('committee head');

                  return isHeadText && !isAnotherHeadRole;
            };

            const isDeputy = (assignment: OrganizationAssignment) => {
                  const roleText = getRoleSearchText(assignment);

                  return assignment.roleType === 'deputy' || roleText.includes('pho');
            };

            const isSecretary = (assignment: OrganizationAssignment) => {
                  const roleText = getRoleSearchText(assignment);

                  return assignment.roleType === 'secretary' || roleText.includes('thu ky');
            };

            const isTreasurer = (assignment: OrganizationAssignment) => {
                  const roleText = getRoleSearchText(assignment);

                  return assignment.roleType === 'treasurer' || roleText.includes('thu quy');
            };

            const heads = activeAssignments.filter(isHouseHead);
            const deputies = activeAssignments.filter(
                  (assignment) => !isHouseHead(assignment) && isDeputy(assignment)
            );
            const secretaries = activeAssignments.filter(
                  (assignment) => !isHouseHead(assignment) && isSecretary(assignment)
            );
            const treasurers = activeAssignments.filter(
                  (assignment) => !isHouseHead(assignment) && isTreasurer(assignment)
            );

            const supportIds = new Set(
                  [...heads, ...deputies, ...secretaries, ...treasurers].map(
                        (assignment) => assignment.id
                  )
            );

            const teamAssignments = activeAssignments.filter(
                  (assignment) => !supportIds.has(assignment.id) && isTeamAssignment(assignment)
            );

            const committeeAssignments = activeAssignments.filter(
                  (assignment) =>
                        !supportIds.has(assignment.id) &&
                        !teamAssignments.some((team) => team.id === assignment.id) &&
                        isCommitteeAssignment(assignment)
            );

            const usedIds = new Set(
                  [
                        ...heads,
                        ...deputies,
                        ...secretaries,
                        ...treasurers,
                        ...teamAssignments,
                        ...committeeAssignments,
                  ].map((assignment) => assignment.id)
            );

            return {
                  heads,
                  deputies,
                  secretaries,
                  treasurers,
                  teamAssignments,
                  committeeAssignments,
                  others: activeAssignments.filter((assignment) => !usedIds.has(assignment.id)),
            };
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
            { key: 'assignments', label: 'Bổ nhiệm / Phân công', icon: <UserPlus className="h-4 w-4" /> },
            { key: 'units', label: 'Tổ / Ban', icon: <Building2 className="h-4 w-4" /> },
            { key: 'terms', label: 'Nhiệm kỳ', icon: <CalendarDays className="h-4 w-4" /> },
      ];


      const renderOrgAssignmentCard = (
            assignment: OrganizationAssignment,
            variant: 'head' | 'support' | 'unit' = 'unit'
      ) => (
            <div
                  key={assignment.id}
                  className={[
                        'rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                        variant === 'head'
                              ? 'border-blue-200 bg-blue-50/60'
                              : variant === 'support'
                                    ? 'border-slate-200'
                                    : 'border-neutral-200',
                  ].join(' ')}
            >
                  <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-neutral-950">
                                    {getAssignmentDisplayTitle(assignment)}
                              </p>
                              <p className="mt-1 truncate text-sm font-semibold text-neutral-800">
                                    {assignment.residentName || '-'}
                              </p>
                              <p className="mt-1 truncate text-xs text-neutral-500">
                                    {getRoomLabelFromAssignment(assignment)}
                              </p>
                              {(assignment.unitName || assignment.unitCode) && (
                                    <p className="mt-2 truncate text-xs text-neutral-500">
                                          {getUnitTypeLabel(assignment.unitType)}:{' '}
                                          {assignment.unitName || assignment.unitCode}
                                    </p>
                              )}
                        </div>

                        <Badge className={getAssignmentStatusClass(assignment.status)}>
                              {getAssignmentStatusLabel(assignment.status)}
                        </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                        <button
                              type="button"
                              onClick={() => openAssignmentEdit(assignment)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                        >
                              <Edit2 className="h-3.5 w-3.5" />
                              Cập nhật
                        </button>
                        <button
                              type="button"
                              onClick={() => endAssignment(assignment)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-100"
                        >
                              Kết thúc
                        </button>
                  </div>
            </div>
      );

      const renderOrgEmptySlot = (title: string, description: string) => (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center">
                  <p className="text-sm font-bold text-neutral-800">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p>
            </div>
      );

      const renderOrgSlot = (
            title: string,
            assignments: OrganizationAssignment[],
            description: string,
            variant: 'head' | 'support' | 'unit' = 'unit'
      ) => (
            <div className="space-y-3">
                  {assignments.length > 0
                        ? assignments.map((assignment) =>
                                renderOrgAssignmentCard(assignment, variant)
                          )
                        : renderOrgEmptySlot(title, description)}
            </div>
      );

      const isLoading =
            termsQuery.isLoading ||
            rolesQuery.isLoading ||
            unitsQuery.isLoading ||
            assignmentsQuery.isLoading ||
            membersQuery.isLoading;

      return (
            <ResidenceCareLayout>
                  <div className="space-y-6">
                        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                          <p className="text-sm font-semibold text-blue-700">Tổ chức lưu xá</p>
                                          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950">
                                                Tổ chức lưu xá
                                          </h1>
                                          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
                                                Quản lý nhiệm kỳ, Tổ/Ban và các vai trò phụ trách trong một màn hình gọn, dễ thao tác.
                                          </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                          <button
                                                type="button"
                                                onClick={() => (window.location.href = '/organization-roles')}
                                                className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                                          >
                                                <Settings className="h-4 w-4" />
                                                Cấu hình chức vụ
                                          </button>
                                          <button
                                                type="button"
                                                onClick={openAssignmentCreate}
                                                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                          >
                                                <Plus className="h-4 w-4" />
                                                Bổ nhiệm
                                          </button>
                                    </div>
                              </div>

                              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                    <StatCard
                                          label="Nhiệm kỳ hiện tại"
                                          value={activeTerm?.name || 'Chưa có'}
                                          helper={activeTerm ? `${formatDate(activeTerm.startDate)} - ${formatDate(activeTerm.endDate)}` : 'Tạo hoặc đặt nhiệm kỳ hiện tại'}
                                          icon={<CalendarDays className="h-5 w-5" />}
                                    />
                                    <StatCard
                                          label="Đang phụ trách"
                                          value={activeAssignments.length}
                                          helper="Vai trò đang hiệu lực"
                                          icon={<ShieldCheck className="h-5 w-5" />}
                                    />
                                    <StatCard
                                          label="Tổ/Ban hoạt động"
                                          value={activeUnits.length}
                                          helper={`${activeUnits.filter((unit) => unit.unitType === 'team').length} tổ · ${activeUnits.filter((unit) => unit.unitType === 'committee').length} ban`}
                                          icon={<UsersRound className="h-5 w-5" />}
                                    />
                                    <StatCard
                                          label="Cần bổ sung"
                                          value={missingRoles.reduce((sum, item) => sum + item.missing, 0)}
                                          helper="Theo số lượng tối thiểu"
                                          icon={<Crown className="h-5 w-5" />}
                                    />
                              </div>
                        </div>

                        {message && (
                              <div
                                    className={[
                                          'rounded-2xl border px-4 py-3 text-sm font-medium',
                                          message.type === 'success'
                                                ? 'border-green-100 bg-green-50 text-green-700'
                                                : message.type === 'error'
                                                      ? 'border-red-100 bg-red-50 text-red-700'
                                                      : 'border-blue-100 bg-blue-50 text-blue-700',
                                    ].join(' ')}
                              >
                                    {message.text}
                              </div>
                        )}

                        <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
                              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                    <div className="flex flex-wrap gap-2">
                                          {tabs.map((tab) => (
                                                <button
                                                      key={tab.key}
                                                      type="button"
                                                      onClick={() => setActiveTab(tab.key)}
                                                      className={[
                                                            'inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition',
                                                            activeTab === tab.key
                                                                  ? 'bg-neutral-950 text-white shadow-sm'
                                                                  : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50',
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
                                                className="rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 outline-none"
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
                                                      className="h-10 min-w-[260px] rounded-2xl pl-9"
                                                />
                                          </div>
                                    </div>
                              </div>
                        </div>

                        {isLoading && (
                              <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
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

                                    {currentTerm && activeAssignments.length === 0 && (
                                          <SectionEmpty
                                                title="Chưa có phân công trong nhiệm kỳ này"
                                                description="Bấm Bổ nhiệm để thêm người phụ trách cho nhiệm kỳ hiện tại."
                                          />
                                    )}

                                    {currentTerm && (
                                          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
                                                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                      <div>
                                                            <h2 className="text-lg font-bold text-neutral-950">
                                                                  Sơ đồ tổ chức nhiệm kỳ hiện tại
                                                            </h2>
                                                            <p className="mt-1 text-sm text-neutral-500">
                                                                  Trưởng ở giữa phía trên, các chức vụ hỗ trợ bên dưới, Tổ và Ban tách thành 2 khu vực rõ ràng.
                                                            </p>
                                                      </div>
                                                      <Badge className="border-blue-100 bg-blue-50 text-blue-700">
                                                            {activeAssignments.length} phân công đang hoạt động
                                                      </Badge>
                                                </div>

                                                <div className="space-y-5">
                                                      <div className="mx-auto max-w-sm">
                                                            <div className="mb-2 flex justify-center">
                                                                  <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                                                                        Điều hành chính
                                                                  </Badge>
                                                            </div>
                                                            {renderOrgSlot(
                                                                  'Trưởng',
                                                                  organizationChartGroups.heads,
                                                                  'Chưa bổ nhiệm Trưởng nhiệm kỳ.',
                                                                  'head'
                                                            )}
                                                      </div>

                                                      <div className="mx-auto h-6 w-px bg-neutral-200" />

                                                      <div className="grid gap-3 md:grid-cols-3">
                                                            <div>
                                                                  <p className="mb-2 text-center text-sm font-bold text-neutral-800">
                                                                        Phó
                                                                  </p>
                                                                  {renderOrgSlot(
                                                                        'Phó',
                                                                        organizationChartGroups.deputies,
                                                                        'Chưa bổ nhiệm Phó.',
                                                                        'support'
                                                                  )}
                                                            </div>

                                                            <div>
                                                                  <p className="mb-2 text-center text-sm font-bold text-neutral-800">
                                                                        Thư ký
                                                                  </p>
                                                                  {renderOrgSlot(
                                                                        'Thư ký',
                                                                        organizationChartGroups.secretaries,
                                                                        'Chưa bổ nhiệm Thư ký.',
                                                                        'support'
                                                                  )}
                                                            </div>

                                                            <div>
                                                                  <p className="mb-2 text-center text-sm font-bold text-neutral-800">
                                                                        Thủ quỹ
                                                                  </p>
                                                                  {renderOrgSlot(
                                                                        'Thủ quỹ',
                                                                        organizationChartGroups.treasurers,
                                                                        'Chưa bổ nhiệm Thủ quỹ.',
                                                                        'support'
                                                                  )}
                                                            </div>
                                                      </div>

                                                      <div className="grid gap-4 lg:grid-cols-2">
                                                            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/40 p-4">
                                                                  <div className="mb-3 flex items-center justify-between">
                                                                        <div>
                                                                              <h3 className="font-bold text-neutral-950">
                                                                                    Tổ
                                                                              </h3>
                                                                              <p className="mt-1 text-xs text-neutral-500">
                                                                                    Các Tổ trưởng theo từng Tổ đang hoạt động.
                                                                              </p>
                                                                        </div>
                                                                        <Badge className="border-emerald-100 bg-white text-emerald-700">
                                                                              {organizationChartGroups.teamAssignments.length} người
                                                                        </Badge>
                                                                  </div>

                                                                  <div className="space-y-3">
                                                                        {organizationChartGroups.teamAssignments.length > 0
                                                                              ? organizationChartGroups.teamAssignments.map((assignment) =>
                                                                                      renderOrgAssignmentCard(
                                                                                            assignment,
                                                                                            'unit'
                                                                                      )
                                                                                )
                                                                              : renderOrgEmptySlot(
                                                                                      'Tổ',
                                                                                      'Chưa có Tổ trưởng hoặc chưa gán học viên phụ trách Tổ.'
                                                                                )}
                                                                  </div>
                                                            </div>

                                                            <div className="rounded-3xl border border-violet-100 bg-violet-50/40 p-4">
                                                                  <div className="mb-3 flex items-center justify-between">
                                                                        <div>
                                                                              <h3 className="font-bold text-neutral-950">
                                                                                    Ban
                                                                              </h3>
                                                                              <p className="mt-1 text-xs text-neutral-500">
                                                                                    Các Trưởng ban theo từng Ban đang hoạt động.
                                                                              </p>
                                                                        </div>
                                                                        <Badge className="border-violet-100 bg-white text-violet-700">
                                                                              {organizationChartGroups.committeeAssignments.length} người
                                                                        </Badge>
                                                                  </div>

                                                                  <div className="space-y-3">
                                                                        {organizationChartGroups.committeeAssignments.length > 0
                                                                              ? organizationChartGroups.committeeAssignments.map((assignment) =>
                                                                                      renderOrgAssignmentCard(
                                                                                            assignment,
                                                                                            'unit'
                                                                                      )
                                                                                )
                                                                              : renderOrgEmptySlot(
                                                                                      'Ban',
                                                                                      'Chưa có Trưởng ban hoặc chưa gán học viên phụ trách Ban.'
                                                                                )}
                                                                  </div>
                                                            </div>
                                                      </div>

                                                      {organizationChartGroups.others.length > 0 && (
                                                            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
                                                                  <h3 className="font-bold text-neutral-950">
                                                                        Chức vụ khác
                                                                  </h3>
                                                                  <p className="mt-1 text-sm text-neutral-500">
                                                                        Các phân công chưa được nhận diện vào nhóm Trưởng, Phó, Thư ký, Thủ quỹ, Tổ hoặc Ban.
                                                                  </p>
                                                                  <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                                        {organizationChartGroups.others.map((assignment) =>
                                                                              renderOrgAssignmentCard(assignment, 'unit')
                                                                        )}
                                                                  </div>
                                                            </div>
                                                      )}
                                                </div>
                                          </div>
                                    )}

                                    {missingRoles.length > 0 && (
                                          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
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

                                    <AssignmentsTab
                                          filteredAssignments={filteredAssignments}
                                          onCreateAssignment={openAssignmentCreate}
                                          onEditAssignment={openAssignmentEdit}
                                          onEndAssignment={endAssignment}
                                    />
                              </div>
                        )}

                        {!isLoading && activeTab === 'units' && (
                              <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
                                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                          <div>
                                                <h2 className="text-lg font-bold text-neutral-950">Tổ / Ban</h2>
                                                <p className="mt-1 text-sm text-neutral-500">
                                                      Quản lý các tổ và ban đang sử dụng trong lưu xá.
                                                </p>
                                          </div>
                                          <button
                                                type="button"
                                                onClick={openUnitCreate}
                                                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                          >
                                                <Plus className="h-4 w-4" />
                                                Thêm Tổ/Ban
                                          </button>
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                          {units.map((unit) => (
                                                <div key={unit.id} className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
                                                      <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                  <p className="font-bold text-neutral-950">{unit.name}</p>
                                                                  <p className="mt-1 text-xs text-neutral-500">{unit.code}</p>
                                                            </div>
                                                            <Badge className={getUnitTypeClass(unit.unitType)}>
                                                                  {getUnitTypeLabel(unit.unitType)}
                                                            </Badge>
                                                      </div>

                                                      {unit.description && (
                                                            <p className="mt-3 text-sm leading-6 text-neutral-600">{unit.description}</p>
                                                      )}

                                                      <div className="mt-4 flex flex-wrap gap-2">
                                                            <button
                                                                  type="button"
                                                                  onClick={() => openUnitEdit(unit)}
                                                                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
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
                              <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
                                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                          <div>
                                                <h2 className="text-lg font-bold text-neutral-950">Nhiệm kỳ</h2>
                                                <p className="mt-1 text-sm text-neutral-500">
                                                      Tạo, cập nhật và chọn nhiệm kỳ hiện tại.
                                                </p>
                                          </div>
                                          <button
                                                type="button"
                                                onClick={openTermCreate}
                                                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                          >
                                                <Plus className="h-4 w-4" />
                                                Thêm nhiệm kỳ
                                          </button>
                                    </div>

                                    <div className="space-y-3">
                                          {terms.map((term) => (
                                                <div
                                                      key={term.id}
                                                      className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-neutral-50 p-4 md:flex-row md:items-center md:justify-between"
                                                >
                                                      <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                  <p className="font-bold text-neutral-950">{term.name}</p>
                                                                  <Badge className={getTermStatusClass(term.status)}>
                                                                        {getTermStatusLabel(term.status)}
                                                                  </Badge>
                                                            </div>
                                                            <p className="mt-1 text-sm text-neutral-500">
                                                                  {term.code} · {formatDate(term.startDate)} - {formatDate(term.endDate)}
                                                            </p>
                                                      </div>

                                                      <div className="flex flex-wrap gap-2">
                                                            <button
                                                                  type="button"
                                                                  onClick={() => openTermEdit(term)}
                                                                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
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
                              <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 px-4 py-6 backdrop-blur-sm">
                                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl">
                                          <div className="mb-5 flex items-start justify-between gap-4">
                                                <div>
                                                      <h2 className="text-xl font-bold text-neutral-950">
                                                            {assignmentForm.id ? 'Cập nhật phân công' : 'Bổ nhiệm / Phân công'}
                                                      </h2>
                                                      <p className="mt-1 text-sm text-neutral-500">
                                                            Chọn học viên, chức vụ và nhiệm kỳ phù hợp.
                                                      </p>
                                                </div>
                                                <button
                                                      type="button"
                                                      onClick={() => setAssignmentForm(null)}
                                                      className="rounded-xl border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-50"
                                                >
                                                      <X className="h-4 w-4" />
                                                </button>
                                          </div>

                                          <div className="grid gap-4 md:grid-cols-2">
                                                <label className="space-y-1.5">
                                                      <Label>Nhiệm kỳ</Label>
                                                      <select
                                                            value={assignmentForm.termId}
                                                            onChange={(event) =>
                                                                  setAssignmentForm((current) =>
                                                                        current ? { ...current, termId: event.target.value } : current
                                                                  )
                                                            }
                                                            className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
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
                                                            className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
                                                      >
                                                            <option value="">Chọn chức vụ</option>
                                                            {roles.map((role) => (
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
                                                                  className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
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
                                                            className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
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
                                                            className="rounded-2xl"
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
                                                            className="rounded-2xl"
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
                                                            className="rounded-2xl"
                                                      />
                                                </label>

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
                                                            className="rounded-2xl"
                                                      />
                                                </label>
                                          </div>

                                          <div className="mt-5 flex justify-end gap-2">
                                                <button
                                                      type="button"
                                                      onClick={() => setAssignmentForm(null)}
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
                              <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 px-4 py-6 backdrop-blur-sm">
                                    <div className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl">
                                          <div className="mb-5 flex items-start justify-between">
                                                <div>
                                                      <h2 className="text-xl font-bold text-neutral-950">
                                                            {unitForm.id ? 'Cập nhật Tổ/Ban' : 'Thêm Tổ/Ban'}
                                                      </h2>
                                                      <p className="mt-1 text-sm text-neutral-500">Quản lý đơn vị phụ trách trong lưu xá.</p>
                                                </div>
                                                <button
                                                      type="button"
                                                      onClick={() => setUnitForm(null)}
                                                      className="rounded-xl border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-50"
                                                >
                                                      <X className="h-4 w-4" />
                                                </button>
                                          </div>

                                          <div className="grid gap-4 md:grid-cols-2">
                                                <label className="space-y-1.5">
                                                      <Label>Mã</Label>
                                                      <Input
                                                            value={unitForm.code}
                                                            onChange={(event) =>
                                                                  setUnitForm((current) =>
                                                                        current ? { ...current, code: event.target.value } : current
                                                                  )
                                                            }
                                                            className="rounded-2xl"
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
                                                            className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
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
                                                            className="rounded-2xl"
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
                                                            className="rounded-2xl"
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
                                                            className="rounded-2xl"
                                                      />
                                                </label>
                                          </div>

                                          <div className="mt-5 flex justify-end gap-2">
                                                <button
                                                      type="button"
                                                      onClick={() => setUnitForm(null)}
                                                      className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700"
                                                >
                                                      Hủy
                                                </button>
                                                <button
                                                      type="button"
                                                      onClick={saveUnit}
                                                      className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                                                >
                                                      Lưu
                                                </button>
                                          </div>
                                    </div>
                              </div>
                        )}

                        {termForm && (
                              <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 px-4 py-6 backdrop-blur-sm">
                                    <div className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl">
                                          <div className="mb-5 flex items-start justify-between">
                                                <div>
                                                      <h2 className="text-xl font-bold text-neutral-950">
                                                            {termForm.id ? 'Cập nhật nhiệm kỳ' : 'Thêm nhiệm kỳ'}
                                                      </h2>
                                                      <p className="mt-1 text-sm text-neutral-500">Quản lý thời gian áp dụng cơ cấu tổ chức.</p>
                                                </div>
                                                <button
                                                      type="button"
                                                      onClick={() => setTermForm(null)}
                                                      className="rounded-xl border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-50"
                                                >
                                                      <X className="h-4 w-4" />
                                                </button>
                                          </div>

                                          <div className="grid gap-4 md:grid-cols-2">
                                                <label className="space-y-1.5">
                                                      <Label>Mã nhiệm kỳ</Label>
                                                      <Input
                                                            value={termForm.code}
                                                            onChange={(event) =>
                                                                  setTermForm((current) =>
                                                                        current ? { ...current, code: event.target.value } : current
                                                                  )
                                                            }
                                                            className="rounded-2xl"
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
                                                            className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
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
                                                            className="rounded-2xl"
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
                                                            className="rounded-2xl"
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
                                                            className="rounded-2xl"
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
                                                            className="rounded-2xl"
                                                      />
                                                </label>
                                          </div>

                                          <div className="mt-5 flex justify-end gap-2">
                                                <button
                                                      type="button"
                                                      onClick={() => setTermForm(null)}
                                                      className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700"
                                                >
                                                      Hủy
                                                </button>
                                                <button
                                                      type="button"
                                                      onClick={saveTerm}
                                                      className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                                                >
                                                      Lưu
                                                </button>
                                          </div>
                                    </div>
                              </div>
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}
