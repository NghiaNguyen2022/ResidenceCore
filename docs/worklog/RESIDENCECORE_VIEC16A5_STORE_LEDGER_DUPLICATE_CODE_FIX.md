# ResidenceCore - Việc 16A5 - StoreLedger duplicate ledger code fix

## Lý do
Sau khi router và enum column đã được sửa, thao tác tạo sổ/quỹ vẫn lỗi khi mã `CUA_HANG` đã tồn tại trong bảng `storeLedgers`. Đây có thể do migration demo đã seed sẵn mã này hoặc người dùng đã tạo thử trước đó. DB trả lỗi insert thô nên UI hiển thị `Failed query...` khó hiểu.

## Thay đổi
- Thêm `getStoreLedgerByCode` trong `server/db/storeLedger.ts`.
- `storeLedgerService.createLedger` kiểm tra mã trước khi insert.
- Nếu mã đã tồn tại và sổ còn active: trả về sổ hiện có, đóng modal như thao tác thành công.
- Nếu mã tồn tại nhưng inactive: báo lỗi nghiệp vụ rõ ràng.
- Nếu có race condition duplicate key: bắt lỗi MySQL 1062/ER_DUP_ENTRY và xử lý thân thiện.
- Frontend chọn sổ vừa tạo/đã tồn tại sau khi lưu thành công.

## Không đổi
- Không đổi schema/migration.
- Không đổi route/menu.
- Không đổi logic thu/chi.
