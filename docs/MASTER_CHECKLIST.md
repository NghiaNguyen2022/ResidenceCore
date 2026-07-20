# MASTER CHECKLIST — QLTruongHoc

## Quy ước
- `[ ]` Chưa làm
- `[-]` Đang làm
- `[x]` Hoàn thành và đã test
- `[!]` Bị chặn/rủi ro

Một mục chỉ đánh dấu `[x]` khi phần liên quan về Database, Backend, Frontend, Test và Tài liệu đã hoàn tất.

# Sprint 0A — Nền tảng kỹ thuật
- [x] Database `SchoolCenter`
- [x] User `schoolcenter_app@localhost`
- [x] `.env.local`
- [x] `server/config/env.ts`
- [x] `server/db/connection.ts`
- [x] Một `mysql.createPool`
- [x] `getDb()`
- [x] `db:check`
- [x] API health
- [x] React + Vite
- [x] `pnpm dev` chạy client và API
- [x] Vite proxy `/api`
- [x] Production Express phục vụ frontend
- [x] UI shell
- [x] Design System config
- [x] Theme xanh giáo dục
- [x] `PageHeader`
- [x] `StatCard`
- [x] `SectionCard`
- [x] `Pagination`

# Sprint 0B — Đăng nhập, đa đơn vị và phân quyền

## Phân tích và tài liệu
- [-] Chốt business flow đăng nhập và chọn đơn vị
- [ ] Chốt ma trận vai trò/quyền
- [ ] Chốt session hay JWT + refresh token
- [ ] Chốt bắt buộc đổi mật khẩu
- [ ] Cập nhật BPD
- [ ] Cập nhật ERD
- [ ] Cập nhật API contract
- [ ] Cập nhật test scenario đa đơn vị

## Database
- [ ] Rà soát `DonVi`
- [ ] Rà soát `NguoiDung`
- [ ] Rà soát `VaiTro`
- [ ] Tạo `Quyen`
- [ ] Tạo `VaiTroQuyen`
- [ ] Hoàn thiện `NguoiDungVaiTroDonVi`
- [ ] Tạo `PhienDangNhap` hoặc refresh token
- [ ] Tạo `NhatKyHeThong`
- [ ] Index theo `donViId`
- [ ] Unique key đúng phạm vi đơn vị
- [ ] Migration chính thức
- [ ] Seed đơn vị hệ thống
- [ ] Seed trung tâm ngoại ngữ mẫu
- [ ] Seed trường mầm non mẫu
- [ ] Seed vai trò và quyền
- [ ] Seed quản trị viên đầu tiên

## Backend
- [ ] `auth.repository.ts`
- [ ] `donVi.repository.ts`
- [ ] `vaiTro.repository.ts`
- [ ] `quyen.repository.ts`
- [ ] `auth.service.ts`
- [ ] `donVi.service.ts`
- [ ] `permission.service.ts`
- [ ] `POST /api/auth/login`
- [ ] `POST /api/auth/logout`
- [ ] `GET /api/auth/me`
- [ ] `GET /api/organizations/my`
- [ ] `POST /api/organizations/select`
- [ ] `auth.middleware.ts`
- [ ] `donVi.middleware.ts`
- [ ] `permission.middleware.ts`
- [ ] Audit đăng nhập/chuyển đơn vị
- [ ] Không trả password hash
- [ ] Rate limit đăng nhập

## Frontend
- [ ] `LoginPage.tsx`
- [ ] `SelectOrganizationPage.tsx`
- [ ] `authApi.ts`
- [ ] `authTypes.ts`
- [ ] `AuthContext.tsx`
- [ ] `RequireAuth.tsx`
- [ ] Xóa danh sách đơn vị giả
- [ ] Organization selector dùng API thật
- [ ] Topbar lấy user thật
- [ ] Sidebar lọc theo quyền
- [ ] Logout
- [ ] Loading toàn trang
- [ ] Trang không có quyền
- [ ] Trạng thái không có đơn vị

## Kiểm thử
- [ ] Đăng nhập đúng/sai
- [ ] User bị khóa
- [ ] Bắt buộc đổi mật khẩu
- [ ] User có một/nhiều/không có đơn vị
- [ ] Chuyển đơn vị hợp lệ/không hợp lệ
- [ ] API không đăng nhập
- [ ] API sai quyền
- [ ] Truy cập chéo `donViId`
- [ ] Logout vô hiệu hóa phiên
- [ ] Refresh giữ trạng thái hợp lệ
- [ ] Test timezone Việt Nam

## Hoàn tất sprint
- [ ] Cập nhật `PROJECT_SUMMARY.md`
- [ ] Cập nhật `MASTER_CHECKLIST.md`
- [ ] Cập nhật BPD
- [ ] Cập nhật ERD
- [ ] Cập nhật API contract
- [ ] Runtime checklist PASS
- [ ] Người dùng xác nhận PASS

# Sprint 1A — Tuyển sinh
- [ ] Chốt nguồn tuyển sinh
- [ ] Chốt trạng thái tư vấn
- [ ] Chốt hồ sơ đăng ký
- [ ] Phân biệt mầm non/ngoại ngữ
- [ ] Chốt kiểm tra đầu vào
- [ ] Chốt chuyển hồ sơ thành học sinh
- [ ] Chốt liên kết phụ huynh
- [ ] Database
- [ ] Backend
- [ ] Frontend
- [ ] Phân quyền
- [ ] Test đa đơn vị
- [ ] BPD
- [ ] Summary và checklist

# Backlog VPS
- [ ] PM2/systemd
- [ ] Nginx
- [ ] Domain
- [ ] HTTPS
- [ ] Firewall
- [ ] Không mở MySQL công khai
- [ ] Backup database
- [ ] Log rotation
- [ ] Biến môi trường production
- [ ] Quy trình deploy
