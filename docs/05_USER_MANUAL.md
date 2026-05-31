# User Manual - ResidenceCare

**Phiên bản:** 1.0.0  
**Ngày tạo:** Tháng 5 năm 2026  
**Tác giả:** Manus AI  
**Ngôn ngữ:** Tiếng Việt

---

## 1. Giới Thiệu

ResidenceCare là hệ thống quản lý lưu xá toàn diện giúp bạn quản lý cư dân, phòng ở, lịch sinh hoạt, công việc nhà, và tài chính một cách hiệu quả.

### 1.1 Tính Năng Chính

- **Quản lý Cư dân:** Thêm, sửa, xóa thông tin cư dân
- **Quản lý Phòng:** Tạo phòng, gán cư dân, theo dõi sức chứa
- **Điểm danh:** Ghi nhận check-in/check-out hàng ngày
- **Lịch Sinh hoạt:** Quản lý lịch chung (ăn cơm, học tập, giờ giấc)
- **Công việc Nhà:** Phân công nấu ăn, đi chợ, trông cửa hàng, v.v.
- **Quản lý Thu phí:** Định nghĩa phí, sinh công nợ, ghi nhận thanh toán
- **Dashboard:** Xem thống kê tổng quan, biểu đồ
- **Thông báo:** Nhận thông báo công nợ, thanh toán, công việc

---

## 2. Đăng Nhập & Đăng Xuất

### 2.1 Đăng Nhập

1. Truy cập trang chủ: `https://your-domain.com`
2. Click nút **"Đăng nhập"** (góc phải trên)
3. Nhập email/username Manus
4. Nhập mật khẩu
5. Click **"Đăng nhập"**

**Lưu ý:** Lần đầu đăng nhập, bạn sẽ được yêu cầu cấp quyền truy cập.

### 2.2 Đăng Xuất

1. Click avatar/tên người dùng (góc phải trên)
2. Click **"Đăng xuất"**
3. Xác nhận

---

## 3. Giao Diện Chính

### 3.1 Sidebar Navigation

**Desktop:**
- Sidebar cố định ở bên trái
- Click menu để chuyển trang
- Click logo để về Home

**Mobile:**
- Click icon hamburger (≡) để mở/đóng sidebar
- Swipe từ trái sang phải để mở sidebar

### 3.2 Menu Items

| Menu | Quyền | Mô Tả |
|------|-------|-------|
| **Dashboard** | Manager, Accountant | Xem thống kê tổng quan |
| **Cư dân** | Manager, Supervisor | Quản lý danh sách cư dân |
| **Phòng ở** | Manager, Supervisor | Quản lý phòng và gán cư dân |
| **Điểm danh** | Manager, Supervisor | Ghi nhận check-in/check-out |
| **Lịch Sinh hoạt** | Manager, Supervisor | Quản lý lịch chung |
| **Công việc** | Manager, Supervisor | Phân công công việc nhà |
| **Thu phí** | Manager, Accountant | Quản lý phí và công nợ |
| **Thông báo** | Tất cả | Cài đặt thông báo |

---

## 4. Quản Lý Cư Dân

### 4.1 Xem Danh Sách Cư Dân

1. Click menu **"Cư dân"**
2. Xem danh sách tất cả cư dân
3. Tìm kiếm: Nhập tên vào ô tìm kiếm
4. Sắp xếp: Click header cột để sắp xếp

### 4.2 Thêm Cư Dân Mới

1. Click nút **"+ Thêm Cư dân"**
2. Điền thông tin:
   - **Họ tên** (bắt buộc)
   - **Email**
   - **Số điện thoại**
   - **Ngày sinh**
   - **Giới tính**
   - **Trường học**
   - **Chương trình học**
   - **Phòng ở**
3. Click **"Lưu"**

### 4.3 Sửa Thông Tin Cư Dân

1. Click vào hàng cư dân hoặc nút **"Sửa"**
2. Chỉnh sửa thông tin
3. Click **"Lưu"**

### 4.4 Xóa Cư Dân

1. Click nút **"Xóa"** hoặc chọn checkbox
2. Xác nhận xóa
3. Cư dân sẽ bị deactivate (không xóa vĩnh viễn)

### 4.5 Chuyển Phòng

1. Click cư dân
2. Click **"Chuyển Phòng"**
3. Chọn phòng mới
4. Click **"Xác nhận"**

---

## 5. Quản Lý Phòng Ở

### 5.1 Xem Danh Sách Phòng

1. Click menu **"Phòng ở"**
2. Xem danh sách phòng với sức chứa và sức chứa hiện tại
3. Xem chi tiết: Click vào phòng

### 5.2 Thêm Phòng Mới

1. Click nút **"+ Thêm Phòng"**
2. Điền thông tin:
   - **Số phòng** (VD: 101, 202)
   - **Sức chứa** (số người)
   - **Mô tả** (optional)
3. Click **"Lưu"**

### 5.3 Gán Cư Dân Vào Phòng

**Cách 1: Từ trang Phòng**
1. Click phòng
2. Click **"+ Gán Cư dân"**
3. Chọn cư dân từ danh sách
4. Click **"Xác nhận"**

**Cách 2: Từ trang Cư dân**
1. Click cư dân
2. Chọn phòng từ dropdown
3. Click **"Lưu"**

### 5.4 Kiểm Tra Sức Chứa

- Xem **"Sức chứa"** ở cột cuối cùng
- VD: 2/4 = 2 người đang ở, sức chứa 4 người
- Phòng đầy sẽ hiển thị cảnh báo

---

## 6. Điểm Danh & Lịch Sinh Hoạt

### 6.1 Ghi Nhận Check-in

1. Click menu **"Điểm danh"**
2. Click nút **"+ Check-in"**
3. Chọn cư dân
4. Chọn giờ check-in
5. Thêm ghi chú (optional)
6. Click **"Lưu"**

### 6.2 Ghi Nhận Check-out

1. Click menu **"Điểm danh"**
2. Tìm bản ghi check-in của cư dân
3. Click **"Check-out"**
4. Chọn giờ check-out
5. Click **"Lưu"**

### 6.3 Xem Lịch Sinh Hoạt

1. Click menu **"Lịch Sinh hoạt"**
2. Xem danh sách lịch chung:
   - Ăn sáng, ăn trưa, ăn tối
   - Giờ học tập
   - Giờ giấc (curfew)
   - Các hoạt động khác

### 6.4 Thêm Lịch Mới

1. Click nút **"+ Thêm Lịch"**
2. Điền thông tin:
   - **Tên hoạt động** (VD: Ăn sáng)
   - **Loại** (Check-in, Meal, Study, Curfew, etc.)
   - **Giờ** (VD: 07:00)
   - **Hàng ngày?** (Yes/No)
   - **Ngày trong tuần** (nếu không hàng ngày)
3. Click **"Lưu"**

---

## 7. Công Việc Nhà

### 7.1 Xem Danh Sách Công Việc

1. Click menu **"Công việc"**
2. Xem danh sách công việc được giao
3. Xem trạng thái: Pending, In Progress, Completed

### 7.2 Phân Công Công Việc

1. Click nút **"+ Phân Công"**
2. Chọn loại công việc:
   - Nấu cơm
   - Đi chợ
   - Trông cửa hàng
   - Vệ sinh
   - Giặt đồ
   - Khác
3. Chọn cư dân được giao
4. Chọn ngày hết hạn
5. Thêm ghi chú (optional)
6. Click **"Lưu"**

### 7.3 Cập Nhật Trạng Thái

1. Click công việc
2. Chọn trạng thái mới:
   - **Pending:** Chưa bắt đầu
   - **In Progress:** Đang làm
   - **Completed:** Hoàn thành
3. Click **"Lưu"**

### 7.4 Xóa Công Việc

1. Click nút **"Xóa"**
2. Xác nhận

---

## 8. Quản Lý Thu Phí

### 8.1 Xem Danh Sách Phí

1. Click menu **"Thu phí"**
2. Xem danh sách loại phí:
   - Tiền phòng
   - Tiền ăn
   - Tiền điện nước
   - Tiền internet
   - Khác

### 8.2 Tạo Loại Phí Mới

1. Click nút **"+ Thêm Loại Phí"**
2. Điền thông tin:
   - **Tên phí** (VD: Tiền phòng)
   - **Mã** (VD: ROOM_FEE)
   - **Số tiền** (VD: 500000)
   - **Chu kỳ** (Hàng tháng, Quý, Năm)
   - **Mô tả**
   - **Kích hoạt?** (Yes/No)
3. Click **"Lưu"**

### 8.3 Xem Công Nợ

1. Click menu **"Thu phí"** → Tab **"Công Nợ"**
2. Xem danh sách công nợ chưa thanh toán
3. Lọc theo:
   - Cư dân
   - Trạng thái (Unpaid, Paid, Overdue)
   - Tháng

### 8.4 Ghi Nhận Thanh Toán

1. Click công nợ
2. Click nút **"Ghi Nhận Thanh Toán"**
3. Điền thông tin:
   - **Số tiền** (mặc định = số nợ)
   - **Ngày thanh toán**
   - **Phương thức** (Tiền mặt, Chuyển khoản, Séc)
   - **Ghi chú**
4. Click **"Lưu"**

### 8.5 Sinh Công Nợ Hàng Tháng

**Tự động:**
- Hệ thống tự động sinh công nợ vào ngày 1 hàng tháng
- Hạn thanh toán: 15 ngày sau

**Thủ công:**
1. Click nút **"Sinh Công Nợ"**
2. Xác nhận
3. Hệ thống sẽ sinh công nợ cho tất cả cư dân

---

## 9. Dashboard & Thống Kê

### 9.1 Xem Dashboard

1. Click menu **"Dashboard"**
2. Xem các metric chính:
   - **Tổng Cư dân:** Số cư dân đang hoạt động
   - **Sức chứa Phòng:** Số phòng đầy, còn trống
   - **Điểm danh Hôm nay:** % cư dân có mặt
   - **Công việc Chờ:** Số công việc chưa hoàn thành
   - **Công nợ Chưa thanh toán:** Tổng tiền nợ

### 9.2 Xem Biểu Đồ

- **Biểu đồ Sức chứa:** Phòng nào đầy, nào còn trống
- **Biểu đồ Công nợ:** Số lượng công nợ theo trạng thái

### 9.3 Xuất Báo Cáo (Tương lai)

- Báo cáo tài chính (PDF/Excel)
- Báo cáo điểm danh
- Báo cáo công nợ

---

## 10. Thông Báo

### 10.1 Xem Thông Báo

1. Click icon bell (🔔) ở góc phải trên
2. Xem danh sách thông báo chưa đọc
3. Click để xem chi tiết

### 10.2 Loại Thông Báo

- **Công nợ Sinh:** Công nợ mới được tạo
- **Công nợ Quá hạn:** Nhắc nhở thanh toán
- **Thanh toán Thành công:** Xác nhận thanh toán
- **Công việc Được giao:** Công việc mới
- **Điểm danh:** Cảnh báo vắng mặt

### 10.3 Cài Đặt Thông Báo

1. Click menu **"Thông báo"**
2. Chọn loại thông báo muốn nhận:
   - ☑ Công nợ
   - ☑ Thanh toán
   - ☑ Công việc
   - ☑ Điểm danh
3. Chọn phương thức:
   - ☑ In-app (trong ứng dụng)
   - ☑ Email (sắp có)
4. Click **"Lưu"**

---

## 11. Vai Trò & Quyền

### 11.1 Manager (Quản lý)

**Quyền:**
- Quản lý tất cả cư dân
- Quản lý phòng
- Ghi nhận điểm danh
- Phân công công việc
- Quản lý phí
- Xem dashboard
- Tạo báo cáo

### 11.2 Supervisor (Giám sát viên)

**Quyền:**
- Quản lý cư dân
- Quản lý phòng
- Ghi nhận điểm danh
- Phân công công việc
- **Không thể:** Quản lý phí, xem dashboard

### 11.3 Accountant (Kế toán)

**Quyền:**
- Quản lý phí
- Ghi nhận thanh toán
- Xem dashboard (chỉ phí)
- **Không thể:** Quản lý cư dân, phòng, điểm danh

---

## 12. Troubleshooting

### 12.1 Không Thể Đăng Nhập

**Vấn đề:** Lỗi "Invalid credentials"

**Giải pháp:**
1. Kiểm tra email/username
2. Kiểm tra mật khẩu (phân biệt hoa/thường)
3. Reset mật khẩu nếu quên
4. Liên hệ admin

### 12.2 Không Thể Tạo Cư Dân

**Vấn đề:** Lỗi "Họ tên là bắt buộc"

**Giải pháp:**
1. Điền đầy đủ họ tên
2. Kiểm tra ký tự đặc biệt
3. Thử lại

### 12.3 Phòng Không Thể Gán Cư Dân

**Vấn đề:** Lỗi "Phòng đã đầy"

**Giải pháp:**
1. Kiểm tra sức chứa phòng
2. Chuyển cư dân khác sang phòng khác
3. Tạo phòng mới

### 12.4 Công Nợ Không Sinh

**Vấn đề:** Công nợ không được tạo vào ngày 1

**Giải pháp:**
1. Kiểm tra loại phí có kích hoạt không
2. Kiểm tra cư dân có status "active"
3. Nhấn nút "Sinh Công Nợ" thủ công
4. Liên hệ admin

### 12.5 Trang Tải Chậm

**Vấn đề:** Ứng dụng chạy chậm

**Giải pháp:**
1. Refresh trang (Ctrl+R)
2. Xóa cache browser (Ctrl+Shift+Delete)
3. Đóng tab khác
4. Kiểm tra kết nối internet
5. Thử trên trình duyệt khác

### 12.6 Lỗi "Permission Denied"

**Vấn đề:** Không có quyền truy cập

**Giải pháp:**
1. Kiểm tra vai trò của bạn
2. Liên hệ admin để cấp quyền
3. Đăng xuất và đăng nhập lại

---

## 13. Mẹo & Thủ Thuật

### 13.1 Tìm Kiếm Nhanh

- Nhấn **Ctrl+K** (hoặc **Cmd+K** trên Mac) để mở tìm kiếm
- Gõ tên cư dân, phòng, v.v.
- Nhấn Enter

### 13.2 Keyboard Shortcuts

| Phím | Chức Năng |
|------|---------|
| **Ctrl+K** | Mở tìm kiếm |
| **Esc** | Đóng dialog |
| **Tab** | Chuyển giữa fields |
| **Enter** | Lưu/Gửi |

### 13.3 Export Data

- Click nút **"Export"** để tải dữ liệu (CSV, Excel)
- Sử dụng cho báo cáo, sao lưu

### 13.4 Mobile Tips

- Sử dụng landscape mode cho bảng lớn
- Swipe để cuộn bảng
- Tap để chọn hàng

---

## 14. FAQ

**Q: Dữ liệu có được sao lưu không?**  
A: Có, hệ thống tự động sao lưu hàng ngày.

**Q: Có thể khôi phục dữ liệu đã xóa không?**  
A: Cư dân bị xóa chỉ bị deactivate, có thể khôi phục. Liên hệ admin.

**Q: Hỗ trợ tiếng Anh không?**  
A: Hiện tại chỉ hỗ trợ tiếng Việt. Tương lai sẽ thêm.

**Q: Có thể tích hợp với hệ thống khác không?**  
A: Có, thông qua API. Liên hệ admin.

---

## 15. Liên Hệ & Hỗ Trợ

**Email:** support@residencecare.vn  
**Hotline:** +84 (0)xxx-xxx-xxxx  
**Website:** https://residencecare.vn  
**Chat:** https://residencecare.vn/support

**Giờ làm việc:** 8:00 - 17:00 (Thứ 2 - Thứ 6)

---

**Phiên bản tài liệu:** 1.0  
**Cập nhật lần cuối:** Tháng 5 năm 2026  
**Trạng thái:** Production Ready
