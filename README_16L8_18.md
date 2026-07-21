# 16L8.18 — Tự cấp mã và chuẩn hóa giờ ca Cửa hàng

Base đã đối chiếu GitHub `main`:
- `server/db/duty.ts` SHA `13898da256209ffa29a6f11e5d0ab800343d000d`
- `server/routers/modules/duties.ts` SHA `4b438e86bff84c0b5e971e14e2f4e5ac24224619`
- `server/services/storeDutyAccessService.ts` SHA `94664199c47ab620472f56626ed64d903cf6c399`

## Áp dụng
Giải nén vào thư mục gốc ResidenceCore, sau đó:

```bash
python tools/apply_16L8_18.py
pnpm check
```

Chạy SQL:

`drizzle/20260721_normalize_store_shift_utc.sql`

Rồi restart:

```bash
pnpm dev
```

## Kết quả
- Phân công ca Cửa hàng tự phát hành mã cho từng học viên.
- Thông báo mã được gửi ngay sau phân công.
- Cấp lại mã thu hồi mã/session cũ.
- Ca đã tồn tại được dùng lại; không tạo `storeShift` trùng.
- Giờ nghiệp vụ sáng 07:00–14:00, chiều 13:00–19:00.
- TIMESTAMP lưu UTC đúng một lần; service không cộng/trừ 7 giờ lần hai.
- Timeout 30 phút: nhập lại cùng mã.
- Hết giờ ca: mã hết hạn hoàn toàn.

Script tự backup và dừng nếu source không khớp, không ghi file nửa chừng.
