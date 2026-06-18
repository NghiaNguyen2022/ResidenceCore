import type { NavigationItem } from "./types";

export const simpleManagerNavigation: NavigationItem[] = [
      {
            label: "Dashboard",
            path: "/dashboard",
            icon: "📊",
            roles: ["manager"],
      },
      {
            label: "Quản lý lưu trú",
            icon: "🏠",
            roles: ["manager"],
            children: [
                  {
                        label: "Học viên",
                        path: "/members",
                        icon: "👥",
                        roles: ["manager"],
                  },
                  {
                        label: "Tổ chức lưu xá",
                        path: "/organization",
                        icon: "🏛️",
                        roles: ["manager"],
                  },
            ],
      },
      {
            label: "Sinh hoạt",
            icon: "🌿",
            roles: ["manager"],
            children: [
                  {
                        label: "Sinh hoạt hằng ngày",
                        path: "/daily-routine",
                        icon: "🕘",
                        roles: ["manager"],
                  },
                  {
                        label: "Công tác",
                        path: "/duties",
                        icon: "✅",
                        roles: ["manager"],
                  },
                  {
                        label: "Hoạt động",
                        path: "/activities",
                        icon: "🎯",
                        roles: ["manager"],
                  },
                  {
                        label: "Nội quy",
                        path: "/discipline-rules",
                        icon: "📌",
                        roles: ["manager"],
                  },
            ],
      },
      {
            label: "Thiết lập",
            icon: "⚙️",
            roles: ["manager"],
            children: [
                  {
                        label: "Người dùng",
                        path: "/settings/users",
                        icon: "🔐",
                        roles: ["manager"],
                  },
            ],
      },
];

export const detailedManagerNavigation: NavigationItem[] = [
      {
            label: "Dashboard",
            path: "/dashboard",
            icon: "📊",
            roles: ["manager"],
      },
      {
            label: "Quản lý lưu trú",
            icon: "🏠",
            roles: ["manager"],
            children: [
                  {
                        label: "Học viên",
                        path: "/members",
                        icon: "👥",
                        roles: ["manager"],
                  },
                  {
                        label: "Phòng ở",
                        path: "/rooms",
                        icon: "🚪",
                        roles: ["manager"],
                  },
                  {
                        label: "Tổ chức lưu xá",
                        path: "/organization",
                        icon: "🏛️",
                        roles: ["manager"],
                  },
            ],
      },
      {
            label: "Sinh hoạt & đời sống",
            icon: "🌿",
            roles: ["manager"],
            children: [
                  {
                        label: "Lịch sinh hoạt",
                        path: "/daily-routine",
                        icon: "🕘",
                        roles: ["manager"],
                  },
                  {
                        label: "Công tác / trực nhật",
                        path: "/duties",
                        icon: "✅",
                        roles: ["manager"],
                  },
                  {
                        label: "Hoạt động",
                        path: "/activities",
                        icon: "🎯",
                        roles: ["manager"],
                  },
                  {
                        label: "Nội quy",
                        path: "/discipline-rules",
                        icon: "📌",
                        roles: ["manager"],
                  },
            ],
      },
      {
            label: "Báo cáo & thiết lập",
            icon: "⚙️",
            roles: ["manager"],
            children: [
                  {
                        label: "Người dùng",
                        path: "/settings/users",
                        icon: "🔐",
                        roles: ["manager"],
                  },
            ],
      },
];
