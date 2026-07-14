# PROJECT_SUMMARY - Việc 16 append

## 16K4 - Nhập hàng / chi mua hàng tăng tồn
Bổ sung nghiệp vụ nhập hàng cho module Cửa hàng. Khi manager nhập hàng, hệ thống tạo phát sinh chi mua hàng, ghi biến động tồn kho, tăng tồn hàng hóa, ghi lịch sử giá vốn và tính lại giá vốn hiện tại theo cách dễ hiểu là giá trung bình. Không chốt từng giao dịch sang sổ chung; vẫn theo hướng chốt sổ theo ngày.

File SQL migration đặt trong `/drizzle/viec16k4_purchase_stock_inventory.sql`.
