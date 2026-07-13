# RESIDENCECORE_CHECKLIST_VIEC16_IN_PROGRESS.md

## Việc 16 — Cửa hàng lite

### Trạng thái tích lũy
- 16A–16A5: nền sổ cửa hàng/thu chi riêng, router, enum/date/duplicate fix.
- 16D: chốt ngày cửa hàng.
- 16E/16E2: popup thao tác bị chặn và fix z-index popup trên modal.
- 16F: review/approval workflow cho chốt ngày.
- 16G/G2/H: sản phẩm lite, chuyển trang thành quản lý cửa hàng một cửa hàng chính, gom menu.

### 16I — Product page first + route/tab sync + product categories
- [x] Sửa lỗi bấm menu con cửa hàng không đổi nội dung tab do route query không sync state.
- [x] Thêm sync tab từ URL `/store-ledger?tab=...` và hỗ trợ path tab nếu sau này dùng.
- [x] Bám hướng làm trang sản phẩm trước.
- [x] Bổ sung nhóm/loại sản phẩm mặc định: Nông sản, Thủ công, Bánh kẹo, Sách, Đồ uống, Đồ ăn, Văn phòng phẩm, Khác.
- [x] Cho phép nhập nhóm/loại sản phẩm mới ngay trong form sản phẩm.
- [x] Filter nhóm sản phẩm dùng pill filter, tránh dropdown gây overlay.
- [x] Không đổi backend/schema/migration trong bước này.

### Test 16I
- [ ] Bấm menu Quản lý cửa hàng > Dữ liệu sản phẩm mở đúng tab sản phẩm.
- [ ] Bấm Mua hàng / Nhập kho, Bán hàng, Tổng hợp thu chi đổi đúng tab.
- [ ] Thêm sản phẩm với nhóm mặc định Nông sản/Thủ công/Bánh kẹo/Sách.
- [ ] Thêm sản phẩm với nhóm mới tự nhập.
- [ ] Filter theo nhóm hoạt động.
- [ ] Các chức năng chốt ngày/review cũ không bị ảnh hưởng.
