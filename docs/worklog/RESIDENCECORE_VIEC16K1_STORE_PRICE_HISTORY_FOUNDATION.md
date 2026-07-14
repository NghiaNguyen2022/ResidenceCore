# ResidenceCore - Việc 16K1 - Store price history foundation

## Mục tiêu

Dừng nhập hàng/bán hàng để chuẩn hóa nền giá cho module Cửa hàng:

- Hàng hóa có nguồn: mua về, tự gia công, hoặc cả hai.
- Giá vốn không còn là field tĩnh đơn giản; có lịch sử giá vốn theo nhập hàng/gia công/điều chỉnh.
- Giá bán có lịch sử thay đổi theo ngày hiệu lực, lý do và ghi chú.
- Phương pháp giá vốn mặc định của cửa hàng: bình quân gia quyền.

## Cấu trúc mới

### storeProducts bổ sung

- `sourceType`: purchase / processed / both
- `costingMethod`: weighted_average / latest / manual
- `averageCostPrice`: giá vốn bình quân hiện tại
- `currentSalePrice`: giá bán hiện tại

### storeProductCostHistories

Lưu lịch sử giá vốn, chủ yếu sinh ra từ nhập hàng/gia công ở các bước sau.

### storeProductSalePriceHistories

Lưu lịch sử giá bán:

- ngày hiệu lực
- giá bán
- lý do thay đổi
- ghi chú
- người cập nhật

## Quy tắc nghiệp vụ

- Giá trị vốn tồn kho = tồn hiện tại x averageCostPrice.
- Giá trị bán dự kiến = tồn hiện tại x currentSalePrice.
- Đổi giá bán không làm đổi giá vốn.
- Nhập hàng/gia công mới sẽ cập nhật giá vốn bình quân.
- Bán hàng sau này lấy giá bán theo ngày hiệu lực.

## Bước tiếp theo

- 16K2: UI cập nhật giá bán + xem lịch sử giá.
- 16K3: Nhập hàng/gia công tăng tồn + tính giá vốn bình quân.
- 16K4: Bán hàng giảm tồn + ghi giá vốn/lãi gộp.
