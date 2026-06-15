import { ResidentRoleDutiesScopePage } from "./ResidentRoleDutiesScopePage";

export default function ResidentTeamDuties() {
      return (
            <ResidentRoleDutiesScopePage
                  kind="team"
                  title="Công tác tổ"
                  description="Dành cho Tổ trưởng theo dõi các công tác được giao cho tổ mình phụ trách."
                  emptyTitle="Bạn chưa phụ trách Tổ nào"
                  emptyDescription="Trang này sẽ có dữ liệu khi bạn được bổ nhiệm làm Tổ trưởng trong nhiệm kỳ hiện tại."
            />
      );
}
