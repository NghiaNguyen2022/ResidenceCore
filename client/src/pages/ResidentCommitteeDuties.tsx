import { ResidentRoleDutiesScopePage } from "./ResidentRoleDutiesScopePage";

export default function ResidentCommitteeDuties() {
      return (
            <ResidentRoleDutiesScopePage
                  kind="committee"
                  title="Công tác ban"
                  description="Dành cho Trưởng ban theo dõi các công tác được giao cho ban mình phụ trách."
                  emptyTitle="Bạn chưa phụ trách Ban nào"
                  emptyDescription="Trang này sẽ có dữ liệu khi bạn được bổ nhiệm làm Trưởng ban trong nhiệm kỳ hiện tại."
            />
      );
}
