import type { NavigationItem } from "./types";

function hasResidentStoreAccess() {
      if (typeof window === "undefined") return false;

      try {
            const raw = window.sessionStorage.getItem("residentStoreAccess");
            if (!raw) return false;

            const parsed = JSON.parse(raw);
            const validUntil = parsed?.validUntil ? new Date(parsed.validUntil).getTime() : 0;

            return Boolean(
                  parsed?.accessToken &&
                  Number(parsed?.storeShiftId) > 0 &&
                  validUntil > Date.now(),
            );
      } catch {
            return false;
      }
}

const storeNavigationItem: NavigationItem = {
      label: "Cửa hàng",
      path: "/resident/store",
      icon: "🛍️",
      roles: ["resident"],
};

export const residentNavigation: NavigationItem[] = [
      {
            label: "Hôm nay",
            path: "/resident/today",
            icon: "📅",
            roles: ["resident"],
      },
      {
            label: "Lưu xá của tôi",
            icon: "🏠",
            roles: ["resident"],
            children: [
                  {
                        label: "Hồ sơ",
                        path: "/my-profile",
                        icon: "👤",
                        roles: ["resident"],
                  },
                  {
                        label: "Công tác",
                        path: "/my-duties",
                        icon: "✅",
                        roles: ["resident"],
                  },
                  ...(hasResidentStoreAccess() ? [storeNavigationItem] : []),
                  {
                        label: "Tài chính",
                        path: "/resident/finance",
                        icon: "💰",
                        roles: ["resident"],
                  },
                  {
                        label: "Thông báo",
                        path: "/resident/notifications",
                        icon: "🔔",
                        roles: ["resident"],
                  },
                  {
                        label: "Hoạt động",
                        path: "/resident/activities",
                        icon: "🎯",
                        roles: ["resident"],
                  },
            ],
      },
];
