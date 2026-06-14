import { ResidentRolePlaceholderPage } from "./ResidentRolePlaceholderPage";

export default function ResidentCommitteeDuties() {
      return (
            <ResidentRolePlaceholderPage
                  title="Công tác của ban"
                  description="Dành cho Trưởng ban theo dõi và phân công công tác trong phạm vi ban mình."
                  scopeTitle="Phạm vi công tác của Ban"
                  features={[
                        {
                              title: "Xem công tác của ban",
                              description: "Theo dõi công tác được giao cho ban và từng thành viên.",
                              status: "ready",
                        },
                        {
                              title: "Phân công trong ban",
                              description: "Tạo phân công cho thành viên trong ban, có kiểm tra lịch học.",
                        },
                        {
                              title: "Theo dõi hoàn thành / vắng",
                              description: "Cập nhật tình trạng công tác trong phạm vi ban.",
                        },
                  ]}
            />
      );
}
