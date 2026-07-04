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
import ContactsListModal from './ContactsListModal';
import { cx, residenceMediumStyle } from '@/components/shared/styleMedium';
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

type OrganizationAction = 'add_team_member' | 'transfer_team_member' | 'add_committee_member' | 'create_assignment';

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
      educationLevel?: 'high_school' | 'vocational' | 'college' | 'university' | 'other' | null;
      schoolName: string;
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

function normalizeDetailTab(value?: string | null): DetailTabKey {
      return detailTabs.some((tab) => tab.key === value)
            ? (value as DetailTabKey)
            : 'overview';
}

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
      initialTab,
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
      onLeaveOrDelete,
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
      initialTab?: string;
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
      onLeaveOrDelete?: (member: any) => void;
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
      const [activeTab, setActiveTab] = useState<DetailTabKey>(() => normalizeDetailTab(initialTab));
      const [isContactModalOpen, setIsContactModalOpen] = useState(false);

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
            <div className={residenceMediumStyle.modalOverlay}>
                  <div className={`${residenceMediumStyle.modalShell} max-w-[1180px] overflow-hidden`}>
                        <div className={residenceMediumStyle.modalHeader}>
                              <div>
                                    <p className={residenceMediumStyle.modalEyebrow}>
                                          Hồ sơ học viên
                                    </p>
                                    <h2 className={residenceMediumStyle.modalTitle}>
                                          {displayName}
                                    </h2>
                                    <p className={residenceMediumStyle.modalSubtitle}>
                                          Tổng hợp thông tin lưu trú, liên hệ, học tập, tổ chức và tài khoản.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl p-2 text-slate-500 transition hover:bg-white/70 hover:text-slate-700"
                              >
                                    <X className="h-5 w-5" />
                              </button>
                        </div>

                        <div className="max-h-[calc(92vh-96px)] overflow-y-auto overflow-x-hidden">
                              <div className="p-4">
                                    {isLeft && (
                                          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                                                <p className="font-semibold">Học viên đã rời lưu xá / ngừng lưu trú</p>
                                                <p className="mt-1">
                                                      Hồ sơ này đang được giữ để tra cứu lịch sử. Các thao tác cập nhật hồ sơ,
                                                      phòng ở và liên hệ gia đình đang được khóa. Muốn tiếp tục quản lý, hãy dùng
                                                      chức năng Đăng ký lại.
                                                </p>
                                          </div>
                                    )}

                                    <div className="mb-4 flex flex-col gap-3 rounded-3xl border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_65%,#fff4e8_100%)] p-4 shadow-[0_14px_34px_rgba(120,53,15,0.06)] lg:flex-row lg:items-center lg:justify-between">
                                          <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-amber-700 text-lg font-bold text-white shadow-md shadow-amber-900/15">
                                                      {member.fullName?.charAt(0)?.toUpperCase() || 'H'}
                                                </div>

                                                <div>
                                                      <p className="text-lg font-bold text-slate-950">
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
                                                                  className={`${residenceMediumStyle.primaryButton} inline-flex items-center gap-2`}
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
                                                                  className={`${residenceMediumStyle.secondaryButton} inline-flex items-center gap-2`}
                                                            >
                                                                  <DoorOpen className="h-4 w-4" />
                                                                  {getRoomActionLabel(member)}
                                                            </button>

                                                            <button
                                                                  type="button"
                                                                  onClick={onEdit}
                                                                  className={`${residenceMediumStyle.primaryButton} inline-flex items-center gap-2`}
                                                            >
                                                                  <Edit2 className="h-4 w-4" />
                                                                  Sửa hồ sơ
                                                            </button>

                                                            {onLeaveOrDelete && (
                                                                  <button
                                                                        type="button"
                                                                        onClick={() => onLeaveOrDelete(member)}
                                                                        className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-white/80 px-3.5 py-2 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50"
                                                                  >
                                                                        <Database className="h-4 w-4" />
                                                                        Ngừng / Rời
                                                                  </button>
                                                            )}
                                                      </>
                                                )}
                                          </div>
                                    </div>

                                    <div className="mb-4 overflow-x-auto rounded-2xl border border-amber-100/80 bg-white/85 p-1 shadow-sm shadow-amber-900/5">
                                          <div className="flex min-w-max gap-1.5">
                                                {detailTabs.map((tab) => (
                                                      <button
                                                            key={tab.key}
                                                            type="button"
                                                            title={tab.description}
                                                            onClick={() => setActiveTab(tab.key)}
                                                            className={[
                                                                  'rounded-xl px-3 py-1.5 text-sm font-semibold transition',
                                                                  activeTab === tab.key
                                                                        ? 'bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)]'
                                                                        : 'text-slate-600 hover:bg-amber-50/70 hover:text-slate-900',
                                                            ].join(' ')}
                                                      >
                                                            {tab.label}
                                                      </button>
                                                ))}
                                          </div>
                                    </div>

                                    {activeTab === 'overview' && (
                                          <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                                                      <DetailMiniStat
                                                            label="Phòng hiện tại"
                                                            value={getResidentRoomText(member)}
                                                            tone={hasCurrentRoom(member) ? 'normal' : 'warning'}
                                                      />
                                                      <DetailMiniStat
                                                            label="Liên hệ chính"
                                                            value={contact.isMissing ? 'Cần bổ sung' : contact.name}
                                                            tone={contact.isMissing ? 'warning' : 'normal'}
                                                      />
                                                      <DetailMiniStat
                                                            label="Tổ chức"
                                                            value={
                                                                  hasOrganizationInfo
                                                                        ? `${organization.teams.length} tổ · ${organization.roles.length} chức vụ`
                                                                        : 'Chưa có'
                                                            }
                                                            tone={hasOrganizationInfo ? 'normal' : 'muted'}
                                                      />
                                                      <DetailMiniStat
                                                            label="Tài khoản"
                                                            value={member.userId ? accountStatus.badgeText : 'Chưa có'}
                                                            tone={member.userId ? 'normal' : 'muted'}
                                                      />
                                                </div>

                                                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
                                                      <DetailCard title="Thông tin cá nhân">
                                                            <div className="grid gap-3 sm:grid-cols-2">
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
                                                            </div>
                                                      </DetailCard>

                                                      <div className="space-y-3">
                                                            <DetailCard title="Tóm tắt lưu trú">
                                                                  <div className="grid gap-3 sm:grid-cols-2">
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
                                                                  </div>
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
                                          </div>
                                    )}

                                    {activeTab === 'contacts' && (
                                          <div className="space-y-3">
                                                <div className="rounded-3xl border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_68%,#fff4e8_100%)] px-4 py-3 shadow-[0_14px_34px_rgba(120,53,15,0.055)]">
                                                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                                            <div>
                                                                  <h3 className="text-base font-bold text-slate-950">
                                                                        Liên hệ gia đình
                                                                  </h3>
                                                                  <p className="mt-1 text-sm text-slate-500">
                                                                        Cha, mẹ, người giám hộ và số liên lạc cần dùng hằng ngày.
                                                                  </p>
                                                            </div>

                                                            {!isLeft && (
                                                                  <button
                                                                        type="button"
                                                                        onClick={() => setIsContactModalOpen(true)}
                                                                        className={residenceMediumStyle.primaryButton}
                                                                  >
                                                                        Thêm liên hệ
                                                                  </button>
                                                            )}
                                                      </div>
                                                </div>

                                                <div className={residenceMediumStyle.cardSection}>
                                                      <ParentsSection
                                                            residentId={member.id}
                                                            readonly={isLeft}
                                                            onDataChange={onDataChange}
                                                            onAddContact={() => setIsContactModalOpen(true)}
                                                      />
                                                </div>
                                          </div>
                                    )}

                                    {activeTab === 'room' && (
                                          <div className="space-y-3">
                                                <div className="rounded-3xl border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_68%,#fff4e8_100%)] px-4 py-3 shadow-[0_14px_34px_rgba(120,53,15,0.055)]">
                                                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                                            <div>
                                                                  <h3 className="text-base font-bold text-slate-950">
                                                                        Phòng ở & lưu trú
                                                                  </h3>
                                                                  <p className="mt-1 text-sm text-slate-500">
                                                                        Phòng hiện tại, ngày vào/rời và trạng thái lưu trú.
                                                                  </p>
                                                            </div>

                                                            {!isLeft && (
                                                                  <button
                                                                        type="button"
                                                                        onClick={onAssignRoom}
                                                                        className={residenceMediumStyle.primaryButton}
                                                                  >
                                                                        {getRoomActionLabel(member)}
                                                                  </button>
                                                            )}
                                                      </div>
                                                </div>

                                                <div className="grid gap-3 xl:grid-cols-[1fr_0.9fr]">
                                                      <DetailCard title="Thông tin lưu trú">
                                                            <div className="grid gap-3 sm:grid-cols-2">
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
                                                                  <div className="sm:col-span-2">
                                                                        <DetailItem
                                                                              icon={<Database className="h-4 w-4" />}
                                                                              label="Ghi chú"
                                                                              value={member.notes || '-'}
                                                                        />
                                                                  </div>
                                                            </div>
                                                      </DetailCard>

                                                      <DetailCard title="Quản lý trạng thái lưu trú">
                                                            <div className="space-y-3">
                                                                  <p className="text-sm leading-6 text-slate-500">
                                                                        Các thao tác ngừng/rời lưu xá được đặt trong hồ sơ chi tiết để giữ đúng vai trò workspace chính.
                                                                  </p>

                                                                  {isLeft ? (
                                                                        <PlaceholderData
                                                                              title="Học viên đã rời/ngừng lưu trú"
                                                                              description="Chỉ có thể đăng ký lại nếu học viên quay lại lưu trú."
                                                                        />
                                                                  ) : onLeaveOrDelete ? (
                                                                        <button
                                                                              type="button"
                                                                              onClick={() => onLeaveOrDelete(member)}
                                                                              className="inline-flex w-fit items-center gap-2 rounded-2xl border border-rose-200 bg-white/80 px-3.5 py-2 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50"
                                                                        >
                                                                              <Database className="h-4 w-4" />
                                                                              Ngừng / Rời lưu xá
                                                                        </button>
                                                                  ) : (
                                                                        <PlaceholderData
                                                                              title="Chưa cấu hình thao tác"
                                                                              description="Luồng xử lý trạng thái lưu trú sẽ được mở từ trang Học viên."
                                                                        />
                                                                  )}
                                                            </div>
                                                      </DetailCard>
                                                </div>
                                          </div>
                                    )}

                                    {activeTab === 'education' && (
                                          <div className="min-w-0 space-y-4">
                                                <div className="overflow-hidden rounded-3xl border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_68%,#fff4e8_100%)] px-5 py-4 shadow-[0_14px_34px_rgba(120,53,15,0.055)]">
                                                      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                                                            <div className="min-w-0">
                                                                  <h3 className="text-xl font-bold text-slate-950">
                                                                        Học tập & lịch học
                                                                  </h3>
                                                                  <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                                                                        Theo dõi trường/lớp và các khung giờ học để tránh phân công trùng lịch. Phần lịch được gom trong một khung riêng để dễ xem, dễ mở rộng khi cần.
                                                                  </p>
                                                            </div>

                                                            <div className="flex w-fit items-center gap-2 rounded-2xl border border-amber-100 bg-white/75 px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm">
                                                                  <CalendarDays className="h-4 w-4 text-amber-700" />
                                                                  {member.studySchedules?.length || 0} lịch học
                                                            </div>
                                                      </div>
                                                </div>

                                                <div className="grid min-w-0 items-start gap-4 2xl:grid-cols-[280px_minmax(0,1fr)]">
                                                      <div className="min-w-0">
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
                                                      </div>

                                                      <div className="min-w-0 overflow-hidden">
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
                                                      </div>
                                                </div>
                                          </div>
                                    )}

                                    {activeTab === 'organization' && (
                                          <div className="space-y-3">
                                                <div className="rounded-3xl border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_68%,#fff4e8_100%)] px-4 py-3 shadow-[0_14px_34px_rgba(120,53,15,0.055)]">
                                                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                                            <div>
                                                                  <h3 className="text-base font-bold text-slate-950">
                                                                        Tổ chức lưu xá
                                                                  </h3>
                                                                  <p className="mt-1 text-sm text-slate-500">
                                                                        Tổ, Ban và chức vụ đang đảm nhiệm.
                                                                  </p>
                                                            </div>

                                                            {!isLeft && onOpenOrganization && (
                                                                  <button
                                                                        type="button"
                                                                        onClick={() => openOrganization('create_assignment')}
                                                                        className={residenceMediumStyle.primaryButton}
                                                                  >
                                                                        Bổ nhiệm
                                                                  </button>
                                                            )}
                                                      </div>
                                                </div>

                                                <div className="grid gap-3 lg:grid-cols-[0.95fr_1.25fr]">
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
                                                                                                  ? 'transfer_team_member'
                                                                                                  : 'add_team_member',
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
                                                                              ? () => openOrganization('add_committee_member')
                                                                              : undefined
                                                                  }
                                                            />
                                                      </div>

                                                      <div className={residenceMediumStyle.cardSection}>
                                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                                  <div>
                                                                        <h3 className="text-base font-bold text-slate-950">
                                                                              Chức vụ
                                                                        </h3>
                                                                        <p className="mt-1 text-sm text-slate-500">
                                                                              Vai trò được bổ nhiệm theo cơ cấu lưu xá.
                                                                        </p>
                                                                  </div>
                                                            </div>

                                                            {organization.roles.length > 0 ? (
                                                                  <div className="grid gap-2 sm:grid-cols-2">
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
                                          </div>
                                    )}

                                    {activeTab === 'account' && (
                                          <div className="space-y-3">
                                                <div className="rounded-3xl border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_68%,#fff4e8_100%)] px-4 py-3 shadow-[0_14px_34px_rgba(120,53,15,0.055)]">
                                                      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                                                            <div>
                                                                  <h3 className="text-base font-bold text-slate-950">
                                                                        Tài khoản đăng nhập
                                                                  </h3>
                                                                  <p className="mt-1 text-sm text-slate-500">
                                                                        Trạng thái tài khoản đăng nhập của học viên.
                                                                  </p>
                                                            </div>

                                                            {member.username && (
                                                                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-amber-100">
                                                                        {member.username}
                                                                  </span>
                                                            )}
                                                      </div>
                                                </div>

                                                <div className={residenceMediumStyle.cardSection}>
                                                      {member.userId ? (
                                                            <div className="space-y-3">
                                                                  <div
                                                                        className={`flex flex-col gap-3 rounded-2xl border border-amber-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${accountStatus.className}`}
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
                                                            </div>
                                                      ) : isLeft ? (
                                                            <PlaceholderData
                                                                  title="Chưa có tài khoản đăng nhập"
                                                                  description="Học viên đã rời lưu xá nên không thể tạo tài khoản mới từ hồ sơ này."
                                                            />
                                                      ) : (
                                                            <div className="space-y-3">
                                                                  <PlaceholderData
                                                                        title="Chưa có tài khoản đăng nhập"
                                                                        description="Tạo tài khoản để học viên có thể đăng nhập, xem lịch và công tác được phân công."
                                                                  />

                                                                  <button
                                                                        type="button"
                                                                        onClick={() => onCreateUser?.(member)}
                                                                        disabled={isCreatingUser || !onCreateUser}
                                                                        className={`${residenceMediumStyle.primaryButton} inline-flex w-fit items-center justify-center`}
                                                                  >
                                                                        {isCreatingUser ? 'Đang tạo...' : 'Tạo tài khoản'}
                                                                  </button>

                                                                  <p className="text-xs leading-5 text-slate-500">
                                                                        Tài khoản sẽ có vai trò Học viên, mật khẩu tạm 123456 và yêu cầu đổi mật khẩu khi đăng nhập lần đầu.
                                                                  </p>
                                                            </div>
                                                      )}
                                                </div>
                                          </div>
                                    )}
                              </div>
                        </div>
                  </div>

                  {isContactModalOpen && (
                        <ContactsListModal
                              initialMode="create"
                              initialResidentId={Number(member.id)}
                              initialSearchTerm={displayName}
                              closeAfterSave
                              formOnly
                              onClose={() => setIsContactModalOpen(false)}
                              onChanged={async () => {
                                    await onDataChange?.();
                              }}
                        />
                  )}
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
            <div className={cx(residenceMediumStyle.cardSection, 'min-w-0')}>
                  <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
                        <h3 className="min-w-0 truncate text-base font-bold text-slate-950">{title}</h3>
                        {action}
                  </div>
                  <div className="min-w-0 space-y-3">{children}</div>
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
            <div className="flex min-w-0 gap-2.5">
                  <div className="mt-0.5 shrink-0 text-slate-400">{icon}</div>
                  <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-400">
                              {label}
                        </p>
                        <p className="break-words text-sm font-medium text-slate-800">{value}</p>
                  </div>
            </div>
      );
}

function DetailMiniStat({
      label,
      value,
      tone = 'normal',
}: {
      label: string;
      value: ReactNode;
      tone?: 'normal' | 'warning' | 'muted';
}) {
      const toneClass = {
            normal: 'border-amber-100 bg-white/85 text-slate-900',
            warning: 'border-amber-200 bg-amber-50 text-amber-800',
            muted: 'border-slate-100 bg-white/70 text-slate-600',
      }[tone];

      return (
            <div className={`min-w-0 rounded-2xl border px-3 py-2.5 shadow-sm shadow-amber-900/5 ${toneClass}`}>
                  <p className="text-xs font-medium text-slate-400">{label}</p>
                  <p className="mt-1 truncate text-sm font-bold">{value}</p>
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
            <div className="rounded-2xl border border-amber-100 bg-amber-50/45 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="text-xs font-semibold text-slate-500">
                              {label}
                        </div>

                        {onAction && (
                              <button
                                    type="button"
                                    onClick={onAction}
                                    className="rounded-full border border-amber-100 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-amber-50"
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
            <div className="rounded-2xl border border-amber-100 bg-[linear-gradient(135deg,#ffffff_0%,#fff8ef_100%)] px-3 py-2 text-sm font-semibold leading-5 text-slate-800 shadow-sm shadow-amber-900/5">
                  <div className="line-clamp-2">{role.title}</div>
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
                        <div className="text-xs font-semibold text-slate-500">
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
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3">
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
                                    className={`${residenceMediumStyle.secondaryButton} px-3 py-2`}
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
            <div className="rounded-2xl border border-dashed border-amber-100 bg-amber-50/45 p-4">
                  <p className="text-sm font-semibold text-slate-800">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
            </div>
      );
}
