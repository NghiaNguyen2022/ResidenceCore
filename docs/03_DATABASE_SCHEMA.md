# Database Schema - ResidenceCare

**Phiên bản:** 1.0.0  
**Ngày tạo:** Tháng 5 năm 2026  
**Tác giả:** Manus AI  
**Database:** MySQL 8.0+ / TiDB

---

## 1. Tổng Quan Schema

ResidenceCare sử dụng 16 bảng chính được tổ chức thành 4 nhóm:

1. **Authentication & Users:** users
2. **Residents & Rooms:** residents, rooms
3. **Academic:** schools, programs
4. **Operations:** attendance, taskTypes, taskAssignments, schedules
5. **Finance:** feeTypes, debts, payments
6. **Notifications:** notifications, cronJobLogs

---

## 2. Entity-Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  users ─────┐                                                   │
│             │                                                   │
│             ├──→ residents ─────┬──→ rooms                      │
│             │                   │                               │
│             │                   ├──→ schools ──→ programs       │
│             │                   │                               │
│             │                   └──→ attendance                 │
│             │                                                   │
│             ├──→ taskAssignments ──→ taskTypes                 │
│             │                                                   │
│             ├──→ debts ─────┬──→ feeTypes                      │
│             │               │                                   │
│             │               └──→ payments                       │
│             │                                                   │
│             ├──→ notifications                                  │
│             │                                                   │
│             └──→ schedules                                      │
│                                                                 │
│  cronJobLogs (standalone)                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Bảng Chi Tiết

### 3.1 Users

Lưu trữ thông tin người dùng hệ thống

| Cột | Kiểu | Ràng Buộc | Mô Tả |
|-----|------|----------|-------|
| `id` | INT | PK, AUTO_INCREMENT | ID duy nhất |
| `openId` | VARCHAR(64) | UNIQUE, NOT NULL | Manus OAuth ID |
| `name` | TEXT | | Tên người dùng |
| `email` | VARCHAR(320) | | Email |
| `loginMethod` | VARCHAR(64) | | Phương thức đăng nhập |
| `role` | ENUM | DEFAULT 'user' | admin, user |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Ngày tạo |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Ngày cập nhật |
| `lastSignedIn` | TIMESTAMP | DEFAULT NOW() | Lần đăng nhập cuối |

**Indexes:**
- `openId` (UNIQUE)
- `email`

---

### 3.2 Residents

Lưu trữ thông tin cư dân

| Cột | Kiểu | Ràng Buộc | Mô Tả |
|-----|------|----------|-------|
| `id` | INT | PK, AUTO_INCREMENT | ID duy nhất |
| `fullName` | VARCHAR(255) | NOT NULL | Họ tên |
| `email` | VARCHAR(320) | | Email |
| `phone` | VARCHAR(20) | | Số điện thoại |
| `dateOfBirth` | DATE | | Ngày sinh |
| `gender` | ENUM | | male, female |
| `schoolId` | INT | FK → schools | Trường học |
| `programId` | INT | FK → programs | Chương trình học |
| `roomId` | INT | FK → rooms | Phòng ở |
| `status` | ENUM | DEFAULT 'active' | active, inactive |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Ngày tạo |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `fullName`
- `schoolId`
- `programId`
- `roomId`
- `status`

---

### 3.3 Rooms

Lưu trữ thông tin phòng ở

| Cột | Kiểu | Ràng Buộc | Mô Tả |
|-----|------|----------|-------|
| `id` | INT | PK, AUTO_INCREMENT | ID duy nhất |
| `roomNumber` | VARCHAR(50) | UNIQUE, NOT NULL | Số phòng (VD: 101, 202) |
| `capacity` | INT | NOT NULL | Sức chứa |
| `description` | TEXT | | Mô tả |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Ngày tạo |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `roomNumber` (UNIQUE)

**Tính toán:**
- `occupancy` = COUNT(residents WHERE roomId = id)
- `occupancyRate` = occupancy / capacity * 100

---

### 3.4 Schools

Lưu trữ thông tin trường học

| Cột | Kiểu | Ràng Buộc | Mô Tả |
|-----|------|----------|-------|
| `id` | INT | PK, AUTO_INCREMENT | ID duy nhất |
| `name` | VARCHAR(255) | NOT NULL | Tên trường |
| `city` | VARCHAR(100) | | Thành phố |
| `address` | TEXT | | Địa chỉ |
| `phone` | VARCHAR(20) | | Số điện thoại |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Ngày tạo |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `name`
- `city`

---

### 3.5 Programs

Lưu trữ thông tin chương trình học

| Cột | Kiểu | Ràng Buộc | Mô Tả |
|-----|------|----------|-------|
| `id` | INT | PK, AUTO_INCREMENT | ID duy nhất |
| `schoolId` | INT | FK → schools, NOT NULL | Trường học |
| `name` | VARCHAR(255) | NOT NULL | Tên chương trình (VD: Lớp 10A1) |
| `academicYear` | VARCHAR(20) | | Năm học (VD: 2024-2025) |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Ngày tạo |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `schoolId`
- `name`

---

### 3.6 Attendance

Lưu trữ thông tin điểm danh

| Cột | Kiểu | Ràng Buộc | Mô Tả |
|-----|------|----------|-------|
| `id` | INT | PK, AUTO_INCREMENT | ID duy nhất |
| `residentId` | INT | FK → residents, NOT NULL | Cư dân |
| `date` | DATE | NOT NULL | Ngày |
| `checkInTime` | TIME | | Giờ vào |
| `checkOutTime` | TIME | | Giờ ra |
| `status` | ENUM | DEFAULT 'absent' | present, absent, late |
| `notes` | TEXT | | Ghi chú |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Ngày tạo |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `residentId`
- `date`
- `status`

**Unique Constraint:**
- `(residentId, date)` - Một cư dân chỉ có một record/ngày

---

### 3.7 Schedules

Lưu trữ lịch sinh hoạt chung

| Cột | Kiểu | Ràng Buộc | Mô Tả |
|-----|------|----------|-------|
| `id` | INT | PK, AUTO_INCREMENT | ID duy nhất |
| `name` | VARCHAR(255) | NOT NULL | Tên hoạt động (VD: Ăn sáng) |
| `type` | ENUM | NOT NULL | check_in, check_out, meal, study_hour, curfew, activity |
| `scheduledTime` | TIME | NOT NULL | Giờ (VD: 07:00) |
| `isDaily` | BOOLEAN | DEFAULT true | Hàng ngày? |
| `daysOfWeek` | JSON | | Ngày trong tuần (0-6) |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Ngày tạo |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `type`
- `scheduledTime`

---

### 3.8 TaskTypes

Lưu trữ loại công việc nhà

| Cột | Kiểu | Ràng Buộc | Mô Tả |
|-----|------|----------|-------|
| `id` | INT | PK, AUTO_INCREMENT | ID duy nhất |
| `name` | VARCHAR(255) | NOT NULL | Tên công việc (VD: Nấu cơm) |
| `description` | TEXT | | Mô tả chi tiết |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Ngày tạo |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Ngày cập nhật |

---

### 3.9 TaskAssignments

Lưu trữ phân công công việc

| Cột | Kiểu | Ràng Buộc | Mô Tả |
|-----|------|----------|-------|
| `id` | INT | PK, AUTO_INCREMENT | ID duy nhất |
| `taskTypeId` | INT | FK → taskTypes, NOT NULL | Loại công việc |
| `assignedTo` | INT | FK → residents, NOT NULL | Cư dân được giao |
| `dueDate` | DATE | NOT NULL | Ngày hết hạn |
| `status` | ENUM | DEFAULT 'pending' | pending, in_progress, completed |
| `notes` | TEXT | | Ghi chú |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Ngày tạo |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `assignedTo`
- `status`
- `dueDate`

---

### 3.10 FeeTypes

Lưu trữ loại phí

| Cột | Kiểu | Ràng Buộc | Mô Tả |
|-----|------|----------|-------|
| `id` | INT | PK, AUTO_INCREMENT | ID duy nhất |
| `name` | VARCHAR(255) | NOT NULL | Tên phí (VD: Tiền phòng) |
| `code` | VARCHAR(50) | UNIQUE, NOT NULL | Mã phí (VD: ROOM_FEE) |
| `amount` | DECIMAL(12,2) | NOT NULL | Số tiền |
| `billingCycle` | ENUM | DEFAULT 'monthly' | monthly, quarterly, yearly |
| `description` | TEXT | | Mô tả |
| `isActive` | BOOLEAN | DEFAULT true | Kích hoạt? |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Ngày tạo |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `code` (UNIQUE)
- `isActive`

---

### 3.11 Debts

Lưu trữ công nợ

| Cột | Kiểu | Ràng Buộc | Mô Tả |
|-----|------|----------|-------|
| `id` | INT | PK, AUTO_INCREMENT | ID duy nhất |
| `residentId` | INT | FK → residents, NOT NULL | Cư dân |
| `feeTypeId` | INT | FK → feeTypes, NOT NULL | Loại phí |
| `amount` | DECIMAL(12,2) | NOT NULL | Số tiền |
| `billingMonth` | VARCHAR(7) | NOT NULL | Tháng (YYYY-MM) |
| `dueDate` | DATE | NOT NULL | Ngày hết hạn |
| `status` | ENUM | DEFAULT 'unpaid' | unpaid, paid, overdue |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Ngày tạo |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `residentId`
- `status`
- `billingMonth`
- `dueDate`

**Unique Constraint:**
- `(residentId, feeTypeId, billingMonth)` - Một phí/tháng/cư dân

---

### 3.12 Payments

Lưu trữ thanh toán

| Cột | Kiểu | Ràng Buộc | Mô Tả |
|-----|------|----------|-------|
| `id` | INT | PK, AUTO_INCREMENT | ID duy nhất |
| `debtId` | INT | FK → debts, NOT NULL | Công nợ |
| `amount` | DECIMAL(12,2) | NOT NULL | Số tiền thanh toán |
| `paymentDate` | DATE | NOT NULL | Ngày thanh toán |
| `paymentMethod` | ENUM | NOT NULL | cash, bank_transfer, check |
| `notes` | TEXT | | Ghi chú |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Ngày tạo |

**Indexes:**
- `debtId`
- `paymentDate`

---

### 3.13 Notifications

Lưu trữ thông báo

| Cột | Kiểu | Ràng Buộc | Mô Tả |
|-----|------|----------|-------|
| `id` | INT | PK, AUTO_INCREMENT | ID duy nhất |
| `recipientId` | INT | FK → users, NOT NULL | Người nhận |
| `type` | ENUM | NOT NULL | fee_generated, debt_overdue, task_assigned, attendance_alert, system |
| `title` | VARCHAR(255) | NOT NULL | Tiêu đề |
| `content` | TEXT | NOT NULL | Nội dung |
| `relatedEntityType` | VARCHAR(50) | | Loại entity liên quan |
| `relatedEntityId` | INT | | ID entity liên quan |
| `isRead` | BOOLEAN | DEFAULT false | Đã đọc? |
| `sentAt` | TIMESTAMP | DEFAULT NOW() | Thời gian gửi |
| `readAt` | TIMESTAMP | | Thời gian đọc |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Ngày tạo |

**Indexes:**
- `recipientId`
- `isRead`
- `type`

---

### 3.14 CronJobLogs

Lưu trữ log cron jobs

| Cột | Kiểu | Ràng Buộc | Mô Tả |
|-----|------|----------|-------|
| `id` | INT | PK, AUTO_INCREMENT | ID duy nhất |
| `jobName` | VARCHAR(100) | NOT NULL | Tên job |
| `executionDate` | TIMESTAMP | DEFAULT NOW() | Thời gian chạy |
| `status` | ENUM | NOT NULL | success, failure, partial |
| `recordsProcessed` | INT | DEFAULT 0 | Số records xử lý |
| `errorMessage` | TEXT | | Lỗi (nếu có) |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Ngày tạo |

**Indexes:**
- `jobName`
- `executionDate`
- `status`

---

## 4. Relationships

### 4.1 One-to-Many

| Từ | Đến | Mô Tả |
|---|---|-------|
| schools | programs | Một trường có nhiều chương trình |
| schools | residents | Một trường có nhiều cư dân |
| programs | residents | Một chương trình có nhiều cư dân |
| rooms | residents | Một phòng có nhiều cư dân |
| residents | attendance | Một cư dân có nhiều bản ghi điểm danh |
| residents | taskAssignments | Một cư dân được giao nhiều công việc |
| residents | debts | Một cư dân có nhiều công nợ |
| taskTypes | taskAssignments | Một loại công việc có nhiều phân công |
| feeTypes | debts | Một loại phí có nhiều công nợ |
| debts | payments | Một công nợ có nhiều thanh toán |

### 4.2 Many-to-One

Ngược lại của one-to-many

---

## 5. Constraints & Validations

### 5.1 NOT NULL Constraints

- `residents.fullName` - Bắt buộc
- `rooms.roomNumber`, `capacity` - Bắt buộc
- `feeTypes.name`, `code`, `amount` - Bắt buộc
- `debts.amount`, `billingMonth`, `dueDate` - Bắt buộc

### 5.2 UNIQUE Constraints

- `users.openId`
- `rooms.roomNumber`
- `feeTypes.code`
- `(residents.residentId, residents.date)` - Một cư dân/ngày
- `(debts.residentId, debts.feeTypeId, debts.billingMonth)` - Một phí/tháng

### 5.3 CHECK Constraints

- `rooms.capacity > 0`
- `feeTypes.amount > 0`
- `debts.amount > 0`
- `payments.amount > 0`

### 5.4 Foreign Key Constraints

- `residents.schoolId` → `schools.id` (ON DELETE SET NULL)
- `residents.programId` → `programs.id` (ON DELETE SET NULL)
- `residents.roomId` → `rooms.id` (ON DELETE SET NULL)
- `programs.schoolId` → `schools.id` (ON DELETE CASCADE)
- `attendance.residentId` → `residents.id` (ON DELETE CASCADE)
- `taskAssignments.assignedTo` → `residents.id` (ON DELETE CASCADE)
- `debts.residentId` → `residents.id` (ON DELETE CASCADE)
- `payments.debtId` → `debts.id` (ON DELETE CASCADE)

---

## 6. Indexing Strategy

### 6.1 Indexes Hiện Tại

```sql
-- Users
CREATE UNIQUE INDEX idx_users_openId ON users(openId);
CREATE INDEX idx_users_email ON users(email);

-- Residents
CREATE INDEX idx_residents_fullName ON residents(fullName);
CREATE INDEX idx_residents_schoolId ON residents(schoolId);
CREATE INDEX idx_residents_programId ON residents(programId);
CREATE INDEX idx_residents_roomId ON residents(roomId);
CREATE INDEX idx_residents_status ON residents(status);

-- Rooms
CREATE UNIQUE INDEX idx_rooms_roomNumber ON rooms(roomNumber);

-- Schools
CREATE INDEX idx_schools_name ON schools(name);
CREATE INDEX idx_schools_city ON schools(city);

-- Programs
CREATE INDEX idx_programs_schoolId ON programs(schoolId);
CREATE INDEX idx_programs_name ON programs(name);

-- Attendance
CREATE INDEX idx_attendance_residentId ON attendance(residentId);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE UNIQUE INDEX idx_attendance_residentId_date ON attendance(residentId, date);

-- Schedules
CREATE INDEX idx_schedules_type ON schedules(type);
CREATE INDEX idx_schedules_scheduledTime ON schedules(scheduledTime);

-- TaskAssignments
CREATE INDEX idx_taskAssignments_assignedTo ON taskAssignments(assignedTo);
CREATE INDEX idx_taskAssignments_status ON taskAssignments(status);
CREATE INDEX idx_taskAssignments_dueDate ON taskAssignments(dueDate);

-- FeeTypes
CREATE UNIQUE INDEX idx_feeTypes_code ON feeTypes(code);
CREATE INDEX idx_feeTypes_isActive ON feeTypes(isActive);

-- Debts
CREATE INDEX idx_debts_residentId ON debts(residentId);
CREATE INDEX idx_debts_status ON debts(status);
CREATE INDEX idx_debts_billingMonth ON debts(billingMonth);
CREATE INDEX idx_debts_dueDate ON debts(dueDate);
CREATE UNIQUE INDEX idx_debts_residentId_feeTypeId_billingMonth ON debts(residentId, feeTypeId, billingMonth);

-- Payments
CREATE INDEX idx_payments_debtId ON payments(debtId);
CREATE INDEX idx_payments_paymentDate ON payments(paymentDate);

-- Notifications
CREATE INDEX idx_notifications_recipientId ON notifications(recipientId);
CREATE INDEX idx_notifications_isRead ON notifications(isRead);
CREATE INDEX idx_notifications_type ON notifications(type);

-- CronJobLogs
CREATE INDEX idx_cronJobLogs_jobName ON cronJobLogs(jobName);
CREATE INDEX idx_cronJobLogs_executionDate ON cronJobLogs(executionDate);
CREATE INDEX idx_cronJobLogs_status ON cronJobLogs(status);
```

### 6.2 Composite Indexes

- `(residentId, date)` trên attendance - Tìm điểm danh của cư dân trong ngày
- `(residentId, feeTypeId, billingMonth)` trên debts - Tìm công nợ cụ thể
- `(status, dueDate)` trên debts - Tìm công nợ quá hạn

---

## 7. Performance Considerations

### 7.1 Query Optimization

- Luôn sử dụng indexes khi filter/sort
- Tránh SELECT * - chỉ lấy cột cần thiết
- Sử dụng LIMIT khi lấy danh sách lớn
- Batch insert/update khi có nhiều records

### 7.2 Connection Pooling

```typescript
// Drizzle ORM tự động quản lý connection pool
// Default: min 5, max 20 connections
```

### 7.3 Query Caching

- Sử dụng tRPC query caching trên frontend
- Redis caching cho dữ liệu thường xuyên truy cập (tương lai)

---

## 8. Backup & Recovery

### 8.1 Backup Strategy

- **Daily:** Full backup vào 02:00 UTC
- **Hourly:** Incremental backup
- **Retention:** 30 ngày

### 8.2 Recovery Procedure

```bash
# Restore từ backup
mysql -u user -p database < backup_file.sql

# Point-in-time recovery
# Sử dụng binary logs
```

---

## 9. Migration Guide

### 9.1 Tạo Migration Mới

```bash
# Chỉnh sửa drizzle/schema.ts
# Sau đó:
pnpm drizzle-kit generate

# Review generated SQL file
# Sau đó apply:
webdev_execute_sql < drizzle/migrations/0001_*.sql
```

### 9.2 Rollback

```bash
# Không có automatic rollback
# Phải tạo migration mới để undo changes
```

---

**Phiên bản tài liệu:** 1.0  
**Cập nhật lần cuối:** Tháng 5 năm 2026  
**Trạng thái:** Production Ready
