import type { NavigationItem } from "./types";

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
