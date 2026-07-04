## Việc 11E - Restore tab Học tập theo layout 11B

Trạng thái: Patch chuẩn bị, chờ user apply/test.

Lý do: Việc 11D làm tab Học tập chưa đúng cảm giác layout mà user muốn. User yêu cầu tab Học tập design giống bản Việc 11B.

Nội dung patch:
- Giữ `MemberDetailModal.tsx` bản hiện tại đã sửa lỗi JSX.
- Khôi phục riêng style/description/grid của tab Học tập theo Việc 11B.
- Khôi phục `StudyScheduleSection.tsx` theo bản 11B để lịch học có wrapper/toolbar/scroll như thiết kế đã được user thích hơn.
- Không đổi API/backend/business logic.

Test cần chạy:
- pnpm check
- pnpm test
- pnpm build
- Runtime: mở Member Detail > tab Học tập; thêm/sửa/xóa lịch học; kiểm tra lịch tuần/tháng không kéo ngang toàn modal.
