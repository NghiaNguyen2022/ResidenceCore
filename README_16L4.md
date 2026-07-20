# Việc 16L4 — Timeout quyền Cửa hàng

Trạng thái nền:
- 16L3 đã áp dụng nhưng chưa runtime test vì ngoài giờ ca.
- 16L4 phải áp dụng sau 16L3.

Nội dung:
- Phiên quyền Cửa hàng hết sau 30 phút không có thao tác Store thật.
- Mỗi API Store được phép cho học viên sẽ xác thực token backend.
- Mỗi thao tác thành công gia hạn thêm 30 phút, nhưng không vượt quá giờ kết thúc ca.
- Hết giờ ca thì hết quyền ngay.
- Không dùng heartbeat.
- Portal học viên vẫn đăng nhập.
- Có thể nhập lại mã nếu ca vẫn còn hiệu lực.
- Chứng từ học viên tạo được gắn storeShiftId, storeDutyAssignmentId, createdByResidentId.

File thay thế:
- server/services/storeDutyAccessService.ts

File patch:
- server/db/storeLedger.ts
- server/routers/modules/residentPortal.ts
- server/routers/modules/storeLedger.ts
- client/src/pages/MyDuties.tsx

Lưu ý:
- 16L3 và 16L4 hiện đều chưa runtime test.
- Chưa có menu nghiệp vụ Cửa hàng cho học viên; phần đó thuộc 16L5.
- Không có migration mới.

Chạy:
pnpm check
pnpm dev
