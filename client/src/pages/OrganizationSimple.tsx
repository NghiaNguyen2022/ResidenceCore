'use client';

import { useMemo, useState } from 'react';
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
import { StructureTab } from '@/components/organization-simple/StructureTab';
import { AssignmentModal } from '@/components/organization-simple/AssignmentModal';
import { AssignmentsTab } from '@/components/organization-simple/AssignmentsTab';
import { UnitsTab } from '@/components/organization-simple/UnitsTab';
import { TermsTab } from '@/components/organization-simple/TermsTab';
import { UnitModal } from '@/components/organization-simple/UnitModal';
import { TermModal } from '@/components/organization-simple/TermModal';

import type {
      AssignmentForm,
      OrganizationAssignment,
      OrganizationRole,
      OrganizationTerm,
      OrganizationUnit,
      SimpleTab,
      TermForm,
      UnitForm,
} from '@/components/organization-simple/types';

import {
      buildAssignmentTitle,
      formatDate,
      getAssignmentDisplayTitle,
      getAssignmentStatusClass,
      getAssignmentStatusLabel,
      getCurrentRoomIdFromMember,
      getResidentDisplayName,
      getRoleLevel,
      getRoomLabelFromAssignment,
      getRoomLabelFromMember,
      getTermStatusClass,
      getTermStatusLabel,
      getUnitTypeClass,
      getUnitTypeLabel,
      isAssignmentRole,
      isCommitteeAssignment,
      isTeamAssignment,
      normalizeCode,
      normalizeText,
      roleRequiresUnit,
      today,
      toInputDateValue,
} from '@/components/organization-simple/utils';

import {
      Badge,
      OrgMiniCard,
      OrgPlaceholderCard,
      SectionEmpty,
} from '@/components/organization-simple/OrgCards';

type TermStatus = 'active' | 'inactive' | 'closed';
type AssignmentStatus = 'active' | 'ended';
type UnitType = 'team' | 'committee';



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



function getLevelLabel(level: number) {
      if (level === 1) return 'Điều hành chính';
      if (level === 2) return 'Hỗ trợ điều hành';
      return 'Tổ / Ban phụ trách';
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

function getCardToneClass(tone: 'slate' | 'blue' | 'emerald' | 'violet' | 'amber' = 'slate') {
      if (tone === 'blue') return 'border-blue-200 bg-gradient-to-br from-blue-50 via-white to-sky-50';
      if (tone === 'emerald') return 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50';
      if (tone === 'violet') return 'border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50';
      if (tone === 'amber') return 'border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50';
      return 'border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100';
}

function getAssignmentTone(assignment?: OrganizationAssignment | null) {
      const roleName = normalizeText(assignment?.roleName || assignment?.assignmentTitle || '');

      if (roleName === 'truong') return 'blue' as const;
      if (roleName === 'pho') return 'emerald' as const;
      if (roleName === 'thu ky') return 'violet' as const;
      if (roleName === 'thu quy') return 'amber' as const;
      if (assignment?.roleType === 'team_leader' || assignment?.unitType === 'team') return 'blue' as const;
      if (assignment?.roleType === 'committee_head' || assignment?.unitType === 'committee') return 'violet' as const;

      return 'slate' as const;
}


export default function OrganizationSimple() {
      const [activeTab, setActiveTab] = useState<SimpleTab>('structure');
      const [selectedTermId, setSelectedTermId] = useState<string>('active');
      const [searchTerm, setSearchTerm] = useState('');

      const [assignmentForm, setAssignmentForm] = useState<AssignmentForm | null>(null);
      const [unitForm, setUnitForm] = useState<UnitForm | null>(null);
      const [termForm, setTermForm] = useState<TermForm | null>(null);

      const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
      const [assignmentError, setAssignmentError] = useState<string | null>(null);

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
            setAssignmentError(null);
            setAssignmentForm({
                  ...emptyAssignmentForm,
                  termId: currentTermId ? String(currentTermId) : '',
            });
            setActiveTab('assignments');
      };

      const openAssignmentEdit = (assignment: OrganizationAssignment) => {
            setMessage(null);
            setAssignmentError(null);
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

            const isUnitBasedRole =
                  selectedRole?.roleType === 'team_leader' ||
                  selectedRole?.roleType === 'committee_head' ||
                  Boolean(selectedRole?.requiresUnit);

            const activeSameRole = activeAssignments.filter((assignment) => {
                  const sameTerm = assignment.termId === Number(assignmentForm.termId);
                  const sameRole = assignment.roleId === Number(assignmentForm.roleId);
                  const sameStatus = assignment.status === 'active';
                  const notCurrent = assignment.id !== assignmentForm.id;
                  const sameUnit = !isUnitBasedRole || assignment.unitId === Number(assignmentForm.unitId || 0);

                  return sameTerm && sameRole && sameStatus && notCurrent && sameUnit;
            });

            const selectedRoleMax = selectedRole?.maxAssignees ?? null;
            const roleAllowsMultiple = Boolean(selectedRole?.allowMultipleMembers);

            if (selectedRoleMax && activeSameRole.length >= selectedRoleMax) {
                  return isUnitBasedRole
                        ? `${assignmentForm.assignmentTitle || selectedRole?.name || 'Chức vụ này'} đã đủ số lượng tối đa (${selectedRoleMax}).`
                        : `Chức vụ này đã đủ số lượng tối đa (${selectedRoleMax}).`;
            }

            if (!selectedRoleMax && !roleAllowsMultiple && activeSameRole.length >= 1) {
                  return isUnitBasedRole
                        ? `${assignmentForm.assignmentTitle || selectedRole?.name || 'Chức vụ này'} đã có người đảm nhiệm trong nhiệm kỳ này.`
                        : 'Chức vụ này chỉ cho một người đảm nhiệm trong cùng nhiệm kỳ.';
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
                  setAssignmentError(error);
                  return;
            }

            if (!assignmentForm) return;
            setAssignmentError(null);

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
                        setAssignmentError(null);
                  } else {
                        await createAssignmentMutation.mutateAsync(payload);
                        setMessage({ type: 'success', text: 'Đã bổ nhiệm học viên.' });
                        setAssignmentError(null);
                  }

                  setAssignmentForm(null);
                  await refetchOrganization();
            } catch (err: any) {
                  setAssignmentError(err?.message || 'Không thể lưu phân công.');
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
      }, [assignments, searchTerm]);

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


      const tabs: Array<{ key: SimpleTab; label: string; icon: React.ReactNode }> = [
            { key: 'structure', label: 'Cơ cấu hiện tại', icon: <LayoutGrid className="h-4 w-4" /> },
            { key: 'assignments', label: 'Bổ nhiệm / Phân công', icon: <UserPlus className="h-4 w-4" /> },
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
                              <StructureTab
                                    currentTerm={currentTerm}
                                    activeAssignments={activeAssignments}
                                    activeUnits={activeUnits}
                                    onEditAssignment={openAssignmentEdit}
                                    onEndAssignment={endAssignment}
                              />
                        )}

                        {!isLoading && activeTab === 'assignments' && (
                              <AssignmentsTab
                                    filteredAssignments={filteredAssignments}
                                    onCreateAssignment={openAssignmentCreate}
                                    onEditAssignment={openAssignmentEdit}
                                    onEndAssignment={endAssignment}
                              />
                        )}

                        {!isLoading && activeTab === 'units' && (
                              <UnitsTab
                                    units={units}
                                    onCreateUnit={openUnitCreate}
                                    onEditUnit={openUnitEdit}
                                    onToggleUnit={toggleUnit}
                              />
                        )}

                        {!isLoading && activeTab === 'terms' && (
                              <TermsTab
                                    terms={terms}
                                    onCreateTerm={openTermCreate}
                                    onEditTerm={openTermEdit}
                                    onSetActiveTerm={setActiveTerm}
                              />
                        )}

                        {assignmentForm && (
                              <AssignmentModal
                                    assignmentForm={assignmentForm}
                                    terms={terms}
                                    roles={roles}
                                    units={units}
                                    activeUnits={activeUnits}
                                    activeMembers={activeMembers}
                                    selectedRole={selectedRole}
                                    assignmentError={assignmentError}
                                    isSaving={createAssignmentMutation.isPending || updateAssignmentMutation.isPending}
                                    onChange={setAssignmentForm}
                                    onClose={() => {
                                          setAssignmentError(null);
                                          setAssignmentForm(null);
                                    }}
                                    onSave={saveAssignment}
                              />
                        )}

                        {unitForm && (
                              <UnitModal
                                    unitForm={unitForm}
                                    onChange={setUnitForm}
                                    onClose={() => setUnitForm(null)}
                                    onSave={saveUnit}
                              />
                        )}

                        {termForm && (
                              <TermModal
                                    termForm={termForm}
                                    onChange={setTermForm}
                                    onClose={() => setTermForm(null)}
                                    onSave={saveTerm}
                              />
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}
