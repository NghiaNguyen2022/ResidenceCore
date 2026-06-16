# ResidenceCore - Reset Demo Data Phase 2

## File SQL

`ResidenceCore_reset_demo_phase2.sql`

## Mục tiêu

Xóa toàn bộ data nghiệp vụ/demo cũ và tạo lại data demo sạch cho Phase 2.

## Giữ lại / đảm bảo

- `admin` vẫn tồn tại.
- Mật khẩu admin được set lại: `123456`.
- Giữ cấu hình app:
  - `appSettings`
  - `moduleDisplayModes`
- Giữ/đảm bảo cấu hình công tác:
  - `dutyTemplates`
  - `dutyConfigs`
  - `dutyChecklists`
  - `dutySchedules`
- Giữ/đảm bảo lịch sinh hoạt mẫu:
  - `daily_routine_templates`
  - `daily_routine_items`
- Giữ/đảm bảo nhiệm kỳ/vai trò:
  - `organization_terms`
  - `organization_roles`
  - `roles`
- Giữ/đảm bảo Tổ/Ban mẫu:
  - `organization_units`

## Data demo tạo mới

- 8 học viên demo.
- 8 tài khoản học viên demo, mật khẩu `123456`, yêu cầu đổi mật khẩu lần đầu.
- 4 phòng demo.
- 2 trường demo.
- Thông tin liên hệ phụ huynh.
- Thông tin học tập.
- Lịch học mẫu để test conflict công tác.
- Nhiệm kỳ demo active.
- Bổ nhiệm:
  - Trưởng lưu xá.
  - Phó lưu xá.
  - Thư ký.
  - Thủ quỹ.
  - Tổ trưởng Tổ 1.
  - Tổ trưởng Tổ 2.
  - Trưởng ban Phụng vụ.
  - Trưởng ban Đời sống.
- Thành viên Tổ/Ban từ `organization_unit_members`.
- Công tác hôm nay:
  - Công tác trực tiếp học viên.
  - Công tác Tổ.
  - Công tác Ban.
  - Công tác điều hành toàn lưu xá.

## Tài khoản test

| Username | Password | Ghi chú |
|---|---|---|
| admin | 123456 | Quản trị / quản lý |
| anna.nguyen | 123456 | Trưởng lưu xá |
| bao.tran | 123456 | Phó lưu xá |
| chi.le | 123456 | Thư ký |
| dung.pham | 123456 | Thủ quỹ |
| emily.vo | 123456 | Tổ trưởng Tổ 1 |
| phuc.hoang | 123456 | Tổ trưởng Tổ 2 |
| linh.do | 123456 | Trưởng ban Phụng vụ |
| minh.bui | 123456 | Trưởng ban Đời sống |

## Cách chạy

Backup DB trước, sau đó chạy file SQL trong MySQL client/phpMyAdmin/DBeaver.

## Lưu ý

Script có `DELETE` dữ liệu nghiệp vụ. Không chạy trên DB thật nếu chưa backup.
