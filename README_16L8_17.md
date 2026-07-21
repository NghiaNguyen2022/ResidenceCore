# 16L8.17 — Sửa logic phân công khi ca Cửa hàng đã tồn tại

## Lỗi hiện tại
Backend đang chặn cứng:

`Cửa hàng đã có ca sáng ngày 2026-07-21`

Đây không phải lỗi database. Đây là guard trong `assignDutyBatch()`.

Guard này không đúng với mô hình hiện tại vì:
- một ca Cửa hàng chỉ có một `storeShifts`;
- nhưng một ca có thể có nhiều học viên;
- phân công thêm học viên phải gắn vào ca đã có, không tạo ca thứ hai và cũng không báo lỗi.

## Logic mới
Khi cùng cửa hàng + ngày + loại ca đã có:

1. Vẫn tạo `dutyAssignments` cho học viên mới.
2. Dùng lại `storeDutyAssignment` và `storeShift` hiện hữu.
3. Thêm học viên vào `storeDutyMembers` nếu chưa có.
4. Không tạo thêm ca trùng.
5. Không thêm trùng cùng học viên.
6. Giữ nguyên học viên trực chính hiện tại.

Khi chưa có ca:
- tạo mới như logic cũ.

## Áp dụng

```bash
git apply --whitespace=fix server/db/duty.ts.patch
pnpm check
pnpm dev
```

## Kiểm tra
- Phân công thêm học viên vào ca sáng đã có: phải thành công.
- Phân công ca chiều: phải tạo ca chiều riêng.
- Phân công lại đúng học viên/công tác/ngày: preview duplicate vẫn chặn.
