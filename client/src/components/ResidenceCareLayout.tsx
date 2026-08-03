'use client';

import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Bell, CheckCircle2, LoaderCircle, Menu, X } from "lucide-react";
import {
      appointedResidentNavigation,
      detailedManagerNavigation,
      residentNavigation,
      simpleManagerNavigation,
      type NavigationItem,
} from "@/navigation";
import { trpc } from "@/lib/trpc";
import { useSystemDisplayMode } from "@/hooks/useSystemDisplayMode";
import { MandatoryChangePasswordModal } from "@/components/MandatoryChangePasswordModal";
import { getLoginUrl } from "@/const";

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
            mustChangePassword?: boolean | number | null;
      }
      | null
      | undefined;

type AccessContextRole = {
      roleCode?: string | null;
      roleName?: string | null;
      unitType?: string | null;
      unitId?: number | null;
      unitName?: string | null;
};

type RolePanelItem = {
      key: string;
      label: string;
      scope?: string | null;
};

const APPOINTMENT_ROLE_KEYS = [
      "team_leader",
      "committee_head",
      "house_leader",
      "head",
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

function normalizeRoleCode(value?: string | null) {
      const roleCode = String(value || "")
            .trim()
            .toLowerCase()
            .replace(/-/g, "_");

      if (roleCode === "head") return "house_leader";

      return roleCode;
}

function normalizeText(value?: string | null) {
      return String(value || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
}

function getRoleLabelFromCode(roleCode?: string | null, fallback?: string | null) {
      const normalizedRoleCode = normalizeRoleCode(roleCode);
      const normalizedFallback = normalizeText(fallback);

      if (
            normalizedRoleCode === "house_leader" ||
            normalizedFallback === "truong" ||
            normalizedFallback.includes("truong luu xa")
      ) {
            return "Trưởng";
      }

      if (normalizedRoleCode === "deputy" || normalizedFallback === "pho") {
            return "Phó";
      }

      if (normalizedRoleCode === "secretary" || normalizedFallback === "thu ky") {
            return "Thư ký";
      }

      if (normalizedRoleCode === "treasurer" || normalizedFallback === "thu quy") {
            return "Thủ quỹ";
      }

      if (
            normalizedRoleCode === "team_leader" ||
            normalizedFallback === "to truong" ||
            normalizedFallback.includes("truong to")
      ) {
            return "Tổ trưởng";
      }

      if (
            normalizedRoleCode === "committee_head" ||
            normalizedFallback === "truong ban" ||
            normalizedFallback.includes("truong ban")
      ) {
            return "Trưởng ban";
      }

      return fallback || "Người phụ trách";
}

function getRoleScopeText(role: AccessContextRole) {
      if (role.unitName) return role.unitName;

      const roleCode = normalizeRoleCode(role.roleCode);

      if (roleCode === "team_leader") return "Tổ được phân công";
      if (roleCode === "committee_head") return "Ban được phân công";

      return "Toàn lưu xá";
}

function getRoleChipClasses(roleKey: string) {
      const roleCode = normalizeRoleCode(roleKey);

      if (roleCode === "team_leader") {
            return {
                  wrapper: "border-emerald-200/80 bg-emerald-50/90",
                  label: "text-emerald-800",
                  scope: "text-emerald-600",
                  dot: "bg-emerald-400",
            };
      }

      if (roleCode === "committee_head") {
            return {
                  wrapper: "border-violet-200/80 bg-violet-50/90",
                  label: "text-violet-800",
                  scope: "text-violet-600",
                  dot: "bg-violet-400",
            };
      }

      if (roleCode === "house_leader") {
            return {
                  wrapper: "border-amber-200/80 bg-amber-50/90",
                  label: "text-amber-800",
                  scope: "text-amber-600",
                  dot: "bg-amber-400",
            };
      }

      if (roleCode === "deputy") {
            return {
                  wrapper: "border-sky-200/80 bg-sky-50/90",
                  label: "text-sky-800",
                  scope: "text-sky-600",
                  dot: "bg-sky-400",
            };
      }

      if (roleCode === "secretary") {
            return {
                  wrapper: "border-rose-200/80 bg-rose-50/90",
                  label: "text-rose-800",
                  scope: "text-rose-600",
                  dot: "bg-rose-400",
            };
      }

      if (roleCode === "treasurer") {
            return {
                  wrapper: "border-indigo-200/80 bg-indigo-50/90",
                  label: "text-indigo-800",
                  scope: "text-indigo-600",
                  dot: "bg-indigo-400",
            };
      }

      return {
            wrapper: "border-slate-200 bg-slate-50/90",
            label: "text-slate-800",
            scope: "text-slate-500",
            dot: "bg-slate-400",
      };
}

function buildRolePanelItems(input: {
      user: CurrentUserLike;
      accessContext?: any;
}): RolePanelItem[] {
      const { user, accessContext } = input;

      if (hasRole(user, "manager")) {
            return [
                  {
                        key: "manager",
                        label: "Quản lý lưu xá",
                        scope: "Toàn hệ thống",
                  },
            ];
      }

      const accessRoles = Array.isArray(accessContext?.roles)
            ? (accessContext.roles as AccessContextRole[])
            : [];

      if (accessRoles.length > 0) {
            const uniqueMap = new Map<string, RolePanelItem>();

            accessRoles.forEach((role) => {
                  const roleCode = normalizeRoleCode(role.roleCode);
                  const label = getRoleLabelFromCode(role.roleCode, role.roleName);
                  const scope = getRoleScopeText(role);
                  const key = [roleCode, role.unitType || "", role.unitId || "", scope].join(":");

                  if (!uniqueMap.has(key)) {
                        uniqueMap.set(key, {
                              key,
                              label,
                              scope,
                        });
                  }
            });

            return Array.from(uniqueMap.values());
      }

      const fallbackAppointmentRoles = getUserRoles(user)
            .filter((role) => APPOINTMENT_ROLE_KEYS.includes(role))
            .map((role) => ({
                  key: role,
                  label: getRoleLabelFromCode(role),
                  scope: role === "team_leader" || role === "committee_head" ? null : "Toàn lưu xá",
            }));

      if (fallbackAppointmentRoles.length > 0) {
            const uniqueMap = new Map<string, RolePanelItem>();

            fallbackAppointmentRoles.forEach((role) => {
                  if (!uniqueMap.has(role.key)) {
                        uniqueMap.set(role.key, role);
                  }
            });

            return Array.from(uniqueMap.values());
      }

      if (hasRole(user, "resident")) {
            return [
                  {
                        key: "resident",
                        label: "Học viên lưu trú",
                        scope: null,
                  },
            ];
      }

      return [
            {
                  key: "user",
                  label: "Người dùng",
                  scope: null,
            },
      ];
}

function getUserRoleText(user: CurrentUserLike, rolePanelItems: RolePanelItem[]) {
      if (hasRole(user, "manager")) {
            return "Quản lý lưu xá";
      }

      if (hasRole(user, "resident") && hasAppointmentRole(user)) {
            const appointedRoles = rolePanelItems.filter((item) => item.key !== "resident");

            if (appointedRoles.length === 0) {
                  return "Học viên kiêm phụ trách";
            }

            if (appointedRoles.length === 1) {
                  return `Học viên · ${appointedRoles[0].label}`;
            }

            return `Học viên · ${appointedRoles[0].label} +${appointedRoles.length - 1}`;
      }

      if (hasRole(user, "resident")) {
            return "Học viên";
      }

      if (hasAppointmentRole(user)) {
            const firstRole = rolePanelItems[0];

            return firstRole?.label || "Người phụ trách";
      }

      return "Người dùng";
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

function withResidentNotificationBadge(
      items: NavigationItem[],
      unreadCount: number
): NavigationItem[] {
      return items.map((item) => {
            const children = item.children
                  ? withResidentNotificationBadge(item.children, unreadCount)
                  : undefined;

            if (item.path === "/resident/notifications") {
                  const badge = unreadCount > 99 ? "99+" : unreadCount > 0 ? String(unreadCount) : undefined;

                  return {
                        ...item,
                        children,
                        badge,
                  };
            }

            return {
                  ...item,
                  children,
            };
      });
}

function SidebarItem({
      item,
      currentPath,
      depth = 0,
      onNavigate,
}: {
      item: NavigationItem;
      currentPath: string;
      depth?: number;
      onNavigate?: () => void;
}) {
      const [isOpen, setIsOpen] = useState(() => isItemActive(item, currentPath));

      const hasChildren = !!item.children?.length;
      const isDisabled = item.disabled === true;
      const active = !isDisabled && isItemActive(item, currentPath);
      const isDirectActive = !isDisabled && item.path === currentPath;

      const isParent = depth === 0;
      const isChild = depth === 1;
      const isDeepChild = depth >= 2;

      const itemClass = [
            "group flex w-full items-center gap-2 rounded-xl border transition",
            isParent ? "px-2.5 py-2 text-[14px] font-semibold" : "",
            isChild ? "px-2.5 py-1.5 text-[13px] font-medium" : "",
            isDeepChild ? "px-2.5 py-1.5 text-[13px]" : "",
            isDisabled
                  ? "cursor-not-allowed border-transparent bg-white/28 text-slate-400 opacity-70"
                  : isDirectActive
                        ? "border-amber-200/60 bg-[linear-gradient(35deg,rgba(255,255,255,0.94)_0%,rgba(254,243,199,0.82)_38%,rgba(245,158,11,0.32)_78%,rgba(28,25,23,0.14)_100%)] text-slate-900 shadow-[0_14px_28px_rgba(12,10,9,0.10),inset_0_1px_0_rgba(255,255,255,0.78)]"
                  : active && hasChildren
                        ? "border-amber-100/70 bg-white/70 text-slate-900 shadow-[0_4px_12px_rgba(120,53,15,0.035)] shadow-slate-900/5"
                        : isChild
                              ? "border-amber-100/55 bg-white/38 text-slate-500 hover:border-amber-100/80 hover:bg-white/66 hover:text-slate-800 hover:shadow-[0_4px_12px_rgba(120,53,15,0.035)] hover:shadow-slate-900/5"
                              : isDeepChild
                                    ? "border-transparent bg-transparent text-slate-500 hover:border-amber-100/60 hover:bg-white/50 hover:text-slate-800"
                                    : "border-transparent text-slate-600 hover:border-amber-100/70 hover:bg-white/68 hover:text-slate-900 hover:shadow-[0_4px_12px_rgba(120,53,15,0.035)] hover:shadow-slate-900/5",
            "",
      ]
            .filter(Boolean)
            .join(" ");

      const itemStyle =
            isChild
                  ? { marginLeft: "1rem", width: "calc(100% - 1rem)" }
                  : isDeepChild
                        ? { marginLeft: "1.5rem", width: "calc(100% - 1.5rem)" }
                        : undefined;

      const iconClass = [
            "flex shrink-0 items-center justify-center rounded-xl text-center",
            isParent ? "h-6 w-6 text-sm" : "h-6 w-6 text-xs",
            isDirectActive
                  ? "bg-white/76 text-amber-800 shadow-[0_4px_12px_rgba(120,53,15,0.035)]"
                  : isParent
                        ? "bg-white/62 text-amber-800 ring-1 ring-amber-100/70 group-hover:bg-white"
                        : "bg-transparent text-slate-400",
      ].join(" ");

      const labelClass = [
            "min-w-0 flex-1 truncate text-left",
            isParent ? "tracking-tight" : "",
            isChild ? "text-slate-600 group-hover:text-slate-850" : "",
            isDeepChild ? "text-slate-500 group-hover:text-slate-800" : "",
            isDirectActive ? "!text-slate-900" : "",
      ]
            .filter(Boolean)
            .join(" ");

      const chevronClass = [
            "text-xs transition-transform",
            isOpen ? "rotate-90" : "",
            isDirectActive ? "text-amber-800/80" : "text-slate-400",
      ].join(" ");

      const content = (
            <>
                  <span className={iconClass}>{item.icon}</span>

                  <span className={labelClass}>{item.label}</span>

                  {item.badge && (
                        <span className="rounded-full bg-white/74 px-2 py-0.5 text-[10px] font-semibold text-slate-500 ring-1 ring-amber-100/70">
                              {item.badge}
                        </span>
                  )}

                  {hasChildren && <span className={chevronClass}>›</span>}
            </>
      );

      return (
            <div className={depth > 0 ? "relative" : ""}>
                  {depth > 1 && (
                        <span
                              className={[
                                    "absolute left-0 top-0 h-full w-px",
                                    isDirectActive ? "bg-amber-400" : "bg-amber-100/70",
                              ].join(" ")}
                        />
                  )}

                  {hasChildren ? (
                        <button
                              type="button"
                              onClick={() => setIsOpen((value) => !value)}
                              className={itemClass}
                              style={itemStyle}
                        >
                              {content}
                        </button>
                  ) : item.path && !isDisabled ? (
                        <Link href={item.path} className={itemClass} style={itemStyle} onClick={onNavigate}>
                              {isDeepChild && (
                                    <span
                                          className={[
                                                "h-1.5 w-1.5 shrink-0 rounded-full",
                                                isDirectActive ? "bg-amber-700" : "bg-amber-300",
                                          ].join(" ")}
                                    />
                              )}
                              {content}
                        </Link>
                  ) : (
                        <div
                              className={itemClass}
                              style={itemStyle}
                              aria-disabled={isDisabled || undefined}
                              title={isDisabled ? "Chức năng đang được chuẩn bị" : undefined}
                        >
                              {content}
                        </div>
                  )}

                  {hasChildren && isOpen && (
                        <div
                              className={[
                                    "mt-1 space-y-1",
                                    depth === 0 ? "relative ml-0 border-l border-amber-100/65 pl-0 pr-0" : "",
                                    depth > 0 ? "ml-0 border-l border-amber-100/45 pl-0" : "",
                              ].join(" ")}
                        >
                              {item.children?.map((child) => (
                                    <SidebarItem
                                          key={`${child.label}-${child.path ?? "group"}`}
                                          item={child}
                                          currentPath={currentPath}
                                          depth={depth + 1}
                                          onNavigate={onNavigate}
                                    />
                              ))}
                        </div>
                  )}
            </div>
      );
}

export function ResidenceCareLayout({ children }: ResidenceCareLayoutProps) {
      const [currentPath, navigate] = useLocation();
      const authQuery = trpc.auth.me.useQuery(undefined, {
            retry: false,
            refetchOnWindowFocus: false,
      });

      const logoutMutation = trpc.auth.logout.useMutation({
            onSuccess: () => {
                  window.location.href = getLoginUrl();
            },
      });

      const user = authQuery.data ?? null;

      useEffect(() => {
            if (authQuery.isLoading || authQuery.isFetching || user) return;
            window.location.href = getLoginUrl();
      }, [authQuery.isFetching, authQuery.isLoading, user]);

      const accessContextQuery = trpc.residentPortal.getMyAccessContext.useQuery(undefined, {
            enabled: Boolean(user?.id) && hasRole(user, "resident"),
            retry: false,
            refetchOnWindowFocus: false,
      });

      const enhancedUser = useMemo(() => {
            if (!user) return user;

            const roles = new Set<string>(getUserRoles(user));

            const roleKeys = Array.isArray((accessContextQuery.data as any)?.roleKeys)
                  ? ((accessContextQuery.data as any).roleKeys as string[])
                  : [];

            roleKeys.forEach((role) => {
                  if (role) roles.add(String(role));
            });

            accessContextQuery.data?.roles?.forEach((role: any) => {
                  const roleCode = String(role?.roleCode || "").trim();
                  if (roleCode) roles.add(roleCode);
            });

            if (roles.has("head")) roles.add("house_leader");
            if (roles.has("house_leader")) roles.add("head");

            return {
                  ...user,
                  roles: Array.from(roles),
            };
      }, [user, accessContextQuery.data]);

      const rolePanelItems = useMemo(() => {
            return buildRolePanelItems({
                  user: enhancedUser,
                  accessContext: accessContextQuery.data,
            });
      }, [enhancedUser, accessContextQuery.data]);

      const mustChangePassword = Boolean(enhancedUser?.mustChangePassword);

      function logout() {
            logoutMutation.mutate();
      }

      async function handlePasswordChangedAndRequireLogin() {
            try {
                  await logoutMutation.mutateAsync();
            } catch {
                  localStorage.removeItem("token");
                  localStorage.removeItem("authToken");
                  localStorage.removeItem("user");
                  window.location.href = getLoginUrl();
            }
      }
      const { isDetailed } = useSystemDisplayMode();
      const utils = trpc.useUtils();

      const [showProfileModal, setShowProfileModal] = useState(false);
      const [profileForm, setProfileForm] = useState({
            name: enhancedUser?.name ?? "",
            email: enhancedUser?.email ?? "",
      });
      const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

      useEffect(() => {
            setIsMobileMenuOpen(false);
      }, [currentPath]);

      const selectedNavigationItems = useMemo(() => {
            if (hasRole(enhancedUser, "manager")) {
                  return isDetailed ? detailedManagerNavigation : simpleManagerNavigation;
            }

            if (hasRole(enhancedUser, "resident")) {
                  if (hasAppointmentRole(enhancedUser)) {
                        return [...residentNavigation, ...appointedResidentNavigation];
                  }

                  return residentNavigation;
            }

            if (hasAppointmentRole(enhancedUser)) {
                  return appointedResidentNavigation;
            }

            return [];
      }, [enhancedUser, isDetailed]);

      const visibleNavigationItems = useMemo(() => {
            return filterNavigationItems(selectedNavigationItems, enhancedUser);
      }, [selectedNavigationItems, enhancedUser]);

      const displayName =
            enhancedUser?.name || enhancedUser?.username || enhancedUser?.email || "Người dùng";

      const roleText = getUserRoleText(enhancedUser, rolePanelItems);
      const roleCards = rolePanelItems.filter((item) => item.key !== "resident" && item.key !== "user");

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
            if (mustChangePassword) {
                  return;
            }

            setProfileForm({
                  name: enhancedUser?.name ?? "",
                  email: enhancedUser?.email ?? "",
            });
            setShowProfileModal(true);
      }

      async function handleUpdateMyProfile() {
            await updateMyProfileMutation.mutateAsync({
                  name: profileForm.name.trim(),
                  email: profileForm.email?.trim() || null,
            });
      }

      const isResidentUser = Boolean(enhancedUser?.id) && hasRole(enhancedUser, "resident") && !mustChangePassword;

      const unreadNotificationCountQuery = trpc.residentPortal.getMyUnreadNotificationCount.useQuery(
            undefined,
            {
                  enabled: isResidentUser,
                  retry: false,
                  refetchOnWindowFocus: true,
                  refetchInterval: isResidentUser ? 30000 : false,
            }
      );

      const unreadNotificationCount = Number(unreadNotificationCountQuery.data || 0);

      const navigationItemsWithNotificationBadge = useMemo(() => {
            if (!isResidentUser) return visibleNavigationItems;

            return withResidentNotificationBadge(
                  visibleNavigationItems,
                  unreadNotificationCount
            );
      }, [isResidentUser, visibleNavigationItems, unreadNotificationCount]);

      const unreadNotificationsQuery = trpc.residentPortal.getMyNotifications.useQuery(
            { limit: 5, unreadOnly: true },
            {
                  enabled: isResidentUser,
                  retry: false,
                  refetchOnWindowFocus: true,
                  refetchInterval: isResidentUser ? 30000 : false,
            }
      );

      const markNotificationReadMutation = trpc.residentPortal.markMyNotificationRead.useMutation({
            onSuccess: async () => {
                  await Promise.allSettled([
                        utils.residentPortal.getMyNotifications.invalidate(),
                        utils.residentPortal.getMyUnreadNotificationCount.invalidate(),
                  ]);
            },
      });

      const [dismissedNotificationIds, setDismissedNotificationIds] = useState<number[]>(() => {
            if (typeof window === "undefined") return [];

            try {
                  const raw = window.sessionStorage.getItem("resident.dismissedNotificationIds");
                  const parsed = raw ? JSON.parse(raw) : [];

                  return Array.isArray(parsed)
                        ? parsed
                              .map((value) => Number(value))
                              .filter((value) => Number.isFinite(value) && value > 0)
                        : [];
            } catch {
                  return [];
            }
      });

      const unreadNotifications = Array.isArray(unreadNotificationsQuery.data)
            ? unreadNotificationsQuery.data
            : [];

      const popupNotification = unreadNotifications.find((notification: any) => {
            const notificationId = Number(notification?.id);

            return notificationId > 0 && !dismissedNotificationIds.includes(notificationId);
      });

      function rememberDismissedNotification(notificationId: number) {
            setDismissedNotificationIds((current) => {
                  const next = Array.from(new Set([...current, notificationId]));

                  if (typeof window !== "undefined") {
                        try {
                              window.sessionStorage.setItem(
                                    "resident.dismissedNotificationIds",
                                    JSON.stringify(next.slice(-50))
                              );
                        } catch {
                              // Ignore storage errors. The popup can still be dismissed in memory.
                        }
                  }

                  return next;
            });
      }

      function dismissPopupNotification() {
            const notificationId = Number((popupNotification as any)?.id);
            if (notificationId > 0) {
                  rememberDismissedNotification(notificationId);
            }
      }

      async function markPopupNotificationRead() {
            const notificationId = Number((popupNotification as any)?.id);
            if (!notificationId) return;

            await markNotificationReadMutation.mutateAsync({ notificationId });
            rememberDismissedNotification(notificationId);
      }

      function openNotificationPage() {
            dismissPopupNotification();
            navigate("/resident/notifications");
      }

      const sidebarContent = (
            <>
                  <div className="border-b border-amber-100/70 px-4 py-4">
                        <div className="text-lg font-bold tracking-tight text-slate-900">
                              ResidenceCore
                        </div>
                        <div className="mt-0.5 text-xs font-medium text-slate-500">Quản lý lưu xá</div>
                  </div>

                  <nav className="flex-1 space-y-1.5 overflow-y-auto px-2.5 py-3">
                        {navigationItemsWithNotificationBadge.map((item) => (
                              <SidebarItem
                                    key={`${item.label}-${item.path ?? "group"}`}
                                    item={item}
                                    currentPath={currentPath}
                                    onNavigate={() => setIsMobileMenuOpen(false)}
                              />
                        ))}
                  </nav>

                  <div className="border-t border-amber-100/70 bg-white/52 px-4 py-3">
                        <div className="flex items-center gap-2">
                              <button
                                    type="button"
                                    onClick={openProfileModal}
                                    className="min-w-0 flex-1 rounded-xl border border-transparent px-2 py-1.5 text-left transition hover:border-amber-100/70 hover:bg-white/72"
                                    title={`${displayName} · ${roleText}`}
                              >
                                    <div className="truncate text-sm font-semibold text-slate-900">
                                          {displayName}
                                    </div>
                                    <div className="truncate text-xs text-slate-500">{roleText}</div>
                              </button>

                              <button
                                    type="button"
                                    onClick={logout}
                                    className="shrink-0 rounded-xl border border-amber-100/70 bg-white/68 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_4px_12px_rgba(120,53,15,0.035)] shadow-slate-900/5 transition hover:bg-white"
                              >
                                    Đăng xuất
                              </button>
                        </div>
                  </div>
            </>
      );


      if (authQuery.isLoading || authQuery.isFetching || !user) {
            return (
                  <div
                        className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#fffdf8_0%,#ffffff_55%,#fff7ed_100%)]"
                        aria-busy="true"
                        aria-label="Đang tải tài khoản"
                  >
                        <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-white/90 px-5 py-3 text-sm font-semibold text-slate-700 shadow-lg shadow-amber-950/5">
                              <LoaderCircle className="h-5 w-5 animate-spin text-amber-600" />
                              Đang tải tài khoản...
                        </div>
                  </div>
            );
      }

      return (
            <div className="min-h-screen bg-[radial-gradient(circle_at_12%_16%,rgba(251,191,36,0.16)_0%,transparent_28%),linear-gradient(135deg,#fffaf0_0%,#f8fafc_46%,#fef3c7_82%,#111827_160%)]">
                  <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-amber-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(255,251,235,0.72)_55%,rgba(245,158,11,0.12)_100%)] shadow-[18px_0_46px_rgba(12,10,9,0.075),inset_-1px_0_0_rgba(255,255,255,0.72)] backdrop-blur lg:flex lg:flex-col">
                        {sidebarContent}
                  </aside>

                  {isMobileMenuOpen ? (
                        <div className="fixed inset-0 z-40 lg:hidden">
                              <button
                                    type="button"
                                    aria-label="Đóng menu"
                                    className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]"
                                    onClick={() => setIsMobileMenuOpen(false)}
                              />
                              <aside className="absolute inset-y-0 left-0 flex w-[82vw] max-w-[19rem] flex-col border-r border-amber-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,251,235,0.88)_55%,rgba(245,158,11,0.16)_100%)] shadow-[18px_0_46px_rgba(12,10,9,0.18)] backdrop-blur">
                                    <div className="absolute right-3 top-3 z-10">
                                          <button
                                                type="button"
                                                aria-label="Đóng menu"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-100 bg-white/86 text-slate-700 shadow-sm"
                                          >
                                                <X className="h-5 w-5" />
                                          </button>
                                    </div>
                                    {sidebarContent}
                              </aside>
                        </div>
                  ) : null}

                  <div className="lg:pl-64">
                        <header className="sticky top-0 z-20 border-b border-amber-100/70 bg-white/72 shadow-[0_12px_34px_rgba(12,10,9,0.045)] backdrop-blur">
                              <div className="flex h-14 items-center justify-between px-3 lg:px-6">
                                    <div className="flex min-w-0 items-center gap-2">
                                          <button
                                                type="button"
                                                aria-label="Mở menu"
                                                onClick={() => setIsMobileMenuOpen(true)}
                                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-100/80 bg-white/82 text-slate-700 shadow-sm transition hover:border-amber-200 hover:bg-amber-50 lg:hidden"
                                          >
                                                <Menu className="h-5 w-5" />
                                          </button>
                                          <div className="min-w-0">
                                                <div className="truncate text-sm font-medium text-slate-900">
                                                      App Lưu Xá
                                                </div>
                                                <div className="truncate text-xs text-slate-500">
                                                      {isDetailed ? "Chế độ chi tiết" : "Chế độ đơn giản"}
                                                </div>
                                          </div>
                                    </div>

                                    <div className="ml-auto min-w-0 flex-1 pl-4 lg:max-w-[72%]">
                                          {roleCards.length > 0 ? (
                                                <div className="flex min-w-0 items-start justify-end gap-3">
                                                      <span className="hidden shrink-0 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 xl:inline">
                                                            Vai trò
                                                      </span>

                                                      <div className="flex min-w-0 justify-end gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                                            {roleCards.map((item) => {
                                                                  const chipClasses = getRoleChipClasses(item.key);

                                                                  return (
                                                                        <div
                                                                              key={item.key}
                                                                              title={
                                                                                    item.scope
                                                                                          ? `${item.label} · ${item.scope}`
                                                                                          : item.label
                                                                              }
                                                                              className={[
                                                                                    "shrink-0 rounded-xl border px-3 py-1.5 shadow-[0_4px_12px_rgba(120,53,15,0.035)] shadow-slate-100/70 transition hover:-translate-y-[1px]",
                                                                                    chipClasses.wrapper,
                                                                              ].join(" ")}
                                                                        >
                                                                              <div className="flex items-center gap-2">
                                                                                    <span
                                                                                          className={[
                                                                                                "h-2 w-2 rounded-full",
                                                                                                chipClasses.dot,
                                                                                          ].join(" ")}
                                                                                    />
                                                                                    <div
                                                                                          className={[
                                                                                                "whitespace-nowrap text-sm font-semibold leading-none",
                                                                                                chipClasses.label,
                                                                                          ].join(" ")}
                                                                                    >
                                                                                          {item.label}
                                                                                    </div>
                                                                              </div>
                                                                              {item.scope && (
                                                                                    <div
                                                                                          className={[
                                                                                                "mt-1 whitespace-nowrap pl-4 text-[11px] leading-none",
                                                                                                chipClasses.scope,
                                                                                          ].join(" ")}
                                                                                    >
                                                                                          {item.scope}
                                                                                    </div>
                                                                              )}
                                                                        </div>
                                                                  );
                                                            })}
                                                      </div>
                                                </div>
                                          ) : (
                                                <div className="hidden text-right text-xs text-slate-400 lg:block">
                                                      Không có vai trò phụ trách
                                                </div>
                                          )}
                                    </div>
                              </div>
                        </header>

                        <main className="px-4 py-5 lg:px-6">{mustChangePassword ? null : children}</main>
                  </div>

                  {popupNotification && !mustChangePassword && (
                        <div className="fixed right-4 top-4 z-[10000] w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-3xl border border-amber-100/80 bg-white/96 shadow-[0_22px_60px_rgba(15,23,42,0.18)] backdrop-blur">
                              <div className="border-b border-amber-100/70 bg-[linear-gradient(135deg,rgba(255,251,235,0.96)_0%,rgba(255,255,255,0.98)_58%,rgba(254,243,199,0.76)_100%)] px-4 py-3">
                                    <div className="flex items-start gap-3">
                                          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 ring-1 ring-amber-200/70">
                                                <Bell className="h-5 w-5" />
                                          </div>

                                          <div className="min-w-0 flex-1">
                                                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
                                                      Thông báo mới
                                                </div>
                                                <div className="mt-1 line-clamp-2 text-sm font-bold text-slate-900">
                                                      {(popupNotification as any).title || "Bạn có thông báo mới"}
                                                </div>
                                          </div>

                                          <button
                                                type="button"
                                                onClick={dismissPopupNotification}
                                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-transparent text-slate-400 transition hover:border-amber-100 hover:bg-white hover:text-slate-700"
                                                aria-label="Ẩn thông báo"
                                          >
                                                <X className="h-4 w-4" />
                                          </button>
                                    </div>
                              </div>

                              <div className="space-y-3 px-4 py-3">
                                    <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                                          {(popupNotification as any).content || "Mở trang thông báo để xem chi tiết."}
                                    </p>

                                    <div className="flex flex-wrap justify-end gap-2">
                                          <button
                                                type="button"
                                                onClick={markPopupNotificationRead}
                                                disabled={markNotificationReadMutation.isPending}
                                                className="inline-flex items-center gap-1.5 rounded-2xl border border-amber-100 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-amber-50 disabled:opacity-60"
                                          >
                                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                Đã đọc
                                          </button>

                                          <button
                                                type="button"
                                                onClick={openNotificationPage}
                                                className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-bold text-amber-50 shadow-sm transition hover:bg-slate-800"
                                          >
                                                Xem tất cả
                                          </button>
                                    </div>
                              </div>
                        </div>
                  )}

                  {mustChangePassword && (
                        <MandatoryChangePasswordModal
                              onChangedAndRequireLogin={handlePasswordChangedAndRequireLogin}
                        />
                  )}

                  {showProfileModal && !mustChangePassword && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
                              <div className="w-full max-w-lg rounded-xl bg-white p-3 shadow-xl">
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
                                                      className="w-full rounded-xl border px-3 py-1.5 text-sm outline-none focus:border-slate-900"
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
                                                      className="w-full rounded-xl border px-3 py-1.5 text-sm outline-none focus:border-slate-900"
                                                      placeholder="email@example.com"
                                                />
                                          </label>

                                          <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                                                <div>
                                                      Tên đăng nhập:{" "}
                                                      <span className="font-medium text-slate-900">
                                                            {enhancedUser?.username || "Chưa có"}
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
                                                <div className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                                                      {updateMyProfileMutation.error.message}
                                                </div>
                                          )}
                                    </div>

                                    <div className="mt-5 flex justify-end gap-2">
                                          <button
                                                type="button"
                                                onClick={() => setShowProfileModal(false)}
                                                className="rounded-xl border px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
                                                className="rounded-xl bg-slate-900 px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-200 disabled:opacity-60"
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
