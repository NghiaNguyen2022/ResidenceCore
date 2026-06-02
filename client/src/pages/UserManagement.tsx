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

      // Giữ tương thích dữ liệu cũ nếu còn
      admin: "Quản trị cũ",
      supervisor: "Người phụ trách cũ",
      accountant: "Kế toán cũ",
      user: "Người dùng",
};

function getRoleLabel(roleKey?: string | null) {
      if (!roleKey) return "Chưa phân quyền";
      return ROLE_LABELS[roleKey] ?? roleKey;
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
      }

      const users = usersQuery.data ?? [];

      const stats = useMemo(() => {
            const total = users.length;
            const active = users.filter((user) => user.isActive).length;
            const linkedResidents = users.filter((user) => user.residentId).length;
            const mustChangePassword = users.filter(
                  (user) => user.mustChangePassword
            ).length;

            return {
                  total,
                  active,
                  linkedResidents,
                  mustChangePassword,
            };
      }, [users]);

      async function handleCreateUser() {
            if (!form.name.trim() || !form.username.trim() || !form.password.trim()) {
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

      return (
            <ResidenceCareLayout>
                  <div className="space-y-5">
                        <div className="flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
                              <div>
                                    <h1 className="text-xl font-semibold text-slate-900">
                                          Người dùng & phân quyền
                                    </h1>
                                    <p className="mt-1 text-sm text-slate-500">
                                          Theo dõi tài khoản đăng nhập trong lưu xá. Tài khoản tạo tại màn hình này mặc định là Quản lý lưu xá.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={() => setShowCreateForm((value) => !value)}
                                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                              >
                                    {showCreateForm ? "Đóng" : "Tạo quản lý"}
                              </button>
                        </div>

                        <div className="grid gap-3 md:grid-cols-4">
                              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                                    <div className="text-sm text-slate-500">Tổng người dùng</div>
                                    <div className="mt-2 text-2xl font-semibold text-slate-900">
                                          {stats.total}
                                    </div>
                              </div>

                              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                                    <div className="text-sm text-slate-500">Đang hoạt động</div>
                                    <div className="mt-2 text-2xl font-semibold text-emerald-700">
                                          {stats.active}
                                    </div>
                              </div>

                              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                                    <div className="text-sm text-slate-500">Học viên có tài khoản</div>
                                    <div className="mt-2 text-2xl font-semibold text-slate-900">
                                          {stats.linkedResidents}
                                    </div>
                              </div>

                              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                                    <div className="text-sm text-slate-500">Cần đổi mật khẩu</div>
                                    <div className="mt-2 text-2xl font-semibold text-amber-700">
                                          {stats.mustChangePassword}
                                    </div>
                              </div>
                        </div>

                        {showCreateForm && (
                              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                                    <div className="mb-4">
                                          <h2 className="text-base font-semibold text-slate-900">
                                                Tạo quản lý lưu xá
                                          </h2>
                                          <p className="mt-1 text-sm text-slate-500">
                                                Tài khoản tạo tại đây dùng cho người quản lý. Học viên và các chức danh như Tổ trưởng, Trưởng ban, Thủ quỹ sẽ được tạo hoặc gắn quyền từ quy trình nghiệp vụ riêng.
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
                                          Vai trò mặc định:{" "}
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
                              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0">
                                          <h2 className="text-lg font-semibold text-slate-900">
                                                Danh sách người dùng
                                          </h2>
                                          <p className="mt-1 text-sm text-slate-500">
                                                Hiển thị toàn bộ người dùng trong hệ thống, bao gồm quản lý, học viên và các chức danh được bổ nhiệm.
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
                                                                              <span className="text-slate-400">Học viên: </span>
                                                                              <span className="text-slate-700">
                                                                                    {user.residentFullName || "Chưa liên kết"}
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
                                                            </div>

                                                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                                                                  {user.isActive ? (
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
                                                                  )}
                                                            </div>
                                                      </div>
                                                </div>
                                          ))}
                                    </div>
                              ) : (
                                    <div className="overflow-x-auto">
                                          <table className="w-full min-w-[980px] border-separate border-spacing-y-2">
                                                <thead>
                                                      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            <th className="px-3 py-2">Người dùng</th>
                                                            <th className="px-3 py-2">Email</th>
                                                            <th className="px-3 py-2">Vai trò</th>
                                                            <th className="px-3 py-2">Học viên liên kết</th>
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

                                                                  <td className="px-3 py-3 text-sm text-slate-600">
                                                                        {getRoleLabel(user.role)}
                                                                  </td>

                                                                  <td className="px-3 py-3 text-sm text-slate-600">
                                                                        {user.residentFullName || "Chưa liên kết"}
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
                                                                        {user.isActive ? (
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
                                                                        )}
                                                                  </td>
                                                            </tr>
                                                      ))}
                                                </tbody>
                                          </table>
                                    </div>
                              )}
                        </div>
                  </div>
            </ResidenceCareLayout>
      );
}