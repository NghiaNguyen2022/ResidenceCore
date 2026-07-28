'use client';

import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useSystemDisplayMode } from "@/hooks/useSystemDisplayMode";
import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";

type RoleKey =
      | "manager"
      | "resident"
      | "team_leader"
      | "committee_head"
      | "house_leader"
      | "deputy"
      | "secretary"
      | "treasurer"
      | "admin"
      | "supervisor"
      | "accountant"
      | "user";

const ROLE_LABELS: Record<string, string> = {
      manager: "Quản lý lưu xá",
      resident: "Học viên",
      team_leader: "Tổ trưởng",
      committee_head: "Trưởng ban",
      house_leader: "Trưởng nhà",
      deputy: "Phó",
      secretary: "Thư ký",
      treasurer: "Thủ quỹ",

      // Chỉ để hiển thị nếu còn dữ liệu cũ
      admin: "Quản trị cũ",
      supervisor: "Người phụ trách cũ",
      accountant: "Kế toán cũ",
      user: "Người dùng",
};

const APPOINTMENT_ROLES = new Set([
      "team_leader",
      "committee_head",
      "house_leader",
      "deputy",
      "secretary",
      "treasurer",
]);

function getRoleLabel(roleKey?: string | null) {
      if (!roleKey) return "Chưa phân quyền";
      return ROLE_LABELS[roleKey] ?? roleKey;
}

function isManagerRole(roleKey?: string | null) {
      return roleKey === "manager";
}

function isResidentRole(roleKey?: string | null) {
      return roleKey === "resident";
}

function isAppointmentRole(roleKey?: string | null) {
      return Boolean(roleKey && APPOINTMENT_ROLES.has(roleKey));
}

function getAccountTypeLabel(roleKey?: string | null) {
      if (isManagerRole(roleKey)) return "Quản lý";
      if (isResidentRole(roleKey)) return "Học viên";
      if (isAppointmentRole(roleKey)) return "Vai trò bổ nhiệm";
      if (!roleKey) return "Chưa phân loại";
      return "Dữ liệu cũ / khác";
}

function getAccountTypeClass(roleKey?: string | null) {
      if (isManagerRole(roleKey)) {
            return "bg-blue-50 text-blue-700 ring-blue-100";
      }

      if (isResidentRole(roleKey)) {
            return "bg-emerald-50 text-emerald-700 ring-emerald-100";
      }

      if (isAppointmentRole(roleKey)) {
            return "bg-violet-50 text-violet-700 ring-violet-100";
      }

      return "bg-slate-50 text-slate-600 ring-slate-200";
}

function getRoleManagementNote(roleKey?: string | null) {
      if (isManagerRole(roleKey)) {
            return "Tài khoản quản lý được tạo và quản lý tại màn hình này.";
      }

      if (isResidentRole(roleKey)) {
            return "Tài khoản học viên được tạo, khóa hoặc mở lại từ hồ sơ học viên.";
      }

      if (isAppointmentRole(roleKey)) {
            return "Vai trò bổ nhiệm được điều phối từ nhiệm kỳ, tổ/ban và quy trình bổ nhiệm.";
      }

      return "Tài khoản thuộc dữ liệu cũ hoặc vai trò khác, không sửa vai trò tại màn hình này.";
}

function StatusBadge({ active }: { active?: boolean | null }) {
      return (
            <span
                  className={[
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                        active
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
                  ].join(" ")}
            >
                  {active ? "Đang hoạt động" : "Đã khóa"}
            </span>
      );
}

function PasswordBadge({ mustChange }: { mustChange?: boolean | null }) {
      return (
            <span
                  className={[
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                        mustChange
                              ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                              : "bg-slate-50 text-slate-600 ring-1 ring-slate-200",
                  ].join(" ")}
            >
                  {mustChange ? "Cần đổi mật khẩu" : "Không yêu cầu đổi"}
            </span>
      );
}

function AccountTypeBadge({ role }: { role?: string | null }) {
      return (
            <span
                  className={[
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                        getAccountTypeClass(role),
                  ].join(" ")}
            >
                  {getAccountTypeLabel(role)}
            </span>
      );
}

function formatDateTime(value?: string | Date | null) {
      if (!value) return "Chưa có";

      const date = value instanceof Date ? value : new Date(value);

      if (Number.isNaN(date.getTime())) return "Chưa có";

      return new Intl.DateTimeFormat("vi-VN", {
            dateStyle: "short",
            timeStyle: "short",
      }).format(date);
}

export default function UserManagement() {
      const { isSimple, isDetailed } = useSystemDisplayMode();
      const utils = trpc.useUtils();

      const [search, setSearch] = useState("");
      const [showCreateForm, setShowCreateForm] = useState(false);
      const [formMessage, setFormMessage] = useState<string | null>(null);
      const [resetTargetUser, setResetTargetUser] = useState<any | null>(null);
      const [resetMessage, setResetMessage] = useState<string | null>(null);
      const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

      const usersQuery = trpc.users.list.useQuery({
            search: search.trim() || undefined,
            limit: 100,
            offset: 0,
      });

      const createUserMutation = trpc.users.create.useMutation({
            onSuccess: async () => {
                  await utils.users.list.invalidate();
                  setShowCreateForm(false);
                  resetForm();
            },
      });

      const deactivateMutation = trpc.users.deactivate.useMutation({
            onSuccess: async () => {
                  await utils.users.list.invalidate();
            },
      });

      const activateMutation = trpc.users.activate.useMutation({
            onSuccess: async () => {
                  await utils.users.list.invalidate();
            },
      });

      const resetPasswordMutation = trpc.users.resetPassword.useMutation({
            onSuccess: async () => {
                  await utils.users.list.invalidate();
            },
      });

      const [form, setForm] = useState({
            name: "",
            username: "",
            email: "",
            password: "123456",
            mustChangePassword: true,
            isActive: true,
      });

      function resetForm() {
            setForm({
                  name: "",
                  username: "",
                  email: "",
                  password: "123456",
                  mustChangePassword: true,
                  isActive: true,
            });
            setFormMessage(null);
      }

      const users = usersQuery.data ?? [];

      const stats = useMemo(() => {
            const total = users.length;
            const managers = users.filter((user) => user.role === "manager").length;
            const residents = users.filter((user) => user.role === "resident").length;
            const appointmentRoles = users.filter((user) =>
                  isAppointmentRole(user.role)
            ).length;
            const locked = users.filter((user) => !user.isActive).length;
            const mustChangePassword = users.filter(
                  (user) => user.mustChangePassword
            ).length;

            return {
                  total,
                  managers,
                  residents,
                  appointmentRoles,
                  locked,
                  mustChangePassword,
                  needsAttention: locked + mustChangePassword,
            };
      }, [users]);

      async function handleCreateUser() {
            setFormMessage(null);

            if (!form.name.trim()) {
                  setFormMessage("Vui lòng nhập họ tên người quản lý.");
                  return;
            }

            if (!form.username.trim()) {
                  setFormMessage("Vui lòng nhập tên đăng nhập.");
                  return;
            }

            if (!form.password.trim()) {
                  setFormMessage("Vui lòng nhập mật khẩu tạm.");
                  return;
            }

            if (form.password.trim().length < 6) {
                  setFormMessage("Mật khẩu tạm phải có ít nhất 6 ký tự.");
                  return;
            }

            await createUserMutation.mutateAsync({
                  name: form.name.trim(),
                  username: form.username.trim(),
                  email: form.email.trim() || null,
                  password: form.password,
                  mustChangePassword: form.mustChangePassword,
                  isActive: form.isActive,
            });
      }

      function canToggleAccount(user: any) {
            return user.role === "manager";
      }

      function openResetPassword(user: any) {
            setResetTargetUser(user);
            setResetMessage(null);
            setResetSuccessMessage(null);
      }

      function closeResetPassword() {
            if (resetPasswordMutation.isPending) return;
            setResetTargetUser(null);
            setResetMessage(null);
      }

      async function handleResetPassword() {
            setResetMessage(null);

            if (!resetTargetUser?.id) {
                  setResetMessage("Không xác định được tài khoản cần reset mật khẩu.");
                  return;
            }

            try {
                  const accountName =
                        resetTargetUser.name || resetTargetUser.username;

                  await resetPasswordMutation.mutateAsync({
                        userId: resetTargetUser.id,
                  });

                  setResetTargetUser(null);
                  setResetMessage(null);
                  setResetSuccessMessage(
                        `Đã đặt lại mật khẩu cho ${accountName}. Mật khẩu tạm thời: 123456. Người dùng phải đổi mật khẩu khi đăng nhập.`
                  );
            } catch (error: any) {
                  setResetMessage(
                        error?.message || "Không thể reset mật khẩu. Vui lòng thử lại."
                  );
            }
      }

      return (
            <ResidenceCareLayout>
                  <div className="space-y-5">
                        <div className="flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
                              <div>
                                    <h1 className="text-xl font-semibold text-slate-900">
                                          Người dùng & quyền truy cập
                                    </h1>
                                    <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                                          Quản lý tài khoản đăng nhập trong lưu xá. Màn hình này chỉ tạo trực tiếp tài khoản quản lý; tài khoản học viên và các vai trò bổ nhiệm được điều phối từ các quy trình nghiệp vụ tương ứng.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={() => {
                                          setShowCreateForm((value) => !value);
                                          setFormMessage(null);
                                    }}
                                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                              >
                                    {showCreateForm ? "Đóng" : "Tạo quản lý"}
                              </button>
                        </div>

                        <div className="grid gap-3 md:grid-cols-4">
                              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                                    <div className="text-sm text-slate-500">Tổng tài khoản</div>
                                    <div className="mt-2 text-2xl font-semibold text-slate-900">
                                          {stats.total}
                                    </div>
                              </div>

                              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                                    <div className="text-sm text-slate-500">Quản lý</div>
                                    <div className="mt-2 text-2xl font-semibold text-blue-700">
                                          {stats.managers}
                                    </div>
                              </div>

                              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                                    <div className="text-sm text-slate-500">Học viên</div>
                                    <div className="mt-2 text-2xl font-semibold text-emerald-700">
                                          {stats.residents}
                                    </div>
                              </div>

                              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                                    <div className="text-sm text-slate-500">Cần xử lý</div>
                                    <div className="mt-2 text-2xl font-semibold text-amber-700">
                                          {stats.needsAttention}
                                    </div>
                                    <div className="mt-1 text-xs text-slate-500">
                                          {stats.mustChangePassword} cần đổi mật khẩu · {stats.locked} đã khóa
                                    </div>
                              </div>
                        </div>

                        {isDetailed && (
                              <div className="grid gap-3 md:grid-cols-2">
                                    <div className="rounded-2xl border bg-white p-4 shadow-sm">
                                          <div className="text-sm text-slate-500">
                                                Vai trò bổ nhiệm đang hiển thị
                                          </div>
                                          <div className="mt-2 text-2xl font-semibold text-violet-700">
                                                {stats.appointmentRoles}
                                          </div>
                                          <p className="mt-1 text-xs leading-5 text-slate-500">
                                                Chỉ hiển thị để theo dõi. Việc bổ nhiệm, hết nhiệm kỳ hoặc bãi nhiệm được xử lý tại module Tổ chức lưu xá.
                                          </p>
                                    </div>

                                    <div className="rounded-2xl border bg-white p-4 shadow-sm">
                                          <div className="text-sm text-slate-500">
                                                Quy tắc tạo tài khoản
                                          </div>
                                          <p className="mt-2 text-sm leading-6 text-slate-600">
                                                Màn hình này chỉ tạo tài khoản quản lý. Tài khoản học viên được tạo khi thêm học viên; vai trò bổ nhiệm được cấp hoặc ngừng theo quy trình bổ nhiệm.
                                          </p>
                                    </div>
                              </div>
                        )}

                        {showCreateForm && (
                              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                                    <div className="mb-4">
                                          <h2 className="text-base font-semibold text-slate-900">
                                                Tạo quản lý lưu xá
                                          </h2>
                                          <p className="mt-1 text-sm leading-6 text-slate-500">
                                                Tài khoản tạo tại đây chỉ dùng cho người quản lý. Học viên và các chức danh như Tổ trưởng, Trưởng ban, Thủ quỹ không được tạo trực tiếp ở màn hình này.
                                          </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                          <label className="space-y-1.5">
                                                <span className="text-sm font-medium text-slate-700">
                                                      Họ tên
                                                </span>
                                                <input
                                                      value={form.name}
                                                      onChange={(event) =>
                                                            setForm((current) => ({
                                                                  ...current,
                                                                  name: event.target.value,
                                                            }))
                                                      }
                                                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900"
                                                      placeholder="Nhập họ tên"
                                                />
                                          </label>

                                          <label className="space-y-1.5">
                                                <span className="text-sm font-medium text-slate-700">
                                                      Tên đăng nhập
                                                </span>
                                                <input
                                                      value={form.username}
                                                      onChange={(event) =>
                                                            setForm((current) => ({
                                                                  ...current,
                                                                  username: event.target.value,
                                                            }))
                                                      }
                                                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900"
                                                      placeholder="Ví dụ: quanly01"
                                                />
                                          </label>

                                          {isDetailed && (
                                                <label className="space-y-1.5">
                                                      <span className="text-sm font-medium text-slate-700">
                                                            Email
                                                      </span>
                                                      <input
                                                            value={form.email}
                                                            onChange={(event) =>
                                                                  setForm((current) => ({
                                                                        ...current,
                                                                        email: event.target.value,
                                                                  }))
                                                            }
                                                            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900"
                                                            placeholder="email@example.com"
                                                      />
                                                </label>
                                          )}

                                          <label className="space-y-1.5">
                                                <span className="text-sm font-medium text-slate-700">
                                                      Mật khẩu tạm
                                                </span>
                                                <input
                                                      value={form.password}
                                                      onChange={(event) =>
                                                            setForm((current) => ({
                                                                  ...current,
                                                                  password: event.target.value,
                                                            }))
                                                      }
                                                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900"
                                                      placeholder="Nhập mật khẩu tạm"
                                                      type="text"
                                                />
                                          </label>
                                    </div>

                                    <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                          Vai trò được tạo:{" "}
                                          <span className="font-medium text-slate-900">
                                                Quản lý lưu xá
                                          </span>
                                    </div>

                                    {isDetailed && (
                                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                                                      <input
                                                            type="checkbox"
                                                            checked={form.mustChangePassword}
                                                            onChange={(event) =>
                                                                  setForm((current) => ({
                                                                        ...current,
                                                                        mustChangePassword: event.target.checked,
                                                                  }))
                                                            }
                                                      />
                                                      <span>Yêu cầu đổi mật khẩu khi đăng nhập lần đầu</span>
                                                </label>

                                                <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                                                      <input
                                                            type="checkbox"
                                                            checked={form.isActive}
                                                            onChange={(event) =>
                                                                  setForm((current) => ({
                                                                        ...current,
                                                                        isActive: event.target.checked,
                                                                  }))
                                                            }
                                                      />
                                                      <span>Tài khoản đang hoạt động</span>
                                                </label>
                                          </div>
                                    )}

                                    {formMessage && (
                                          <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                                {formMessage}
                                          </div>
                                    )}

                                    {createUserMutation.error && (
                                          <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                                {createUserMutation.error.message}
                                          </div>
                                    )}

                                    <div className="mt-5 flex justify-end gap-2">
                                          <button
                                                type="button"
                                                onClick={() => {
                                                      resetForm();
                                                      setShowCreateForm(false);
                                                }}
                                                className="rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                          >
                                                Hủy
                                          </button>

                                          <button
                                                type="button"
                                                onClick={handleCreateUser}
                                                disabled={createUserMutation.isPending}
                                                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                                          >
                                                {createUserMutation.isPending
                                                      ? "Đang lưu..."
                                                      : "Lưu quản lý"}
                                          </button>
                                    </div>
                              </div>
                        )}

                        <div className="rounded-2xl border bg-white p-4 shadow-sm">
                              {resetSuccessMessage && (
                                    <div
                                          role="status"
                                          className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                                    >
                                          <span>{resetSuccessMessage}</span>
                                          <button
                                                type="button"
                                                onClick={() => setResetSuccessMessage(null)}
                                                className="shrink-0 font-semibold text-emerald-700 hover:text-emerald-900"
                                                aria-label="Đóng thông báo"
                                          >
                                                ×
                                          </button>
                                    </div>
                              )}

                              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0">
                                          <h2 className="text-lg font-semibold text-slate-900">
                                                Danh sách người dùng
                                          </h2>
                                          <p className="mt-1 text-sm leading-6 text-slate-500">
                                                Hiển thị tài khoản quản lý, học viên và các vai trò bổ nhiệm. Role nghiệp vụ chỉ xem tại đây, không chỉnh trực tiếp.
                                          </p>
                                    </div>

                                    <input
                                          value={search}
                                          onChange={(event) => setSearch(event.target.value)}
                                          className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900 lg:w-96"
                                          placeholder="Tìm theo tên, tài khoản, email"
                                    />
                              </div>

                              {usersQuery.isLoading ? (
                                    <div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">
                                          Đang tải danh sách người dùng...
                                    </div>
                              ) : users.length === 0 ? (
                                    <div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">
                                          Chưa có người dùng phù hợp.
                                    </div>
                              ) : isSimple ? (
                                    <div className="grid gap-3">
                                          {users.map((user) => (
                                                <div
                                                      key={user.id}
                                                      className="rounded-2xl border bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                                                >
                                                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                            <div className="min-w-0">
                                                                  <div className="flex flex-wrap items-center gap-2">
                                                                        <div className="text-base font-semibold text-slate-900">
                                                                              {user.name || user.username}
                                                                        </div>
                                                                        <AccountTypeBadge role={user.role} />
                                                                        <StatusBadge active={user.isActive} />
                                                                  </div>

                                                                  <div className="mt-2 grid gap-1 text-sm text-slate-500 md:grid-cols-2 lg:grid-cols-4">
                                                                        <div>
                                                                              <span className="text-slate-400">Tài khoản: </span>
                                                                              <span className="text-slate-700">
                                                                                    {user.username}
                                                                              </span>
                                                                        </div>

                                                                        <div>
                                                                              <span className="text-slate-400">Vai trò: </span>
                                                                              <span className="text-slate-700">
                                                                                    {getRoleLabel(user.role)}
                                                                              </span>
                                                                        </div>

                                                                        <div>
                                                                              <span className="text-slate-400">Hồ sơ: </span>
                                                                              <span className="text-slate-700">
                                                                                    {user.residentFullName || "Không liên kết"}
                                                                              </span>
                                                                        </div>

                                                                        <div>
                                                                              <span className="text-slate-400">
                                                                                    Đổi mật khẩu:{" "}
                                                                              </span>
                                                                              <span className="text-slate-700">
                                                                                    {user.mustChangePassword
                                                                                          ? "Cần đổi"
                                                                                          : "Không yêu cầu"}
                                                                              </span>
                                                                        </div>
                                                                  </div>

                                                                  <p className="mt-2 text-xs leading-5 text-slate-400">
                                                                        {getRoleManagementNote(user.role)}
                                                                  </p>
                                                            </div>

                                                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                                                                  <button
                                                                        type="button"
                                                                        onClick={() => openResetPassword(user)}
                                                                        className="rounded-xl border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                                                                  >
                                                                        Reset mật khẩu
                                                                  </button>

                                                                  {canToggleAccount(user) ? (
                                                                        user.isActive ? (
                                                                              <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                          deactivateMutation.mutate({ userId: user.id })
                                                                                    }
                                                                                    className="rounded-xl border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                                                                              >
                                                                                    Khóa
                                                                              </button>
                                                                        ) : (
                                                                              <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                          activateMutation.mutate({ userId: user.id })
                                                                                    }
                                                                                    className="rounded-xl border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                                                                              >
                                                                                    Mở khóa
                                                                              </button>
                                                                        )
                                                                  ) : (
                                                                        <span className="rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-slate-100">
                                                                              Điều phối từ nghiệp vụ
                                                                        </span>
                                                                  )}
                                                            </div>
                                                      </div>
                                                </div>
                                          ))}
                                    </div>
                              ) : (
                                    <div className="overflow-x-auto">
                                          <table className="w-full min-w-[1100px] border-separate border-spacing-y-2">
                                                <thead>
                                                      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            <th className="px-3 py-2">Người dùng</th>
                                                            <th className="px-3 py-2">Email</th>
                                                            <th className="px-3 py-2">Loại</th>
                                                            <th className="px-3 py-2">Vai trò</th>
                                                            <th className="px-3 py-2">Hồ sơ liên kết</th>
                                                            <th className="px-3 py-2">Đăng nhập gần nhất</th>
                                                            <th className="px-3 py-2">Đổi mật khẩu</th>
                                                            <th className="px-3 py-2">Trạng thái</th>
                                                            <th className="px-3 py-2 text-right">Thao tác</th>
                                                      </tr>
                                                </thead>

                                                <tbody>
                                                      {users.map((user) => (
                                                            <tr
                                                                  key={user.id}
                                                                  className="rounded-xl bg-white shadow-sm ring-1 ring-slate-100"
                                                            >
                                                                  <td className="px-3 py-3">
                                                                        <div className="font-medium text-slate-900">
                                                                              {user.name || user.username}
                                                                        </div>
                                                                        <div className="text-sm text-slate-500">
                                                                              {user.username}
                                                                        </div>
                                                                  </td>

                                                                  <td className="px-3 py-3 text-sm text-slate-600">
                                                                        {user.email || "Chưa có"}
                                                                  </td>

                                                                  <td className="px-3 py-3">
                                                                        <AccountTypeBadge role={user.role} />
                                                                  </td>

                                                                  <td className="px-3 py-3 text-sm text-slate-600">
                                                                        <div>{getRoleLabel(user.role)}</div>
                                                                        <div className="mt-1 text-xs text-slate-400">
                                                                              {getRoleManagementNote(user.role)}
                                                                        </div>
                                                                  </td>

                                                                  <td className="px-3 py-3 text-sm text-slate-600">
                                                                        {user.residentFullName || "Không liên kết"}
                                                                  </td>

                                                                  <td className="px-3 py-3 text-sm text-slate-600">
                                                                        {formatDateTime(user.lastSignedIn)}
                                                                  </td>

                                                                  <td className="px-3 py-3">
                                                                        <PasswordBadge mustChange={user.mustChangePassword} />
                                                                  </td>

                                                                  <td className="px-3 py-3">
                                                                        <StatusBadge active={user.isActive} />
                                                                  </td>

                                                                  <td className="px-3 py-3 text-right">
                                                                        <div className="flex flex-wrap justify-end gap-2">
                                                                              <button
                                                                                    type="button"
                                                                                    onClick={() => openResetPassword(user)}
                                                                                    className="rounded-xl border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                                                                              >
                                                                                    Reset mật khẩu
                                                                              </button>

                                                                              {canToggleAccount(user) ? (
                                                                                    user.isActive ? (
                                                                                          <button
                                                                                                type="button"
                                                                                                onClick={() =>
                                                                                                      deactivateMutation.mutate({ userId: user.id })
                                                                                                }
                                                                                                className="rounded-xl border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                                                                                          >
                                                                                                Khóa
                                                                                          </button>
                                                                                    ) : (
                                                                                          <button
                                                                                                type="button"
                                                                                                onClick={() =>
                                                                                                      activateMutation.mutate({ userId: user.id })
                                                                                                }
                                                                                                className="rounded-xl border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                                                                                          >
                                                                                                Mở khóa
                                                                                          </button>
                                                                                    )
                                                                              ) : (
                                                                                    <span className="inline-flex items-center text-xs text-slate-400">
                                                                                          Điều phối từ nghiệp vụ
                                                                                    </span>
                                                                              )}
                                                                        </div>
                                                                  </td>
                                                            </tr>
                                                      ))}
                                                </tbody>
                                          </table>
                                    </div>
                              )}
                        </div>
                  </div>

                  {resetTargetUser && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
                              <div className="w-full max-w-md rounded-3xl border bg-white p-5 shadow-2xl">
                                    <div>
                                          <h2 className="text-lg font-semibold text-slate-900">
                                                Reset mật khẩu
                                          </h2>
                                          <p className="mt-1 text-sm leading-6 text-slate-500">
                                                Thiết lập mật khẩu tạm cho tài khoản {" "}
                                                <span className="font-medium text-slate-800">
                                                      {resetTargetUser.name || resetTargetUser.username}
                                                </span>
. Tài khoản sẽ được đưa về mật khẩu mặc định và bắt buộc đổi mật khẩu khi đăng nhập lại.
                                          </p>
                                    </div>

                                    {resetMessage && (
                                          <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                                                {resetMessage}
                                          </div>
                                    )}

                                    <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                          <div className="font-semibold">Mật khẩu mặc định sau reset</div>
                                          <div className="mt-1 font-mono text-base font-bold tracking-wide">123456</div>
                                          <p className="mt-2 leading-6">
                                                Người dùng sẽ đăng nhập bằng mật khẩu mặc định này, sau đó hệ thống sẽ yêu cầu nhập mật khẩu hiện tại là <span className="font-semibold">123456</span> và đổi sang mật khẩu mới.
                                          </p>
                                    </div>

                                    <div className="mt-5 flex justify-end gap-2">
                                          <button
                                                type="button"
                                                onClick={closeResetPassword}
                                                disabled={resetPasswordMutation.isPending}
                                                className="rounded-xl border px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                                          >
                                                Hủy
                                          </button>
                                          <button
                                                type="button"
                                                onClick={handleResetPassword}
                                                disabled={resetPasswordMutation.isPending}
                                                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                          >
                                                {resetPasswordMutation.isPending
                                                      ? "Đang reset..."
                                                      : "Reset về mật khẩu mặc định"}
                                          </button>
                                    </div>
                              </div>
                        </div>
                  )}
            </ResidenceCareLayout>
      );
}
