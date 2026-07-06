# ResidenceCore / App Lưu Xá — Checklist Việc 12

Ngày cập nhật: 2026-07-04

## Việc 12 — Organization + Công tác + Portal theo chức vụ

### Mục tiêu demo

Demo được luồng xuyên suốt:

```txt
Tạo Tổ/Ban
→ Thêm học viên vào Tổ/Ban
→ Bổ nhiệm chức vụ
→ Phân công công tác theo học viên/phòng/tổ/ban
→ Học viên thường xem công tác của mình
→ Học viên có chức vụ xem đúng phạm vi phụ trách
```

### Trạng thái file

Đã nhận bộ file hiện tại cho Việc 12. Từ bước này, nếu user không nói có chỉnh thêm, dùng bộ file này làm base hiện tại và không hỏi lại.

#### Frontend

```txt
client/src/pages/OrganizationSimple.tsx
client/src/pages/DailyRoutine.tsx
client/src/pages/MyDuties.tsx
client/src/components/ResidenceCareLayout.tsx
client/src/components/organization-simple/*        (organization-simple.zip)
client/src/navigation/*
```

#### Backend

```txt
server/routers/modules/organization.ts
server/services/organizationService.ts
server/routers/modules/duties.ts
server/routers/modules/dailyRoutine.ts
server/services/dailyRoutineService.ts
server/db/duty.ts
server/routers/modules/residentPortal.ts
server/services/residentPortalService.ts
server/services/residentPortalAccessService.ts
```

#### Schema/context liên quan

```txt
drizzle/schema.ts
drizzle/residents.ts
drizzle/dailyRoutine.ts
```

---

## Checklist audit

### A. Organization — Tổ/Ban/Bổ nhiệm

```txt
[ ] Rà tạo/sửa/xem Tổ
[ ] Rà tạo/sửa/xem Ban
[ ] Rà thêm học viên vào Tổ
[ ] Rà thêm học viên vào Ban
[ ] Rà đổi Tổ cho học viên
[ ] Rà bổ nhiệm chức vụ nhà: Trưởng / Phó / Thư ký / Thủ quỹ
[ ] Rà bổ nhiệm Tổ trưởng theo từng Tổ
[ ] Rà bổ nhiệm Trưởng ban theo từng Ban
[ ] Kiểm tra rule max 1 cho chức vụ cố định
[ ] Kiểm tra rule Tổ trưởng/Trưởng ban scoped theo unit, không global
[ ] Kiểm tra học viên rời/ngừng không được bổ nhiệm mới
[ ] Không phá layout OrgChart đã được bảo vệ
```

### B. DailyRoutine / Công tác

```txt
[ ] Rà tạo công tác đơn giản: ngày, nơi làm, trạng thái hoàn thành/chưa hoàn thành
[ ] Rà phân công theo học viên
[ ] Rà phân công theo phòng
[ ] Rà phân công theo Tổ
[ ] Rà phân công theo Ban
[ ] Rà preview trước khi ghi
[ ] Rà conflict với lịch học và buffer 60 phút
[ ] Rà conflict với công tác khác
[ ] Rà cancel rồi reassign vẫn được
[ ] Rà học viên cập nhật hoàn thành/chưa hoàn thành trên portal/MyDuties
[ ] UI công tác phải đơn giản, không quá nhiều trường chi tiết
```

### C. Resident Portal — học viên thường

```txt
[ ] Portal học viên chỉ thấy dữ liệu của mình
[ ] Thấy công tác của mình
[ ] Cập nhật trạng thái hoàn thành/chưa hoàn thành nếu được phép
[ ] Thấy hôm nay/lịch sinh hoạt liên quan
[ ] Không thấy menu/API quản trị
[ ] Tài chính cá nhân vẫn hoạt động
```

### D. Resident Portal — theo chức vụ

```txt
[ ] Học viên có chức vụ thấy menu/entry phù hợp
[ ] Tổ trưởng thấy phạm vi Tổ của mình nếu đã có chức năng
[ ] Trưởng ban thấy phạm vi Ban của mình nếu đã có chức năng
[ ] Không vượt phạm vi sang Tổ/Ban khác
[ ] Nếu chức vụ hết hiệu lực thì quyền portal hết hiệu lực
```

### E. Navigation/Layout

```txt
[ ] Navigation manager không có link 404
[ ] Navigation resident không có link 404
[ ] Navigation appointed resident không có link 404
[ ] Layout không hiển thị menu sai vai trò
[ ] Không làm thay đổi route đã pass ở Việc 1
```

---

## Nguyên tắc patch Việc 12

```txt
[ ] Audit trước, không patch mù
[ ] Chỉ patch bug/demo-blocker hoặc UX nhỏ cần thiết
[ ] Không mở rộng nghiệp vụ ngoài scope demo
[ ] Không đổi OrgChart layout protected
[ ] Không phá DailyRoutine conflict rules đã pass
[ ] Không phá Resident Portal guard đã pass
[ ] Sau patch phải xuất zip theo cấu trúc repo
[ ] Sau patch phải cập nhật checklist này
[ ] Sau patch/pass phải cập nhật PROJECT_SUMMARY.md/status append
```

---

## Runtime checklist sau patch

```txt
[ ] pnpm check
[ ] pnpm test
[ ] pnpm build
[ ] Demo tạo Tổ/Ban
[ ] Demo bổ nhiệm
[ ] Demo phân công công tác
[ ] Demo portal học viên thường
[ ] Demo portal học viên có chức vụ
```
