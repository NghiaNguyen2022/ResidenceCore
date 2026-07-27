# Biên bản reset dữ liệu kiểm thử — 2026-07-27

## Trạng thái

- Kết quả: **Đã hoàn tất**
- Tài khoản giữ lại: `admin` (ID `1`, quyền `manager`)
- Backup hợp lệ: `backups/before_test_data_reset_20260727_132004.sql`
- Kiểm tra backup: có marker `Dump completed`
- Cơ chế reset: transaction; tự rollback nếu kiểm tra dữ liệu giữ lại hoặc dữ liệu cần xóa không đạt

## Dữ liệu đã xóa

- 17 học viên và 17 tài khoản học viên
- 6 phụ huynh
- 6 phòng và 20 lượt phân phòng
- 7 lịch học và 2 bản ghi học vấn
- 270 phân công công tác
- 17 phân công cơ cấu và 34 thành viên đơn vị
- 227 khoản thu, 38 giao dịch, 15 thanh toán và toàn bộ danh mục tài chính
- Toàn bộ dữ liệu cửa hàng: 9 sản phẩm, sổ quỹ, ca trực, chứng từ, biến động kho và lịch sử giá
- 18 thông báo
- 5 bản ghi sinh hoạt hằng ngày
- Toàn bộ dữ liệu CLB/kỹ năng nếu bảng tương ứng đã tồn tại
- Session và role mapping liên quan đến các tài khoản đã xóa

## Dữ liệu giữ lại

- 1 tài khoản `admin`
- 8 vai trò hệ thống
- 6 chức vụ cơ cấu
- 1 nhiệm kỳ và 8 đơn vị cơ cấu
- 16 mẫu công tác và 13 cấu hình/khung công tác
- 3 mẫu sinh hoạt và 11 hạng mục mẫu
- Cấu hình hệ thống

## Ghi chú

- Không reset `AUTO_INCREMENT`; việc này không ảnh hưởng test chức năng và giúp tránh tái sử dụng ID cũ.
- Session của `admin` được giữ lại để không làm gián đoạn phiên kiểm thử hiện tại.
