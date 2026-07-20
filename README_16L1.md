# Việc 16L1 — Store duty foundation

Base:
- drizzle/schema/storeLedger.ts: đúng file `storeLedger(22).ts` người dùng vừa gửi.
- server/db/storeLedger.ts: đúng file `storeLedger(20).ts` người dùng vừa gửi.

Phạm vi:
- Thêm bảng phân công trực Cửa hàng, thành viên ca, ca trực, access session và bàn giao.
- Access session tách khỏi phiên đăng nhập portal; có `lastStoreActivityAt` và `sessionExpiresAt`.
- Thêm liên kết nullable từ chứng từ/giao dịch Cửa hàng đến ca trực.
- Thêm DB functions nền.
- Không đổi router/service/UI/quyền hiện tại.
- Chưa bật học viên truy cập Cửa hàng trong bước này.

Migration:
- `drizzle/20260720_store_duty_shift_foundation.sql`
- Chạy một lần trên DB chưa có các bảng/cột 16L1.
