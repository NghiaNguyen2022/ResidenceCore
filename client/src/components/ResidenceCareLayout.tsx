'use client';

import { ReactNode, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
      appointmentNavigation,
      detailedManagerNavigation,
      residentNavigation,
      simpleManagerNavigation,
      type NavigationItem,
} from "@/config/navigation";
import { trpc } from "@/lib/trpc";
//import { useAuth } from "@/hooks/useAuth";
import { useSystemDisplayMode } from "@/hooks/useSystemDisplayMode";

type ResidenceCareLayoutProps = {
      children: ReactNode;
};

type CurrentUserLike =
      | {
            id?: number | null;
            role?: string | null;
            roles?: string[] | null;
            name?: string | null;
            username?: string | null;
            email?: string | null;
      }
      | null
      | undefined;

const APPOINTMENT_ROLE_KEYS = [
      "team_leader",
      "committee_head",
      "house_leader",
      "deputy",
      "secretary",
      "treasurer",
];

function getUserRoles(user: CurrentUserLike) {
      const roles = new Set<string>();

      if (user?.role) {
            roles.add(user.role);
      }

      user?.roles?.forEach((role) => roles.add(role));

      return Array.from(roles);
}

function hasRole(user: CurrentUserLike, roleKey: string) {
      return getUserRoles(user).includes(roleKey);
}

function hasAppointmentRole(user: CurrentUserLike) {
      return getUserRoles(user).some((role) =>
            APPOINTMENT_ROLE_KEYS.includes(role)
      );
}

function canShowNavigationItem(item: NavigationItem, user: CurrentUserLike) {
      if (!item.roles || item.roles.length === 0) {
            return true;
      }

      const userRoles = getUserRoles(user);

      return item.roles.some((role) => userRoles.includes(role));
}

function filterNavigationItems(
      items: NavigationItem[],
      user: CurrentUserLike
): NavigationItem[] {
      return items
            .map((item) => {
                  const children = item.children
                        ? filterNavigationItems(item.children, user)
                        : undefined;

                  const canShowSelf = canShowNavigationItem(item, user);

                  if (!canShowSelf && (!children || children.length === 0)) {
                        return null;
                  }

                  return {
                        ...item,
                        children,
                  };
            })
            .filter(Boolean) as NavigationItem[];
}

function isItemActive(item: NavigationItem, currentPath: string): boolean {
      if (item.path && currentPath === item.path) {
            return true;
      }

      if (item.path && item.path !== "/" && currentPath.startsWith(item.path)) {
            return true;
      }

      return item.children?.some((child) => isItemActive(child, currentPath)) ?? false;
}

function getUserRoleText(user: CurrentUserLike) {
      if (hasRole(user, "manager")) {
            return "Quản lý lưu xá";
      }

      if (hasRole(user, "resident") && hasAppointmentRole(user)) {
            return "Học viên kiêm phụ trách";
      }

      if (hasRole(user, "resident")) {
            return "Học viên";
      }

      if (hasAppointmentRole(user)) {
            return "Người phụ trách";
      }

      return "Người dùng";
}

function SidebarItem({
      item,
      currentPath,
      depth = 0,
}: {
      item: NavigationItem;
      currentPath: string;
      depth?: number;
}) {
      const [isOpen, setIsOpen] = useState(() => isItemActive(item, currentPath));

      const hasChildren = !!item.children?.length;
      const active = isItemActive(item, currentPath);
      const isDirectActive = item.path === currentPath;

      const isParent = depth === 0;
      const isChild = depth === 1;
      const isDeepChild = depth >= 2;

      const itemClass = [
            "group flex w-full items-center gap-3 rounded-xl transition",
            isParent ? "px-3 py-2.5 text-[15px] font-semibold" : "",
            isChild ? "px-3 py-2 text-sm font-medium" : "",
            isDeepChild ? "px-3 py-1.5 text-sm" : "",
            isDirectActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : active && hasChildren
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            depth > 0 ? "ml-2" : "",
      ]
            .filter(Boolean)
            .join(" ");

      const iconClass = [
            "flex shrink-0 items-center justify-center rounded-lg text-center",
            isParent ? "h-8 w-8 text-base" : "h-7 w-7 text-sm",
            isDirectActive
                  ? "bg-white/15 text-white"
                  : isParent
                        ? "bg-slate-100 text-slate-700 group-hover:bg-white"
                        : "bg-transparent text-slate-400",
      ].join(" ");

      const labelClass = [
            "min-w-0 flex-1 truncate text-left",
            isParent ? "tracking-tight" : "",
            isChild ? "text-slate-700 group-hover:text-slate-900" : "",
            isDeepChild ? "text-slate-500 group-hover:text-slate-800" : "",
            isDirectActive ? "!text-white" : "",
      ]
            .filter(Boolean)
            .join(" ");

      const chevronClass = [
            "text-xs transition-transform",
            isOpen ? "rotate-90" : "",
            isDirectActive ? "text-white/80" : "text-slate-400",
      ].join(" ");

      const content = (
            <>
                  <span className={iconClass}>{item.icon}</span>

                  <span className={labelClass}>{item.label}</span>

                  {item.badge && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                              {item.badge}
                        </span>
                  )}

                  {hasChildren && <span className={chevronClass}>›</span>}
            </>
      );

      return (
            <div className={depth > 0 ? "relative" : ""}>
                  {depth > 0 && (
                        <span
                              className={[
                                    "absolute left-0 top-0 h-full w-px",
                                    isDirectActive ? "bg-slate-900" : "bg-slate-200",
                              ].join(" ")}
                        />
                  )}

                  {hasChildren ? (
                        <button
                              type="button"
                              onClick={() => setIsOpen((value) => !value)}
                              className={itemClass}
                        >
                              {content}
                        </button>
                  ) : item.path ? (
                        <Link href={item.path}>
                              <a className={itemClass}>
                                    {isDeepChild && (
                                          <span
                                                className={[
                                                      "h-1.5 w-1.5 shrink-0 rounded-full",
                                                      isDirectActive ? "bg-white" : "bg-slate-300",
                                                ].join(" ")}
                                          />
                                    )}
                                    {content}
                              </a>
                        </Link>
                  ) : (
                        <div className={itemClass}>{content}</div>
                  )}

                  {hasChildren && isOpen && (
                        <div
                              className={[
                                    "mt-1 space-y-1",
                                    depth === 0 ? "ml-3 border-l border-slate-200 pl-2" : "",
                                    depth > 0 ? "ml-4 border-l border-slate-100 pl-2" : "",
                              ].join(" ")}
                        >
                              {item.children?.map((child) => (
                                    <SidebarItem
                                          key={`${child.label}-${child.path ?? "group"}`}
                                          item={child}
                                          currentPath={currentPath}
                                          depth={depth + 1}
                                    />
                              ))}
                        </div>
                  )}
            </div>
      );
}

export function ResidenceCareLayout({ children }: ResidenceCareLayoutProps) {
      const [currentPath] = useLocation();
      const authQuery = trpc.auth.me.useQuery(undefined, {
            retry: false,
            refetchOnWindowFocus: false,
      });

      const logoutMutation = trpc.auth.logout.useMutation({
            onSuccess: () => {
                  window.location.href = "/login";
            },
      });

      const user = authQuery.data ?? null;

      function logout() {
            logoutMutation.mutate();
      }
      const { isDetailed } = useSystemDisplayMode();
      const utils = trpc.useUtils();

      const [showProfileModal, setShowProfileModal] = useState(false);
      const [profileForm, setProfileForm] = useState({
            name: user?.name ?? "",
            email: user?.email ?? "",
      });

      const selectedNavigationItems = useMemo(() => {
            if (hasRole(user, "manager")) {
                  return isDetailed ? detailedManagerNavigation : simpleManagerNavigation;
            }

            if (hasRole(user, "resident")) {
                  if (hasAppointmentRole(user)) {
                        return [...residentNavigation, ...appointmentNavigation];
                  }

                  return residentNavigation;
            }

            if (hasAppointmentRole(user)) {
                  return appointmentNavigation;
            }

            return [];
      }, [user, isDetailed]);

      const visibleNavigationItems = useMemo(() => {
            return filterNavigationItems(selectedNavigationItems, user);
      }, [selectedNavigationItems, user]);

      const displayName =
            user?.name || user?.username || user?.email || "Người dùng";

      const roleText = getUserRoleText(user);

      const updateMyProfileMutation = trpc.auth.updateMyProfile.useMutation({
            onSuccess: async () => {
                  setShowProfileModal(false);

                  try {
                        await utils.auth.me.invalidate();
                  } catch {
                        window.location.reload();
                  }
            },
      });

      function openProfileModal() {
            setProfileForm({
                  name: user?.name ?? "",
                  email: user?.email ?? "",
            });
            setShowProfileModal(true);
      }

      async function handleUpdateMyProfile() {
            await updateMyProfileMutation.mutateAsync({
                  name: profileForm.name.trim(),
                  email: profileForm.email?.trim() || null,
            });
      }

      return (
            <div className="min-h-screen bg-slate-50">
                  <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-white lg:flex lg:flex-col">
                        <div className="border-b px-5 py-5">
                              <div className="text-xl font-bold tracking-tight text-slate-900">
                                    ResidenceCore
                              </div>
                              <div className="mt-1 text-sm text-slate-500">Quản lý lưu xá</div>
                        </div>

                        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
                              {visibleNavigationItems.map((item) => (
                                    <SidebarItem
                                          key={`${item.label}-${item.path ?? "group"}`}
                                          item={item}
                                          currentPath={currentPath}
                                    />
                              ))}
                        </nav>

                        <div className="border-t p-4">
                              <button
                                    type="button"
                                    onClick={openProfileModal}
                                    className="mb-3 w-full rounded-xl bg-slate-50 px-3 py-2 text-left transition hover:bg-slate-100"
                              >
                                    <div className="truncate text-sm font-medium text-slate-900">
                                          {displayName}
                                    </div>
                                    <div className="mt-0.5 text-xs text-slate-500">{roleText}</div>
                              </button>

                              <button
                                    type="button"
                                    onClick={logout}
                                    className="w-full rounded-xl border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                              >
                                    Đăng xuất
                              </button>
                        </div>
                  </aside>

                  <div className="lg:pl-72">
                        <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
                              <div className="flex h-16 items-center justify-between px-4 lg:px-6">
                                    <div>
                                          <div className="text-sm font-medium text-slate-900">
                                                App Lưu Xá
                                          </div>
                                          <div className="text-xs text-slate-500">
                                                {isDetailed ? "Chế độ chi tiết" : "Chế độ đơn giản"}
                                          </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                          <button
                                                type="button"
                                                onClick={openProfileModal}
                                                className="hidden rounded-xl px-3 py-2 text-right transition hover:bg-slate-100 sm:block"
                                          >
                                                <div className="text-sm font-medium text-slate-900">
                                                      {displayName}
                                                </div>
                                                <div className="text-xs text-slate-500">{roleText}</div>
                                          </button>

                                          <button
                                                type="button"
                                                onClick={logout}
                                                className="rounded-xl border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 lg:hidden"
                                          >
                                                Đăng xuất
                                          </button>
                                    </div>
                              </div>
                        </header>

                        <main className="px-4 py-5 lg:px-6">{children}</main>
                  </div>

                  {showProfileModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
                              <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
                                    <div className="mb-4">
                                          <h2 className="text-lg font-semibold text-slate-900">
                                                Thông tin cá nhân
                                          </h2>
                                          <p className="mt-1 text-sm text-slate-500">
                                                Cập nhật thông tin hiển thị của tài khoản đang đăng nhập.
                                          </p>
                                    </div>

                                    <div className="space-y-4">
                                          <label className="space-y-1.5">
                                                <span className="text-sm font-medium text-slate-700">
                                                      Họ tên
                                                </span>
                                                <input
                                                      value={profileForm.name}
                                                      onChange={(event) =>
                                                            setProfileForm((current) => ({
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
                                                      Email
                                                </span>
                                                <input
                                                      value={profileForm.email ?? ""}
                                                      onChange={(event) =>
                                                            setProfileForm((current) => ({
                                                                  ...current,
                                                                  email: event.target.value,
                                                            }))
                                                      }
                                                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900"
                                                      placeholder="email@example.com"
                                                />
                                          </label>

                                          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                                <div>
                                                      Tên đăng nhập:{" "}
                                                      <span className="font-medium text-slate-900">
                                                            {user?.username || "Chưa có"}
                                                      </span>
                                                </div>
                                                <div className="mt-1">
                                                      Vai trò:{" "}
                                                      <span className="font-medium text-slate-900">
                                                            {roleText}
                                                      </span>
                                                </div>
                                          </div>

                                          {updateMyProfileMutation.error && (
                                                <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                                      {updateMyProfileMutation.error.message}
                                                </div>
                                          )}
                                    </div>

                                    <div className="mt-5 flex justify-end gap-2">
                                          <button
                                                type="button"
                                                onClick={() => setShowProfileModal(false)}
                                                className="rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                          >
                                                Đóng
                                          </button>

                                          <button
                                                type="button"
                                                onClick={handleUpdateMyProfile}
                                                disabled={
                                                      updateMyProfileMutation.isPending ||
                                                      !profileForm.name.trim()
                                                }
                                                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                                          >
                                                {updateMyProfileMutation.isPending
                                                      ? "Đang lưu..."
                                                      : "Lưu thay đổi"}
                                          </button>
                                    </div>
                              </div>
                        </div>
                  )}
            </div>
      );
}

export default ResidenceCareLayout;