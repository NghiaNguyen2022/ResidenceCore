# 16L8.16 — Fix lỗi phân công ca Cửa hàng

## Nguyên nhân
Luồng phân công tạo liên tiếp:

1. `dutyAssignments`
2. `storeDutyAssignments`
3. `storeDutyMembers`
4. `storeShifts`

Hai bảng Store đang nhận trực tiếp `input.createdBy` vào:
- `storeDutyAssignments.managerId`
- `storeDutyAssignments.createdBy`
- `storeShifts.createdBy`

Các cột này là khóa ngoại tới `users.id`. Với dữ liệu seed hoặc phiên đăng nhập cũ, user ID có thể không còn tồn tại, làm phân công thất bại giống lỗi `issuedBy` trước đó.

## Sửa
- Không ghi user ID phiên vào các khóa ngoại lịch sử trên bản ghi Store.
- Quyền phân công vẫn được router kiểm tra trước khi gọi DB.
- Không thay đổi học viên, ngày, ca, cửa hàng hoặc giờ truy cập.

## Áp dụng
Từ thư mục gốc:

```bash
git apply --whitespace=fix server/db/duty.ts.patch
pnpm check
pnpm dev
```

## Lưu ý
Nếu lần phân công lỗi trước đã tạo `dutyAssignments` nhưng chưa tạo Store shift, lần thử lại có thể báo trùng phân công. Chạy file SQL kiểm tra trong gói để xác định bản ghi tạo dở.
