# Việc 11D — Member Detail UX Polish v2

## Mục tiêu
Chuẩn hóa lại các tab con trong `MemberDetailModal` theo hướng gọn, hài hòa, đầy đủ nghiệp vụ và không làm tab Học tập bị revert về layout cũ.

## Phạm vi
- `client/src/components/members/MemberDetailModal.tsx`
- `client/src/components/members/EducationInfoSection.tsx`
- `client/src/components/members/StudyScheduleSection.tsx`

## Đã chỉnh
- Thêm `TabPanel` shell dùng chung cho các tab: Tổng quan, Liên hệ, Phòng ở, Học tập, Tổ chức, Tài khoản.
- Tab rail chuyển sang wrap, không ép min-width kéo ngang.
- Tab Học tập giữ bố cục 2 cột: thông tin học tập bên trái, lịch học bên phải.
- `StudyScheduleSection` bỏ wrapper `AppSection` cũ để tránh cảm giác revert/khung lồng không đồng nhất.
- Lịch học có shell riêng, toolbar gọn hơn, lịch tuần giảm min-width còn 640px để hạn chế kéo modal ngang.
- `EducationInfoSection` đổi về card nhẹ, đồng tone với các tab còn lại.
- Không đổi API, không đổi nghiệp vụ, không đổi validate lịch học.

## Test sau khi apply
- [ ] `pnpm check`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] Mở Member Detail không lỗi JSX.
- [ ] Chuyển đủ 6 tab không lỗi.
- [ ] Tab Học tập không bị revert kiểu cũ.
- [ ] Tab Học tập không kéo ngang toàn modal.
- [ ] Lịch tuần chỉ scroll trong khung lịch khi cần.
- [ ] Thêm/sửa/xóa lịch học vẫn hoạt động.
- [ ] Các tab khác nhìn cùng hệ thống layout/header/card.
