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
                  {
                        label: "Tài chính lưu xá",
                        path: "/finance",
                        icon: "💰",
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
                        icon: "📈",
                        roles: ["manager"],
                        badge: "Sau",
                        disabled: true,
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
                        label: "Tổ chức lưu xá",
                        path: "/organization",
                        icon: "🏛️",
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
                        icon: "☎️",
                        roles: ["manager"],
                        badge: "Sau",
                        disabled: true,
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
                        icon: "⚡",
                        roles: ["manager"],
                        badge: "Sau",
                        disabled: true,
                  },
                  {
                        label: "Phụng vụ",
                        icon: "⛪",
                        roles: ["manager"],
                        badge: "Sau",
                        disabled: true,
                  },
                  {
                        label: "Hoạt động",
                        icon: "🎯",
                        roles: ["manager"],
                        badge: "Sau",
                        disabled: true,
                  },
                  {
                        label: "Nội quy",
                        path: "/discipline-rules",
                        icon: "📌",
                        roles: ["manager"],
                  },
                  {
                        label: "Vi phạm / Kỷ luật",
                        icon: "⚠️",
                        roles: ["manager"],
                        badge: "Sau",
                        disabled: true,
                  },
                  {
                        label: "Báo cáo sinh hoạt",
                        icon: "📋",
                        roles: ["manager"],
                        badge: "Sau",
                        disabled: true,
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
                        icon: "🧠",
                        roles: ["manager"],
                        badge: "Sau",
                        disabled: true,
                  },
                  {
                        label: "Lớp kỹ năng",
                        icon: "🏫",
                        roles: ["manager"],
                        badge: "Sau",
                        disabled: true,
                  },
                  {
                        label: "Kết quả học tập",
                        icon: "🏅",
                        roles: ["manager"],
                        badge: "Sau",
                        disabled: true,
                  },
            ],
      },
      {
            label: "Tài chính",
            icon: "💰",
            roles: ["manager"],
            children: [
                  {
                        label: "Tài chính lưu xá",
                        path: "/finance",
                        icon: "💰",
                        roles: ["manager"],
                  },
                  {
                        label: "Theo dõi phí nâng cao",
                        icon: "💳",
                        roles: ["manager"],
                        badge: "Sau",
                        disabled: true,
                  },
                  {
                        label: "Tổng hợp tài chính",
                        icon: "📒",
                        roles: ["manager"],
                        badge: "Sau",
                        disabled: true,
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
                        icon: "📈",
                        roles: ["manager"],
                        badge: "Sau",
                        disabled: true,
                  },
                  {
                        label: "Người dùng & quyền truy cập",
                        path: "/settings/users",
                        icon: "🔐",
                        roles: ["manager"],
                  },
                  {
                        label: "Thiết lập ứng dụng",
                        icon: "🛠️",
                        roles: ["manager"],
                        badge: "Sau",
                        disabled: true,
                  },
                  {
                        label: "Danh mục dùng chung",
                        icon: "🗂️",
                        roles: ["manager"],
                        badge: "Sau",
                        disabled: true,
                  },
            ],
      },
];