import { ResidentRoleDutiesScopePage } from "./ResidentRoleDutiesScopePage";

export default function ResidentLeadershipDuties() {
      return (
            <ResidentRoleDutiesScopePage
                  kind="executive"
                  title="Công tác điều hành"
                  description="Dành cho Trưởng, Phó, Thư ký, Thủ quỹ theo dõi công tác trong phạm vi toàn lưu xá."
                  emptyTitle="Bạn chưa có phạm vi điều hành"
                  emptyDescription="Trang này sẽ có dữ liệu khi bạn đang giữ vai trò điều hành trong nhiệm kỳ hiện tại."
            />
      );
}
