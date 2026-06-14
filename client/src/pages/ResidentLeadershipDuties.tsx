import { ResidentRoleDutiesScopePage } from "./ResidentRoleDutiesScopePage";

export default function ResidentLeadershipDuties() {
      return (
            <ResidentRoleDutiesScopePage
                  kind="executive"
                  title="Công tác & phân công"
                  description="Dành cho nhóm điều hành theo dõi công tác trong phạm vi toàn lưu xá theo ngày, tuần hoặc tháng."
                  emptyTitle="Bạn chưa có quyền điều hành công tác"
                  emptyDescription="Menu này sẽ có dữ liệu khi học viên đang giữ vai trò Trưởng, Phó, Thư ký hoặc Thủ quỹ trong nhiệm kỳ hiện tại."
            />
      );
}
