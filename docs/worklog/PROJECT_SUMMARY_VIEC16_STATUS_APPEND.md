# PROJECT_SUMMARY_VIEC16_STATUS_APPEND.md

## Việc 16I — Product page first + route/tab sync + product categories

User yêu cầu điều chỉnh lại hướng cửa hàng:
- Chỉ quản lý một cửa hàng chính, không còn tư duy tạo nhiều sổ/quỹ.
- Tách menu lớn “Quản lý cửa hàng” với các mục con.
- Trước mắt cần làm trang sản phẩm trước.
- Cần cho phép tạo/định nghĩa nhóm hoặc loại sản phẩm như Nông sản, Thủ công, Bánh kẹo, Sách.

Patch 16I:
- Sửa `StoreLedger.tsx` để đồng bộ tab theo URL. Khi bấm menu con `/store-ledger?tab=products|purchase|sales|cashflow`, trang sẽ đổi tab tương ứng thay vì giữ tab cũ.
- Bổ sung danh mục sản phẩm mặc định: Nông sản, Thủ công, Bánh kẹo, Sách, Đồ uống, Đồ ăn, Văn phòng phẩm, Khác.
- Form sản phẩm cho phép chọn nhóm mặc định hoặc nhập nhóm/loại mới tự do.
- Product category label fallback hiển thị đúng tên nhóm tự tạo.
- Không đổi backend, schema, migration, nghiệp vụ chốt ngày hay review chốt.

Next:
- Sau khi 16I pass, làm tiếp Nhập hàng / chi mua hàng tăng tồn dựa trên danh mục sản phẩm.
