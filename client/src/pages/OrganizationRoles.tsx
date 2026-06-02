'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      CheckCircle2,
      Edit2,
      Layers,
      Plus,
      Search,
      ShieldCheck,
      Trash2,
      Users,
      X,
} from 'lucide-react';

import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfigurableStatCard } from '@/components/configurable/ConfigurableStatCard';
import {
      ConfigurableColumn,
      ConfigurableDataTable,
} from '@/components/configurable/ConfigurableDataTable';

type RoleCategory =
      | 'management'
      | 'room'
      | 'liturgy'
      | 'academic'
      | 'activity'
      | 'finance'
      | 'discipline'
      | 'life'
      | 'other';

type RoleType =
      | 'head'
      | 'deputy'
      | 'secretary'
      | 'treasurer'
      | 'team_leader'
      | 'committee_head'
      | 'custom';

type OrganizationRole = {
      id: number;
      code: string;
      name: string;
      category: RoleCategory;
      description?: string | null;
      allowMultipleMembers: boolean;
      isActive: boolean;
      sortOrder: number;
      assignedCount?: number;

      level?: number;
      roleType?: RoleType | string;
      minAssignees?: number;
      maxAssignees?: number | null;
      isSystem?: boolean;
      requiresUnit?: boolean;
};

type RoleFormData = {
      code: string;
      name: string;
      category: RoleCategory;
      description: string;
      allowMultipleMembers: boolean;
      isActive: boolean;
      sortOrder: string;

      level: string;
      roleType: RoleType;
      minAssignees: string;
      maxAssignees: string;
      requiresUnit: boolean;
};

const defaultFormData: RoleFormData = {
      code: '',
      name: '',
      category: 'management',
      description: '',
      allowMultipleMembers: false,
      isActive: true,
      sortOrder: '1',

      level: '3',
      roleType: 'custom',
      minAssignees: '0',
      maxAssignees: '',
      requiresUnit: false,
};

const systemRoleCodes = [
      'TRUONG_NHA',
      'PHO',
      'THU_KY',
      'THU_QUY',
      'TO_TRUONG',
      'TRUONG_BAN',
];

function normalizeText(value?: string | null) {
      return (value || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ');
}

function normalizeRoleCode(value: string) {
      return value
            .trim()
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
}

function getCategoryLabel(category: RoleCategory) {
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

function getCategoryClass(category: RoleCategory) {
      if (category === 'management') {
            return 'border-blue-200 bg-blue-50 text-blue-700';
      }

      if (category === 'room') {
            return 'border-green-200 bg-green-50 text-green-700';
      }

      if (category === 'liturgy') {
            return 'border-purple-200 bg-purple-50 text-purple-700';
      }

      if (category === 'academic') {
            return 'border-indigo-200 bg-indigo-50 text-indigo-700';
      }

      if (category === 'activity') {
            return 'border-orange-200 bg-orange-50 text-orange-700';
      }

      if (category === 'finance') {
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      }

      if (category === 'discipline') {
            return 'border-red-200 bg-red-50 text-red-700';
      }

      if (category === 'life') {
            return 'border-pink-200 bg-pink-50 text-pink-700';
      }

      return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

function getRoleTypeLabel(roleType?: string | null) {
      if (roleType === 'head') return 'Trưởng';
      if (roleType === 'deputy') return 'Phó';
      if (roleType === 'secretary') return 'Thư ký';
      if (roleType === 'treasurer') return 'Thủ quỹ';
      if (roleType === 'team_leader') return 'Tổ trưởng';
      if (roleType === 'committee_head') return 'Trưởng ban';
      return 'Khác';
}

function getRoleTypeClass(roleType?: string | null) {
      if (roleType === 'head') return 'border-red-200 bg-red-50 text-red-700';
      if (roleType === 'deputy') return 'border-orange-200 bg-orange-50 text-orange-700';
      if (roleType === 'secretary') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (roleType === 'treasurer') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      if (roleType === 'team_leader') return 'border-purple-200 bg-purple-50 text-purple-700';
      if (roleType === 'committee_head') return 'border-indigo-200 bg-indigo-50 text-indigo-700';
      return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

function getLevelLabel(level?: number | null) {
      if (level === 1) return 'LV1';
      if (level === 2) return 'LV2';
      if (level === 3) return 'LV3';
      return 'LV3';
}

function getAssigneeRuleLabel(role: OrganizationRole) {
      if (role.maxAssignees && role.maxAssignees > 0) {
            return `Tối đa ${role.maxAssignees} người`;
      }

      return role.allowMultipleMembers ? 'Nhiều người' : 'Một người';
}

function getDefaultRuleByRoleType(roleType: RoleType) {
      if (roleType === 'head') {
            return {
                  category: 'management' as RoleCategory,
                  level: '1',
                  minAssignees: '1',
                  maxAssignees: '1',
                  allowMultipleMembers: false,
                  requiresUnit: false,
            };
      }

      if (roleType === 'deputy') {
            return {
                  category: 'management' as RoleCategory,
                  level: '2',
                  minAssignees: '1',
                  maxAssignees: '2',
                  allowMultipleMembers: true,
                  requiresUnit: false,
            };
      }

      if (roleType === 'secretary') {
            return {
                  category: 'management' as RoleCategory,
                  level: '2',
                  minAssignees: '1',
                  maxAssignees: '1',
                  allowMultipleMembers: false,
                  requiresUnit: false,
            };
      }

      if (roleType === 'treasurer') {
            return {
                  category: 'finance' as RoleCategory,
                  level: '2',
                  minAssignees: '1',
                  maxAssignees: '1',
                  allowMultipleMembers: false,
                  requiresUnit: false,
            };
      }

      if (roleType === 'team_leader') {
            return {
                  category: 'life' as RoleCategory,
                  level: '3',
                  minAssignees: '0',
                  maxAssignees: '',
                  allowMultipleMembers: true,
                  requiresUnit: true,
            };
      }

      if (roleType === 'committee_head') {
            return {
                  category: 'activity' as RoleCategory,
                  level: '3',
                  minAssignees: '0',
                  maxAssignees: '',
                  allowMultipleMembers: true,
                  requiresUnit: true,
            };
      }

      return {
            category: 'other' as RoleCategory,
            level: '3',
            minAssignees: '0',
            maxAssignees: '',
            allowMultipleMembers: true,
            requiresUnit: false,
      };
}

function isSystemRole(role: OrganizationRole | null) {
      if (!role) return false;
      return Boolean(role.isSystem) || systemRoleCodes.includes(role.code);
}

function validateRoleForm({
      roles,
      formData,
      editingId,
}: {
      roles: OrganizationRole[];
      formData: RoleFormData;
      editingId?: number;
}) {
      const code = normalizeRoleCode(formData.code);
      const name = normalizeText(formData.name);

      if (!code) return 'Vui lòng nhập mã vai trò.';
      if (!name) return 'Vui lòng nhập tên vai trò.';

      const sortOrder = Number(formData.sortOrder);

      if (!Number.isFinite(sortOrder) || sortOrder < 0) {
            return 'Thứ tự hiển thị phải là số lớn hơn hoặc bằng 0.';
      }

      const level = Number(formData.level);

      if (!Number.isFinite(level) || level < 1 || level > 3) {
            return 'Cấp vai trò phải nằm trong khoảng LV1 đến LV3.';
      }

      const minAssignees = Number(formData.minAssignees || 0);

      if (!Number.isFinite(minAssignees) || minAssignees < 0) {
            return 'Số người tối thiểu phải là số lớn hơn hoặc bằng 0.';
      }

      if (formData.maxAssignees.trim()) {
            const maxAssignees = Number(formData.maxAssignees);

            if (!Number.isFinite(maxAssignees) || maxAssignees < 1) {
                  return 'Số người tối đa phải là số lớn hơn 0 hoặc để trống.';
            }

            if (maxAssignees < minAssignees) {
                  return 'Số người tối đa không được nhỏ hơn số người tối thiểu.';
            }
      }

      if (
            (formData.roleType === 'team_leader' ||
                  formData.roleType === 'committee_head') &&
            !formData.requiresUnit
      ) {
            return 'Vai trò Tổ trưởng hoặc Trưởng ban cần chọn yêu cầu Tổ/Ban.';
      }

      const otherRoles = roles.filter((role) => role.id !== editingId);

      const duplicatedCode = otherRoles.some(
            (role) => normalizeText(role.code) === normalizeText(code)
      );

      if (duplicatedCode) {
            return 'Mã vai trò đã tồn tại. Vui lòng nhập mã khác.';
      }

      const duplicatedName = otherRoles.some(
            (role) => normalizeText(role.name) === name
      );

      if (duplicatedName) {
            return 'Tên vai trò đã tồn tại. Vui lòng nhập tên khác.';
      }

      return null;
}

export default function OrganizationRoles() {
      const [searchTerm, setSearchTerm] = useState('');
      const [categoryFilter, setCategoryFilter] = useState<'all' | RoleCategory>(
            'all'
      );
      const [statusFilter, setStatusFilter] = useState<
            'all' | 'active' | 'inactive'
      >('all');

      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingRole, setEditingRole] = useState<OrganizationRole | null>(null);
      const [formData, setFormData] = useState<RoleFormData>(defaultFormData);
      const [error, setError] = useState<string | null>(null);

      const rolesQuery = trpc.organization.listRoles.useQuery({
            search: searchTerm || undefined,
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
            isActive:
                  statusFilter === 'active'
                        ? true
                        : statusFilter === 'inactive'
                              ? false
                              : undefined,
            limit: 500,
            offset: 0,
      });

      const createRoleMutation = trpc.organization.createRole.useMutation();
      const updateRoleMutation = trpc.organization.updateRole.useMutation();
      const deleteRoleMutation = trpc.organization.deleteRole.useMutation();
      const toggleRoleActiveMutation =
            trpc.organization.toggleRoleActive.useMutation();

      const roles = (rolesQuery.data || []) as OrganizationRole[];

      const stats = useMemo(() => {
            return {
                  total: roles.length,
                  active: roles.filter((role) => role.isActive).length,
                  system: roles.filter((role) => isSystemRole(role)).length,
                  unitRequired: roles.filter((role) => role.requiresUnit).length,
            };
      }, [roles]);

      const refetchRoles = () => {
            rolesQuery.refetch();
      };

      const openCreateForm = () => {
            setEditingRole(null);
            setFormData({
                  ...defaultFormData,
                  sortOrder: String(
                        Math.max(...roles.map((role) => Number(role.sortOrder || 0)), 0) + 1
                  ),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const openEditForm = (role: OrganizationRole) => {
            setEditingRole(role);
            setFormData({
                  code: role.code || '',
                  name: role.name || '',
                  category: role.category || 'other',
                  description: role.description || '',
                  allowMultipleMembers: Boolean(role.allowMultipleMembers),
                  isActive: Boolean(role.isActive),
                  sortOrder: String(role.sortOrder ?? 0),

                  level: String(role.level ?? 3),
                  roleType: (role.roleType as RoleType) || 'custom',
                  minAssignees: String(role.minAssignees ?? 0),
                  maxAssignees:
                        role.maxAssignees === null || role.maxAssignees === undefined
                              ? ''
                              : String(role.maxAssignees),
                  requiresUnit: Boolean(role.requiresUnit),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const closeForm = () => {
            setIsFormOpen(false);
            setEditingRole(null);
            setFormData(defaultFormData);
            setError(null);
      };

      const handleSave = async () => {
            const validationMessage = validateRoleForm({
                  roles,
                  formData,
                  editingId: editingRole?.id,
            });

            if (validationMessage) {
                  setError(validationMessage);
                  return;
            }

            const maxAssignees = formData.maxAssignees.trim()
                  ? Number(formData.maxAssignees)
                  : null;

            const payload = {
                  code: normalizeRoleCode(formData.code),
                  name: formData.name.trim(),
                  category: formData.category,
                  description: formData.description.trim() || null,
                  allowMultipleMembers: formData.allowMultipleMembers,
                  isActive: formData.isActive,
                  sortOrder: Number(formData.sortOrder),

                  level: Number(formData.level),
                  roleType: formData.roleType,
                  minAssignees: Number(formData.minAssignees || 0),
                  maxAssignees,
                  requiresUnit: formData.requiresUnit,
            };

            try {
                  if (editingRole) {
                        await updateRoleMutation.mutateAsync({
                              id: editingRole.id,
                              ...payload,
                        });
                  } else {
                        await createRoleMutation.mutateAsync(payload);
                  }

                  closeForm();
                  refetchRoles();
            } catch (err: any) {
                  setError(err.message || 'Lỗi khi lưu vai trò tổ chức.');
            }
      };

      const handleToggleActive = async (role: OrganizationRole) => {
            if ((role.assignedCount || 0) > 0 && role.isActive) {
                  alert(
                        'Vai trò này đang có nhân sự được gán. Không nên ngưng dùng trực tiếp. Vui lòng kết thúc phân công trước.'
                  );
                  return;
            }

            try {
                  await toggleRoleActiveMutation.mutateAsync({ id: role.id });
                  refetchRoles();
            } catch (err: any) {
                  setError(err.message || 'Lỗi khi cập nhật trạng thái vai trò.');
            }
      };

      const handleDelete = async (role: OrganizationRole) => {
            if (isSystemRole(role)) {
                  alert('Không thể xóa vai trò hệ thống.');
                  return;
            }

            if ((role.assignedCount || 0) > 0) {
                  alert(
                        'Không thể xóa vai trò đã có nhân sự trong cơ cấu tổ chức. Bạn có thể chuyển trạng thái sang Ngưng dùng sau khi kết thúc phân công.'
                  );
                  return;
            }

            if (!confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.name}"?`)) {
                  return;
            }

            try {
                  await deleteRoleMutation.mutateAsync({ id: role.id });
                  refetchRoles();
            } catch (err: any) {
                  setError(err.message || 'Lỗi khi xóa vai trò tổ chức.');
            }
      };

      const clearFilters = () => {
            setSearchTerm('');
            setCategoryFilter('all');
            setStatusFilter('all');
      };

      const columns = useMemo<ConfigurableColumn<OrganizationRole>[]>(
            () => [
                  {
                        key: 'role',
                        label: 'Vai trò',
                        sortable: true,
                        sortValue: (role) => role.name,
                        render: (role) => (
                              <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                          <p className="font-semibold text-neutral-900">{role.name}</p>
                                          {isSystemRole(role) && (
                                                <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                                                      Hệ thống
                                                </span>
                                          )}
                                    </div>
                                    <p className="mt-1 font-mono text-xs text-neutral-500">
                                          {role.code}
                                    </p>
                              </div>
                        ),
                  },
                  {
                        key: 'level',
                        label: 'Cấp',
                        sortable: true,
                        sortValue: (role) => role.level || 3,
                        render: (role) => (
                              <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                                    {getLevelLabel(role.level)}
                              </span>
                        ),
                  },
                  {
                        key: 'roleType',
                        label: 'Loại vai trò',
                        sortable: true,
                        sortValue: (role) => getRoleTypeLabel(role.roleType),
                        render: (role) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getRoleTypeClass(
                                          role.roleType
                                    )}`}
                              >
                                    {getRoleTypeLabel(role.roleType)}
                              </span>
                        ),
                  },
                  {
                        key: 'category',
                        label: 'Nhóm',
                        sortable: true,
                        sortValue: (role) => getCategoryLabel(role.category),
                        render: (role) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getCategoryClass(
                                          role.category
                                    )}`}
                              >
                                    {getCategoryLabel(role.category)}
                              </span>
                        ),
                  },
                  {
                        key: 'allowMultipleMembers',
                        label: 'Số người',
                        sortable: true,
                        sortValue: (role) => role.maxAssignees || (role.allowMultipleMembers ? 999 : 1),
                        render: (role) => (
                              <div>
                                    <p className="text-sm font-medium text-neutral-800">
                                          {getAssigneeRuleLabel(role)}
                                    </p>
                                    <p className="mt-1 text-xs text-neutral-500">
                                          Tối thiểu {role.minAssignees ?? 0}
                                    </p>
                              </div>
                        ),
                  },
                  {
                        key: 'requiresUnit',
                        label: 'Tổ/Ban',
                        sortable: true,
                        sortValue: (role) => (role.requiresUnit ? 1 : 0),
                        render: (role) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${role.requiresUnit
                                          ? 'border-purple-200 bg-purple-50 text-purple-700'
                                          : 'border-neutral-200 bg-neutral-50 text-neutral-600'
                                          }`}
                              >
                                    {role.requiresUnit ? 'Bắt buộc' : 'Không'}
                              </span>
                        ),
                  },
                  {
                        key: 'assignedCount',
                        label: 'Đang gán',
                        sortable: true,
                        sortValue: (role) => role.assignedCount || 0,
                        render: (role) => (
                              <span className="font-semibold text-neutral-800">
                                    {role.assignedCount || 0}
                              </span>
                        ),
                  },
                  {
                        key: 'sortOrder',
                        label: 'Thứ tự',
                        sortable: true,
                        sortValue: (role) => role.sortOrder || 0,
                        render: (role) => role.sortOrder || 0,
                  },
                  {
                        key: 'status',
                        label: 'Trạng thái',
                        sortable: true,
                        sortValue: (role) => (role.isActive ? 'active' : 'inactive'),
                        render: (role) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${role.isActive
                                          ? 'border-green-200 bg-green-50 text-green-700'
                                          : 'border-neutral-200 bg-neutral-100 text-neutral-600'
                                          }`}
                              >
                                    {role.isActive ? 'Đang dùng' : 'Ngưng dùng'}
                              </span>
                        ),
                  },
                  {
                        key: 'description',
                        label: 'Mô tả',
                        defaultVisible: false,
                        sortable: true,
                        sortValue: (role) => role.description || '',
                        render: (role) => role.description || '-',
                  },
                  {
                        key: 'actions',
                        label: 'Hành động',
                        className: 'min-w-[230px]',
                        render: (role) => (
                              <div className="flex flex-wrap items-center gap-1.5">
                                    <button
                                          type="button"
                                          onClick={() => handleToggleActive(role)}
                                          disabled={toggleRoleActiveMutation.isPending}
                                          className={`rounded-lg px-2 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${role.isActive
                                                ? 'text-orange-700 hover:bg-orange-50'
                                                : 'text-green-700 hover:bg-green-50'
                                                }`}
                                          title={role.isActive ? 'Ngưng dùng vai trò' : 'Kích hoạt vai trò'}
                                    >
                                          {role.isActive ? 'Ngưng' : 'Kích hoạt'}
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => openEditForm(role)}
                                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                          title="Sửa vai trò"
                                    >
                                          <Edit2 className="h-4 w-4" />
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => handleDelete(role)}
                                          disabled={deleteRoleMutation.isPending || isSystemRole(role)}
                                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                          title={
                                                isSystemRole(role)
                                                      ? 'Vai trò hệ thống không thể xóa'
                                                      : 'Xóa vai trò'
                                          }
                                    >
                                          <Trash2 className="h-4 w-4" />
                                    </button>
                              </div>
                        ),
                  },
            ],
            [toggleRoleActiveMutation.isPending, deleteRoleMutation.isPending]
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
                                          Vai trò / Chức danh
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                                          Quản lý các vai trò trong cơ cấu tổ chức lưu xá, bao gồm cấp bậc, loại vai trò và quy tắc phân công theo từng nhiệm kỳ.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={openCreateForm}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                              >
                                    <Plus className="h-4 w-4" />
                                    Thêm vai trò
                              </button>
                        </div>

                        {(error || rolesQuery.error) && (
                              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <div className="flex gap-3">
                                          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                          <div>
                                                <p className="font-semibold">Có lỗi khi xử lý vai trò.</p>
                                                <p className="mt-1 text-sm">
                                                      {error ||
                                                            rolesQuery.error?.message ||
                                                            'Vui lòng kiểm tra lại dữ liệu và thử lại.'}
                                                </p>
                                          </div>
                                    </div>
                              </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                              <ConfigurableStatCard
                                    moduleKey="organization"
                                    cardKey="organization.roles.total"
                                    label="Tổng vai trò"
                                    value={stats.total}
                                    description="Tổng số vai trò đã khai báo"
                                    tone="blue"
                                    icon={<Layers className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="organization"
                                    cardKey="organization.roles.active"
                                    label="Đang dùng"
                                    value={stats.active}
                                    description="Vai trò còn hiệu lực"
                                    tone="green"
                                    icon={<CheckCircle2 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="organization"
                                    cardKey="organization.roles.system"
                                    label="Vai trò cố định"
                                    value={stats.system}
                                    description="Vai trò nền của cơ cấu"
                                    tone="orange"
                                    icon={<ShieldCheck className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="organization"
                                    cardKey="organization.roles.unitRequired"
                                    label="Theo Tổ/Ban"
                                    value={stats.unitRequired}
                                    description="Vai trò cần chọn đơn vị phụ trách"
                                    tone="purple"
                                    icon={<Users className="h-6 w-6" />}
                              />
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_220px_220px_auto]">
                                    <div className="relative">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                          <Input
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                placeholder="Tìm theo mã hoặc tên vai trò..."
                                                className="pl-10"
                                          />
                                    </div>

                                    <select
                                          value={categoryFilter}
                                          onChange={(event) =>
                                                setCategoryFilter(event.target.value as 'all' | RoleCategory)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả nhóm</option>
                                          <option value="management">Quản lý chung</option>
                                          <option value="room">Phòng ở</option>
                                          <option value="liturgy">Phụng vụ</option>
                                          <option value="academic">Học vụ</option>
                                          <option value="activity">Sinh hoạt</option>
                                          <option value="finance">Tài chính</option>
                                          <option value="discipline">Kỷ luật</option>
                                          <option value="life">Đời sống</option>
                                          <option value="other">Khác</option>
                                    </select>

                                    <select
                                          value={statusFilter}
                                          onChange={(event) =>
                                                setStatusFilter(
                                                      event.target.value as 'all' | 'active' | 'inactive'
                                                )
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả trạng thái</option>
                                          <option value="active">Đang dùng</option>
                                          <option value="inactive">Ngưng dùng</option>
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
                              tableKey="organization.roles"
                              columns={columns}
                              data={roles}
                              getRowKey={(role) => role.id}
                              isLoading={rolesQuery.isLoading}
                              loadingText="Đang tải danh sách vai trò..."
                              emptyTitle="Không có vai trò nào"
                              emptyDescription="Thử thay đổi bộ lọc hoặc thêm vai trò mới."
                        />

                        {isFormOpen && (
                              <RoleFormModal
                                    title={editingRole ? 'Cập nhật vai trò' : 'Thêm vai trò'}
                                    formData={formData}
                                    setFormData={setFormData}
                                    error={error}
                                    onClose={closeForm}
                                    onSubmit={handleSave}
                                    submitText={
                                          editingRole
                                                ? updateRoleMutation.isPending
                                                      ? 'Đang cập nhật...'
                                                      : 'Cập nhật'
                                                : createRoleMutation.isPending
                                                      ? 'Đang thêm...'
                                                      : 'Thêm vai trò'
                                    }
                                    isSubmitting={
                                          createRoleMutation.isPending || updateRoleMutation.isPending
                                    }
                                    editingRole={editingRole}
                              />
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}

function RoleFormModal({
      title,
      formData,
      setFormData,
      error,
      onClose,
      onSubmit,
      submitText,
      isSubmitting,
      editingRole,
}: {
      title: string;
      formData: RoleFormData;
      setFormData: React.Dispatch<React.SetStateAction<RoleFormData>>;
      error: string | null;
      onClose: () => void;
      onSubmit: () => void;
      submitText: string;
      isSubmitting: boolean;
      editingRole: OrganizationRole | null;
}) {
      const systemRole = isSystemRole(editingRole);

      const handleRoleTypeChange = (roleType: RoleType) => {
            const defaultRule = getDefaultRuleByRoleType(roleType);

            setFormData({
                  ...formData,
                  roleType,
                  ...defaultRule,
            });
      };

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
                              <div>
                                    <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
                                    <p className="text-sm text-neutral-500">
                                          Khai báo vai trò, cấp bậc và quy tắc phân công trong cơ cấu tổ chức lưu xá.
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

                              {systemRole && (
                                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                                          Đây là vai trò cố định của cơ cấu lưu xá. Một số thông tin nền sẽ được giữ ổn định để đảm bảo quy tắc phân công.
                                    </div>
                              )}

                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                          <Label htmlFor="code">Mã vai trò</Label>
                                          <Input
                                                id="code"
                                                value={formData.code}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            code: normalizeRoleCode(event.target.value),
                                                      })
                                                }
                                                placeholder="VD: TRUONG_NHA"
                                                disabled={systemRole}
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="name">Tên vai trò</Label>
                                          <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(event) =>
                                                      setFormData({ ...formData, name: event.target.value })
                                                }
                                                placeholder="VD: Trưởng nhà"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="roleType">Loại vai trò</Label>
                                          <select
                                                id="roleType"
                                                value={formData.roleType}
                                                onChange={(event) =>
                                                      handleRoleTypeChange(event.target.value as RoleType)
                                                }
                                                disabled={systemRole}
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-neutral-100 disabled:text-neutral-500"
                                          >
                                                <option value="head">Trưởng</option>
                                                <option value="deputy">Phó</option>
                                                <option value="secretary">Thư ký</option>
                                                <option value="treasurer">Thủ quỹ</option>
                                                <option value="team_leader">Tổ trưởng</option>
                                                <option value="committee_head">Trưởng ban</option>
                                                <option value="custom">Khác</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="level">Cấp vai trò</Label>
                                          <select
                                                id="level"
                                                value={formData.level}
                                                onChange={(event) =>
                                                      setFormData({ ...formData, level: event.target.value })
                                                }
                                                disabled={systemRole}
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-neutral-100 disabled:text-neutral-500"
                                          >
                                                <option value="1">LV1 - Trưởng</option>
                                                <option value="2">LV2 - Phó / Thư ký / Thủ quỹ</option>
                                                <option value="3">LV3 - Tổ / Ban / Vai trò khác</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="category">Nhóm vai trò</Label>
                                          <select
                                                id="category"
                                                value={formData.category}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            category: event.target.value as RoleCategory,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="management">Quản lý chung</option>
                                                <option value="room">Phòng ở</option>
                                                <option value="liturgy">Phụng vụ</option>
                                                <option value="academic">Học vụ</option>
                                                <option value="activity">Sinh hoạt</option>
                                                <option value="finance">Tài chính</option>
                                                <option value="discipline">Kỷ luật</option>
                                                <option value="life">Đời sống</option>
                                                <option value="other">Khác</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
                                          <Input
                                                id="sortOrder"
                                                type="number"
                                                min={0}
                                                value={formData.sortOrder}
                                                onChange={(event) =>
                                                      setFormData({ ...formData, sortOrder: event.target.value })
                                                }
                                                placeholder="VD: 10"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="minAssignees">Số người tối thiểu</Label>
                                          <Input
                                                id="minAssignees"
                                                type="number"
                                                min={0}
                                                value={formData.minAssignees}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            minAssignees: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: 1"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="maxAssignees">Số người tối đa</Label>
                                          <Input
                                                id="maxAssignees"
                                                type="number"
                                                min={1}
                                                value={formData.maxAssignees}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            maxAssignees: event.target.value,
                                                            allowMultipleMembers:
                                                                  !event.target.value || Number(event.target.value) > 1,
                                                      })
                                                }
                                                placeholder="Để trống nếu không giới hạn"
                                          />
                                    </div>

                                    <div>
                                          <Label>Trạng thái</Label>
                                          <div className="mt-2 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                                                <input
                                                      id="isActive"
                                                      type="checkbox"
                                                      checked={formData.isActive}
                                                      onChange={(event) =>
                                                            setFormData({
                                                                  ...formData,
                                                                  isActive: event.target.checked,
                                                            })
                                                      }
                                                      className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div>
                                                      <Label htmlFor="isActive" className="cursor-pointer">
                                                            Đang sử dụng
                                                      </Label>
                                                      <p className="text-xs text-neutral-500">
                                                            Vai trò đang sử dụng sẽ được hiển thị trong danh sách phân công tổ chức.
                                                      </p>
                                                </div>
                                          </div>
                                    </div>

                                    <div>
                                          <Label>Yêu cầu Tổ/Ban</Label>
                                          <div className="mt-2 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                                                <input
                                                      id="requiresUnit"
                                                      type="checkbox"
                                                      checked={formData.requiresUnit}
                                                      onChange={(event) =>
                                                            setFormData({
                                                                  ...formData,
                                                                  requiresUnit: event.target.checked,
                                                            })
                                                      }
                                                      disabled={
                                                            formData.roleType === 'team_leader' ||
                                                            formData.roleType === 'committee_head'
                                                      }
                                                      className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                                                />
                                                <div>
                                                      <Label htmlFor="requiresUnit" className="cursor-pointer">
                                                            Khi phân công phải chọn Tổ/Ban
                                                      </Label>
                                                      <p className="text-xs text-neutral-500">
                                                            Áp dụng cho Tổ trưởng và Trưởng ban để xác định đơn vị phụ trách.
                                                      </p>
                                                </div>
                                          </div>
                                    </div>

                                    <div className="md:col-span-2">
                                          <Label>Quy tắc nhiều người</Label>
                                          <div className="mt-2 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                                                <input
                                                      id="allowMultipleMembers"
                                                      type="checkbox"
                                                      checked={formData.allowMultipleMembers}
                                                      onChange={(event) =>
                                                            setFormData({
                                                                  ...formData,
                                                                  allowMultipleMembers: event.target.checked,
                                                                  maxAssignees: event.target.checked
                                                                        ? formData.maxAssignees
                                                                        : '1',
                                                            })
                                                      }
                                                      className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div>
                                                      <Label
                                                            htmlFor="allowMultipleMembers"
                                                            className="cursor-pointer"
                                                      >
                                                            Cho phép nhiều người cùng vai trò
                                                      </Label>
                                                      <p className="text-xs text-neutral-500">
                                                            Dùng cho vai trò có thể có nhiều học viên cùng đảm nhiệm trong một nhiệm kỳ.
                                                      </p>
                                                </div>
                                          </div>
                                    </div>

                                    {editingRole && (
                                          <div>
                                                <Label>Số nhân sự đang gán</Label>
                                                <div className="flex h-10 items-center rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm font-semibold text-neutral-700">
                                                      {editingRole.assignedCount || 0}
                                                </div>
                                          </div>
                                    )}
                              </div>

                              <div>
                                    <Label htmlFor="description">Mô tả / ghi chú</Label>
                                    <Textarea
                                          id="description"
                                          value={formData.description}
                                          onChange={(event) =>
                                                setFormData({ ...formData, description: event.target.value })
                                          }
                                          placeholder="Mô tả trách nhiệm hoặc phạm vi của vai trò"
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
