## Append — Việc 16K9: Phiếu nhập/bán nhiều hàng hóa và in phiếu

**Trạng thái:** Patch prepared, chờ apply migration và runtime test.

- Thêm chứng từ cửa hàng dạng header/detail: `storeDocuments`, `storeDocumentLines`.
- Một phiếu nhập hoặc bán hỗ trợ nhiều hàng hóa.
- Phiếu nhập nguồn mua hàng chỉ tạo một khoản chi tổng bằng tổng phiếu.
- Phiếu nhập nguồn sản xuất/tự cung cấp/khác không tự tạo khoản chi.
- Phiếu bán chỉ tạo một khoản thu tổng bằng tổng phiếu.
- Mỗi dòng hàng vẫn ghi stock movement và cập nhật tồn/giá vốn tương ứng.
- Thêm API list/get/create chứng từ nhiều dòng.
- Lịch sử Nhập kho/Bán hàng hiển thị theo phiếu, không theo từng movement rời.
- Sau khi lưu mở xem trước phiếu; lịch sử có Xem phiếu/In phiếu.
- Phiếu in dùng chung thông tin đơn vị và footer từ cấu hình phiếu Finance.
- `StoreLedger.tsx` tiếp tục giữ cấu trúc component hóa và còn dưới 1.500 dòng.

### Runtime checklist

- [ ] Chạy `/drizzle/viec16k9_store_documents_multiline.sql`.
- [ ] Tạo phiếu nhập mua hàng với 2–3 mặt hàng: tồn tăng từng mặt hàng, chỉ có 1 khoản chi tổng.
- [ ] Tạo phiếu nhập gia công/tự cung cấp: tồn tăng, không sinh khoản chi.
- [ ] Tạo phiếu bán 2–3 mặt hàng: tồn giảm từng mặt hàng, chỉ có 1 khoản thu tổng.
- [ ] Một dòng vượt tồn: toàn phiếu bị chặn trước khi ghi dữ liệu.
- [ ] Ngày đã chốt: không cho tạo phiếu.
- [ ] Lịch sử hiển thị số phiếu, số mặt hàng, tổng số lượng, tổng tiền.
- [ ] Xem phiếu và In phiếu hiển thị đủ các dòng hàng, tổng tiền số/chữ và chữ ký.
- [ ] Chạy `pnpm check`, `pnpm test`, `pnpm build`.
