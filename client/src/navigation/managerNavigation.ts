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
            ],
      },
      {
            label: "Tổ chức lưu xá",
            path: "/organization",
            icon: "🏛️",
            roles: ["manager"],
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
                        label: "Công tác & Hoạt động",
                        path: "/activities",
                        icon: "✅",
                        roles: ["manager"],
                  },
                  {
                        label: "Nội quy & Nhắc nhở",
                        path: "/discipline-rules",
                        icon: "📌",
                        roles: ["manager"],
                  },
            ],
      },
      {
            label: "Báo cáo & Thiết lập",
            icon: "⚙️",
            roles: ["manager"],
            children: [
                  {
                        label: "Báo cáo",
                        path: "/reports",
                        icon: "📈",
                        roles: ["manager"],
                  },
                  {
                        label: "Người dùng & quyền truy cập",
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
                        label: "Gia đình / Liên hệ",
                        path: "/parents",
                        icon: "☎️",
                        roles: ["manager"],
                  },
            ],
      },
      {
            label: "Tổ chức lưu xá",
            icon: "🏛️",
            roles: ["manager"],
            children: [
                  {
                        label: "Nhiệm kỳ",
                        path: "/organization-terms",
                        icon: "📅",
                        roles: ["manager"],
                  },
                  {
                        label: "Chức vụ / Vai trò",
                        path: "/organization-roles",
                        icon: "🎖️",
                        roles: ["manager"],
                  },
                  {
                        label: "Tổ / Ban",
                        path: "/organization-units",
                        icon: "🧩",
                        roles: ["manager"],
                  },
                  {
                        label: "Cơ cấu tổ chức",
                        path: "/organization-structure",
                        icon: "🌳",
                        roles: ["manager"],
                  },
                  {
                        label: "Lịch sử bổ nhiệm",
                        path: "/organization-assignment-history",
                        icon: "🕓",
                        roles: ["manager"],
                        badge: "Sau",
                  },
                  {
                        label: "Báo cáo tổ chức",
                        path: "/organization-reports",
                        icon: "📋",
                        roles: ["manager"],
                        badge: "Sau",
                  },
            ],
      },
      {
            label: "Sinh hoạt & Đời sống",
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
                        label: "Công tác / Trực nhật",
                        path: "/duties",
                        icon: "🧹",
                        roles: ["manager"],
                  },
                  {
                        label: "Phân công thông minh",
                        path: "/smart-assignment",
                        icon: "⚡",
                        roles: ["manager"],
                  },
                  {
                        label: "Phụng vụ",
                        path: "/liturgy-schedule",
                        icon: "⛪",
                        roles: ["manager"],
                  },
                  {
                        label: "Hoạt động",
                        path: "/activity-plans",
                        icon: "🎯",
                        roles: ["manager"],
                  },
                  {
                        label: "Nội quy",
                        path: "/discipline-rules",
                        icon: "📌",
                        roles: ["manager"],
                  },
                  {
                        label: "Vi phạm / Kỷ luật",
                        path: "/discipline-cases",
                        icon: "⚠️",
                        roles: ["manager"],
                  },
                  {
                        label: "Báo cáo sinh hoạt",
                        path: "/daily-life-reports",
                        icon: "📋",
                        roles: ["manager"],
                        badge: "Sau",
                  },
            ],
      },
      {
            label: "Học vụ & Phát triển",
            icon: "📚",
            roles: ["manager"],
            children: [
                  {
                        label: "Kỹ năng",
                        path: "/skills",
                        icon: "🧠",
                        roles: ["manager"],
                  },
                  {
                        label: "Lớp kỹ năng",
                        path: "/skill-classes",
                        icon: "🏫",
                        roles: ["manager"],
                  },
                  {
                        label: "Kết quả học tập",
                        path: "/skill-results",
                        icon: "🏅",
                        roles: ["manager"],
                  },
            ],
      },
      {
            label: "Tài chính",
            icon: "💰",
            roles: ["manager"],
            children: [
                  {
                        label: "Theo dõi phí",
                        path: "/fees",
                        icon: "💳",
                        roles: ["manager"],
                  },
                  {
                        label: "Tổng hợp tài chính",
                        path: "/financial",
                        icon: "📒",
                        roles: ["manager"],
                  },
            ],
      },
      {
            label: "Báo cáo & Thiết lập",
            icon: "⚙️",
            roles: ["manager"],
            children: [
                  {
                        label: "Báo cáo",
                        path: "/reports",
                        icon: "📈",
                        roles: ["manager"],
                  },
                  {
                        label: "Người dùng & quyền truy cập",
                        path: "/users",
                        icon: "🔐",
                        roles: ["manager"],
                  },
                  {
                        label: "Thiết lập ứng dụng",
                        path: "/settings",
                        icon: "🛠️",
                        roles: ["manager"],
                        badge: "Sau",
                  },
                  {
                        label: "Danh mục dùng chung",
                        path: "/common-categories",
                        icon: "🗂️",
                        roles: ["manager"],
                        badge: "Sau",
                  },
            ],
      },
];