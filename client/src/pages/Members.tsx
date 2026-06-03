'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      Clock,
      Edit2,
      Eye,
      Plus,
      Search,
      Trash2,
      UserCheck,
      Users,
      UserX,
} from 'lucide-react';

import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { useSystemDisplayMode } from '@/hooks/useSystemDisplayMode';
import { Input } from '@/components/ui/input';
import { ConfigurableStatCard } from '@/components/configurable/ConfigurableStatCard';
import {
      ConfigurableColumn,
      ConfigurableDataTable,
} from '@/components/configurable/ConfigurableDataTable';
import { AssignRoomModal } from '@/components/members/AssignRoomModal';
import { MemberDetailModal } from '@/components/members/MemberDetailModal';
import { MemberFormModal } from '@/components/members/MemberFormModal';
import { SimpleMemberCard } from '@/components/members/SimpleMemberCard';
import type {
      CreateResidentUserFormData,
      MemberFormData,
      QuickRoomFormData,
      RoomAssignmentData,
} from '@/components/members/memberTypes';
import {
      defaultQuickRoomFormData,
      resetCreateResidentUserForm,
      resetMemberForm,
      resetRoomAssignmentForm,
} from '@/components/members/memberTypes';
import {
      formatDate,
      getCurrentRoomIdFromMember,
      getGenderLabel,
      getRoomActionLabel,
      getRoomLabelFromMember,
      getStatusClass,
      getStatusLabel,
      hasCurrentRoom,
      isRoomFull,
} from '@/components/members/memberUtils';

export default function Members() {
      const { isSimple } = useSystemDisplayMode();

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
      const [createUserData, setCreateUserData] = useState<CreateResidentUserFormData>(
            resetCreateResidentUserForm()
      );
      const [roomAssignmentData, setRoomAssignmentData] =
            useState<RoomAssignmentData>(resetRoomAssignmentForm());
      const [quickRoomFormData, setQuickRoomFormData] =
            useState<QuickRoomFormData>(defaultQuickRoomFormData);

      const membersQuery = trpc.members.list.useQuery({
            search: searchTerm,
            status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
      });

      const statsQuery = trpc.members.getStats.useQuery();
      const roomsQuery = trpc.rooms.list.useQuery();
      const residentsWithoutUserQuery = trpc.members.listResidentsWithoutUser.useQuery(undefined, {
            refetchOnWindowFocus: false,
      });

      const createMember = trpc.members.create.useMutation();
      const updateMember = trpc.members.update.useMutation();
      const deleteMember = trpc.members.delete.useMutation();
      const markAsLeftMutation = trpc.members.markAsLeft.useMutation();
      const assignRoomMutation = trpc.rooms.assignResident.useMutation();
      const createRoomMutation = trpc.rooms.create.useMutation();
      const suggestUsernameMutation = trpc.members.suggestResidentUsername.useMutation();
      const createResidentUserMutation = trpc.members.createResidentUser.useMutation();
      const bulkCreateResidentUsersMutation = trpc.members.bulkCreateResidentUsers.useMutation({
            onSuccess: async () => {
                  await membersQuery.refetch();
                  await statsQuery.refetch();
                  await residentsWithoutUserQuery.refetch();
            },
      });

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
            setCreateUserData(resetCreateResidentUserForm());
            setError(null);
            setIsAddDialogOpen(true);
      };

      const handleSuggestUsername = async () => {
            const fullName = formData.fullName.trim();

            if (!fullName) {
                  setError('Vui lòng nhập họ tên học viên trước khi gợi ý tên đăng nhập.');
                  return;
            }

            try {
                  const result = await suggestUsernameMutation.mutateAsync({
                        fullName,
                  });

                  setCreateUserData((current) => ({
                        ...current,
                        username: result.username,
                  }));

                  setError(null);
            } catch (err: any) {
                  setError(err.message || 'Không thể gợi ý tên đăng nhập.');
            }
      };

      const handleAddMember = async () => {
            try {
                  const createdMember = await createMember.mutateAsync({
                        holyName: formData.holyName || undefined,
                        fullName: formData.fullName,
                        dateOfBirth: formData.dateOfBirth
                              ? new Date(formData.dateOfBirth)
                              : undefined,
                        gender: formData.gender,
                        idNumber: formData.idNumber || undefined,
                        permanentAddress: formData.permanentAddress || undefined,
                        phoneNumber: formData.phoneNumber || undefined,
                        admissionDate: formData.admissionDate
                              ? new Date(formData.admissionDate)
                              : new Date(),
                        notes: formData.notes || undefined,
                  });

                  const createdResidentId =
                        (createdMember as any)?.id ??
                        (createdMember as any)?.member?.id ??
                        (createdMember as any)?.resident?.id ??
                        null;

                  if (createUserData.createUserAccount && createdResidentId) {
                        await createResidentUserMutation.mutateAsync({
                              residentId: createdResidentId,
                              username: createUserData.username.trim() || undefined,
                              temporaryPassword: createUserData.temporaryPassword || '123456',
                              mustChangePassword: createUserData.mustChangePassword,
                        });
                  }

                  setIsAddDialogOpen(false);
                  setFormData(resetMemberForm());
                  setCreateUserData(resetCreateResidentUserForm());
                  setError(null);
                  refetchMembers();
            } catch (err: any) {
                  setError(err.message || 'Lỗi khi thêm học viên');
            }
      };

      const handleEditMember = (member: any) => {
            setEditingMember(member);
            setCreateUserData(resetCreateResidentUserForm());
            setFormData({
                  holyName: member.holyName || '',
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
                        holyName: formData.holyName || undefined,
                        fullName: formData.fullName,
                        dateOfBirth: formData.dateOfBirth
                              ? new Date(formData.dateOfBirth)
                              : undefined,
                        gender: formData.gender,
                        idNumber: formData.idNumber || undefined,
                        permanentAddress: formData.permanentAddress || undefined,
                        phoneNumber: formData.phoneNumber || undefined,
                        admissionDate: formData.admissionDate
                              ? new Date(formData.admissionDate)
                              : new Date(),
                        notes: formData.notes || undefined,
                  });

                  setIsEditDialogOpen(false);
                  setEditingMember(null);
                  setFormData(resetMemberForm());
                  setCreateUserData(resetCreateResidentUserForm());
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
            setQuickRoomFormData(defaultQuickRoomFormData);
            setError(null);
            setIsAssignRoomDialogOpen(true);
      };

      const handleQuickCreateRoom = async () => {
            const roomCode = quickRoomFormData.roomCode.trim();
            const capacity = Number(quickRoomFormData.capacity);

            if (!roomCode) {
                  setError('Vui lòng nhập tên hoặc mã phòng.');
                  return;
            }

            if (!capacity || capacity <= 0) {
                  setError('Sức chứa phòng phải lớn hơn 0.');
                  return;
            }

            try {
                  const createdRoom = await createRoomMutation.mutateAsync({
                        roomCode,
                        capacity,
                        notes: quickRoomFormData.notes.trim() || undefined,
                  });

                  await roomsQuery.refetch();

                  const createdRoomId =
                        (createdRoom as any)?.id ??
                        (createdRoom as any)?.room?.id ??
                        null;

                  setRoomAssignmentData((current) => ({
                        ...current,
                        roomId: createdRoomId ? String(createdRoomId) : current.roomId,
                  }));

                  setQuickRoomFormData(defaultQuickRoomFormData);
                  setError(null);
            } catch (err: any) {
                  setError(err.message || 'Lỗi khi thêm phòng nhanh');
            }
      };

      const handleAssignRoom = async () => {
            if (!selectedMemberForRoom?.id) {
                  setError('Không tìm thấy học viên cần xử lý phòng');
                  return;
            }

            const memberHasRoom = hasCurrentRoom(selectedMemberForRoom);

            if (!memberHasRoom && roomAssignmentData.eventType !== 'new_entry') {
                  setError(
                        'Học viên chưa có phòng, chỉ được thực hiện nhập lưu trú / gán phòng mới.'
                  );
                  return;
            }

            if (memberHasRoom && roomAssignmentData.eventType === 'new_entry') {
                  setError('Học viên đã có phòng, chỉ được chuyển phòng hoặc trả phòng.');
                  return;
            }

            if (
                  roomAssignmentData.eventType === 'transfer' &&
                  !roomAssignmentData.roomId
            ) {
                  setError('Vui lòng chọn phòng chuyển đến.');
                  return;
            }

            if (
                  roomAssignmentData.eventType === 'new_entry' &&
                  !roomAssignmentData.roomId
            ) {
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
                        String(effectiveRoomId) ===
                        String(getCurrentRoomIdFromMember(selectedMemberForRoom))
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

      const handleBulkCreateResidentUsers = async () => {
            const residentsWithoutUser = residentsWithoutUserQuery.data ?? [];

            if (residentsWithoutUser.length === 0) {
                  setError('Tất cả học viên hiện đã có tài khoản đăng nhập.');
                  return;
            }

            const confirmed = window.confirm(
                  `Tạo tài khoản đăng nhập cho ${residentsWithoutUser.length} học viên chưa có tài khoản?`
            );

            if (!confirmed) return;

            try {
                  const result = await bulkCreateResidentUsersMutation.mutateAsync({
                        residentIds: residentsWithoutUser.map((resident: any) => resident.id),
                        temporaryPassword: '123456',
                        mustChangePassword: true,
                  });

                  setError(null);

                  window.alert(
                        `Đã tạo tài khoản: ${result.success}/${result.total}. Lỗi: ${result.failed}.`
                  );
            } catch (err: any) {
                  setError(err.message || 'Không thể tạo tài khoản hàng loạt.');
            }
      };

      const handleCreateUserFromDetail = async (member: any) => {
            if (!member?.id) {
                  setError('Không tìm thấy học viên để tạo tài khoản.');
                  return;
            }

            try {
                  const suggestResult = await suggestUsernameMutation.mutateAsync({
                        fullName: member.fullName,
                  });

                  await createResidentUserMutation.mutateAsync({
                        residentId: member.id,
                        username: suggestResult.username,
                        temporaryPassword: '123456',
                        mustChangePassword: true,
                  });

                  const refetchResult = await membersQuery.refetch();
                  await statsQuery.refetch();

                  const refreshedMember = (refetchResult.data ?? []).find(
                        (item: any) => item.id === member.id
                  );

                  if (refreshedMember) {
                        setSelectedMember(refreshedMember);
                  }

                  setError(null);
            } catch (err: any) {
                  setError(err.message || 'Không thể tạo tài khoản cho học viên.');
            }
      };

      const clearFilters = () => {
            setSearchTerm('');
            setStatusFilter('all');
      };

      const memberColumns = useMemo<ConfigurableColumn<any>[]>(
            () => [
                  {
                        key: 'student',
                        label: 'Học viên',
                        sortable: true,
                        sortValue: (member) => member.fullName || '',
                        render: (member) => (
                              <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                                          {member.fullName?.charAt(0)?.toUpperCase() || 'H'}
                                    </div>
                                    <div>
                                          <p className="font-semibold text-neutral-900">
                                                {member.fullName || '-'}
                                          </p>
                                          <p className="text-xs text-neutral-500">ID: {member.id}</p>
                                    </div>
                              </div>
                        ),
                  },
                  {
                        key: 'residentCode',
                        label: 'Mã lưu trú',
                        sortable: true,
                        sortValue: (member) => member.residentCode || '',
                        render: (member) => member.residentCode || '-',
                  },
                  {
                        key: 'room',
                        label: 'Phòng',
                        sortable: true,
                        sortValue: (member) => getRoomLabelFromMember(member),
                        render: (member) => getRoomLabelFromMember(member),
                  },
                  {
                        key: 'phone',
                        label: 'Điện thoại',
                        sortable: true,
                        sortValue: (member) => member.phoneNumber || '',
                        render: (member) => member.phoneNumber || '-',
                  },
                  {
                        key: 'gender',
                        label: 'Giới tính',
                        sortable: true,
                        sortValue: (member) => getGenderLabel(member.gender),
                        render: (member) => getGenderLabel(member.gender),
                  },
                  {
                        key: 'admissionDate',
                        label: 'Ngày vào',
                        sortable: true,
                        sortValue: (member) =>
                              member.admissionDate
                                    ? new Date(member.admissionDate).getTime()
                                    : 0,
                        render: (member) => formatDate(member.admissionDate),
                  },
                  {
                        key: 'status',
                        label: 'Trạng thái',
                        sortable: true,
                        sortValue: (member) => getStatusLabel(member.status),
                        render: (member) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                          member.status
                                    )}`}
                              >
                                    {getStatusLabel(member.status)}
                              </span>
                        ),
                  },
                  {
                        key: 'actions',
                        label: 'Hành động',
                        className: 'min-w-[220px]',
                        render: (member) => (
                              <div className="flex flex-wrap items-center gap-1.5">
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
                                                className="rounded-lg px-2 py-1 text-xs font-semibold text-orange-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                        ),
                  },
            ],
            [markAsLeftMutation.isPending]
      );

      return (
            <ResidenceCareLayout>
                  <div className="space-y-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                    <p className="text-sm font-semibold text-blue-600">
                                          Quản lý lưu trú
                                    </p>
                                    <h1 className="text-3xl font-bold text-neutral-900">
                                          Học viên lưu trú
                                    </h1>
                                    <p className="mt-1 text-sm text-neutral-500">
                                          Quản lý hồ sơ học viên, phòng ở và thông tin gia đình trong một màn hình.
                                    </p>
                              </div>

                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    {(residentsWithoutUserQuery.data?.length ?? 0) > 0 && (
                                          <button
                                                type="button"
                                                onClick={handleBulkCreateResidentUsers}
                                                disabled={bulkCreateResidentUsersMutation.isPending}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                          >
                                                <UserCheck className="h-4 w-4" />
                                                {bulkCreateResidentUsersMutation.isPending
                                                      ? 'Đang tạo...'
                                                      : `Tạo tài khoản học viên (${residentsWithoutUserQuery.data?.length ?? 0})`}
                                          </button>
                                    )}

                                    <button
                                          type="button"
                                          onClick={handleOpenAddDialog}
                                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                                    >
                                          <Plus className="h-4 w-4" />
                                          Thêm học viên
                                    </button>
                              </div>
                        </div>

                        {(membersQuery.error || statsQuery.error || error) && (
                              <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                                    <div>
                                          <p className="font-semibold">
                                                Có lỗi khi xử lý dữ liệu học viên.
                                          </p>
                                          <p className="mt-1 text-sm">
                                                {error ||
                                                      membersQuery.error?.message ||
                                                      statsQuery.error?.message ||
                                                      'Vui lòng kiểm tra kết nối API hoặc backend.'}
                                          </p>
                                    </div>
                              </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                              <ConfigurableStatCard
                                    moduleKey="members"
                                    cardKey="members.total"
                                    label="Tổng số"
                                    value={stats.total}
                                    description="Tổng học viên trong hệ thống"
                                    defaultSettings={{ decimalPlaces: 0 }}
                                    icon={<Users className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="members"
                                    cardKey="members.active"
                                    label="Đang ở"
                                    value={stats.active}
                                    description="Học viên đang lưu trú"
                                    defaultSettings={{ decimalPlaces: 0 }}
                                    icon={<UserCheck className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="members"
                                    cardKey="members.transferredOut"
                                    label="Đã rời"
                                    value={stats.transferred_out}
                                    description="Học viên đã rời lưu xá"
                                    defaultSettings={{ decimalPlaces: 0 }}
                                    icon={<UserX className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="members"
                                    cardKey="members.inactive"
                                    label="Tạm rời"
                                    value={stats.inactive}
                                    description="Học viên tạm vắng/tạm ngưng"
                                    defaultSettings={{ decimalPlaces: 0 }}
                                    icon={<Clock className="h-6 w-6" />}
                              />
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_auto]">
                                    <div className="relative">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                          <Input
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                placeholder="Tìm theo tên, mã lưu trú, số điện thoại..."
                                                className="pl-10"
                                          />
                                    </div>

                                    <select
                                          value={statusFilter}
                                          onChange={(event) => setStatusFilter(event.target.value)}
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
                                          className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                                    >
                                          Xóa lọc
                                    </button>
                              </div>
                        </div>

                        <div>
                              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                          <h2 className="text-lg font-bold text-neutral-900">
                                                Danh sách học viên
                                          </h2>
                                          <p className="text-sm text-neutral-500">
                                                {members.length} học viên đang hiển thị từ dữ liệu hệ thống
                                          </p>
                                    </div>
                              </div>

                              {membersQuery.isLoading ? (
                                    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
                                          Đang tải dữ liệu học viên...
                                    </div>
                              ) : members.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center">
                                          <p className="font-semibold text-neutral-800">Không có học viên nào</p>
                                          <p className="mt-1 text-sm text-neutral-500">
                                                Thử thay đổi bộ lọc hoặc thêm học viên mới.
                                          </p>
                                    </div>
                              ) : isSimple ? (
                                    <div className="grid gap-3">
                                          {members.map((member: any) => (
                                                <SimpleMemberCard
                                                      key={member.id}
                                                      member={member}
                                                      onView={(selectedMember) => {
                                                            setSelectedMember(selectedMember);
                                                            setIsDetailDialogOpen(true);
                                                      }}
                                                      onEdit={(selectedMember) => {
                                                            openEditModal(selectedMember);
                                                      }}
                                                      onAssignRoom={(selectedMember) => {
                                                            setSelectedMemberForRoom(selectedMember);
                                                            setRoomAssignmentData(resetRoomAssignmentForm());
                                                            setIsAssignRoomDialogOpen(true);
                                                      }}
                                                      onTransferRoom={(selectedMember) => {
                                                            setSelectedMemberForRoom(selectedMember);
                                                            setRoomAssignmentData({
                                                                  ...resetRoomAssignmentForm(),
                                                                  eventType: 'transfer',
                                                            });
                                                            setIsAssignRoomDialogOpen(true);
                                                      }}
                                                      onReturnRoom={(selectedMember) => {
                                                            setSelectedMemberForRoom(selectedMember);
                                                            setRoomAssignmentData({
                                                                  ...resetRoomAssignmentForm(),
                                                                  eventType: 'left',
                                                            });
                                                            setIsAssignRoomDialogOpen(true);
                                                      }}
                                                      onOpenFamily={(selectedMember) => {
                                                            setSelectedMember(selectedMember);
                                                            setIsDetailDialogOpen(true);
                                                      }}
                                                      onCreateUser={handleCreateUserFromDetail}
                                                      isCreatingUser={
                                                            createResidentUserMutation.isPending ||
                                                            suggestUsernameMutation.isPending
                                                      }
                                                />
                                          ))}
                                    </div>
                              ) : (
                                    <ConfigurableDataTable
                                          moduleKey="members"
                                          tableKey="members.list"
                                          columns={memberColumns}
                                          data={members}
                                          getRowKey={(member, index) => member.id || index}
                                          isLoading={membersQuery.isLoading}
                                          loadingText="Đang tải dữ liệu học viên..."
                                          emptyTitle="Không có học viên nào"
                                          emptyDescription="Thử thay đổi bộ lọc hoặc thêm học viên mới."
                                    />
                              )}
                        </div>

                        {isAddDialogOpen && (
                              <MemberFormModal
                                    title="Thêm học viên"
                                    error={error}
                                    formData={formData}
                                    setFormData={setFormData}
                                    createUserData={createUserData}
                                    setCreateUserData={setCreateUserData}
                                    onSuggestUsername={handleSuggestUsername}
                                    onClose={() => setIsAddDialogOpen(false)}
                                    onSubmit={handleAddMember}
                                    submitText={createMember.isPending ? 'Đang thêm...' : 'Thêm học viên'}
                                    isSubmitting={
                                          createMember.isPending ||
                                          createResidentUserMutation.isPending
                                    }
                                    isSuggestingUsername={suggestUsernameMutation.isPending}
                                    isEditing={false}
                              />
                        )}

                        {isEditDialogOpen && (
                              <MemberFormModal
                                    title="Cập nhật học viên"
                                    error={error}
                                    formData={formData}
                                    setFormData={setFormData}
                                    createUserData={createUserData}
                                    setCreateUserData={setCreateUserData}
                                    onSuggestUsername={handleSuggestUsername}
                                    onClose={() => setIsEditDialogOpen(false)}
                                    onSubmit={handleSaveEdit}
                                    submitText={
                                          updateMember.isPending ? 'Đang cập nhật...' : 'Cập nhật'
                                    }
                                    isSubmitting={updateMember.isPending}
                                    isSuggestingUsername={suggestUsernameMutation.isPending}
                                    isEditing
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
                                    onCreateUser={handleCreateUserFromDetail}
                                    isCreatingUser={
                                          createResidentUserMutation.isPending ||
                                          suggestUsernameMutation.isPending
                                    }
                              />
                        )}

                        {isAssignRoomDialogOpen && (
                              <AssignRoomModal
                                    member={selectedMemberForRoom}
                                    rooms={rooms}
                                    error={error}
                                    formData={roomAssignmentData}
                                    setFormData={setRoomAssignmentData}
                                    quickRoomFormData={quickRoomFormData}
                                    setQuickRoomFormData={setQuickRoomFormData}
                                    onQuickCreateRoom={handleQuickCreateRoom}
                                    onClose={() => setIsAssignRoomDialogOpen(false)}
                                    onSubmit={handleAssignRoom}
                                    isSubmitting={assignRoomMutation.isPending}
                                    isCreatingRoom={createRoomMutation.isPending}
                              />
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}
