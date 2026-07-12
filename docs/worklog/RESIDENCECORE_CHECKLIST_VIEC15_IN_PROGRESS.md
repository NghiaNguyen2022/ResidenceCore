# RESIDENCECORE_CHECKLIST_VIEC15_IN_PROGRESS

## Việc 15 — Portal học viên mở rộng / gom trải nghiệm học viên

### Lịch sử chính
- 15A — Portal activities route: đã patch.
- 15B — Portal Today polish nhẹ: chưa chốt vì chưa đủ rõ.
- 15C — Portal Today visible premium restyle: PASS.
- 15D — MyDuties polish: chưa chốt do route/menu chưa rõ.
- 15E — Gọn menu Portal học viên bước đầu: PASS nhưng còn rời rạc.
- 15F — Gom tiếp menu Portal học viên: PASS.
- 15G — Chuẩn hóa Công tác trong menu mới: user báo done, tiếp tục.
- 15H — ResidentFinance picker fix: đổi Ngày chi sang FormDateInput.

### 15I — Format tiền tệ trong field nhập số tiền
- [x] Rà modal Cập nhật chi thực tế trong ResidentFinance.
- [x] Thêm helper `formatCurrencyInput` để hiển thị dạng `1.000.000` khi nhập.
- [x] Thêm helper `parseCurrencyInput` để gửi số nguyên về backend.
- [x] Áp dụng cho field `Số tiền thực chi`.
- [x] Không đổi backend/API/schema/logic tài chính.
- [x] Giữ DatePicker/FormDateInput ở field Ngày chi.

### Test 15I
- [ ] Mở Lưu xá của tôi > Tài chính.
- [ ] Mở Cập nhật chi thực tế.
- [ ] Nhập `1000000` phải hiển thị `1.000.000`.
- [ ] Nhập/sửa/xóa số không bị ký tự lạ.
- [ ] Lưu phải gửi amount số nguyên đúng.
- [ ] pnpm check / test / build pass.
