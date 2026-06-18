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
import { cx, residenceMediumStyle } from '@/components/shared/styleMedium';
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
import {
      buildMemberOrganizationDisplay,
      createEmptyOrganizationDisplay,
      type MemberOrganizationDisplay,
} from '@/components/members/memberOrganizationDisplay';

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
            <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-300 via-blue-300 to-emerald-300 opacity-80" />

                  <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                    {label}
                              </div>
                              <div className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                    {value}
                              </div>
                              <div className={residenceMediumStyle.compactSectionHint}>
                                    {description}
                              </div>
                        </div>

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                              {icon}
                        </div>
                  </div>

                  {details && details.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                              {details.map((item) => (
                                    <span
                                          key={item.label}
                                          className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200"
                                    >
                                          {item.label}: {item.value}
                                    </span>
                              ))}
                        </div>
                  )}
            </div>
      );
}


type MemberListSortKey = 'name' | 'room' | 'team' | 'status';
type MemberListSortDirection = 'asc' | 'desc';

type MemberListSortState = {
      key: MemberListSortKey;
      direction: MemberListSortDirection;
};

function getListSortValue(
      member: any,
      organizationDisplay: MemberOrganizationDisplay,
      key: MemberListSortKey
) {
      if (key === 'name') return getDisplayName(member).toLowerCase();
      if (key === 'room') return getRoomLabelFromMember(member) || '';
      if (key === 'team') {
            return organizationDisplay.teams.map((unit) => unit.unitName).join(', ');
      }

      return getStatusLabel(member?.status || member?.residenceStatus || 'active');
}

function sortMemberListRows(
      members: any[],
      getOrganizationDisplayForMember: (member: any) => MemberOrganizationDisplay,
      sortState: MemberListSortState
) {
      return [...members].sort((left, right) => {
            const leftOrganization = getOrganizationDisplayForMember(left);
            const rightOrganization = getOrganizationDisplayForMember(right);
            const leftValue = getListSortValue(left, leftOrganization, sortState.key);
            const rightValue = getListSortValue(right, rightOrganization, sortState.key);
            const direction = sortState.direction === 'asc' ? 1 : -1;

            return String(leftValue).localeCompare(String(rightValue), 'vi') * direction;
      });
}

function SortableHeader({
      label,
      sortKey,
      sortState,
      onSort,
}: {
      label: string;
      sortKey: MemberListSortKey;
      sortState: MemberListSortState;
      onSort: (key: MemberListSortKey) => void;
}) {
      const isActive = sortState.key === sortKey;

      return (
            <button
                  type="button"
                  onClick={() => onSort(sortKey)}
                  className={[
                        'inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide transition',
                        isActive ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600',
                  ].join(' ')}
            >
                  {label}
                  <span className="text-[10px]">
                        {isActive ? (sortState.direction === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
            </button>
      );
}

function CompactValueList({
      values,
      emptyText,
}: {
      values: string[];
      emptyText: string;
}) {
      if (values.length === 0) {
            return <span className="text-slate-400">{emptyText}</span>;
      }

      return (
            <div className="space-y-1">
                  {values.map((value) => (
                        <div key={value} className="whitespace-normal font-medium text-slate-700">
                              {value}
                        </div>
                  ))}
            </div>
      );
}

function SimpleMemberListTable({
      members,
      getOrganizationDisplayForMember,
      sortState,
      onSort,
}: {
      members: any[];
      getOrganizationDisplayForMember: (member: any) => MemberOrganizationDisplay;
      sortState: MemberListSortState;
      onSort: (key: MemberListSortKey) => void;
}) {
      const sortedRows = sortMemberListRows(
            members,
            getOrganizationDisplayForMember,
            sortState
      );

      return (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <div className="text-sm font-semibold text-slate-700">
                                    Chế độ List view
                              </div>
                              <div className="text-xs text-slate-500">
                                    View only · {sortedRows.length} học viên · Có thể sort theo tên, phòng, tổ, trạng thái
                              </div>
                        </div>
                  </div>

                  <div className="overflow-x-auto">
                        <table className="min-w-[1180px] divide-y divide-slate-100 text-sm">
                              <thead className="bg-white">
                                    <tr>
                                          <th className="px-4 py-3 text-left">
                                                <SortableHeader
                                                      label="Học viên"
                                                      sortKey="name"
                                                      sortState={sortState}
                                                      onSort={onSort}
                                                />
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                                                Mã
                                          </th>
                                          <th className="px-4 py-3 text-left">
                                                <SortableHeader
                                                      label="Trạng thái"
                                                      sortKey="status"
                                                      sortState={sortState}
                                                      onSort={onSort}
                                                />
                                          </th>
                                          <th className="px-4 py-3 text-left">
                                                <SortableHeader
                                                      label="Phòng"
                                                      sortKey="room"
                                                      sortState={sortState}
                                                      onSort={onSort}
                                                />
                                          </th>
                                          <th className="px-4 py-3 text-left">
                                                <SortableHeader
                                                      label="Tổ"
                                                      sortKey="team"
                                                      sortState={sortState}
                                                      onSort={onSort}
                                                />
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                                                Ban
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

                              <tbody className="divide-y divide-slate-100 bg-white">
                                    {sortedRows.map((member) => {
                                          const statusLabel = getStatusLabel(
                                                member?.status || member?.residenceStatus || 'active'
                                          );
                                          const organizationDisplay =
                                                getOrganizationDisplayForMember(member);
                                          const teamNames = organizationDisplay.teams.map(
                                                (unit) => unit.unitName
                                          );
                                          const committeeNames = organizationDisplay.committees.map(
                                                (unit) => unit.unitName
                                          );
                                          const organizationTitles = organizationDisplay.roles.map(
                                                (role) => role.title
                                          );
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

                                                      <td className="px-4 py-3 text-slate-700">
                                                            <CompactValueList
                                                                  values={teamNames}
                                                                  emptyText="Chưa vào tổ"
                                                            />
                                                      </td>

                                                      <td className="px-4 py-3 text-slate-700">
                                                            <CompactValueList
                                                                  values={committeeNames}
                                                                  emptyText="Chưa vào ban"
                                                            />
                                                      </td>

                                                      <td className="px-4 py-3 text-slate-700">
                                                            <CompactValueList
                                                                  values={organizationTitles}
                                                                  emptyText="Chưa có"
                                                            />
                                                      </td>

                                                      <td
                                                            className={[
                                                                  'min-w-[220px] px-4 py-3 font-medium',
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
type MemberQuickFilterKey =
      | 'all'
      | 'active'
      | 'missing_room'
      | 'missing_contact'
      | 'no_team'
      | 'has_role'
      | 'left';

const memberQuickFilters: Array<{
      key: MemberQuickFilterKey;
      label: string;
      description: string;
}> = [
            {
                  key: 'all',
                  label: 'Tất cả',
                  description: 'Toàn bộ danh sách đang lọc',
            },
            {
                  key: 'active',
                  label: 'Đang lưu trú',
                  description: 'Học viên đang ở lưu xá',
            },
            {
                  key: 'missing_room',
                  label: 'Chưa có phòng',
                  description: 'Cần gắn phòng',
            },
            {
                  key: 'missing_contact',
                  label: 'Thiếu liên hệ',
                  description: 'Cần bổ sung liên hệ',
            },
            {
                  key: 'no_team',
                  label: 'Chưa vào tổ',
                  description: 'Cần phân tổ',
            },
            {
                  key: 'has_role',
                  label: 'Có chức vụ',
                  description: 'Đang giữ vai trò',
            },
            {
                  key: 'left',
                  label: 'Đã rời',
                  description: 'Hồ sơ lưu trữ',
            },
      ];

function isMemberActive(member: any) {
      const status = member?.status || member?.residenceStatus;

      return status === 'active' || status === 'Đang ở';
}

function isMemberLeft(member: any) {
      const status = member?.status || member?.residenceStatus;

      return (
            status === 'transferred_out' ||
            status === 'left' ||
            status === 'Đã rời lưu xá'
      );
}

function filterMembersByQuickFilter(
      members: any[],
      quickFilter: MemberQuickFilterKey,
      getOrganizationDisplayForMember: (member: any) => MemberOrganizationDisplay
) {
      if (quickFilter === 'all') return members;

      return members.filter((member) => {
            const attentionItems = getAttentionItems(member);
            const organizationDisplay = getOrganizationDisplayForMember(member);

            if (quickFilter === 'active') return isMemberActive(member);
            if (quickFilter === 'missing_room') return attentionItems.includes('Chưa có phòng');
            if (quickFilter === 'missing_contact') return attentionItems.includes('Thiếu liên hệ');
            if (quickFilter === 'no_team') {
                  return isMemberActive(member) && organizationDisplay.teams.length === 0;
            }
            if (quickFilter === 'has_role') return organizationDisplay.roles.length > 0;
            if (quickFilter === 'left') return isMemberLeft(member);

            return true;
      });
}



export default function Members() {
      const [, navigate] = useLocation();
      const { isDetailed } = useSystemDisplayMode();
      const isSimple = !isDetailed;

      const [searchTerm, setSearchTerm] = useState('');
      const [quickFilter, setQuickFilter] = useState<MemberQuickFilterKey>('all');
      const [simpleViewMode, setSimpleViewMode] = useState<'cards' | 'list'>('cards');
      const [memberListSort, setMemberListSort] = useState<MemberListSortState>({
            key: 'name',
            direction: 'asc',
      });
      const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
      const [isContactsDialogOpen, setIsContactsDialogOpen] = useState(false);
      const [isRoomsQuickDialogOpen, setIsRoomsQuickDialogOpen] = useState(false);
      const [contactsInitialSearchTerm, setContactsInitialSearchTerm] = useState('');
      const [selectedMemberForContacts, setSelectedMemberForContacts] = useState<any>(null);

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

      const memberIdsForOrganization = useMemo(
            () =>
                  (membersQuery.data || [])
                        .map((member: any) => Number(member.id))
                        .filter((id) => id > 0),
            [membersQuery.data]
      );

      const residentUnitMembershipsQuery =
            trpc.organization.listResidentUnitMemberships.useQuery(
                  {
                        residentIds: memberIdsForOrganization,
                        status: 'active' as any,
                        unitType: 'all' as any,
                  },
                  {
                        enabled: memberIdsForOrganization.length > 0,
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
      const residentUnitMemberships = residentUnitMembershipsQuery.data || [];

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
            const grouped = new Map<number, any[]>();

            organizationAssignments.forEach((assignment: any) => {
                  const residentId = Number(assignment.residentId || 0);

                  if (!residentId) return;

                  const current = grouped.get(residentId) || [];
                  current.push(assignment);
                  grouped.set(residentId, current);
            });

            residentUnitMemberships.forEach((membership: any) => {
                  const residentId = Number(membership.residentId || 0);

                  if (!residentId) return;

                  const current = grouped.get(residentId) || [];
                  current.push({
                        ...membership,
                        source: 'unit_membership',
                  });
                  grouped.set(residentId, current);
            });

            const map = new Map<number, MemberOrganizationDisplay>();

            grouped.forEach((items, residentId) => {
                  map.set(residentId, buildMemberOrganizationDisplay(items));
            });

            return map;
      }, [organizationAssignments, residentUnitMemberships]);

      const getOrganizationDisplayForMember = (member: any) => {
            return (
                  organizationSummaryByResidentId.get(Number(member?.id || 0)) ||
                  createEmptyOrganizationDisplay()
            );
      };

      const getOrganizationTitlesForMember = (member: any) => {
            return getOrganizationDisplayForMember(member).roles.map((role) => role.title);
      };

      const getOrganizationUnitsForMember = (member: any) => {
            const display = getOrganizationDisplayForMember(member);

            return [
                  ...display.teams.map((unit) => unit.unitName),
                  ...display.committees.map((unit) => unit.unitName),
            ];
      };

      const quickFilteredMembers = useMemo(
            () =>
                  filterMembersByQuickFilter(
                        members,
                        quickFilter,
                        getOrganizationDisplayForMember
                  ),
            [members, quickFilter, organizationSummaryByResidentId]
      );

      const sortedMembers = useMemo(
            () => sortMembersByStatus(quickFilteredMembers),
            [quickFilteredMembers]
      );

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

      const quickFilterCounts = useMemo(() => {
            const counts = new Map<MemberQuickFilterKey, number>();

            memberQuickFilters.forEach((filter) => {
                  counts.set(
                        filter.key,
                        filterMembersByQuickFilter(
                              members,
                              filter.key,
                              getOrganizationDisplayForMember
                        ).length
                  );
            });

            return counts;
      }, [members, organizationSummaryByResidentId]);

      const quickFilterLabel =
            memberQuickFilters.find((filter) => filter.key === quickFilter)?.label || 'Tất cả';


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
      }, [searchTerm, quickFilter, simplePageSize]);

      const refetchMembers = async (focusResidentId?: number) => {
            const membersResult = await membersQuery.refetch();
            await statsQuery.refetch();
            await residentsWithoutUserQuery.refetch();
            await organizationAssignmentsQuery.refetch();

            if (focusResidentId && membersResult.data) {
                  const latestMember = membersResult.data.find(
                        (member: any) => Number(member.id) === Number(focusResidentId)
                  );

                  if (latestMember) {
                        setSelectedMember((current: any) =>
                              current && Number(current.id) === Number(focusResidentId)
                                    ? {
                                          ...current,
                                          ...latestMember,
                                    }
                                    : current
                        );
                  }
            }

            return membersResult.data;
      };

      const clearFilters = () => {
            setSearchTerm('');
            setQuickFilter('all');
      };

      const clearSelectedMembers = () => {
            // Simple Mode actions are now handled per member row.
      };

      const handleMemberListSort = (key: MemberListSortKey) => {
            setMemberListSort((current) => {
                  if (current.key !== key) {
                        return {
                              key,
                              direction: 'asc',
                        };
                  }

                  return {
                        key,
                        direction: current.direction === 'asc' ? 'desc' : 'asc',
                  };
            });
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
                  await refetchMembers(editingMember.id);
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
            setSelectedMemberForContacts(member);
            setContactsInitialSearchTerm('');
            setIsContactsDialogOpen(true);
      };

      const handleOpenOrganizationForMember = (
            member: any,
            action?: 'add_team' | 'transfer_team' | 'add_committee' | 'appointment',
            context?: { unitId?: number | null }
      ) => {
            const focusActionMap = {
                  add_team: 'add_team_member',
                  transfer_team: 'transfer_team_member',
                  add_committee: 'add_committee_member',
                  appointment: 'create_assignment',
            } as const;

            try {
                  sessionStorage.setItem(
                        'residencecare.organization.focusResidentId',
                        String(member?.id || '')
                  );
                  sessionStorage.setItem('residencecare.organization.returnTo', '/members');
                  sessionStorage.setItem(
                        'residencecare.organization.returnLabel',
                        'Quay lại học viên'
                  );

                  if (context?.unitId) {
                        sessionStorage.setItem(
                              'residencecare.organization.focusUnitId',
                              String(context.unitId)
                        );
                  }

                  if (action) {
                        sessionStorage.setItem(
                              'residencecare.organization.focusAction',
                              focusActionMap[action]
                        );
                  }
            } catch {
                  // Ignore storage errors; navigation should still work.
            }

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
                  await refetchMembers(selectedMemberForRoom.id);
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
                                                variant: 'secondary',
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
                        window.location.href = `/organization?handoverResidentId=${pendingActionMember.id}`;
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
                  <div className={residenceMediumStyle.page}>
                        <div className={residenceMediumStyle.pageShell}>
                              <div className={residenceMediumStyle.topArea}>
                                    <div className={residenceMediumStyle.topInner}>


                                          <div className="relative flex flex-col gap-4">
                                                <div className="flex justify-end">
                                                      <div className="flex flex-wrap items-center gap-2">

                                                            <div className="relative">
                                                                  <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                              setIsQuickActionOpen((value) => !value)
                                                                        }
                                                                        className={residenceMediumStyle.warmButton}
                                                                  >
                                                                        Tác vụ nhanh
                                                                  </button>

                                                                  {isQuickActionOpen && (
                                                                        <div className={residenceMediumStyle.dropdownPanel}>
                                                                              <div className={residenceMediumStyle.dropdownLabel}>
                                                                                    Quản lý phòng
                                                                              </div>

                                                                              <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                          setIsQuickActionOpen(false);
                                                                                          setIsRoomsQuickDialogOpen(true);
                                                                                    }}
                                                                                    className={residenceMediumStyle.dropdownItem}
                                                                              >
                                                                                    Danh sách phòng & sức chứa
                                                                                    <div className="mt-0.5 text-xs text-slate-400">
                                                                                          Xem phòng, thêm phòng, sửa sức chứa cơ bản
                                                                                    </div>
                                                                              </button>

                                                                              <div className={residenceMediumStyle.divider} />

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
                                                                                    className={`${residenceMediumStyle.dropdownItem} disabled:cursor-not-allowed disabled:opacity-60`}
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
                                                                                          setSelectedMemberForContacts(null);
                                                                                          setIsContactsDialogOpen(true);
                                                                                    }}
                                                                                    className={residenceMediumStyle.dropdownItem}
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
                                                                  className={residenceMediumStyle.warmPrimaryButton}
                                                            >
                                                                  <Plus className="h-4 w-4" />
                                                                  Thêm học viên
                                                            </button>
                                                      </div>
                                                </div>

                                                <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
                                                      <h1 className={residenceMediumStyle.topTitle}>
                                                            Quản lý học viên lưu trú
                                                      </h1>

                                                      <p className={residenceMediumStyle.topSubtitle}>
                                                            Theo dõi hồ sơ, phòng ở, liên hệ gia đình và vai trò tổ chức trong một không gian làm việc thống nhất.
                                                      </p>
                                                </div>
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

                              {!isSimple && (
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

                              <div className={residenceMediumStyle.filterPanel}>
                                    <div className={residenceMediumStyle.filterGrid}>
                                          <div>
                                                <div className="mb-2 flex items-center justify-between gap-3">
                                                      <div>
                                                            <h3 className={residenceMediumStyle.compactSectionLabel}>
                                                                  Tra cứu học viên
                                                            </h3>
                                                            <p className={residenceMediumStyle.compactSectionHint}>
                                                                  Tìm theo tên, mã lưu trú, số điện thoại, phòng hoặc liên hệ.
                                                            </p>
                                                      </div>
                                                </div>

                                                <div className="relative">
                                                      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                      <Input
                                                            value={searchTerm}
                                                            onChange={(event) =>
                                                                  setSearchTerm(event.target.value)
                                                            }
                                                            placeholder="Tên, mã lưu trú, số điện thoại, phòng, liên hệ..."
                                                            className={residenceMediumStyle.searchInput}
                                                      />
                                                </div>
                                          </div>

                                          <div>
                                                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                      <div>
                                                            <h3 className={residenceMediumStyle.compactSectionLabel}>
                                                                  Trạng thái hồ sơ
                                                            </h3>
                                                            <p className={residenceMediumStyle.compactSectionHint}>
                                                                  Chọn nhóm hồ sơ cần xem hoặc xử lý.
                                                            </p>
                                                      </div>

                                                      {(searchTerm || quickFilter !== 'all') && (
                                                            <button
                                                                  type="button"
                                                                  onClick={clearFilters}
                                                                  className="h-9 w-fit rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                                                            >
                                                                  Xóa lọc
                                                            </button>
                                                      )}
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                      {memberQuickFilters.map((filter) => {
                                                            const isActive = quickFilter === filter.key;
                                                            const count = quickFilterCounts.get(filter.key) || 0;

                                                            return (
                                                                  <button
                                                                        key={filter.key}
                                                                        type="button"
                                                                        onClick={() => setQuickFilter(filter.key)}
                                                                        title={filter.description}
                                                                        className={cx(
                                                                              residenceMediumStyle.chipBase,
                                                                              isActive
                                                                                    ? residenceMediumStyle.chipActive
                                                                                    : residenceMediumStyle.chipIdle
                                                                        )}
                                                                  >
                                                                        <span>{filter.label}</span>
                                                                        <span
                                                                              className={[
                                                                                    'rounded-full px-2 py-0.5 text-[11px]',
                                                                                    isActive
                                                                                          ? residenceMediumStyle.chipCountActive
                                                                                          : residenceMediumStyle.chipCountIdle,
                                                                              ].join(' ')}
                                                                        >
                                                                              {count}
                                                                        </span>
                                                                  </button>
                                                            );
                                                      })}
                                                </div>
                                          </div>
                                    </div>
                              </div>

                              <section className={residenceMediumStyle.section}>
                                    <div className={residenceMediumStyle.sectionHeader}>
                                          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                                                <div>
                                                      <h3 className={residenceMediumStyle.sectionTitle}>
                                                            Danh sách học viên
                                                      </h3>
                                                      <p className="mt-1 text-sm text-slate-500">
                                                            {sortedMembers.length} / {members.length} hồ sơ đang hiển thị · Bộ lọc: {quickFilterLabel}
                                                            {searchTerm ? ` · Từ khóa: ${searchTerm}` : ''}
                                                      </p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                      <div className={residenceMediumStyle.segmentedControl}>
                                                            <button
                                                                  type="button"
                                                                  onClick={() => setSimpleViewMode('cards')}
                                                                  className={[
                                                                        'rounded-xl px-3 py-1.5 transition',
                                                                        simpleViewMode === 'cards'
                                                                              ? residenceMediumStyle.segmentedActive
                                                                              : residenceMediumStyle.segmentedIdle,
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
                                                                              ? 'bg-white text-slate-900 shadow-sm'
                                                                              : residenceMediumStyle.segmentedIdle,
                                                                  ].join(' ')}
                                                            >
                                                                  List
                                                            </button>
                                                      </div>


                                                </div>
                                          </div>
                                    </div>

                                    <div className={residenceMediumStyle.sectionBody}>

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
                                                            <>
                                                                  {simpleViewMode === 'list' ? (
                                                                        <SimpleMemberListTable
                                                                              members={simplePagedMembers}
                                                                              getOrganizationDisplayForMember={getOrganizationDisplayForMember}
                                                                              sortState={memberListSort}
                                                                              onSort={handleMemberListSort}
                                                                        />
                                                                  ) : (
                                                                        <div className="space-y-3">
                                                                              {simplePagedMembers.map((member: any, index: number) => (
                                                                                    <SimpleMemberCard
                                                                                          key={member.id}
                                                                                          member={member}
                                                                                          memberIndex={index}
                                                                                          organizationDisplay={getOrganizationDisplayForMember(member)}
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

                                                                  <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
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
                                          organizationDisplay={getOrganizationDisplayForMember(selectedMemberForDetail)}
                                          organizationTitles={getOrganizationTitlesForMember(selectedMemberForDetail)}
                                          organizationUnits={getOrganizationUnitsForMember(selectedMemberForDetail)}
                                          onOpenOrganization={handleOpenOrganizationForMember}
                                          onOpenContacts={handleOpenMemberContacts}
                                          onClose={() => {
                                                setIsDetailDialogOpen(false);
                                                setSelectedMember(null);
                                          }}
                                          onEdit={() => {
                                                handleEditMember(selectedMemberForDetail);
                                          }}
                                          onAssignRoom={() => {
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
                                          residentId={
                                                selectedMemberForContacts?.id
                                                      ? Number(selectedMemberForContacts.id)
                                                      : undefined
                                          }
                                          residentName={
                                                selectedMemberForContacts
                                                      ? getDisplayName(selectedMemberForContacts)
                                                      : undefined
                                          }
                                          onClose={() => {
                                                setIsContactsDialogOpen(false);
                                                setSelectedMemberForContacts(null);
                                          }}
                                          onChanged={() =>
                                                refetchMembers(
                                                      selectedMemberForContacts?.id
                                                            ? Number(selectedMemberForContacts.id)
                                                            : selectedMember?.id
                                                                  ? Number(selectedMember.id)
                                                                  : undefined
                                                )
                                          }
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
