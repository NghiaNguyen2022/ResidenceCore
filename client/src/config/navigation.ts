export type NavigationItem = {
      label: string;
      path?: string;
      icon: string;
      badge?: string;
      children?: NavigationItem[];
};

export const navigationItems: NavigationItem[] = [
      {
            label: "Dashboard",
            path: "/dashboard",
            icon: "🏠",
      },
      {
            label: "Quản lý lưu trú",
            icon: "👥",
            children: [
                  { label: "Học viên", path: "/members", icon: "👤" },
                  { label: "Phòng ở", path: "/rooms", icon: "🏢" },
                  { label: "Phụ huynh / Gia đình", path: "/parents", icon: "☎️" },
            ],
      },
      {
            label: "Tổ chức lưu xá",
            icon: "🏛️",
            children: [
                  { label: "Cơ cấu tổ chức", path: "/organization-structure", icon: "🌐" },
                  { label: "Nhiệm kỳ / Giai đoạn", path: "/organization-terms", icon: "🕰️" },
                  { label: "Tổ / Ban", path: "/organization-units", icon: "🧩" },
                  { label: "Vai trò / Chức vụ", path: "/organization-roles", icon: "🎖️" },
            ],
      },
      {
            label: "Sinh hoạt & Đời sống",
            icon: "🏡",
            children: [
                  { label: "Lịch sinh hoạt", path: "/daily-routine", icon: "🗓️" },
                  { label: "Điểm danh", path: "/attendance", icon: "📋" },
                  { label: "Công tác / Trực nhật", path: "/duties", icon: "✓" },
                  {
                        label: "Phụng vụ & Cộng đoàn",
                        icon: "⛪",
                        children: [
                              { label: "Lịch phụng vụ", path: "/liturgy-schedule", icon: "🗓️" },
                              { label: "Đi lễ / Kinh tối", path: "/liturgy-attendance", icon: "🙏" },
                              { label: "Phân công phụng vụ", path: "/liturgy-assignments", icon: "📌" },
                        ],
                  },
                  {
                        label: "Hoạt động & Sự kiện",
                        icon: "🎉",
                        children: [
                              { label: "Kế hoạch năm", path: "/activity-plans", icon: "📅" },
                              { label: "Sự kiện", path: "/activities", icon: "🎉" },
                              { label: "Câu lạc bộ", path: "/clubs", icon: "📚" },
                        ],
                  },
                  {
                        label: "Nội quy & Kỷ luật",
                        icon: "🛡️",
                        children: [
                              { label: "Danh mục nội quy", path: "/discipline-rules", icon: "📘" },
                              { label: "Hồ sơ xử lý / Nhắc nhở", path: "/discipline-cases", icon: "⚠️" },
                        ],
                  },
            ],
      },
      {
            label: "Học vụ & Phát triển",
            icon: "🎓",
            children: [
                  { label: "Trường học / Ngành học", path: "/academic-info", icon: "🏫" },
                  { label: "Lịch học", path: "/schedule", icon: "📚" },
                  { label: "Lượng giá học kỳ", path: "/academic-evaluations", icon: "🏅" },
                  {
                        label: "Đào tạo & Kỹ năng",
                        icon: "🎼",
                        children: [
                              { label: "Danh mục kỹ năng", path: "/skills", icon: "🎯" },
                              { label: "Lớp kỹ năng", path: "/skill-classes", icon: "👥" },
                              { label: "Kết quả hoàn thành", path: "/skill-results", icon: "✅" },
                        ],
                  },
            ],
      },
      {
            label: "Tài chính",
            icon: "💵",
            children: [
                  { label: "Tổng quan tài chính", path: "/financial", icon: "📊" },
                  { label: "Phí lưu trú", path: "/fees", icon: "💰" },
            ],
      },
      {
            label: "Báo cáo & Thiết lập",
            icon: "📊",
            children: [
                  { label: "Báo cáo", path: "/reports", icon: "📊" },
                  {
                        label: "Thiết lập hệ thống",
                        icon: "⚙️",
                        children: [
                              {
                                    label: "Thiết lập ứng dụng",
                                    path: "/settings-app",
                                    icon: "🧩",
                                    badge: "soon",
                              },
                              {
                                    label: "Danh mục dùng chung",
                                    path: "/settings-categories",
                                    icon: "🗂️",
                                    badge: "soon",
                              },
                              {
                                    label: "Người dùng & phân quyền",
                                    path: "/settings-users",
                                    icon: "👥",
                                    badge: "soon",
                              },
                              {
                                    label: "Cấu hình thông báo",
                                    path: "/settings-notifications",
                                    icon: "🔔",
                                    badge: "soon",
                              },
                        ],
                  },
            ],
      },
];