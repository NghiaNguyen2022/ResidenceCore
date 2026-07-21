# 16L8.9 — Fix lỗi insert storeDutyAccessSessions

## Nguyên nhân khả năng cao
Log cho thấy câu INSERT đang ghi `issuedBy = 1`.

`storeDutyAccessSessions.issuedBy` là khóa ngoại tới `users.id`.
Ở dữ liệu hiện tại, ID người quản lý lấy từ phiên đăng nhập có thể không còn tồn tại trong bảng `users`, làm INSERT thất bại trước khi hệ thống tạo thông báo cho học viên.

## Sửa
- Không lưu `issuedBy` cho phiên mã Cửa hàng.
- Router vẫn kiểm tra quyền `manager`, nên không làm giảm kiểm soát quyền.
- Giữ nguyên:
  - mã hash;
  - ca trực;
  - học viên;
  - thời hạn;
  - gửi thông báo;
  - thu hồi mã nếu gửi thông báo thất bại.

## Áp dụng
Replace:

`server/services/storeDutyAccessService.ts`

Sau đó:

```bash
pnpm check
pnpm dev
```

Không cần migration.
