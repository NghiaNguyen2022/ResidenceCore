'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
      AlertCircle,
      Clock,
      Eye,
      Plus,
      Search,
      Trash2,
      Users,
      UserCheck,
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
import { ContactsListModal } from '@/components/members/ContactsListModal';
import { MemberDetailModal } from '@/components/members/MemberDetailModal';
import { MemberFormModal } from '@/components/members/MemberFormModal';
import { SimpleMemberCard } from '@/components/members/SimpleMemberCard';
import { RoomsQuickModal } from '@/components/members/RoomsQuickModal';

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
      getAttentionItems,
      getDisplayName,
      getGenderLabel,
      getRoomActionLabel,
      getRoomLabelFromMember,
      getStatusClass,
      getStatusLabel,
      hasCurrentRoom,
} from '@/components/members/memberUtils';
import {
      AppMessageBox,
      type AppMessageBoxState,
} from '@/components/common/AppMessageBox';


function isResidentLeft(member: any) {
      const status = member?.status || member?.residenceStatus;

      return (
            status === 'transferred_out' ||
            status === 'left' ||
            status === 'Đã rời lưu xá'
      );
}


function getMemberStatusRank(member: any) {
      const status = member?.status || member?.residenceStatus;

      if (status === 'active') return 1;
      if (status === 'inactive' || status === 'temporary_leave') return 2;
      if (status === 'transferred_out' || status === 'left') return 3;

      return 9;
}

function sortMembersByStatus(members: any[]) {
      return [...members].sort((a, b) => {
            const statusDiff = getMemberStatusRank(a) - getMemberStatusRank(b);

            if (statusDiff !== 0) return statusDiff;

            const roomDiff = Number(!hasCurrentRoom(a)) - Number(!hasCurrentRoom(b));

            if (roomDiff !== 0) return roomDiff;

            return getDisplayName(a).localeCompare(getDisplayName(b), 'vi');
      });
}


function SimpleStatCard({
      label,
      value,
      description,
      icon,
      details,
}: {
      label: string;
      value: number;
      description: string;
      icon: ReactNode;
      details?: Array<{ label: string; value: number }>;
}) {
      return (
            <div className="flex min-h-[168px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                              <div className="text-sm font-semibold text-slate-500">
                                    {label}
                              </div>
                              <div className="mt-2 text-4xl font-bold tracking-tight text-slate-800">
                                    {value}
                              </div>
                        </div>

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                              {icon}
                        </div>
                  </div>

                  <div className="mt-4">
                        <div className="text-sm leading-5 text-slate-500">
                              {description}
                        </div>

                        {details && details.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                    {details.map((item) => (
                                          <span
                                                key={item.label}
                                                className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
                                          >
                                                {item.label}: {item.value}
                                          </span>
                                    ))}
                              </div>
                        )}
                  </div>
            </div>
      );
}

export default function Members() {
      const { isDetailed } = useSystemDisplayMode();
      const isSimple = !isDetailed;

      const [searchTerm, setSearchTerm] = useState('');
      const [statusFilter, setStatusFilter] = useState('all');
      const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
      const [isContactsDialogOpen, setIsContactsDialogOpen] = useState(false);
      const [isRoomsQuickDialogOpen, setIsRoomsQuickDialogOpen] = useState(false);

      const [simplePage, setSimplePage] = useState(1);
      const [simplePageSize, setSimplePageSize] = useState(7);

      const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
      const [isAssignRoomDialogOpen, setIsAssignRoomDialogOpen] = useState(false);
      const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

      const [editingMember, setEditingMember] = useState<any>(null);
      const [selectedMember, setSelectedMember] = useState<any>(null);
      const [selectedMemberForRoom, setSelectedMemberForRoom] = useState<any>(null);

      const [error, setError] = useState<string | null>(null);

      const [messageBox, setMessageBox] = useState<AppMessageBoxState>({
            open: false,
            title: '',
            message: '',
            variant: 'info',
            actions: [],
      });
      const [pendingActionMember, setPendingActionMember] = useState<any>(null);

      const [formData, setFormData] = useState<MemberFormData>(resetMemberForm());
      const [createUserData, setCreateUserData] =
            useState<CreateResidentUserFormData>(resetCreateResidentUserForm());

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

      const residentsWithoutUserQuery =
            trpc.members.listResidentsWithoutUser.useQuery(undefined, {
                  refetchOnWindowFocus: false,
            });

      const createMember = trpc.members.create.useMutation();
      const updateMember = trpc.members.update.useMutation();
      const deleteMember = trpc.members.delete.useMutation();
      const markAsLeftMutation = trpc.members.markAsLeft.useMutation();
      const reactivateMemberMutation = trpc.members.reactivate.useMutation();

      const assignRoomMutation = trpc.rooms.assignResident.useMutation();
      const createRoomMutation = trpc.rooms.create.useMutation();

      const suggestUsernameMutation =
            trpc.members.suggestResidentUsername.useMutation();

      const createResidentUserMutation =
            trpc.members.createResidentUser.useMutation();

      const bulkCreateResidentUsersMutation =
            trpc.members.bulkCreateResidentUsers.useMutation({
                  onSuccess: async () => {
                        await membersQuery.refetch();
                        await statsQuery.refetch();
                        await residentsWithoutUserQuery.refetch();
                  },
            });

      const members = membersQuery.data || [];
      const rooms = roomsQuery.data || [];

      const sortedMembers = useMemo(() => sortMembersByStatus(members), [members]);

      const stats = statsQuery.data || {
            total: 0,
            active: 0,
            inactive: 0,
            transferred_out: 0,
      };

      const attentionStats = useMemo(() => {
            const missingRoom = members.filter((member: any) =>
                  getAttentionItems(member).includes('Chưa có phòng')
            ).length;

            const missingUser = members.filter((member: any) =>
                  getAttentionItems(member).includes('Chưa có tài khoản')
            ).length;

            const missingContact = members.filter((member: any) =>
                  getAttentionItems(member).includes('Thiếu liên hệ')
            ).length;

            const needAttentionCount = members.filter((member: any) =>
                  getAttentionItems(member).length > 0
            ).length;

            return {
                  needAttentionCount,
                  missingRoom,
                  missingUser,
                  missingContact,
            };
      }, [members]);


      const simpleTotalItems = sortedMembers.length;

      const simpleTotalPages = Math.max(
            1,
            Math.ceil(simpleTotalItems / simplePageSize)
      );

      const simplePagedMembers = sortedMembers.slice(
            (simplePage - 1) * simplePageSize,
            simplePage * simplePageSize
      );

      useEffect(() => {
            setSimplePage(1);
      }, [searchTerm, statusFilter, simplePageSize]);

      const refetchMembers = async () => {
            await membersQuery.refetch();
            await statsQuery.refetch();
            await residentsWithoutUserQuery.refetch();
      };

      const clearFilters = () => {
            setSearchTerm('');
            setStatusFilter('all');
      };

      const clearSelectedMembers = () => {
            // Simple Mode actions are now handled per member row.
      };

      const handleOpenAddDialog = () => {
            setEditingMember(null);
            setFormData(resetMemberForm());
            setCreateUserData(resetCreateResidentUserForm());
            setError(null);
            setIsAddDialogOpen(true);
      };

      const handleOpenDetail = (member: any) => {
            setSelectedMember(member);
            setIsDetailDialogOpen(true);
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
                              temporaryPassword:
                                    createUserData.temporaryPassword || '123456',
                              mustChangePassword: createUserData.mustChangePassword,
                        });
                  }

                  setIsAddDialogOpen(false);
                  setFormData(resetMemberForm());
                  setCreateUserData(resetCreateResidentUserForm());
                  setError(null);
                  await refetchMembers();
            } catch (err: any) {
                  setError(err.message || 'Lỗi khi thêm học viên');
            }
      };

      const handleSaveEdit = async () => {
            if (!editingMember?.id) {
                  setError('Không tìm thấy học viên cần cập nhật.');
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
                              : undefined,
                        notes: formData.notes || undefined,
                  });

                  setIsEditDialogOpen(false);
                  setEditingMember(null);
                  setError(null);
                  await refetchMembers();
            } catch (err: any) {
                  setError(err.message || 'Lỗi khi cập nhật học viên');
            }
      };

      const handleOpenAssignRoomDialog = (member: any) => {
            if (isResidentLeft(member)) {
                  setError('Học viên đã rời lưu xá. Vui lòng đăng ký lại trước khi gán phòng.');
                  return;
            }

            setSelectedMemberForRoom(member);
            setQuickRoomFormData(defaultQuickRoomFormData);
            setRoomAssignmentData({
                  ...resetRoomAssignmentForm(),
                  eventType: hasCurrentRoom(member) ? 'transfer' : 'new_entry',
            });
            setError(null);
            setIsAssignRoomDialogOpen(true);
      };

      const handleAssignRoom = async () => {
            if (!selectedMemberForRoom?.id) {
                  setError('Không tìm thấy học viên cần gán phòng.');
                  return;
            }

            if (!roomAssignmentData.roomId && roomAssignmentData.eventType !== 'left') {
                  setError('Vui lòng chọn phòng.');
                  return;
            }

            try {
                  await assignRoomMutation.mutateAsync({
                        residentId: selectedMemberForRoom.id,
                        roomId: roomAssignmentData.roomId
                              ? Number(roomAssignmentData.roomId)
                              : undefined,
                        assignedDate: roomAssignmentData.assignedDate
                              ? new Date(roomAssignmentData.assignedDate)
                              : new Date(),
                        eventType: roomAssignmentData.eventType,
                        reason: roomAssignmentData.reason || undefined,
                  } as any);

                  setIsAssignRoomDialogOpen(false);
                  setSelectedMemberForRoom(null);
                  setRoomAssignmentData(resetRoomAssignmentForm());
                  setError(null);
                  await refetchMembers();
                  await roomsQuery.refetch();
            } catch (err: any) {
                  setError(err.message || 'Lỗi khi xử lý phòng ở');
            }
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
                  } as any);

                  await roomsQuery.refetch();

                  const createdRoomId =
                        (createdRoom as any)?.id ??
                        (createdRoom as any)?.room?.id ??
                        null;

                  if (createdRoomId) {
                        setRoomAssignmentData((current) => ({
                              ...current,
                              roomId: String(createdRoomId),
                        }));
                  }

                  setQuickRoomFormData(defaultQuickRoomFormData);
                  setError(null);
            } catch (err: any) {
                  setError(err.message || 'Lỗi khi thêm phòng nhanh');
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

                  setError(null);
                  await refetchMembers();

                  setSelectedMember((current: any) =>
                        current?.id === member.id
                              ? {
                                    ...current,
                                    userId: current.userId || -1,
                                    username: suggestResult.username,
                              }
                              : current
                  );
            } catch (err: any) {
                  setError(err.message || 'Không thể tạo tài khoản cho học viên.');
            }
      };

      const handleBulkCreateResidentUsers = () => {
            const residentsWithoutUser = residentsWithoutUserQuery.data ?? [];

            if (residentsWithoutUser.length === 0) {
                  setMessageBox({
                        open: true,
                        title: 'Tạo tài khoản học viên',
                        message: 'Tất cả học viên hiện đã có tài khoản đăng nhập.',
                        variant: 'info',
                        selectedValue: 'closeMessageBox',
                        cancelText: 'Đóng',
                        actions: [
                              {
                                    label: 'Đã hiểu',
                                    value: 'closeMessageBox',
                                    description: 'Không có học viên nào cần tạo tài khoản mới.',
                              },
                        ],
                  });
                  return;
            }

            setPendingActionMember(null);
            setMessageBox({
                  open: true,
                  title: 'Tạo tài khoản học viên hàng loạt',
                  message:
                        `Tạo tài khoản đăng nhập cho ${residentsWithoutUser.length} học viên chưa có tài khoản? ` +
                        'Tài khoản sẽ dùng mật khẩu tạm và yêu cầu đổi mật khẩu khi đăng nhập lần đầu.',
                  variant: 'warning',
                  selectedValue: 'bulkCreateUsers',
                  cancelText: 'Để sau',
                  actions: [
                        {
                              label: 'Tạo tài khoản hàng loạt',
                              value: 'bulkCreateUsers',
                              description:
                                    'Tạo tài khoản cho toàn bộ học viên đang chưa có user đăng nhập.',
                              variant: 'warning',
                        },
                  ],
            });
      };

      const executeBulkCreateResidentUsers = async () => {
            const residentsWithoutUser = residentsWithoutUserQuery.data ?? [];

            if (residentsWithoutUser.length === 0) {
                  setError(null);
                  closeMessageBox();
                  return;
            }

            try {
                  const result = await bulkCreateResidentUsersMutation.mutateAsync({
                        residentIds: residentsWithoutUser.map((resident: any) => resident.id),
                        temporaryPassword: '123456',
                        mustChangePassword: true,
                  });

                  setError(null);
                  await refetchMembers();

                  setMessageBox({
                        open: true,
                        title: 'Đã tạo tài khoản học viên',
                        message: `Đã tạo thành công ${result.success}/${result.total} tài khoản. Số lỗi: ${result.failed}.`,
                        variant: result.failed > 0 ? 'warning' : 'success',
                        selectedValue: 'closeMessageBox',
                        cancelText: 'Đóng',
                        actions: [
                              {
                                    label: 'Đã hiểu',
                                    value: 'closeMessageBox',
                                    description: 'Danh sách học viên đã được cập nhật lại.',
                                    variant: result.failed > 0 ? 'warning' : 'success',
                              },
                        ],
                  });
            } catch (err: any) {
                  setError(err.message || 'Không thể tạo tài khoản hàng loạt.');
                  closeMessageBox();
            }
      };

      const closeMessageBox = () => {
            setMessageBox({
                  open: false,
                  title: '',
                  message: '',
                  variant: 'info',
                  actions: [],
            });
            setPendingActionMember(null);
      };

      const handleLeaveOrDeleteMember = (member: any) => {
            if (!member?.id) return;

            if (isResidentLeft(member)) {
                  setError('Học viên đã rời lưu xá, không cần thực hiện thao tác ngừng/rời lần nữa.');
                  return;
            }

            setPendingActionMember(member);
            setMessageBox({
                  open: true,
                  title: 'Xử lý học viên',
                  message:
                        `Bạn đang xử lý hồ sơ của ${getDisplayName(member)}. ` +
                        'Nếu học viên đã phát sinh phòng, phí, tổ chức hoặc lịch sử lưu trú, nên chọn Rời lưu xá để giữ lịch sử.',
                  variant: 'warning',
                  selectedValue: 'leave',
                  cancelText: 'Để sau',
                  actions: [
                        {
                              label: 'Rời lưu xá / Ngừng lưu trú',
                              value: 'leave',
                              description:
                                    'Giữ lại hồ sơ, lịch sử phòng, liên hệ, tài khoản và các dữ liệu liên quan.',
                              variant: 'warning',
                        },
                        {
                              label: 'Xóa hồ sơ nhập nhầm',
                              value: 'delete',
                              description:
                                    'Chỉ dùng khi hồ sơ vừa nhập nhầm và chưa phát sinh dữ liệu liên quan.',
                              variant: 'danger',
                        },
                  ],
            });
      };

      const executeLeaveOrDeleteMember = async (action: string, member: any) => {
            if (!member?.id) return;

            if (action === 'leave') {
                  try {
                        await markAsLeftMutation.mutateAsync({
                              id: member.id,
                              departureDate: new Date(),
                        } as any);

                        setError(null);
                        clearSelectedMembers();
                        closeMessageBox();
                        await refetchMembers();
                        await roomsQuery.refetch();
                  } catch (err: any) {
                        setError(
                              err.message ||
                                    'Không thể chuyển học viên sang trạng thái rời lưu xá.'
                        );
                        closeMessageBox();
                  }

                  return;
            }

            if (action === 'delete') {
                  try {
                        await deleteMember.mutateAsync({ id: member.id } as any);

                        setError(null);
                        clearSelectedMembers();
                        closeMessageBox();
                        await refetchMembers();
                        await roomsQuery.refetch();
                  } catch (err: any) {
                        setError(
                              err.message ||
                                    'Không thể xóa hồ sơ vì học viên đã phát sinh dữ liệu liên quan. Vui lòng dùng Rời lưu xá / Ngừng lưu trú để giữ lịch sử.'
                        );
                        closeMessageBox();
                  }
            }
      };

      const handleReactivateMember = (member: any) => {
            if (!member?.id) return;

            setPendingActionMember(member);
            setMessageBox({
                  open: true,
                  title: 'Đăng ký lại học viên',
                  message:
                        `Xác nhận đăng ký lại ${getDisplayName(member)} quay lại lưu xá? ` +
                        'Tài khoản liên kết sẽ được mở lại nếu có. Sau đó quản lý có thể cập nhật thông tin và gán phòng mới.',
                  variant: 'success',
                  selectedValue: 'reactivate',
                  cancelText: 'Hủy',
                  actions: [
                        {
                              label: 'Đăng ký lại / Quay lại lưu xá',
                              value: 'reactivate',
                              description:
                                    'Chuyển học viên về trạng thái đang lưu trú và mở lại tài khoản liên kết.',
                              variant: 'success',
                        },
                  ],
            });
      };

      const executeReactivateMember = async (member: any) => {
            if (!member?.id) return;

            try {
                  await reactivateMemberMutation.mutateAsync({
                        id: member.id,
                  } as any);

                  setError(null);
                  clearSelectedMembers();
                  closeMessageBox();
                  await refetchMembers();
                  await roomsQuery.refetch();
            } catch (err: any) {
                  setError(err.message || 'Không thể đăng ký lại học viên.');
                  closeMessageBox();
            }
      };

      const handleMessageBoxConfirm = async (value: string) => {
            if (value.startsWith('__select__:')) {
                  setMessageBox((current) => ({
                        ...current,
                        selectedValue: value.replace('__select__:', ''),
                  }));
                  return;
            }

            if (value === 'closeMessageBox') {
                  closeMessageBox();
                  return;
            }

            if (value === 'bulkCreateUsers') {
                  await executeBulkCreateResidentUsers();
                  return;
            }

            if (!pendingActionMember) {
                  closeMessageBox();
                  return;
            }

            if (value === 'leave' || value === 'delete') {
                  await executeLeaveOrDeleteMember(value, pendingActionMember);
                  return;
            }

            if (value === 'reactivate') {
                  await executeReactivateMember(pendingActionMember);
            }
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
                                                {getDisplayName(member)}
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

                                    {isResidentLeft(member) ? (
                                          <button
                                                type="button"
                                                onClick={() => handleReactivateMember(member)}
                                                className="rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                title="Đăng ký lại"
                                                disabled={reactivateMemberMutation.isPending}
                                          >
                                                Đăng ký lại
                                          </button>
                                    ) : (
                                          <>
                                                <button
                                                      type="button"
                                                      onClick={() => handleOpenAssignRoomDialog(member)}
                                                      className="rounded-lg px-2 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-50"
                                                      title={getRoomActionLabel(member)}
                                                >
                                                      {hasCurrentRoom(member) ? 'Chuyển/Trả' : 'Gán phòng'}
                                                </button>

                                                <button
                                                      type="button"
                                                      onClick={() => handleLeaveOrDeleteMember(member)}
                                                      className="rounded-lg px-2 py-1 text-xs font-semibold text-orange-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                      title="Ngừng / rời lưu xá"
                                                      disabled={markAsLeftMutation.isPending}
                                                >
                                                      Ngừng
                                                </button>

                                                <button
                                                      type="button"
                                                      onClick={() => handleLeaveOrDeleteMember(member)}
                                                      className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                                      title="Ngừng / xóa"
                                                      disabled={deleteMember.isPending}
                                                >
                                                      <Trash2 className="h-4 w-4" />
                                                </button>
                                          </>
                                    )}
                              </div>
                        ),
                  },
            ],
            [markAsLeftMutation.isPending, deleteMember.isPending, reactivateMemberMutation.isPending]
      );

      return (
            <ResidenceCareLayout>
                  <div className="space-y-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div>
                                    <p className="text-sm font-semibold text-neutral-500">
                                          Quản lý lưu trú
                                    </p>
                                    <h1 className="text-4xl font-bold tracking-tight text-slate-950">
                                          Học viên lưu trú
                                    </h1>
                                    <p className="mt-2 text-base text-slate-600">
                                          Quản lý hồ sơ học viên, phòng ở, gia đình và tài khoản trong một màn hình.
                                    </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                    <div className="relative">
                                          <button
                                                type="button"
                                                onClick={() =>
                                                      setIsQuickActionOpen((value) => !value)
                                                }
                                                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                          >
                                                Tác vụ nhanh
                                          </button>

                                          {isQuickActionOpen && (
                                                <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-2xl border bg-white py-2 shadow-xl">
                                                      <div className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                            Quản lý phòng
                                                      </div>

                                                      <button
                                                            type="button"
                                                            onClick={() => {
                                                                  setIsQuickActionOpen(false);
                                                                  setIsRoomsQuickDialogOpen(true);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                                      >
                                                            Danh sách phòng & sức chứa
                                                            <div className="mt-0.5 text-xs text-slate-400">
                                                                  Xem phòng, thêm phòng, sửa sức chứa cơ bản
                                                            </div>
                                                      </button>

                                                      <div className="my-1 border-t" />

                                                      <div className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                            Tài khoản & liên hệ
                                                      </div>

                                                      <button
                                                            type="button"
                                                            onClick={() => {
                                                                  setIsQuickActionOpen(false);
                                                                  handleBulkCreateResidentUsers();
                                                            }}
                                                            disabled={
                                                                  bulkCreateResidentUsersMutation.isPending ||
                                                                  (residentsWithoutUserQuery.data?.length ?? 0) === 0
                                                            }
                                                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                      >
                                                            Tạo tài khoản học viên chưa có user
                                                            <div className="mt-0.5 text-xs text-slate-400">
                                                                  Còn {residentsWithoutUserQuery.data?.length ?? 0} học viên
                                                            </div>
                                                      </button>

                                                      <button
                                                            type="button"
                                                            onClick={() => {
                                                                  setIsQuickActionOpen(false);
                                                                  setIsContactsDialogOpen(true);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                                      >
                                                            Danh sách liên hệ
                                                            <div className="mt-0.5 text-xs text-slate-400">
                                                                  Xem và cập nhật nhanh cha, mẹ, người giám hộ
                                                            </div>
                                                      </button>
                                                </div>
                                          )}
                                    </div>

                                    <button
                                          type="button"
                                          onClick={handleOpenAddDialog}
                                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                                    >
                                          <Plus className="h-4 w-4" />
                                          Thêm học viên
                                    </button>
                              </div>
                        </div>

                        {error && (
                              <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                                    <div>
                                          <p className="font-semibold">
                                                Có lỗi khi xử lý dữ liệu học viên.
                                          </p>
                                          <p className="mt-1 text-sm">{error}</p>
                                    </div>
                              </div>
                        )}

                        {isSimple ? (
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <SimpleStatCard
                                          label="Tổng học viên"
                                          value={stats.total}
                                          description="Tất cả hồ sơ học viên"
                                          icon={<Users className="h-5 w-5" />}
                                    />

                                    <SimpleStatCard
                                          label="Đang lưu trú"
                                          value={stats.active}
                                          description="Học viên đang ở lưu xá"
                                          icon={<UserCheck className="h-5 w-5" />}
                                    />

                                    <SimpleStatCard
                                          label="Cần xử lý"
                                          value={attentionStats.needAttentionCount}
                                          description="Các hồ sơ còn thiếu thông tin cần bổ sung"
                                          icon={<AlertCircle className="h-5 w-5" />}
                                          details={[
                                                {
                                                      label: 'Chưa có phòng',
                                                      value: attentionStats.missingRoom,
                                                },
                                                {
                                                      label: 'Chưa có tài khoản',
                                                      value: attentionStats.missingUser,
                                                },
                                                {
                                                      label: 'Thiếu liên hệ',
                                                      value: attentionStats.missingContact,
                                                },
                                          ]}
                                    />
                              </div>
                        ) : (
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
                        )}

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_auto]">
                                    <div className="relative">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                          <Input
                                                value={searchTerm}
                                                onChange={(event) =>
                                                      setSearchTerm(event.target.value)
                                                }
                                                placeholder="Tìm theo tên, mã lưu trú, số điện thoại..."
                                                className="pl-10"
                                          />
                                    </div>

                                    <select
                                          value={statusFilter}
                                          onChange={(event) =>
                                                setStatusFilter(event.target.value)
                                          }
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
                              <div className="mb-4">
                                    <h2 className="text-2xl font-bold text-slate-950">
                                          Danh sách học viên
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                          {sortedMembers.length} học viên đang hiển thị từ dữ liệu hệ thống
                                    </p>
                              </div>

                              {membersQuery.isLoading ? (
                                    <div className="rounded-2xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">
                                          Đang tải dữ liệu học viên...
                                    </div>
                              ) : isSimple ? (
                                    <>
                                          {sortedMembers.length === 0 ? (
                                                <div className="rounded-2xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">
                                                      Không có học viên nào phù hợp.
                                                </div>
                                          ) : (
                                                <div className="space-y-3">
                                                      {simplePagedMembers.map((member: any) => (
                                                            <SimpleMemberCard
                                                                  key={member.id}
                                                                  member={member}
                                                                  onView={handleOpenDetail}
                                                                  onRoomAction={handleOpenAssignRoomDialog}
                                                                  onLeaveOrDelete={handleLeaveOrDeleteMember}
                                                                  onReactivate={handleReactivateMember}
                                                                  isRoomProcessing={assignRoomMutation.isPending}
                                                                  isLeaving={markAsLeftMutation.isPending}
                                                                  isReactivating={reactivateMemberMutation.isPending}
                                                            />
                                                      ))}
                                                </div>
                                          )}

                                          <div className="mt-4 flex flex-col gap-3 rounded-2xl border bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
                                                <div className="text-sm text-slate-500">
                                                      Hiển thị{' '}
                                                      <span className="font-medium text-slate-900">
                                                            {sortedMembers.length === 0
                                                                  ? 0
                                                                  : (simplePage - 1) * simplePageSize + 1}
                                                      </span>
                                                      {' '}–{' '}
                                                      <span className="font-medium text-slate-900">
                                                            {Math.min(simplePage * simplePageSize, sortedMembers.length)}
                                                      </span>
                                                      {' '}trên{' '}
                                                      <span className="font-medium text-slate-900">
                                                            {sortedMembers.length}
                                                      </span>
                                                      {' '}học viên
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                      <select
                                                            value={simplePageSize}
                                                            onChange={(event) => {
                                                                  setSimplePageSize(Number(event.target.value));
                                                                  setSimplePage(1);
                                                            }}
                                                            className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900"
                                                      >
                                                            <option value={5}>5 / trang</option>
                                                            <option value={7}>7 / trang</option>
                                                            <option value={10}>10 / trang</option>
                                                      </select>

                                                      <button
                                                            type="button"
                                                            onClick={() =>
                                                                  setSimplePage((page) =>
                                                                        Math.max(1, page - 1)
                                                                  )
                                                            }
                                                            disabled={simplePage <= 1}
                                                            className="rounded-xl border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                      >
                                                            Trước
                                                      </button>

                                                      <div className="min-w-20 text-center text-sm text-slate-600">
                                                            {simplePage}/{simpleTotalPages}
                                                      </div>

                                                      <button
                                                            type="button"
                                                            onClick={() =>
                                                                  setSimplePage((page) =>
                                                                        Math.min(simpleTotalPages, page + 1)
                                                                  )
                                                            }
                                                            disabled={simplePage >= simpleTotalPages}
                                                            className="rounded-xl border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                      >
                                                            Sau
                                                      </button>
                                                </div>
                                          </div>
                                    </>
                              ) : (
                                    <ConfigurableDataTable
                                          moduleKey="members"
                                          tableKey="members.list"
                                          columns={memberColumns}
                                          data={sortedMembers}
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
                                    submitText={updateMember.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
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
                                    onReactivate={handleReactivateMember}
                                    isCreatingUser={
                                          createResidentUserMutation.isPending ||
                                          suggestUsernameMutation.isPending
                                    }
                                    isReactivating={reactivateMemberMutation.isPending}
                                    onDataChange={refetchMembers}
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


                        {isRoomsQuickDialogOpen && (
                              <RoomsQuickModal
                                    onClose={() => setIsRoomsQuickDialogOpen(false)}
                                    onChanged={async () => {
                                          await roomsQuery.refetch();
                                          await membersQuery.refetch();
                                          await statsQuery.refetch();
                                    }}
                              />
                        )}

                        {isContactsDialogOpen && (
                              <ContactsListModal
                                    onClose={() => setIsContactsDialogOpen(false)}
                                    onChanged={refetchMembers}
                              />
                        )}

                        <AppMessageBox
                              state={messageBox}
                              onCancel={closeMessageBox}
                              onConfirm={handleMessageBoxConfirm}
                              isProcessing={
                                    markAsLeftMutation.isPending ||
                                    deleteMember.isPending ||
                                    reactivateMemberMutation.isPending ||
                                    bulkCreateResidentUsersMutation.isPending
                              }
                        />
                  </div>
            </ResidenceCareLayout>
      );
}
