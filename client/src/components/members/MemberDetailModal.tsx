import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
      CalendarDays,
      Database,
      DoorOpen,
      Edit2,
      Home,
      IdCard,
      MapPin,
      Phone,
      Users,
      X,
} from 'lucide-react';
import { ParentsSection } from './ParentsSection';
import { EducationInfoSection } from './EducationInfoSection';
import { StudyScheduleSection } from './StudyScheduleSection';
import {
      formatDate,
      getGenderLabel,
      getPrimaryContactText,
      getRoomActionLabel,
      getRoomLabelFromMember,
      hasCurrentRoom,
      getStatusClass,
      getStatusLabel,
} from './memberUtils';
import {
      createEmptyOrganizationDisplay,
      type MemberOrganizationDisplay,
      type OrganizationRoleDisplay,
      type OrganizationUnitDisplay,
} from './memberOrganizationDisplay';

type DetailTabKey =
      | 'overview'
      | 'contacts'
      | 'room'
      | 'education'
      | 'organization'
      | 'account';

type OrganizationAction = 'add_team' | 'transfer_team' | 'add_committee' | 'appointment';

type PrimaryContactSummary = {
      relation: string;
      name: string;
      phone: string;
      isMissing: boolean;
};

function isResidentLeft(member: any) {
      const status = member?.status || member?.residenceStatus;

      return (
            status === 'transferred_out' ||
            status === 'left' ||
            status === 'Đã rời lưu xá'
      );
}

function isResidentInactive(member: any) {
      const status = member?.status || member?.residenceStatus;

      return (
            status === 'inactive' ||
            status === 'temporary_leave' ||
            status === 'Tạm ngưng' ||
            status === 'Tạm vắng'
      );
}

/**
 * Detail view should display the actual current room, not old room history.
 *
 * Rule:
 * - Left resident: show residence status, not old room.
 * - Inactive/temporary leave: show status.
 * - Active resident with currentRoom*: show current room.
 * - Active resident without currentRoom*: show "Chưa gán".
 *
 * getRoomLabelFromMember may still fallback to roomId/roomCode for legacy display,
 * so we only call it after hasCurrentRoom(member) is true for active residents.
 */
function getResidentRoomText(member: any) {
      if (isResidentLeft(member) || isResidentInactive(member)) {
            return getRoomLabelFromMember(member);
      }

      if (hasCurrentRoom(member)) {
            return getRoomLabelFromMember(member);
      }

      return 'Chưa gán';
}

function getAccountStatus(member: any) {
      const hasUser = Boolean(member?.userId);

      if (!hasUser) {
            return {
                  title: 'Chưa có tài khoản đăng nhập',
                  description:
                        'Học viên chưa có tài khoản đăng nhập.',
                  className: 'bg-slate-50',
                  titleClassName: 'text-slate-800',
                  descriptionClassName: 'text-slate-500',
                  badgeClassName: 'bg-white text-slate-700 ring-slate-200',
                  badgeText: 'Chưa có',
            };
      }

      const isLocked =
            isResidentLeft(member) ||
            isResidentInactive(member) ||
            member?.userIsActive === false ||
            member?.isUserActive === false ||
            member?.accountStatus === 'locked';

      if (isLocked) {
            return {
                  title: 'Tài khoản đã khóa',
                  description:
                        'Tài khoản đang bị khóa do trạng thái lưu trú hoặc thao tác quản trị.',
                  className: 'bg-rose-50',
                  titleClassName: 'text-rose-800',
                  descriptionClassName: 'text-rose-600',
                  badgeClassName: 'bg-white text-rose-700 ring-rose-200',
                  badgeText: 'Đã khóa',
            };
      }

      return {
            title: 'Tài khoản đang hoạt động',
            description:
                  'Học viên có thể đăng nhập để xem thông tin cá nhân và các nội dung được phân quyền.',
            className: 'bg-emerald-50',
            titleClassName: 'text-emerald-800',
            descriptionClassName: 'text-emerald-600',
            badgeClassName: 'bg-white text-emerald-700 ring-emerald-200',
            badgeText: 'Hoạt động',
      };
}

type EducationInfoPayload = {
      residentId: number;
      educationLevel?: string | null;
      schoolName?: string | null;
      schoolAddress?: string | null;
      major?: string | null;
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

const detailTabs: Array<{
      key: DetailTabKey;
      label: string;
      description: string;
}> = [
      {
            key: 'overview',
            label: 'Tổng quan',
            description: 'Thông tin chính của học viên',
      },
      {
            key: 'contacts',
            label: 'Liên hệ',
            description: 'Cha, mẹ, người giám hộ',
      },
      {
            key: 'room',
            label: 'Phòng ở',
            description: 'Tình trạng lưu trú',
      },
      {
            key: 'education',
            label: 'Học tập',
            description: 'Trường học và lịch học',
      },
      {
            key: 'organization',
            label: 'Tổ chức',
            description: 'Tổ, ban, chức vụ',
      },
      {
            key: 'account',
            label: 'Tài khoản',
            description: 'Đăng nhập hệ thống',
      },
];

function getParentTypeLabel(parentType?: string | null) {
      switch (parentType) {
            case 'father':
                  return 'Cha';
            case 'mother':
                  return 'Mẹ';
            case 'guardian':
                  return 'Người giám hộ';
            default:
                  return 'Liên hệ chính';
      }
}

function splitContactText(text: string): PrimaryContactSummary {
      if (!text || text === 'Chưa có người liên hệ') {
            return {
                  relation: 'Chưa có liên hệ chính',
                  name: 'Cần bổ sung',
                  phone: '',
                  isMissing: true,
            };
      }

      const parts = text
            .split(/[-–—•|]/)
            .map((item) => item.trim())
            .filter(Boolean);

      if (parts.length >= 3) {
            return {
                  relation: parts[0],
                  name: parts[1],
                  phone: parts.slice(2).join(' - '),
                  isMissing: false,
            };
      }

      if (parts.length === 2) {
            return {
                  relation: parts[0],
                  name: parts[1],
                  phone: '',
                  isMissing: false,
            };
      }

      return {
            relation: 'Liên hệ chính',
            name: text,
            phone: '',
            isMissing: false,
      };
}

function getPrimaryContactSummary(member: any): PrimaryContactSummary {
      const relation =
            member?.primaryContactType ||
            member?.primaryParentType ||
            member?.contactType ||
            member?.parentType;

      const name =
            member?.primaryContactName ||
            member?.primaryParentName ||
            member?.contactName ||
            member?.parentName;

      const phone =
            member?.primaryContactPhone ||
            member?.primaryParentPhone ||
            member?.contactPhone ||
            member?.parentPhone;

      if (name || phone) {
            return {
                  relation: getParentTypeLabel(relation),
                  name: name || 'Chưa có tên',
                  phone: phone || 'Chưa có số điện thoại',
                  isMissing: false,
            };
      }

      return splitContactText(getPrimaryContactText(member));
}

export function MemberDetailModal({
      member,
      organizationDisplay,
      organizationTitles = [],
      organizationUnits = [],
      onClose,
      onEdit,
      onAssignRoom,
      onOpenOrganization,
      onOpenContacts,
      onCreateUser,
      onReactivate,
      isCreatingUser = false,
      isReactivating = false,
      onDataChange,
      onSaveEducation,
      isSavingEducation = false,
      onSaveStudySchedule,
      onDeleteStudySchedule,
      isSavingStudySchedule = false,
      isDeletingStudySchedule = false,
}: {
      member: any;
      organizationDisplay?: MemberOrganizationDisplay;
      organizationTitles?: string[];
      organizationUnits?: string[];
      onClose: () => void;
      onEdit: () => void;
      onAssignRoom: () => void;
      onOpenOrganization?: (
            member: any,
            action?: OrganizationAction,
            context?: { unitId?: number | null }
      ) => void;
      onOpenContacts?: (member: any) => void;
      onCreateUser?: (member: any) => void;
      onReactivate?: (member: any) => void;
      isCreatingUser?: boolean;
      isReactivating?: boolean;
      onDataChange?: () => void | Promise<void>;
      onSaveEducation?: (data: EducationInfoPayload) => void;
      isSavingEducation?: boolean;
      onSaveStudySchedule?: (data: StudySchedulePayload) => void;
      onDeleteStudySchedule?: (input: { id: number; residentId: number }) => void;
      isSavingStudySchedule?: boolean;
      isDeletingStudySchedule?: boolean;
}) {
      const [activeTab, setActiveTab] = useState<DetailTabKey>('overview');

      const displayName = member?.holyName
            ? `${member.holyName} ${member.fullName || ''}`.trim()
            : member?.fullName || '-';

      const isLeft = isResidentLeft(member);
      const accountStatus = getAccountStatus(member);
      const contact = getPrimaryContactSummary(member);
      const organization = useMemo(() => {
            if (organizationDisplay) return organizationDisplay;

            const fallback = createEmptyOrganizationDisplay();
            fallback.teams = organizationUnits.map((unitName) => ({
                  unitName,
                  unitType: 'team',
                  isLeader: false,
                  colorClass: 'bg-slate-50 text-slate-700 ring-slate-200',
            }));
            fallback.roles = organizationTitles.map((title, index) => ({
                  title,
                  rank: 90 + index,
                  isTeamLeader: false,
                  isCommitteeHead: false,
            }));

            return fallback;
      }, [organizationDisplay, organizationTitles, organizationUnits]);
      const currentTeam = organization.teams[0] || null;
      const hasOrganizationInfo =
            organization.teams.length > 0 ||
            organization.committees.length > 0 ||
            organization.roles.length > 0;

      const openOrganization = (
            action?: OrganizationAction,
            context?: { unitId?: number | null }
      ) => {
            onOpenOrganization?.(member, action, context);
      };

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4">
                              <div className="flex items-start justify-between gap-4">
                                    <div>
                                          <p className="text-sm font-semibold text-blue-600">
                                                Hồ sơ học viên
                                          </p>
                                          <h2 className="text-2xl font-bold text-slate-950">
                                                {displayName}
                                          </h2>
                                    </div>

                                    <button
                                          type="button"
                                          onClick={onClose}
                                          className="rounded-xl p-2 transition hover:bg-slate-100"
                                    >
                                          <X className="h-5 w-5" />
                                    </button>
                              </div>
                        </div>

                        <div className="max-h-[calc(92vh-88px)] overflow-y-auto">
                              <div className="p-6">
                                    {isLeft && (
                                          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                                                <p className="font-semibold">Học viên đã rời lưu xá / ngừng lưu trú</p>
                                                <p className="mt-1">
                                                      Hồ sơ này đang được giữ để tra cứu lịch sử. Các thao tác cập nhật hồ sơ,
                                                      phòng ở và liên hệ gia đình đang được khóa. Muốn tiếp tục quản lý, hãy dùng
                                                      chức năng Đăng ký lại.
                                                </p>
                                          </div>
                                    )}

                                    <div className="mb-5 flex flex-col gap-4 rounded-3xl bg-slate-50 p-5 lg:flex-row lg:items-center lg:justify-between">
                                          <div className="flex items-center gap-4">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-700">
                                                      {member.fullName?.charAt(0)?.toUpperCase() || 'H'}
                                                </div>

                                                <div>
                                                      <p className="text-xl font-bold text-slate-950">
                                                            {displayName}
                                                      </p>
                                                      <p className="text-sm text-slate-500">
                                                            Mã lưu trú: {member.residentCode || '-'} · {member.phoneNumber || 'Chưa có SĐT'}
                                                      </p>
                                                      <div className="mt-2 flex flex-wrap gap-2">
                                                            <span
                                                                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                                                        member.status
                                                                  )}`}
                                                            >
                                                                  {getStatusLabel(member.status)}
                                                            </span>
                                                            <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                                                                  {getResidentRoomText(member)}
                                                            </span>
                                                      </div>
                                                </div>
                                          </div>

                                          <div className="flex flex-wrap gap-2">
                                                {isLeft ? (
                                                      onReactivate && (
                                                            <button
                                                                  type="button"
                                                                  onClick={() => onReactivate(member)}
                                                                  disabled={isReactivating}
                                                                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                  <Edit2 className="h-4 w-4" />
                                                                  {isReactivating ? 'Đang đăng ký lại...' : 'Đăng ký lại'}
                                                            </button>
                                                      )
                                                ) : (
                                                      <>
                                                            <button
                                                                  type="button"
                                                                  onClick={onAssignRoom}
                                                                  className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                                                            >
                                                                  <DoorOpen className="h-4 w-4" />
                                                                  {getRoomActionLabel(member)}
                                                            </button>

                                                            <button
                                                                  type="button"
                                                                  onClick={onEdit}
                                                                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                                                            >
                                                                  <Edit2 className="h-4 w-4" />
                                                                  Sửa hồ sơ
                                                            </button>
                                                      </>
                                                )}
                                          </div>
                                    </div>

                                    <div className="mb-5 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
                                          {detailTabs.map((tab) => (
                                                <button
                                                      key={tab.key}
                                                      type="button"
                                                      onClick={() => setActiveTab(tab.key)}
                                                      className={[
                                                            'rounded-2xl border px-3 py-3 text-left transition',
                                                            activeTab === tab.key
                                                                  ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                                                                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                                                      ].join(' ')}
                                                >
                                                      <div className="text-sm font-bold">{tab.label}</div>
                                                      <div
                                                            className={[
                                                                  'mt-1 text-xs',
                                                                  activeTab === tab.key
                                                                        ? 'text-slate-300'
                                                                        : 'text-slate-400',
                                                            ].join(' ')}
                                                      >
                                                            {tab.description}
                                                      </div>
                                                </button>
                                          ))}
                                    </div>

                                    {activeTab === 'overview' && (
                                          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                                                <DetailCard title="Thông tin cá nhân">
                                                      <DetailItem
                                                            icon={<IdCard className="h-4 w-4" />}
                                                            label="Tên thánh"
                                                            value={member.holyName || '-'}
                                                      />
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

                                                <div className="space-y-4">
                                                      <DetailCard title="Tóm tắt lưu trú">
                                                            <DetailItem
                                                                  icon={<DoorOpen className="h-4 w-4" />}
                                                                  label="Phòng hiện tại"
                                                                  value={getResidentRoomText(member)}
                                                            />
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
                                                      </DetailCard>

                                                      <DetailCard title="Liên hệ chính">
                                                            <PrimaryContactBlock
                                                                  contact={contact}
                                                                  onOpenContacts={
                                                                        !isLeft && onOpenContacts
                                                                              ? () => onOpenContacts(member)
                                                                              : undefined
                                                                  }
                                                            />
                                                      </DetailCard>

                                                      <DetailCard title="Tổ chức">
                                                            <OrganizationSummary
                                                                  organization={organization}
                                                                  emptyText={
                                                                        hasOrganizationInfo
                                                                              ? undefined
                                                                              : 'Chưa có tổ, ban hoặc chức vụ.'
                                                                  }
                                                            />
                                                      </DetailCard>
                                                </div>
                                          </div>
                                    )}

                                    {activeTab === 'contacts' && (
                                          <DetailCard
                                                title="Phụ huynh / Người giám hộ"
                                                action={
                                                      !isLeft && onOpenContacts ? (
                                                            <button
                                                                  type="button"
                                                                  onClick={() => onOpenContacts(member)}
                                                                  className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                                                            >
                                                                  Mở quản lý liên hệ
                                                            </button>
                                                      ) : undefined
                                                }
                                          >
                                                <ParentsSection
                                                      residentId={member.id}
                                                      readonly={isLeft}
                                                      onDataChange={onDataChange}
                                                />
                                          </DetailCard>
                                    )}

                                    {activeTab === 'room' && (
                                          <div className="grid gap-4 xl:grid-cols-2">
                                                <DetailCard
                                                      title="Thông tin lưu trú"
                                                      action={
                                                            !isLeft ? (
                                                                  <button
                                                                        type="button"
                                                                        onClick={onAssignRoom}
                                                                        className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
                                                                  >
                                                                        {getRoomActionLabel(member)}
                                                                  </button>
                                                            ) : undefined
                                                      }
                                                >
                                                      <DetailItem
                                                            icon={<DoorOpen className="h-4 w-4" />}
                                                            label="Phòng hiện tại"
                                                            value={getResidentRoomText(member)}
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

                                                <DetailCard title="Ghi chú phòng ở">
                                                      <PlaceholderData
                                                            title="Lịch sử phòng sẽ bổ sung sau"
                                                            description="Simple Mode hiện ưu tiên phòng hiện tại. Detailed Mode có thể mở thêm lịch sử gán phòng sau."
                                                      />
                                                </DetailCard>
                                          </div>
                                    )}

                                    {activeTab === 'education' && (
                                          <div className="grid gap-4 xl:grid-cols-2">
                                                <DetailCard title="Thông tin học hành">
                                                      <EducationInfoSection
                                                            residentId={member.id}
                                                            education={member.education}
                                                            readonly={isLeft}
                                                            isSaving={isSavingEducation}
                                                            onSave={
                                                                  onSaveEducation ||
                                                                  (() => {
                                                                        console.warn('onSaveEducation is not provided');
                                                                  })
                                                            }
                                                      />
                                                </DetailCard>

                                                <DetailCard title="Lịch học">
                                                      <StudyScheduleSection
                                                            residentId={member.id}
                                                            schedules={member.studySchedules || []}
                                                            readonly={isLeft}
                                                            isSaving={isSavingStudySchedule}
                                                            isDeleting={isDeletingStudySchedule}
                                                            onSave={
                                                                  onSaveStudySchedule ||
                                                                  (() => {
                                                                        console.warn('onSaveStudySchedule is not provided');
                                                                  })
                                                            }
                                                            onDelete={
                                                                  onDeleteStudySchedule ||
                                                                  (() => {
                                                                        console.warn('onDeleteStudySchedule is not provided');
                                                                  })
                                                            }
                                                      />
                                                </DetailCard>
                                          </div>
                                    )}

                                    {activeTab === 'organization' && (
                                          <DetailCard
                                                title="Tổ chức lưu xá"
                                                action={
                                                      !isLeft && onOpenOrganization ? (
                                                            <button
                                                                  type="button"
                                                                  onClick={() => openOrganization('appointment')}
                                                                  className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                                                            >
                                                                  Bổ nhiệm
                                                            </button>
                                                      ) : undefined
                                                }
                                          >
                                                <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                                                      <div className="space-y-3">
                                                            <UnitManagementLine
                                                                  label="Tổ"
                                                                  units={organization.teams}
                                                                  emptyText="Chưa vào tổ"
                                                                  actionText={
                                                                        organization.teams.length > 0
                                                                              ? 'Đổi tổ'
                                                                              : '+ Tổ'
                                                                  }
                                                                  onAction={
                                                                        !isLeft && onOpenOrganization
                                                                              ? () =>
                                                                                      openOrganization(
                                                                                            currentTeam
                                                                                                  ? 'transfer_team'
                                                                                                  : 'add_team',
                                                                                            { unitId: currentTeam?.unitId ?? null }
                                                                                      )
                                                                              : undefined
                                                                  }
                                                            />

                                                            <UnitManagementLine
                                                                  label="Ban"
                                                                  units={organization.committees}
                                                                  emptyText="Chưa vào ban"
                                                                  actionText="+ Ban"
                                                                  onAction={
                                                                        !isLeft && onOpenOrganization
                                                                              ? () => openOrganization('add_committee')
                                                                              : undefined
                                                                  }
                                                            />
                                                      </div>

                                                      <div>
                                                            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                                                                  Chức vụ
                                                            </div>
                                                            {organization.roles.length > 0 ? (
                                                                  <div className="space-y-2">
                                                                        {organization.roles.map((role) => (
                                                                              <RoleItem
                                                                                    key={`${role.id || role.title}`}
                                                                                    role={role}
                                                                              />
                                                                        ))}
                                                                  </div>
                                                            ) : (
                                                                  <PlaceholderData
                                                                        title="Chưa có chức vụ"
                                                                        description="Có thể bổ nhiệm học viên vào vai trò phù hợp trong nhiệm kỳ hiện tại."
                                                                  />
                                                            )}
                                                      </div>
                                                </div>
                                          </DetailCard>
                                    )}

                                    {activeTab === 'account' && (
                                          <DetailCard title="Tài khoản đăng nhập">
                                                <div className="flex flex-col gap-3">
                                                      {member.userId ? (
                                                            <>
                                                                  <div
                                                                        className={`flex flex-col gap-3 rounded-xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${accountStatus.className}`}
                                                                  >
                                                                        <div>
                                                                              <p className={`text-sm font-semibold ${accountStatus.titleClassName}`}>
                                                                                    {accountStatus.title}
                                                                              </p>
                                                                              <p className={`mt-1 text-sm ${accountStatus.descriptionClassName}`}>
                                                                                    {accountStatus.description}
                                                                              </p>
                                                                        </div>

                                                                        <span
                                                                              className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ring-1 ${accountStatus.badgeClassName}`}
                                                                        >
                                                                              {accountStatus.badgeText}
                                                                        </span>
                                                                  </div>

                                                                  {member.username && (
                                                                        <DetailItem
                                                                              icon={<IdCard className="h-4 w-4" />}
                                                                              label="Tên đăng nhập"
                                                                              value={member.username}
                                                                        />
                                                                  )}
                                                            </>
                                                      ) : isLeft ? (
                                                            <div className="rounded-xl bg-slate-50 px-4 py-3">
                                                                  <p className="text-sm font-semibold text-slate-800">
                                                                        Chưa có tài khoản đăng nhập
                                                                  </p>
                                                                  <p className="mt-1 text-sm text-slate-500">
                                                                        Học viên đã rời lưu xá nên không thể tạo tài khoản mới từ hồ sơ này.
                                                                  </p>
                                                            </div>
                                                      ) : (
                                                            <>
                                                                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                                                                        <p className="text-sm font-semibold text-slate-800">
                                                                              Chưa có tài khoản đăng nhập
                                                                        </p>
                                                                        <p className="mt-1 text-sm text-slate-500">
                                                                              Tạo tài khoản để học viên có thể đăng nhập, xem lịch và công tác được phân công.
                                                                        </p>
                                                                  </div>

                                                                  <button
                                                                        type="button"
                                                                        onClick={() => onCreateUser?.(member)}
                                                                        disabled={isCreatingUser || !onCreateUser}
                                                                        className="inline-flex w-fit items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                                                  >
                                                                        {isCreatingUser ? 'Đang tạo...' : 'Tạo tài khoản'}
                                                                  </button>

                                                                  <p className="text-xs text-slate-500">
                                                                        Tài khoản sẽ có vai trò Học viên, mật khẩu tạm 123456 và yêu cầu đổi mật khẩu khi đăng nhập lần đầu.
                                                                  </p>
                                                            </>
                                                      )}
                                                </div>
                                          </DetailCard>
                                    )}
                              </div>
                        </div>
                  </div>
            </div>
      );
}

function DetailCard({
      title,
      children,
      action,
}: {
      title: string;
      children: ReactNode;
      action?: ReactNode;
}) {
      return (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="text-base font-bold text-slate-950">{title}</h3>
                        {action}
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
      icon: ReactNode;
      label: string;
      value: ReactNode;
}) {
      return (
            <div className="flex gap-3">
                  <div className="mt-0.5 text-slate-400">{icon}</div>
                  <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              {label}
                        </p>
                        <p className="text-sm font-medium text-slate-800">{value}</p>
                  </div>
            </div>
      );
}

function UnitBadge({ unit }: { unit: OrganizationUnitDisplay }) {
      return (
            <span
                  className={[
                        'inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
                        unit.colorClass || 'bg-slate-50 text-slate-700 ring-slate-200',
                  ].join(' ')}
                  title={unit.leaderLabel ? `${unit.unitName} - ${unit.leaderLabel}` : unit.unitName}
            >
                  <span className="truncate">{unit.unitName}</span>
                  {unit.isLeader && (
                        <span aria-label={unit.leaderLabel || 'Phụ trách'} title={unit.leaderLabel}>
                              {unit.unitType === 'committee' ? '♛' : '♕'}
                        </span>
                  )}
            </span>
      );
}

function UnitManagementLine({
      label,
      units,
      emptyText,
      actionText,
      onAction,
}: {
      label: string;
      units: OrganizationUnitDisplay[];
      emptyText: string;
      actionText: string;
      onAction?: () => void;
}) {
      return (
            <div className="rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
                  <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                              {label}
                        </div>

                        {onAction && (
                              <button
                                    type="button"
                                    onClick={onAction}
                                    className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                              >
                                    {actionText}
                              </button>
                        )}
                  </div>

                  {units.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                              {units.map((unit) => (
                                    <UnitBadge
                                          key={`${unit.unitType}-${unit.unitId || unit.unitName}`}
                                          unit={unit}
                                    />
                              ))}
                        </div>
                  ) : (
                        <div className="text-sm font-medium text-slate-500">
                              {emptyText}
                        </div>
                  )}
            </div>
      );
}

function RoleItem({ role }: { role: OrganizationRoleDisplay }) {
      return (
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold leading-5 text-slate-800 ring-1 ring-slate-100">
                  {role.title}
            </div>
      );
}

function OrganizationSummary({
      organization,
      emptyText,
}: {
      organization: MemberOrganizationDisplay;
      emptyText?: string;
}) {
      if (emptyText) {
            return (
                  <PlaceholderData
                        title={emptyText}
                        description="Có thể thêm vào Tổ/Ban hoặc bổ nhiệm chức vụ từ tab Tổ chức."
                  />
            );
      }

      return (
            <div className="space-y-3">
                  <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                              Tổ
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                              {organization.teams.length > 0 ? (
                                    organization.teams.map((unit) => (
                                          <UnitBadge
                                                key={`${unit.unitType}-${unit.unitId || unit.unitName}`}
                                                unit={unit}
                                          />
                                    ))
                              ) : (
                                    <span className="text-sm text-slate-500">Chưa vào tổ</span>
                              )}
                        </div>
                  </div>

                  <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                              Ban
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                              {organization.committees.length > 0 ? (
                                    organization.committees.map((unit) => (
                                          <UnitBadge
                                                key={`${unit.unitType}-${unit.unitId || unit.unitName}`}
                                                unit={unit}
                                          />
                                    ))
                              ) : (
                                    <span className="text-sm text-slate-500">Chưa vào ban</span>
                              )}
                        </div>
                  </div>

                  <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                              Chức vụ
                        </div>
                        <div className="mt-1 space-y-1">
                              {organization.roles.length > 0 ? (
                                    organization.roles.slice(0, 3).map((role) => (
                                          <div
                                                key={`${role.id || role.title}`}
                                                className="text-sm font-semibold text-slate-800"
                                          >
                                                {role.title}
                                          </div>
                                    ))
                              ) : (
                                    <span className="text-sm text-slate-500">Chưa có chức vụ</span>
                              )}
                        </div>
                  </div>
            </div>
      );
}

function PrimaryContactBlock({
      contact,
      onOpenContacts,
}: {
      contact: PrimaryContactSummary;
      onOpenContacts?: () => void;
}) {
      return (
            <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                        <div
                              className={[
                                    'space-y-0.5 text-sm',
                                    contact.isMissing ? 'text-amber-700' : 'text-slate-800',
                              ].join(' ')}
                        >
                              <div className="font-bold">{contact.relation}</div>
                              <div className="font-semibold">{contact.name}</div>
                              {contact.phone && (
                                    <div className="font-medium text-slate-600">{contact.phone}</div>
                              )}
                        </div>

                        {onOpenContacts && (
                              <button
                                    type="button"
                                    onClick={onOpenContacts}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                              >
                                    {contact.isMissing ? '+ Liên hệ' : 'Liên hệ'}
                              </button>
                        )}
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
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">{title}</p>
                  <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
      );
}
