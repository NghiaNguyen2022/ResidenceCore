import { ResidentRolePlaceholderPage } from "./ResidentRolePlaceholderPage";

export default function ResidentLeadershipOverview() {
      return (
            <ResidentRolePlaceholderPage
                  title="Tổng quan điều hành"
                  description="Dành cho Trưởng, Phó, Thư ký, Thủ quỹ để theo dõi nhanh tình hình sinh hoạt và công tác."
                  scopeTitle="Phạm vi điều hành"
                  features={[
                        {
                              title: "Tổng quan hôm nay",
                              description: "Số công tác trong ngày, số chưa hoàn thành, số vắng hoặc đã hủy.",
                              status: "ready",
                        },
                        {
                              title: "Việc cần chú ý",
                              description: "Danh sách các công tác quá hạn hoặc cần điều phối lại.",
                        },
                        {
                              title: "Thông tin nhanh về tổ / ban",
                              description: "Tổng hợp đơn vị đang hoạt động và người phụ trách.",
                        },
                  ]}
            />
      );
}
