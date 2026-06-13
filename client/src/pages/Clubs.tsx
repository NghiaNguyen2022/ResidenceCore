'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      BookOpen,
      CheckCircle2,
      Edit2,
      HeartHandshake,
      Music,
      Palette,
      Plus,
      Search,
      ShieldCheck,
      Sparkles,
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
import { normalizeText } from '@/lib/text';

type ClubStatus = 'active' | 'inactive' | 'paused';
type ClubType =
      | 'study'
      | 'music'
      | 'sports'
      | 'art'
      | 'volunteer'
      | 'spiritual'
      | 'skill'
      | 'other';

type ClubItem = {
      id: number;
      code: string;
      name: string;
      clubType: ClubType;
      status: ClubStatus;
      leaderName: string;
      mentorName: string;
      meetingSchedule: string;
      location: string;
      memberCount: number;
      maxMembers: number;
      objective: string;
      note?: string | null;
      sortOrder: number;
};

type ClubFormData = {
      code: string;
      name: string;
      clubType: ClubType;
      status: ClubStatus;
      leaderName: string;
      mentorName: string;
      meetingSchedule: string;
      location: string;
      memberCount: string;
      maxMembers: string;
      objective: string;
      note: string;
      sortOrder: string;
};

const initialClubs: ClubItem[] = [
      {
            id: 1,
            code: 'STUDY_GROUP',
            name: 'Nhóm học tập',
            clubType: 'study',
            status: 'active',
            leaderName: 'Tổ học tập',
            mentorName: 'Ban học tập',
            meetingSchedule: 'Thứ 3, Thứ 5 · 19:00 - 20:30',
            location: 'Phòng học chung',
            memberCount: 28,
            maxMembers: 40,
            objective: 'Tạo môi trường học nhóm, hỗ trợ học viên ôn tập và chia sẻ phương pháp học hiệu quả.',
            note: 'Ưu tiên học viên cần hỗ trợ thêm trong mùa thi.',
            sortOrder: 10,
      },
      {
            id: 2,
            code: 'MUSIC_CLUB',
            name: 'Câu lạc bộ âm nhạc',
            clubType: 'music',
            status: 'active',
            leaderName: 'Ban âm nhạc',
            mentorName: 'Người phụ trách sinh hoạt',
            meetingSchedule: 'Thứ 7 · 15:00 - 17:00',
            location: 'Phòng sinh hoạt',
            memberCount: 18,
            maxMembers: 30,
            objective: 'Phát triển năng khiếu âm nhạc và phục vụ các dịp sinh hoạt chung của lưu xá.',
            note: '',
            sortOrder: 20,
      },
      {
            id: 3,
            code: 'VOLUNTEER_TEAM',
            name: 'Nhóm thiện nguyện',
            clubType: 'volunteer',
            status: 'paused',
            leaderName: 'Ban thiện nguyện',
            mentorName: '',
            meetingSchedule: 'Theo kế hoạch hoạt động',
            location: 'Lưu xá / địa điểm bên ngoài',
            memberCount: 22,
            maxMembers: 35,
            objective: 'Khơi dậy tinh thần phục vụ, trách nhiệm xã hội và sự quan tâm đến cộng đồng.',
            note: 'Tạm dừng để rà soát kế hoạch hoạt động mới.',
            sortOrder: 30,
      },
];

const defaultFormData: ClubFormData = {
      code: '',
      name: '',
      clubType: 'study',
      status: 'active',
      leaderName: '',
      mentorName: '',
      meetingSchedule: '',
      location: '',
      memberCount: '0',
      maxMembers: '0',
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


function getClubTypeLabel(type: ClubType) {
      if (type === 'study') return 'Học tập';
      if (type === 'music') return 'Âm nhạc';
      if (type === 'sports') return 'Thể thao';
      if (type === 'art') return 'Nghệ thuật';
      if (type === 'volunteer') return 'Thiện nguyện';
      if (type === 'spiritual') return 'Đời sống thiêng liêng';
      if (type === 'skill') return 'Kỹ năng';
      return 'Khác';
}

function getClubTypeClass(type: ClubType) {
      if (type === 'study') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (type === 'music') return 'border-violet-200 bg-violet-50 text-violet-700';
      if (type === 'sports') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      if (type === 'art') return 'border-pink-200 bg-pink-50 text-pink-700';
      if (type === 'volunteer') return 'border-orange-200 bg-orange-50 text-orange-700';
      if (type === 'spiritual') return 'border-indigo-200 bg-indigo-50 text-indigo-700';
      if (type === 'skill') return 'border-sky-200 bg-sky-50 text-sky-700';
      return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

function getClubTypeIcon(type: ClubType) {
      if (type === 'study') return <BookOpen className="h-4 w-4" />;
      if (type === 'music') return <Music className="h-4 w-4" />;
      if (type === 'art') return <Palette className="h-4 w-4" />;
      if (type === 'volunteer') return <HeartHandshake className="h-4 w-4" />;
      if (type === 'spiritual') return <ShieldCheck className="h-4 w-4" />;
      return <Sparkles className="h-4 w-4" />;
}

function getStatusLabel(status: ClubStatus) {
      if (status === 'active') return 'Đang hoạt động';
      if (status === 'paused') return 'Tạm dừng';
      return 'Ngưng hoạt động';
}

function getStatusClass(status: ClubStatus) {
      if (status === 'active') return 'border-green-200 bg-green-50 text-green-700';
      if (status === 'paused') return 'border-amber-200 bg-amber-50 text-amber-700';
      return 'border-neutral-200 bg-neutral-100 text-neutral-600';
}

function getCapacityLabel(club: ClubItem) {
      if (!club.maxMembers || club.maxMembers <= 0) {
            return `${club.memberCount || 0} thành viên`;
      }

      return `${club.memberCount || 0}/${club.maxMembers}`;
}

function getCapacityRate(club: ClubItem) {
      if (!club.maxMembers || club.maxMembers <= 0) return 0;

      return Math.min(100, Math.round(((club.memberCount || 0) / club.maxMembers) * 100));
}

function getNextId(items: ClubItem[]) {
      return Math.max(...items.map((item) => item.id), 0) + 1;
}

function getNextSortOrder(items: ClubItem[]) {
      return String(Math.max(...items.map((item) => Number(item.sortOrder || 0)), 0) + 10);
}

function validateForm({
      clubs,
      formData,
      editingId,
}: {
      clubs: ClubItem[];
      formData: ClubFormData;
      editingId?: number;
}) {
      const code = normalizeCode(formData.code);

      if (!code) return 'Vui lòng nhập mã câu lạc bộ.';
      if (!formData.name.trim()) return 'Vui lòng nhập tên câu lạc bộ.';

      const memberCount = Number(formData.memberCount || 0);
      const maxMembers = Number(formData.maxMembers || 0);
      const sortOrder = Number(formData.sortOrder || 0);

      if (!Number.isFinite(memberCount) || memberCount < 0) {
            return 'Số thành viên hiện tại phải là số lớn hơn hoặc bằng 0.';
      }

      if (!Number.isFinite(maxMembers) || maxMembers < 0) {
            return 'Số thành viên tối đa phải là số lớn hơn hoặc bằng 0.';
      }

      if (maxMembers > 0 && memberCount > maxMembers) {
            return 'Số thành viên hiện tại không được lớn hơn số thành viên tối đa.';
      }

      if (!Number.isFinite(sortOrder) || sortOrder < 0) {
            return 'Thứ tự hiển thị phải là số lớn hơn hoặc bằng 0.';
      }

      const duplicatedCode = clubs
            .filter((club) => club.id !== editingId)
            .some((club) => normalizeText(club.code) === normalizeText(code));

      if (duplicatedCode) {
            return 'Mã câu lạc bộ đã tồn tại. Vui lòng nhập mã khác.';
      }

      return null;
}

export default function Clubs() {
      const [clubs, setClubs] = useState<ClubItem[]>(initialClubs);
      const [searchTerm, setSearchTerm] = useState('');
      const [typeFilter, setTypeFilter] = useState<'all' | ClubType>('all');
      const [statusFilter, setStatusFilter] = useState<'all' | ClubStatus>('all');
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingClub, setEditingClub] = useState<ClubItem | null>(null);
      const [formData, setFormData] = useState<ClubFormData>(defaultFormData);
      const [error, setError] = useState<string | null>(null);

      const filteredClubs = useMemo(() => {
            const keyword = normalizeText(searchTerm);

            return clubs
                  .filter((club) => {
                        if (typeFilter !== 'all' && club.clubType !== typeFilter) return false;
                        if (statusFilter !== 'all' && club.status !== statusFilter) return false;

                        if (!keyword) return true;

                        const haystack = [
                              club.code,
                              club.name,
                              getClubTypeLabel(club.clubType),
                              getStatusLabel(club.status),
                              club.leaderName,
                              club.mentorName,
                              club.location,
                              club.meetingSchedule,
                              club.objective,
                              club.note,
                        ]
                              .map((value) => normalizeText(value))
                              .join(' ');

                        return haystack.includes(keyword);
                  })
                  .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
      }, [clubs, searchTerm, typeFilter, statusFilter]);

      const stats = useMemo(() => {
            return {
                  total: clubs.length,
                  active: clubs.filter((club) => club.status === 'active').length,
                  paused: clubs.filter((club) => club.status === 'paused').length,
                  members: clubs.reduce((sum, club) => sum + (club.memberCount || 0), 0),
            };
      }, [clubs]);

      const openCreateForm = () => {
            setEditingClub(null);
            setFormData({
                  ...defaultFormData,
                  sortOrder: getNextSortOrder(clubs),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const openEditForm = (club: ClubItem) => {
            setEditingClub(club);
            setFormData({
                  code: club.code,
                  name: club.name,
                  clubType: club.clubType,
                  status: club.status,
                  leaderName: club.leaderName,
                  mentorName: club.mentorName,
                  meetingSchedule: club.meetingSchedule,
                  location: club.location,
                  memberCount: String(club.memberCount || 0),
                  maxMembers: String(club.maxMembers || 0),
                  objective: club.objective,
                  note: club.note || '',
                  sortOrder: String(club.sortOrder || 0),
            });
            setError(null);
            setIsFormOpen(true);
      };

      const closeForm = () => {
            setIsFormOpen(false);
            setEditingClub(null);
            setFormData(defaultFormData);
            setError(null);
      };

      const handleSave = () => {
            const validationMessage = validateForm({
                  clubs,
                  formData,
                  editingId: editingClub?.id,
            });

            if (validationMessage) {
                  setError(validationMessage);
                  return;
            }

            const payload: ClubItem = {
                  id: editingClub?.id || getNextId(clubs),
                  code: normalizeCode(formData.code),
                  name: formData.name.trim(),
                  clubType: formData.clubType,
                  status: formData.status,
                  leaderName: formData.leaderName.trim(),
                  mentorName: formData.mentorName.trim(),
                  meetingSchedule: formData.meetingSchedule.trim(),
                  location: formData.location.trim(),
                  memberCount: Number(formData.memberCount || 0),
                  maxMembers: Number(formData.maxMembers || 0),
                  objective: formData.objective.trim(),
                  note: formData.note.trim() || null,
                  sortOrder: Number(formData.sortOrder || 0),
            };

            if (editingClub) {
                  setClubs((current) =>
                        current.map((club) => (club.id === editingClub.id ? payload : club))
                  );
            } else {
                  setClubs((current) => [...current, payload]);
            }

            closeForm();
      };

      const handleDelete = (club: ClubItem) => {
            if (!confirm(`Bạn có chắc chắn muốn xóa "${club.name}"?`)) {
                  return;
            }

            setClubs((current) => current.filter((item) => item.id !== club.id));
      };

      const clearFilters = () => {
            setSearchTerm('');
            setTypeFilter('all');
            setStatusFilter('all');
      };

      const columns = useMemo<ConfigurableColumn<ClubItem>[]>(
            () => [
                  {
                        key: 'club',
                        label: 'Câu lạc bộ',
                        sortable: true,
                        sortValue: (club) => club.name,
                        render: (club) => (
                              <div>
                                    <p className="font-semibold text-slate-900">{club.name}</p>
                                    <p className="mt-1 font-mono text-xs text-slate-500">
                                          {club.code}
                                    </p>
                              </div>
                        ),
                  },
                  {
                        key: 'clubType',
                        label: 'Loại',
                        sortable: true,
                        sortValue: (club) => getClubTypeLabel(club.clubType),
                        render: (club) => (
                              <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getClubTypeClass(
                                          club.clubType
                                    )}`}
                              >
                                    {getClubTypeIcon(club.clubType)}
                                    {getClubTypeLabel(club.clubType)}
                              </span>
                        ),
                  },
                  {
                        key: 'leaderName',
                        label: 'Phụ trách',
                        sortable: true,
                        sortValue: (club) => club.leaderName,
                        render: (club) => (
                              <div>
                                    <p className="text-sm font-medium text-slate-800">
                                          {club.leaderName || '-'}
                                    </p>
                                    {club.mentorName && (
                                          <p className="mt-1 text-xs text-slate-500">
                                                Cố vấn: {club.mentorName}
                                          </p>
                                    )}
                              </div>
                        ),
                  },
                  {
                        key: 'meetingSchedule',
                        label: 'Lịch sinh hoạt',
                        sortable: true,
                        sortValue: (club) => club.meetingSchedule,
                        render: (club) => club.meetingSchedule || '-',
                  },
                  {
                        key: 'location',
                        label: 'Địa điểm',
                        sortable: true,
                        sortValue: (club) => club.location,
                        render: (club) => club.location || '-',
                  },
                  {
                        key: 'members',
                        label: 'Thành viên',
                        sortable: true,
                        sortValue: (club) => club.memberCount,
                        render: (club) => (
                              <div className="min-w-[120px]">
                                    <p className="text-sm font-semibold text-slate-800">
                                          {getCapacityLabel(club)}
                                    </p>
                                    {club.maxMembers > 0 && (
                                          <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                                                <div
                                                      className="h-1.5 rounded-full bg-blue-500"
                                                      style={{ width: `${getCapacityRate(club)}%` }}
                                                />
                                          </div>
                                    )}
                              </div>
                        ),
                  },
                  {
                        key: 'status',
                        label: 'Trạng thái',
                        sortable: true,
                        sortValue: (club) => getStatusLabel(club.status),
                        render: (club) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                          club.status
                                    )}`}
                              >
                                    {getStatusLabel(club.status)}
                              </span>
                        ),
                  },
                  {
                        key: 'objective',
                        label: 'Mục tiêu',
                        defaultVisible: false,
                        sortable: true,
                        sortValue: (club) => club.objective,
                        render: (club) => club.objective || '-',
                  },
                  {
                        key: 'actions',
                        label: 'Hành động',
                        className: 'min-w-[140px]',
                        render: (club) => (
                              <div className="flex items-center gap-1.5">
                                    <button
                                          type="button"
                                          onClick={() => openEditForm(club)}
                                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                          title="Sửa câu lạc bộ"
                                    >
                                          <Edit2 className="h-4 w-4" />
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => handleDelete(club)}
                                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                          title="Xóa câu lạc bộ"
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
                                          Câu lạc bộ
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                                          Quản lý các câu lạc bộ, nhóm năng khiếu, nhóm phục vụ và nhóm phát triển kỹ năng trong lưu xá.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={openCreateForm}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                              >
                                    <Plus className="h-4 w-4" />
                                    Thêm câu lạc bộ
                              </button>
                        </div>

                        {error && (
                              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <div className="flex gap-3">
                                          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                          <div>
                                                <p className="font-semibold">
                                                      Có lỗi khi xử lý câu lạc bộ.
                                                </p>
                                                <p className="mt-1 text-sm">{error}</p>
                                          </div>
                                    </div>
                              </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                              <ConfigurableStatCard
                                    moduleKey="clubs"
                                    cardKey="clubs.total"
                                    label="Tổng câu lạc bộ"
                                    value={stats.total}
                                    description="Tổng số nhóm đã khai báo"
                                    tone="blue"
                                    icon={<Users className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="clubs"
                                    cardKey="clubs.active"
                                    label="Đang hoạt động"
                                    value={stats.active}
                                    description="Nhóm còn sinh hoạt"
                                    tone="green"
                                    icon={<CheckCircle2 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="clubs"
                                    cardKey="clubs.paused"
                                    label="Tạm dừng"
                                    value={stats.paused}
                                    description="Nhóm đang tạm ngưng"
                                    tone="orange"
                                    icon={<ShieldCheck className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="clubs"
                                    cardKey="clubs.members"
                                    label="Tổng thành viên"
                                    value={stats.members}
                                    description="Tổng số thành viên tham gia"
                                    tone="purple"
                                    icon={<HeartHandshake className="h-6 w-6" />}
                              />
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_240px_240px_auto]">
                                    <div className="relative">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                          <Input
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                placeholder="Tìm câu lạc bộ, phụ trách, địa điểm..."
                                                className="pl-10"
                                          />
                                    </div>

                                    <select
                                          value={typeFilter}
                                          onChange={(event) =>
                                                setTypeFilter(event.target.value as 'all' | ClubType)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả loại</option>
                                          <option value="study">Học tập</option>
                                          <option value="music">Âm nhạc</option>
                                          <option value="sports">Thể thao</option>
                                          <option value="art">Nghệ thuật</option>
                                          <option value="volunteer">Thiện nguyện</option>
                                          <option value="spiritual">Đời sống thiêng liêng</option>
                                          <option value="skill">Kỹ năng</option>
                                          <option value="other">Khác</option>
                                    </select>

                                    <select
                                          value={statusFilter}
                                          onChange={(event) =>
                                                setStatusFilter(event.target.value as 'all' | ClubStatus)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả trạng thái</option>
                                          <option value="active">Đang hoạt động</option>
                                          <option value="paused">Tạm dừng</option>
                                          <option value="inactive">Ngưng hoạt động</option>
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

                        <ClubGallery clubs={filteredClubs} />

                        <ConfigurableDataTable
                              moduleKey="clubs"
                              tableKey="clubs.list"
                              columns={columns}
                              data={filteredClubs}
                              getRowKey={(club) => club.id}
                              emptyTitle="Chưa có câu lạc bộ"
                              emptyDescription="Thêm câu lạc bộ để quản lý các nhóm sinh hoạt và phát triển kỹ năng."
                        />

                        {isFormOpen && (
                              <ClubFormModal
                                    title={editingClub ? 'Cập nhật câu lạc bộ' : 'Thêm câu lạc bộ'}
                                    formData={formData}
                                    setFormData={setFormData}
                                    error={error}
                                    onClose={closeForm}
                                    onSubmit={handleSave}
                                    submitText={editingClub ? 'Cập nhật' : 'Thêm câu lạc bộ'}
                              />
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}

function ClubGallery({ clubs }: { clubs: ClubItem[] }) {
      if (clubs.length === 0) {
            return (
                  <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
                        Không có câu lạc bộ phù hợp với bộ lọc hiện tại.
                  </div>
            );
      }

      return (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {clubs.slice(0, 6).map((club) => (
                        <div
                              key={club.id}
                              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                              <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                          <p className="truncate text-lg font-bold text-slate-900">
                                                {club.name}
                                          </p>
                                          <p className="mt-1 text-xs text-slate-500">
                                                {club.meetingSchedule || 'Chưa có lịch sinh hoạt'}
                                          </p>
                                    </div>

                                    <span
                                          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                                club.status
                                          )}`}
                                    >
                                          {getStatusLabel(club.status)}
                                    </span>
                              </div>

                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <span
                                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getClubTypeClass(
                                                club.clubType
                                          )}`}
                                    >
                                          {getClubTypeIcon(club.clubType)}
                                          {getClubTypeLabel(club.clubType)}
                                    </span>

                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                          {getCapacityLabel(club)}
                                    </span>
                              </div>

                              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                                    {club.objective || 'Chưa có mục tiêu cụ thể.'}
                              </p>

                              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                    <span className="font-semibold">Phụ trách:</span>{' '}
                                    {club.leaderName || 'Chưa phân công'}
                              </div>
                        </div>
                  ))}
            </div>
      );
}

function ClubFormModal({
      title,
      formData,
      setFormData,
      error,
      onClose,
      onSubmit,
      submitText,
}: {
      title: string;
      formData: ClubFormData;
      setFormData: React.Dispatch<React.SetStateAction<ClubFormData>>;
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
                                          Khai báo thông tin nhóm, lịch sinh hoạt, người phụ trách và mục tiêu hoạt động.
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
                                          <Label htmlFor="code">Mã câu lạc bộ</Label>
                                          <Input
                                                id="code"
                                                value={formData.code}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            code: normalizeCode(event.target.value),
                                                      })
                                                }
                                                placeholder="VD: MUSIC_CLUB"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="name">Tên câu lạc bộ</Label>
                                          <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            name: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Câu lạc bộ âm nhạc"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="clubType">Loại câu lạc bộ</Label>
                                          <select
                                                id="clubType"
                                                value={formData.clubType}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            clubType: event.target.value as ClubType,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="study">Học tập</option>
                                                <option value="music">Âm nhạc</option>
                                                <option value="sports">Thể thao</option>
                                                <option value="art">Nghệ thuật</option>
                                                <option value="volunteer">Thiện nguyện</option>
                                                <option value="spiritual">Đời sống thiêng liêng</option>
                                                <option value="skill">Kỹ năng</option>
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
                                                            status: event.target.value as ClubStatus,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="active">Đang hoạt động</option>
                                                <option value="paused">Tạm dừng</option>
                                                <option value="inactive">Ngưng hoạt động</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="leaderName">Người / nhóm phụ trách</Label>
                                          <Input
                                                id="leaderName"
                                                value={formData.leaderName}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            leaderName: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Ban âm nhạc"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="mentorName">Người cố vấn</Label>
                                          <Input
                                                id="mentorName"
                                                value={formData.mentorName}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            mentorName: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Người phụ trách sinh hoạt"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="meetingSchedule">Lịch sinh hoạt</Label>
                                          <Input
                                                id="meetingSchedule"
                                                value={formData.meetingSchedule}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            meetingSchedule: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Thứ 7 · 15:00 - 17:00"
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
                                                placeholder="VD: Phòng sinh hoạt"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="memberCount">Số thành viên hiện tại</Label>
                                          <Input
                                                id="memberCount"
                                                type="number"
                                                min={0}
                                                value={formData.memberCount}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            memberCount: event.target.value,
                                                      })
                                                }
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="maxMembers">Số thành viên tối đa</Label>
                                          <Input
                                                id="maxMembers"
                                                type="number"
                                                min={0}
                                                value={formData.maxMembers}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            maxMembers: event.target.value,
                                                      })
                                                }
                                                placeholder="Để 0 nếu không giới hạn"
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
                                    <Label htmlFor="objective">Mục tiêu hoạt động</Label>
                                    <Textarea
                                          id="objective"
                                          value={formData.objective}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      objective: event.target.value,
                                                })
                                          }
                                          placeholder="Mô tả mục tiêu, ý nghĩa hoặc định hướng của câu lạc bộ"
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
                                          placeholder="Ghi chú thêm về quy định, lịch sinh hoạt hoặc lưu ý quản lý"
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
