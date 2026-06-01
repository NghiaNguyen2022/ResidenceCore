import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LogOut, ChevronRight, ChevronDown } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { navigationItems, type NavigationItem } from "@/config/navigation";

type OpenMenusState = Record<string, boolean>;

function getItemKey(item: NavigationItem, parentKey = "") {
  return `${parentKey}/${item.label}`;
}

function isItemActive(item: NavigationItem, location: string): boolean {
  if (item.path && item.path === location) {
    return true;
  }

  if (!item.children || item.children.length === 0) {
    return false;
  }

  return item.children.some((child) => isItemActive(child, location));
}

function findActiveMenuKeys(
  items: NavigationItem[],
  location: string,
  parentKey = ""
): string[] {
  const result: string[] = [];

  for (const item of items) {
    const itemKey = getItemKey(item, parentKey);
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;

    if (hasChildren && isItemActive(item, location)) {
      result.push(itemKey);

      const childKeys = findActiveMenuKeys(
        item.children || [],
        location,
        itemKey
      );

      result.push(...childKeys);
    }
  }

  return result;
}

function getItemStyle({
  depth,
  hasChildren,
  active,
}: {
  depth: number;
  hasChildren: boolean;
  active: boolean;
}) {
  if (depth === 0) {
    return [
      "group relative flex w-full items-center justify-between rounded-xl px-4 py-3 transition-all",
      active
        ? "bg-white/8 text-white"
        : "text-slate-300 hover:bg-white/5 hover:text-white",
    ].join(" ");
  }

  if (depth === 1) {
    return [
      "group relative flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-all",
      active
        ? hasChildren
          ? "bg-white/6 text-slate-100"
          : "bg-sky-500/10 text-sky-200"
        : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
    ].join(" ");
  }

  return [
    "group relative flex w-full items-center justify-between rounded-md px-3 py-2 transition-all",
    active
      ? "bg-transparent text-sky-300"
      : "text-slate-500 hover:bg-white/5 hover:text-slate-200",
  ].join(" ");
}

function getTextStyle(depth: number) {
  if (depth === 0) {
    return "text-[15px] font-semibold";
  }

  if (depth === 1) {
    return "text-[13.5px] font-medium";
  }

  return "text-[13px] font-medium";
}

function getIconStyle(depth: number) {
  if (depth === 0) {
    return "text-lg";
  }

  if (depth === 1) {
    return "text-[15px]";
  }

  return "text-[13px]";
}

function getChildContainerStyle(depth: number) {
  if (depth === 0) {
    return "ml-5 mt-1 space-y-1 border-l border-slate-700/70 pl-4";
  }

  return "ml-4 mt-1 space-y-1 border-l border-slate-700/50 pl-3";
}

export function ResidenceCareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<OpenMenusState>({});

  const { user, logout } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    const activeKeys = findActiveMenuKeys(navigationItems, location);

    if (activeKeys.length === 0) return;

    setOpenMenus((prev) => {
      const next = { ...prev };

      activeKeys.forEach((key) => {
        next[key] = true;
      });

      return next;
    });
  }, [location]);

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderBadge = (badge?: string) => {
    if (!badge) return null;

    return (
      <span className="ml-auto rounded-full border border-slate-600/70 bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {badge}
      </span>
    );
  };

  const renderActiveMarker = ({
    active,
    depth,
    hasChildren,
  }: {
    active: boolean;
    depth: number;
    hasChildren: boolean;
  }) => {
    if (!active) return null;

    if (depth === 0) {
      return (
        <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-sky-400" />
      );
    }

    if (depth === 1 && !hasChildren) {
      return (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-sky-400" />
      );
    }

    if (depth >= 2) {
      return (
        <span className="absolute left-[-18px] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-sky-400 shadow-[0_0_0_3px_rgba(56,189,248,0.12)]" />
      );
    }

    return null;
  };

  const renderNavigationItem = (
    item: NavigationItem,
    options?: {
      isMobile?: boolean;
      depth?: number;
      parentKey?: string;
    }
  ) => {
    const isMobile = options?.isMobile ?? false;
    const depth = options?.depth ?? 0;
    const parentKey = options?.parentKey ?? "";

    const itemKey = getItemKey(item, parentKey);
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const itemActive = isItemActive(item, location);
    const exactActive = item.path === location;
    const opened = openMenus[itemKey] ?? false;

    const itemClassName = getItemStyle({
      depth,
      hasChildren,
      active: itemActive,
    });

    const textClassName = getTextStyle(depth);
    const iconClassName = getIconStyle(depth);

    if (hasChildren) {
      return (
        <div key={itemKey} className="space-y-1">
          <button
            type="button"
            onClick={() => toggleMenu(itemKey)}
            className={itemClassName}
          >
            {renderActiveMarker({
              active: itemActive,
              depth,
              hasChildren,
            })}

            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className={`${iconClassName} shrink-0 opacity-90`}>
                {item.icon}
              </span>

              <span className={`truncate text-left ${textClassName}`}>
                {item.label}
              </span>

              {renderBadge(item.badge)}
            </div>

            {opened ? (
              <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0 text-slate-400 transition-transform group-hover:text-slate-200" />
            ) : (
              <ChevronRight className="ml-2 h-4 w-4 flex-shrink-0 text-slate-500 transition-transform group-hover:text-slate-200" />
            )}
          </button>

          {opened && (
            <div className={getChildContainerStyle(depth)}>
              {item.children?.map((child) =>
                renderNavigationItem(child, {
                  isMobile,
                  depth: depth + 1,
                  parentKey: itemKey,
                })
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={itemKey}
        href={item.path || "#"}
        onClick={() => {
          if (isMobile) {
            setSidebarOpen(false);
          }
        }}
        className={itemClassName}
      >
        {renderActiveMarker({
          active: exactActive,
          depth,
          hasChildren: false,
        })}

        <div className="flex min-w-0 flex-1 items-center gap-3">
          {depth >= 2 ? (
            <span
              className={[
                "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
                exactActive ? "bg-sky-400" : "bg-slate-600",
              ].join(" ")}
            />
          ) : (
            <span className={`${iconClassName} shrink-0 opacity-90`}>
              {item.icon}
            </span>
          )}

          <span className={`truncate ${textClassName}`}>{item.label}</span>

          {renderBadge(item.badge)}
        </div>

        {exactActive && depth < 2 && (
          <ChevronRight className="ml-2 h-4 w-4 flex-shrink-0 text-sky-300" />
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 text-lg font-bold text-white shadow-sm">
            RC
          </div>

          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-900">
              ResidenceCore
            </h1>
            <p className="text-xs text-slate-500">Quản lý lưu xá</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 md:flex">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-slate-500">{user?.role || "User"}</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-sky-500 font-bold text-white shadow-sm">
              {user?.name?.charAt(0) || "A"}
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden text-sm font-medium md:inline">
              Đăng xuất
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 transition-colors hover:bg-slate-100 md:hidden"
          >
            {sidebarOpen ? (
              <X className="h-6 w-6 text-slate-900" />
            ) : (
              <Menu className="h-6 w-6 text-slate-900" />
            )}
          </button>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div className="fixed bottom-0 left-0 top-16 hidden w-72 flex-col overflow-y-auto border-r border-slate-800 bg-slate-950 text-white md:flex">
        <nav className="flex-1 space-y-1.5 px-4 py-5">
          {navigationItems.map((item) => renderNavigationItem(item))}
        </nav>

        <div className="border-t border-slate-800 px-4 py-5">
          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-sky-500 font-bold text-white shadow-sm">
              {user?.name?.charAt(0) || "A"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.name || "Admin"}
              </p>
              <p className="truncate text-xs text-slate-400">
                {user?.role || "User"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 top-16 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <div
        className={`fixed bottom-0 left-0 top-16 z-40 w-72 transform overflow-y-auto border-r border-slate-800 bg-slate-950 text-white transition-transform md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex-1 space-y-1.5 px-4 py-5">
          {navigationItems.map((item) =>
            renderNavigationItem(item, {
              isMobile: true,
              depth: 0,
              parentKey: "",
            })
          )}
        </nav>

        <div className="border-t border-slate-800 px-4 py-5">
          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-sky-500 font-bold text-white shadow-sm">
              {user?.name?.charAt(0) || "A"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.name || "Admin"}
              </p>
              <p className="truncate text-xs text-slate-400">
                {user?.role || "User"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mt-16 flex-1 overflow-auto md:ml-72">{children}</main>
    </div>
  );
}