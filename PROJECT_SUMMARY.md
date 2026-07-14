# PROJECT_SUMMARY.md — ResidenceCore / App Lưu Xá

Cập nhật tổng hợp đến: **Việc 16K4 — Nhập hàng / chi mua hàng tăng tồn, tính lại giá vốn**  
Trạng thái hiện tại: **Việc 1–15 DONE/PASS; Việc 16 đang triển khai module Quản lý cửa hàng**.

---

## 0. Nguyên tắc làm việc bắt buộc

- Luôn làm trên code mới nhất hiện có. Nếu không chắc file/code hiện tại có phải bản mới nhất hay không thì phải hỏi người dùng gửi lại code trước khi patch.
- Không dùng file cũ từ patch/package trước đó làm base nếu có nguy cơ revert chỉnh sửa đã pass.
- Khi người dùng đã gửi file cho một bước và không nói có chỉnh thêm ở nơi khác, xem file đó là base hiện tại cho bước đó.
- Mọi tracking/checklist theo từng việc phải **append-only / full-history**: ghi thêm vào cuối, không ghi đè, không gửi bản rút gọn.
- Các file SQL migration của module cửa hàng đặt trong thư mục `/drizzle`, không đặt trong `/database`.
- Date/time/datetime input phải dùng picker shared, không để input text/date/time thô nếu đã có component chung.
- Input tiền phải format kiểu Việt Nam: `1.000.000`; khi lưu vẫn gửi số đúng về backend.
- UI ưu tiên Simple Mode: đủ chức năng, dễ demo, ít menu, ít thao tác, không phức tạp hóa.
- Style premium dùng cùng hệ với Finance / Organization / Portal Today: nền trắng-kem-amber nhẹ, title centered, action góc phải, card mềm, shadow nhẹ, text slate/black, tránh rời rạc.
- Popup xác nhận/cảnh báo phải là modal custom của hệ thống; tránh browser `alert/confirm`. Popup lỗi phải nổi **trên** modal form hiện tại.

---

## 1. Kiến trúc / phạm vi dự án

ResidenceCore / App Lưu Xá là hệ thống quản lý lưu xá ở chế độ đơn giản, tập trung vào các luồng vận hành chính:

- Học viên / cư dân.
- Phòng ở.
- Liên hệ phụ huynh/người thân.
- Học tập / lịch học.
- Cơ cấu tổ chức / Tổ / Ban / Bổ nhiệm.
- Sinh hoạt hằng ngày / Công tác.
- Tài chính lưu xá.
- Portal học viên.
- Thông báo nội bộ.
- Hoạt động / sự kiện.
- Quản lý cửa hàng lưu xá.

Luồng phát triển ưu tiên:

```txt
DB → Backend routes/services/db → Frontend pages/components → runtime test → update checklist/summary
```

---

## 2. Các rule nghiệp vụ đã bảo vệ

### 2.1 Members / Rooms

- `residents.currentRoomId` là nguồn sự thật cho phòng hiện tại.
- Broad room fallback chỉ dùng hiển thị, không dùng quyết định nghiệp vụ.
- Contact list phải filter đúng theo `residentId`.
- Học viên đã rời/ngừng lưu trú không được thao tác phòng, không được cập nhật dữ liệu vận hành.
- Room assignment phải kiểm tra capacity, active resident, same-room, close old assignment, preserve history.

### 2.2 Organization

- OrgChart layout bảo vệ: Trưởng top-center; Phó / Thư ký / Thủ quỹ row 2; Tổ / Ban bên dưới theo bố cục đã pass.
- Tổ trưởng và Trưởng ban không phải role standalone gán trực tiếp; là appointment theo từng Tổ/Ban.
- Validation Tổ trưởng/Trưởng ban phải scoped theo unit, không global theo role.
- Khi member rời lưu xá có appointment active, cần flow bàn giao trước khi inactive.

### 2.3 Study / Duties

- Lịch học phải check start < end.
- Lịch học overlap theo resident + day bị chặn.
- Công tác phải check conflict với lịch học/duty, có buffer 60 phút nếu đã thiết kế.
- Cancel → reassign được phép.
- Portal công tác phải thấy đúng scope: cá nhân / phòng / tổ / ban.

### 2.4 Finance

- Thu phí học viên theo kỳ/tháng, không chỉ tạo khoản thu chung chung.
- Kỳ thu: tạo kỳ → chọn kỳ/tháng → áp dụng học viên → sinh khoản phải thu thật.
- Thu học viên gom theo tháng, có khoản con, thu từng phần.
- Thu khác/tài trợ, chi, dự chi, tạm ứng cần tách nghiệp vụ rõ.
- Phiếu/chứng từ tương lai cần hỗ trợ: phiếu thu học viên, phiếu thu khác/tài trợ, phiếu chi, phiếu tạm ứng, phiếu đề nghị/dự chi, phiếu quyết toán tạm ứng.

### 2.5 Portal học viên

- Menu học viên phải gọn, ít mục nhất.
- Menu đã gom: Hôm nay; Lưu xá của tôi: Hồ sơ, Công tác, Tài chính, Thông báo, Hoạt động; Phụ trách nếu có chức vụ.
- Portal phải hiển thị dữ liệu liên quan đến học viên và scope chức vụ.

### 2.6 Cửa hàng

- Module là **Quản lý cửa hàng**, không còn “Quỹ riêng” trong UI chính.
- Chỉ quản lý một cửa hàng chính của lưu xá.
- Các chức năng cửa hàng là menu riêng, không dùng query tab cho menu chính: Dữ liệu sản phẩm, Mua hàng / Nhập kho, Bán hàng, Tổng hợp thu chi.
- Header các trang store theo chuẩn flat premium: title centered, subtitle centered, action góc phải, không bo cả nội dung vào một card lớn.
- Dữ liệu hàng hóa chỉ tập trung hàng hóa & nhóm hàng; thông tin giá nâng cao ẩn trong “Thông tin giá”.
- Hàng hóa có thể mua về hoặc tự gia công rồi đưa vào cửa hàng.
- Giá vốn/giá bán phải có lịch sử, không chỉ lưu một field tĩnh.
- Giá bán update append-only lịch sử; lý do không bắt buộc.
- Tồn kho định giá vốn dùng ngôn ngữ dễ hiểu: “Tính theo giá trung bình”, “Theo lần nhập gần nhất”, “Tự nhập”.
- Chốt sổ cửa hàng theo ngày, không chốt từng giao dịch nhỏ sang sổ chung.
- Chốt ngày phải có flow review/xác nhận; trước xác nhận cho phép bỏ chốt để bổ sung.

---

## 3. Trạng thái theo từng việc

### Việc 1 — Route/Menu/Page sync

**Trạng thái:** DONE/PASS

- Audit route/menu/page.
- Sửa các nav path thiếu route.
- `/users` map về `/settings/users`.
- Missing route được disabled/hidden tránh 404.
- Layout xử lý disabled items.

### Việc 2 — Page orphan audit

**Trạng thái:** DONE

- Audit orphan pages.
- Classify connect/keep/archive.
- Không patch code.

### Việc 3 — Main flow Học viên → Phòng → Tổ chức

**Trạng thái:** DONE/PASS

- Guard legacy member assignRoom.
- Manager access check.
- Inactive/left guard.
- Room existence/capacity/same-room check.
- Close old assignment và update current room.
- Guard mutation endpoints rooms router.

### Việc 4 — FinanceLite minimal flow

**Trạng thái:** DONE/PASS

- RBAC manager guard finance router.
- Validate amount > 0.
- Skip inactive/left residents khi batch create.
- Prevent amount < paid amount.
- Duplicate check resolved month.

### Việc 5 — DailyRoutine / Công tác demo flow

**Trạng thái:** DONE/PASS

- RBAC manager guard duties management endpoints.
- Resident endpoints vẫn mở đúng scope.
- Demo flow DailyRoutine / Công tác ổn.

### Việc 6 — Resident Portal real data

**Trạng thái:** DONE/PASS

- Resident linked user/access context.
- Portal me / finance overview / today overview / duty/org scope.
- Guard resident inactive/left.

### Việc 7 — Test baseline cleanup

**Trạng thái:** DONE/PASS

- Legacy `server/routers.test.ts` đổi thành `server/routers.legacy.ts` để không phá test baseline.

### Việc 8 — Definition of Done

**Trạng thái:** DONE

- Đã tạo DoD cho Members, Rooms, Organization, DailyRoutine, FinanceLite.
- Module done cần đủ route/menu, API, business rule, loading/error/empty, test/build/check.

### Việc 9 — Helper/util/style + picker

**Trạng thái:** DONE/PASS

- Shared helper format/utils.
- TimePickerInput shared.
- Replace scattered `type=time`.
- DatePicker portal fix tránh bị clipped trong modal/card.
- Rule: date/time/datetime phải dùng picker.

### Việc 10 — Docs cleanup

**Trạng thái:** DONE/PASS

- README/status/worklog cleanup.
- Archive docs/presentation/legacy.
- Script cleanup docs.
- Chốt Việc 1–10 vào summary/checklist.

### Việc 11 — Member Detail / Học tập layout polish

**Trạng thái:** DONE/PASS

- Review tab con member detail.
- Khôi phục/bảo vệ layout Học tập theo bản Việc 11B.
- Chuẩn hóa style tab học tập/lịch học gọn hơn, premium hơn.
- Tránh revert layout đã pass.

### Việc 12 — Organization + Công tác + Portal theo chức vụ

**Trạng thái:** DONE/PASS

- 12A — Org/Duty/Portal guard/scope patched.
- 12B — Modal error placement PASS: lỗi validate/API hiển thị trong modal bổ nhiệm/phân công, không nằm sau page.
- 12C — Portal công tác theo cá nhân/phòng/tổ/ban PASS.
- 12D — Demo script Organization → Công tác → Portal theo chức vụ PASS.

Kết luận: **Việc 12 DONE/PASS**.

### Việc 13 — Thông báo nội bộ lite

**Trạng thái:** DONE/PASS

- 13A — Notification lite API/page/menu PASS.
- 13B — Popup thông báo mới DONE.
- 13C — Badge số chưa đọc trên menu portal DONE.
- 13D — Polish trang thông báo PASS.
- 13E — Final demo checklist DONE/PASS.

Scope lite: không WebSocket, push/email/SMS/Zalo, template engine phức tạp.

Kết luận: **Việc 13 DONE/PASS**.

### Việc 14 — Hoạt động / Sự kiện lite

**Trạng thái:** 14K pass; 14L final runtime checklist đã tạo, chưa chốt DONE/PASS chính thức trong luồng hiện tại.

- 14A — Activities lite patched.
- 14B/14B2 — DB migration fix compatible MySQL.
- 14C–14J — nhiều vòng polish UI/modal.
- 14K — Activities filter/layout fix PASS.
- 14L — Final runtime checklist đã tạo.

Chức năng chính: manager tạo/sửa/hủy/xóa mềm hoạt động, public hiện portal, nội bộ không hiện portal, filter/search không overlay.

### Việc 15 — Portal học viên mở rộng

**Trạng thái:** DONE/PASS

- 15A — Portal activities route patched.
- 15B — Portal Today polish nhẹ, chưa đủ rõ.
- 15C — Portal Today visible premium restyle PASS.
- 15D — MyDuties polish route cũ, chưa chốt.
- 15E — Gọn menu bước đầu PASS nhưng còn rời rạc.
- 15F — Gom tiếp menu portal học viên PASS.
- 15G — Công tác trong menu mới DONE/PASS.
- 15H — Resident Finance DatePicker fix patched.
- 15I — Format tiền tệ input thực chi PASS.
- 15J — Polish Hoạt động + Thông tin portal PASS.
- 15K — Final runtime checklist PASS.

Kết luận: **Việc 15 DONE/PASS**.

### Việc 16 — Quản lý cửa hàng lưu xá

**Trạng thái:** Đang triển khai. Đã đến **16K4 patch prepared**.

#### Hướng nghiệp vụ đã chốt

- Module là **Quản lý cửa hàng**, không phải quỹ riêng.
- Chỉ một cửa hàng chính, không panel chọn nhiều sổ/quỹ.
- Menu chính: Dữ liệu sản phẩm, Mua hàng / Nhập kho, Bán hàng, Tổng hợp thu chi.
- Route riêng: `/store-products`, `/store-purchase`, `/store-sales`, `/store-cashflow`.
- Chi tiết cửa hàng riêng → chốt theo ngày → review → xác nhận → sau đó mới tổng hợp sang sổ chung.
- Không chốt từng giao dịch nhỏ sang sổ chung.

#### 16A — Store ledger lite

- Tạo nền store ledger, transactions, tổng thu/tổng chi/số dư/phát sinh.
- Input tiền format; ngày dùng picker.
- Hotfix: register router, enum column fix, duplicate ledger code fix.

#### 16B / 16C runtime/hotfix

- Runtime checklist thu/chi.
- Fix render Date object trong StoreLedger.

#### 16D — Daily closing

- Daily closing ban đầu: gom phát sinh theo ngày, tạo chốt ngày, khóa phát sinh đã chốt.

#### 16E / 16E2 — Blocking popup

- Thao tác bị chặn sau chốt ngày phải hiện popup custom.
- Popup phải nổi trên form tạo phiếu.

#### 16F — Daily closing review/approval workflow

Flow đã thiết kế:

```txt
Chốt ngày tạm → Review → Đã review → Xác nhận chốt
```

Trước xác nhận cho phép: **Bỏ chốt để bổ sung**. Sau xác nhận mới khóa chính thức.

#### 16G — Store products lite

- Tạo nền sản phẩm cửa hàng.

#### 16G2 — Store page focus/premium cleanup

- Đổi trang thành Cửa hàng lưu xá.
- Bỏ quỹ riêng trong UI.
- Migration store để trong `/drizzle`.

#### 16H — Store menu regroup

- Bỏ panel cửa hàng đang quản lý.
- Tạo menu lớn Quản lý cửa hàng với menu con.

#### 16I / 16I2 / 16I3 / 16I4 — Product page refinement

- Route/menu từng chức năng cửa hàng.
- Nhóm hàng mặc định: Nông sản, Thủ công, Bánh kẹo, Sách, Đồ uống, Đồ ăn, Văn phòng phẩm, Khác.
- Cho phép tạo nhóm hàng mới.
- Header product page premium/compact.
- Card hàng hóa gọn hơn.
- Tạo sản phẩm không cần giá bán.
- Có nút Thông tin giá.
- Có nút Xóa sản phẩm; chỉ xóa mềm được nếu chưa có tồn/phát sinh mua bán.
- Đơn vị tính: Gói, Cái, Chai, Lít, Cuốn; cho phép tạo thêm.
- Không hiển thị mã hàng trên card chính.

#### 16J / 16J2 / 16J3 / 16J4 — Popup/menu/header standardization

- Xóa sản phẩm dùng modal custom, không browser confirm.
- Không popup thừa sau khi xóa thành công.
- Route riêng cho từng chức năng store.
- Header store flat premium, centered, action góc phải, 2 dòng compact.

#### 16K1 — Store price history foundation

- Thêm sourceType, costingMethod, averageCostPrice, currentSalePrice.
- Thêm `storeProductCostHistories`, `storeProductSalePriceHistories`.
- API `listProductPriceHistory`, `updateProductSalePrice`.
- Safe update fix cho MySQL Workbench.

#### 16K2 — Product pricing visible

- Đưa pricing fields lên UI ban đầu; sau đó đơn giản hóa vì quá rối.

#### 16K3 — Product price history UI simplify

**Trạng thái:** PASS sau hotfix 16K3-8.

- Màn hình chính hàng hóa đơn giản.
- Form thêm/sửa chỉ gồm thông tin cơ bản.
- Giá nâng cao nằm trong nút **Thông tin giá**.
- Modal Thông tin giá hiển thị giá vốn hiện tại, giá bán hiện tại, lịch sử giá vốn, lịch sử giá bán.
- Modal Cập nhật giá bán riêng.
- Lý do thay đổi không bắt buộc.
- Sale price history append-only.
- Fix thiếu bảng lịch sử giá bán/giá vốn.
- Fix format DECIMAL MySQL: `5000.00` hiển thị `5.000`, không thành `500.000`.

#### 16K4 — Nhập hàng / chi mua hàng tăng tồn, tính lại giá vốn

**Trạng thái:** Patch đã tạo, đang chờ apply/test.

Mục tiêu:

- Vào Quản lý cửa hàng > Mua hàng / Nhập kho.
- Chọn hàng hóa, số lượng, giá vào, ngày nhập.
- Lưu nhập hàng.
- Hệ thống tạo khoản chi cửa hàng loại nhập hàng, tăng tồn hiện tại, ghi lịch sử giá vốn, tính lại giá vốn hiện tại theo “tính theo giá trung bình”, chặn nếu ngày đã xác nhận chốt.

Patch đã gửi:

```txt
ResidenceCore_Viec16K4_Purchase_Stock_Increase_Inventory.zip
residencecore_viec16k4_purchase_stock_increase_inventory.patch
```

Migration phải nằm trong:

```txt
/drizzle/viec16k4_purchase_stock_inventory.sql
```

---

## 4. Next steps đề xuất

Sau khi 16K4 pass:

```txt
16K5 — Bán hàng / thu bán hàng giảm tồn
16K6 — Báo cáo tồn kho: tồn hiện tại, giá vốn, giá bán dự kiến
16K7 — Báo cáo dòng tiền cửa hàng
16K8 — Chốt sổ cửa hàng sang sổ chung theo ngày
16K9 — Demo script cửa hàng full flow
```

---

## 5. Checklist test store sau mỗi patch

```txt
pnpm check
pnpm test
pnpm build
```

Runtime store:

- `/store-products` mở được.
- `/store-purchase` mở được.
- `/store-sales` mở được.
- `/store-cashflow` mở được.
- Header đúng 2 dòng, action góc phải.
- Popup custom đúng z-index.
- Không dùng browser alert/confirm.
- Input tiền không nhân sai 100 lần.
- SQL migration nằm trong `/drizzle`.
- Không gọi quỹ riêng trên UI.


---

## Append — Việc 16K4.1: Nhập kho đa nguồn

**Trạng thái:** Patch prepared, chờ apply/runtime test.

Điều chỉnh nghiệp vụ từ 16K4:

- “Nhập hàng” là nghiệp vụ nhập kho tổng quát, không đồng nghĩa mọi trường hợp đều là mua hàng.
- Nguồn nhập hỗ trợ: `purchase` — Mua hàng; `production` — Sản xuất/gia công nội bộ; `self_supply` — Tự cung cấp/được cấp; `other` — Nguồn khác.
- Tất cả nguồn nhập đều tăng tồn, ghi stock movement, ghi lịch sử giá vốn và tính lại giá vốn hiện tại.
- Chỉ nguồn `purchase` tự động tạo giao dịch chi cửa hàng `purchase_stock`.
- Các nguồn sản xuất/tự cung cấp/khác không tự động tạo khoản chi; chi phí riêng nếu có sẽ ghi bằng nghiệp vụ chi phù hợp.
- API mới `createStockIn`; giữ alias `createPurchaseStock` để tương thích bản 16K4 cũ.
- UI đổi thành “Tạo phiếu nhập kho”, hiển thị trường theo nguồn nhập và giải thích rõ tác động dòng tiền.


---

### Việc 16K4.2 — Tách dashboard Nhập kho khỏi số liệu kế toán

**Trạng thái:** Patch prepared, chờ apply/runtime test.

- Trang `/store-purchase` không còn hiển thị các card Tổng thu, Tổng chi, Số dư và Phát sinh.
- Thay bằng số liệu vận hành nhập kho theo khoảng ngày đang lọc: Phiếu nhập, Số lượng nhập, Mặt hàng đã nhập và Phiếu mua hàng.
- Số liệu kế toán/dòng tiền chỉ giữ ở trang Tổng hợp thu chi.
- Mô tả menu Nhập kho đổi sang tập trung phiếu nhập, nguồn nhập và số lượng hàng vào kho.

---

## Cập nhật 16K4.3 — Tách nghiệp vụ nhập kho khỏi thu chi

**Trạng thái:** Patch prepared, chờ apply/runtime test.

Điều chỉnh giao diện trang `/store-purchase`:

- Bỏ **Lịch sử chốt ngày** khỏi trang Nhập kho.
- Bỏ **Sổ phát sinh** khỏi trang Nhập kho.
- Bỏ cụm thao tác **Chốt sổ ngày** và bộ lọc Thu/Chi khỏi trang Nhập kho.
- Trang Nhập kho chỉ giữ bộ lọc thời gian/tìm kiếm và **Lịch sử nhập kho** theo mọi nguồn nhập.
- Các nội dung chốt ngày, dòng tiền và sổ phát sinh tiếp tục thuộc trang **Tổng hợp thu chi**.

Không thay đổi DB, backend hoặc migration trong bước này.


---

## Append — Việc 16K5: Bán hàng theo sản phẩm, giảm tồn và ghi thu

**Trạng thái:** Patch prepared, chờ apply/runtime test.

- Thêm API `createSaleStock` cho nghiệp vụ bán hàng theo sản phẩm.
- Phiếu bán chọn hàng hóa, ngày bán, số lượng, giá bán thực tế, khách hàng và phương thức thanh toán.
- Giá bán mặc định lấy từ giá bán hiện tại nhưng cho phép điều chỉnh trên từng phiếu.
- Backend kiểm tra tồn kho và không cho phép tồn âm.
- Khi lưu: tạo khoản thu cửa hàng loại `sales`, giảm tồn kho và ghi stock movement loại `sale`.
- Ngày đang draft/reviewed/approved trong quy trình chốt bị chặn đúng rule hiện có.
- Trang `/store-sales` dùng dashboard vận hành riêng: Phiếu bán, Số lượng bán, Mặt hàng đã bán, Doanh thu bán.
- Trang Bán hàng chỉ hiển thị bộ lọc và Lịch sử bán hàng; không hiển thị Lịch sử chốt ngày hoặc Sổ phát sinh.
- Nội dung dòng tiền, chốt ngày và sổ phát sinh tiếp tục chỉ thuộc `/store-cashflow`.
- Không cần migration mới vì movement type `sale` đã có trong schema 16K4.1.

---

## Append — Việc 16K6: Báo cáo tồn kho

**Trạng thái:** Patch prepared, chờ apply/runtime test.

- Báo cáo tồn kho được đặt ngay trong trang `/store-products` để giữ Simple Mode, không thêm menu hoặc route mới.
- Báo cáo sử dụng danh sách hàng hóa và bộ lọc hiện tại.
- Giá vốn dùng `averageCostPrice`, fallback `defaultCostPrice`.
- Giá bán dự kiến dùng `currentSalePrice`, fallback `defaultSalePrice`.
- Thẻ tổng hợp gồm: tổng lượng tồn, giá trị vốn, doanh thu dự kiến và lãi gộp dự kiến.
- Bảng chi tiết theo hàng hóa gồm tồn, giá vốn, giá bán, giá trị vốn, doanh thu dự kiến, lãi dự kiến và cảnh báo sắp hết.
- Lãi gộp dự kiến chưa bao gồm chi phí vận hành hoặc các khoản chi khác.
- Không thay đổi DB, backend, router hoặc migration trong bước này.


---

## Cập nhật 16K7 — Báo cáo dòng tiền cửa hàng

**Trạng thái:** Patch prepared, chờ apply/runtime test.

- Bổ sung báo cáo dòng tiền ngay trong `/store-cashflow`.
- Tổng hợp Tổng thu, Tổng chi và Chênh lệch theo khoảng ngày lọc.
- Phân tích cơ cấu thu: Thu bán hàng, Thu khác.
- Phân tích cơ cấu chi: Mua hàng nhập kho, Chi vận hành, Chi khác.
- Chỉ tính các phát sinh chưa hủy.
- Không đưa báo cáo dòng tiền sang trang Nhập kho hoặc Bán hàng.
- Không thay đổi DB/backend/migration.


---

## Cập nhật 16K8 — Tách Chốt ngày và Xác nhận chốt, đẩy sổ chung

**Trạng thái:** Patch prepared, chờ apply/migration/runtime test.

- `Chốt ngày` là thao tác của người lập: gom phát sinh, khóa tạm và chuyển sang trạng thái `Đã chốt · Chờ xác nhận`.
- `Xác nhận chốt` là thao tác độc lập, chuẩn bị cho phân quyền hai người khác nhau.
- Bỏ yêu cầu phải bấm một bước trạng thái `Đã review`; review chỉ còn là hành vi kiểm tra chi tiết.
- Khi xác nhận, hệ thống đẩy tổng thu và tổng chi của ngày sang `finance_transactions` trong cùng một `financeBatchId`.
- Mỗi dòng tổng hợp dùng `external_ref` duy nhất để retry an toàn, không đẩy trùng.
- Chỉ sau khi đẩy thành công mới cập nhật `postedToFinance = true`, `confirmedBy`, `confirmedAt`.
- Trước xác nhận vẫn cho phép Bỏ chốt để bổ sung; sau xác nhận thì khóa chính thức.
- Giữ endpoint `approveDailyClosing` làm alias tương thích; endpoint mới là `confirmDailyClosing`.


---

## Append — Việc 16K8.5: Group dòng tiền và phát sinh theo ngày

- Trang Tài chính lưu xá gom hai dòng tổng thu/tổng chi của cùng một ngày chốt cửa hàng thành một dòng tổng hợp theo batch `external_ref`.
- Dòng tổng hợp hiển thị tổng thu, tổng chi và chênh lệch; không cho xóa trực tiếp tại sổ chung.
- Trang Tổng hợp thu chi cửa hàng gom phát sinh theo ngày.
- Mỗi group ngày hiển thị số phát sinh, tổng thu, tổng chi, chênh lệch và trạng thái chốt.
- Ngày chưa chốt có nút Chốt ngày ngay trên group; ngày chờ xác nhận có nút Review; ngày đã xác nhận có nút Xem.
- Không thêm migration mới.
