# Việc 15H — Resident Finance audit

## Mục tiêu

Rà trang `Tài chính` trong Portal học viên sau khi menu đã gom về `Lưu xá của tôi`.

## Kết quả audit

- Trang `ResidentFinance.tsx` đã có cấu trúc tương đối đầy đủ:
  - khoản cần đóng theo tháng;
  - lịch sử thanh toán;
  - khoản đã đóng;
  - tạm ứng/thực chi nếu có.
- Style hiện tại đã tương đối gần premium hơn các trang cũ nên chưa cần rewrite lớn.
- Điểm cần vá ngay: modal cập nhật thực chi tạm ứng còn dùng input `type=date`, không đúng rule toàn hệ thống phải dùng picker.

## Patch 15H

- Thêm `FormDateInput` từ shared components.
- Đổi field `Ngày chi` trong `AdvanceEntryModal` từ input date thô sang `FormDateInput`.
- Không đổi backend/API/schema/logic tài chính.

## Runtime test

- Mở Portal học viên > Lưu xá của tôi > Tài chính.
- Nếu có khoản tạm ứng, mở modal cập nhật chi.
- Kiểm tra `Ngày chi` dùng DatePicker/FormDateInput.
- Lưu thực chi vẫn hoạt động.
