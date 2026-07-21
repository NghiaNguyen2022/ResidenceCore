# 16L8.11 — Khôi phục nút Vào cửa hàng trên portal học viên

## Nguyên nhân
`listStoreShiftCandidatesForResident()` đang lọc trực tiếp:

`storeShifts.accessValidUntil >= NOW()`

Trong database hiện tại, giờ ca là dữ liệu wall-clock Việt Nam nhưng cột/driver MySQL có chuyển đổi múi giờ. Điều kiện SQL này có thể loại ca hợp lệ trước khi service kịp xử lý bằng `asVietnamWallClockInstant()`.

Kết quả:
- học viên vẫn thấy công tác `Trực cửa hàng ca sáng`;
- nhưng API `getMyStoreDutyAccess` trả `hasShift = false`;
- card `Ca trực Cửa hàng` và nút `Vào cửa hàng` biến mất.

## Sửa
- Bỏ điều kiện thời gian khỏi câu SQL lấy ứng viên ca.
- Vẫn giữ lọc:
  - đúng học viên;
  - thành viên không bị hủy;
  - ca không cancelled/confirmed/expired.
- Việc xác định đang trong giờ ca tiếp tục do `storeDutyAccessService.isWithinAccessWindow()` xử lý theo Asia/Ho_Chi_Minh.

## Áp dụng
Replace file:

`server/db/storeLedger.ts`

Sau đó:

```bash
pnpm check
pnpm dev
```

Reload portal học viên → Công tác.

## Không thay đổi
- Không đụng `MyDuties.tsx`.
- Không đụng luồng nhập mã.
- Không đụng Store manager.
- Không cần migration.
