import type { NavigationItem } from "./types";

export const residentNavigation: NavigationItem[] = [
      {
            label: "Hồ sơ của tôi",
            path: "/my-profile",
            icon: "👤",
            roles: ["resident"],
      },
      {
            label: "Hôm nay",
            path: "/resident/today",
            icon: "📅",
            roles: ["resident"],
      },
      {
            label: "Thông tin lưu xá",
            path: "/resident/information",
            icon: "🏠",
            roles: ["resident"],
            badge: "Sau",
            disabled: true,
      },
      {
            label: "Tài chính của tôi",
            path: "/resident/finance",
            icon: "💰",
            roles: ["resident"],
            badge: "Sau",
            disabled: true,
      },
];
