import type { ReactNode } from 'react';
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
import {
      formatDate,
      getGenderLabel,
      getRoomActionLabel,
      getRoomLabelFromMember,
      getStatusClass,
      getStatusLabel,
} from './memberUtils';

export function MemberDetailModal({
      member,
      onClose,
      onEdit,
      onAssignRoom,
      onCreateUser,
      isCreatingUser = false,
      onDataChange,
}: {
      member: any;
      onClose: () => void;
      onEdit: () => void;
      onAssignRoom: () => void;
      onCreateUser?: (member: any) => void;
      isCreatingUser?: boolean;
      onDataChange?: () => void | Promise<void>;
}) {
      const displayName = member?.holyName
            ? `${member.holyName} ${member.fullName || ''}`.trim()
            : member?.fullName || '-';

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
                              <div>
                                    <p className="text-sm font-semibold text-blue-600">
                                          Hồ sơ học viên
                                    </p>
                                    <h2 className="text-2xl font-bold text-neutral-900">
                                          {displayName}
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
                                                      {displayName}
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

                                    <DetailCard title="Tài khoản đăng nhập">
                                          <div className="flex flex-col gap-3">
                                                {member.userId ? (
                                                      <>
                                                            <div className="flex flex-col gap-3 rounded-xl bg-emerald-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                                                  <div>
                                                                        <p className="text-sm font-semibold text-emerald-800">
                                                                              Đã có tài khoản
                                                                        </p>
                                                                        <p className="mt-1 text-sm text-emerald-700">
                                                                              Học viên đã có tài khoản đăng nhập.
                                                                        </p>
                                                                  </div>

                                                                  <span className="inline-flex w-fit rounded-full bg-white px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
                                                                        Học viên
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

                                    <DetailCard title="Phụ huynh / Người giám hộ">
                                          <ParentsSection
                                                residentId={member.id}
                                                onDataChange={onDataChange}
                                          />
                                    </DetailCard>

                                    <DetailCard title="Học vụ">
                                          <PlaceholderData
                                                title="Chưa có thông tin học vụ"
                                                description="Thông tin trường, lớp hoặc ngành học sẽ được bổ sung khi hồ sơ học viên được cập nhật."
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
