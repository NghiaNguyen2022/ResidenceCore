# RESIDENCECORE_CHECKLIST.md — Tổng checklist ResidenceCore / App Lưu Xá

Cập nhật đến: **Việc 16K4 — Nhập hàng / chi mua hàng tăng tồn, tính lại giá vốn**  
Trạng thái tổng: **Việc 1–15 DONE/PASS; Việc 16 đang triển khai Quản lý cửa hàng**.

---

## A. Checklist nguyên tắc chung

- [x] Luôn làm trên code mới nhất.
- [x] Nếu không chắc base code, yêu cầu người dùng gửi lại file.
- [x] Tracking/checklist/summary theo từng việc phải append-only/full-history.
- [x] Không ghi đè file tracking bằng bản rút gọn.
- [x] Không revert layout/logic đã pass.
- [x] Date/time/datetime dùng picker shared.
- [x] Input tiền format `1.000.000`.
- [x] Popup lỗi/xác nhận dùng modal custom, không browser confirm/alert.
- [x] Popup blocking phải hiện trên form/modal hiện tại.
- [x] Style premium thống nhất: trắng/kem/amber, title centered, action góc phải.
- [x] Migration store đặt trong `/drizzle`.

---

## B. Checklist Việc 1–10

### Việc 1 — Route/Menu/Page sync

- [x] Audit menu/route.
- [x] Fix `/users` route.
- [x] Disable/hidden missing routes.
- [x] Runtime pass.

### Việc 2 — Page orphan audit

- [x] Audit orphan pages.
- [x] Classify connect/keep/archive.
- [x] No patch needed.

### Việc 3 — Members/Rooms/Organization main flow

- [x] Guard assign room.
- [x] Check inactive/left resident.
- [x] Check room capacity.
- [x] Preserve assignment history.
- [x] Update `currentRoomId`.
- [x] Runtime pass.

### Việc 4 — FinanceLite minimal flow

- [x] Manager guard finance router.
- [x] Validate amount > 0.
- [x] Skip inactive/left residents.
- [x] Duplicate/month guard.
- [x] Runtime pass.

### Việc 5 — DailyRoutine/Công tác

- [x] Duties manager guard.
- [x] Resident duty endpoints still work.
- [x] Demo flow pass.

### Việc 6 — Resident Portal real data

- [x] Linked resident context.
- [x] Portal me.
- [x] Portal finance overview.
- [x] Today overview.
- [x] Duty/org scope.
- [x] Runtime pass.

### Việc 7 — Test baseline cleanup

- [x] Rename legacy test file.
- [x] Test baseline pass.

### Việc 8 — Definition of Done

- [x] DoD created.
- [x] Members DoD.
- [x] Rooms DoD.
- [x] Organization DoD.
- [x] DailyRoutine DoD.
- [x] FinanceLite DoD.

### Việc 9 — Helper/style/picker

- [x] Shared helper utilities.
- [x] TimePickerInput.
- [x] DatePicker portal fix.
- [x] Replace raw time input in known forms.
- [x] Runtime pass.

### Việc 10 — Docs cleanup

- [x] Documentation status.
- [x] Worklog cleanup.
- [x] Archive legacy docs.
- [x] Cleanup script.
- [x] Pass.

---

## C. Checklist Việc 11–15

### Việc 11 — Member Detail/Học tập

- [x] Review member detail sub tabs.
- [x] Restore/protect Study layout Việc 11B.
- [x] Polish layout/style.
- [x] Pass.

### Việc 12 — Organization + Công tác + Portal chức vụ

- [x] 12A guard/scope patched.
- [x] 12B modal error placement pass.
- [x] 12C portal duty scope pass.
- [x] 12D demo script pass.
- [x] Việc 12 DONE/PASS.

### Việc 13 — Thông báo nội bộ lite

- [x] 13A notification API/page/menu.
- [x] 13B popup lite.
- [x] 13C unread badge.
- [x] 13D notification page polish.
- [x] 13E final demo checklist.
- [x] Việc 13 DONE/PASS.

### Việc 14 — Hoạt động/Sự kiện lite

- [x] 14A activities lite patch.
- [x] 14B/14B2 migration fix.
- [x] 14C–14J UI/modal polish.
- [x] 14K filter/layout fix PASS.
- [x] 14L final runtime checklist created.
- [ ] Chốt 14L pass chính thức nếu cần đóng lại.

### Việc 15 — Portal học viên mở rộng

- [x] 15A portal activities route.
- [x] 15C Portal Today premium restyle pass.
- [x] 15F resident menu regroup pass.
- [x] 15G Công tác trong menu mới.
- [x] 15H ResidentFinance DatePicker fix.
- [x] 15I Currency input pass.
- [x] 15J remaining portal pages polish pass.
- [x] 15K final runtime pass.
- [x] Việc 15 DONE/PASS.

---

## D. Checklist Việc 16 — Quản lý cửa hàng

### D1. Nguyên tắc module cửa hàng

- [x] Module gọi là Quản lý cửa hàng, không gọi quỹ riêng.
- [x] Chỉ một cửa hàng chính, không panel chọn nhiều sổ/quỹ.
- [x] Menu riêng:
  - [x] Dữ liệu sản phẩm.
  - [x] Mua hàng / Nhập kho.
  - [x] Bán hàng.
  - [x] Tổng hợp thu chi.
- [x] Route riêng, không dùng query tab làm menu chính.
- [x] Header flat premium, 2 dòng, action góc phải.
- [x] Migration store đặt trong `/drizzle`.

### D2. 16A — Store ledger lite

- [x] Tạo nền store ledger.
- [x] Ghi khoản thu.
- [x] Ghi khoản chi.
- [x] Tổng thu/tổng chi/số dư/phát sinh.
- [x] Router registered sau 16A3.
- [x] Enum column fixed sau 16A4.
- [x] Duplicate ledger code fixed sau 16A5.

### D3. 16B/16C runtime & date render

- [x] Runtime checklist thu/chi created.
- [x] Fix React Date object render.

### D4. 16D–16F — Chốt ngày cửa hàng

- [x] Daily closing foundation.
- [x] Blocking popup khi ngày đã chốt.
- [x] Popup z-index top layer.
- [x] Review/approval workflow:
  - [x] Chốt ngày tạm.
  - [x] Review.
  - [x] Đã review.
  - [x] Xác nhận chốt.
  - [x] Bỏ chốt để bổ sung khi chưa xác nhận.

### D5. 16G–16J — Dữ liệu sản phẩm/UI/menu/header

- [x] Products lite foundation.
- [x] Store page focus, bỏ quỹ riêng.
- [x] Store menu regroup.
- [x] Product category options.
- [x] Nhóm hàng mặc định:
  - [x] Nông sản.
  - [x] Thủ công.
  - [x] Bánh kẹo.
  - [x] Sách.
  - [x] Đồ uống.
  - [x] Đồ ăn.
  - [x] Văn phòng phẩm.
  - [x] Khác.
- [x] Cho tạo nhóm hàng mới.
- [x] Đơn vị tính mặc định:
  - [x] Gói.
  - [x] Cái.
  - [x] Chai.
  - [x] Lít.
  - [x] Cuốn.
- [x] Cho tạo đơn vị mới.
- [x] Tạo hàng hóa không bắt nhập giá bán.
- [x] Không hiển thị mã hàng trên card chính.
- [x] Có nút Thông tin giá.
- [x] Có nút Xóa sản phẩm.
- [x] Xóa dùng modal custom, không browser confirm.
- [x] Không hiện popup thừa sau xóa thành công.
- [x] Header store 2 dòng compact.

### D6. 16K1 — Price history foundation

- [x] Thêm sourceType.
- [x] Thêm costingMethod.
- [x] Thêm averageCostPrice.
- [x] Thêm currentSalePrice.
- [x] Thêm cost history table.
- [x] Thêm sale price history table.
- [x] API listProductPriceHistory.
- [x] API updateProductSalePrice.
- [x] Safe update fix cho MySQL Workbench.

### D7. 16K2 / 16K3 — UI giá và lịch sử giá

- [x] Hiển thị pricing fields ban đầu.
- [x] Đơn giản hóa UI theo yêu cầu.
- [x] Form hàng hóa chỉ giữ thông tin cơ bản.
- [x] Thông tin giá mở khi cần.
- [x] Cập nhật giá bán qua modal riêng.
- [x] Lý do thay đổi không bắt buộc.
- [x] Sale price history append-only.
- [x] Fix thiếu bảng sale price history.
- [x] Fix thiếu bảng cost history.
- [x] Fix format MySQL DECIMAL không nhân sai 100 lần.
- [x] 16K3 pass.

### D8. 16K4 — Nhập hàng / chi mua hàng tăng tồn

**Trạng thái:** Patch đã gửi, chờ apply/test.

Cần kiểm tra:

- [ ] Chạy migration `/drizzle/viec16k4_purchase_stock_inventory.sql`.
- [ ] `/store-purchase` mở đúng.
- [ ] Bấm Nhập hàng.
- [ ] Chọn hàng hóa.
- [ ] Nhập số lượng.
- [ ] Nhập giá vào.
- [ ] Chọn ngày nhập bằng picker.
- [ ] Lưu nhập hàng.
- [ ] Tồn hàng hóa tăng.
- [ ] Tổng chi cửa hàng tăng.
- [ ] Lịch sử giá vốn có dòng nhập mới.
- [ ] Giá vốn hiện tại tính lại theo giá trung bình.
- [ ] Ngày đã xác nhận chốt bị chặn bằng popup.

### D9. Các bước tiếp sau 16K4

- [ ] 16K5 — Bán hàng / thu bán hàng giảm tồn.
- [ ] 16K6 — Báo cáo tồn kho.
- [ ] 16K7 — Báo cáo dòng tiền cửa hàng.
- [ ] 16K8 — Chốt sổ cửa hàng sang sổ chung theo ngày.
- [ ] 16K9 — Demo script cửa hàng full flow.

---

## E. Runtime checklist tổng trước demo

### Manager side

- [x] Members.
- [x] Rooms.
- [x] Contacts.
- [x] Study schedule.
- [x] Organization.
- [x] Duties.
- [x] Finance.
- [x] Notifications.
- [x] Activities.
- [ ] Store products final.
- [ ] Store purchase/import inventory.
- [ ] Store sales.
- [ ] Store inventory report.
- [ ] Store cashflow.
- [ ] Store daily closing to finance.

### Resident portal

- [x] Today.
- [x] Profile/info.
- [x] Duties.
- [x] Finance.
- [x] Notifications popup/badge/page.
- [x] Public activities.
- [x] Role scope for appointed residents.

---

## F. Commands chuẩn

Sau mỗi patch:

```bash
pnpm check
pnpm test
pnpm build
```

Khi migration MySQL Workbench safe update bị chặn:

```sql
WHERE id > 0
```

hoặc tạm tắt safe update nếu người dùng chủ động muốn, nhưng ưu tiên sửa SQL an toàn.


---

## Append — Checklist Việc 16K4.1: Nhập kho đa nguồn

- [x] Chốt rule nhập kho không chỉ là mua hàng.
- [x] Thêm nguồn Mua hàng.
- [x] Thêm nguồn Sản xuất/gia công nội bộ.
- [x] Thêm nguồn Tự cung cấp/được cấp.
- [x] Thêm nguồn Khác.
- [x] Chỉ Mua hàng tự động tạo khoản chi cửa hàng.
- [x] Các nguồn còn lại tăng tồn và cập nhật giá vốn nhưng không tự động tạo chi.
- [x] Mở rộng movement type và cost history source type.
- [x] Thêm API `createStockIn`, giữ API cũ để tương thích.
- [x] Đổi UI thành Tạo phiếu nhập kho đa nguồn.
- [ ] Apply migration 16K4.1.
- [ ] Test mua hàng: tăng tồn + tăng tổng chi.
- [ ] Test sản xuất/gia công: tăng tồn, tổng chi không đổi.
- [ ] Test tự cung cấp/được cấp: tăng tồn, tổng chi không đổi.
- [ ] Test nguồn khác: tăng tồn, tổng chi không đổi.
- [ ] Kiểm tra lịch sử giá vốn ghi đúng nguồn.
- [ ] Kiểm tra giá vốn trung bình sau từng nguồn nhập.
- [ ] Kiểm tra ngày draft/reviewed/approved bị chặn đúng popup.
- [ ] Chạy `pnpm check`, `pnpm test`, `pnpm build`.


---

### D8.2 — Việc 16K4.2: Dashboard vận hành Nhập kho

- [x] Bỏ Tổng thu khỏi `/store-purchase`.
- [x] Bỏ Tổng chi khỏi `/store-purchase`.
- [x] Bỏ Số dư khỏi `/store-purchase`.
- [x] Bỏ Phát sinh kế toán khỏi `/store-purchase`.
- [x] Thêm số Phiếu nhập.
- [x] Thêm tổng Số lượng nhập.
- [x] Thêm số Mặt hàng đã nhập.
- [x] Thêm số Phiếu mua hàng.
- [ ] Runtime xác nhận số liệu thay đổi đúng theo khoảng ngày lọc.
- [ ] Xác nhận số liệu kế toán chỉ còn ở Tổng hợp thu chi.

---

### D8.3 — 16K4.3 Tách trang Nhập kho khỏi thu chi

- [x] Bỏ Lịch sử chốt ngày khỏi `/store-purchase`.
- [x] Bỏ Sổ phát sinh khỏi `/store-purchase`.
- [x] Bỏ thao tác Chốt sổ ngày khỏi `/store-purchase`.
- [x] Bỏ bộ lọc Thu/Chi khỏi `/store-purchase`.
- [x] Giữ Lịch sử nhập kho theo mọi nguồn nhập.
- [x] Không thay đổi DB/backend/migration.
- [ ] Runtime xác nhận `/store-purchase` chỉ còn nội dung nghiệp vụ nhập kho.
- [ ] Runtime xác nhận `/store-cashflow` vẫn còn Lịch sử chốt ngày và Sổ phát sinh.


---

### D9.1 — Việc 16K5: Bán hàng theo sản phẩm

- [x] Thêm API tạo phiếu bán theo sản phẩm.
- [x] Giá bán mặc định lấy từ giá bán hiện tại.
- [x] Cho phép chỉnh giá bán thực tế trên phiếu.
- [x] Kiểm tra tồn trước khi bán.
- [x] Chặn tồn âm ở backend.
- [x] Giảm tồn kho sau khi bán.
- [x] Ghi stock movement loại `sale`.
- [x] Tự động tạo khoản thu cửa hàng loại `sales`.
- [x] Thêm dashboard vận hành riêng cho trang Bán hàng.
- [x] Thêm Lịch sử bán hàng riêng.
- [x] Bỏ Lịch sử chốt ngày khỏi `/store-sales`.
- [x] Bỏ Sổ phát sinh khỏi `/store-sales`.
- [x] Chốt ngày và dòng tiền chỉ còn ở `/store-cashflow`.
- [ ] Runtime bán số lượng nhỏ hơn tồn: giảm tồn + tăng tổng thu.
- [ ] Runtime bán hết tồn: tồn về 0.
- [ ] Runtime bán vượt tồn: popup/lỗi rõ ràng, không tạo thu.
- [ ] Runtime giá bán thực tế khác giá hiện tại: phiếu dùng đúng giá thực tế, không đổi lịch sử giá bán.
- [ ] Runtime ngày draft/reviewed/approved bị chặn đúng.
- [ ] Chạy `pnpm check`, `pnpm test`, `pnpm build`.

---

### D10 — Việc 16K6: Báo cáo tồn kho

- [x] Giữ báo cáo trong `/store-products`, không thêm menu/route mới.
- [x] Tổng lượng tồn theo danh sách và bộ lọc hiện tại.
- [x] Tổng giá trị vốn theo giá vốn trung bình.
- [x] Tổng doanh thu dự kiến theo giá bán hiện tại.
- [x] Tổng lãi gộp dự kiến.
- [x] Bảng chi tiết tồn, giá vốn, giá bán và giá trị theo từng hàng hóa.
- [x] Cảnh báo hàng sắp hết trong báo cáo.
- [x] Không thay đổi DB/backend/migration.
- [ ] Runtime kiểm tra số tổng khớp chi tiết.
- [ ] Runtime kiểm tra search/nhóm hàng/Sắp hết tác động đúng báo cáo.
- [ ] Runtime kiểm tra hàng chưa có giá bán hiển thị đúng.
- [ ] Chạy `pnpm check`, `pnpm test`, `pnpm build`.


---

### D10 — Việc 16K7: Báo cáo dòng tiền cửa hàng

- [x] Thêm báo cáo trong `/store-cashflow`.
- [x] Tổng thu theo khoảng ngày lọc.
- [x] Tổng chi theo khoảng ngày lọc.
- [x] Chênh lệch thu chi.
- [x] Cơ cấu Thu bán hàng / Thu khác.
- [x] Cơ cấu Mua hàng nhập kho / Chi vận hành / Chi khác.
- [x] Bỏ qua phát sinh đã hủy.
- [x] Không hiển thị báo cáo dòng tiền trong Nhập kho/Bán hàng.
- [ ] Runtime đối chiếu tổng báo cáo với Sổ phát sinh.
- [ ] Test thay đổi khoảng ngày.
- [ ] Chạy `pnpm check`, `pnpm test`, `pnpm build`.


---

### D12 — Việc 16K8: Chốt ngày / Xác nhận / Đẩy sổ chung

- [x] Tách nghĩa Chốt ngày và Xác nhận chốt.
- [x] Chốt ngày lưu riêng `closedBy`, `closedAt`.
- [x] Xác nhận lưu riêng `confirmedBy`, `confirmedAt`.
- [x] Cho xác nhận trực tiếp từ trạng thái đã chốt; không bắt buộc thao tác Đã review.
- [x] Khi xác nhận tạo dữ liệu tổng hợp sang `finance_transactions`.
- [x] Gộp các dòng đẩy theo `financeBatchId`.
- [x] Thêm `external_ref` để chống đẩy trùng khi retry.
- [x] Chỉ set `postedToFinance = true` sau khi đẩy hoàn tất.
- [x] Giữ API cũ làm alias tương thích.
- [ ] Chạy migration `/drizzle/viec16k8_close_confirm_post_finance.sql`.
- [ ] Runtime: Chốt ngày không tạo dòng Finance.
- [ ] Runtime: Xác nhận tạo đúng tổng thu/tổng chi ở sổ chung.
- [ ] Runtime: bấm xác nhận lại không tạo trùng.
- [ ] Runtime: bỏ chốt trước xác nhận hoạt động.
- [ ] Runtime: sau xác nhận không thể bỏ chốt.
- [ ] Chạy `pnpm check`, `pnpm test`, `pnpm build`.


---

### D12 — Việc 16K8.5: Group theo ngày

- [x] Finance DB trả `externalRef` trong danh sách giao dịch.
- [x] Sổ dòng tiền Finance gom tổng thu và tổng chi cửa hàng theo batch ngày chốt.
- [x] Dòng tổng hợp Store trong Finance không cho xóa trực tiếp.
- [x] Sổ phát sinh cửa hàng gom theo ngày.
- [x] Group ngày hiển thị tổng thu, tổng chi, chênh lệch và trạng thái.
- [x] Ngày chưa chốt có nút Chốt ngày trực tiếp.
- [x] Ngày chờ xác nhận có nút Review.
- [x] Ngày đã xác nhận có nút Xem.
- [ ] Runtime kiểm tra bộ lọc ngày và Thu/Chi.
- [ ] Runtime kiểm tra chốt trực tiếp từ group ngày.
- [ ] Chạy `pnpm check`, `pnpm test`, `pnpm build`.
