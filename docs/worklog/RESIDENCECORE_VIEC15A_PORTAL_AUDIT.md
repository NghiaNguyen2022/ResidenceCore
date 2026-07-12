# ResidenceCore — Việc 15A Portal học viên audit

## Mục tiêu
Audit nhanh portal học viên sau các việc 12–14 để chuẩn bị gom trải nghiệm học viên.

## File base đã nhận
- `ResidentTeamMembers.zip` gồm các trang portal học viên hiện có.
- `MyDuties.tsx`
- `residentNavigation.ts`
- `appointedResidentNavigation.ts`
- `ResidenceCareLayout.tsx`
- `residentPortal.ts`
- `residentPortalService.ts`
- `residentPortalAccessService.ts`

## Kết quả audit
Portal đã có nền khá đầy đủ:
- `/resident/today`: tổng quan hôm nay, lịch học, công tác.
- `/resident/information`: thông tin chung.
- `/resident/finance`: tài chính học viên.
- `/resident/notifications`: thông báo.
- `/resident/activities`: đã có menu ở `residentNavigation.ts` và trang `ResidentActivities.tsx` trong bộ file portal.
- Vai trò Tổ trưởng/Trưởng ban đã có nhóm navigation riêng.

## Demo blocker phát hiện
`residentNavigation.ts` đã có menu **Hoạt động** trỏ `/resident/activities`, nhưng `App.tsx` hiện chưa đăng ký lazy import/route cho `ResidentActivities`.

Hệ quả:
- Học viên bấm menu Hoạt động có thể vào NotFound hoặc không mở được trang.
- Việc 14 đã tạo public activities nhưng portal chưa chắc truy cập được route.

## Patch 15A
Chỉ bổ sung route portal hoạt động:
- Thêm lazy import `ResidentActivities`.
- Thêm route `/resident/activities`.

Không đổi:
- API/backend/schema.
- Navigation logic.
- Notification popup/badge.
- Role scope Tổ/Ban.
