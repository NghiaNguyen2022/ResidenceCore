# Việc 16L5 — Portal Cửa hàng cho học viên trực ca

## File
- client/src/App.tsx
- client/src/navigation/residentNavigation.ts
- client/src/pages/MyDuties.tsx
- client/src/pages/ResidentStore.tsx

## Chức năng
- Sau khi nhập đúng mã ca, chuyển thẳng đến `/resident/store`.
- Menu Cửa hàng chỉ được tạo khi sessionStorage có phiên Store còn hạn.
- Portal riêng cho học viên, không dùng màn hình quản lý Store.
- Tab: Ca hiện tại, Bán hàng, Nhập hàng, Giao dịch ca.
- Chỉ ca chiều hiện tab Chốt ngày.
- Không có Sản phẩm, sửa giá, review, xác nhận, bỏ chốt hoặc đẩy Finance.
- Mọi API gửi `storeShiftId` và `storeAccessToken`.
- Backend vẫn là lớp quyết định quyền cuối cùng.
- Hết phiên: xóa quyền Store và quay về Công tác; portal vẫn đăng nhập.

## Áp dụng
Giải nén vào thư mục gốc ResidenceCore và chọn Replace/Overwrite.

Sau đó:
pnpm check
pnpm dev

## Trạng thái
- Chưa runtime test vì phụ thuộc ca Store đang hoạt động.
- Không có migration mới.
