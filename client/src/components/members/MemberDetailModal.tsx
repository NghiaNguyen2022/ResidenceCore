import { useState, type ReactNode } from 'react';
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
import { residenceMediumStyle } from '@/components/shared/styleMedium';
import { ParentsSection } from './ParentsSection';
import { EducationInfoSection } from './EducationInfoSection';
import { StudyScheduleSection } from './StudyScheduleSection';
import ContactsListModal from './ContactsListModal';
import {
      formatDate,
      getGenderLabel,
      getRoomActionLabel,
      getRoomLabelFromMember,
      hasCurrentRoom,
      getStatusClass,
      getStatusLabel,
} from './memberUtils';


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
            member?.accountIsActive === false;

      if (isLocked) {
            return {
                  title: 'Đã khóa tài khoản',
                  description:
                        'Tài khoản học viên đã được khóa do học viên đã rời/ngừng lưu trú.',
                  className: 'bg-slate-100',
                  titleClassName: 'text-slate-800',
                  descriptionClassName: 'text-slate-600',
                  badgeClassName: 'bg-white text-slate-700 ring-slate-300',
                  badgeText: 'Đã khóa',
            };
      }

      return {
            title: 'Đã có tài khoản',
            description: 'Học viên đã có tài khoản đăng nhập.',
            className: 'bg-emerald-50',
            titleClassName: 'text-emerald-800',
            descriptionClassName: 'text-emerald-700',
            badgeClassName: 'bg-white text-emerald-700 ring-emerald-200',
            badgeText: 'Học viên',
      };
}



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

export function MemberDetailModal({
      member,
      organizationTitles = [],
      organizationUnits = [],
      onClose,
      onEdit,
      onAssignRoom,
      onOpenOrganization,
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
      organizationTitles?: string[];
      organizationUnits?: string[];
      onClose: () => void;
      onEdit: () => void;
      onAssignRoom: () => void;
      onOpenOrganization?: (member: any) => void;
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
      const displayName = member?.holyName
            ? `${member.holyName} ${member.fullName || ''}`.trim()
            : member?.fullName || '-';

      const isLeft = isResidentLeft(member);
      const accountStatus = getAccountStatus(member);
      const [isContactModalOpen, setIsContactModalOpen] = useState(false);

      return (
            <div className={residenceMediumStyle.modalOverlay}>
                  <div className={`${residenceMediumStyle.modalShell} max-w-5xl`}>
                        <div className={residenceMediumStyle.modalHeader}>
                              <div>
                                    <p className={residenceMediumStyle.modalEyebrow}>
                                          Hồ sơ học viên
                                    </p>
                                    <h2 className={residenceMediumStyle.modalTitle}>
                                          {displayName}
                                    </h2>
                              </div>

                              <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl border border-amber-100 bg-white/75 p-2 text-slate-500 shadow-sm shadow-slate-900/5 transition hover:bg-white hover:text-slate-800"
                              >
                                    <X className="h-5 w-5" />
                              </button>
                        </div>

                        <div className="overflow-y-auto bg-[linear-gradient(180deg,rgba(255,251,235,0.26)_0%,rgba(248,250,252,0.46)_100%)] p-5 sm:p-6">
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

                              <div className="mb-6 flex flex-col gap-4 rounded-[24px] border border-amber-100/55 bg-[linear-gradient(135deg,rgba(255,255,255,0.80)_0%,rgba(255,251,235,0.58)_60%,rgba(245,158,11,0.12)_100%)] p-5 shadow-[0_16px_40px_rgba(12,10,9,0.075),inset_0_1px_0_rgba(255,255,255,0.72)] md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-4">
                                          <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-amber-100/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.86)_0%,rgba(254,243,199,0.74)_65%,rgba(245,158,11,0.22)_100%)] text-2xl font-bold text-slate-800 shadow-[0_12px_28px_rgba(12,10,9,0.09),inset_0_1px_0_rgba(255,255,255,0.80)]">
                                                {member.fullName?.charAt(0)?.toUpperCase() || 'H'}
                                          </div>

                                          <div>
                                                <p className="text-xl font-semibold tracking-tight text-slate-950">
                                                      {displayName}
                                                </p>
                                                <p className="text-sm font-medium text-slate-500">
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
                                          {isLeft ? (
                                                onReactivate && (
                                                      <button
                                                            type="button"
                                                            onClick={() => onReactivate(member)}
                                                            disabled={isReactivating}
                                                            className="inline-flex h-9 items-center justify-center gap-2 rounded-2xl border border-emerald-100/70 bg-white/70 px-4 text-sm font-semibold text-emerald-700 shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:bg-emerald-50/80 disabled:cursor-not-allowed disabled:opacity-60"
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
                                                            className="inline-flex h-9 items-center justify-center gap-2 rounded-2xl border border-emerald-100/70 bg-white/70 px-4 text-sm font-semibold text-emerald-700 shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:bg-emerald-50/80"
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

                                    <DetailCard title="Thông tin lưu trú">
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

                                    <DetailCard title="Tổ chức lưu xá">
                                          <DetailItem
                                                icon={<Users className="h-4 w-4" />}
                                                label="Tổ / Ban"
                                                value={
                                                      organizationUnits.length > 0
                                                            ? organizationUnits.join(', ')
                                                            : 'Chưa phân tổ'
                                                }
                                          />
                                          <DetailItem
                                                icon={<Database className="h-4 w-4" />}
                                                label="Chức vụ hiện tại"
                                                value={
                                                      organizationTitles.length > 0
                                                            ? organizationTitles.join(', ')
                                                            : 'Chưa có chức vụ'
                                                }
                                          />

                                          {!isLeft && onOpenOrganization && (
                                                <button
                                                      type="button"
                                                      onClick={() => onOpenOrganization(member)}
                                                      className={residenceMediumStyle.buttonCard}
                                                >
                                                      Quản lý bổ nhiệm
                                                </button>
                                          )}
                                    </DetailCard>

                                    <DetailCard title="Tài khoản đăng nhập">
                                          <div className="flex flex-col gap-3">
                                                {member.userId ? (
                                                      <>
                                                            <div
                                                                  className={`flex flex-col gap-3 rounded-2xl border border-amber-100/55 bg-white/58 px-4 py-3 shadow-sm shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between ${accountStatus.className}`}
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
                                                      <div className="rounded-2xl border border-amber-100/55 bg-white/58 px-4 py-3 shadow-sm shadow-slate-900/5">
                                                            <p className="text-sm font-semibold text-slate-800">
                                                                  Chưa có tài khoản đăng nhập
                                                            </p>
                                                            <p className="mt-1 text-sm text-slate-500">
                                                                  Học viên đã rời lưu xá nên không thể tạo tài khoản mới từ hồ sơ này.
                                                            </p>
                                                      </div>
                                                ) : (
                                                      <>
                                                            <div className="rounded-2xl border border-amber-100/55 bg-white/58 px-4 py-3 shadow-sm shadow-slate-900/5">
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
                                                                  className={residenceMediumStyle.buttonCardPrimary}
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

                                    <DetailCard title="Phụ huynh / Người giám hộ">
                                          <ParentsSection
                                                residentId={member.id}
                                                readonly={isLeft}
                                                onDataChange={onDataChange}
                                                onAddContact={() => setIsContactModalOpen(true)}
                                          />
                                    </DetailCard>

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

                                    <DetailCard title="Tài chính học viên">
                                          <PlaceholderData
                                                title="Chưa có thông tin tài chính"
                                                description="Các khoản phí và tình trạng thanh toán sẽ hiển thị tại đây khi có dữ liệu."
                                          />
                                    </DetailCard>

                                    <DetailCard title="Sinh hoạt & Nề nếp">
                                          <PlaceholderData
                                                title="Chưa có thông tin sinh hoạt"
                                                description="Công tác, điểm danh và lịch sinh hoạt của học viên sẽ được hiển thị khi có dữ liệu."
                                          />
                                    </DetailCard>
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
                  </div>
            </div>
      );
}

function DetailCard({
      title,
      children,
}: {
      title: string;
      children: ReactNode;
}) {
      return (
            <div className={`${residenceMediumStyle.premiumGoldBlackSoftSurface} p-5`}>
                  <div className="mb-4">
                        <h3 className="text-base font-semibold tracking-tight text-slate-950">{title}</h3>
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
            <div className={residenceMediumStyle.memberInfoBox}>
                  <div className="mb-1 flex items-center gap-2 text-slate-400">
                        {icon}
                        <p className={residenceMediumStyle.memberLabel}>
                              {label}
                        </p>
                  </div>
                  <p className={residenceMediumStyle.memberValue}>{value}</p>
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
            <div className="rounded-2xl border border-dashed border-amber-100/70 bg-white/52 p-4 shadow-sm shadow-slate-900/5">
                  <p className="text-sm font-semibold text-slate-700">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
            </div>
      );
}
