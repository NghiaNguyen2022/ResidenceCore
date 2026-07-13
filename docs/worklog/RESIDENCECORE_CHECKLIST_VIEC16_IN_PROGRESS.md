# RESIDENCECORE_CHECKLIST - Việc 16 append

## 16A5 - StoreLedger duplicate ledger code fix
- [x] Xử lý lỗi tạo sổ/quỹ khi mã `CUA_HANG` đã tồn tại.
- [x] Không để UI hiển thị lỗi thô `Failed query insert into storeLedgers...` cho case duplicate.
- [x] Nếu mã tồn tại và đang active, trả về sổ hiện có để demo tiếp.
- [x] Nếu mã tồn tại nhưng inactive, báo lỗi nghiệp vụ rõ.
- [x] Không đổi DB schema / migration / logic thu chi.

## Test
- [ ] Restart backend/dev server.
- [ ] Mở `/store-ledger`.
- [ ] Tạo sổ/quỹ với mã `CUA_HANG`.
- [ ] Modal đóng và sổ hiện có/được tạo được chọn.
- [ ] Không còn lỗi Failed query duplicate insert.
