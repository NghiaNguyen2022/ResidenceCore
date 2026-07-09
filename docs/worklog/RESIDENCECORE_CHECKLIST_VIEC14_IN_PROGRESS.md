# RESIDENCECORE_CHECKLIST_VIEC14_IN_PROGRESS

## Việc 14 — Hoạt động / Sự kiện lite

### Mục tiêu
Tạo module hoạt động/sự kiện nội bộ ở mức lite để demo full flow App Lưu Xá:

- Manager quản lý hoạt động chung của lưu xá.
- Có danh sách hoạt động.
- Có tạo/sửa/hủy hoạt động.
- Có trạng thái hoạt động.
- Có thể đánh dấu hoạt động công khai để hiển thị cho học viên trên portal.
- UI/UX đơn giản, gọn, không làm quá sâu.

### Không làm trong Việc 14

- Không làm đăng ký tham gia phức tạp.
- Không làm điểm danh sự kiện.
- Không làm duyệt hoạt động nhiều bước.
- Không làm lịch hoạt động nâng cao kiểu calendar lớn.
- Không làm notification nâng cao ngoài scope nếu chưa cần.

---

## Checklist tổng

### 14A — Audit nền hiện có

- [x] Kiểm tra có schema/table hoạt động chưa.
- [x] Kiểm tra có route/page hoạt động chưa.
- [x] Kiểm tra có menu manager/portal liên quan chưa.
- [x] Kiểm tra có service/router hiện có để tái sử dụng không.
- [x] Xác định patch tối thiểu cho demo.

### 14B — Backend lite

- [x] Table/model hoạt động nếu chưa có.
- [x] API list hoạt động cho manager.
- [x] API create hoạt động.
- [x] API update hoạt động.
- [x] API cancel hoạt động.
- [x] API portal list hoạt động công khai.
- [x] Guard manager cho mutation.
- [x] Guard resident portal cho portal list.

### 14C — Manager UI

- [x] Trang Hoạt động/Sự kiện lite.
- [x] Danh sách hoạt động gọn.
- [x] Tạo hoạt động.
- [x] Sửa hoạt động.
- [x] Hủy hoạt động.
- [x] Trạng thái: dự kiến / đã diễn ra / hủy.
- [x] Field công khai portal.
- [x] Style đồng bộ App Lưu Xá.

### 14D — Resident Portal UI

- [x] Menu/route portal nếu cần.
- [x] Học viên xem hoạt động công khai.
- [x] Empty state rõ.
- [x] Không thấy hoạt động nội bộ không công khai.

### 14E — Demo/pass

- [ ] Manager tạo hoạt động công khai.
- [ ] Resident thấy hoạt động trên portal.
- [ ] Manager tạo hoạt động nội bộ.
- [ ] Resident không thấy hoạt động nội bộ.
- [ ] Manager hủy hoạt động.
- [ ] Portal cập nhật trạng thái/ẩn đúng theo rule.
- [ ] pnpm check pass.
- [ ] pnpm test pass.
- [ ] pnpm build pass.

---

## Log append-only

### Start

- Bắt đầu Việc 14 sau khi Việc 13 Thông báo nội bộ lite đã DONE/PASS.
- Phạm vi: Hoạt động / Sự kiện lite, đủ demo, UI/UX đơn giản.

### 14A — Audit + patch lite

- User gửi các file base: `App.tsx`, `ResidenceCareLayout.tsx`, `managerNavigation.ts`, `residentNavigation.ts`, `schema.ts`.
- Audit thấy `App.tsx` đã có route manager `/activities`; `managerNavigation` simple đã trỏ `/activities`; `schema.ts` đã export `./activities`, nhưng cần chuẩn hóa lite để demo hoạt động/sự kiện và portal công khai.
- Patch 14A chuẩn bị đầy đủ một module lite:
  - `drizzle/activities.ts`.
  - `server/db/activities.ts`.
  - `server/services/activityService.ts`.
  - `server/routers/modules/activities.ts`.
  - `client/src/pages/Activities.tsx`.
  - `client/src/pages/ResidentActivities.tsx`.
  - cập nhật `client/src/App.tsx`.
  - cập nhật `client/src/navigation/managerNavigation.ts`.
  - cập nhật `client/src/navigation/residentNavigation.ts`.
- Scope giữ lite: tạo/sửa/hủy/xóa mềm hoạt động, trạng thái, loại hoạt động, thời gian, địa điểm, người/ban phụ trách, mô tả, cờ công khai portal.
- Chưa chốt pass cho đến khi user apply và chạy runtime.
