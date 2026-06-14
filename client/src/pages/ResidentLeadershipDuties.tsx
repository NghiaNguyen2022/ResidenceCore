import { ResidentRolePlaceholderPage } from "./ResidentRolePlaceholderPage";

export default function ResidentLeadershipDuties() {
      return (
            <ResidentRolePlaceholderPage
                  title="Công tác & phân công"
                  description="Dành cho nhóm điều hành theo dõi và điều phối công tác trong phạm vi toàn lưu xá."
                  scopeTitle="Phạm vi công tác toàn lưu xá"
                  features={[
                        {
                              title: "Xem công tác hôm nay",
                              description: "Theo dõi công tác theo ngày, tuần, tháng và trạng thái hoàn thành.",
                              status: "ready",
                        },
                        {
                              title: "Phân công công tác",
                              description: "Tạo phân công cho học viên, phòng, tổ hoặc ban; có kiểm tra lịch học.",
                              status: "ready",
                        },
                        {
                              title: "Theo dõi vắng / chưa hoàn thành",
                              description: "Tổng hợp các công tác cần điều phối lại.",
                        },
                  ]}
            />
      );
}
