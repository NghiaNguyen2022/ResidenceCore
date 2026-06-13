'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      Boxes,
      Crown,
      Edit2,
      LayoutGrid,
      Plus,
      Search,
      Trash2,
      UserRound,
      Users,
      X,
} from 'lucide-react';

import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Input } from '@/components/ui/input';
import { OrganizationHierarchyChart } from '@/components/organization-simple/OrganizationHierarchyChart';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// Tạm comment stat cards trong màn hình Cơ cấu tổ chức.
// Khi cần mở lại, bật import này và block JSX bên dưới.
// import { ConfigurableStatCard } from '@/components/configurable/ConfigurableStatCard';
import {
      ConfigurableColumn,
      ConfigurableDataTable,
} from '@/components/configurable/ConfigurableDataTable';

type AssignmentStatus = 'active' | 'ended';

type OrganizationTerm = {
      id: number;
      code: string;
      name: string;
      startDate: string | Date;
      endDate: string | Date;
      status: 'active' | 'inactive' | 'closed';
};

type OrganizationRole = {
      id: number;
      code: string;
      name: string;
      category:
      | 'management'
      | 'room'
      | 'liturgy'
      | 'academic'
      | 'activity'
      | 'finance'
      | 'discipline'
      | 'life'
      | 'other';
      allowMultipleMembers: boolean;
      isActive: boolean;
      sortOrder: number;
      level?: number;
      roleType?: string | null;
      minAssignees?: number;
      maxAssignees?: number | null;
      isSystem?: boolean;
      requiresUnit?: boolean;
};

type OrganizationUnit = {
      id: number;
      code: string;
      name: string;
      unitType: 'team' | 'committee' | string;
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

      termCode?: string;
      termName?: string;

      roleCode?: string;
      roleName?: string;
      roleCategory?: string;
      allowMultipleMembers?: boolean;

      residentCode?: string;
      residentName?: string;
      residentStatus?: string;

      roomCode?: string | null;
      roomName?: string | null;

      unitCode?: string | null;
      unitName?: string | null;
      unitType?: string | null;

      roleLevel?: number | null;
      roleType?: string | null;
      roleRequiresUnit?: boolean | null;
};

type StructureFormData = {
      termId: string;
      roleId: string;
      unitId: string;
      assignmentTitle: string;
      residentId: string;
      startDate: string;
      endDate: string;
      status: AssignmentStatus;
      notes: string;
};

const defaultFormData: StructureFormData = {
      termId: '',
      roleId: '',
      unitId: '',
      assignmentTitle: '',
      residentId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'active',
      notes: '',
};

function normalizeText(value?: string | null) {
      return (value || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ');
}

function toInputDateValue(date?: string | Date | null) {
      if (!date) return '';

      try {
            return new Date(date).toISOString().split('T')[0];
      } catch {
            return '';
      }
}

function formatDate(date?: string | Date | null) {
      if (!date) return '-';

      try {
            return new Date(date).toLocaleDateString('vi-VN');
      } catch {
            return '-';
      }
}

function getAssignmentStatusLabel(status?: AssignmentStatus) {
      if (status === 'active') return 'Đang đảm nhiệm';
      return 'Đã kết thúc';
}

function getAssignmentStatusClass(status?: AssignmentStatus) {
      if (status === 'active') {
            return 'border-green-200 bg-green-50 text-green-700';
      }

      return 'border-neutral-200 bg-neutral-100 text-neutral-600';
}

function getResidentStatusLabel(status?: string) {
      if (status === 'active') return 'Đang ở';
      if (status === 'inactive') return 'Tạm rời';
      if (status === 'transferred_out') return 'Đã rời';
      return 'Không rõ';
}

function getRoleCategoryLabel(category?: string) {
      if (category === 'management') return 'Quản lý chung';
      if (category === 'room') return 'Phòng ở';
      if (category === 'liturgy') return 'Phụng vụ';
      if (category === 'academic') return 'Học vụ';
      if (category === 'activity') return 'Sinh hoạt';
      if (category === 'finance') return 'Tài chính';
      if (category === 'discipline') return 'Kỷ luật';
      if (category === 'life') return 'Đời sống';
      return 'Khác';
}

function getResidentCode(member: any) {
      return member?.residentCode || member?.code || `ID: ${member?.id}`;
}

function getRoomLabelFromMember(member: any) {
      if (member?.roomCode) return member.roomCode;
      if (member?.currentRoomCode) return member.currentRoomCode;
      if (member?.roomName) return member.roomName;
      if (member?.currentRoomName) return member.currentRoomName;
      if (member?.currentRoomId) return `Phòng ID: ${member.currentRoomId}`;
      if (member?.roomId) return `Phòng ID: ${member.roomId}`;
      return 'Chưa gán';
}

function getRoomLabelFromAssignment(assignment: OrganizationAssignment) {
      if (assignment.roomCode && assignment.roomName) {
            return `${assignment.roomCode} - ${assignment.roomName}`;
      }

      if (assignment.roomCode) return assignment.roomCode;
      if (assignment.roomName) return assignment.roomName;
      if (assignment.roomId) return `Phòng ${assignment.roomId}`;
      return 'Chưa có phòng';
}

function getUnitTypeLabel(unitType?: string | null) {
      if (unitType === 'team') return 'Tổ';
      if (unitType === 'committee') return 'Ban';
      return 'Đơn vị';
}

function getUnitLabelFromAssignment(assignment: OrganizationAssignment) {
      if (assignment.unitName) return assignment.unitName;
      if (assignment.unitCode) return assignment.unitCode;
      if (assignment.unitId) return `${getUnitTypeLabel(assignment.unitType)} ${assignment.unitId}`;
      return '';
}

function buildAssignmentTitle(role?: OrganizationRole | null, unit?: OrganizationUnit | null) {
      if (!role) return '';

      const roleName = role.name || '';
      const unitName = unit?.name || '';

      if (!unitName) return roleName;

      if (role.roleType === 'team_leader') {
            return `Tổ trưởng ${unitName}`;
      }

      if (role.roleType === 'committee_head') {
            return `Trưởng ban ${unitName.replace(/^Ban\s+/i, '')}`;
      }

      return `${roleName} ${unitName}`;
}

function getAssignmentDisplayTitle(assignment: OrganizationAssignment) {
      if (assignment.assignmentTitle?.trim()) return assignment.assignmentTitle.trim();

      const unitName = getUnitLabelFromAssignment(assignment);

      if (assignment.roleType === 'team_leader' && unitName) {
            return `Tổ trưởng ${unitName}`;
      }

      if (assignment.roleType === 'committee_head' && unitName) {
            return `Trưởng ban ${unitName.replace(/^Ban\s+/i, '')}`;
      }

      return assignment.roleName || '-';
}

function getAssignmentLevel(assignment: OrganizationAssignment) {
      if (assignment.roleLevel === 1 || assignment.roleLevel === 2 || assignment.roleLevel === 3) {
            return assignment.roleLevel;
      }

      if (assignment.roleType === 'head') return 1;
      if (['deputy', 'secretary', 'treasurer'].includes(String(assignment.roleType))) return 2;
      return 3;
}

function roleRequiresUnit(role?: OrganizationRole | null) {
      if (!role) return false;
      return Boolean(role.requiresUnit || role.roleType === 'team_leader' || role.roleType === 'committee_head');
}

function getAllowedUnitsForRole(role: OrganizationRole | null, units: OrganizationUnit[]) {
      if (!role) return [];

      if (role.roleType === 'team_leader') {
            return units.filter((unit) => unit.unitType === 'team' && unit.isActive);
      }

      if (role.roleType === 'committee_head') {
            return units.filter((unit) => unit.unitType === 'committee' && unit.isActive);
      }

      return units.filter((unit) => unit.isActive);
}

function validateStructureForm({
      formData,
      selectedRole,
      selectedUnit,
}: {
      formData: StructureFormData;
      selectedRole?: OrganizationRole | null;
      selectedUnit?: OrganizationUnit | null;
}) {
      if (!formData.termId) return 'Vui lòng chọn nhiệm kỳ.';
      if (!formData.roleId) return 'Vui lòng chọn vai trò.';

      if (roleRequiresUnit(selectedRole) && !formData.unitId) {
            return 'Vui lòng chọn Tổ/Ban phụ trách cho vai trò này.';
      }

      if (selectedRole?.roleType === 'team_leader' && selectedUnit?.unitType !== 'team') {
            return 'Vai trò Tổ trưởng chỉ được chọn đơn vị loại Tổ.';
      }

      if (selectedRole?.roleType === 'committee_head' && selectedUnit?.unitType !== 'committee') {
            return 'Vai trò Trưởng ban chỉ được chọn đơn vị loại Ban.';
      }

      if (!formData.residentId) return 'Vui lòng chọn học viên.';
      if (!formData.startDate) return 'Vui lòng chọn ngày bắt đầu.';

      if (formData.endDate) {
            const startDate = new Date(formData.startDate);
            const endDate = new Date(formData.endDate);

            if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
                  return 'Ngày phân công không hợp lệ.';
            }

            if (endDate <= startDate) {
                  return 'Ngày kết thúc phải lớn hơn ngày bắt đầu.';
            }
      }

      return null;
}

export default function OrganizationStructure() {
      const [selectedTermId, setSelectedTermId] = useState<string>('all');
      const [searchTerm, setSearchTerm] = useState('');
      const [roleFilter, setRoleFilter] = useState<string>('all');
      const [statusFilter, setStatusFilter] = useState<'all' | AssignmentStatus>(
            'active'
      );

      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingAssignment, setEditingAssignment] =
            useState<OrganizationAssignment | null>(null);
      const [formData, setFormData] =
            useState<StructureFormData>(defaultFormData);
      const [error, setError] = useState<string | null>(null);

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
            isActive: true,
            limit: 500,
            offset: 0,
      });

      const membersQuery = trpc.members.list.useQuery({
            status: 'active' as any,
      });

      const assignmentsQuery = trpc.organization.listAssignments.useQuery({
            search: searchTerm || undefined,
            termId: selectedTermId !== 'all' ? Number(selectedTermId) : undefined,
            roleId: roleFilter !== 'all' ? Number(roleFilter) : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            limit: 500,
            offset: 0,
      });

      const createAssignmentMutation =
            trpc.organization.createAssignment.useMutation();
      const updateAssignmentMutation =
            trpc.organization.updateAssignment.useMutation();
      const endAssignmentMutation = trpc.organization.endAssignment.useMutation();
      const deleteAssignmentMutation =
            trpc.organization.deleteAssignment.useMutation();

      const terms = (termsQuery.data || []) as OrganizationTerm[];
      const roles = (rolesQuery.data || []) as OrganizationRole[];
      const units = (unitsQuery.data || []) as OrganizationUnit[];
      const activeMembers = membersQuery.data || [];
      const assignments = (assignmentsQuery.data || []) as OrganizationAssignment[];

      const activeTerm = useMemo(() => {
            return terms.find((term) => term.status === 'active') || null;
      }, [terms]);

      /*
       * Tạm comment nhóm stat cards của màn hình Cơ cấu tổ chức.
       * Khi cần mở lại:
       * 1. Bật lại import ConfigurableStatCard.
       * 2. Bật lại const stats này.
       * 3. Bật lại block JSX "STAT CARDS - TẠM COMMENT" bên dưới.
       *
      const stats = useMemo(() => {
            return {
                  total: assignments.length,
                  active: assignments.filter((assignment) => assignment.status === 'active')
                        .length,
                  ended: assignments.filter((assignment) => assignment.status === 'ended')
                        .length,
                  activeRoles: new Set(
                        assignments
                              .filter((assignment) => assignment.status === 'active')
                              .map((assignment) => assignment.roleId)
                  ).size,
            };
      }, [assignments]);
       */

      const refetchAll = () => {
            assignmentsQuery.refetch();
            rolesQuery.refetch();
            termsQuery.refetch();
      };

      const openCreateForm = () => {
            setEditingAssignment(null);
            setFormData({
                  ...defaultFormData,
                  termId:
                        selectedTermId !== 'all'
                              ? selectedTermId
                              : activeTerm
                                    ? String(activeTerm.id)
                                    : '',
            });
            setError(null);
            setIsFormOpen(true);
      };

      const openEditForm = (assignment: OrganizationAssignment) => {
            setEditingAssignment(assignment);
            setFormData({
                  termId: String(assignment.termId),
                  roleId: String(assignment.roleId),
                  unitId: assignment.unitId ? String(assignment.unitId) : '',
                  assignmentTitle: assignment.assignmentTitle || getAssignmentDisplayTitle(assignment),
                  residentId: String(assignment.residentId),
                  startDate: toInputDateValue(assignment.startDate),
                  endDate: toInputDateValue(assignment.endDate),
                  status: assignment.status,
                  notes: assignment.notes || '',
            });
            setError(null);
            setIsFormOpen(true);
      };

      const closeForm = () => {
            setIsFormOpen(false);
            setEditingAssignment(null);
            setFormData(defaultFormData);
            setError(null);
      };
      const selectedMember = activeMembers.find(
            (member: any) => String(member.id) === String(formData.residentId)
      );

      const selectedMemberRoomId =
            selectedMember?.roomId ??
            selectedMember?.currentRoomId ??
            selectedMember?.currentRoom?.id ??
            null;

      const selectedRole = formData.roleId
            ? roles.find((role) => String(role.id) === String(formData.roleId)) || null
            : null;

      const selectedUnit = formData.unitId
            ? units.find((unit) => String(unit.id) === String(formData.unitId)) || null
            : null;

      const handleSave = async () => {
            const validationMessage = validateStructureForm({
                  formData,
                  selectedRole,
                  selectedUnit,
            });

            if (validationMessage) {
                  setError(validationMessage);
                  return;
            }

            const payload = {
                  termId: Number(formData.termId),
                  roleId: Number(formData.roleId),
                  unitId: formData.unitId ? Number(formData.unitId) : null,
                  assignmentTitle: formData.assignmentTitle.trim() || null,
                  residentId: Number(formData.residentId),
                  roomId: selectedMemberRoomId ? Number(selectedMemberRoomId) : null,
                  startDate: formData.startDate,
                  endDate: formData.endDate || null,
                  status: formData.status,
                  notes: formData.notes.trim() || null,
            };

            try {
                  if (editingAssignment) {
                        await updateAssignmentMutation.mutateAsync({
                              id: editingAssignment.id,
                              ...payload,
                        });
                  } else {
                        await createAssignmentMutation.mutateAsync(payload);
                  }

                  closeForm();
                  refetchAll();
            } catch (err: any) {
                  setError(err.message || 'Lỗi khi lưu phân công tổ chức.');
            }
      };

      const handleEndAssignment = async (assignment: OrganizationAssignment) => {
            if (assignment.status === 'ended') return;

            const confirmed = confirm(
                  `Bạn có muốn kết thúc vai trò "${assignment.roleName || '-'}" của ${assignment.residentName || '-'
                  } không?`
            );

            if (!confirmed) return;

            try {
                  await endAssignmentMutation.mutateAsync({ id: assignment.id });
                  refetchAll();
            } catch (err: any) {
                  setError(err.message || 'Lỗi khi kết thúc phân công.');
            }
      };

      const handleDeleteAssignment = async (assignment: OrganizationAssignment) => {
            if (
                  !confirm(
                        `Bạn có chắc chắn muốn xóa phân công "${assignment.roleName || '-'}" của ${assignment.residentName || '-'
                        } không?`
                  )
            ) {
                  return;
            }

            try {
                  await deleteAssignmentMutation.mutateAsync({ id: assignment.id });
                  refetchAll();
            } catch (err: any) {
                  setError(err.message || 'Lỗi khi xóa phân công.');
            }
      };

      const clearFilters = () => {
            setSearchTerm('');
            setRoleFilter('all');
            setStatusFilter('active');
            setSelectedTermId('all');
      };

      const columns = useMemo<ConfigurableColumn<OrganizationAssignment>[]>(
            () => [
                  {
                        key: 'resident',
                        label: 'Học viên',
                        sortable: true,
                        sortValue: (assignment) => assignment.residentName || '',
                        render: (assignment) => (
                              <div>
                                    <p className="font-semibold text-neutral-900">
                                          {assignment.residentName || '-'}
                                    </p>
                                    <p className="mt-1 text-xs text-neutral-500">
                                          {assignment.residentCode || `ID: ${assignment.residentId}`} ·{' '}
                                          {getRoomLabelFromAssignment(assignment)}
                                    </p>
                              </div>
                        ),
                  },
                  {
                        key: 'role',
                        label: 'Chức danh',
                        sortable: true,
                        sortValue: (assignment) => getAssignmentDisplayTitle(assignment),
                        render: (assignment) => (
                              <div>
                                    <p className="font-semibold text-neutral-900">
                                          {getAssignmentDisplayTitle(assignment)}
                                    </p>
                                    <p className="mt-1 text-xs text-neutral-500">
                                          {assignment.roleName || '-'} · {getRoleCategoryLabel(assignment.roleCategory)}
                                    </p>
                              </div>
                        ),
                  },
                  {
                        key: 'unit',
                        label: 'Tổ/Ban',
                        sortable: true,
                        sortValue: (assignment) => getUnitLabelFromAssignment(assignment),
                        render: (assignment) => {
                              const unitLabel = getUnitLabelFromAssignment(assignment);

                              return unitLabel ? (
                                    <div>
                                          <p className="font-medium text-neutral-800">{unitLabel}</p>
                                          <p className="mt-1 text-xs text-neutral-500">
                                                {getUnitTypeLabel(assignment.unitType)}
                                          </p>
                                    </div>
                              ) : (
                                    <span className="text-sm text-neutral-400">-</span>
                              );
                        },
                  },
                  {
                        key: 'term',
                        label: 'Nhiệm kỳ',
                        sortable: true,
                        sortValue: (assignment) => assignment.termName || '',
                        render: (assignment) => (
                              <div>
                                    <p className="font-medium text-neutral-800">
                                          {assignment.termName || '-'}
                                    </p>
                                    <p className="mt-1 font-mono text-xs text-neutral-500">
                                          {assignment.termCode || '-'}
                                    </p>
                              </div>
                        ),
                  },
                  {
                        key: 'startDate',
                        label: 'Từ ngày',
                        sortable: true,
                        sortValue: (assignment) => new Date(assignment.startDate).getTime(),
                        render: (assignment) => formatDate(assignment.startDate),
                  },
                  {
                        key: 'endDate',
                        label: 'Đến ngày',
                        sortable: true,
                        defaultVisible: false,
                        sortValue: (assignment) =>
                              assignment.endDate ? new Date(assignment.endDate).getTime() : 0,
                        render: (assignment) => formatDate(assignment.endDate),
                  },
                  {
                        key: 'residentStatus',
                        label: 'TT học viên',
                        sortable: true,
                        defaultVisible: false,
                        sortValue: (assignment) =>
                              getResidentStatusLabel(assignment.residentStatus),
                        render: (assignment) =>
                              getResidentStatusLabel(assignment.residentStatus),
                  },
                  {
                        key: 'status',
                        label: 'Trạng thái',
                        sortable: true,
                        sortValue: (assignment) =>
                              getAssignmentStatusLabel(assignment.status),
                        render: (assignment) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getAssignmentStatusClass(
                                          assignment.status
                                    )}`}
                              >
                                    {getAssignmentStatusLabel(assignment.status)}
                              </span>
                        ),
                  },
                  {
                        key: 'notes',
                        label: 'Ghi chú',
                        defaultVisible: false,
                        sortable: true,
                        sortValue: (assignment) => assignment.notes || '',
                        render: (assignment) => assignment.notes || '-',
                  },
                  {
                        key: 'actions',
                        label: 'Hành động',
                        className: 'min-w-[240px]',
                        render: (assignment) => (
                              <div className="flex flex-wrap items-center gap-1.5">
                                    {assignment.status === 'active' && (
                                          <button
                                                type="button"
                                                onClick={() => handleEndAssignment(assignment)}
                                                disabled={endAssignmentMutation.isPending}
                                                className="rounded-lg px-2 py-1 text-xs font-semibold text-orange-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                title="Kết thúc vai trò"
                                          >
                                                Kết thúc
                                          </button>
                                    )}

                                    <button
                                          type="button"
                                          onClick={() => openEditForm(assignment)}
                                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                          title="Sửa phân công"
                                    >
                                          <Edit2 className="h-4 w-4" />
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => handleDeleteAssignment(assignment)}
                                          disabled={deleteAssignmentMutation.isPending}
                                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                          title="Xóa phân công"
                                    >
                                          <Trash2 className="h-4 w-4" />
                                    </button>
                              </div>
                        ),
                  },
            ],
            [
                  endAssignmentMutation.isPending,
                  deleteAssignmentMutation.isPending,
            ]
      );

      return (
            <ResidenceCareLayout>
                  <div className="space-y-6 p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                    <p className="text-sm font-semibold text-blue-600">
                                          Tổ chức lưu xá
                                    </p>
                                    <h1 className="mt-1 text-3xl font-bold text-neutral-900">
                                          Cơ cấu tổ chức
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                                          Phân công học viên đảm nhiệm các vai trò trong từng nhiệm kỳ, hỗ
                                          trợ theo dõi trách nhiệm, thời gian phụ trách và lịch sử tổ chức
                                          của lưu xá.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={openCreateForm}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                              >
                                    <Plus className="h-4 w-4" />
                                    Gán vai trò
                              </button>
                        </div>

                        {(error ||
                              termsQuery.error ||
                              rolesQuery.error ||
                              unitsQuery.error ||
                              membersQuery.error ||
                              assignmentsQuery.error) && (
                                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                          <div className="flex gap-3">
                                                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                                <div>
                                                      <p className="font-semibold">
                                                            Có lỗi khi xử lý cơ cấu tổ chức.
                                                      </p>
                                                      <p className="mt-1 text-sm">
                                                            {error ||
                                                                  termsQuery.error?.message ||
                                                                  rolesQuery.error?.message ||
                                                                  unitsQuery.error?.message ||
                                                                  membersQuery.error?.message ||
                                                                  assignmentsQuery.error?.message ||
                                                                  'Vui lòng kiểm tra lại dữ liệu.'}
                                                      </p>
                                                </div>
                                          </div>
                                    </div>
                              )}

                        {/*
                          STAT CARDS - TẠM COMMENT
                          Lý do: màn hình Cơ cấu tổ chức ưu tiên xem chart gọn trong một khung hình.
                          Khi cần mở lại, bật import ConfigurableStatCard + const stats ở phía trên.

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                              <ConfigurableStatCard
                                    moduleKey="organization"
                                    cardKey="organization.structure.total"
                                    label="Tổng phân công"
                                    value={stats.total}
                                    description="Tổng số phân công theo bộ lọc"
                                    tone="blue"
                                    icon={<Network className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="organization"
                                    cardKey="organization.structure.active"
                                    label="Đang đảm nhiệm"
                                    value={stats.active}
                                    description="Nhân sự đang giữ vai trò"
                                    tone="green"
                                    icon={<CheckCircle2 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="organization"
                                    cardKey="organization.structure.ended"
                                    label="Đã kết thúc"
                                    value={stats.ended}
                                    description="Vai trò đã kết thúc"
                                    tone="orange"
                                    icon={<StopCircle className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="organization"
                                    cardKey="organization.structure.activeRoles"
                                    label="Vai trò đang có người"
                                    value={stats.activeRoles}
                                    description="Số vai trò đang có nhân sự phụ trách"
                                    tone="purple"
                                    icon={<Users className="h-6 w-6" />}
                              />
                        </div>
                        */}
                        <OrganizationHierarchyChart
                              assignments={displayAssignments}
                              roles={roles}
                              units={units}
                        />

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                              <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[1fr_260px_220px_220px_auto]">
                                    <div className="relative">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                          <Input
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                placeholder="Tìm học viên, mã học viên, vai trò..."
                                                className="pl-10"
                                          />
                                    </div>

                                    <select
                                          value={selectedTermId}
                                          onChange={(event) => setSelectedTermId(event.target.value)}
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả nhiệm kỳ</option>
                                          {terms.map((term) => (
                                                <option key={term.id} value={String(term.id)}>
                                                      {term.name}
                                                </option>
                                          ))}
                                    </select>

                                    <select
                                          value={roleFilter}
                                          onChange={(event) => setRoleFilter(event.target.value)}
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả vai trò</option>
                                          {roles
                                                .slice()
                                                .sort((a, b) => {
                                                      const levelA = Number(a.level || 3);
                                                      const levelB = Number(b.level || 3);
                                                      if (levelA !== levelB) return levelA - levelB;
                                                      return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
                                                })
                                                .map((role) => (
                                                      <option key={role.id} value={String(role.id)}>
                                                            {role.name}
                                                      </option>
                                                ))}
                                    </select>

                                    <select
                                          value={statusFilter}
                                          onChange={(event) =>
                                                setStatusFilter(event.target.value as 'all' | AssignmentStatus)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả trạng thái</option>
                                          <option value="active">Đang đảm nhiệm</option>
                                          <option value="ended">Đã kết thúc</option>
                                    </select>

                                    <button
                                          type="button"
                                          onClick={clearFilters}
                                          className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                                    >
                                          Xóa lọc
                                    </button>
                              </div>
                        </div>

                        <ConfigurableDataTable
                              moduleKey="organization"
                              tableKey="organization.structure"
                              columns={columns}
                              data={assignments}
                              getRowKey={(assignment) => assignment.id}
                              isLoading={
                                    termsQuery.isLoading ||
                                    rolesQuery.isLoading ||
                                    unitsQuery.isLoading ||
                                    membersQuery.isLoading ||
                                    assignmentsQuery.isLoading
                              }
                              loadingText="Đang tải cơ cấu tổ chức..."
                              emptyTitle="Chưa có phân công nào"
                              emptyDescription="Chọn Gán vai trò để thêm nhân sự vào cơ cấu tổ chức."
                        />

                        {isFormOpen && (
                              <StructureFormModal
                                    title={editingAssignment ? 'Cập nhật phân công' : 'Gán vai trò'}
                                    formData={formData}
                                    setFormData={setFormData}
                                    error={error}
                                    onClose={closeForm}
                                    onSubmit={handleSave}
                                    submitText={
                                          editingAssignment
                                                ? updateAssignmentMutation.isPending
                                                      ? 'Đang cập nhật...'
                                                      : 'Cập nhật'
                                                : createAssignmentMutation.isPending
                                                      ? 'Đang lưu...'
                                                      : 'Gán vai trò'
                                    }
                                    isSubmitting={
                                          createAssignmentMutation.isPending ||
                                          updateAssignmentMutation.isPending
                                    }
                                    editingAssignment={editingAssignment}
                                    terms={terms}
                                    roles={roles}
                                    units={units}
                                    members={activeMembers}
                                    membersLoading={membersQuery.isLoading}
                                    unitsLoading={unitsQuery.isLoading}
                              />
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}

function StructureFormModal({
      title,
      formData,
      setFormData,
      error,
      onClose,
      onSubmit,
      submitText,
      isSubmitting,
      editingAssignment,
      terms,
      roles,
      units,
      members,
      membersLoading,
      unitsLoading,
}: {
      title: string;
      formData: StructureFormData;
      setFormData: React.Dispatch<React.SetStateAction<StructureFormData>>;
      error: string | null;
      onClose: () => void;
      onSubmit: () => void;
      submitText: string;
      isSubmitting: boolean;
      editingAssignment: OrganizationAssignment | null;
      terms: OrganizationTerm[];
      roles: OrganizationRole[];
      units: OrganizationUnit[];
      members: any[];
      membersLoading: boolean;
      unitsLoading: boolean;
}) {
      const selectedRole = formData.roleId
            ? roles.find((role) => String(role.id) === String(formData.roleId)) || null
            : null;

      const selectedUnit = formData.unitId
            ? units.find((unit) => String(unit.id) === String(formData.unitId)) || null
            : null;

      const requiresUnit = roleRequiresUnit(selectedRole);
      const allowedUnits = getAllowedUnitsForRole(selectedRole, units);

      const updateRoleSelection = (roleId: string) => {
            const nextRole = roles.find((role) => String(role.id) === roleId) || null;
            const nextTitle = buildAssignmentTitle(nextRole, null);

            setFormData({
                  ...formData,
                  roleId,
                  unitId: '',
                  assignmentTitle: nextTitle,
            });
      };

      const updateUnitSelection = (unitId: string) => {
            const nextUnit = units.find((unit) => String(unit.id) === unitId) || null;
            const nextTitle = buildAssignmentTitle(selectedRole, nextUnit);

            setFormData({
                  ...formData,
                  unitId,
                  assignmentTitle: nextTitle,
            });
      };

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
                              <div>
                                    <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
                                    <p className="text-sm text-neutral-500">
                                          Chọn nhiệm kỳ, vai trò và học viên để ghi nhận trách nhiệm phụ
                                          trách trong cơ cấu tổ chức lưu xá.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-lg p-2 transition hover:bg-neutral-100"
                              >
                                    <X className="h-5 w-5" />
                              </button>
                        </div>

                        <form
                              onSubmit={(event) => {
                                    event.preventDefault();
                                    onSubmit();
                              }}
                              className="space-y-5 p-6"
                        >
                              {error && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                          {error}
                                    </div>
                              )}

                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                          <Label htmlFor="termId">Nhiệm kỳ *</Label>
                                          <select
                                                id="termId"
                                                value={formData.termId}
                                                onChange={(event) =>
                                                      setFormData({ ...formData, termId: event.target.value })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                required
                                          >
                                                <option value="">Chọn nhiệm kỳ</option>
                                                {terms.map((term) => (
                                                      <option key={term.id} value={String(term.id)}>
                                                            {term.name}
                                                      </option>
                                                ))}
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="roleId">Vai trò *</Label>
                                          <select
                                                id="roleId"
                                                value={formData.roleId}
                                                onChange={(event) => updateRoleSelection(event.target.value)}
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                required
                                          >
                                                <option value="">Chọn vai trò</option>
                                                {roles
                                                      .slice()
                                                      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
                                                      .map((role) => (
                                                            <option key={role.id} value={String(role.id)}>
                                                                  {role.name}
                                                            </option>
                                                      ))}
                                          </select>

                                          {selectedRole && (
                                                <p className="mt-1 text-xs text-neutral-500">
                                                      {selectedRole.maxAssignees
                                                            ? `Vai trò này tối đa ${selectedRole.maxAssignees} người trong cùng nhiệm kỳ.`
                                                            : selectedRole.allowMultipleMembers
                                                                  ? 'Vai trò này có thể có nhiều học viên cùng đảm nhiệm.'
                                                                  : 'Vai trò này chỉ cho phép một học viên đảm nhiệm trong cùng nhiệm kỳ.'}
                                                </p>
                                          )}
                                    </div>

                                    {requiresUnit && (
                                          <div>
                                                <Label htmlFor="unitId">Tổ/Ban phụ trách *</Label>
                                                <select
                                                      id="unitId"
                                                      value={formData.unitId}
                                                      onChange={(event) => updateUnitSelection(event.target.value)}
                                                      className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                      required
                                                >
                                                      <option value="">
                                                            {unitsLoading
                                                                  ? 'Đang tải Tổ/Ban...'
                                                                  : selectedRole?.roleType === 'team_leader'
                                                                        ? 'Chọn Tổ'
                                                                        : selectedRole?.roleType === 'committee_head'
                                                                              ? 'Chọn Ban'
                                                                              : 'Chọn Tổ/Ban'}
                                                      </option>
                                                      {allowedUnits
                                                            .slice()
                                                            .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
                                                            .map((unit) => (
                                                                  <option key={unit.id} value={String(unit.id)}>
                                                                        {unit.name} · {unit.code}
                                                                  </option>
                                                            ))}
                                                </select>
                                                <p className="mt-1 text-xs text-neutral-500">
                                                      {selectedRole?.roleType === 'team_leader'
                                                            ? 'Vai trò Tổ trưởng cần chọn một Tổ sinh hoạt.'
                                                            : selectedRole?.roleType === 'committee_head'
                                                                  ? 'Vai trò Trưởng ban cần chọn một Ban chuyên trách.'
                                                                  : 'Vai trò này cần xác định đơn vị phụ trách.'}
                                                </p>
                                          </div>
                                    )}

                                    <div className="md:col-span-2">
                                          <Label htmlFor="assignmentTitle">Chức danh hiển thị</Label>
                                          <Input
                                                id="assignmentTitle"
                                                value={formData.assignmentTitle}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            assignmentTitle: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Tổ trưởng Tổ 1, Trưởng ban truyền thông, Phó đời sống..."
                                          />
                                          <p className="mt-1 text-xs text-neutral-500">
                                                Tên này sẽ được hiển thị trên danh sách và sơ đồ tổ chức. Có thể sửa lại cho tự nhiên hơn tên vai trò gốc.
                                          </p>
                                    </div>

                                    <div>
                                          <Label htmlFor="residentId">Học viên *</Label>
                                          <select
                                                id="residentId"
                                                value={formData.residentId}
                                                onChange={(event) =>
                                                      setFormData({ ...formData, residentId: event.target.value })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                required
                                          >
                                                <option value="">
                                                      {membersLoading ? 'Đang tải học viên...' : 'Chọn học viên'}
                                                </option>
                                                {members.map((member: any) => (
                                                      <option key={member.id} value={String(member.id)}>
                                                            {member.fullName} · {getResidentCode(member)} ·{' '}
                                                            {getRoomLabelFromMember(member)}
                                                      </option>
                                                ))}
                                          </select>

                                          {editingAssignment && (
                                                <p className="mt-1 text-xs text-orange-600">
                                                      Khi thay đổi học viên, hệ thống sẽ kiểm tra lại quy tắc phân
                                                      công của vai trò đang chọn.
                                                </p>
                                          )}
                                    </div>

                                    <div>
                                          <Label htmlFor="status">Trạng thái</Label>
                                          <select
                                                id="status"
                                                value={formData.status}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            status: event.target.value as AssignmentStatus,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="active">Đang đảm nhiệm</option>
                                                <option value="ended">Đã kết thúc</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                                          <Input
                                                id="startDate"
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(event) =>
                                                      setFormData({ ...formData, startDate: event.target.value })
                                                }
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="endDate">Ngày kết thúc</Label>
                                          <Input
                                                id="endDate"
                                                type="date"
                                                value={formData.endDate}
                                                onChange={(event) =>
                                                      setFormData({ ...formData, endDate: event.target.value })
                                                }
                                          />
                                    </div>
                              </div>

                              <div>
                                    <Label htmlFor="notes">Ghi chú</Label>
                                    <Textarea
                                          id="notes"
                                          value={formData.notes}
                                          onChange={(event) =>
                                                setFormData({ ...formData, notes: event.target.value })
                                          }
                                          placeholder="Ghi chú thêm về phân công nếu có"
                                          className="min-h-24"
                                    />
                              </div>

                              <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                          type="button"
                                          onClick={onClose}
                                          className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                                    >
                                          Hủy
                                    </button>

                                    <button
                                          type="submit"
                                          disabled={isSubmitting}
                                          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                          {submitText}
                                    </button>
                              </div>
                        </form>
                  </div>
            </div>
      );
}


function OrganizationChartHeader({
      termName,
      isActive,
      assignmentCount,
}: {
      termName: string;
      isActive: boolean;
      assignmentCount: number;
}) {
      return (
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-sky-50/70 px-5 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                                    Nhiệm kỳ tổ chức
                              </p>
                              <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-950">
                                    {termName}
                              </h2>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                                    {assignmentCount} phân công
                              </span>
                              <span className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${isActive
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-sky-200 bg-sky-50 text-sky-700'
                                    }`}>
                                    {isActive ? 'Đang hoạt động' : 'Đang xem'}
                              </span>
                        </div>
                  </div>
            </div>
      );
}

function SectionCaption({
      label,
      tone = 'slate',
}: {
      label: string;
      tone?: 'sky' | 'indigo' | 'violet' | 'slate';
}) {
      const dotClass =
            tone === 'sky'
                  ? 'bg-sky-600 shadow-[0_0_0_4px_rgba(14,165,233,0.12)]'
                  : tone === 'indigo'
                        ? 'bg-indigo-600 shadow-[0_0_0_4px_rgba(79,70,229,0.10)]'
                        : tone === 'violet'
                              ? 'bg-violet-600 shadow-[0_0_0_4px_rgba(124,58,237,0.10)]'
                              : 'bg-slate-700 shadow-[0_0_0_4px_rgba(15,23,42,0.08)]';

      return (
            <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
                        {label}
                  </span>
            </div>
      );
}

function OrganizationConnector() {
      return (
            <div className="flex items-center justify-center">
                  <div className="h-5 w-px bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200" />
            </div>
      );
}

function OrganizationUnitGroup({
      title,
      count,
      type,
      children,
}: {
      title: string;
      count: number;
      type: 'team' | 'committee' | 'other';
      children: React.ReactNode;
}) {
      const isTeam = type === 'team';
      const isCommittee = type === 'committee';

      return (
            <div className="rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-[0_12px_30px_rgba(15,23,42,0.07)] backdrop-blur-sm">
                  <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                              <span className={`flex h-8 w-8 items-center justify-center rounded-2xl ${isTeam
                                    ? 'bg-sky-50 text-sky-700'
                                    : isCommittee
                                          ? 'bg-violet-50 text-violet-700'
                                          : 'bg-slate-100 text-slate-700'
                                    }`}>
                                    {isTeam ? (
                                          <Boxes className="h-4 w-4" />
                                    ) : isCommittee ? (
                                          <LayoutGrid className="h-4 w-4" />
                                    ) : (
                                          <Users className="h-4 w-4" />
                                    )}
                              </span>
                              <div>
                                    <p className="text-sm font-bold text-slate-900">{title}</p>
                                    <p className="text-[11px] text-slate-500">
                                          {isTeam
                                                ? 'Theo từng tổ sinh hoạt'
                                                : isCommittee
                                                      ? 'Theo từng ban phụ trách'
                                                      : 'Các phân công bổ sung'}
                                    </p>
                              </div>
                        </div>

                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${isTeam
                              ? 'bg-sky-50 text-sky-700'
                              : isCommittee
                                    ? 'bg-violet-50 text-violet-700'
                                    : 'bg-slate-100 text-slate-700'
                              }`}>
                              {count}
                        </span>
                  </div>

                  <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                        {children}
                  </div>
            </div>
      );
}

function OrganizationPersonCard({
      assignment,
      variant = 'unit',
}: {
      assignment: OrganizationAssignment;
      variant?: 'head' | 'support' | 'unit';
}) {
      const cardClass =
            variant === 'head'
                  ? 'border-sky-200/90 bg-gradient-to-br from-white via-white to-sky-50/80 shadow-[0_14px_30px_rgba(14,165,233,0.14)]'
                  : variant === 'support'
                        ? 'border-indigo-200/80 bg-gradient-to-br from-white via-white to-indigo-50/70 shadow-[0_10px_24px_rgba(79,70,229,0.10)]'
                        : 'border-slate-200 bg-gradient-to-br from-white to-slate-50/60 shadow-[0_8px_18px_rgba(15,23,42,0.06)]';

      const iconClass =
            variant === 'head'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : variant === 'support'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600';

      const Icon = variant === 'head' ? Crown : variant === 'support' ? UserRound : Users;

      return (
            <div className={`group rounded-2xl border ${cardClass} px-3 py-2.5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg`}>
                  <div className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
                              <Icon className="h-3.5 w-3.5" />
                        </div>

                        <div className="min-w-0 flex-1">
                              <div className="flex min-w-0 items-center gap-2">
                                    <p className="truncate text-sm font-bold leading-5 tracking-tight text-slate-950">
                                          {getAssignmentDisplayTitle(assignment)}
                                    </p>

                                    {getUnitLabelFromAssignment(assignment) && (
                                          <span className="hidden shrink-0 rounded-full border border-slate-200 bg-white/85 px-2 py-0.5 text-[10px] font-semibold text-slate-600 shadow-sm sm:inline-flex">
                                                {getUnitLabelFromAssignment(assignment)}
                                          </span>
                                    )}
                              </div>

                              <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                                    <span className="truncate font-medium text-slate-700">
                                          {assignment.residentName || '-'}
                                    </span>

                                    <span className="text-slate-300">·</span>

                                    <span className="truncate">
                                          {getRoomLabelFromAssignment(assignment)}
                                    </span>
                              </div>
                        </div>
                  </div>
            </div>
      );
}

function OrganizationEmptySlot({ label }: { label: string }) {
      return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-3 py-2.5 text-center text-xs font-medium text-slate-400">
                  {label}
            </div>
      );
}
