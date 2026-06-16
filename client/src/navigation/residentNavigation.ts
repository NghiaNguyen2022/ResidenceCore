import type { NavigationItem } from "./types";

export const residentNavigation: NavigationItem[] = [
      {
            label: "Hôm nay",
            path: "/resident/today",
            icon: "📅",
            roles: ["resident"],
      },
      {
            label: "Hồ sơ",
            path: "/my-profile",
            icon: "👤",
            roles: ["resident"],
      },
      {
            label: "Lưu xá",
            icon: "🏠",
            roles: ["resident"],
            children: [
                  {
                        label: "Thông tin chung",
                        path: "/resident/information",
                        icon: "ℹ️",
                        roles: ["resident"],
                  },
                  {
                        label: "Nội quy & nhắc nhở",
                        path: "/resident/rules",
                        icon: "📌",
                        roles: ["resident"],
                  },
                  {
                        label: "Tài chính",
                        path: "/resident/finance",
                        icon: "💰",
                        roles: ["resident"],
                  },
            ],
      },
];
