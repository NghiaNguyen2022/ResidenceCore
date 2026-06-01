import { ModulePlaceholderPage } from "@/components/module/ModulePlaceholderPage";

export default function AdminSettings() {
  return (
    <ModulePlaceholderPage
      title="Quản trị hệ thống"
      subtitle="Quản lý cấu hình hệ thống, người dùng, phân quyền, danh mục dùng chung và các thiết lập vận hành."
      moduleGroup="Quản trị hệ thống"
      dataStatus="mock"
      checklistItems={[
        "Quản lý người dùng",
        "Quản lý vai trò và phân quyền",
        "Cấu hình danh mục dùng chung",
        "Cấu hình năm học, học kỳ, loại phí, thông báo",
        "Theo dõi nhật ký hệ thống",
      ]}
      backendMapping={[
        "RBAC hiện tại đang ở trạng thái simplified",
        "Có users/sessions trong schema",
        "Cần thiết kế phân quyền thật sau khi UI core ổn định",
        "Có thể liên kết với notifications và system logs sau này",
      ]}
      mockCards={[
        {
          label: "Người dùng",
          value: 0,
          description: "Chưa connect data",
        },
        {
          label: "Vai trò",
          value: 0,
          description: "Chưa connect data",
        },
        {
          label: "Cấu hình",
          value: 0,
          description: "Chưa connect data",
        },
      ]}
      mockColumns={[
        { label: "Nhóm cấu hình", key: "group" },
        { label: "Mục", key: "item" },
        { label: "Trạng thái", key: "status" },
      ]}
      mockRows={[
        {
          group: "Người dùng",
          item: "Tài khoản & phân quyền",
          status: "Backlog",
        },
        {
          group: "Danh mục",
          item: "Loại phí, loại hoạt động, loại kỹ năng",
          status: "Backlog",
        },
      ]}
    />
  );
}