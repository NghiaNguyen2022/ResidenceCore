export type AppRole =
      | "manager"
      | "resident"
      | "team_leader"
      | "committee_head"
      | "house_leader"
      | "deputy"
      | "secretary"
      | "treasurer";

export type NavigationItem = {
      label: string;
      path?: string;
      icon: string;
      badge?: string;
      roles?: AppRole[];
      children?: NavigationItem[];
};

/**
 * Simple Mode — menu gọn cho quản lý.
 *
 * Nguyên tắc:
 * - Ít nhóm.
 * - Ít submenu.
 * - Không đưa cấu hình sâu ra ngoài.
 * - Điểm danh không là menu riêng; gắn vào Lịch sinh hoạt hoặc Công tác trong UI.
 */
export const simpleManagerNavigation: NavigationItem[] = [
      {
            label: "Tổng quan",
            path: "/dashboard",
            icon: "🏠",
            roles: ["manager"],
      },
      {
            label: "Quản lý học viên",
            icon: "👥",
            roles: ["manager"],
            children: [
                  {
                        label: "Học viên",
                        path: "/members",
                        icon: "👤",
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
                        label: "Lịch sinh hoạt",
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
                        label: "Phụng vụ & Hoạt động",
                        path: "/activities",
                        icon: "🕊️",
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
            label: "Học tập",
            icon: "📚",
            roles: ["manager"],
            children: [
                  {
                        label: "Trường / Lịch học",
                        path: "/schedule",
                        icon: "🎓",
                        roles: ["manager"],
                  },
                  {
                        label: "Kỹ năng",
                        path: "/skills",
                        icon: "🌱",
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
                        label: "Phí lưu trú",
                        path: "/fees",
                        icon: "💳",
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
                        icon: "📊",
                        roles: ["manager"],
                  },
                  {
                        label: "Người dùng",
                        path: "/settings/users",
                        icon: "👥",
                        roles: ["manager"],
                  },
                  {
                        label: "Cấu hình",
                        path: "/settings-app",
                        icon: "🧩",
                        roles: ["manager"],
                  },
            ],
      },
];

/**
 * Detailed Mode — giữ đầy đủ menu quản trị chi tiết.
 *
 * Menu này lấy lại tinh thần menu hiện có, nhưng:
 * - bỏ role cũ admin/supervisor/accountant
 * - sửa route Người dùng về /settings/users
 * - bỏ badge soon ở Người dùng
 */
export const detailedManagerNavigation: NavigationItem[] = [
      {
            label: "Dashboard",
            path: "/dashboard",
            icon: "🏠",
            roles: ["manager"],
      },
      {
            label: "Quản lý lưu trú",
            icon: "👥",
            roles: ["manager"],
            children: [
                  {
                        label: "Học viên",
                        path: "/members",
                        icon: "👤",
                        roles: ["manager"],
                  },
                  {
                        label: "Phòng ở",
                        path: "/rooms",
                        icon: "🏢",
                        roles: ["manager"],
                  },
                  {
                        label: "Phụ huynh / Gia đình",
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
                        label: "Cơ cấu tổ chức",
                        path: "/organization-structure",
                        icon: "🌐",
                        roles: ["manager"],
                  },
                  {
                        label: "Nhiệm kỳ / Giai đoạn",
                        path: "/organization-terms",
                        icon: "🕰️",
                        roles: ["manager"],
                  },
                  {
                        label: "Tổ / Ban",
                        path: "/organization-units",
                        icon: "🧩",
                        roles: ["manager"],
                  },
                  {
                        label: "Vai trò / Chức vụ",
                        path: "/organization-roles",
                        icon: "🎖️",
                        roles: ["manager"],
                  },
            ],
      },
      {
            label: "Sinh hoạt & Đời sống",
            icon: "🏡",
            roles: ["manager"],
            children: [
                  {
                        label: "Lịch sinh hoạt",
                        path: "/daily-routine",
                        icon: "🗓️",
                        roles: ["manager"],
                  },
                  {
                        label: "Điểm danh",
                        path: "/attendance",
                        icon: "📋",
                        roles: ["manager"],
                  },
                  {
                        label: "Công tác / Trực nhật",
                        path: "/duties",
                        icon: "✓",
                        roles: ["manager"],
                  },
                  {
                        label: "Phụng vụ & Cộng đoàn",
                        icon: "⛪",
                        roles: ["manager"],
                        children: [
                              {
                                    label: "Lịch phụng vụ",
                                    path: "/liturgy-schedule",
                                    icon: "🗓️",
                                    roles: ["manager"],
                              },
                              {
                                    label: "Đi lễ / Kinh tối",
                                    path: "/liturgy-attendance",
                                    icon: "🙏",
                                    roles: ["manager"],
                              },
                              {
                                    label: "Phân công phụng vụ",
                                    path: "/liturgy-assignments",
                                    icon: "📌",
                                    roles: ["manager"],
                              },
                        ],
                  },
                  {
                        label: "Hoạt động & Sự kiện",
                        icon: "🎉",
                        roles: ["manager"],
                        children: [
                              {
                                    label: "Kế hoạch năm",
                                    path: "/activity-plans",
                                    icon: "📅",
                                    roles: ["manager"],
                              },
                              {
                                    label: "Sự kiện",
                                    path: "/activities",
                                    icon: "🎉",
                                    roles: ["manager"],
                              },
                              {
                                    label: "Câu lạc bộ",
                                    path: "/clubs",
                                    icon: "📚",
                                    roles: ["manager"],
                              },
                        ],
                  },
                  {
                        label: "Nội quy & Kỷ luật",
                        icon: "🛡️",
                        roles: ["manager"],
                        children: [
                              {
                                    label: "Danh mục nội quy",
                                    path: "/discipline-rules",
                                    icon: "📘",
                                    roles: ["manager"],
                              },
                              {
                                    label: "Hồ sơ xử lý / Nhắc nhở",
                                    path: "/discipline-cases",
                                    icon: "⚠️",
                                    roles: ["manager"],
                              },
                        ],
                  },
            ],
      },
      {
            label: "Học vụ & Phát triển",
            icon: "🎓",
            roles: ["manager"],
            children: [
                  {
                        label: "Trường học / Ngành học",
                        path: "/academic-info",
                        icon: "🏫",
                        roles: ["manager"],
                  },
                  {
                        label: "Lịch học",
                        path: "/schedule",
                        icon: "📚",
                        roles: ["manager"],
                  },
                  {
                        label: "Lượng giá học kỳ",
                        path: "/academic-evaluations",
                        icon: "🏅",
                        roles: ["manager"],
                  },
                  {
                        label: "Đào tạo & Kỹ năng",
                        icon: "🎼",
                        roles: ["manager"],
                        children: [
                              {
                                    label: "Danh mục kỹ năng",
                                    path: "/skills",
                                    icon: "🎯",
                                    roles: ["manager"],
                              },
                              {
                                    label: "Lớp kỹ năng",
                                    path: "/skill-classes",
                                    icon: "👥",
                                    roles: ["manager"],
                              },
                              {
                                    label: "Kết quả hoàn thành",
                                    path: "/skill-results",
                                    icon: "✅",
                                    roles: ["manager"],
                              },
                        ],
                  },
            ],
      },
      {
            label: "Tài chính",
            icon: "💵",
            roles: ["manager"],
            children: [
                  {
                        label: "Tổng quan tài chính",
                        path: "/financial",
                        icon: "📊",
                        roles: ["manager"],
                  },
                  {
                        label: "Phí lưu trú",
                        path: "/fees",
                        icon: "💰",
                        roles: ["manager"],
                  },
            ],
      },
      {
            label: "Báo cáo & Thiết lập",
            icon: "📊",
            roles: ["manager"],
            children: [
                  {
                        label: "Báo cáo",
                        path: "/reports",
                        icon: "📊",
                        roles: ["manager"],
                  },
                  {
                        label: "Thiết lập hệ thống",
                        icon: "⚙️",
                        roles: ["manager"],
                        children: [
                              {
                                    label: "Thiết lập ứng dụng",
                                    path: "/settings-app",
                                    icon: "🧩",
                                    roles: ["manager"],
                              },
                              {
                                    label: "Danh mục dùng chung",
                                    path: "/settings-categories",
                                    icon: "🗂️",
                                    roles: ["manager"],
                              },
                              {
                                    label: "Người dùng & phân quyền",
                                    path: "/settings/users",
                                    icon: "👥",
                                    roles: ["manager"],
                              },
                              {
                                    label: "Cấu hình thông báo",
                                    path: "/settings-notifications",
                                    icon: "🔔",
                                    roles: ["manager"],
                              },
                        ],
                  },
            ],
      },
];

/**
 * Resident Simple Menu.
 *
 * Đây là menu cho học viên, bám SimpleModel:
 * - Hôm nay của tôi
 * - Công tác của tôi
 * - Lịch sinh hoạt
 * - Lịch học
 * - Phụng vụ
 * - Thông báo
 * - Nội quy
 */
export const residentNavigation: NavigationItem[] = [
      {
            label: "Trang của tôi",
            icon: "🌤️",
            roles: ["resident"],
            children: [
                  {
                        label: "Hôm nay của tôi",
                        path: "/my-today",
                        icon: "📌",
                        roles: ["resident"],
                  },
                  {
                        label: "Công tác của tôi",
                        path: "/my-duties",
                        icon: "✅",
                        roles: ["resident"],
                  },
                  {
                        label: "Lịch sinh hoạt",
                        path: "/daily-routine",
                        icon: "🕘",
                        roles: ["resident"],
                  },
                  {
                        label: "Lịch học",
                        path: "/schedule",
                        icon: "📚",
                        roles: ["resident"],
                  },
                  {
                        label: "Phụng vụ",
                        path: "/liturgy-schedule",
                        icon: "🕊️",
                        roles: ["resident"],
                  },
                  {
                        label: "Thông báo",
                        path: "/notifications",
                        icon: "🔔",
                        roles: ["resident"],
                  },
                  {
                        label: "Nội quy",
                        path: "/discipline-rules",
                        icon: "📌",
                        roles: ["resident"],
                  },
            ],
      },
];

/**
 * Menu bổ sung cho học viên có chức danh bổ nhiệm.
 *
 * Không cho các role bổ nhiệm thấy menu quản lý đầy đủ.
 * Chỉ thêm nhóm "Phụ trách".
 */
export const appointmentNavigation: NavigationItem[] = [
      {
            label: "Phụ trách",
            icon: "🧭",
            roles: [
                  "team_leader",
                  "committee_head",
                  "house_leader",
                  "deputy",
                  "secretary",
                  "treasurer",
            ],
            children: [
                  {
                        label: "Công tác nhóm tôi",
                        path: "/group-duties",
                        icon: "✅",
                        roles: [
                              "team_leader",
                              "committee_head",
                              "house_leader",
                              "deputy",
                              "secretary",
                              "treasurer",
                        ],
                  },
                  {
                        label: "Điểm danh nhóm",
                        path: "/group-attendance",
                        icon: "📋",
                        roles: [
                              "team_leader",
                              "committee_head",
                              "house_leader",
                              "deputy",
                              "secretary",
                              "treasurer",
                        ],
                  },
            ],
      },
];

/**
 * Tạm thời dùng Simple Manager menu làm mặc định.
 *
 * Bước kế tiếp sẽ sửa ResidenceCareLayout để chọn:
 * - manager + simple    => simpleManagerNavigation
 * - manager + detailed  => detailedManagerNavigation
 * - resident            => residentNavigation
 * - appointment roles   => residentNavigation + appointmentNavigation
 */
export const navigationItems: NavigationItem[] = simpleManagerNavigation;