# PROJECT SUMMARY — QLTruongHoc

## Mục tiêu
Ứng dụng quản lý đa trường, đa trung tâm đào tạo, ưu tiên trung tâm ngoại ngữ và trường mầm non; mở rộng trung tâm tin học về sau. Kiến trúc kế thừa ResidenceCore / App Lưu Xá.

## Nguyên tắc được bảo vệ
- Luôn làm trên code mới nhất, patch tối thiểu, không ghi đè bằng base cũ.
- Phát triển theo chuỗi Database → Backend → Frontend → Test → Tài liệu.
- Mọi truy vấn nghiệp vụ đa đơn vị bắt buộc có `donViId`.
- Chỉ `server/db/connection.ts` được tạo MySQL pool.
- Repository gọi `getDb()`; frontend không kết nối trực tiếp MySQL.
- Design System dùng config chung; không tự tạo tone, header, card KPI hoặc pagination riêng.
- Tên bảng MySQL dùng tiếng Việt không dấu, PascalCase; tên cột camelCase.
- Timezone nghiệp vụ: `Asia/Ho_Chi_Minh`.

## Quy tắc cập nhật tài liệu bắt buộc
Mỗi patch hoặc thay đổi nghiệp vụ phải cập nhật đồng thời:
1. `PROJECT_SUMMARY.md`
2. `docs/MASTER_CHECKLIST.md`
3. BPD nếu thay đổi quy trình
4. API contract nếu thay đổi API
5. ERD/schema note nếu thay đổi database

Một việc chưa được xem là hoàn thành nếu code đã sửa nhưng summary và checklist chưa cập nhật.

## Trạng thái hiện tại
### Sprint 0A — Đã hoàn thành nền tảng ban đầu
- [x] MySQL và user ứng dụng
- [x] Kết nối Drizzle
- [x] API health
- [x] React + Vite
- [x] Client/API chạy cùng một lệnh
- [x] Development proxy `/api`
- [x] Production same-host
- [x] UI shell
- [x] Design System động theo config
- [x] Theme xanh giáo dục

### Sprint 0B — Việc đang thực hiện
Mục tiêu:
`Đăng nhập → lấy đơn vị được phép truy cập → chọn đơn vị → tải vai trò/quyền → hiển thị menu theo quyền → dữ liệu đúng donViId`

Phạm vi:
- Hoàn thiện `DonVi`, `NguoiDung`, `VaiTro`, `Quyen`, `VaiTroQuyen`, `NguoiDungVaiTroDonVi`
- Session/JWT và bắt buộc đổi mật khẩu
- API login/logout/me
- API danh sách đơn vị và chọn đơn vị
- Middleware xác thực, đơn vị hiện tại, quyền
- UI đăng nhập và chọn đơn vị
- Topbar/sidebar dùng dữ liệu thật
- Test cách ly dữ liệu đa đơn vị
- Cập nhật BPD, ERD, API contract

## Việc tiếp theo sau Sprint 0B
Sprint 1A — Tuyển sinh và tiếp nhận tư vấn:
- Khách hàng tiềm năng
- Lịch sử tư vấn
- Hồ sơ đăng ký
- Kiểm tra đầu vào ngoại ngữ
- Xác nhận nhập học
- Chuyển hồ sơ thành học sinh
- Liên kết và tạo tài khoản phụ huynh

## Rủi ro cần tránh
- Làm nghiệp vụ trước khi hoàn thiện `donViId`
- Tin `donViId` do frontend truyền lên
- Tạo nhiều connection pool
- Hard-code URL API, màu sắc hoặc page size
- Tạo menu cứng theo vai trò
- Không cập nhật summary/checklist cùng patch
