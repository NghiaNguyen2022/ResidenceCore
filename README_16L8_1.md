# 16L8.1 — Store shift timezone hotfix

## Lỗi
Trong giờ ca sáng 07:00–14:00 nhưng portal vẫn báo chưa đến giờ.

## Nguyên nhân
Store shift được tạo bằng `Date.UTC(...)` với giờ Việt Nam, khiến 07:00 bị hiểu thành 07:00 UTC, tương đương 14:00 Việt Nam.

## Áp dụng ngay
Chạy file:

`drizzle/20260721_fix_store_shift_timezone_vietnam.sql`

trong MySQL Workbench.

Sau đó:
1. Restart server.
2. Reload portal học viên.
3. Kiểm tra lại nút Vào cửa hàng.

Script chỉ sửa các dòng còn mang giờ sai 07:00/13:00 nên có thể chạy lại an toàn.

## Trạng thái
Đây là hotfix dữ liệu hiện tại. Code tạo ca mới cần được sửa ở bước 16L8.2 để không tái diễn.
