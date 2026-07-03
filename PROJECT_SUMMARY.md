# ResidenceCore Project Summary

## 1. Tổng quan

Đây là bản tổng hợp tình trạng dự án hiện tại, những gì đã thực hiện, phần còn lại cần giải quyết, và cách vận hành để bất kỳ thành viên nào cũng có thể tiếp tục triển khai.

## 2. Những việc đã làm

- Loại bỏ các file route/document thừa liên quan đến finance route:
  - `client/src/routes/financeRouteFragment.tsx`
  - `client/src/routes/financeRoutes.tsx`
  - `client/src/routes/README-ADD-FINANCE-ROUTE.md`
  - `client/src/pages/Finance.tsx`
- Đã xóa file style duplicate thừa:
  - `client/src/components/components/shared/styleMedium.ts`
- Gom helper chung `cx` vào:
  - `client/src/lib/utils.ts`
- Cập nhật style foundation để dùng chung helper `cx` trong:
  - `client/src/components/shared/styleMedium.ts`

## 3. Tiến độ hiện tại

- Thay đổi hiện tại: 7 file đã chỉnh sửa/xóa.
- Tập trung chính: cleanup trùng lặp, gom helper, giữ nguyên logic UI/business.
- Phát hiện thêm:
  - Một lỗi TypeScript tồn tại trên `client/src/pages/FinanceLite.tsx` liên quan đến payload `setTransactionForm` (chưa xử lý để tránh thay đổi logic).

## 4. Checklist phần còn lại

### A. Cleanup & Tài liệu

- [ ] So sánh và hợp nhất hai file `STYLE_SYNC_RULES.md` nếu chúng trùng nội dung:
  - `STYLE_SYNC_RULES.md`
  - `client/docs/STYLE_SYNC_RULES.md`
- [ ] Xoá các file tạm build/compile không cần thiết:
  - `.temp_tsc_out_utf8.txt`
  - `.temp_tsc_out.txt`
- [ ] Rà soát các file `.docx` nếu không phải tài liệu cần giữ trong repo:
  - `Trình-bày.docx`
  - `Trình-bày-Professional.docx`
  - `client/src/components/ResidenceCore-Business.docx`
- [ ] Rà soát thêm các README/component docs riêng của module, chỉ giữ những nội dung hướng dẫn cần thiết.

### B. Utility / Helper chung

- [ ] Gom các hàm định dạng chung 
  - `formatMoney`
  - `formatDate`
  - `formatMoneyInput`
  - `parseDateInput`
  - `formatVND` / `formatVNDFull`
  vào một thư viện dùng chung nếu có thể.
- [ ] Kiểm tra các helper `normalizeText`, `normalizeCode`, `toInputDateValue` có nên đưa vào `client/src/lib/*`.

### C. UI / Page / Mock

- [ ] Giữ các page mock UI nếu còn dùng cho preview nghiệp vụ nhưng chưa có backend.
- [ ] Loại bỏ các trang/demo không còn nằm trong luồng nghiệp vụ chính.
- [ ] Kiểm tra lại navigation items và route thực tế trên `client/src/App.tsx`.

### D. Style & UI Foundation

- [ ] Đảm bảo các trang mới dùng chung `residenceMediumStyle` để duy trì style premium.
- [ ] Định nghĩa rõ ràng các token style cơ bản:
  - `page`, `pageShell`, `topTitle`, `section`, `card`, `modalShell`, `primaryButton`, ...
- [ ] Hướng dẫn dev mới:
  - dùng `cx`/`cn` từ `client/src/lib/utils.ts`
  - dùng `residenceMediumStyle` cho layout/phần nền
  - không tạo style tùy ý ra ngoài hệ thống.

## 5. Hướng dẫn vận hành dự án

### A. Cách dùng file này

- Mục đích: tài liệu này giúp người mới đọc nhanh trạng thái và hành động tiếp theo.
- Khi nhận dự án: đọc mục `Checklist phần còn lại` trước, sau đó mở `CURRENT_WORKFLOW.md` hoặc `README.md` nếu cần.
- Nếu muốn bắt tay làm lại dự án, hãy:
  1. Đọc `README.md` và `docs/05_USER_MANUAL.md`.
  2. Kiểm tra route chính trong `client/src/App.tsx`.
  3. Kiểm tra UI foundation trong `client/src/components/shared/styleMedium.ts`.
  4. Kiểm tra helper chung trong `client/src/lib/utils.ts` và `client/src/lib/format.ts`.

### B. Luồng phát triển

1. `client/src/App.tsx` là điểm ra route front-end.
2. Các pages chính nằm trong `client/src/pages/`.
3. Các component chung nằm trong `client/src/components/shared/`.
4. Module chuyên dụng như finance hoặc organization có thể nằm trong `client/src/components/finance-lite/` hoặc `client/src/components/organization-simple/`.
5. Nếu cần tài liệu nghiệp vụ, xem `docs/02_API_DOCUMENTATION.md`, `docs/03_DATABASE_SCHEMA.md`, `docs/05_USER_MANUAL.md`.

### C. Quy trình tiếp cận khi cần sửa/app UI

- Bước 1: Xác định page/route đang sửa.
- Bước 2: Mở component tương ứng trong `client/src/pages/`.
- Bước 3: Nếu có UI chung, dùng component trong `client/src/components/shared/`.
- Bước 4: Nếu cần text/format, dùng `client/src/lib/format.ts`.
- Bước 5: Nếu cần class names, dùng `cx` hoặc `cn` từ `client/src/lib/utils.ts`.
- Bước 6: Chạy `pnpm exec tsc --noEmit` để kiểm tra type, sau đó chạy dev bằng `pnpm dev` hoặc script tương ứng.

## 6. Ghi chú chuyên môn

- Không xóa những page mock UI nếu chúng đang mô phỏng nghiệp vụ và có khả năng cần backend sau này.
- Giữ các component style premium và token hóa style cơ bản.
- Nếu cần fast refactor, ưu tiên gom helper, không thay đổi logic nghiệp vụ.
- Nếu muốn giữ dự án dễ bắt tay làm lại, nên chuẩn hoá 3 phần:
  1. Route / Page flow
  2. Shared UI style
  3. Shared helper / util

## 7. Next step nhanh

- [ ] Merge duplicate style docs
- [ ] Xóa file tạm `.temp_tsc_out*.txt`
- [ ] Clean `.docx` nếu không cần trong repo source
- [ ] Fix TypeScript lỗi tồn tại ở `client/src/pages/FinanceLite.tsx`
- [ ] Chuẩn hoá helper định dạng tài chính chung
- [ ] Tập trung giữ lại `finance-lite` page và routes cần thiết

---

> File này được tạo để dễ dàng bàn giao và tiếp tục phát triển với ít friction nhất. Nếu cần, hãy update lại định dạng flow/diagram trong `docs/ARCHITECTURE_DIAGRAM.md` theo quy ước mới.