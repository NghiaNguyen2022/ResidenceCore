# PROJECT_SUMMARY_VIEC14_STATUS_APPEND

> Append-only. Không ghi đè lịch sử cũ. Dùng để chép thêm vào PROJECT_SUMMARY.md.

## Việc 14 — Hoạt động / Sự kiện lite — START

Sau khi Việc 13 — Thông báo nội bộ lite đã DONE/PASS, chuyển sang Việc 14 để bổ sung module hoạt động/sự kiện ở mức lite phục vụ demo full flow.

### Mục tiêu nghiệp vụ

- Quản lý các hoạt động chung của lưu xá.
- Manager có thể tạo/sửa/hủy hoạt động.
- Hoạt động có trạng thái rõ: dự kiến / đã diễn ra / hủy.
- Có thể đánh dấu hoạt động công khai để hiển thị cho học viên trên Resident Portal.
- Giữ UI/UX đơn giản, không biến thành module sự kiện phức tạp.

### Scope lite

Fields đề xuất:

- Tên hoạt động.
- Ngày/giờ bắt đầu.
- Ngày/giờ kết thúc nếu cần.
- Địa điểm.
- Người/ban phụ trách nếu có dữ liệu phù hợp.
- Mô tả/ghi chú ngắn.
- Trạng thái.
- Công khai trên portal hay không.

### Không làm ở Việc 14

- Không làm đăng ký tham gia.
- Không làm điểm danh sự kiện.
- Không làm duyệt nhiều cấp.
- Không làm notification nâng cao nếu chưa cần.
- Không làm calendar nâng cao.

### Bước tiếp theo

14A — Audit file/schema hiện có để quyết định patch tối thiểu.

---

## Việc 14A — Audit + patch Hoạt động/Sự kiện lite

### File base user gửi

- `client/src/App.tsx`.
- `client/src/components/ResidenceCareLayout.tsx`.
- `client/src/navigation/managerNavigation.ts`.
- `client/src/navigation/residentNavigation.ts`.
- `drizzle/schema.ts`.

### Kết quả audit

- App đã có route manager `/activities`.
- Manager simple navigation đã có entry `/activities` nhưng label còn gộp “Công tác & Hoạt động”.
- Detailed navigation vẫn để Hoạt động disabled, cần bật lại cho demo.
- Resident portal chưa có route/menu hoạt động công khai.
- `schema.ts` đã `export * from "./activities"`, phù hợp để bổ sung/chuẩn hóa file `drizzle/activities.ts`.

### Patch 14A

Tạo/chuẩn hóa module lite với các file:

- `drizzle/activities.ts`: table `activities`, `activityParticipants`, field `isPublicOnPortal`.
- `server/db/activities.ts`: DB functions list/create/update/cancel/delete mềm/public list/stats.
- `server/services/activityService.ts`: validate mã, ngày, giờ HH:mm, time range, public flag.
- `server/routers/modules/activities.ts`: tRPC router `activities` với guard manager cho quản trị và `listPublic` cho portal.
- `client/src/pages/Activities.tsx`: manager UI gọn, professional, có create/edit/cancel/delete/filter.
- `client/src/pages/ResidentActivities.tsx`: portal UI chỉ hiển thị hoạt động công khai.
- `client/src/App.tsx`: thêm route `/resident/activities`.
- `client/src/navigation/managerNavigation.ts`: label “Hoạt động / Sự kiện”, bật ở detailed mode.
- `client/src/navigation/residentNavigation.ts`: thêm menu “Hoạt động” trong portal.

### Ghi chú kỹ thuật

- Không làm realtime/notification nâng cao trong 14A.
- Không làm đăng ký tham gia/điểm danh nâng cao, dù schema có `activityParticipants` để mở rộng sau.
- Date dùng `FormDateInput`; time dùng `TimePickerInput`, giữ rule picker.
- Nếu root tRPC router chưa register `activitiesRouter`, cần import/register `activities: activitiesRouter` ở root router hiện tại của repo.

### Trạng thái

- 14A patch đã chuẩn bị.
- Chờ user apply và chạy `pnpm check`, `pnpm test`, `pnpm build` + runtime test để xác nhận pass.
