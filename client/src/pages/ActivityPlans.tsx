'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      CalendarDays,
      CheckCircle2,
      Clock,
      Edit2,
      Flag,
      ListChecks,
      Plus,
      Search,
      Target,
      Trash2,
      Users,
      X,
} from 'lucide-react';

import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfigurableStatCard } from '@/components/configurable/ConfigurableStatCard';
import {
      ConfigurableColumn,
      ConfigurableDataTable,
} from '@/components/configurable/ConfigurableDataTable';

type ActivityPlanStatus = 'draft' | 'planned' | 'in_progress' | 'completed' | 'cancelled';
type ActivityPlanType =
      | 'annual'
      | 'monthly'
      | 'community'
      | 'spiritual'
      | 'study'
      | 'volunteer'
      | 'culture'
      | 'other';

type ActivityPlan = {
      id: number;
      code: string;
      title: string;
      planType: ActivityPlanType;
      status: ActivityPlanStatus;
      startDate: string;
      endDate: string;
      ownerGroup: string;
      location: string;
      expectedParticipants: number;
      estimatedBudget: number;
      objective: string;
      note?: string | null;
      sortOrder: number;
};

type ActivityPlanFormData = {
      code: string;
      title: string;
      planType: ActivityPlanType;
      status: ActivityPlanStatus;
      startDate: string;
      endDate: string;
      ownerGroup: string;
      location: string;
      expectedParticipants: string;
      estimatedBudget: string;
      objective: string;
      note: string;
      sortOrder: string;
};

const initialPlans: ActivityPlan[] = [
      {
            id: 1,
            code: 'YEAR_PLAN_2026',
            title: 'Kế hoạch sinh hoạt năm 2026',
            planType: 'annual',
            status: 'planned',
            startDate: '2026-01-01',
            endDate: '2026-12-31',
            ownerGroup: 'Ban điều hành',
            location: 'Lưu xá',
            expectedParticipants: 80,
            estimatedBudget: 0,
            objective: 'Xây dựng định hướng sinh hoạt, học tập và đời sống chung cho toàn năm.',
            note: 'Kế hoạch tổng thể, các sự kiện chi tiết sẽ được tách theo từng tháng.',
            sortOrder: 10,
      },
      {
            id: 2,
            code: 'COMMUNITY_DAY_Q1',
            title: 'Ngày sinh hoạt cộng đoàn quý I',
            planType: 'community',
            status: 'planned',
            startDate: '2026-03-15',
            endDate: '2026-03-15',
            ownerGroup: 'Ban sinh hoạt',
            location: 'Sân sinh hoạt chung',
            expectedParticipants: 80,
            estimatedBudget: 2500000,
            objective: 'Tăng sự gắn kết giữa các học viên và củng cố tinh thần cộng đoàn.',
            note: '',
            sortOrder: 20,
      },
      {
            id: 3,
            code: 'STUDY_SUPPORT',
            title: 'Chương trình hỗ trợ học tập cuối kỳ',
            planType: 'study',
            status: 'in_progress',
            startDate: '2026-05-01',
            endDate: '2026-06-15',
            ownerGroup: 'Ban học tập',
            location: 'Phòng học chung',
            expectedParticipants: 40,
            estimatedBudget: 500000,
            objective: 'Hỗ trợ học viên ôn tập, chia nhóm học và theo dõi tiến độ cuối kỳ.',
            note: 'Ưu tiên các học viên cần hỗ trợ thêm.',
            sortOrder: 30,
      },
];

const defaultFormData: ActivityPlanFormData = {
      code: '',
      title: '',
      planType: 'community',
      status: 'planned',
      startDate: '',
      endDate: '',
      ownerGroup: '',
      location: '',
      expectedParticipants: '0',
      estimatedBudget: '0',
      objective: '',
      note: '',
      sortOrder: '10',
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

function normalizeText(value?: string | null) {
      return (value || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ');
}

function getPlanTypeLabel(type: ActivityPlanType) {
      if (type === 'annual') return 'Kế hoạch năm';
      if (type === 'monthly') return 'Kế hoạch tháng';
      if (type === 'community') return 'Sinh hoạt cộng đoàn';
      if (type === 'spiritual') return 'Đời sống thiêng liêng';
      if (type === 'study') return 'Học tập';
      if (type === 'volunteer') return 'Thiện nguyện';
      if (type === 'culture') return 'Văn hóa / Giao lưu';
      return 'Khác';
}

function getPlanTypeClass(type: ActivityPlanType) {
      if (type === 'annual') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (type === 'monthly') return 'border-sky-200 bg-sky-50 text-sky-700';
      if (type === 'community') return 'border-violet-200 bg-violet-50 text-violet-700';
      if (type === 'spiritual') return 'border-indigo-200 bg-indigo-50 text-indigo-700';
      if (type === 'study') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      if (type === 'volunteer') return 'border-orange-200 bg-orange-50 text-orange-700';
      if (type === 'culture') return 'border-pink-200 bg-pink-50 text-pink-700';
      return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

function getStatusLabel(status: ActivityPlanStatus) {
      if (status === 'draft') return 'Nháp';
      if (status === 'planned') return 'Đã lên kế hoạch';
      if (status === 'in_progress') return 'Đang thực hiện';
      if (status === 'completed') return 'Hoàn thành';
      return 'Đã hủy';
}

function getStatusClass(status: ActivityPlanStatus) {
      if (status === 'draft') return 'border-slate-200 bg-slate-50 text-slate-700';
      if (status === 'planned') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (status === 'in_progress') return 'border-amber-200 bg-amber-50 text-amber-700';
      if (status === 'completed') return 'border-green-200 bg-green-50 text-green-700';
      return 'border-red-200 bg-red-50 text-red-700';
}

function formatDate(value: string) {
      if (!value) return '-';

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) return value;

      return date.toLocaleDateString('vi-VN');
}

function formatDateRange(startDate: string, endDate: string) {
      if (!startDate && !endDate) return '-';
      if (startDate === endDate) return formatDate(startDate);

      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function formatCurrency(value: number) {
      return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
      }).format(value || 0);
}

function getNextId(items: ActivityPlan[]) {
      return Math.max(...items.map((item) => item.id), 0) + 1;
}

function getNextSortOrder(items: ActivityPlan[]) {
      return String(Math.max(...items.map((item) => Number(item.sortOrder || 0)), 0) + 10);
}

function validateForm({
      plans,
      formData,
      editingId,
}: {
      plans: ActivityPlan[];
      formData: ActivityPlanFormData;
      editingId?: number;
}) {
      const code = normalizeCode(formData.code);
      const title = formData.title.trim();

      if (!code) return 'Vui lòng nhập mã kế hoạch.';
      if (!title) return 'Vui lòng nhập tên kế hoạch.';
      if (!formData.startDate) return 'Vui lòng nhập ngày bắt đầu.';
      if (!formData.endDate) return 'Vui lòng nhập ngày kết thúc.';

      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            return 'Ngày bắt đầu hoặc ngày kết thúc không hợp lệ.';
      }

      if (endDate < startDate) {
            return 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu.';
      }

      const expectedParticipants = Number(formData.expectedParticipants || 0);

      if (!Number.isFinite(expectedParticipants) || expectedParticipants < 0) {
            return 'Số người dự kiến phải là số lớn hơn hoặc bằng 0.';
      }

      const estimatedBudget = Number(formData.estimatedBudget || 0);

      if (!Number.isFinite(estimatedBudget) || estimatedBudget < 0) {
            return 'Ngân sách dự kiến phải là số lớn hơn hoặc bằng 0.';
      }

      const sortOrder = Number(formData.sortOrder || 0);

      if (!Number.isFinite(sortOrder) || sortOrder < 0) {
            return 'Thứ tự hiển thị phải là số lớn hơn hoặc bằng 0.';
      }

      const duplicatedCode = plans
            .filter((plan) => plan.id !== editingId)
            .some((plan) => normalizeText(plan.code) === normalizeText(code));

      if (duplicatedCode) {
            return 'Mã kế hoạch đã tồn tại. Vui lòng nhập mã khác.';
      }

      return null;
}

export default function ActivityPlans() {
      const [plans, setPlans] = useState<ActivityPlan[]>(initialPlans);
      const [searchTerm, setSearchTerm] = useState('');
      const [typeFilter, setTypeFilter] = useState<'all' | ActivityPlanType>('all');
      const [statusFilter, setStatusFilter] = useState<'all' | ActivityPlanStatus>('all');
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingPlan, setEditingPlan] = useState<ActivityPlan | null>(null);
      const [formData, setFormData] = useState<ActivityPlanFormData>(defaultFormData);
      const [error, setError] = useState<string | null>(null);

      const filteredPlans = useMemo(() => {
            const keyword = normalizeText(searchTerm);

            return plans
                  .filter((plan) => {
                        if (typeFilter !== 'all' && plan.planType !== typeFilter) return false;
                        if (statusFilter !== 'all' && plan.status !== statusFilter) return false;

                        if (!keyword) return true;

                        const haystack = [
                              plan.code,
                              plan.title,
                              getPlanTypeLabel(plan.planType),
                              getStatusLabel(plan.status),
                              plan.ownerGroup,
                              plan.location,
                              plan.objective,
                              plan.note,
                        ]
                              .map((value) => normalizeText(value))
                              .join(' ');

                        return haystack.includes(keyword);
                  })
                  .sort((a, b) => {
                        const dateCompare =
                              new Date(a.startDate).getTime() - new Date(b.startDate).getTime();

                        if (dateCompare !== 0) return dateCompare;

                        return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
                  });
      }, [plans, searchTerm, typeFilter, statusFilter]);

      const stats = useMemo(() => {
            return {
                  total: plans.length,
                  planned: plans.filter((plan) => plan.status === 'planned').length,
                  inProgress: plans.filter((plan) => plan.status === 'in_progress').length,
                  completed: plans.filter((plan) => plan.status === 'completed').length,
            };
      }, [plans]);

      const openCreateForm = () => {
            setEditingPlan(null);
            setFormData({
                  ...defaultFormData,
                  sortOrder: getNextSortOrder(plans),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const openEditForm = (plan: ActivityPlan) => {
            setEditingPlan(plan);
            setFormData({
                  code: plan.code,
                  title: plan.title,
                  planType: plan.planType,
                  status: plan.status,
                  startDate: plan.startDate,
                  endDate: plan.endDate,
                  ownerGroup: plan.ownerGroup,
                  location: plan.location,
                  expectedParticipants: String(plan.expectedParticipants || 0),
                  estimatedBudget: String(plan.estimatedBudget || 0),
                  objective: plan.objective,
                  note: plan.note || '',
                  sortOrder: String(plan.sortOrder || 0),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const closeForm = () => {
            setIsFormOpen(false);
            setEditingPlan(null);
            setFormData(defaultFormData);
            setError(null);
      };

      const handleSave = () => {
            const validationMessage = validateForm({
                  plans,
                  formData,
                  editingId: editingPlan?.id,
            });

            if (validationMessage) {
                  setError(validationMessage);
                  return;
            }

            const payload: ActivityPlan = {
                  id: editingPlan?.id || getNextId(plans),
                  code: normalizeCode(formData.code),
                  title: formData.title.trim(),
                  planType: formData.planType,
                  status: formData.status,
                  startDate: formData.startDate,
                  endDate: formData.endDate,
                  ownerGroup: formData.ownerGroup.trim(),
                  location: formData.location.trim(),
                  expectedParticipants: Number(formData.expectedParticipants || 0),
                  estimatedBudget: Number(formData.estimatedBudget || 0),
                  objective: formData.objective.trim(),
                  note: formData.note.trim() || null,
                  sortOrder: Number(formData.sortOrder || 0),
            };

            if (editingPlan) {
                  setPlans((current) =>
                        current.map((plan) => (plan.id === editingPlan.id ? payload : plan))
                  );
            } else {
                  setPlans((current) => [...current, payload]);
            }

            closeForm();
      };

      const handleDelete = (plan: ActivityPlan) => {
            if (!confirm(`Bạn có chắc chắn muốn xóa kế hoạch "${plan.title}"?`)) {
                  return;
            }

            setPlans((current) => current.filter((item) => item.id !== plan.id));
      };

      const clearFilters = () => {
            setSearchTerm('');
            setTypeFilter('all');
            setStatusFilter('all');
      };

      const columns = useMemo<ConfigurableColumn<ActivityPlan>[]>(
            () => [
                  {
                        key: 'title',
                        label: 'Kế hoạch',
                        sortable: true,
                        sortValue: (plan) => plan.title,
                        render: (plan) => (
                              <div>
                                    <p className="font-semibold text-slate-900">{plan.title}</p>
                                    <p className="mt-1 font-mono text-xs text-slate-500">
                                          {plan.code}
                                    </p>
                              </div>
                        ),
                  },
                  {
                        key: 'planType',
                        label: 'Loại',
                        sortable: true,
                        sortValue: (plan) => getPlanTypeLabel(plan.planType),
                        render: (plan) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getPlanTypeClass(
                                          plan.planType
                                    )}`}
                              >
                                    {getPlanTypeLabel(plan.planType)}
                              </span>
                        ),
                  },
                  {
                        key: 'period',
                        label: 'Thời gian',
                        sortable: true,
                        sortValue: (plan) => plan.startDate,
                        render: (plan) => (
                              <div className="min-w-[150px]">
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                          <CalendarDays className="h-4 w-4 text-slate-500" />
                                          {formatDateRange(plan.startDate, plan.endDate)}
                                    </div>
                              </div>
                        ),
                  },
                  {
                        key: 'ownerGroup',
                        label: 'Phụ trách',
                        sortable: true,
                        sortValue: (plan) => plan.ownerGroup,
                        render: (plan) => plan.ownerGroup || '-',
                  },
                  {
                        key: 'participants',
                        label: 'Dự kiến',
                        sortable: true,
                        sortValue: (plan) => plan.expectedParticipants,
                        render: (plan) => `${plan.expectedParticipants || 0} người`,
                  },
                  {
                        key: 'budget',
                        label: 'Ngân sách',
                        sortable: true,
                        sortValue: (plan) => plan.estimatedBudget,
                        render: (plan) => formatCurrency(plan.estimatedBudget),
                  },
                  {
                        key: 'status',
                        label: 'Trạng thái',
                        sortable: true,
                        sortValue: (plan) => getStatusLabel(plan.status),
                        render: (plan) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                          plan.status
                                    )}`}
                              >
                                    {getStatusLabel(plan.status)}
                              </span>
                        ),
                  },
                  {
                        key: 'objective',
                        label: 'Mục tiêu',
                        defaultVisible: false,
                        sortable: true,
                        sortValue: (plan) => plan.objective,
                        render: (plan) => plan.objective || '-',
                  },
                  {
                        key: 'actions',
                        label: 'Hành động',
                        className: 'min-w-[140px]',
                        render: (plan) => (
                              <div className="flex items-center gap-1.5">
                                    <button
                                          type="button"
                                          onClick={() => openEditForm(plan)}
                                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                          title="Sửa kế hoạch"
                                    >
                                          <Edit2 className="h-4 w-4" />
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => handleDelete(plan)}
                                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                          title="Xóa kế hoạch"
                                    >
                                          <Trash2 className="h-4 w-4" />
                                    </button>
                              </div>
                        ),
                  },
            ],
            []
      );

      return (
            <ResidenceCareLayout>
                  <div className="space-y-6 p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                    <p className="text-sm font-semibold text-blue-600">
                                          Sinh hoạt & Đời sống
                                    </p>
                                    <h1 className="mt-1 text-3xl font-bold text-neutral-900">
                                          Kế hoạch năm
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                                          Quản lý các kế hoạch sinh hoạt, học tập, phụng vụ, thiện nguyện và sự kiện lớn trong năm của lưu xá.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={openCreateForm}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                              >
                                    <Plus className="h-4 w-4" />
                                    Thêm kế hoạch
                              </button>
                        </div>

                        {error && (
                              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <div className="flex gap-3">
                                          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                          <div>
                                                <p className="font-semibold">
                                                      Có lỗi khi xử lý kế hoạch.
                                                </p>
                                                <p className="mt-1 text-sm">{error}</p>
                                          </div>
                                    </div>
                              </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                              <ConfigurableStatCard
                                    moduleKey="activityPlans"
                                    cardKey="activityPlans.total"
                                    label="Tổng kế hoạch"
                                    value={stats.total}
                                    description="Tổng số kế hoạch đã khai báo"
                                    tone="blue"
                                    icon={<ListChecks className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="activityPlans"
                                    cardKey="activityPlans.planned"
                                    label="Đã lên kế hoạch"
                                    value={stats.planned}
                                    description="Kế hoạch đã được chuẩn bị"
                                    tone="green"
                                    icon={<CheckCircle2 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="activityPlans"
                                    cardKey="activityPlans.inProgress"
                                    label="Đang thực hiện"
                                    value={stats.inProgress}
                                    description="Hoạt động đang triển khai"
                                    tone="orange"
                                    icon={<Clock className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="activityPlans"
                                    cardKey="activityPlans.completed"
                                    label="Hoàn thành"
                                    value={stats.completed}
                                    description="Kế hoạch đã hoàn tất"
                                    tone="purple"
                                    icon={<Target className="h-6 w-6" />}
                              />
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_240px_240px_auto]">
                                    <div className="relative">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                          <Input
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                placeholder="Tìm kế hoạch, nhóm phụ trách, mục tiêu..."
                                                className="pl-10"
                                          />
                                    </div>

                                    <select
                                          value={typeFilter}
                                          onChange={(event) =>
                                                setTypeFilter(
                                                      event.target.value as 'all' | ActivityPlanType
                                                )
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả loại</option>
                                          <option value="annual">Kế hoạch năm</option>
                                          <option value="monthly">Kế hoạch tháng</option>
                                          <option value="community">Sinh hoạt cộng đoàn</option>
                                          <option value="spiritual">Đời sống thiêng liêng</option>
                                          <option value="study">Học tập</option>
                                          <option value="volunteer">Thiện nguyện</option>
                                          <option value="culture">Văn hóa / Giao lưu</option>
                                          <option value="other">Khác</option>
                                    </select>

                                    <select
                                          value={statusFilter}
                                          onChange={(event) =>
                                                setStatusFilter(
                                                      event.target.value as 'all' | ActivityPlanStatus
                                                )
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả trạng thái</option>
                                          <option value="draft">Nháp</option>
                                          <option value="planned">Đã lên kế hoạch</option>
                                          <option value="in_progress">Đang thực hiện</option>
                                          <option value="completed">Hoàn thành</option>
                                          <option value="cancelled">Đã hủy</option>
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

                        <ActivityPlanBoard plans={filteredPlans} />

                        <ConfigurableDataTable
                              moduleKey="activityPlans"
                              tableKey="activityPlans.list"
                              columns={columns}
                              data={filteredPlans}
                              getRowKey={(plan) => plan.id}
                              emptyTitle="Chưa có kế hoạch"
                              emptyDescription="Thêm kế hoạch để quản lý hoạt động và sự kiện trong năm."
                        />

                        {isFormOpen && (
                              <PlanFormModal
                                    title={editingPlan ? 'Cập nhật kế hoạch' : 'Thêm kế hoạch'}
                                    formData={formData}
                                    setFormData={setFormData}
                                    error={error}
                                    onClose={closeForm}
                                    onSubmit={handleSave}
                                    submitText={editingPlan ? 'Cập nhật' : 'Thêm kế hoạch'}
                              />
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}

function ActivityPlanBoard({ plans }: { plans: ActivityPlan[] }) {
      if (plans.length === 0) {
            return (
                  <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
                        Không có kế hoạch phù hợp với bộ lọc hiện tại.
                  </div>
            );
      }

      const visiblePlans = plans.slice(0, 6);

      return (
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                              <h2 className="text-lg font-bold text-neutral-900">
                                    Tổng quan kế hoạch
                              </h2>
                              <p className="mt-1 text-sm text-neutral-500">
                                    Các hoạt động nổi bật theo thời gian và trạng thái thực hiện.
                              </p>
                        </div>

                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              {plans.length} kế hoạch
                        </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                        {visiblePlans.map((plan) => (
                              <div
                                    key={plan.id}
                                    className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm"
                              >
                                    <div className="flex items-start justify-between gap-3">
                                          <div className="min-w-0">
                                                <p className="truncate font-bold text-slate-900">
                                                      {plan.title}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                      {formatDateRange(plan.startDate, plan.endDate)}
                                                </p>
                                          </div>

                                          <span
                                                className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                                                      plan.status
                                                )}`}
                                          >
                                                {getStatusLabel(plan.status)}
                                          </span>
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                          <span
                                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getPlanTypeClass(
                                                      plan.planType
                                                )}`}
                                          >
                                                {getPlanTypeLabel(plan.planType)}
                                          </span>

                                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                {plan.expectedParticipants || 0} người
                                          </span>
                                    </div>

                                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                                          {plan.objective || 'Chưa có mục tiêu cụ thể.'}
                                    </p>

                                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                          <Flag className="h-3.5 w-3.5" />
                                          {plan.ownerGroup || 'Chưa phân công'}
                                    </div>
                              </div>
                        ))}
                  </div>
            </div>
      );
}

function PlanFormModal({
      title,
      formData,
      setFormData,
      error,
      onClose,
      onSubmit,
      submitText,
}: {
      title: string;
      formData: ActivityPlanFormData;
      setFormData: React.Dispatch<React.SetStateAction<ActivityPlanFormData>>;
      error: string | null;
      onClose: () => void;
      onSubmit: () => void;
      submitText: string;
}) {
      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
                              <div>
                                    <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
                                    <p className="text-sm text-neutral-500">
                                          Khai báo thông tin kế hoạch, thời gian, nhóm phụ trách và mục tiêu thực hiện.
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
                                          <Label htmlFor="code">Mã kế hoạch</Label>
                                          <Input
                                                id="code"
                                                value={formData.code}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            code: normalizeCode(event.target.value),
                                                      })
                                                }
                                                placeholder="VD: COMMUNITY_DAY_Q1"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="title">Tên kế hoạch</Label>
                                          <Input
                                                id="title"
                                                value={formData.title}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            title: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Ngày sinh hoạt cộng đoàn quý I"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="planType">Loại kế hoạch</Label>
                                          <select
                                                id="planType"
                                                value={formData.planType}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            planType: event.target.value as ActivityPlanType,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="annual">Kế hoạch năm</option>
                                                <option value="monthly">Kế hoạch tháng</option>
                                                <option value="community">Sinh hoạt cộng đoàn</option>
                                                <option value="spiritual">Đời sống thiêng liêng</option>
                                                <option value="study">Học tập</option>
                                                <option value="volunteer">Thiện nguyện</option>
                                                <option value="culture">Văn hóa / Giao lưu</option>
                                                <option value="other">Khác</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="status">Trạng thái</Label>
                                          <select
                                                id="status"
                                                value={formData.status}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            status: event.target.value as ActivityPlanStatus,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="draft">Nháp</option>
                                                <option value="planned">Đã lên kế hoạch</option>
                                                <option value="in_progress">Đang thực hiện</option>
                                                <option value="completed">Hoàn thành</option>
                                                <option value="cancelled">Đã hủy</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="startDate">Ngày bắt đầu</Label>
                                          <Input
                                                id="startDate"
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            startDate: event.target.value,
                                                      })
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
                                                      setFormData({
                                                            ...formData,
                                                            endDate: event.target.value,
                                                      })
                                                }
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="ownerGroup">Nhóm phụ trách</Label>
                                          <Input
                                                id="ownerGroup"
                                                value={formData.ownerGroup}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            ownerGroup: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Ban sinh hoạt"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="location">Địa điểm</Label>
                                          <Input
                                                id="location"
                                                value={formData.location}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            location: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Sân sinh hoạt chung"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="expectedParticipants">Số người dự kiến</Label>
                                          <Input
                                                id="expectedParticipants"
                                                type="number"
                                                min={0}
                                                value={formData.expectedParticipants}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            expectedParticipants: event.target.value,
                                                      })
                                                }
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="estimatedBudget">Ngân sách dự kiến</Label>
                                          <Input
                                                id="estimatedBudget"
                                                type="number"
                                                min={0}
                                                value={formData.estimatedBudget}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            estimatedBudget: event.target.value,
                                                      })
                                                }
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
                                          <Input
                                                id="sortOrder"
                                                type="number"
                                                min={0}
                                                value={formData.sortOrder}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            sortOrder: event.target.value,
                                                      })
                                                }
                                          />
                                    </div>
                              </div>

                              <div>
                                    <Label htmlFor="objective">Mục tiêu</Label>
                                    <Textarea
                                          id="objective"
                                          value={formData.objective}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      objective: event.target.value,
                                                })
                                          }
                                          placeholder="Mô tả mục tiêu chính của kế hoạch"
                                          className="min-h-24"
                                    />
                              </div>

                              <div>
                                    <Label htmlFor="note">Ghi chú</Label>
                                    <Textarea
                                          id="note"
                                          value={formData.note}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      note: event.target.value,
                                                })
                                          }
                                          placeholder="Ghi chú thêm về chuẩn bị, nguồn lực hoặc lưu ý thực hiện"
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
                                          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >
                                          {submitText}
                                    </button>
                              </div>
                        </form>
                  </div>
            </div>
      );
}
