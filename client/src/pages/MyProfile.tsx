'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      BedDouble,
      CheckCircle2,
      Eye,
      EyeOff,
      Home,
      KeyRound,
      Loader2,
      Lock,
      Mail,
      Phone,
      ShieldCheck,
      UserRound,
      UsersRound,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { formatDate } from '@/lib/format';

type MessageState = {
      type: 'success' | 'error' | 'info';
      text: string;
} | null;

type PasswordFormState = {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
};

const emptyPasswordForm: PasswordFormState = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
};


function displayValue(value?: string | number | null) {
      if (value === null || value === undefined || value === '') {
            return 'Chưa cập nhật';
      }

      return String(value);
}

function getGenderLabel(value?: string | null) {
      switch (value) {
            case 'male':
                  return 'Nam';
            case 'female':
                  return 'Nữ';
            case 'other':
                  return 'Khác';
            default:
                  return 'Chưa cập nhật';
      }
}

function getResidentStatusLabel(value?: string | null) {
      switch (value) {
            case 'active':
                  return 'Đang lưu trú';
            case 'inactive':
                  return 'Tạm ngưng';
            case 'temporary_leave':
                  return 'Tạm vắng';
            case 'transferred_out':
            case 'left':
                  return 'Đã rời lưu xá';
            default:
                  return 'Chưa cập nhật';
      }
}

function getContactTypeLabel(value?: string | null) {
      switch (value) {
            case 'father':
                  return 'Cha';
            case 'mother':
                  return 'Mẹ';
            case 'guardian':
                  return 'Người giám hộ';
            default:
                  return 'Liên hệ';
      }
}

function getMessageClass(type: 'success' | 'error' | 'info') {
      switch (type) {
            case 'success':
                  return 'border-green-100 bg-green-50 text-green-700';
            case 'error':
                  return 'border-red-100 bg-red-50 text-red-700';
            default:
                  return 'border-blue-100 bg-blue-50 text-blue-700';
      }
}

function SectionCard(props: {
      title: string;
      description?: string;
      icon: React.ReactNode;
      action?: React.ReactNode;
      children: React.ReactNode;
}) {
      return (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                                    {props.icon}
                              </div>
                              <div>
                                    <h2 className="text-base font-bold text-slate-950">
                                          {props.title}
                                    </h2>
                                    {props.description && (
                                          <p className="mt-1 text-sm leading-6 text-slate-500">
                                                {props.description}
                                          </p>
                                    )}
                              </div>
                        </div>
                        {props.action}
                  </div>
                  {props.children}
            </section>
      );
}

function InfoItem(props: {
      label: string;
      value?: string | number | null;
      icon?: React.ReactNode;
}) {
      return (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {props.icon}
                        <span>{props.label}</span>
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-slate-800">
                        {displayValue(props.value)}
                  </div>
            </div>
      );
}

function EmptyState(props: { text: string }) {
      return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  {props.text}
            </div>
      );
}

export default function MyProfile() {
      const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
      const [passwordForm, setPasswordForm] =
            useState<PasswordFormState>(emptyPasswordForm);
      const [showPassword, setShowPassword] = useState(false);
      const [message, setMessage] = useState<MessageState>(null);

      const profileQuery = trpc.residentPortal.me.useQuery(undefined, {
            retry: false,
      });

      const changePasswordMutation =
            trpc.residentPortal.changePassword.useMutation();

      const profile = profileQuery.data;
      const member = profile?.member;
      const user = profile?.user;
      const room = profile?.room;
      const roommates = profile?.roommates ?? [];
      const contacts = profile?.contacts ?? [];

      const displayName = useMemo(() => {
            return member?.displayName || member?.fullName || 'Học viên';
      }, [member]);

      const primaryContact = contacts[0];

      const resetPasswordModal = () => {
            setPasswordForm(emptyPasswordForm);
            setShowPassword(false);
            setIsPasswordModalOpen(false);
      };

      const handleChangePassword = async () => {
            setMessage(null);

            if (!passwordForm.currentPassword.trim()) {
                  setMessage({
                        type: 'error',
                        text: 'Vui lòng nhập mật khẩu hiện tại.',
                  });
                  return;
            }

            if (passwordForm.newPassword.trim().length < 6) {
                  setMessage({
                        type: 'error',
                        text: 'Mật khẩu mới phải có ít nhất 6 ký tự.',
                  });
                  return;
            }

            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                  setMessage({
                        type: 'error',
                        text: 'Xác nhận mật khẩu mới chưa khớp.',
                  });
                  return;
            }

            try {
                  await changePasswordMutation.mutateAsync({
                        currentPassword: passwordForm.currentPassword,
                        newPassword: passwordForm.newPassword,
                        confirmPassword: passwordForm.confirmPassword,
                  });

                  setMessage({
                        type: 'success',
                        text: 'Đã đổi mật khẩu thành công.',
                  });
                  resetPasswordModal();
                  await profileQuery.refetch();
            } catch (error: any) {
                  setMessage({
                        type: 'error',
                        text:
                              error?.message ||
                              'Không thể đổi mật khẩu. Vui lòng kiểm tra lại thông tin.',
                  });
            }
      };

      if (profileQuery.isLoading) {
            return (
                  <ResidenceCareLayout>
                        <div className="flex min-h-[60vh] items-center justify-center p-6">
                              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Đang tải hồ sơ...
                              </div>
                        </div>
                  </ResidenceCareLayout>
            );
      }

      if (profileQuery.error) {
            return (
                  <ResidenceCareLayout>
                        <div className="mx-auto max-w-3xl p-6">
                              <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-red-700">
                                    <div className="flex items-start gap-3">
                                          <AlertCircle className="mt-0.5 h-5 w-5" />
                                          <div>
                                                <h1 className="text-lg font-bold">
                                                      Không thể tải hồ sơ
                                                </h1>
                                                <p className="mt-2 text-sm leading-6">
                                                      {profileQuery.error.message ||
                                                            'Vui lòng đăng nhập lại hoặc liên hệ người quản lý.'}
                                                </p>
                                          </div>
                                    </div>
                              </div>
                        </div>
                  </ResidenceCareLayout>
            );
      }

      return (
            <ResidenceCareLayout>
                  <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-4">
                                          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-xl font-bold text-white">
                                                {displayName.charAt(0).toUpperCase()}
                                          </div>
                                          <div>
                                                <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
                                                      Hồ sơ của tôi
                                                </h1>
                                                <p className="mt-1 text-sm text-slate-500">
                                                      {displayName} · {displayValue(member?.residentCode)}
                                                </p>
                                          </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                          <span className="rounded-full border border-green-100 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                                {getResidentStatusLabel(member?.status)}
                                          </span>
                                          {user?.mustChangePassword ? (
                                                <span className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                                                      Cần đổi mật khẩu
                                                </span>
                                          ) : (
                                                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                                                      Tài khoản ổn định
                                                </span>
                                          )}
                                    </div>
                              </div>

                              {message && (
                                    <div
                                          className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${getMessageClass(
                                                message.type
                                          )}`}
                                    >
                                          {message.text}
                                    </div>
                              )}
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                              <div className="space-y-6">
                                    <SectionCard
                                          title="Thông tin cá nhân"
                                          description="Các thông tin cơ bản được lưu trong hồ sơ học viên."
                                          icon={<UserRound className="h-5 w-5" />}
                                    >
                                          <div className="grid gap-3 sm:grid-cols-2">
                                                <InfoItem label="Tên thánh" value={member?.holyName} />
                                                <InfoItem label="Họ tên" value={member?.fullName} />
                                                <InfoItem
                                                      label="Mã học viên"
                                                      value={member?.residentCode}
                                                />
                                                <InfoItem
                                                      label="Ngày sinh"
                                                      value={formatDate(member?.dateOfBirth)}
                                                />
                                                <InfoItem
                                                      label="Giới tính"
                                                      value={getGenderLabel(member?.gender)}
                                                />
                                                <InfoItem
                                                      label="Số điện thoại"
                                                      value={member?.phoneNumber}
                                                      icon={<Phone className="h-3.5 w-3.5" />}
                                                />
                                                <InfoItem
                                                      label="Ngày vào lưu xá"
                                                      value={formatDate(member?.admissionDate)}
                                                />
                                                <InfoItem
                                                      label="Trạng thái"
                                                      value={getResidentStatusLabel(member?.status)}
                                                />
                                                <div className="sm:col-span-2">
                                                      <InfoItem
                                                            label="Địa chỉ thường trú"
                                                            value={member?.permanentAddress}
                                                            icon={<Home className="h-3.5 w-3.5" />}
                                                      />
                                                </div>
                                          </div>
                                    </SectionCard>

                                    <SectionCard
                                          title="Phòng của tôi"
                                          description="Thông tin phòng hiện tại và các bạn đang ở cùng phòng."
                                          icon={<BedDouble className="h-5 w-5" />}
                                    >
                                          {!room ? (
                                                <EmptyState text="Bạn chưa được gán phòng hiện tại." />
                                          ) : (
                                                <div className="space-y-4">
                                                      <div className="grid gap-3 sm:grid-cols-4">
                                                            <InfoItem
                                                                  label="Mã phòng"
                                                                  value={room.roomCode}
                                                            />
                                                            <InfoItem
                                                                  label="Tên phòng"
                                                                  value={room.roomName}
                                                            />
                                                            <InfoItem
                                                                  label="Sức chứa"
                                                                  value={room.capacity}
                                                            />
                                                            <InfoItem
                                                                  label="Còn trống"
                                                                  value={room.availableSlots}
                                                            />
                                                      </div>

                                                      <div>
                                                            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                                                                  <UsersRound className="h-4 w-4 text-slate-500" />
                                                                  Bạn cùng phòng
                                                            </div>

                                                            {roommates.length === 0 ? (
                                                                  <EmptyState text="Hiện chưa có bạn cùng phòng." />
                                                            ) : (
                                                                  <div className="grid gap-3 sm:grid-cols-2">
                                                                        {roommates.map((roommate: any) => (
                                                                              <div
                                                                                    key={roommate.id}
                                                                                    className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                                                                              >
                                                                                    <div className="font-semibold text-slate-900">
                                                                                          {roommate.displayName ||
                                                                                                roommate.fullName}
                                                                                    </div>
                                                                                    <div className="mt-1 text-sm text-slate-500">
                                                                                          {displayValue(
                                                                                                roommate.phoneNumber
                                                                                          )}
                                                                                    </div>
                                                                              </div>
                                                                        ))}
                                                                  </div>
                                                            )}
                                                      </div>
                                                </div>
                                          )}
                                    </SectionCard>
                              </div>

                              <div className="space-y-6">
                                    <SectionCard
                                          title="Tài khoản đăng nhập"
                                          description="Quản lý thông tin đăng nhập và mật khẩu cá nhân."
                                          icon={<ShieldCheck className="h-5 w-5" />}
                                          action={
                                                <button
                                                      type="button"
                                                      onClick={() => {
                                                            setMessage(null);
                                                            setIsPasswordModalOpen(true);
                                                      }}
                                                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                                                >
                                                      <KeyRound className="h-4 w-4" />
                                                      Đổi mật khẩu
                                                </button>
                                          }
                                    >
                                          <div className="space-y-3">
                                                <InfoItem
                                                      label="Tên đăng nhập"
                                                      value={user?.username}
                                                />
                                                <InfoItem
                                                      label="Vai trò"
                                                      value="Học viên"
                                                      icon={<Lock className="h-3.5 w-3.5" />}
                                                />
                                                <InfoItem
                                                      label="Trạng thái tài khoản"
                                                      value={
                                                            user?.isActive
                                                                  ? 'Đang hoạt động'
                                                                  : 'Đã khóa'
                                                      }
                                                />
                                                <InfoItem
                                                      label="Yêu cầu đổi mật khẩu"
                                                      value={
                                                            user?.mustChangePassword
                                                                  ? 'Cần đổi mật khẩu'
                                                                  : 'Không'
                                                      }
                                                />
                                          </div>
                                    </SectionCard>

                                    <SectionCard
                                          title="Liên hệ gia đình"
                                          description="Thông tin liên hệ gia đình hoặc người giám hộ."
                                          icon={<Phone className="h-5 w-5" />}
                                    >
                                          {contacts.length === 0 ? (
                                                <EmptyState text="Chưa có thông tin liên hệ gia đình." />
                                          ) : (
                                                <div className="space-y-3">
                                                      {contacts.map((contact: any) => (
                                                            <div
                                                                  key={contact.id}
                                                                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                                                            >
                                                                  <div className="flex items-start justify-between gap-3">
                                                                        <div>
                                                                              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                                                    {getContactTypeLabel(
                                                                                          contact.parentType
                                                                                    )}
                                                                              </div>
                                                                              <div className="mt-1 font-bold text-slate-900">
                                                                                    {displayValue(
                                                                                          contact.fullName
                                                                                    )}
                                                                              </div>
                                                                        </div>
                                                                        {primaryContact?.id === contact.id && (
                                                                              <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                                                                    Liên hệ chính
                                                                              </span>
                                                                        )}
                                                                  </div>
                                                                  <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                                                                        <div className="flex items-center gap-2">
                                                                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                                              {displayValue(
                                                                                    contact.phoneNumber
                                                                              )}
                                                                        </div>
                                                                        {contact.email && (
                                                                              <div className="flex items-center gap-2">
                                                                                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                                                                                    {contact.email}
                                                                              </div>
                                                                        )}
                                                                        {contact.address && (
                                                                              <div className="flex items-center gap-2">
                                                                                    <Home className="h-3.5 w-3.5 text-slate-400" />
                                                                                    {contact.address}
                                                                              </div>
                                                                        )}
                                                                  </div>
                                                            </div>
                                                      ))}
                                                </div>
                                          )}
                                    </SectionCard>
                              </div>
                        </div>

                        {isPasswordModalOpen && (
                              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
                                    <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-xl">
                                          <div className="mb-5">
                                                <h2 className="text-lg font-bold text-slate-950">
                                                      Đổi mật khẩu
                                                </h2>
                                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                                      Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật tài khoản.
                                                </p>
                                          </div>

                                          <div className="space-y-4">
                                                <label className="space-y-1.5">
                                                      <span className="text-sm font-semibold text-slate-700">
                                                            Mật khẩu hiện tại
                                                      </span>
                                                      <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            value={passwordForm.currentPassword}
                                                            onChange={(event) =>
                                                                  setPasswordForm((current) => ({
                                                                        ...current,
                                                                        currentPassword:
                                                                              event.target.value,
                                                                  }))
                                                            }
                                                            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                                                      />
                                                </label>

                                                <label className="space-y-1.5">
                                                      <span className="text-sm font-semibold text-slate-700">
                                                            Mật khẩu mới
                                                      </span>
                                                      <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            value={passwordForm.newPassword}
                                                            onChange={(event) =>
                                                                  setPasswordForm((current) => ({
                                                                        ...current,
                                                                        newPassword: event.target.value,
                                                                  }))
                                                            }
                                                            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                                                      />
                                                </label>

                                                <label className="space-y-1.5">
                                                      <span className="text-sm font-semibold text-slate-700">
                                                            Xác nhận mật khẩu mới
                                                      </span>
                                                      <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            value={passwordForm.confirmPassword}
                                                            onChange={(event) =>
                                                                  setPasswordForm((current) => ({
                                                                        ...current,
                                                                        confirmPassword:
                                                                              event.target.value,
                                                                  }))
                                                            }
                                                            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                                                      />
                                                </label>

                                                <button
                                                      type="button"
                                                      onClick={() => setShowPassword((value) => !value)}
                                                      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
                                                >
                                                      {showPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                      ) : (
                                                            <Eye className="h-4 w-4" />
                                                      )}
                                                      {showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                                </button>
                                          </div>

                                          <div className="mt-6 flex justify-end gap-2">
                                                <button
                                                      type="button"
                                                      onClick={resetPasswordModal}
                                                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                                >
                                                      Hủy
                                                </button>
                                                <button
                                                      type="button"
                                                      onClick={handleChangePassword}
                                                      disabled={changePasswordMutation.isPending}
                                                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                      {changePasswordMutation.isPending && (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                      )}
                                                      Cập nhật
                                                </button>
                                          </div>
                                    </div>
                              </div>
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}
