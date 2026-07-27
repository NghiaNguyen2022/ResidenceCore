# ResidenceCore — Hướng dẫn sử dụng và kịch bản UAT đầy đủ

Ngày bắt đầu: **27/07/2026**  
Môi trường: `http://127.0.0.1:3000`  
Vai trò kiểm thử: **Quản lý lưu xá**  
Trạng thái dữ liệu đầu vào: đã reset và có backup theo `DATA_RESET_EXECUTION_20260727.md`.

## 1. Quy ước kết quả

- **PASS**: thao tác và dữ liệu sau thao tác đúng kỳ vọng.
- **FAIL**: chức năng không hoàn tất hoặc dữ liệu sai.
- **BLOCKED**: chưa thể kiểm tra vì thiếu dữ liệu/chức năng phụ thuộc.
- **IN PROGRESS**: đang thực hiện.
- Mọi dữ liệu tạo trong tài liệu này dùng hậu tố `UAT` hoặc thông tin giả lập dễ nhận biết.

## 2. Dữ liệu kiểm thử chuẩn

### Tài khoản quản lý

- Username: `admin`
- Mật khẩu sau bước đổi mật khẩu lần đầu: `Admin@Test2026`
- Họ tên hiển thị: `Trần Thu Giang`
- Vai trò: `Quản lý lưu xá`

### Học viên UAT số 1

- Tên thánh: `Giuse`
- Họ tên: `Nguyễn Văn Kiểm Thử`
- CCCD: `079200000001`
- Điện thoại: `0900000001`
- Địa chỉ: `TP. Hồ Chí Minh`
- Ghi chú: `Dữ liệu UAT 2026-07-27`
- Ngày vào lưu trú: `27/07/2026`
- Tạo kèm tài khoản đăng nhập: Có

### Liên hệ UAT số 1

- Quan hệ: `Mẹ`
- Họ tên: `Trần Thị Phụ Huynh UAT`
- Điện thoại: `0910000001`
- Email: `phuhuynh.uat@example.com`
- Nghề nghiệp: `Giáo viên`
- Địa chỉ: `TP. Hồ Chí Minh`
- Ghi chú: `Liên hệ kiểm thử chính`

## 3. Trình tự UAT tổng thể

1. Đăng nhập, đổi mật khẩu lần đầu và đăng nhập lại.
2. Kiểm tra Dashboard ở trạng thái dữ liệu sạch.
3. Kiểm tra dữ liệu cơ cấu, nhiệm kỳ và khung/mẫu được giữ lại.
4. Tạo học viên và tài khoản học viên.
5. Thêm phụ huynh/người liên hệ.
6. Tạo khu/phòng và gán phòng.
7. Thêm thông tin học tập và lịch học.
8. Phân học viên vào Tổ/Ban và bổ nhiệm chức vụ.
9. Tạo và phân công công tác; kiểm tra xung đột.
10. Điểm danh và lịch điểm danh.
11. Sinh hoạt hằng ngày.
12. Tài chính lưu xá.
13. Cửa hàng.
14. Hoạt động, CLB và kỹ năng.
15. Thông báo, báo cáo và thiết lập.
16. Kiểm tra portal học viên và phân quyền.
17. Kiểm tra sửa, tìm kiếm, lọc và xóa dữ liệu UAT.
18. Đối chiếu Dashboard/báo cáo sau toàn bộ chuỗi nghiệp vụ.

---

## Bước 1 — Đăng nhập và đổi mật khẩu lần đầu

Trạng thái: **PASS**

### Cách thực hiện

1. Mở trang chủ.
2. Chọn **Đăng nhập**.
3. Nhập username `admin`.
4. Nhập mật khẩu mặc định `Admin@123`.
5. Chọn **Đăng nhập**.
6. Tại màn hình **Đổi mật khẩu lần đầu**, nhập:
   - Mật khẩu hiện tại: `Admin@123`
   - Mật khẩu mới: `Admin@Test2026`
   - Xác nhận mật khẩu mới: `Admin@Test2026`
7. Chọn **Đổi mật khẩu và đăng nhập lại**.
8. Đăng nhập lại bằng mật khẩu mới.

### Kết quả thực tế

- Lần đăng nhập đầu tiên chuyển đúng tới màn hình bắt buộc đổi mật khẩu.
- Đổi mật khẩu thành công và hệ thống yêu cầu đăng nhập lại.
- Đăng nhập lại thành công, chuyển tới `/dashboard`.
- Tài khoản hiển thị đúng tên `Trần Thu Giang` và vai trò `Quản lý lưu xá`.

### Ghi chú

- Trước khi chạy bước này, mật khẩu trong database không khớp mật khẩu demo hiển thị trên trang đăng nhập.
- Tài khoản `admin` đã được đồng bộ lại bằng seed mặc định để tạo trạng thái kiểm thử chuẩn.

## Bước 2 — Dashboard sau reset

Trạng thái: **PASS**

### Cách thực hiện

1. Sau khi đăng nhập, mở **Dashboard**.
2. Kiểm tra các thẻ tổng quan.
3. Đối chiếu số học viên và phòng với trạng thái database sau reset.

### Kết quả mong đợi và thực tế

- Tổng học viên lưu trú: `0` — đạt.
- Phòng ở: `0/0` — đạt.
- Tỷ lệ chiếm dụng: `0%` — đạt.
- Phòng có sẵn: `0` — đạt.
- Tổng phòng và sức chứa: `0` — đạt.
- Không có phân bổ công tác hôm nay — đạt.

## Bước 3 — Cơ cấu tổ chức sau reset

Trạng thái: **PASS**

### Cách thực hiện

1. Mở **Quản lý lưu trú → Tổ chức lưu xá**.
2. Kiểm tra nhiệm kỳ hiện tại.
3. Kiểm tra các đơn vị Tổ/Ban.
4. Kiểm tra các chức vụ không còn người được phân công.

### Kết quả thực tế

- Nhiệm kỳ giữ lại: `Nhiệm kỳ 2026 - 2027`.
- Thời gian: `01/06/2026 - 31/05/2027`.
- Có 8 đơn vị hoạt động:
  - Tổ 1, Tổ 2, Tổ 3, Tổ 4.
  - Ban Thanh nhạc, Ban sinh hoạt, Ban Truyền Thông, Ban Hậu cần.
- Tổng phân công đang phụ trách: `0`.
- Các chức vụ Ban điều hành và Tổ/Ban đều hiển thị **Đang trống**.
- Kết luận: cơ cấu được giữ lại và người được assign đã được xóa đúng yêu cầu.

## Bước 4 — Tạo học viên và tài khoản

Trạng thái: **PASS**

### Cách thực hiện

1. Mở **Quản lý lưu trú → Học viên**.
2. Chọn **Thêm học viên**.
3. Nhập dữ liệu tại mục “Học viên UAT số 1”.
4. Bật **Tạo tài khoản đăng nhập cho học viên**.
5. Chọn **Thêm học viên**.
6. Mở hồ sơ vừa tạo bằng nút **Xem**.

### Kết quả thực tế

- Tạo học viên thành công.
- Hệ thống sinh mã lưu trú `LX2026988458`.
- Danh sách cập nhật:
  - Tổng: `1`.
  - Đang lưu trú: `1`.
  - Chưa có phòng: `1`.
  - Chưa có tài khoản: `0`.
- Hồ sơ chi tiết hiển thị đúng thông tin cá nhân.
- Tài khoản học viên hiển thị trạng thái **Hoạt động**.

## Bước 5 — Thêm phụ huynh/người liên hệ

Trạng thái: **PASS**

### Cách thực hiện

1. Từ hồ sơ học viên, chọn tab **Liên hệ**.
2. Chọn **Thêm liên hệ**.
3. Nhập dữ liệu tại mục “Liên hệ UAT số 1”.
4. Chọn **Thêm liên hệ** để lưu.
5. Tải lại danh sách và kiểm tra liên hệ chính.

### Kết quả thực tế

- Tạo liên hệ thành công.
- Thẻ học viên hiển thị liên hệ chính:
  `Mẹ - Trần Thị Phụ Huynh UAT - 0910000001`.
- Chỉ số **Thiếu liên hệ** giảm từ `1` xuống `0`.

### Lưu ý giao diện

- Ngay sau khi lưu, phần tóm tắt trên thẻ học viên cập nhật tức thời.
- Khối danh sách trong tab Liên hệ vẫn tạm hiển thị trạng thái trống cho tới khi dữ liệu được tải lại/mở lại hồ sơ. Cần tiếp tục theo dõi như một khả năng thiếu invalidation cache.

## Bước 6 — Tạo phòng và gán phòng

Trạng thái: **PASS**

### Dữ liệu phòng UAT

- Mã phòng: `UAT-101`
- Sức chứa: `4`
- Tổ phòng kiểu cũ: Không chọn
- Ghi chú: `Phòng kiểm thử UAT`

### Cách tạo phòng

1. Mở đường dẫn `/rooms` hoặc mục **Quản lý phòng** trong chế độ menu chi tiết.
2. Chọn **+ Thêm phòng**.
3. Nhập mã phòng `UAT-101`.
4. Chọn sức chứa `4 chỗ`.
5. Không chọn “Tổ” vì đây là danh mục nhóm phòng kiểu cũ, độc lập với cơ cấu Tổ/Ban.
6. Nhập ghi chú và chọn **Lưu**.
7. Đóng thông báo trình duyệt sau khi lưu.

### Cách gán học viên vào phòng

1. Mở **Học viên**.
2. Chọn **Xem** tại học viên `Nguyễn Văn Kiểm Thử`.
3. Chọn **Gán phòng**.
4. Giữ loại thao tác **Gán phòng mới**.
5. Chọn `UAT-101 - còn 4/4 chỗ`.
6. Nhập ghi chú `Gán phòng trong kịch bản UAT`.
7. Chọn **Lưu thao tác phòng**.

### Kết quả thực tế

- Tạo phòng thành công.
- Tổng phòng tăng từ `0` lên `1`.
- Tổng sức chứa tăng từ `0` lên `4`.
- Sau khi gán, thẻ học viên hiển thị phòng `UAT-101`.
- Chỉ số **Chưa có phòng** giảm từ `1` xuống `0`.
- Chỉ số **Cần xử lý** giảm từ `1` xuống `0`.
- Trạng thái hồ sơ đổi thành **Hồ sơ ổn định**.

### Lưu ý giao diện

- Chức năng tạo phòng dùng JavaScript alert thay vì toast nội bộ. Người dùng phải đóng alert để tiếp tục thao tác.

## Bước 7 — Thông tin học tập và lịch học

Trạng thái: **PASS**

### Dữ liệu học tập UAT

- Trường đang học: `Đại học UAT`
- Bậc học: `Đại học`
- Ngành/lớp: `Công nghệ thông tin - UAT01`
- Năm học: `2026-2027`
- Ghi chú: `Thông tin học tập kiểm thử`

### Cách thêm thông tin học tập

1. Mở `/academic-info`.
2. Chọn học viên `Nguyễn Văn Kiểm Thử — UAT-101`.
3. Chọn **Thêm**.
4. Nhập trường, bậc học, ngành/lớp, năm học và ghi chú theo dữ liệu trên.
5. Chọn **Lưu**.

### Dữ liệu lịch học UAT

- Ngày: `Thứ Hai`
- Môn học: `Lập trình UAT`
- Giờ: `07:30 - 11:00`
- Địa điểm: `Giảng đường UAT-A`
- Ghi chú: `Buổi học kiểm thử xung đột công tác`

### Cách thêm lịch học

1. Mở `/study-schedule`.
2. Tại **Chọn học viên**, chọn `Nguyễn Văn Kiểm Thử — UAT-101`.
3. Chọn **Thêm lịch học**.
4. Chọn ngày và nhập nội dung, giờ học, địa điểm, ghi chú.
5. Chọn **Thêm**.

### Kết quả thực tế

- Thông tin trường học được lưu và hiển thị đúng.
- Toast hiển thị `Đã lưu thông tin học hành`.
- Lịch học được tạo thành công.
- Thống kê môn học và số buổi/tuần cùng tăng từ `0` lên `1`.
- Bảng lịch hiển thị đúng Thứ Hai, `07:30:00 – 11:00:00`, môn học và địa điểm.
- Toast hiển thị `Đã thêm lịch học`.
- Lịch này sẽ được tái sử dụng ở bước kiểm tra xung đột phân công công tác.

---

## Nhật ký các bước tiếp theo

| Bước | Chức năng | Trạng thái | Ghi chú |
|---:|---|---|---|
| 6 | Khu/phòng và gán phòng | PASS | Đã tạo `UAT-101` và gán học viên |
| 7 | Học viện, học tập và lịch học | PASS | Đã tạo trường/ngành và một lịch Thứ Hai |
| 8 | Tổ/Ban và bổ nhiệm | IN PROGRESS | Phụ thuộc học viên |
| 9 | Công tác và phân công | Chưa chạy | Phụ thuộc học viên/cơ cấu |
| 10 | Điểm danh | Chưa chạy | Phụ thuộc học viên |
| 11 | Sinh hoạt hằng ngày | Chưa chạy | Phụ thuộc học viên |
| 12 | Tài chính | Chưa chạy | Phụ thuộc học viên |
| 13 | Cửa hàng | Chưa chạy | Phụ thuộc sản phẩm/ca trực |
| 14 | Hoạt động, CLB, kỹ năng | Chưa chạy | Phụ thuộc học viên |
| 15 | Thông báo, báo cáo, thiết lập | Chưa chạy | Chạy sau khi có dữ liệu tổng hợp |
| 16 | Portal học viên và phân quyền | Chưa chạy | Phụ thuộc tài khoản học viên |
| 17 | Sửa, tìm kiếm, lọc và xóa | Chưa chạy | Chạy cuối chuỗi |
| 18 | Đối chiếu Dashboard/báo cáo | Chưa chạy | Chạy cuối chuỗi |
