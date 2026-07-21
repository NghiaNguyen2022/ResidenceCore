# 16L8.19 — Fix bàn giao không thống kê tiền vào/ra

Nguyên nhân: `shift.shiftDate` bị đổi thành chuỗi Date dài, làm query theo ngày không khớp nên tổng thu/chi bằng 0.

Sửa:
- Chuẩn hóa ngày thành `YYYY-MM-DD` theo `Asia/Ho_Chi_Minh`.
- Ưu tiên giao dịch đúng `storeShiftId`.
- Bỏ giao dịch cancelled/void/inactive.
- Sửa luôn tìm ca chiều cùng ngày.

Công thức:
`Tiền dự kiến = Tiền đầu ca + Tổng thu - Tổng chi`

Áp dụng:

```bash
python tools/apply_16L8_19.py
pnpm check
pnpm dev
```
