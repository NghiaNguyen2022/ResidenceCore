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
  Home,
  AlertCircle,
  Database,
  Mail,
  Briefcase,
} from 'lucide-react';

import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Gender = 'male' | 'female' | 'other';

type RoomEventType = 'new_entry' | 'transfer' | 'temporary_leave' | 'left';

type ParentType = 'father' | 'mother' | 'guardian';

type MemberFormData = {
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  idNumber: string;
  permanentAddress: string;
  phoneNumber: string;
  admissionDate: string;
  notes: string;
};

type ParentFormData = {
  parentType: ParentType;
  fullName: string;
  phoneNumber: string;
  email: string;
  idNumber: string;
  occupation: string;
  address: string;
  notes: string;
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
  admissionDate: new Date().toISOString().split('T')[0],
  notes: '',
};

const defaultParentFormData: ParentFormData = {
  parentType: 'father',
  fullName: '',
  phoneNumber: '',
  email: '',
  idNumber: '',
  occupation: '',
  address: '',
  notes: '',
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

function normalizeText(value?: string) {
  return (value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function normalizePhone(value?: string) {
  return (value || '').replace(/[^\d]/g, '');
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

function getParentTypeLabel(type?: string) {
  if (type === 'father') return 'Cha';
  if (type === 'mother') return 'Mẹ';
  if (type === 'guardian') return 'Người giám hộ';

  return 'Khác';
}

function getParentTypeClass(type?: string) {
  if (type === 'father') return 'bg-blue-50 text-blue-700';
  if (type === 'mother') return 'bg-pink-50 text-pink-700';
  if (type === 'guardian') return 'bg-purple-50 text-purple-700';

  return 'bg-neutral-100 text-neutral-700';
}

function getCurrentRoomIdFromMember(member: any) {
  return member?.currentRoomId ?? member?.roomId ?? null;
}

function hasCurrentRoom(member: any) {
  return Boolean(getCurrentRoomIdFromMember(member));
}

function getRoomActionLabel(member: any) {
  return hasCurrentRoom(member) ? 'Chuyển / Trả phòng' : 'Gán phòng';
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

function getRoomLabel(room: any) {
  return room.roomCode || room.name || room.roomName || `Phòng ID: ${room.id}`;
}

function getRoomCurrentOccupancy(room: any) {
  return Number(
    room.currentOccupancy ??
      room.occupied ??
      room.residentCount ??
      room.residentsCount ??
      room.currentResidents ??
      0
  );
}

function getRoomCapacity(room: any) {
  return Number(room.capacity ?? room.maxCapacity ?? 0);
}

function getRoomAvailableSlots(room: any) {
  const capacity = getRoomCapacity(room);
  const occupied = getRoomCurrentOccupancy(room);

  if (!capacity) return null;

  return Math.max(capacity - occupied, 0);
}

function isRoomFull(room: any) {
  const available = getRoomAvailableSlots(room);

  if (available === null) return false;

  return available <= 0;
}

function validateParentFormBeforeSave({
  parents,
  formData,
  editingParentId,
}: {
  parents: any[];
  formData: ParentFormData;
  editingParentId?: number;
}) {
  const fullName = normalizeText(formData.fullName);
  const phoneNumber = normalizePhone(formData.phoneNumber);

  if (!fullName) return 'Vui lòng nhập họ tên liên hệ.';
  if (!phoneNumber) return 'Vui lòng nhập số điện thoại liên hệ.';

  if (phoneNumber.length < 9 || phoneNumber.length > 15) {
    return 'Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.';
  }

  const otherParents = parents.filter(
    (parent: any) => parent.id !== editingParentId
  );

  if (
    (formData.parentType === 'father' || formData.parentType === 'mother') &&
    otherParents.some((parent: any) => parent.parentType === formData.parentType)
  ) {
    return `Học viên này đã có thông tin ${getParentTypeLabel(
      formData.parentType
    )}. Không thể thêm trùng.`;
  }

  const duplicatedName = otherParents.some(
    (parent: any) => normalizeText(parent.fullName) === fullName
  );

  if (duplicatedName) return 'Tên liên hệ này đã tồn tại cho học viên đang chọn.';

  const duplicatedPhone = otherParents.some(
    (parent: any) => normalizePhone(parent.phoneNumber) === phoneNumber
  );

  if (duplicatedPhone) return 'Số điện thoại này đã tồn tại cho học viên đang chọn.';

  return null;
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
  const [roomAssignmentData, setRoomAssignmentData] =
    useState<RoomAssignmentData>(resetRoomAssignmentForm());

  const membersQuery = trpc.members.list.useQuery({
    search: searchTerm,
    status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
  });

  const statsQuery = trpc.members.getStats.useQuery();
  const roomsQuery = trpc.rooms.list.useQuery();

  const createMember = trpc.members.create.useMutation();
  const updateMember = trpc.members.update.useMutation();
  const deleteMember = trpc.members.delete.useMutation();
  const markAsLeftMutation = trpc.members.markAsLeft.useMutation();
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
      await createMember.mutateAsync({
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        gender: formData.gender,
        idNumber: formData.idNumber || undefined,
        permanentAddress: formData.permanentAddress || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        admissionDate: formData.admissionDate ? new Date(formData.admissionDate) : new Date(),
        notes: formData.notes || undefined,
      });

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
      admissionDate: member.admissionDate
        ? new Date(member.admissionDate).toISOString().split('T')[0]
        : '',
      notes: member.notes || '',
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
      await updateMember.mutateAsync({
        id: editingMember.id,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        gender: formData.gender,
        idNumber: formData.idNumber || undefined,
        permanentAddress: formData.permanentAddress || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        admissionDate: formData.admissionDate ? new Date(formData.admissionDate) : new Date(),
        notes: formData.notes || undefined,
      });

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
    if (
      !confirm(
        'Bạn có chắc chắn muốn XÓA CỨNG học viên này? Thao tác này chỉ nên dùng khi nhập sai hồ sơ.'
      )
    ) {
      return;
    }

    try {
      await deleteMember.mutateAsync({ id });
      refetchMembers();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xóa học viên');
    }
  };

  const handleMarkAsLeft = async (member: any) => {
    if (!member?.id) {
      setError('Không tìm thấy học viên cần ngừng lưu trú');
      return;
    }

    const confirmed = confirm(
      `Bạn có chắc chắn muốn chuyển "${member.fullName}" sang trạng thái Đã rời lưu xá?`
    );

    if (!confirmed) return;

    try {
      await markAsLeftMutation.mutateAsync({
        id: member.id,
        departureDate: new Date(),
      });

      setError(null);
      refetchMembers();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật trạng thái ngừng lưu trú');
    }
  };

  const handleOpenAssignRoomDialog = (member: any) => {
    setSelectedMemberForRoom(member);

    setRoomAssignmentData({
      ...resetRoomAssignmentForm(),
      roomId: '',
      eventType: hasCurrentRoom(member) ? 'transfer' : 'new_entry',
    });

    setError(null);
    setIsAssignRoomDialogOpen(true);
  };

  const handleAssignRoom = async () => {
    if (!selectedMemberForRoom?.id) {
      setError('Không tìm thấy học viên cần xử lý phòng');
      return;
    }

    const memberHasRoom = hasCurrentRoom(selectedMemberForRoom);

    if (!memberHasRoom && roomAssignmentData.eventType !== 'new_entry') {
      setError('Học viên chưa có phòng, chỉ được thực hiện nhập lưu trú / gán phòng mới.');
      return;
    }

    if (memberHasRoom && roomAssignmentData.eventType === 'new_entry') {
      setError('Học viên đã có phòng, chỉ được chuyển phòng hoặc trả phòng.');
      return;
    }

    if (roomAssignmentData.eventType === 'transfer' && !roomAssignmentData.roomId) {
      setError('Vui lòng chọn phòng chuyển đến.');
      return;
    }

    if (roomAssignmentData.eventType === 'new_entry' && !roomAssignmentData.roomId) {
      setError('Vui lòng chọn phòng.');
      return;
    }

    const effectiveRoomId =
      roomAssignmentData.eventType === 'left'
        ? getCurrentRoomIdFromMember(selectedMemberForRoom)
        : roomAssignmentData.roomId;

    if (!effectiveRoomId) {
      setError('Không xác định được phòng hiện tại để trả phòng.');
      return;
    }

    if (
      roomAssignmentData.eventType === 'transfer' ||
      roomAssignmentData.eventType === 'new_entry'
    ) {
      const selectedRoom = rooms.find(
        (room: any) => String(room.id) === String(effectiveRoomId)
      );

      if (selectedRoom && isRoomFull(selectedRoom)) {
        setError('Phòng đã đủ sức chứa, vui lòng chọn phòng khác.');
        return;
      }

      if (
        roomAssignmentData.eventType === 'transfer' &&
        String(effectiveRoomId) === String(getCurrentRoomIdFromMember(selectedMemberForRoom))
      ) {
        setError('Phòng chuyển đến không được trùng với phòng hiện tại.');
        return;
      }
    }

    try {
      await assignRoomMutation.mutateAsync({
        residentId: selectedMemberForRoom.id,
        roomId: parseInt(String(effectiveRoomId)),
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
      setError(err.message || 'Lỗi khi xử lý phòng');
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Quản lý lưu trú</p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">
              Học viên lưu trú
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-500">
              Quản lý hồ sơ, trạng thái lưu trú, thông tin liên hệ và thao tác phòng ở.
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

        {(membersQuery.error || statsQuery.error || error) && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Có lỗi khi xử lý dữ liệu học viên.</p>
                <p className="mt-1 text-sm">
                  {error ||
                    membersQuery.error?.message ||
                    statsQuery.error?.message ||
                    'Vui lòng kiểm tra kết nối API hoặc backend.'}
                </p>
              </div>
            </div>
          </div>
        )}

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

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-lg font-bold text-neutral-900">Danh sách học viên</h2>
            <p className="text-sm text-neutral-500">
              {members.length} học viên đang hiển thị từ dữ liệu hệ thống
            </p>
          </div>

          <div className="overflow-x-auto">
            {membersQuery.isLoading ? (
              <div className="p-10 text-center text-sm text-neutral-500">
                Đang tải dữ liệu...
              </div>
            ) : members.length === 0 ? (
              <div className="p-10 text-center">
                <p className="font-semibold text-neutral-900">Không có học viên nào</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Thử thay đổi bộ lọc hoặc thêm học viên mới.
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[1180px]">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Học viên
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Mã lưu trú
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Phòng
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
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
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

                      <td className="px-5 py-4 text-sm font-medium text-neutral-700">
                        {member.residentCode || '-'}
                      </td>

                      <td className="px-5 py-4 text-sm text-neutral-700">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            getRoomLabelFromMember(member) === 'Chưa gán'
                              ? 'bg-orange-50 text-orange-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {getRoomLabelFromMember(member)}
                        </span>
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

                          {member.status !== 'transferred_out' && (
                            <button
                              type="button"
                              onClick={() => handleOpenAssignRoomDialog(member)}
                              className="rounded-lg px-2 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-50"
                              title={getRoomActionLabel(member)}
                            >
                              {hasCurrentRoom(member) ? 'Chuyển/Trả' : 'Gán phòng'}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleEditMember(member)}
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                            title="Sửa"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {member.status !== 'transferred_out' && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsLeft(member)}
                              className="rounded-lg px-2 py-1 text-xs font-semibold text-orange-700 transition hover:bg-orange-50"
                              title="Ngừng lưu trú"
                              disabled={markAsLeftMutation.isPending}
                            >
                              Ngừng
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteMember(member.id)}
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                            title="Xóa cứng hồ sơ"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {isAddDialogOpen && (
          <MemberFormModal
            title="Thêm học viên"
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
            title="Cập nhật học viên"
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
              Cập nhật thông tin hồ sơ học viên lưu trú.
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

          <div>
            <Label htmlFor="fullName">Tên học viên *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="Nhập họ tên"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
              />
            </div>

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
          </div>

          <div>
            <Label htmlFor="idNumber">Số CCCD</Label>
            <Input
              id="idNumber"
              value={formData.idNumber}
              onChange={(e) =>
                setFormData({ ...formData, idNumber: e.target.value })
              }
              placeholder="Nhập số CCCD"
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber">Điện thoại</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
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

          <div>
            <Label htmlFor="admissionDate">Ngày vào lưu trú *</Label>
            <Input
              id="admissionDate"
              type="date"
              value={formData.admissionDate}
              onChange={(e) =>
                setFormData({ ...formData, admissionDate: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Ghi chú thêm về học viên nếu có"
              className="min-h-20"
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
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-xl">
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
              {member.status !== 'transferred_out' && (
                <button
                  type="button"
                  onClick={onAssignRoom}
                  className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                >
                  <DoorOpen className="h-4 w-4" />
                  {getRoomActionLabel(member)}
                </button>
              )}

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

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <DetailCard title="Thông tin cá nhân">
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

            <DetailCard title="Thông tin lưu trú">
              <DetailItem
                icon={<DoorOpen className="h-4 w-4" />}
                label="Phòng hiện tại"
                value={getRoomLabelFromMember(member)}
              />
              <DetailItem
                icon={<Home className="h-4 w-4" />}
                label="Ngày vào lưu trú"
                value={formatDate(member.admissionDate)}
              />
              <DetailItem
                icon={<Database className="h-4 w-4" />}
                label="Ngày rời"
                value={formatDate(member.departureDate)}
              />
              <DetailItem
                icon={<Database className="h-4 w-4" />}
                label="Trạng thái"
                value={getStatusLabel(member.status)}
              />
              <DetailItem
                icon={<Database className="h-4 w-4" />}
                label="Ghi chú"
                value={member.notes || '-'}
              />
            </DetailCard>

            <DetailCard title="Phụ huynh / Người giám hộ">
              <ParentsSection residentId={member.id} />
            </DetailCard>

            <DetailCard title="Học vụ">
              <PlaceholderData
                title="Chưa kết nối dữ liệu học vụ chi tiết"
                description="Phần này sẽ mapping với residentAcademicInfo, schools và programs ở bước sau."
              />
            </DetailCard>

            <DetailCard title="Tài chính học viên">
              <PlaceholderData
                title="Chưa kết nối dữ liệu tài chính học viên"
                description="Phần này sẽ mapping với Fees, Financial, công nợ và thanh toán sau khi module tài chính hoàn thiện."
              />
            </DetailCard>

            <DetailCard title="Sinh hoạt & Nề nếp">
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
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-base font-bold text-neutral-900">{title}</h3>
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

function ParentsSection({ residentId }: { residentId: number }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<any>(null);
  const [parentForm, setParentForm] = useState<ParentFormData>(
    defaultParentFormData
  );
  const [parentError, setParentError] = useState<string | null>(null);

  const parentsQuery = trpc.members.getParents.useQuery(
    { residentId },
    {
      enabled: Boolean(residentId),
    }
  );

  const createParentMutation = trpc.members.createParent.useMutation();
  const updateParentMutation = trpc.members.updateParent.useMutation();
  const deleteParentMutation = trpc.members.deleteParent.useMutation();

  const parents = parentsQuery.data || [];

  const openCreateParent = () => {
    setEditingParent(null);
    setParentForm(defaultParentFormData);
    setParentError(null);
    setIsFormOpen(true);
  };

  const openEditParent = (parent: any) => {
    setEditingParent(parent);

    setParentForm({
      parentType: parent.parentType || 'father',
      fullName: parent.fullName || '',
      phoneNumber: parent.phoneNumber || '',
      email: parent.email || '',
      idNumber: parent.idNumber || '',
      occupation: parent.occupation || '',
      address: parent.address || '',
      notes: parent.notes || '',
    });

    setParentError(null);
    setIsFormOpen(true);
  };

  const handleSaveParent = async () => {
    const validationMessage = validateParentFormBeforeSave({
      parents,
      formData: parentForm,
      editingParentId: editingParent?.id,
    });

    if (validationMessage) {
      setParentError(validationMessage);
      return;
    }

    try {
      const payload = {
        parentType: parentForm.parentType,
        fullName: parentForm.fullName.trim(),
        phoneNumber: parentForm.phoneNumber.trim(),
        email: parentForm.email || undefined,
        idNumber: parentForm.idNumber || undefined,
        occupation: parentForm.occupation || undefined,
        address: parentForm.address || undefined,
        notes: parentForm.notes || undefined,
      };

      if (editingParent?.id) {
        await updateParentMutation.mutateAsync({
          id: editingParent.id,
          ...payload,
        });
      } else {
        await createParentMutation.mutateAsync({
          residentId,
          ...payload,
        });
      }

      setIsFormOpen(false);
      setEditingParent(null);
      setParentForm(defaultParentFormData);
      setParentError(null);

      parentsQuery.refetch();
    } catch (err: any) {
      setParentError(err.message || 'Lỗi khi lưu thông tin liên hệ.');
    }
  };

  const handleDeleteParent = async (parentId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) {
      return;
    }

    try {
      await deleteParentMutation.mutateAsync({ id: parentId });
      parentsQuery.refetch();
    } catch (err: any) {
      setParentError(err.message || 'Lỗi khi xóa liên hệ.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-800">
            Danh sách liên hệ
          </p>
          <p className="text-xs text-neutral-500">
            Một học viên chỉ có tối đa 1 Cha, 1 Mẹ. Người giám hộ có thể nhiều
            nếu không trùng tên hoặc số điện thoại.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateParent}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm liên hệ
        </button>
      </div>

      {parentError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {parentError}
        </div>
      )}

      {parentsQuery.isLoading ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">
          Đang tải danh sách liên hệ...
        </div>
      ) : parents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
          <p className="text-sm font-semibold text-neutral-700">
            Chưa có liên hệ phụ huynh / người giám hộ
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Bấm “Thêm liên hệ” để tạo liên hệ thật cho học viên này.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {parents.map((parent: any) => (
            <div
              key={parent.id}
              className="rounded-xl border border-neutral-200 bg-white p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-neutral-900">
                      {parent.fullName}
                    </p>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getParentTypeClass(
                        parent.parentType
                      )}`}
                    >
                      {getParentTypeLabel(parent.parentType)}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-neutral-600 md:grid-cols-2">
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-neutral-400" />
                      {parent.phoneNumber || '-'}
                    </p>

                    <p className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-neutral-400" />
                      {parent.email || '-'}
                    </p>

                    <p className="flex items-center gap-1.5">
                      <IdCard className="h-3.5 w-3.5 text-neutral-400" />
                      {parent.idNumber || '-'}
                    </p>

                    <p className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-neutral-400" />
                      {parent.occupation || '-'}
                    </p>
                  </div>

                  {parent.address && (
                    <p className="mt-2 text-sm text-neutral-600">
                      Địa chỉ: {parent.address}
                    </p>
                  )}

                  {parent.notes && (
                    <p className="mt-2 text-sm text-neutral-500">
                      Ghi chú: {parent.notes}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => openEditParent(parent)}
                    className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                    title="Sửa liên hệ"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteParent(parent.id)}
                    className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                    title="Xóa liên hệ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <ParentFormInline
          title={editingParent ? 'Sửa liên hệ' : 'Thêm liên hệ'}
          formData={parentForm}
          setFormData={setParentForm}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingParent(null);
            setParentForm(defaultParentFormData);
            setParentError(null);
          }}
          onSubmit={handleSaveParent}
          isSubmitting={
            createParentMutation.isPending || updateParentMutation.isPending
          }
        />
      )}
    </div>
  );
}
function ParentFormInline({
  title,
  formData,
  setFormData,
  onCancel,
  onSubmit,
  isSubmitting,
}: {
  title: string;
  formData: ParentFormData;
  setFormData: React.Dispatch<React.SetStateAction<ParentFormData>>;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
      <div className="mb-4">
        <p className="font-semibold text-neutral-900">{title}</p>
        <p className="text-xs text-neutral-500">
          Liên hệ này sẽ được gắn trực tiếp với học viên đang xem hồ sơ.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Loại liên hệ *</Label>
          <select
            value={formData.parentType}
            onChange={(e) =>
              setFormData({
                ...formData,
                parentType: e.target.value as ParentType,
              })
            }
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="father">Cha</option>
            <option value="mother">Mẹ</option>
            <option value="guardian">Người giám hộ</option>
          </select>
        </div>

        <div>
          <Label>Họ tên liên hệ *</Label>
          <Input
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            placeholder="Nhập họ tên cha/mẹ/người giám hộ"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Điện thoại *</Label>
            <Input
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              placeholder="Nhập số điện thoại"
              required
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Nhập email"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>CCCD</Label>
            <Input
              value={formData.idNumber}
              onChange={(e) =>
                setFormData({ ...formData, idNumber: e.target.value })
              }
              placeholder="Nhập CCCD nếu có"
            />
          </div>

          <div>
            <Label>Nghề nghiệp</Label>
            <Input
              value={formData.occupation}
              onChange={(e) =>
                setFormData({ ...formData, occupation: e.target.value })
              }
              placeholder="Nhập nghề nghiệp"
            />
          </div>
        </div>

        <div>
          <Label>Địa chỉ</Label>
          <Textarea
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="Nhập địa chỉ liên hệ"
            className="min-h-20"
          />
        </div>

        <div>
          <Label>Ghi chú</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Ghi chú thêm nếu có"
            className="min-h-20"
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-blue-100 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu liên hệ'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RoomCapacityNotice({
  rooms,
  selectedRoomId,
}: {
  rooms: any[];
  selectedRoomId: string;
}) {
  const selectedRoom = rooms.find(
    (room: any) => String(room.id) === String(selectedRoomId)
  );

  if (!selectedRoom) return null;

  const capacity = getRoomCapacity(selectedRoom);
  const occupied = getRoomCurrentOccupancy(selectedRoom);
  const available = getRoomAvailableSlots(selectedRoom);
  const full = isRoomFull(selectedRoom);

  if (!capacity) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600">
        Chưa có dữ liệu sức chứa chi tiết cho phòng này.
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border p-3 text-sm ${
        full
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-green-200 bg-green-50 text-green-700'
      }`}
    >
      <p className="font-semibold">
        {getRoomLabel(selectedRoom)}: {occupied}/{capacity} người
      </p>
      <p className="mt-1">
        {full
          ? 'Phòng này đã đủ sức chứa, không nên gán thêm học viên.'
          : `Còn ${available} chỗ trống.`}
      </p>
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
  const memberHasRoom = hasCurrentRoom(selectedMember);
  const isReturningRoom = roomAssignmentData.eventType === 'left';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              {memberHasRoom ? 'Chuyển / Trả phòng' : 'Gán phòng'}
            </h2>
            <p className="text-sm text-neutral-500">
              {memberHasRoom
                ? 'Học viên đã có phòng, chỉ được chuyển phòng hoặc trả phòng.'
                : 'Học viên chưa có phòng, thực hiện gán phòng mới.'}
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
            <p className="mt-1 text-xs text-neutral-500">
              Phòng hiện tại: {getRoomLabelFromMember(selectedMember)}
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="eventType">Loại xử lý *</Label>
            <select
              id="eventType"
              value={roomAssignmentData.eventType}
              onChange={(e) =>
                setRoomAssignmentData({
                  ...roomAssignmentData,
                  eventType: e.target.value as RoomEventType,
                  roomId:
                    e.target.value === 'left'
                      ? ''
                      : roomAssignmentData.roomId,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {!memberHasRoom && (
                <option value="new_entry">
                  Nhập lưu trú / Gán phòng mới
                </option>
              )}

              {memberHasRoom && (
                <>
                  <option value="transfer">Chuyển phòng</option>
                  <option value="left">Trả phòng</option>
                </>
              )}
            </select>
          </div>

          {!isReturningRoom && (
            <div>
              <Label htmlFor="roomId">
                {memberHasRoom ? 'Phòng chuyển đến *' : 'Chọn phòng *'}
              </Label>

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
                required={!isReturningRoom}
              >
                <option value="">
                  {memberHasRoom
                    ? '-- Chọn phòng chuyển đến --'
                    : '-- Chọn phòng --'}
                </option>

                {rooms.map((room: any) => {
                  const capacity = getRoomCapacity(room);
                  const occupied = getRoomCurrentOccupancy(room);
                  const available = getRoomAvailableSlots(room);
                  const full = isRoomFull(room);

                  const currentRoomId =
                    getCurrentRoomIdFromMember(selectedMember);
                  const isCurrentRoom =
                    String(room.id) === String(currentRoomId);

                  return (
                    <option
                      key={room.id}
                      value={String(room.id)}
                      disabled={full || isCurrentRoom}
                    >
                      {getRoomLabel(room)}
                      {capacity
                        ? ` - ${occupied}/${capacity} người${
                            available !== null ? ` - còn ${available}` : ''
                          }`
                        : ''}
                      {isCurrentRoom ? ' - Phòng hiện tại' : ''}
                      {full ? ' - Đã đầy' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div>
            <Label htmlFor="assignedDate">Ngày xử lý *</Label>
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

          {!isReturningRoom && roomAssignmentData.roomId && (
            <RoomCapacityNotice
              rooms={rooms}
              selectedRoomId={roomAssignmentData.roomId}
            />
          )}

          {isReturningRoom && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">
              <p className="font-semibold">Trả phòng hiện tại</p>
              <p className="mt-1">
                Học viên sẽ được ghi nhận trả phòng:{' '}
                {getRoomLabelFromMember(selectedMember)}. Sau thao tác này, học
                viên không còn phòng hiện tại cho đến khi được gán lại.
              </p>
            </div>
          )}

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
              {isSubmitting
                ? 'Đang xử lý...'
                : isReturningRoom
                ? 'Trả phòng'
                : memberHasRoom
                ? 'Chuyển phòng'
                : 'Gán phòng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}