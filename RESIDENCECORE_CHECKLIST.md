# RESIDENCECORE_CHECKLIST.md — Tổng checklist ResidenceCore / App Lưu Xá

Cập nhật đến: **27/07/2026 — Audit tổng thể tính năng theo code hiện tại**
Trạng thái tổng: **Luồng quản lý P0 đã có và từng smoke PASS; Portal/Cửa hàng còn thiếu runtime UAT; nhiều module nâng cao mới ở mức code rời, chưa nối route/menu/API đầy đủ**.

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


---

### D13 — Main flow cleanup: Simple mode + typecheck nền

- [x] Simple manager menu giữ main flow trước: Dashboard, Học viên, Tổ chức, Tài chính, Sinh hoạt hằng ngày, Công tác.
- [x] Simple mode không hiển thị Phòng ở.
- [x] Simple mode tạm ẩn Store khỏi menu để tránh lệch trọng tâm main flow.
- [x] Activities/Discipline đưa về trạng thái Sau trong Simple mode.
- [x] Sửa typecheck Activities với shared `EmptyState`, `TimePickerInput`, confirm handler.
- [x] Sửa typecheck ResidentStore với shared `FormDateInput`.
- [x] Sửa typecheck StoreLedger tab cashflow và Drizzle date conditions.
- [x] Sửa typecheck resident duty/portal guards và store handover input mapping.
- [x] `tsc --noEmit` pass.
- [x] `vitest run` pass.
- [ ] Runtime smoke test Simple menu trên browser.
- [ ] Tiếp tục polish UI các trang main flow còn lệch header/form style.


---

### D14 — Luồng test Trực cửa hàng và sổ sách đơn giản

#### D14.1 — Chuẩn bị dữ liệu test tối thiểu

- [ ] Có 1 manager.
- [ ] Có 2 học viên resident có tài khoản portal: 1 người trực ca sáng, 1 người trực ca chiều.
- [ ] Có 1 cửa hàng chính/ledger active.
- [ ] Có ít nhất 2 sản phẩm active:
  - [ ] Sản phẩm A có tồn đầu hoặc được nhập trước khi bán.
  - [ ] Sản phẩm B dùng để test nhập kho.
- [ ] Có cấu hình công tác loại `Trực cửa hàng`.
- [ ] Có ngày test cố định, ví dụ hôm nay, để dễ đối chiếu sổ.

#### D14.2 — Manager phân công ca trực cửa hàng

- [ ] Manager vào Công tác / Trực nhật.
- [ ] Tạo phân công Trực cửa hàng ca sáng cho resident A.
- [ ] Chọn đúng cửa hàng/ledger.
- [ ] Nhập tiền đầu ca dự kiến.
- [ ] Tạo phân công Trực cửa hàng ca chiều cho resident B cùng ngày/cùng ledger.
- [ ] Hệ thống tạo `storeShifts` tương ứng:
  - [ ] Ca sáng: 07:00-12:00, access 07:00-13:00.
  - [ ] Ca chiều: 13:00-18:00, access 13:00-19:00.
- [ ] Không cho tạo trùng cùng ledger + cùng ngày + cùng loại ca.
- [ ] Không cho phân công Trực cửa hàng cho tổ/nhóm, chỉ trực tiếp học viên.

#### D14.3 — Resident chọn ngày/ca để vào cửa hàng

- [ ] Resident A vào `/resident/store`.
- [ ] Chọn ngày test và ca sáng.
- [ ] Nếu ngày + ca sáng đúng phân công của resident A thì vào được phiên cửa hàng ngày đó.
- [ ] Resident B vào `/resident/store`.
- [ ] Chọn ngày test và ca chiều.
- [ ] Nếu ngày + ca chiều đúng phân công của resident B thì vào được phiên cửa hàng ngày đó.
- [ ] Resident không thuộc ca đã chọn không vào được phiên cửa hàng.
- [ ] Resident chọn nhầm ngày/ca không thuộc mình thì bị chặn rõ ràng.

#### D14.4 — Resident vào ca và thao tác cửa hàng

- [ ] Resident A vào `/my-duties`, thấy công tác Trực cửa hàng.
- [ ] Resident A chọn đúng ngày + ca sáng trong `/resident/store`.
- [ ] Nếu ca sáng là phiên hiện tại thì được thêm giao dịch/phiếu bán/phiếu nhập theo quyền.
- [ ] Nếu ca sáng không phải phiên hiện tại thì chỉ được xem và chốt sổ nếu đúng rule, không được thêm/xóa/sửa giao dịch.
- [x] UI `/resident/store` ẩn tab ghi nhận bán/nhập/bàn giao khi ca không phải phiên hiện tại.
- [x] UI `/resident/store` hiển thị cảnh báo chế độ chỉ xem/chốt sổ khi ca không phải phiên hiện tại.
- [x] UI `/resident/store` chặn submit bán/nhập nếu ca không phải phiên hiện tại.
- [ ] Resident chỉ thấy đúng ledger của ca trực.
- [ ] Resident không tạo/sửa sản phẩm, không sửa ledger.
- [ ] Resident được xem sản phẩm, sổ phát sinh, nhập/bán theo quyền ca.

#### D14.5 — Ca sáng bán/nhập và bàn giao

- [ ] Resident A tạo phiếu bán sản phẩm A.
- [ ] Tồn sản phẩm A giảm.
- [ ] Sổ phát sinh có khoản thu `sales`.
- [ ] Resident A tạo phiếu nhập kho sản phẩm B nguồn mua hàng.
- [ ] Tồn sản phẩm B tăng.
- [ ] Sổ phát sinh có khoản chi mua hàng.
- [ ] Resident A lập bàn giao sang ca chiều.
- [ ] Expected cash = tiền đầu ca + tổng thu - tổng chi.
- [ ] Nhập tiền thực tế thấp/cao hơn expected cash thì lưu chênh lệch và lý do.
- [ ] Resident A ký giao.
- [ ] Sau khi ký giao, bàn giao không được chỉnh sửa.

#### D14.6 — Ca chiều nhận bàn giao và chốt ngày

- [ ] Resident B vào ca chiều bằng cách chọn đúng ngày + ca chiều của mình.
- [ ] Resident B xem bàn giao từ ca sáng.
- [ ] Resident B ký nhận.
- [ ] Tiền đầu ca chiều được cập nhật bằng tiền thực tế bàn giao.
- [ ] Resident B tiếp tục bán/nhập nếu có.
- [ ] Resident B xem trước chốt ngày.
- [ ] Chỉ ca chiều được chốt ngày.
- [ ] Chốt ngày tạo daily closing trạng thái chờ review/closed theo rule hiện tại.
- [ ] Sau khi resident chốt ngày, quyền cửa hàng của ca chiều bị kết thúc.

#### D14.7 — Manager review, xác nhận và đẩy sổ chung

- [ ] Manager vào `/store-cashflow`.
- [ ] Xem group theo ngày: tổng thu, tổng chi, chênh lệch, trạng thái.
- [ ] Review ngày chốt.
- [ ] Xác nhận ngày chốt.
- [ ] Finance nhận đúng 2 dòng tổng hợp theo batch ngày:
  - [ ] Tổng thu cửa hàng.
  - [ ] Tổng chi cửa hàng.
- [ ] Xác nhận lại không tạo trùng dòng Finance.
- [ ] Dòng Finance nguồn `store_daily_closing` không cho xóa trực tiếp từ Finance.
- [ ] Sau xác nhận không thể mở lại/chỉnh ngày chốt.

#### D14.8 — Luồng âm tính bắt buộc

- [ ] Resident không thuộc ca không vào được cửa hàng dù biết ngày/ca.
- [ ] Resident ca sáng không được chốt ngày.
- [ ] Resident ca chiều không được ký giao thay ca sáng.
- [ ] Bán vượt tồn bị chặn, không tạo thu.
- [ ] Ngày đã chốt/review/confirmed không cho tạo thêm phát sinh.
- [ ] Hủy giao dịch đã chốt bị chặn hoặc yêu cầu mở lại theo rule manager.
- [ ] Chọn đúng ca nhưng không phải phiên hiện tại: mọi thao tác thêm/xóa/sửa giao dịch bị chặn.

#### D14.9 — Nguyên tắc test sổ sách đơn giản nhất

- [ ] Chỉ dùng 1 cửa hàng chính trong smoke test.
- [ ] Chỉ dùng 1 ngày test, 2 ca: sáng và chiều.
- [ ] Chỉ dùng 2 sản phẩm, 1 phiếu nhập, 1 phiếu bán, 1 khoản chi vận hành nếu cần.
- [ ] Đối chiếu theo 3 bảng số:
  - [ ] Tồn kho: nhập tăng, bán giảm, không âm.
  - [ ] Sổ cửa hàng: thu/chi theo ngày khớp phiếu.
  - [ ] Sổ chung Finance: chỉ nhận tổng sau khi manager xác nhận.
- [ ] Không test nhiều ledger, nhiều ngày, nhiều loại nguồn cùng lúc trong P0.

---

### D15 — Smoke test main flow trên browser

- [x] Dev server chạy được tại `http://localhost:3000/`.
- [x] Đồng bộ seed demo manager với UI login: `admin / Admin@123`.
- [x] Login manager qua browser thành công.
- [x] Luồng đổi mật khẩu lần đầu hiển thị đúng và đổi mật khẩu xong quay về login.
- [x] Sau khi login lại, các route P0 render không 404, không runtime crash:
  - [x] `/dashboard`
  - [x] `/members`
  - [x] `/organization`
  - [x] `/finance`
  - [x] `/daily-routine`
  - [x] `/duties`
  - [x] `/store-ledger`
- [x] Simple menu không còn menu Phòng trong nhánh chính; route `/rooms` vẫn giữ cho Detailed mode.
- [x] Chặn lỗi console local do analytics `/umami` trỏ nhầm về app localhost.
- [x] Browser smoke trên tab mới không còn error/warn console cho main routes.
- [x] `npm run check` pass.
- [x] `npm test` pass.
- [x] `npm run build` pass.
- [x] Bổ sung test tự động cho store duty access: chọn ngày/ca, không token, current shift ghi được, non-current chỉ đọc/chốt, sai ledger/member bị chặn.
- [ ] Bổ sung test tự động cho seed default manager để đảm bảo user tồn tại thì password demo vẫn được reset đúng.
- [ ] Bổ sung browser/e2e test đăng nhập + mở 7 route P0.
- [ ] Tạo dữ liệu resident portal riêng để test `/resident/store` bằng tài khoản học viên, không dùng manager.

---

## Snapshot toàn dự án — sau bước store duty access test

### Trạng thái tổng

- [x] Main flow quản lý đã smoke test browser: Dashboard, Học viên, Tổ chức, Tài chính, Sinh hoạt hằng ngày, Công tác, Store ledger.
- [x] Simple mode đã tập trung main flow, không đưa Phòng/Cửa hàng vào nhánh chính.
- [x] UI premium đã apply cho các màn hình chính ưu tiên: Học viên, Tổ chức, Duties, Finance, DailyRoutine, StoreLedger ở mức đủ đi luồng.
- [x] Login demo manager đã đồng bộ seed/UI và đi được qua đổi mật khẩu lần đầu.
- [x] Typecheck pass.
- [x] Unit test pass: 10 tests / 3 files.
- [x] Production build pass.

### Main flow P0 còn cần làm

- [ ] Tạo bộ dữ liệu test resident portal chuẩn: 2 học viên có user portal, 1 ca sáng, 1 ca chiều, cùng 1 ledger.
- [ ] Smoke test browser bằng tài khoản học viên thật cho `/resident/store`.
- [ ] Test thao tác cửa hàng học viên theo kịch bản 1 ngày / 2 ca:
  - [ ] Ca sáng vào đúng ngày+ca và ghi bán/nhập.
  - [ ] Ca sáng bàn giao sang ca chiều.
  - [ ] Ca chiều nhận bàn giao, ghi phát sinh nếu có, chốt ngày.
  - [ ] Ngoài phiên hiện tại chỉ xem/chốt, không thêm/xóa/sửa giao dịch.
- [ ] Manager review/chốt sổ cửa hàng và đẩy tổng thu/chi sang Finance.
- [ ] Thêm e2e smoke login + mở 7 route P0.

### P1 sau khi P0 ổn

- [ ] Viết test seed default manager: user đã tồn tại vẫn reset password demo đúng.
- [ ] Tách chunk build lớn: `index`, `Dashboard`, `Members`, `FinanceLite`, `StoreLedger` nếu cần tối ưu tải.
- [ ] Chuẩn hóa encoding một số file/comment cũ đang hiện mojibake trong terminal.
- [ ] Polish sâu responsive/mobile cho StoreLedger và ResidentStore.
- [ ] Gom style header/form thành pattern reusable hơn để áp dụng đều cho các form còn lại.

---

## Demo readiness audit — ngoài module Cửa hàng

### Đủ để demo main flow quản lý

- [x] Auth local đăng nhập được bằng tài khoản demo manager.
- [x] Đổi mật khẩu lần đầu hoạt động.
- [x] Dashboard render dữ liệu tổng quan.
- [x] Học viên render danh sách, thẻ/list, trạng thái hồ sơ.
- [x] Tổ chức render cơ cấu, nhiệm kỳ, Tổ/Ban, bổ nhiệm.
- [x] Tài chính lưu xá render kỳ thu, khoản phải thu, thu chi.
- [x] Sinh hoạt hằng ngày render lịch/công tác trong ngày.
- [x] Công tác / Trực nhật render phân công và mẫu công tác.
- [x] Người dùng & quyền truy cập có route ở detailed mode.
- [x] Portal học viên đã có route chính: hôm nay, hồ sơ, công tác, tài chính, thông báo, hoạt động.

### Thiếu P0 trước khi deploy demo sạch

- [ ] Đóng gói seed demo repeatable thành command, ví dụ `npm run db:seed-demo`.
- [ ] Đồng bộ seed demo cũ `ResidenceCore_reset_demo_phase2.sql` với login hiện tại:
  - [ ] `admin / Admin@123`.
  - [ ] role chính là `manager`, không quay về role `admin` cũ.
  - [ ] không mâu thuẫn với `seedDefaultManager.ts`.
- [ ] Tạo script/guide deploy demo ngắn: migrate DB, seed manager/demo, build, start.
- [ ] Kiểm tra DB demo mới tinh có đủ dữ liệu cho 7 route P0, không chỉ có tài khoản admin.
- [ ] Chạy smoke browser sau khi reset DB demo từ đầu.
- [ ] Chốt danh sách menu Simple cho demo: chỉ hiện Dashboard, Học viên, Tổ chức, Tài chính, Sinh hoạt, Công tác.
- [ ] Ẩn hoặc giữ disabled các module chưa demo: Phòng ở trong Simple, Hoạt động nâng cao, Nội quy nâng cao, học tập/kỹ năng/phụng vụ/báo cáo.
- [ ] Kiểm tra `.env.example` hoặc guide env deploy có đủ: DB, JWT, STORE_ACCESS_SECRET, PORT, analytics optional.
- [ ] Quyết định storage demo: không cần Forge/S3 nếu chỉ dùng ảnh base64/url; nếu cần upload ngoài thì bổ sung env storage.

### P1 sau demo

- [ ] Nối hoặc archive các page orphan chưa vào route/menu: học tập nâng cao, kỹ năng, phụng vụ, báo cáo, phụ huynh, smart assignment.
- [ ] Chuẩn hóa docs local/deploy guide đang còn nhắc OAuth/Manus cũ trong khi app hiện dùng local auth.
- [ ] Bổ sung e2e route smoke tự động cho manager và resident.
- [ ] Tối ưu bundle lớn trước khi public demo rộng.

---

## Tài liệu nghiệp vụ

- [x] Tạo Business Process Document dạng DOCX: `docs/ResidenceCore_Business_Process_Document.docx`.
- [x] Tạo Blueprint dạng DOCX: `docs/ResidenceCore_Blueprint.docx`.
- [x] Tạo User Guide / User Manual dạng DOCX, ngôn ngữ dễ hiểu: `docs/ResidenceCore_User_Guide.docx`.
- [x] Tạo Implementation & Deployment Standard dạng DOCX: `docs/ResidenceCore_Implementation_Deployment_Standard.docx`.
- [x] Tạo bộ tài liệu BA chi tiết dạng DOCX:
  - [x] SRS chi tiết: `docs/ResidenceCore_SRS_Detailed.docx`.
  - [x] BA Blueprint chi tiết: `docs/ResidenceCore_BA_Blueprint_Detailed.docx`.
  - [x] User Manual chi tiết: `docs/ResidenceCore_User_Manual_Detailed.docx`.
- [x] Nội dung bao gồm: mục tiêu/phạm vi, vai trò, quy trình nghiệp vụ theo module, luồng demo đề xuất, checklist deploy demo, rủi ro và phụ lục route/router.
- [x] Nội dung Implementation Standard gồm: chuẩn triển khai, môi trường, migration/seed, build/deploy, smoke test, UAT, bảo mật, vận hành, rollback và checklist release.
- [x] Nội dung SRS chi tiết gồm: scope P0/P1/P2, stakeholder, thuật ngữ, phân quyền, functional requirements FR-01 đến FR-10, NFR, data requirements, UAT scenarios, traceability, rủi ro và acceptance criteria.
- [x] Nội dung BA Blueprint chi tiết gồm: product vision, capability map, user journey, module/data/navigation/deployment blueprint, roadmap và open items.
- [x] Nội dung User Manual chi tiết gồm: hướng dẫn theo vai trò manager/resident, từng màn hình P0, cửa hàng mở rộng, checklist demo, lỗi thường gặp và quy tắc vận hành.
- [x] Bổ sung diagram kiểu UML/workflow/data flow vào bộ tài liệu BA:
  - [x] Manager workflow main flow P0.
  - [x] Data flow context giữa Manager/Resident, ResidenceCore, Database và Documents.
  - [x] Resident store shift workflow: chọn ngày/ca, kiểm tra phân công, phân quyền phiên hiện tại.
  - [x] BA delivery process theo vai trò BA/PO, Dev, QA/UAT, Ops.
- [x] Bổ sung screenshot backlog trong User Manual: danh sách màn hình/route/nội dung cần chụp cho Login, Dashboard, Members, Organization, Finance, DailyRoutine, Duties, Resident Portal, Resident Store và Store Cashflow.
- [x] Chụp screenshot thật cho manager P0 và nhúng vào User Manual:
  - [x] Dashboard.
  - [x] Học viên.
  - [x] Tổ chức lưu xá.
  - [x] Tài chính lưu xá.
  - [x] Sinh hoạt hằng ngày.
  - [x] Công tác / Trực nhật.
- [x] Bổ sung hướng dẫn từng bước dạng 1.1, 1.2, 1.3... cho Login, Dashboard, Học viên, Tổ chức, Tài chính, Sinh hoạt, Công tác, Portal học viên.
- [x] Kiểm tra cấu trúc DOCX: 53 paragraphs, 17 tables, 1 section, heading hierarchy đầy đủ.
- [x] Kiểm tra cấu trúc Blueprint: 29 paragraphs, 8 tables, 1 section, heading hierarchy đầy đủ.
- [x] Kiểm tra cấu trúc User Guide: 96 paragraphs, 5 tables, 1 section, heading hierarchy đầy đủ.
- [x] Kiểm tra cấu trúc Implementation Standard: 106 paragraphs, 19 tables, 1 section, 31 headings, heading hierarchy đầy đủ.
- [x] Kiểm tra cấu trúc SRS chi tiết: 79 paragraphs, 24 tables, 1 section, 30 headings, 3 images, heading hierarchy đầy đủ.
- [x] Kiểm tra cấu trúc BA Blueprint chi tiết: 45 paragraphs, 11 tables, 1 section, 13 headings, 4 images, heading hierarchy đầy đủ.
- [x] Kiểm tra cấu trúc User Manual chi tiết: 163 paragraphs, 20 tables, 1 section, 38 headings, 9 images, heading hierarchy đầy đủ.
- [x] Kiểm tra table geometry: tất cả bảng có `tblW` và `tblGrid`.
- [ ] Visual render QA bằng LibreOffice/soffice chưa chạy được trên máy hiện tại vì thiếu executable `soffice`.

---

## Audit tổng thể tính năng — 27/07/2026

> Quy ước riêng cho snapshot này:
> - `[x]` Có đủ luồng chính trong code và đã có bằng chứng test/smoke trước đó.
> - `[-]` Đã có code nhưng chưa đủ UAT/runtime hoặc còn thiếu một phần quan trọng.
> - `[ ]` Chưa nối vào sản phẩm hiện hành, mới là page rời/backlog hoặc chưa có bằng chứng triển khai.
> - `[!]` Có rủi ro cần xử lý trước khi phát hành.

### 1. Nền tảng, xác thực và phân quyền

- [x] React 19 + Vite + TypeScript; backend Express + tRPC + Drizzle/MySQL.
- [x] Đăng nhập local bằng username/password.
- [x] Đăng xuất và xóa cookie phiên đăng nhập.
- [x] Lấy thông tin người dùng hiện tại (`auth.me`).
- [x] Đổi mật khẩu bắt buộc lần đầu.
- [x] Cập nhật hồ sơ cá nhân và đổi mật khẩu cá nhân.
- [x] Phân vai trò chính `manager` / `resident`.
- [x] Layout và menu tách theo vai trò.
- [-] Quản lý người dùng và gán role đã có route `/settings/users` trong Detailed mode; coverage test còn mỏng.
- [!] Chưa có bộ test tự động đầy đủ cho login sai, khóa user, rate limit, hết hạn phiên và toàn bộ ma trận quyền.
- [!] Chưa xác nhận cách ly đa đơn vị/đa lưu xá; code hiện tại chủ yếu vận hành theo một ResidenceCore.

### 2. Dashboard quản lý

- [x] Route `/dashboard`.
- [x] API tổng hợp dashboard.
- [x] Hiển thị số liệu tổng quan.
- [x] Đã từng browser smoke PASS trong main flow P0.
- [-] Chưa có e2e tự động kiểm tra số liệu dashboard với database seed mới tinh.

### 3. Học viên và hồ sơ

- [x] Route `/members`.
- [x] Danh sách, tìm kiếm, thống kê và xem chi tiết học viên.
- [x] Tạo, sửa, cho rời lưu xá và kích hoạt lại học viên.
- [x] Gán phòng có kiểm tra trạng thái và sức chứa; giữ lịch sử gán phòng.
- [x] Quản lý cha/mẹ/người giám hộ trong hồ sơ học viên.
- [x] Quản lý thông tin học tập và lịch học.
- [x] Tạo tài khoản portal cho một hoặc nhiều học viên.
- [x] Main flow đã từng browser smoke PASS.
- [-] Chưa có unit/integration test đầy đủ cho CRUD hồ sơ, phụ huynh, học tập và cấp tài khoản hàng loạt.

### 4. Phòng ở

- [x] Route `/rooms` trong Detailed mode.
- [x] Danh sách, tạo, sửa và quản lý trạng thái phòng.
- [x] Xem cư dân/phân bổ phòng và kiểm tra sức chứa trong luồng gán.
- [-] Phòng được chủ động ẩn khỏi Simple mode.
- [!] Tổ/khu trong form phòng còn hard-code (`TODO` trong `Rooms.tsx`), chưa lấy từ backend.
- [-] Chưa có browser/e2e test riêng cho toàn bộ vòng đời phòng.

### 5. Tổ chức lưu xá

- [x] Route hợp nhất `/organization`.
- [x] Quản lý vai trò/chức vụ.
- [x] Quản lý nhiệm kỳ và nhiệm kỳ đang hoạt động.
- [x] Quản lý Tổ/Ban/đơn vị.
- [x] Bổ nhiệm, kết thúc và xóa phân công chức vụ.
- [x] Quản lý thành viên Tổ/Ban, chuyển tổ và đồng bộ trưởng/phó.
- [x] Main flow đã từng browser smoke PASS.
- [-] Chưa có test tự động bao phủ toàn bộ CRUD và các ràng buộc nhiệm kỳ/chức vụ.

### 6. Sinh hoạt hằng ngày

- [x] Route `/daily-routine`.
- [x] Xem lịch theo ngày và tổng quan hôm nay.
- [x] Tạo, sửa, hoàn thành, hủy và xóa lịch sinh hoạt.
- [x] Quản lý mẫu lịch và các mục trong mẫu.
- [x] Main flow đã từng browser smoke PASS.
- [-] Chưa có e2e cho tạo mẫu → áp dụng → hoàn thành/hủy trên UI.

### 7. Công tác / Trực nhật

- [x] Route quản lý `/duties` và route học viên `/my-duties`.
- [x] Quản lý mẫu công tác, cấu hình và checklist.
- [x] Phân công đơn lẻ, hàng loạt, theo ngày/khoảng ngày/đối tượng.
- [x] Hoàn thành, bỏ qua, hủy và đánh giá công tác.
- [x] Gợi ý phân công thông minh ở backend.
- [x] Guard manager và endpoint dành cho resident đã được kiểm tra.
- [x] Có unit test resident duty và store duty access.
- [-] Chưa có browser e2e toàn bộ vòng đời phân công → thực hiện → đánh giá.

### 8. Tài chính lưu xá

- [x] Route `/finance`.
- [x] Tổng quan tài chính.
- [x] Danh mục khoản phí.
- [x] Kỳ thu, xem chi tiết, preview và áp dụng kỳ thu.
- [x] Khoản phải thu theo học viên; tạo hàng loạt, cập nhật và hủy.
- [x] Giao dịch thu/chi; ghi nhận thanh toán và xóa theo guard.
- [x] Bỏ qua học viên inactive/đã rời và chặn dữ liệu trùng theo kỳ.
- [x] Main flow đã từng browser smoke PASS.
- [-] Chưa có integration/e2e đối chiếu số dư và rollback giao dịch trên database sạch.

### 9. Hoạt động / Sự kiện

- [x] Route manager `/activities` và resident `/resident/activities`.
- [x] API danh sách, thống kê, chi tiết, tạo, sửa, hủy và xóa.
- [x] Portal học viên xem hoạt động.
- [-] Simple mode đang để disabled/badge “Sau”; Detailed mode mới mở.
- [-] Checklist cũ còn mục “chốt 14L PASS chính thức”.
- [-] Chưa có test tự động hoặc UAT cuối xác nhận toàn bộ luồng.

### 10. Nội quy và nhắc nhở

- [-] Có route `/discipline-rules` và trang nội quy cho resident.
- [-] Simple mode đang disabled; Detailed mode có menu Nội quy.
- [-] Chưa thấy router backend chuyên biệt được đăng ký trong `appRouter`.
- [ ] Vi phạm/kỷ luật nâng cao (`DisciplineCases`) chưa nối vào route/menu hiện hành.
- [!] Cần audit dữ liệu thật và quyền CRUD trước khi công bố hoàn thành.

### 11. Thông báo nội bộ

- [x] Resident có route `/resident/notifications`.
- [x] API lấy danh sách, đếm chưa đọc và đánh dấu đã đọc.
- [x] Badge chưa đọc và popup lite đã được triển khai theo checklist lịch sử.
- [-] Trang cấu hình sở thích thông báo tồn tại nhưng chưa nối route/menu.
- [-] Chưa có test tự động cho tạo/phân phối/đọc thông báo.

### 12. Portal học viên

- [x] Hôm nay: `/resident/today`.
- [x] Hồ sơ: `/my-profile`; có thêm route thông tin `/resident/information`.
- [x] Công tác: `/my-duties`.
- [x] Tài chính: `/resident/finance`.
- [x] Thông báo: `/resident/notifications`.
- [x] Hoạt động: `/resident/activities`.
- [x] Context học viên liên kết, phạm vi tổ chức và phạm vi công tác.
- [-] Các route vai trò/tổ/ban đã có trong `App.tsx` nhưng chưa nằm trong menu resident chính.
- [-] Chưa có bộ seed portal chuẩn gồm 2 học viên và tài khoản thật để UAT lặp lại.
- [!] Chưa có browser e2e đăng nhập resident và đi toàn bộ portal.

### 13. Cửa hàng / Kho / Sổ cửa hàng

- [x] Các route manager: `/store-products`, `/store-purchase`, `/store-sales`, `/store-cashflow`; route tổng `/store-ledger`.
- [x] Sản phẩm, ảnh sản phẩm, giá bán và lịch sử giá.
- [x] Nhập hàng/mua hàng, tăng tồn và tính lại giá vốn.
- [x] Bán hàng, giảm tồn và ghi khoản thu.
- [x] Sổ thu/chi, phiếu nhiều dòng và preview chứng từ.
- [x] Ca trực cửa hàng gắn với công tác.
- [x] Chọn ngày/ca, token truy cập, kiểm tra đúng resident/ledger/phiên hiện tại.
- [x] Ngoài phiên hiện tại chỉ xem/chốt; UI và backend có guard.
- [x] Bàn giao ca, expected cash, tiền thực tế và chênh lệch.
- [x] Chốt ngày, manager review/xác nhận và cơ chế đẩy tổng hợp sang Finance đã có trong code.
- [x] Có test tự động cho quyền truy cập ca cửa hàng.
- [-] Chưa UAT trọn luồng 1 ngày/2 ca/2 học viên trên browser với dữ liệu thật.
- [-] Chưa xác nhận runtime: ca sáng bán/nhập → bàn giao → ca chiều nhận/chốt → manager xác nhận → Finance nhận đúng hai dòng.
- [!] Đây là phần P0 lớn nhất còn mở trước khi demo sạch.

### 14. Người dùng, role và hồ sơ cá nhân

- [x] Route manager `/settings/users`.
- [x] API danh sách/tạo/sửa user và bật/tắt trạng thái.
- [x] API danh sách role và gán role cho user.
- [x] Route `/my-profile` và API cập nhật hồ sơ/đổi mật khẩu.
- [-] Chưa có test tự động bao phủ CRUD user, khóa tài khoản và gán/thu hồi role.

### 15. Các module mở rộng

- [x] Phụ huynh độc lập (`Parents`) — đã nối route `/parents`, menu Detailed và API `members` thật ngày 27/07/2026.
- [-] Học tập nâng cao:
  - [x] Thông tin học tập (`AcademicInfo`) đã nối route `/academic-info`, menu Detailed và API `members` thật.
  - [x] Lịch học (`Schedule`) đã nối route `/study-schedule`, menu Detailed và API `members` thật.
  - [ ] Đánh giá học tập (`AcademicEvaluations`) mới có page, chưa có backend nghiệp vụ.
- [-] Điểm danh:
  - [x] Router `attendance` hiện hành có manager guard.
  - [x] Quản lý danh sách, tạo và sửa lịch điểm danh tại `/attendance-schedules`.
  - [x] Điểm danh theo ngày + lịch tại `/attendance`.
  - [x] Tải dữ liệu đã lưu, cập nhật trạng thái/ghi chú và lưu hàng loạt có transaction.
  - [x] Hai màn hình đã nối menu Detailed; không xuất hiện trong Simple mode.
  - [x] Dùng date/time picker shared.
  - [x] Test manager/resident guard và validation thời gian.
  - [x] Xóa lịch bằng confirm modal custom; backend chặn xóa lịch đã phát sinh điểm danh.
  - [ ] Browser UAT với database thật.
- [-] Câu lạc bộ:
  - [x] Thay toàn bộ dữ liệu mẫu trong `Clubs` bằng API/database thật.
  - [x] Schema và migration `20260727_clubs_module.sql`.
  - [x] CRUD câu lạc bộ; validate mã, số thành viên và sức chứa.
  - [x] Manager guard ở router `clubs`.
  - [x] Route `/clubs` và menu Detailed; không xuất hiện trong Simple mode.
  - [x] Xóa bằng confirm modal custom.
  - [x] Test guard và validation sức chứa.
  - [ ] Chạy migration và browser UAT trên database thật.
- [ ] Kế hoạch hoạt động: `ActivityPlans`.
- [ ] Phụng vụ: lịch, phân công và điểm danh.
- [-] Kỹ năng:
  - [x] Danh mục Kỹ năng đã chuyển từ dữ liệu mẫu sang CRUD database thật.
  - [x] Schema và migration `20260727_skills_module.sql`.
  - [x] Manager guard, validation mã/trạng thái/cấp độ.
  - [x] Route `/skills`, menu Detailed và confirm modal khi xóa.
  - [x] Backend chặn xóa kỹ năng đã có lớp hoặc kết quả.
  - [x] Test router và navigation.
  - [ ] Chạy migration và browser UAT database thật.
  - [ ] Lớp kỹ năng (`SkillClasses`) chưa chuyển khỏi dữ liệu mẫu.
  - [ ] Kết quả kỹ năng (`SkillResults`) chưa chuyển khỏi dữ liệu mẫu.
- [x] Phân công thông minh đã nối route `/smart-assignment`, menu Detailed và API `duties` thật.
- [ ] Báo cáo tổng hợp.
- [ ] Theo dõi phí/tài chính phiên bản cũ (`Fees`, `Financial`).
- [-] Thiết lập:
  - [x] Sở thích thông báo đã nối route `/settings/notifications`, menu Detailed và API `system` thật.
  - [ ] Thiết lập ứng dụng và danh mục giáo dục chưa có backend nghiệp vụ đầy đủ.
- [ ] Các page legacy `Residents`, `RoomDetail`, `Schedules`, `Tasks`.
- [ ] Component showcase chỉ phục vụ phát triển, không phải tính năng người dùng.
- [x] Test navigation xác nhận các route mở rộng đã hoàn thiện chỉ xuất hiện trong Detailed mode.
- [!] Các page còn lại không được xem là “đã hoàn thành” chỉ vì có file TSX; cần route + menu + API thật + quyền + test + tài liệu.

### 16. Chất lượng, kiểm thử và sẵn sàng phát hành

- [x] TypeScript `pnpm check` PASS ngày 27/07/2026.
- [x] Unit test PASS ngày 27/07/2026 sau danh mục Kỹ năng: 20/20 tests, 7/7 test files.
- [x] Production build PASS ngày 27/07/2026.
- [x] Bằng chứng gần nhất trong checklist: browser smoke manager trên 7 route P0 từng PASS.
- [!] Build còn cảnh báo chunk `index` lớn hơn 500 kB; không chặn build nhưng cần tối ưu trước khi public rộng.
- [ ] E2E tự động login manager + 7 route P0.
- [ ] E2E tự động cho resident portal.
- [ ] Integration test CRUD cho Members, Rooms, Organization, DailyRoutine, Finance và Store.
- [ ] Test bảo mật: authorization matrix, IDOR/scope, brute force/rate limit, cookie/session.
- [ ] Test responsive/mobile và accessibility.
- [ ] Test migration + seed trên database trống.
- [ ] Test backup/restore và rollback deploy.

### 17. Deploy, dữ liệu demo và vận hành

- [x] Có lệnh build và start production.
- [x] Có migration Drizzle và seed default manager.
- [x] Có tài liệu setup/deploy và bộ tài liệu BA/User Manual.
- [-] Chưa có command `db:seed-demo` repeatable cho toàn bộ dữ liệu demo.
- [ ] Đồng bộ script reset demo cũ với `admin / Admin@123` và role `manager`.
- [ ] Xác nhận `.env.example`/guide đủ DB, JWT, `STORE_ACCESS_SECRET`, PORT và analytics optional.
- [ ] Smoke test từ database sạch sau migrate + seed.
- [ ] Checklist VPS thực tế: process manager, reverse proxy, HTTPS, firewall, backup, log rotation và rollback.
- [!] Chưa đủ bằng chứng để đánh dấu production-ready.

### 18. Thứ tự ưu tiên chốt hệ thống

- [x] **P0.1:** Khôi phục dependency bằng pnpm 10.4.1; `pnpm check`, `pnpm test` và `pnpm build` PASS ngày 27/07/2026.
- [ ] **P0.2:** Tạo seed demo repeatable gồm manager, 2 resident, 1 ledger, 2 ca và 2 sản phẩm.
- [ ] **P0.3:** UAT browser trọn luồng resident portal và cửa hàng 1 ngày/2 ca.
- [ ] **P0.4:** Xác nhận manager review/chốt cửa hàng và đối chiếu Finance.
- [ ] **P0.5:** Tự động hóa smoke login + 7 route manager P0.
- [ ] **P0.6:** Audit bảo mật/phân quyền và triển khai từ database sạch.
- [ ] **P1:** Nối từng module nâng cao theo Definition of Done hoặc archive source orphan.
- [ ] **P1:** Chuẩn hóa tài liệu gốc để không lẫn ResidenceCore với bộ checklist QLTruongHoc.

### 19. Kết luận snapshot 27/07/2026

- [x] Có thể tiếp tục demo luồng quản lý P0 dựa trên bằng chứng smoke trước đây.
- [-] Portal resident và module cửa hàng ở mức “đã có code, cần UAT runtime cuối”.
- [ ] Chưa thể tuyên bố toàn bộ hệ thống hoàn thành hoặc production-ready.
- [!] `docs/MASTER_CHECKLIST.md` và `PROJECT_SUMMARY.md` đang mô tả dự án `QLTruongHoc`, không khớp với ResidenceCore hiện tại; nguồn trạng thái ResidenceCore nên dùng file này cho đến khi tài liệu được hợp nhất có chủ đích.
