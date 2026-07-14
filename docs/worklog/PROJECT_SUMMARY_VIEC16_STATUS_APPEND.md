# PROJECT_SUMMARY — Việc 16 append

## 16K2 — Store product pricing visible in UI

Sau khi user phản hồi chưa thấy các trường `sourceType`, `costingMethod`, `averageCostPrice`, `currentSalePrice` ở danh mục hàng hóa, đã bổ sung UI ở `StoreLedger.tsx` để hiển thị và nhập các thông tin nền này.

Nội dung:
- Hàng hóa hiển thị nguồn hàng: mua về / tự gia công / cả hai.
- Hàng hóa hiển thị cách tính giá vốn: bình quân gia quyền / giá nhập gần nhất / thủ công.
- Card hàng hóa dùng `averageCostPrice || defaultCostPrice` làm giá vốn hiển thị.
- Card hàng hóa dùng `currentSalePrice || defaultSalePrice` làm giá bán hiện tại.
- Hiển thị giá trị vốn tồn và giá trị bán dự kiến.
- Form hàng hóa bổ sung nguồn hàng và cách tính giá vốn.
- Không đổi backend/schema/migration ở bước này vì nền 16K1 đã thêm DB/API.

Bước kế tiếp: 16K3 — modal cập nhật giá bán + xem lịch sử giá vốn/giá bán.
