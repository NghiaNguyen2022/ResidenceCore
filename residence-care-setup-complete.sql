-- ============================================
-- RESIDENCE CARE - DATABASE SETUP COMPLETE
-- ============================================
-- Tạo database, user, phân quyền, tất cả bảng, insert sample data
-- Chạy từ đầu đến giờ (29/05/2026)
-- ============================================

-- ============================================
-- 1. TẠO DATABASE
-- ============================================
DROP DATABASE IF EXISTS residence_care;
CREATE DATABASE residence_care 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- ============================================
-- 2. TẠO USER VÀ PHÂN QUYỀN
-- ============================================
DROP USER IF EXISTS 'residencecare'@'localhost';
CREATE USER 'residencecare'@'localhost' IDENTIFIED BY 'ResidenceCare@123';

-- Phân quyền toàn bộ cho database residence_care
GRANT ALL PRIVILEGES ON residence_care.* TO 'residencecare'@'localhost';
FLUSH PRIVILEGES;

-- ============================================
-- 3. SỬ DỤNG DATABASE
-- ============================================
USE residence_care;

-- ============================================
-- 4. TẠO CÁC BẢNG
-- ============================================

-- ============================================
-- 4.1 USERS TABLE
-- ============================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  role ENUM('user', 'admin', 'manager', 'supervisor', 'accountant', 'resident') DEFAULT 'user',
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_role (role)
);

-- ============================================
-- 4.2 SCHOOLS TABLE
-- ============================================
CREATE TABLE schools (
  id INT PRIMARY KEY AUTO_INCREMENT,
  schoolCode VARCHAR(50) NOT NULL UNIQUE,
  schoolName VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_schoolCode (schoolCode)
);

-- ============================================
-- 4.3 GROUPS TABLE (Tổ - Optional)
-- ============================================
CREATE TABLE groups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  groupCode VARCHAR(50) NOT NULL UNIQUE,
  groupName VARCHAR(255) NOT NULL,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_groupCode (groupCode)
);

-- ============================================
-- 4.4 ROOMS TABLE
-- ============================================
CREATE TABLE rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  roomCode VARCHAR(50) NOT NULL UNIQUE,
  capacity INT NOT NULL,
  groupId INT,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (groupId) REFERENCES groups(id) ON DELETE SET NULL,
  INDEX idx_roomCode (roomCode),
  INDEX idx_capacity (capacity),
  INDEX idx_groupId (groupId)
);

-- ============================================
-- 4.5 RESIDENTS TABLE
-- ============================================
CREATE TABLE residents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  residentCode VARCHAR(50) NOT NULL UNIQUE,
  userId INT,
  fullName VARCHAR(255) NOT NULL,
  dateOfBirth DATE,
  gender ENUM('male', 'female') DEFAULT 'male',
  idNumber VARCHAR(20) UNIQUE,
  permanentAddress TEXT,
  phoneNumber VARCHAR(20),
  schoolId INT,
  profileImage VARCHAR(255),
  currentRoomId INT,
  admissionDate DATE NOT NULL,
  departureDate DATE,
  status ENUM('active', 'left', 'temporary') DEFAULT 'active',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE SET NULL,
  FOREIGN KEY (currentRoomId) REFERENCES rooms(id) ON DELETE SET NULL,
  INDEX idx_residentCode (residentCode),
  INDEX idx_fullName (fullName),
  INDEX idx_status (status),
  INDEX idx_currentRoomId (currentRoomId),
  INDEX idx_admissionDate (admissionDate)
);

-- ============================================
-- 4.6 PARENTS TABLE
-- ============================================
CREATE TABLE parents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  residentId INT NOT NULL,
  parentType ENUM('father', 'mother', 'guardian') NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  idNumber VARCHAR(20),
  occupation VARCHAR(255),
  address TEXT,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (residentId) REFERENCES residents(id) ON DELETE CASCADE,
  INDEX idx_residentId (residentId),
  INDEX idx_parentType (parentType)
);

-- ============================================
-- 4.7 ROOM ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE room_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  residentId INT NOT NULL,
  roomId INT NOT NULL,
  assignedDate DATE NOT NULL,
  unassignedDate DATE,
  eventType ENUM('new_entry', 'transfer', 'left', 'temporary_leave') DEFAULT 'new_entry',
  reason TEXT,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (residentId) REFERENCES residents(id) ON DELETE CASCADE,
  FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE CASCADE,
  INDEX idx_residentId (residentId),
  INDEX idx_roomId (roomId),
  INDEX idx_assignedDate (assignedDate),
  INDEX idx_eventType (eventType)
);

-- ============================================
-- 4.8 ROOM LEADERS TABLE
-- ============================================
CREATE TABLE room_leaders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  roomId INT NOT NULL,
  residentId INT NOT NULL,
  appointedDate DATE NOT NULL,
  unappointedDate DATE,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (residentId) REFERENCES residents(id) ON DELETE CASCADE,
  INDEX idx_roomId (roomId),
  INDEX idx_residentId (residentId),
  INDEX idx_appointedDate (appointedDate)
);

-- ============================================
-- 4.9 FEES TABLE
-- ============================================
CREATE TABLE fees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  residentId INT NOT NULL,
  feeType VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  dueDate DATE,
  paidDate DATE,
  status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (residentId) REFERENCES residents(id) ON DELETE CASCADE,
  INDEX idx_residentId (residentId),
  INDEX idx_status (status),
  INDEX idx_dueDate (dueDate)
);

-- ============================================
-- 4.10 DEBTS TABLE
-- ============================================
CREATE TABLE debts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  residentId INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  reason TEXT,
  createdDate DATE NOT NULL,
  dueDate DATE,
  paidDate DATE,
  status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (residentId) REFERENCES residents(id) ON DELETE CASCADE,
  INDEX idx_residentId (residentId),
  INDEX idx_status (status)
);

-- ============================================
-- 4.11 TASKS TABLE
-- ============================================
CREATE TABLE tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  taskCode VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  taskType VARCHAR(100),
  assignedTo INT,
  dueDate DATE,
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_taskCode (taskCode),
  INDEX idx_status (status),
  INDEX idx_dueDate (dueDate)
);

-- ============================================
-- 4.12 ATTENDANCE TABLE
-- ============================================
CREATE TABLE attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  residentId INT NOT NULL,
  attendanceDate DATE NOT NULL,
  checkInTime TIME,
  checkOutTime TIME,
  status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (residentId) REFERENCES residents(id) ON DELETE CASCADE,
  INDEX idx_residentId (residentId),
  INDEX idx_attendanceDate (attendanceDate),
  INDEX idx_status (status),
  UNIQUE KEY unique_attendance (residentId, attendanceDate)
);

-- ============================================
-- 4.13 ATTENDANCE SCHEDULE TABLE
-- ============================================
CREATE TABLE attendanceSchedule (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  type ENUM('check_in', 'check_out', 'meal', 'study_hour', 'curfew', 'activity') NOT NULL,
  scheduledTime TIME NOT NULL,
  tolerance INT DEFAULT 0,
  isDaily BOOLEAN DEFAULT true,
  daysOfWeek JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  executedAt TIMESTAMP,
  nextScheduledAt TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_scheduledTime (scheduledTime)
);

-- ============================================
-- 4.14 ACTIVITIES TABLE
-- ============================================
CREATE TABLE activities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  activityCode VARCHAR(50) NOT NULL UNIQUE,
  activityName VARCHAR(255) NOT NULL,
  description TEXT,
  activityDate DATE,
  startTime TIME,
  endTime TIME,
  location VARCHAR(255),
  organizer INT,
  maxParticipants INT,
  status ENUM('planned', 'ongoing', 'completed', 'cancelled') DEFAULT 'planned',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_activityCode (activityCode),
  INDEX idx_activityDate (activityDate),
  INDEX idx_status (status)
);

-- ============================================
-- 4.15 ACTIVITY PARTICIPANTS TABLE
-- ============================================
CREATE TABLE activity_participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  activityId INT NOT NULL,
  residentId INT NOT NULL,
  participationStatus ENUM('registered', 'attended', 'absent', 'cancelled') DEFAULT 'registered',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (activityId) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (residentId) REFERENCES residents(id) ON DELETE CASCADE,
  INDEX idx_activityId (activityId),
  INDEX idx_residentId (residentId),
  UNIQUE KEY unique_participation (activityId, residentId)
);

-- ============================================
-- 5. INSERT SAMPLE DATA
-- ============================================

-- ============================================
-- 5.1 INSERT USERS
-- ============================================
INSERT INTO users (username, passwordHash, name, email, role, isActive) VALUES
('admin', '$2b$10$YourHashedPasswordHere', 'Admin User', 'admin@residencecare.local', 'admin', true),
('manager', '$2b$10$YourHashedPasswordHere', 'Manager User', 'manager@residencecare.local', 'manager', true),
('accountant', '$2b$10$YourHashedPasswordHere', 'Accountant User', 'accountant@residencecare.local', 'accountant', true);

-- ============================================
-- 5.2 INSERT SCHOOLS
-- ============================================
INSERT INTO schools (schoolCode, schoolName, address, phone, email) VALUES
('HUST', 'Đại học Bách Khoa Hà Nội', 'Hà Nội', '024-3868-3000', 'info@hust.edu.vn'),
('VNU', 'Đại học Quốc Gia Hà Nội', 'Hà Nội', '024-3358-1000', 'info@vnu.edu.vn'),
('NEU', 'Đại học Kinh tế Quốc dân', 'Hà Nội', '024-3556-1000', 'info@neu.edu.vn');

-- ============================================
-- 5.3 INSERT GROUPS (Tổ)
-- ============================================
INSERT INTO groups (groupCode, groupName, description) VALUES
('TỔ-A', 'Tổ A', 'Tổ quản lý dãy A'),
('TỔ-B', 'Tổ B', 'Tổ quản lý dãy B'),
('TỔ-C', 'Tổ C', 'Tổ quản lý dãy C');

-- ============================================
-- 5.4 INSERT ROOMS
-- ============================================
INSERT INTO rooms (roomCode, capacity, groupId, notes) VALUES
('A101', 4, 1, 'Phòng 4 chỗ dãy A tầng 1'),
('A102', 4, 1, 'Phòng 4 chỗ dãy A tầng 1'),
('A201', 6, 1, 'Phòng 6 chỗ dãy A tầng 2'),
('B101', 4, 2, 'Phòng 4 chỗ dãy B tầng 1'),
('B102', 6, 2, 'Phòng 6 chỗ dãy B tầng 1'),
('B201', 8, 2, 'Phòng 8 chỗ dãy B tầng 2'),
('C101', 4, 3, 'Phòng 4 chỗ dãy C tầng 1'),
('C102', 12, 3, 'Phòng 12 chỗ dãy C tầng 1');

-- ============================================
-- 5.5 INSERT RESIDENTS
-- ============================================
INSERT INTO residents (residentCode, fullName, dateOfBirth, gender, idNumber, permanentAddress, phoneNumber, schoolId, currentRoomId, admissionDate, status) VALUES
('RES-20260529-001', 'Lê Thị Nhung', '2005-03-15', 'female', '012345678901', 'Hà Nội', '0909090909', 1, 1, '2026-05-29', 'active'),
('RES-20260529-002', 'Trần Văn An', '2005-06-20', 'male', '012345678902', 'Hải Phòng', '0909090910', 1, 1, '2026-05-28', 'active'),
('RES-20260529-003', 'Phạm Thị Bình', '2005-09-10', 'female', '012345678903', 'Hà Nam', '0909090911', 2, 2, '2026-05-27', 'active'),
('RES-20260529-004', 'Nguyễn Văn Cường', '2005-12-05', 'male', '012345678904', 'Thái Nguyên', '0909090912', 2, 3, '2026-05-26', 'active'),
('RES-20260529-005', 'Hoàng Thị Dung', '2006-01-25', 'female', '012345678905', 'Bắc Giang', '0909090913', 3, 4, '2026-05-25', 'active');

-- ============================================
-- 5.6 INSERT PARENTS
-- ============================================
INSERT INTO parents (residentId, parentType, name, phone, email, occupation, address) VALUES
(1, 'father', 'Lê Văn A', '0912345678', 'leva@email.com', 'Kỹ sư', 'Hà Nội'),
(1, 'mother', 'Lê Thị B', '0912345679', 'letib@email.com', 'Giáo viên', 'Hà Nội'),
(2, 'father', 'Trần Văn C', '0912345680', 'tranvanc@email.com', 'Nông dân', 'Hải Phòng'),
(3, 'mother', 'Phạm Thị D', '0912345681', 'phamthid@email.com', 'Bác sĩ', 'Hà Nam');

-- ============================================
-- 5.7 INSERT ROOM ASSIGNMENTS
-- ============================================
INSERT INTO room_assignments (residentId, roomId, assignedDate, eventType, reason) VALUES
(1, 1, '2026-05-29', 'new_entry', 'Vào lưu trú mới'),
(2, 1, '2026-05-28', 'new_entry', 'Vào lưu trú mới'),
(3, 2, '2026-05-27', 'new_entry', 'Vào lưu trú mới'),
(4, 3, '2026-05-26', 'new_entry', 'Vào lưu trú mới'),
(5, 4, '2026-05-25', 'new_entry', 'Vào lưu trú mới');

-- ============================================
-- 5.8 INSERT ROOM LEADERS
-- ============================================
INSERT INTO room_leaders (roomId, residentId, appointedDate, notes) VALUES
(1, 1, '2026-05-29', 'Trưởng phòng A101'),
(2, 3, '2026-05-27', 'Trưởng phòng A102'),
(3, 4, '2026-05-26', 'Trưởng phòng A201'),
(4, 5, '2026-05-25', 'Trưởng phòng B101');

-- ============================================
-- 5.9 INSERT FEES
-- ============================================
INSERT INTO fees (residentId, feeType, amount, dueDate, status) VALUES
(1, 'Phí lưu trú tháng 5', 1000000, '2026-05-31', 'pending'),
(2, 'Phí lưu trú tháng 5', 1000000, '2026-05-31', 'pending'),
(3, 'Phí lưu trú tháng 5', 1000000, '2026-05-31', 'pending'),
(4, 'Phí lưu trú tháng 5', 1000000, '2026-05-31', 'pending'),
(5, 'Phí lưu trú tháng 5', 1000000, '2026-05-31', 'pending');

-- ============================================
-- 5.10 INSERT TASKS
-- ============================================
INSERT INTO tasks (taskCode, title, description, taskType, assignedTo, dueDate, status, priority) VALUES
('TASK-001', 'Kiểm tra vệ sinh phòng A', 'Kiểm tra vệ sinh phòng A101, A102, A201', 'inspection', 2, '2026-05-30', 'pending', 'high'),
('TASK-002', 'Thu phí tháng 5', 'Thu phí lưu trú tháng 5 từ tất cả học viên', 'finance', 3, '2026-05-31', 'pending', 'urgent');

-- ============================================
-- 5.11 INSERT ATTENDANCE SCHEDULE
-- ============================================
INSERT INTO attendanceSchedule (name, type, scheduledTime, tolerance, isDaily, daysOfWeek) VALUES
('Check-in sáng', 'check_in', '06:00:00', 15, true, '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]'),
('Check-out tối', 'check_out', '22:00:00', 15, true, '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]'),
('Ăn sáng', 'meal', '07:00:00', 30, true, '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]');

-- ============================================
-- 5.12 INSERT ACTIVITIES
-- ============================================
INSERT INTO activities (activityCode, activityName, description, activityDate, startTime, endTime, location, organizer, status) VALUES
('ACT-001', 'Gặp mặt đầu năm', 'Gặp mặt và giới thiệu học viên mới', '2026-06-01', '14:00:00', '16:00:00', 'Hội trường', 2, 'planned'),
('ACT-002', 'Bóng đá giao hữu', 'Trận bóng đá giữa các tổ', '2026-06-05', '16:00:00', '17:30:00', 'Sân bóng', 2, 'planned');

-- ============================================
-- 5.13 INSERT ACTIVITY PARTICIPANTS
-- ============================================
INSERT INTO activity_participants (activityId, residentId, participationStatus) VALUES
(1, 1, 'registered'),
(1, 2, 'registered'),
(1, 3, 'registered'),
(1, 4, 'registered'),
(1, 5, 'registered'),
(2, 1, 'registered'),
(2, 2, 'registered'),
(2, 4, 'registered');

-- ============================================
-- 6. VERIFY DATA
-- ============================================
SELECT 'Users:' as 'Info', COUNT(*) as 'Count' FROM users
UNION ALL
SELECT 'Schools', COUNT(*) FROM schools
UNION ALL
SELECT 'Groups', COUNT(*) FROM groups
UNION ALL
SELECT 'Rooms', COUNT(*) FROM rooms
UNION ALL
SELECT 'Residents', COUNT(*) FROM residents
UNION ALL
SELECT 'Parents', COUNT(*) FROM parents
UNION ALL
SELECT 'Room Assignments', COUNT(*) FROM room_assignments
UNION ALL
SELECT 'Room Leaders', COUNT(*) FROM room_leaders
UNION ALL
SELECT 'Fees', COUNT(*) FROM fees
UNION ALL
SELECT 'Tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'Attendance Schedule', COUNT(*) FROM attendanceSchedule
UNION ALL
SELECT 'Activities', COUNT(*) FROM activities
UNION ALL
SELECT 'Activity Participants', COUNT(*) FROM activity_participants;

-- ============================================
-- 7. DISPLAY SUMMARY
-- ============================================
SELECT '✅ DATABASE SETUP COMPLETE!' as 'Status';
SELECT 'Database: residence_care' as 'Info';
SELECT 'User: residencecare@localhost' as 'Info';
SELECT 'Password: ResidenceCare@123' as 'Info';
SELECT 'Tables created: 15' as 'Info';
SELECT 'Sample data inserted' as 'Info';
