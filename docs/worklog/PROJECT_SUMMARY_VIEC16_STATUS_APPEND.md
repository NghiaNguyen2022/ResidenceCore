# PROJECT_SUMMARY append - Việc 16A5

## Việc 16A5 - StoreLedger duplicate ledger code fix
Hotfix cho module Cửa hàng / Quỹ riêng sau khi tạo sổ/quỹ bị lỗi insert do mã `CUA_HANG` đã tồn tại trong `storeLedgers`. Service nay kiểm tra mã trước khi insert và xử lý duplicate key thân thiện. Nếu mã đã tồn tại và sổ còn active, hệ thống trả về sổ hiện có để demo tiếp; nếu mã tồn tại nhưng inactive, báo lỗi nghiệp vụ rõ ràng. Frontend chọn sổ trả về sau khi lưu thành công.

Không đổi schema, migration, route, menu hay logic thu/chi.
