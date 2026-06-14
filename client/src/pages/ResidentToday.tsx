import { ResidentRolePlaceholderPage } from "./ResidentRolePlaceholderPage";

export default function ResidentToday() {
      return (
            <ResidentRolePlaceholderPage
                  title="Hôm nay"
                  description="Tổng hợp nhanh lịch học, công tác và nhắc nhở trong ngày của học viên."
                  scopeTitle="Nội dung hôm nay của tôi"
                  features={[
                        {
                              title: "Lịch học hôm nay",
                              description: "Hiển thị khung giờ học, môn học, địa điểm và ghi chú.",
                              status: "ready",
                        },
                        {
                              title: "Công tác hôm nay",
                              description: "Hiển thị các công tác được phân công cho học viên trong ngày.",
                              status: "ready",
                        },
                        {
                              title: "Nhắc nhở / nội quy cần chú ý",
                              description: "Hiển thị các nhắc nhở quan trọng trong lưu xá.",
                        },
                  ]}
            />
      );
}
