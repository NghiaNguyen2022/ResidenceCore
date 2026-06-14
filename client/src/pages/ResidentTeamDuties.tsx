import { ResidentRolePlaceholderPage } from "./ResidentRolePlaceholderPage";

export default function ResidentTeamDuties() {
      return (
            <ResidentRolePlaceholderPage
                  title="Công tác của tổ"
                  description="Dành cho Tổ trưởng theo dõi và phân công công tác trong phạm vi tổ mình."
                  scopeTitle="Phạm vi công tác của Tổ"
                  features={[
                        {
                              title: "Xem công tác của tổ",
                              description: "Theo dõi công tác được giao cho tổ và từng thành viên.",
                              status: "ready",
                        },
                        {
                              title: "Phân công trong tổ",
                              description: "Tạo phân công cho thành viên trong tổ, có kiểm tra lịch học.",
                        },
                        {
                              title: "Theo dõi hoàn thành / vắng",
                              description: "Cập nhật tình trạng công tác trong phạm vi tổ.",
                        },
                  ]}
            />
      );
}
