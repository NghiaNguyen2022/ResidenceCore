import type { ReactNode } from "react";
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
} from "lucide-react";

import { ParentsSection } from "./ParentsSection";
import { EducationInfoSection } from "./EducationInfoSection";
import { StudyScheduleSection } from "./StudyScheduleSection";
import {
      formatDate,
      getGenderLabel,
      getRoomActionLabel,
      getRoomLabelFromMember,
      hasCurrentRoom,
      getStatusLabel,
} from "./memberUtils";

import {
      AppModal,
      AppSection,
      EmptyState,
      StatusBadge,
} from "@/components/shared";

type EducationLevel =
      | "high_school"
      | "vocational"
      | "college"
      | "university"
      | "other";

type EducationInfoPayload = {
      residentId: number;
      schoolName: string;
      educationLevel?: EducationLevel | null;
      classOrMajor?: string | null;
      academicYear?: string | null;
      notes?: string | null;
};

type DayOfWeek =
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday";

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

type StatusTone =
      | "default"
      | "success"
      | "warning"
      | "danger"
      | "info"
      | "muted"
      | "purple";

function isResidentLeft(member: any) {
      const status = member?.status || member?.residenceStatus;

      return (
            status === "transferred_out" ||
            status === "left" ||
            status === "Đã rời lưu xá"
      );
}

function isResidentInactive(member: any) {
      const status = member?.status || member?.residenceStatus;

      return (
            status === "inactive" ||
            status === "temporary_leave" ||
            status === "Tạm ngưng" ||
            status === "Tạm vắng"
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

      return "Chưa gán";
}

function getResidentStatusTone(member: any): StatusTone {
      const status = member?.status || member?.residenceStatus;

      if (
            status === "active" ||
            status === "Đang ở" ||
            status === "living"
      ) {
            return "success";
      }

      if (
            status === "inactive" ||
            status === "temporary_leave" ||
            status === "Tạm ngưng" ||
            status === "Tạm vắng"
      ) {
            return "warning";
      }

      if (
            status === "transferred_out" ||
            status === "left" ||
            status === "Đã rời lưu xá"
      ) {
            return "muted";
      }

      return "default";
}

function getAccountStatus(member: any) {
      const hasUser = Boolean(member?.userId);

      if (!hasUser) {
            return {
                  title: "Chưa có tài khoản đăng nhập",
                  description: "Học viên chưa có tài khoản đăng nhập.",
                  badgeTone: "muted" as StatusTone,
                  badgeText: "Chưa có",
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
                  title: "Đã khóa tài khoản",
                  description:
                        "Tài khoản học viên đã được khóa do học viên đã rời/ngừng lưu trú.",
                  badgeTone: "muted" as StatusTone,
                  badgeText: "Đã khóa",
            };
      }

      return {
            title: "Đã có tài khoản",
            description: "Học viên đã có tài khoản đăng nhập.",
            badgeTone: "success" as StatusTone,
            badgeText: "Học viên",
      };
}

export function MemberDetailModal({
      member,
      onClose,
      onEdit,
      onAssignRoom,
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
      onClose: () => void;
      onEdit: () => void;
      onAssignRoom: () => void;
      onCreateUser?: (member: any) => void;
      onReactivate?: (member: any) => void;
      isCreatingUser?: boolean;
      isReactivating?: boolean;
      onDataChange?: () => void | Promise<void>;

      onSaveEducation?: (data: EducationInfoPayload) => void;
      isSavingEducation?: boolean;

      onSaveStudySchedule?: (data: StudySchedulePayload) => void;
      onDeleteStudySchedule?: (input: {
            id: number;
            residentId: number;
      }) => void;
      isSavingStudySchedule?: boolean;
      isDeletingStudySchedule?: boolean;
}) {
      if (!member) {
            return null;
      }

      const displayName = member?.holyName
            ? `${member.holyName} ${member.fullName || ""}`.trim()
            : member?.fullName || "-";

      const isLeft = isResidentLeft(member);
      const accountStatus = getAccountStatus(member);

      return (
            <AppModal
                  open={Boolean(member)}
                  onOpenChange={(open) => {
                        if (!open) {
                              onClose();
                        }
                  }}
                  title={
                        <div>
                              <p className="text-sm font-semibold text-blue-600">
                                    Hồ sơ học viên
                              </p>
                              <div className="mt-1 text-2xl font-bold text-neutral-900">
                                    {displayName}
                              </div>
                        </div>
                  }
                  size="xl"
                  className="max-h-[90vh] overflow-y-auto"
                  contentClassName="space-y-6"
            >
                  {isLeft && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                              <p className="font-semibold">
                                    Học viên đã rời lưu xá / ngừng lưu trú
                              </p>
                              <p className="mt-1">
                                    Hồ sơ này đang được giữ để tra cứu lịch sử. Các thao tác cập nhật hồ sơ,
                                    phòng ở và liên hệ gia đình đang được khóa. Muốn tiếp tục quản lý, hãy dùng
                                    chức năng Đăng ký lại.
                              </p>
                        </div>
                  )}

                  <div className="flex flex-col gap-4 rounded-2xl bg-neutral-50 p-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
                                    {member.fullName?.charAt(0)?.toUpperCase() || "H"}
                              </div>

                              <div>
                                    <p className="text-xl font-bold text-neutral-900">
                                          {displayName}
                                    </p>
                                    <p className="text-sm text-neutral-500">
                                          Mã lưu trú: {member.residentCode || "-"}
                                    </p>

                                    <div className="mt-2">
                                          <StatusBadge tone={getResidentStatusTone(member)}>
                                                {getStatusLabel(member.status)}
                                          </StatusBadge>
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
                                                {isReactivating
                                                      ? "Đang đăng ký lại..."
                                                      : "Đăng ký lại"}
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

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        <AppSection title="Thông tin cá nhân" compact>
                              <div className="space-y-3">
                                    <DetailItem
                                          icon={<IdCard className="h-4 w-4" />}
                                          label="Tên thánh"
                                          value={member.holyName || "-"}
                                    />
                                    <DetailItem
                                          icon={<IdCard className="h-4 w-4" />}
                                          label="Số CCCD"
                                          value={member.idNumber || "-"}
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
                                          value={member.phoneNumber || "-"}
                                    />
                                    <DetailItem
                                          icon={<MapPin className="h-4 w-4" />}
                                          label="Địa chỉ"
                                          value={member.permanentAddress || "-"}
                                    />
                              </div>
                        </AppSection>

                        <AppSection title="Thông tin lưu trú" compact>
                              <div className="space-y-3">
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
                                          value={member.notes || "-"}
                                    />
                              </div>
                        </AppSection>

                        <AppSection title="Tài khoản đăng nhập" compact>
                              <div className="flex flex-col gap-3">
                                    {member.userId ? (
                                          <>
                                                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                                      <div>
                                                            <p className="text-sm font-semibold text-slate-800">
                                                                  {accountStatus.title}
                                                            </p>
                                                            <p className="mt-1 text-sm text-slate-500">
                                                                  {accountStatus.description}
                                                            </p>
                                                      </div>

                                                      <StatusBadge tone={accountStatus.badgeTone}>
                                                            {accountStatus.badgeText}
                                                      </StatusBadge>
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
                                                      {isCreatingUser ? "Đang tạo..." : "Tạo tài khoản"}
                                                </button>

                                                <p className="text-xs text-slate-500">
                                                      Tài khoản sẽ có vai trò Học viên, mật khẩu tạm 123456 và yêu cầu đổi mật khẩu khi đăng nhập lần đầu.
                                                </p>
                                          </>
                                    )}
                              </div>
                        </AppSection>

                        <AppSection title="Phụ huynh / Người giám hộ" compact>
                              <ParentsSection
                                    residentId={member.id}
                                    readonly={isLeft}
                                    onDataChange={onDataChange}
                              />
                        </AppSection>

                        <EducationInfoSection
                              residentId={member.id}
                              education={member.education}
                              readonly={isLeft}
                              isSaving={isSavingEducation}
                              onSave={
                                    onSaveEducation ||
                                    (() => {
                                          console.warn("onSaveEducation is not provided");
                                    })
                              }
                        />

                        <StudyScheduleSection
                              residentId={member.id}
                              schedules={member.studySchedules || []}
                              readonly={isLeft}
                              isSaving={isSavingStudySchedule}
                              isDeleting={isDeletingStudySchedule}
                              onSave={
                                    onSaveStudySchedule ||
                                    (() => {
                                          console.warn("onSaveStudySchedule is not provided");
                                    })
                              }
                              onDelete={
                                    onDeleteStudySchedule ||
                                    (() => {
                                          console.warn("onDeleteStudySchedule is not provided");
                                    })
                              }
                        />

                        <AppSection title="Tổ chức / Tổ / Ban" compact>
                              <EmptyState
                                    compact
                                    title="Chưa có thông tin Tổ/Ban"
                                    description="Thông tin Tổ, Ban hoặc chức vụ của học viên sẽ hiển thị tại đây khi được phân bổ."
                              />
                        </AppSection>

                        <AppSection title="Công tác gần nhất" compact>
                              <EmptyState
                                    compact
                                    title="Chưa có công tác"
                                    description="Các công tác được phân công gần đây sẽ hiển thị tại đây."
                              />
                        </AppSection>

                        <AppSection title="Tài chính học viên" compact>
                              <EmptyState
                                    compact
                                    title="Chưa có thông tin tài chính"
                                    description="Các khoản phí và tình trạng thanh toán sẽ hiển thị tại đây khi có dữ liệu."
                              />
                        </AppSection>
                  </div>
            </AppModal>
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
                  <div className="mt-0.5 text-neutral-400">{icon}</div>
                  <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                              {label}
                        </p>
                        <p className="text-sm font-medium text-neutral-800">
                              {value || "-"}
                        </p>
                  </div>
            </div>
      );
}