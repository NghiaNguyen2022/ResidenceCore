# ResidenceCore / App Lưu Xá - Việc 9 Audit Helper / Util / Style

**Cập nhật:** 2026-07-04  
**Trạng thái:** Việc 9 đang làm - audit vòng 1, có patch nhỏ 9A chờ apply/pass.

## Phạm vi đã nhận

Đã nhận và đọc các file:

- `client/src/lib/format.ts`
- `client/src/lib/utils.ts`
- `client/src/config/residenceAppearance.ts`
- `client/src/components/shared/styleMedium.ts`
- `client/src/pages/FinanceLite.tsx`
- `client/src/components/finance-lite/*`
- `client/src/pages/DailyRoutine.tsx`
- `client/src/pages/Members.tsx`
- `client/src/pages/Residents.tsx`
- `client/src/components/members/*`

Ghi chú: không có thư mục `client/src/components/resident-portal/`, nên bỏ khỏi phạm vi Việc 9.

## Kết quả audit

### 1. Shared style foundation

`styleMedium.ts` đã dùng `cx` từ `@/lib/utils` và đã lấy token từ `residenceAppearance.ts`.

Kết luận:

- Không cần patch style ở vòng này.
- Không tạo thêm style token mới nếu chưa có nhu cầu UI cụ thể.
- Giữ nguyên `residenceMediumStyle` để tránh làm lệch các flow đã pass.

### 2. Shared util hiện tại

`client/src/lib/utils.ts` hiện mới có:

- `cn`
- `cx`

Trong code có nhiều helper normalize/date input còn đang nằm cục bộ ở page/component, ví dụ:

- `normalizeText`
- `normalizeCode`
- `toInputDateValue`

Kết luận:

- Nên bổ sung helper chung vào `utils.ts`.
- Chưa thay toàn bộ usage trong các module đã pass để tránh refactor rộng.
- Các file mới sau này nên dùng helper chung.

### 3. Shared format hiện tại

`client/src/lib/format.ts` đã có nhóm date/time/currency cơ bản.

FinanceLite lại có helper money riêng trong `financeLiteUtils.ts`:

- `normalizeStoredMoneyValue`
- `toMoneyNumber`
- `formatMoney`
- `formatMoneyInput`

Kết luận:

- Đây là nhóm helper nên đưa về `client/src/lib/format.ts`.
- Để an toàn, patch 9A chỉ chuyển source of truth sang `format.ts`, còn `financeLiteUtils.ts` vẫn re-export các tên cũ để không phải sửa hàng loạt import.

## Patch 9A

### File cần sửa

- `client/src/lib/format.ts`
- `client/src/lib/utils.ts`
- `client/src/components/finance-lite/financeLiteUtils.ts`

### Nội dung chính

1. Thêm money helper chung vào `format.ts`.
2. Thêm helper text/date input chung vào `utils.ts`.
3. Sửa `financeLiteUtils.ts` để import/re-export helper từ `@/lib/format`.

## Nguyên tắc sau patch

- Không đổi UI.
- Không đổi nghiệp vụ FinanceLite.
- Không đổi format đang hiển thị trong FinanceLite.
- Không refactor rộng Members/DailyRoutine trong vòng này.
- Các helper mới được xem là chuẩn dùng cho code mới hoặc refactor nhỏ sau này.

## Checklist apply

- [ ] Apply patch 9A.
- [ ] Chạy `pnpm check`.
- [ ] Chạy `pnpm test`.
- [ ] Chạy `pnpm build`.
- [ ] Mở FinanceLite kiểm tra tiền hiển thị vẫn như cũ: `1.200.000đ`.
- [ ] Nhập tiền trong form FinanceLite vẫn format dạng `1.200.000`.
- [ ] Members/DailyRoutine không bị ảnh hưởng.
- [ ] Nếu pass, chốt Việc 9 hoàn tất và cập nhật `PROJECT_SUMMARY.md`.
