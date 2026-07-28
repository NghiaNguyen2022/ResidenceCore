# Báo cáo route guard và kiểm thử phân quyền

Ngày kiểm thử: **28/07/2026**

## Phạm vi

- Route công khai: `/`, `/login`.
- Route quản lý: Dashboard, học viên, phòng, cơ cấu, sinh hoạt, công tác,
  hoạt động, điểm danh, cửa hàng, tài chính và thiết lập.
- Route học viên: Hôm nay, hồ sơ, công tác, cửa hàng, tài chính, thông báo
  và hoạt động.
- Route bổ nhiệm: Ban điều hành, Tổ trưởng và Trưởng ban.
- API quản lý và API portal học viên.

## Quy tắc đã áp dụng

- Chưa đăng nhập mở route nghiệp vụ: chuyển tới `/login`.
- Học viên mở route quản lý: hiển thị **Không có quyền truy cập**.
- Quản lý mở route portal học viên: hiển thị **Không có quyền truy cập**.
- Route bổ nhiệm chỉ mở khi tài khoản có đúng role tương ứng.
- Route mới chưa khai báo policy bị chặn mặc định.
- API quản lý yêu cầu `managerProcedure`, không chỉ yêu cầu đăng nhập.
- API portal yêu cầu quyền học viên, quản lý hoặc vai trò bổ nhiệm theo
  chính sách backend.

## Kết quả tự động

- TypeScript: **PASS**.
- Vitest: **9 file PASS, 41 test PASS**.
- `git diff --check`: **PASS**.

## Kết quả trình duyệt

| Kịch bản | Kết quả |
|---|---|
| Học viên đăng nhập | Chuyển đúng `/resident/today` |
| Học viên mở `/dashboard` | Bị chặn, hiển thị trang không có quyền |
| Quản lý đăng nhập | Chuyển đúng `/dashboard` |
| Quản lý mở `/resident/today` | Bị chặn, hiển thị trang không có quyền |
| Chưa đăng nhập mở `/members` | Chuyển `/login?returnTo=%2Fmembers` |

## Kết luận

Route frontend và các API quản lý chính đã được bảo vệ theo role. Ma trận
route được kiểm thử tự động để hạn chế việc menu hoặc quyền bị sai lại khi
thêm chức năng mới.
