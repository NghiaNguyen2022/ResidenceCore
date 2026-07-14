# RESIDENCECORE_CHECKLIST_VIEC16_IN_PROGRESS

## 16K4 - Nhập hàng / chi mua hàng tăng tồn
- [x] Thêm API `storeLedger.createPurchaseStock`
- [x] Tạo khoản chi cửa hàng loại `purchase_stock` khi nhập hàng
- [x] Ghi biến động tồn kho `storeStockMovements`
- [x] Tăng tồn hiện tại của hàng hóa
- [x] Ghi lịch sử giá vốn từ lần nhập hàng
- [x] Tính lại giá vốn hiện tại theo cách dễ hiểu: tính theo giá trung bình
- [x] Chặn nhập hàng vào ngày đã chốt / đang review bằng popup hiện có
- [x] Migration SQL đặt trong `/drizzle`

## Test cần chạy
- pnpm check
- pnpm test
- pnpm build
- Runtime: nhập hàng -> tồn tăng -> tổng chi tăng -> lịch sử giá vốn có dòng mới.
