# Việc 16E2 — StoreLedger popup z-index fix

## Vấn đề

Khi tạo phiếu thu/chi mới và chọn ngày đã chốt sổ, backend/API chặn đúng. Tuy nhiên popup cảnh báo lại nằm dưới modal tạo phiếu, làm người dùng tưởng hệ thống không phản hồi đúng chỗ.

## Nguyên nhân

Modal cảnh báo `blockingNotice` và modal tạo phiếu cùng dùng component `Modal` với cùng z-index mặc định. Vì modal tạo phiếu render sau nên nằm trên popup cảnh báo.

## Cách sửa

- Thêm prop `overlayClassName` cho `Modal`.
- Giữ modal thường mặc định `z-[80]`.
- Riêng modal `blockingNotice` dùng `z-[110]`.

## Test

1. Chốt một ngày có phát sinh.
2. Mở modal tạo phát sinh mới.
3. Chọn đúng ngày đã chốt.
4. Bấm lưu.
5. Popup chặn phải hiện trên modal tạo phiếu.
