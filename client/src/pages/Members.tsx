'use client';

import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  DoorOpen,
  Users,
  UserCheck,
  UserX,
  Clock,
  X,
  Search,
  Eye,
  Phone,
  MapPin,
  CalendarDays,
  IdCard,
  GraduationCap,
  Home,
  AlertCircle,
  Database,
} from 'lucide-react';

import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Gender = 'male' | 'female' | 'other';
type RoomEventType = 'new_entry' | 'transfer' | 'temporary_leave';

type MemberFormData = {
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  idNumber: string;
  permanentAddress: string;
  phoneNumber: string;
  schoolId: string;
  admissionDate: string;
};

type RoomAssignmentData = {
  roomId: string;
  assignedDate: string;
  eventType: RoomEventType;
  reason: string;
};

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description: string;
  tone: 'blue' | 'green' | 'red' | 'orange';
};

const defaultFormData: MemberFormData = {
  fullName: '',
  dateOfBirth: '',
  gender: 'male',
  idNumber: '',
  permanentAddress: '',
  phoneNumber: '',
  schoolId: '',
  admissionDate: new Date().toISOString().split('T')[0],
};

const defaultRoomAssignmentData: RoomAssignmentData = {
  roomId: '',
  assignedDate: new Date().toISOString().split('T')[0],
  eventType: 'new_entry',
  reason: '',
};

function StatCard({ icon, label, value, description, tone }: StatCardProps) {
  const toneClass = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
  }[tone];

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{value}</p>
          <p className="mt-1 text-xs text-neutral-500">{description}</p>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function getStatusLabel(status?: string) {
  if (status === 'active') return 'Đang ở';
  if (status === 'transferred_out') return 'Đã rời';
  if (status === 'inactive') return 'Tạm rời';
  return 'Chưa xác định';
}

function getStatusClass(status?: string) {
  if (status === 'active') return 'border-green-200 bg-green-50 text-green-700';
  if (status === 'transferred_out') return 'border-red-200 bg-red-50 text-red-700';
  if (status === 'inactive') return 'border-orange-200 bg-orange-50 text-orange-700';

  return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

function getGenderLabel(gender?: string) {
  if (gender === 'male') return 'Nam';
  if (gender === 'female') return 'Nữ';
  if (gender === 'other') return 'Khác';

  return '-';
}

function formatDate(date?: string | Date | null) {
  if (!date) return '-';

  try {
    return new Date(date).toLocaleDateString('vi-VN');
  } catch {
    return '-';
  }
}

function resetMemberForm(): MemberFormData {
  return {
    ...defaultFormData,
    admissionDate: new Date().toISOString().split('T')[0],
  };
}

function resetRoomAssignmentForm(): RoomAssignmentData {
  return {
    ...defaultRoomAssignmentData,
    assignedDate: new Date().toISOString().split('T')[0],
  };
}

export default function Members() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignRoomDialogOpen, setIsAssignRoomDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const [editingMember, setEditingMember] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedMemberForRoom, setSelectedMemberForRoom] = useState<any>(null);

  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<MemberFormData>(resetMemberForm());
  const [roomAssignmentData, setRoomAssignmentData] = useState<RoomAssignmentData>(
    resetRoomAssignmentForm()
  );

  /**
   * CONNECTED DATA - giữ nguyên API hiện tại.
   * Không chuyển các phần này thành mock.
   */
  const membersQuery = trpc.members.list.useQuery({
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const statsQuery = trpc.members.getStats.useQuery();
  const roomsQuery = trpc.rooms.list.useQuery();

  const createMember = trpc.members.create.useMutation();
  const updateMember = trpc.members.update.useMutation();
  const deleteMember = trpc.members.delete.useMutation();
  const assignRoomMutation = trpc.rooms.assignResident.useMutation();

  const members = membersQuery.data || [];
  const rooms = roomsQuery.data || [];

  const stats = statsQuery.data || {
    total: 0,
    active: 0,
    inactive: 0,
    transferred_out: 0,
  };

  const refetchMembers = () => {
    membersQuery.refetch();
    statsQuery.refetch();
  };

  const handleOpenAddDialog = () => {
    setEditingMember(null);
    setFormData(resetMemberForm());
    setError(null);
    setIsAddDialogOpen(true);
  };

  const handleAddMember = async () => {
    try {
      const submitData = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        gender: formData.gender as 'male' | 'female' | 'other',
        idNumber: formData.idNumber || undefined,
        permanentAddress: formData.permanentAddress || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        schoolId: formData.schoolId ? parseInt(formData.schoolId) : undefined,
        admissionDate: formData.admissionDate ? new Date(formData.admissionDate) : new Date(),
      };

      await createMember.mutateAsync(submitData);

      setIsAddDialogOpen(false);
      setFormData(resetMemberForm());
      setError(null);
      refetchMembers();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi thêm học viên');
    }
  };

  const handleEditMember = (member: any) => {
    setEditingMember(member);

    setFormData({
      fullName: member.fullName || '',
      dateOfBirth: member.dateOfBirth
        ? new Date(member.dateOfBirth).toISOString().split('T')[0]
        : '',
      gender: member.gender || 'male',
      idNumber: member.idNumber || '',
      permanentAddress: member.permanentAddress || '',
      phoneNumber: member.phoneNumber || '',
      schoolId: member.schoolId?.toString() || '',
      admissionDate: member.admissionDate
        ? new Date(member.admissionDate).toISOString().split('T')[0]
        : '',
    });

    setError(null);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMember?.id) {
      setError('Không tìm thấy học viên cần cập nhật');
      return;
    }

    try {
      const submitData = {
        id: editingMember.id,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        gender: formData.gender as 'male' | 'female' | 'other',
        idNumber: formData.idNumber || undefined,
        permanentAddress: formData.permanentAddress || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        schoolId: formData.schoolId ? parseInt(formData.schoolId) : undefined,
        admissionDate: formData.admissionDate ? new Date(formData.admissionDate) : new Date(),
      };

      await updateMember.mutateAsync(submitData);

      setIsEditDialogOpen(false);
      setEditingMember(null);
      setFormData(resetMemberForm());
      setError(null);
      refetchMembers();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật học viên');
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa học viên này?')) return;

    try {
      await deleteMember.mutateAsync({ id });
      refetchMembers();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xóa học viên');
    }
  };

  const handleOpenAssignRoomDialog = (member: any) => {
    setSelectedMemberForRoom(member);
    setRoomAssignmentData(resetRoomAssignmentForm());
    setError(null);
    setIsAssignRoomDialogOpen(true);
  };

  const handleAssignRoom = async () => {
    if (!selectedMemberForRoom?.id) {
      setError('Không tìm thấy học viên cần gán phòng');
      return;
    }

    if (!roomAssignmentData.roomId) {
      setError('Vui lòng chọn phòng');
      return;
    }

    try {
      await assignRoomMutation.mutateAsync({
        residentId: selectedMemberForRoom.id,
        roomId: parseInt(roomAssignmentData.roomId),
        assignedDate: new Date(roomAssignmentData.assignedDate),
        eventType: roomAssignmentData.eventType,
        reason: roomAssignmentData.reason || undefined,
      });

      setIsAssignRoomDialogOpen(false);
      setSelectedMemberForRoom(null);
      setError(null);

      membersQuery.refetch();
      roomsQuery.refetch();
      statsQuery.refetch();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi gán phòng');
    }
  };

  const handleOpenDetail = (member: any) => {
    setSelectedMember(member);
    setIsDetailDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  return (
    <ResidenceCareLayout>
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Quản lý lưu trú</p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">
              Học viên lưu trú
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Quản lý hồ sơ, trạng thái lưu trú, thông tin liên hệ và thao tác gán phòng.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddDialog}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Thêm học viên
          </button>
        </div>

        {/* API Error */}
        {(membersQuery.error || statsQuery.error) && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Có lỗi khi tải dữ liệu học viên.</p>
              <p className="mt-1">
                Vui lòng kiểm tra kết nối API hoặc backend. UI vẫn giữ nguyên data flow đang connect.
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards - Connected with members.getStats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Tổng số"
            value={stats.total}
            description="Tổng học viên trong hệ thống"
            tone="blue"
          />

          <StatCard
            icon={<UserCheck className="h-5 w-5" />}
            label="Đang ở"
            value={stats.active}
            description="Học viên đang lưu trú"
            tone="green"
          />

          <StatCard
            icon={<UserX className="h-5 w-5" />}
            label="Đã rời"
            value={stats.transferred_out}
            description="Học viên đã rời lưu xá"
            tone="red"
          />

          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="Tạm rời"
            value={stats.inactive}
            description="Học viên tạm vắng/tạm ngưng"
            tone="orange"
          />
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên, mã lưu trú, số điện thoại..."
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang ở</option>
              <option value="inactive">Tạm rời</option>
              <option value="transferred_out">Đã rời</option>
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Xóa lọc
            </button>
          </div>
        </div>

        {/* Members Table - Connected with members.list */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                Danh sách học viên
              </h2>
              <p className="text-sm text-neutral-500">
                {members.length} học viên đang hiển thị từ dữ liệu hệ thống
              </p>
            </div>
          </div>

          {membersQuery.isLoading ? (
            <div className="p-10 text-center text-neutral-500">Đang tải dữ liệu...</div>
          ) : members.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                <Users className="h-5 w-5 text-neutral-500" />
              </div>
              <p className="font-medium text-neutral-900">Không có học viên nào</p>
              <p className="mt-1 text-sm text-neutral-500">
                Thử thay đổi bộ lọc hoặc thêm học viên mới.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Học viên
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Mã lưu trú
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Điện thoại
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Giới tính
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Ngày vào
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Trạng thái
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Hành động
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100">
                  {members.map((member: any) => (
                    <tr key={member.id} className="transition hover:bg-neutral-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                            {member.fullName?.charAt(0)?.toUpperCase() || 'H'}
                          </div>

                          <div>
                            <p className="font-semibold text-neutral-900">
                              {member.fullName || '-'}
                            </p>
                            <p className="text-xs text-neutral-500">ID: {member.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-neutral-700">
                        {member.residentCode || '-'}
                      </td>

                      <td className="px-5 py-4 text-sm text-neutral-700">
                        {member.phoneNumber || '-'}
                      </td>

                      <td className="px-5 py-4 text-sm text-neutral-700">
                        {getGenderLabel(member.gender)}
                      </td>

                      <td className="px-5 py-4 text-sm text-neutral-700">
                        {formatDate(member.admissionDate)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                            member.status
                          )}`}
                        >
                          {getStatusLabel(member.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(member)}
                            className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenAssignRoomDialog(member)}
                            className="rounded-lg p-2 text-green-600 transition hover:bg-green-50"
                            title="Gán phòng"
                          >
                            <DoorOpen className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditMember(member)}
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                            title="Sửa"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteMember(member.id)}
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {isAddDialogOpen && (
          <MemberFormModal
            title="Thêm học viên mới"
            error={error}
            formData={formData}
            setFormData={setFormData}
            onClose={() => setIsAddDialogOpen(false)}
            onSubmit={handleAddMember}
            submitText={createMember.isPending ? 'Đang thêm...' : 'Thêm học viên'}
            isSubmitting={createMember.isPending}
          />
        )}

        {isEditDialogOpen && (
          <MemberFormModal
            title="Chỉnh sửa học viên"
            error={error}
            formData={formData}
            setFormData={setFormData}
            onClose={() => setIsEditDialogOpen(false)}
            onSubmit={handleSaveEdit}
            submitText={updateMember.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
            isSubmitting={updateMember.isPending}
          />
        )}

        {isDetailDialogOpen && selectedMember && (
          <MemberDetailModal
            member={selectedMember}
            onClose={() => {
              setIsDetailDialogOpen(false);
              setSelectedMember(null);
            }}
            onEdit={() => {
              setIsDetailDialogOpen(false);
              handleEditMember(selectedMember);
            }}
            onAssignRoom={() => {
              setIsDetailDialogOpen(false);
              handleOpenAssignRoomDialog(selectedMember);
            }}
          />
        )}

        {isAssignRoomDialogOpen && (
          <AssignRoomModal
            error={error}
            rooms={rooms}
            selectedMember={selectedMemberForRoom}
            roomAssignmentData={roomAssignmentData}
            setRoomAssignmentData={setRoomAssignmentData}
            onClose={() => setIsAssignRoomDialogOpen(false)}
            onSubmit={handleAssignRoom}
            isSubmitting={assignRoomMutation.isPending}
          />
        )}
      </div>
    </ResidenceCareLayout>
  );
}

function MemberFormModal({
  title,
  error,
  formData,
  setFormData,
  onClose,
  onSubmit,
  submitText,
  isSubmitting,
}: {
  title: string;
  error: string | null;
  formData: MemberFormData;
  setFormData: React.Dispatch<React.SetStateAction<MemberFormData>>;
  onClose: () => void;
  onSubmit: () => void;
  submitText: string;
  isSubmitting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
            <p className="text-sm text-neutral-500">
              Phần này đang ghi dữ liệu thật thông qua API học viên hiện tại.
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
          onSubmit={(e) => {
            e.preventDefault();
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
              <Label htmlFor="fullName">Tên học viên *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Nhập họ tên"
                required
              />
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="gender">Giới tính</Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gender: e.target.value as Gender,
                  })
                }
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div>
              <Label htmlFor="idNumber">Số CCCD</Label>
              <Input
                id="idNumber"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                placeholder="Nhập số CCCD"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phoneNumber">Điện thoại</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="Nhập số điện thoại"
            />
          </div>

          <div>
            <Label htmlFor="permanentAddress">Địa chỉ thường trú</Label>
            <Textarea
              id="permanentAddress"
              value={formData.permanentAddress}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  permanentAddress: e.target.value,
                })
              }
              placeholder="Nhập địa chỉ"
              className="min-h-24"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="schoolId">Trường học ID</Label>
              <Input
                id="schoolId"
                type="number"
                value={formData.schoolId}
                onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                placeholder="Nhập ID trường"
              />
            </div>

            <div>
              <Label htmlFor="admissionDate">Ngày vào lưu trú *</Label>
              <Input
                id="admissionDate"
                type="date"
                value={formData.admissionDate}
                onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                required
              />
            </div>
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

function MemberDetailModal({
  member,
  onClose,
  onEdit,
  onAssignRoom,
}: {
  member: any;
  onClose: () => void;
  onEdit: () => void;
  onAssignRoom: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">Hồ sơ học viên</p>
            <h2 className="text-2xl font-bold text-neutral-900">
              {member.fullName || '-'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-neutral-50 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
                {member.fullName?.charAt(0)?.toUpperCase() || 'H'}
              </div>

              <div>
                <p className="text-xl font-bold text-neutral-900">
                  {member.fullName || '-'}
                </p>
                <p className="text-sm text-neutral-500">
                  Mã lưu trú: {member.residentCode || '-'}
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                    member.status
                  )}`}
                >
                  {getStatusLabel(member.status)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onAssignRoom}
                className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100"
              >
                <DoorOpen className="h-4 w-4" />
                Gán phòng
              </button>

              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Edit2 className="h-4 w-4" />
                Sửa hồ sơ
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DetailCard title="Thông tin cá nhân" connected>
              <DetailItem
                icon={<IdCard className="h-4 w-4" />}
                label="Số CCCD"
                value={member.idNumber || '-'}
              />
              <DetailItem
                icon={<CalendarDays className="h-4 w-4" />}
                label="Ngày sinh"
                value={formatDate(member.dateOfBirth)}
              />
              <DetailItem
                icon={<Users className="h-4 w-4" />}
                label="Giới tính"
                value={getGenderLabel(member.gender)}
              />
              <DetailItem
                icon={<Phone className="h-4 w-4" />}
                label="Điện thoại"
                value={member.phoneNumber || '-'}
              />
              <DetailItem
                icon={<MapPin className="h-4 w-4" />}
                label="Địa chỉ"
                value={member.permanentAddress || '-'}
              />
            </DetailCard>

            <DetailCard title="Thông tin lưu trú" connected>
              <DetailItem
                icon={<Home className="h-4 w-4" />}
                label="Ngày vào lưu trú"
                value={formatDate(member.admissionDate)}
              />
              <DetailItem
                icon={<Database className="h-4 w-4" />}
                label="Trạng thái"
                value={getStatusLabel(member.status)}
              />
              <DetailItem
                icon={<GraduationCap className="h-4 w-4" />}
                label="Trường học ID"
                value={member.schoolId || '-'}
              />
            </DetailCard>

            <DetailCard title="Học vụ" connected={false}>
              <PlaceholderData
                title="Chưa kết nối dữ liệu học vụ chi tiết"
                description="Phần này sẽ mapping với residentAcademicInfo, schools và programs ở bước sau."
              />
            </DetailCard>

            <DetailCard title="Phụ huynh / Người giám hộ" connected={false}>
              <PlaceholderData
                title="Chưa kết nối dữ liệu phụ huynh"
                description="Phần này sẽ mapping với bảng parents và quan hệ học viên - phụ huynh ở bước sau."
              />
            </DetailCard>

            <DetailCard title="Tài chính học viên" connected={false}>
              <PlaceholderData
                title="Chưa kết nối dữ liệu tài chính học viên"
                description="Phần này sẽ mapping với Fees, Financial, công nợ và thanh toán sau khi module tài chính hoàn thiện."
              />
            </DetailCard>

            <DetailCard title="Sinh hoạt & Nề nếp" connected={false}>
              <PlaceholderData
                title="Chưa kết nối dữ liệu sinh hoạt"
                description="Phần này sẽ mapping với Attendance, Duties và Daily Routine ở các bước sau."
              />
            </DetailCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCard({
  title,
  children,
  connected,
}: {
  title: string;
  children: React.ReactNode;
  connected: boolean;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-neutral-900">{title}</h3>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            connected
              ? 'bg-green-50 text-green-700'
              : 'bg-neutral-100 text-neutral-500'
          }`}
        >
          {connected ? 'Đã connect data' : 'Chưa connect'}
        </span>
      </div>

      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-neutral-400">{icon}</div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          {label}
        </p>
        <p className="text-sm font-medium text-neutral-800">{value}</p>
      </div>
    </div>
  );
}

function PlaceholderData({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
      <p className="text-sm font-semibold text-neutral-700">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
    </div>
  );
}

function AssignRoomModal({
  error,
  rooms,
  selectedMember,
  roomAssignmentData,
  setRoomAssignmentData,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  error: string | null;
  rooms: any[];
  selectedMember: any;
  roomAssignmentData: RoomAssignmentData;
  setRoomAssignmentData: React.Dispatch<React.SetStateAction<RoomAssignmentData>>;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Gán phòng</h2>
            <p className="text-sm text-neutral-500">
              Phần này đang ghi dữ liệu thật thông qua API gán phòng hiện tại.
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
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4 p-6"
        >
          <div className="rounded-xl bg-neutral-50 p-4">
            <p className="text-sm text-neutral-500">Học viên</p>
            <p className="font-semibold text-neutral-900">
              {selectedMember?.fullName || '-'}
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="roomId">Chọn phòng *</Label>
            <select
              id="roomId"
              value={roomAssignmentData.roomId}
              onChange={(e) =>
                setRoomAssignmentData({
                  ...roomAssignmentData,
                  roomId: e.target.value,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            >
              <option value="">-- Chọn phòng --</option>
              {rooms.map((room: any) => (
                <option key={room.id} value={String(room.id)}>
                  {room.roomCode} - Sức chứa: {room.capacity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="assignedDate">Ngày gán *</Label>
            <Input
              id="assignedDate"
              type="date"
              value={roomAssignmentData.assignedDate}
              onChange={(e) =>
                setRoomAssignmentData({
                  ...roomAssignmentData,
                  assignedDate: e.target.value,
                })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="eventType">Loại sự kiện *</Label>
            <select
              id="eventType"
              value={roomAssignmentData.eventType}
              onChange={(e) =>
                setRoomAssignmentData({
                  ...roomAssignmentData,
                  eventType: e.target.value as RoomEventType,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="new_entry">Nhập lưu trú</option>
              <option value="transfer">Chuyển phòng</option>
              <option value="temporary_leave">Tạm rời</option>
            </select>
          </div>

          <div>
            <Label htmlFor="reason">Lý do</Label>
            <Input
              id="reason"
              value={roomAssignmentData.reason}
              onChange={(e) =>
                setRoomAssignmentData({
                  ...roomAssignmentData,
                  reason: e.target.value,
                })
              }
              placeholder="Nhập lý do nếu có"
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
              {isSubmitting ? 'Đang gán...' : 'Gán phòng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}