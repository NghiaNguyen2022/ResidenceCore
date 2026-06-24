'use client';

import type { ReactNode } from 'react';
import { useLocation } from 'wouter';
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
import { residenceMediumStyle } from '@/components/shared/styleMedium';
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
      getPrimaryContactText,
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

type EducationLevel =
      | 'high_school'
      | 'vocational'
      | 'college'
      | 'university'
      | 'other';

type EducationInfoPayload = {
      residentId: number;
      schoolName: string;
      educationLevel?: EducationLevel | null;
      classOrMajor?: string | null;
      academicYear?: string | null;
      notes?: string | null;
};

type DayOfWeek =
      | 'monday'
      | 'tuesday'
      | 'wednesday'
      | 'thursday'
      | 'friday'
      | 'saturday'
      | 'sunday';

type StudySchedulePayload = {
      id?: number;
      residentId: number;
      dayOfWeek: DayOfWeek;
      startTime: string;
      endTime: string;
      subjectName?: string | null;
      location?: string | null;
      notes?: string | null;
};


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

function getNeedHandoverReason(error: any) {
      return (
            error?.data?.cause?.reason ||
            error?.shape?.data?.cause?.reason ||
            error?.cause?.reason ||
            error?.reason ||
            error?.code
      );
}

function getNeedHandoverAssignments(error: any) {
      return (
            error?.data?.cause?.assignments ||
            error?.shape?.data?.cause?.assignments ||
            error?.cause?.assignments ||
            error?.assignments ||
            []
      );
}

function isNeedHandoverError(error: any) {
      const reason = getNeedHandoverReason(error);
      const message = String(error?.message || '').toLowerCase();

      return (
            reason === 'NEED_HANDOVER' ||
            message.includes('đang giữ chức vụ') ||
            message.includes('ban giao') ||
            message.includes('bàn giao') ||
            message.includes('bãi nhiệm')
      );
}

function getAssignmentTitleForHandover(assignment: any) {
      return (
            assignment?.assignmentTitle ||
            assignment?.roleName ||
            assignment?.roleCode ||
            'Chức vụ đang đảm nhiệm'
      );
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
            <div className="group relative overflow-hidden rounded-[26px] border border-amber-100/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.78)_0%,rgba(255,251,235,0.58)_58%,rgba(245,158,11,0.14)_100%)] p-4 shadow-[0_18px_40px_rgba(12,10,9,0.075),inset_0_1px_0_rgba(255,255,255,0.74)] transition hover:-translate-y-0.5 hover:border-amber-200/80 hover:shadow-[0_24px_54px_rgba(12,10,9,0.11),0_0_0_1px_rgba(251,191,36,0.10)]">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-300 via-amber-200 to-emerald-300 opacity-85" />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.26)_0%,transparent_42%,rgba(245,158,11,0.08)_100%)]" />

                  <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                    {label}
                              </div>
                              <div className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                    {value}
                              </div>
                              <div className="mt-1 text-xs leading-5 text-slate-500">
                                    {description}
                              </div>
                        </div>

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-100/70 bg-white/82 text-amber-700 shadow-[0_10px_24px_rgba(120,53,15,0.08)]">
                              {icon}
                        </div>
                  </div>

                  {details && details.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                              {details.map((item) => (
                                    <span
                                          key={item.label}
                                          className="rounded-full border border-amber-100/75 bg-white/76 px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-sm shadow-slate-900/5"
                                    >
                                          {item.label}: {item.value}
                                    </span>
                              ))}
                        </div>
                  )}
            </div>
      );
}

function SimpleMemberListTable({
      members,
      getOrganizationTitlesForMember,
      getOrganizationUnitsForMember,
}: {
      members: any[];
      getOrganizationTitlesForMember: (member: any) => string[];
      getOrganizationUnitsForMember: (member: any) => string[];
}) {
      return (
            <div className="overflow-hidden rounded-3xl border border-amber-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(255,251,235,0.60)_100%)] shadow-[0_18px_40px_rgba(12,10,9,0.07)]">
                  <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 text-sm">
                              <thead className="bg-amber-50/55 backdrop-blur">
                                    <tr>
                                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                                                Học viên
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                                                Mã
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                                                Trạng thái
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                                                Phòng
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                                                Tổ / Ban
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                                                Chức vụ
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                                                Liên hệ chính
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                                                Điện thoại
                                          </th>
                                    </tr>
                              </thead>

                              <tbody className="divide-y divide-amber-100/70 bg-transparent">
                                    {members.map((member) => {
                                          const statusLabel = getStatusLabel(
                                                member?.status || member?.residenceStatus || 'active'
                                          );
                                          const organizationUnits =
                                                getOrganizationUnitsForMember(member);
                                          const organizationTitles =
                                                getOrganizationTitlesForMember(member);
                                          const contactText = getPrimaryContactText(member);
                                          const missingContact =
                                                contactText === 'Chưa có người liên hệ';

                                          return (
                                                <tr
                                                      key={member.id}
                                                      className="transition hover:bg-slate-50/80"
                                                >
                                                      <td className="whitespace-nowrap px-4 py-3">
                                                            <div className="font-semibold text-slate-900">
                                                                  {getDisplayName(member)}
                                                            </div>
                                                            <div className="text-xs text-slate-400">
                                                                  {member?.gender
                                                                        ? getGenderLabel(member.gender)
                                                                        : 'Thông tin cơ bản'}
                                                            </div>
                                                      </td>

                                                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">
                                                            {member?.residentCode || member?.code || 'Chưa có'}
                                                      </td>

                                                      <td className="whitespace-nowrap px-4 py-3">
                                                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                                                                  {statusLabel}
                                                            </span>
                                                      </td>

                                                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">
                                                            {getRoomLabelFromMember(member) || 'Chưa gán'}
                                                      </td>

                                                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                                                            {organizationUnits.length > 0
                                                                  ? organizationUnits.join(', ')
                                                                  : 'Chưa phân tổ'}
                                                      </td>

                                                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                                                            {organizationTitles.length > 0
                                                                  ? organizationTitles.join(', ')
                                                                  : 'Chưa có'}
                                                      </td>

                                                      <td
                                                            className={[
                                                                  'whitespace-nowrap px-4 py-3 font-medium',
                                                                  missingContact
                                                                        ? 'text-amber-700'
                                                                        : 'text-slate-700',
                                                            ].join(' ')}
                                                      >
                                                            {contactText}
                                                      </td>

                                                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">
                                                            {member?.phoneNumber || '-'}
                                                      </td>
                                                </tr>
                                          );
                                    })}
                              </tbody>
                        </table>
                  </div>
            </div>
      );
}


export default function Members() {
      const [, navigate] = useLocation();
      const { isDetailed } = useSystemDisplayMode();
      const isSimple = !isDetailed;

      const [searchTerm, setSearchTerm] = useState('');
      const [simpleViewMode, setSimpleViewMode] = useState<'cards' | 'list'>('cards');
      const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
      const [isContactsDialogOpen, setIsContactsDialogOpen] = useState(false);
      const [isRoomsQuickDialogOpen, setIsRoomsQuickDialogOpen] = useState(false);
      const [contactsInitialSearchTerm, setContactsInitialSearchTerm] = useState('');

      const [simplePage, setSimplePage] = useState(1);
      const [simplePageSize, setSimplePageSize] = useState(7);

      const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
      const [isAssignRoomDialogOpen, setIsAssignRoomDialogOpen] = useState(false);
      const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
      const [detailInitialTab, setDetailInitialTab] = useState<string>('overview');
      const [isReopeningMemberDetail, setIsReopeningMemberDetail] = useState(() => {
            try {
                  return Boolean(sessionStorage.getItem('residencecare.members.reopenDetailResidentId'));
            } catch {
                  return false;
            }
      });

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
      });

      const statsQuery = trpc.members.getStats.useQuery();
      const roomsQuery = trpc.rooms.list.useQuery();
      const organizationAssignmentsQuery = trpc.organization.listAssignments.useQuery(
            {
                  status: 'active' as any,
                  limit: 500,
                  offset: 0,
            },
            {
                  refetchOnWindowFocus: false,
            }
      );

      const residentsWithoutUserQuery =
            trpc.members.listResidentsWithoutUser.useQuery(undefined, {
                  refetchOnWindowFocus: false,
            });

      const selectedResidentId = selectedMember?.id ? Number(selectedMember.id) : 0;

      const selectedEducationQuery = trpc.members.getEducation.useQuery(
            {
                  residentId: selectedResidentId,
            },
            {
                  enabled: isDetailDialogOpen && selectedResidentId > 0,
                  refetchOnWindowFocus: false,
            }
      );

      const selectedStudySchedulesQuery = trpc.members.getStudySchedules.useQuery(
            {
                  residentId: selectedResidentId,
            },
            {
                  enabled: isDetailDialogOpen && selectedResidentId > 0,
                  refetchOnWindowFocus: false,
            }
      );

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

      const upsertEducationMutation = trpc.members.upsertEducation.useMutation({
            onSuccess: async (education) => {
                  setError(null);

                  setSelectedMember((current: any) =>
                        current
                              ? {
                                    ...current,
                                    education,
                              }
                              : current
                  );

                  await selectedEducationQuery.refetch();
                  await refetchMembers();
            },
            onError: (err: any) => {
                  setError(err?.message || 'Không thể lưu thông tin học hành.');
            },
      });

      const createStudyScheduleMutation = trpc.members.createStudySchedule.useMutation({
            onSuccess: async (studySchedules) => {
                  setError(null);

                  setSelectedMember((current: any) =>
                        current
                              ? {
                                    ...current,
                                    studySchedules,
                              }
                              : current
                  );

                  await selectedStudySchedulesQuery.refetch();
                  await refetchMembers();
            },
            onError: (err: any) => {
                  setError(err?.message || 'Không thể thêm lịch học.');
            },
      });

      const updateStudyScheduleMutation = trpc.members.updateStudySchedule.useMutation({
            onSuccess: async (studySchedules) => {
                  setError(null);

                  setSelectedMember((current: any) =>
                        current
                              ? {
                                    ...current,
                                    studySchedules,
                              }
                              : current
                  );

                  await selectedStudySchedulesQuery.refetch();
                  await refetchMembers();
            },
            onError: (err: any) => {
                  setError(err?.message || 'Không thể cập nhật lịch học.');
            },
      });

      const deleteStudyScheduleMutation = trpc.members.deleteStudySchedule.useMutation({
            onSuccess: async (studySchedules) => {
                  setError(null);

                  setSelectedMember((current: any) =>
                        current
                              ? {
                                    ...current,
                                    studySchedules,
                              }
                              : current
                  );

                  await selectedStudySchedulesQuery.refetch();
                  await refetchMembers();
            },
            onError: (err: any) => {
                  setError(err?.message || 'Không thể xóa lịch học.');
            },
      });

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
      const organizationAssignments = organizationAssignmentsQuery.data || [];

      const selectedMemberForDetail = useMemo(() => {
            if (!selectedMember) return null;

            return {
                  ...selectedMember,
                  education: selectedEducationQuery.data ?? selectedMember.education ?? null,
                  studySchedules:
                        selectedStudySchedulesQuery.data ??
                        selectedMember.studySchedules ??
                        [],
            };
      }, [
            selectedMember,
            selectedEducationQuery.data,
            selectedStudySchedulesQuery.data,
      ]);

      const organizationSummaryByResidentId = useMemo(() => {
            const map = new Map<number, { titles: string[]; units: string[] }>();

            organizationAssignments.forEach((assignment: any) => {
                  const residentId = Number(assignment.residentId || 0);

                  if (!residentId) return;

                  const current = map.get(residentId) || { titles: [], units: [] };

                  const title =
                        assignment.assignmentTitle ||
                        assignment.roleName ||
                        assignment.roleCode ||
                        'Chức vụ';

                  if (title && !current.titles.includes(title)) {
                        current.titles.push(title);
                  }

                  const unitName = assignment.unitName || assignment.unitCode || '';

                  if (unitName && !current.units.includes(unitName)) {
                        current.units.push(unitName);
                  }

                  map.set(residentId, current);
            });

            return map;
      }, [organizationAssignments]);

      const getOrganizationTitlesForMember = (member: any) => {
            return organizationSummaryByResidentId.get(Number(member?.id || 0))?.titles || [];
      };

      const getOrganizationUnitsForMember = (member: any) => {
            return organizationSummaryByResidentId.get(Number(member?.id || 0))?.units || [];
      };

      const sortedMembers = useMemo(() => sortMembersByStatus(members), [members]);

      useEffect(() => {
            if (membersQuery.isLoading || members.length === 0) return;

            let reopenResidentId = 0;
            let reopenTab = 'overview';

            try {
                  reopenResidentId = Number(
                        sessionStorage.getItem('residencecare.members.reopenDetailResidentId') || 0
                  );
                  reopenTab =
                        sessionStorage.getItem('residencecare.members.reopenDetailTab') || 'overview';
            } catch {
                  // Ignore storage errors.
            }

            if (!reopenResidentId) {
                  setIsReopeningMemberDetail(false);
                  return;
            }

            const member = members.find((item: any) => Number(item.id) === reopenResidentId);

            if (!member) {
                  setIsReopeningMemberDetail(false);
                  return;
            }

            try {
                  sessionStorage.removeItem('residencecare.members.reopenDetailResidentId');
                  sessionStorage.removeItem('residencecare.members.reopenDetailTab');
            } catch {
                  // Ignore storage errors.
            }

            setSelectedMember(member);
            setDetailInitialTab(reopenTab);
            setIsDetailDialogOpen(true);
            window.setTimeout(() => setIsReopeningMemberDetail(false), 80);
      }, [members, membersQuery.isLoading]);

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
      }, [searchTerm, simplePageSize]);

      const refetchMembers = async () => {
            await membersQuery.refetch();
            await statsQuery.refetch();
            await residentsWithoutUserQuery.refetch();
            await organizationAssignmentsQuery.refetch();
      };

      const clearFilters = () => {
            setSearchTerm('');
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
            setDetailInitialTab('overview');
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


      const handleOpenMemberContacts = (member: any) => {
            setContactsInitialSearchTerm(getDisplayName(member));
            setIsContactsDialogOpen(true);
      };

      type OrganizationFocusAction =
            | 'add_team_member'
            | 'transfer_team_member'
            | 'add_committee_member'
            | 'create_assignment';

      const normalizeOrganizationFocusAction = (action?: string): OrganizationFocusAction => {
            switch (action) {
                  case 'add_team_member':
                  case 'add_team':
                        return 'add_team_member';
                  case 'transfer_team_member':
                  case 'transfer_team':
                        return 'transfer_team_member';
                  case 'add_committee_member':
                  case 'add_committee':
                        return 'add_committee_member';
                  case 'create_assignment':
                  case 'appointment':
                  default:
                        return 'create_assignment';
            }
      };

      const handleOpenOrganizationForMember = (
            member: any,
            action?: string,
            context?: { unitId?: number | null }
      ) => {
            if (!member?.id) return;

            const focusAction = normalizeOrganizationFocusAction(action);

            try {
                  sessionStorage.setItem(
                        'residencecare.organization.focusResidentId',
                        String(member.id)
                  );
                  sessionStorage.setItem(
                        'residencecare.organization.focusAction',
                        focusAction
                  );
                  sessionStorage.setItem(
                        'residencecare.organization.focusUnitId',
                        context?.unitId ? String(context.unitId) : ''
                  );
                  sessionStorage.setItem(
                        'residencecare.organization.returnTo',
                        '/members'
                  );
                  sessionStorage.setItem(
                        'residencecare.organization.returnLabel',
                        'Quay lại hồ sơ học viên'
                  );
                  sessionStorage.setItem(
                        'residencecare.members.reopenDetailResidentId',
                        String(member.id)
                  );
                  sessionStorage.setItem(
                        'residencecare.members.reopenDetailTab',
                        'organization'
                  );
            } catch {
                  // Ignore storage errors; navigation should still work.
            }

            setIsDetailDialogOpen(false);
            navigate('/organization');
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
                        setSelectedMember((current: any) =>
                              current && Number(current.id) === Number(member.id)
                                    ? {
                                            ...current,
                                            status: 'transferred_out',
                                            residenceStatus: 'transferred_out',
                                            departureDate: new Date(),
                                      }
                                    : current
                        );
                        setDetailInitialTab('room');
                        closeMessageBox();
                        await refetchMembers();
                        await roomsQuery.refetch();
                  } catch (err: any) {
                        if (isNeedHandoverError(err)) {
                              const assignments = getNeedHandoverAssignments(err);
                              const assignmentLines = assignments.length
                                    ? assignments
                                                .map(
                                                      (assignment: any) =>
                                                            `- ${getAssignmentTitleForHandover(assignment)}`
                                                )
                                                .join('\n')
                                    : '- Chức vụ đang đảm nhiệm';

                              setMessageBox({
                                    open: true,
                                    title: 'Cần bàn giao chức vụ trước khi rời lưu xá',
                                    message:
                                          `${getDisplayName(member)} hiện đang giữ chức vụ trong cơ cấu lưu xá.\n\n` +
                                          `${assignmentLines}\n\n` +
                                          'Vui lòng bàn giao hoặc bãi nhiệm chức vụ trước. Sau khi bàn giao xong, hệ thống mới hoàn tất rời lưu xá và khóa tài khoản liên kết.',
                                    variant: 'warning',
                                    actions: [
                                          {
                                                label: 'Bàn giao chức vụ',
                                                value: 'handoverOrganizationRoles',
                                                description:
                                                      'Chuyển sang màn hình Tổ chức lưu xá để bàn giao/bãi nhiệm chức vụ.',
                                                variant: 'warning',
                                          },
                                          {
                                                label: 'Để sau',
                                                value: 'closeMessageBox',
                                                description:
                                                      'Hủy thao tác rời lưu xá, giữ nguyên hồ sơ và tài khoản học viên.',
                                                variant: 'info',
                                          },
                                    ],
                              });
                              return;
                        }

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

            if (value === 'handoverOrganizationRoles') {
                  if (pendingActionMember?.id) {
                        try {
                              sessionStorage.setItem(
                                    'residencecare.members.reopenDetailResidentId',
                                    String(pendingActionMember.id)
                              );
                              sessionStorage.setItem(
                                    'residencecare.members.reopenDetailTab',
                                    'room'
                              );
                              sessionStorage.setItem(
                                    'residencecare.organization.returnTo',
                                    '/members'
                              );
                              sessionStorage.setItem(
                                    'residencecare.organization.returnLabel',
                                    'Quay lại hồ sơ học viên'
                              );
                        } catch {
                              // Ignore storage errors.
                        }

                        closeMessageBox();
                        navigate(`/organization?handoverResidentId=${pendingActionMember.id}`);
                        return;
                  }

                  closeMessageBox();
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
                        key: 'organizationRoles',
                        label: 'Chức vụ',
                        sortable: true,
                        sortValue: (member) =>
                              getOrganizationTitlesForMember(member).join(', '),
                        render: (member) => {
                              const titles = getOrganizationTitlesForMember(member);

                              if (titles.length === 0) {
                                    return (
                                          <span className="text-xs text-slate-400">
                                                Chưa có
                                          </span>
                                    );
                              }

                              return (
                                    <div className="flex max-w-[260px] flex-wrap gap-1.5">
                                          {titles.map((title) => (
                                                <span
                                                      key={title}
                                                      className="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700"
                                                >
                                                      {title}
                                                </span>
                                          ))}
                                    </div>
                              );
                        },
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
                  {isReopeningMemberDetail && (
                        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-sm">
                              <div className="max-w-md rounded-3xl border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_68%,#fff3e3_100%)] p-5 text-center shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
                                    <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-700">
                                          Đang quay lại hồ sơ
                                    </p>
                                    <h3 className="mt-2 text-lg font-black text-slate-950">
                                          Đang mở lại workspace học viên
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                          Hệ thống đang mở đúng hồ sơ và tab Tổ chức sau khi thao tác.
                                    </p>
                              </div>
                        </div>
                  )}
                  <div className={residenceMediumStyle.page}>
                        <span className={residenceMediumStyle.pageAura} />
                        <div className="relative mx-auto max-w-[1420px] space-y-4 px-2 pb-8">
                              <div className="relative overflow-visible px-5 pb-2 pt-3 text-slate-900 sm:px-6">
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-70 [background-image:radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.92),transparent_30%),radial-gradient(circle_at_78%_8%,rgba(251,191,36,0.18),transparent_26%)]" />

                                    <div className="relative min-h-[88px]">
                                          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
                                                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-[38px]">
                                                      Học viên lưu trú
                                                </h1>

                                                <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                                                      Một màn hình để theo dõi hồ sơ, phòng ở, liên hệ gia đình và vai trò tổ chức của từng học viên.
                                                </p>
                                          </div>

                                          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 lg:absolute lg:right-0 lg:top-0 lg:mt-0 lg:justify-end">
                                                      <div className="relative">
                                                            <button
                                                                  type="button"
                                                                  onClick={() =>
                                                                        setIsQuickActionOpen((value) => !value)
                                                                  }
                                                                  className={residenceMediumStyle.buttonCard}
                                                            >
                                                                  Tác vụ nhanh
                                                            </button>

                                                            {isQuickActionOpen && (
                                                                  <div className={residenceMediumStyle.dropdownPanel}>
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
                                                                                    setContactsInitialSearchTerm('');
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
                                                            className={residenceMediumStyle.buttonCardPrimary}
                                                      >
                                                            <Plus className={residenceMediumStyle.buttonCardIcon} />
                                                            Thêm học viên
                                                      </button>
                                                </div>
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
                              <div className="flex flex-wrap items-center justify-center gap-2 rounded-[24px] border border-amber-100/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.62)_0%,rgba(255,251,235,0.42)_62%,rgba(245,158,11,0.08)_100%)] px-4 py-2.5 shadow-[0_14px_30px_rgba(12,10,9,0.045),inset_0_1px_0_rgba(255,255,255,0.70)]">
                                    <span className="rounded-full bg-white/76 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-amber-100/75 shadow-sm shadow-slate-900/5">
                                          Tổng: {stats.total}
                                    </span>
                                    <span className="rounded-full bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                                          Đang lưu trú: {stats.active}
                                    </span>
                                    <span className="rounded-full bg-amber-50/80 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                                          Cần xử lý: {attentionStats.needAttentionCount}
                                    </span>
                                    <span className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-amber-100/70">
                                          Chưa có phòng: {attentionStats.missingRoom}
                                    </span>
                                    <span className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-amber-100/70">
                                          Chưa có tài khoản: {attentionStats.missingUser}
                                    </span>
                                    <span className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-amber-100/70">
                                          Thiếu liên hệ: {attentionStats.missingContact}
                                    </span>
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

                        <div className="rounded-[24px] border border-amber-100/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.82)_0%,rgba(255,251,235,0.62)_58%,rgba(245,158,11,0.10)_100%)] p-2.5 shadow-[0_18px_38px_rgba(12,10,9,0.065),inset_0_1px_0_rgba(255,255,255,0.72)]">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <div className="relative min-w-0 flex-1">
                                          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                          <Input
                                                value={searchTerm}
                                                onChange={(event) =>
                                                      setSearchTerm(event.target.value)
                                                }
                                                placeholder="Tìm theo tên, mã lưu trú, số điện thoại..."
                                                className="h-11 rounded-2xl border-amber-100/80 bg-white/72 pl-10 text-sm shadow-[0_8px_18px_rgba(12,10,9,0.05)] transition placeholder:text-slate-400 focus:border-amber-200 focus:bg-white"
                                          />
                                    </div>

                                    {searchTerm && (
                                          <button
                                                type="button"
                                                onClick={clearFilters}
                                                className="h-11 rounded-2xl border border-amber-100/80 bg-white/76 px-4 text-sm font-semibold text-slate-600 shadow-sm shadow-slate-900/5 transition hover:border-amber-200 hover:bg-white"
                                          >
                                                Xóa tìm kiếm
                                          </button>
                                    )}
                              </div>
                        </div>

                        <section className="overflow-visible rounded-[28px] border border-amber-100/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.82)_0%,rgba(255,251,235,0.62)_54%,rgba(248,250,252,0.70)_100%)] shadow-[0_22px_52px_rgba(12,10,9,0.075),inset_0_1px_0_rgba(255,255,255,0.74)]">
                              <div className="border-b border-amber-100/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.86)_0%,rgba(255,251,235,0.68)_62%,rgba(245,158,11,0.10)_100%)] px-5 py-4">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                                          <div>
                                                <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                                                      Danh sách học viên
                                                </h2>
                                                <p className="mt-1 text-sm text-slate-500">
                                                      {sortedMembers.length} học viên đang hiển thị. Các hồ sơ cần xử lý được đánh dấu nhẹ trên từng dòng.
                                                </p>
                                          </div>

                                          <div className="flex flex-wrap items-center gap-2">
                                                <div className="flex rounded-2xl bg-white/66 p-1 text-sm font-semibold ring-1 ring-amber-100/70 shadow-sm shadow-slate-900/5">
                                                      <button
                                                            type="button"
                                                            onClick={() => setSimpleViewMode('cards')}
                                                            className={[
                                                                  'rounded-xl px-3 py-1.5 transition',
                                                                  simpleViewMode === 'cards'
                                                                        ? 'bg-white text-slate-900 shadow-[0_10px_20px_rgba(12,10,9,0.06)]'
                                                                        : 'text-slate-500 hover:text-slate-800',
                                                            ].join(' ')}
                                                      >
                                                            Thẻ
                                                      </button>

                                                      <button
                                                            type="button"
                                                            onClick={() => setSimpleViewMode('list')}
                                                            className={[
                                                                  'rounded-xl px-3 py-1.5 transition',
                                                                  simpleViewMode === 'list'
                                                                        ? 'bg-white text-slate-900 shadow-[0_10px_20px_rgba(12,10,9,0.06)]'
                                                                        : 'text-slate-500 hover:text-slate-800',
                                                            ].join(' ')}
                                                      >
                                                            List
                                                      </button>
                                                </div>


                                          </div>
                                    </div>
                              </div>

                              <div className="bg-[linear-gradient(180deg,rgba(255,251,235,0.32)_0%,rgba(248,250,252,0.42)_100%)] p-4 sm:p-5">

                              {membersQuery.isLoading ? (
                                    <div className="rounded-2xl border border-dashed border-amber-100/80 bg-white/76 p-8 text-center text-sm text-slate-500">
                                          Đang tải dữ liệu học viên...
                                    </div>
                              ) : isSimple ? (
                                    <>
                                          {sortedMembers.length === 0 ? (
                                                <div className="rounded-2xl border border-dashed border-amber-100/80 bg-white/76 p-8 text-center text-sm text-slate-500">
                                                      Không có học viên nào phù hợp.
                                                </div>
                                          ) : (
                                                <>
                                                      {simpleViewMode === 'list' ? (
                                                      <SimpleMemberListTable
                                                            members={simplePagedMembers}
                                                            getOrganizationTitlesForMember={getOrganizationTitlesForMember}
                                                            getOrganizationUnitsForMember={getOrganizationUnitsForMember}
                                                      />
                                                ) : (
                                                      <div className="space-y-3">
                                                            {simplePagedMembers.map((member: any, index: number) => (
                                                                  <SimpleMemberCard
                                                                        key={member.id}
                                                                        member={member}
                                                                        memberIndex={index}
                                                                        organizationTitles={getOrganizationTitlesForMember(member)}
                                                                        organizationUnits={getOrganizationUnitsForMember(member)}
                                                                        onView={handleOpenDetail}
                                                                        onEdit={handleEditMember}
                                                                        onContacts={handleOpenMemberContacts}
                                                                        onRoomAction={handleOpenAssignRoomDialog}
                                                                        onOrganization={handleOpenOrganizationForMember}
                                                                        onLeaveOrDelete={handleLeaveOrDeleteMember}
                                                                        onReactivate={handleReactivateMember}
                                                                        isRoomProcessing={assignRoomMutation.isPending}
                                                                        isLeaving={markAsLeftMutation.isPending}
                                                                        isReactivating={reactivateMemberMutation.isPending}
                                                                  />
                                                            ))}
                                                      </div>
                                                )}

                                          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-amber-100/75 bg-white/76 px-4 py-3 shadow-[0_14px_28px_rgba(12,10,9,0.05)] md:flex-row md:items-center md:justify-between">
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
                                                            className="rounded-xl border border-amber-100/80 bg-white/78 px-3 py-2 text-sm outline-none focus:border-amber-300"
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
                                                            className="rounded-xl border border-amber-100/80 bg-white/78 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-amber-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
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
                                                            className="rounded-xl border border-amber-100/80 bg-white/78 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-amber-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                                                      >
                                                            Sau
                                                      </button>
                                                </div>
                                          </div>
                                                </>
                                          )}
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
                        </section>

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

                        {isDetailDialogOpen && selectedMemberForDetail && (
                              <MemberDetailModal
                                    member={selectedMemberForDetail}
                                    initialTab={detailInitialTab}
                                    organizationTitles={getOrganizationTitlesForMember(selectedMemberForDetail)}
                                    organizationUnits={getOrganizationUnitsForMember(selectedMemberForDetail)}
                                    onOpenOrganization={handleOpenOrganizationForMember}
                                    onClose={() => {
                                          setIsDetailDialogOpen(false);
                                          setSelectedMember(null);
                                          setDetailInitialTab('overview');
                                    }}
                                    onEdit={() => {
                                          setIsDetailDialogOpen(false);
                                          handleEditMember(selectedMemberForDetail);
                                    }}
                                    onAssignRoom={() => {
                                          setIsDetailDialogOpen(false);
                                          handleOpenAssignRoomDialog(selectedMemberForDetail);
                                    }}
                                    onCreateUser={handleCreateUserFromDetail}
                                    onReactivate={handleReactivateMember}
                                    isCreatingUser={
                                          createResidentUserMutation.isPending ||
                                          suggestUsernameMutation.isPending
                                    }
                                    isReactivating={reactivateMemberMutation.isPending}
                                    onDataChange={refetchMembers}
                                    isSavingEducation={upsertEducationMutation.isPending}
                                    onSaveEducation={(data: EducationInfoPayload) => {
                                          upsertEducationMutation.mutate(data);
                                    }}
                                    isSavingStudySchedule={
                                          createStudyScheduleMutation.isPending ||
                                          updateStudyScheduleMutation.isPending
                                    }
                                    isDeletingStudySchedule={deleteStudyScheduleMutation.isPending}
                                    onSaveStudySchedule={(data: StudySchedulePayload) => {
                                          if (data.id) {
                                                updateStudyScheduleMutation.mutate({
                                                      id: data.id,
                                                      residentId: data.residentId,
                                                      dayOfWeek: data.dayOfWeek,
                                                      startTime: data.startTime,
                                                      endTime: data.endTime,
                                                      subjectName: data.subjectName,
                                                      location: data.location,
                                                      notes: data.notes,
                                                });
                                          } else {
                                                createStudyScheduleMutation.mutate({
                                                      residentId: data.residentId,
                                                      dayOfWeek: data.dayOfWeek,
                                                      startTime: data.startTime,
                                                      endTime: data.endTime,
                                                      subjectName: data.subjectName,
                                                      location: data.location,
                                                      notes: data.notes,
                                                });
                                          }
                                    }}
                                    onDeleteStudySchedule={(input) => {
                                          deleteStudyScheduleMutation.mutate(input);
                                    }}
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
                                    initialSearchTerm={contactsInitialSearchTerm}
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
                  </div>
            </ResidenceCareLayout>
      );
}
