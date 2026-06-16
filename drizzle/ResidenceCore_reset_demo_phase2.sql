-- ResidenceCore / App Luu Xa
-- RESET DEMO DATA FROM SCRATCH - PHASE 2
-- WARNING: Script nay xoa data nghiep vu hien co.
-- GIU LAI / DAM BAO:
--   1) admin / 123456
--   2) cau hinh cong tac: dutyTemplates, dutyConfigs, dutyChecklists, dutySchedules
--   3) cau hinh lich sinh hoat: daily_routine_templates, daily_routine_items
--   4) cau hinh nhiem ky/vai tro: organization_terms, organization_roles, roles
--   5) cau hinh app: appSettings, moduleDisplayModes
--
-- Chay tren database ResidenceCore dang dung.
-- Neu DB dang co du lieu quan trong, backup truoc khi chay.

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 1. XOA DATA NGHIEP VU / DEMO CU
-- ============================================================================

DELETE FROM `scheduleConflicts`;
DELETE FROM `dutyEvaluations`;
DELETE FROM `dutyAssignments`;

DELETE FROM `activityParticipants`;
DELETE FROM `activities`;

DELETE FROM `attendance`;
DELETE FROM `roomLeaders`;
DELETE FROM `roomAssignments`;
DELETE FROM `roomAssignmentHistory`;

DELETE FROM `organization_unit_members`;
DELETE FROM `organization_assignments`;

DELETE FROM `residentStudySchedules`;
DELETE FROM `residentEducation`;
DELETE FROM `residentAcademicInfo`;
DELETE FROM `parents`;

DELETE FROM `taskAssignments`;

DELETE FROM `payments`;
DELETE FROM `debts`;
DELETE FROM `residentFeeAssignments`;
DELETE FROM `feeChangeHistory`;
DELETE FROM `additionalFees`;
DELETE FROM `borrowedFees`;

DELETE FROM `revenuePayments`;
DELETE FROM `revenueHistory`;
DELETE FROM `revenues`;

DELETE FROM `storeSaleItems`;
DELETE FROM `storeRevenues`;
DELETE FROM `storeExpenses`;
DELETE FROM `libraryRevenues`;
DELETE FROM `libraryExpenses`;

DELETE FROM `expenseHistory`;
DELETE FROM `expenses`;

DELETE FROM `notifications`;
DELETE FROM `sessions`;

DELETE FROM `residents`;

-- Reset demo master data khong thuoc nhom cau hinh can giu
DELETE FROM `rooms`;
DELETE FROM `groups`;
DELETE FROM `programs`;
DELETE FROM `schools`;

-- Xoa user demo, giu lai admin
DELETE ur
FROM `userRoles` ur
JOIN `users` u ON u.`id` = ur.`userId`
WHERE u.`username` <> 'admin';

DELETE FROM `users`
WHERE `username` <> 'admin';

SET FOREIGN_KEY_CHECKS = 1;


-- END RESET DEMO PHASE 2
SET SQL_SAFE_UPDATES = 1;


-- ============================================================================
-- 2. DAM BAO ADMIN / 123456
-- ============================================================================

INSERT INTO `users` (
      `username`,
      `passwordHash`,
      `name`,
      `email`,
      `role`,
      `isActive`,
      `mustChangePassword`
)
VALUES (
      'admin',
      '$2b$10$cTzCcbCgqq8dJkVjOuzysulGHwN/R6ZFRGnFoQDrGsN8PoqxivHBi',
      'Quản trị hệ thống',
      'admin@residence.local',
      'admin',
      1,
      0
)
ON DUPLICATE KEY UPDATE
      `passwordHash` = VALUES(`passwordHash`),
      `name` = VALUES(`name`),
      `email` = VALUES(`email`),
      `role` = 'admin',
      `isActive` = 1,
      `mustChangePassword` = 0;

-- Dam bao app roles co admin/manager/resident
INSERT INTO `roles` (`roleKey`, `roleName`, `description`, `isSystem`, `isActive`, `sortOrder`)
VALUES
      ('admin', 'Quản trị hệ thống', 'Toàn quyền hệ thống', 1, 1, 1),
      ('manager', 'Quản lý lưu xá', 'Quản lý nghiệp vụ lưu xá', 1, 1, 2),
      ('resident', 'Học viên lưu trú', 'Tài khoản học viên', 1, 1, 10)
ON DUPLICATE KEY UPDATE
      `roleName` = VALUES(`roleName`),
      `description` = VALUES(`description`),
      `isSystem` = VALUES(`isSystem`),
      `isActive` = VALUES(`isActive`),
      `sortOrder` = VALUES(`sortOrder`);

SET @adminUserId = (SELECT `id` FROM `users` WHERE `username` = 'admin' LIMIT 1);
SET @adminRoleId = (SELECT `id` FROM `roles` WHERE `roleKey` = 'admin' LIMIT 1);
SET @managerRoleId = (SELECT `id` FROM `roles` WHERE `roleKey` = 'manager' LIMIT 1);
SET @residentRoleId = (SELECT `id` FROM `roles` WHERE `roleKey` = 'resident' LIMIT 1);

INSERT INTO `userRoles` (`userId`, `roleId`)
SELECT @adminUserId, @adminRoleId
WHERE NOT EXISTS (
      SELECT 1 FROM `userRoles`
      WHERE `userId` = @adminUserId AND `roleId` = @adminRoleId
);

INSERT INTO `userRoles` (`userId`, `roleId`)
SELECT @adminUserId, @managerRoleId
WHERE NOT EXISTS (
      SELECT 1 FROM `userRoles`
      WHERE `userId` = @adminUserId AND `roleId` = @managerRoleId
);

-- ============================================================================
-- 3. DAM BAO CAU HINH VAI TRO TO CHUC / NHIEM KY / TO BAN
-- ============================================================================

INSERT INTO `organization_roles` (
      `code`,
      `name`,
      `category`,
      `description`,
      `allow_multiple_members`,
      `is_active`,
      `sort_order`,
      `level`,
      `role_type`,
      `min_assignees`,
      `max_assignees`,
      `is_system`,
      `requires_unit`
)
VALUES
      ('house_leader', 'Trưởng lưu xá', 'management', 'Vai trò điều hành chính của lưu xá', 0, 1, 1, 1, 'house_leader', 0, 1, 1, 0),
      ('deputy', 'Phó lưu xá', 'management', 'Hỗ trợ Trưởng lưu xá', 1, 1, 2, 1, 'deputy', 0, 2, 1, 0),
      ('secretary', 'Thư ký', 'management', 'Theo dõi ghi chép, tổng hợp thông tin', 0, 1, 3, 1, 'secretary', 0, 1, 1, 0),
      ('treasurer', 'Thủ quỹ', 'finance', 'Theo dõi các việc liên quan đến quỹ', 0, 1, 4, 1, 'treasurer', 0, 1, 1, 0),
      ('team_leader', 'Tổ trưởng', 'life', 'Phụ trách một Tổ cụ thể', 1, 1, 10, 2, 'team_leader', 0, 1, 1, 1),
      ('committee_head', 'Trưởng ban', 'activity', 'Phụ trách một Ban cụ thể', 1, 1, 20, 2, 'committee_head', 0, 1, 1, 1)
ON DUPLICATE KEY UPDATE
      `name` = VALUES(`name`),
      `category` = VALUES(`category`),
      `description` = VALUES(`description`),
      `allow_multiple_members` = VALUES(`allow_multiple_members`),
      `is_active` = 1,
      `sort_order` = VALUES(`sort_order`),
      `level` = VALUES(`level`),
      `role_type` = VALUES(`role_type`),
      `min_assignees` = VALUES(`min_assignees`),
      `max_assignees` = VALUES(`max_assignees`),
      `is_system` = VALUES(`is_system`),
      `requires_unit` = VALUES(`requires_unit`);

-- Chot 1 nhiem ky demo active de test
UPDATE `organization_terms`
SET `status` = 'inactive'
WHERE `code` <> 'TERM-2026-DEMO';

INSERT INTO `organization_terms` (
      `code`,
      `name`,
      `start_date`,
      `end_date`,
      `status`,
      `description`
)
VALUES (
      'TERM-2026-DEMO',
      'Nhiệm kỳ Demo 2026',
      '2026-01-01',
      '2026-12-31',
      'active',
      'Nhiệm kỳ demo dùng cho Phase 2 test'
)
ON DUPLICATE KEY UPDATE
      `name` = VALUES(`name`),
      `start_date` = VALUES(`start_date`),
      `end_date` = VALUES(`end_date`),
      `status` = 'active',
      `description` = VALUES(`description`);

INSERT INTO `organization_units` (
      `code`,
      `name`,
      `unit_type`,
      `description`,
      `is_active`,
      `sort_order`
)
VALUES
      ('TEAM-01', 'Tổ 1', 'team', 'Tổ sinh hoạt số 1', 1, 1),
      ('TEAM-02', 'Tổ 2', 'team', 'Tổ sinh hoạt số 2', 1, 2),
      ('COM-LITURGY', 'Ban Phụng vụ', 'committee', 'Phụ trách phụng vụ và sinh hoạt thiêng liêng', 1, 10),
      ('COM-LIFE', 'Ban Đời sống', 'committee', 'Phụ trách đời sống, vệ sinh và sinh hoạt chung', 1, 20)
ON DUPLICATE KEY UPDATE
      `name` = VALUES(`name`),
      `unit_type` = VALUES(`unit_type`),
      `description` = VALUES(`description`),
      `is_active` = 1,
      `sort_order` = VALUES(`sort_order`);

-- ============================================================================
-- 4. DAM BAO MAU CONG TAC / LICH SINH HOAT CO BAN
-- ============================================================================

INSERT INTO `dutyTemplates` (
      `templateCode`,
      `templateName`,
      `description`,
      `dutyType`,
      `startTime`,
      `endTime`,
      `minPersons`,
      `maxPersons`,
      `isActive`
)
VALUES
      ('TPL-TRUC-NHA-AN', 'Trực nhà ăn', 'Chuẩn bị, dọn dẹp khu vực nhà ăn', 'daily', '06:00:00', '07:00:00', 1, 3, 1),
      ('TPL-VE-SINH-CHUNG', 'Vệ sinh khu vực chung', 'Vệ sinh hành lang, sân, khu sinh hoạt chung', 'daily', '17:00:00', '18:00:00', 2, 8, 1),
      ('TPL-SINH-HOAT-TO', 'Sinh hoạt tổ', 'Sinh hoạt định kỳ theo tổ', 'weekly', '19:00:00', '20:00:00', 1, 20, 1),
      ('TPL-HOP-BAN', 'Họp ban', 'Họp ban phụ trách', 'monthly', '19:30:00', '20:30:00', 1, 10, 1)
ON DUPLICATE KEY UPDATE
      `templateName` = VALUES(`templateName`),
      `description` = VALUES(`description`),
      `dutyType` = VALUES(`dutyType`),
      `startTime` = VALUES(`startTime`),
      `endTime` = VALUES(`endTime`),
      `minPersons` = VALUES(`minPersons`),
      `maxPersons` = VALUES(`maxPersons`),
      `isActive` = 1;

INSERT INTO `dutyConfigs` (
      `dutyCode`,
      `dutyName`,
      `description`,
      `templateId`,
      `dutyType`,
      `startTime`,
      `endTime`,
      `minPersons`,
      `maxPersons`,
      `frequency`,
      `dayOfWeek`,
      `requiresStudyScheduleCheck`,
      `isActive`
)
VALUES
      ('TRUC-NHA-AN-SANG', 'Trực nhà ăn buổi sáng', 'Trực nhà ăn hằng ngày buổi sáng',
            (SELECT `id` FROM `dutyTemplates` WHERE `templateCode` = 'TPL-TRUC-NHA-AN' LIMIT 1),
            'daily', '06:00:00', '07:00:00', 1, 3, 'daily', NULL, 1, 1),
      ('VE-SINH-CHUNG-CHIEU', 'Vệ sinh khu vực chung buổi chiều', 'Công tác vệ sinh khu vực chung',
            (SELECT `id` FROM `dutyTemplates` WHERE `templateCode` = 'TPL-VE-SINH-CHUNG' LIMIT 1),
            'daily', '17:00:00', '18:00:00', 2, 8, 'daily', NULL, 1, 1),
      ('SINH-HOAT-TO-THU6', 'Sinh hoạt tổ tối thứ Sáu', 'Sinh hoạt theo tổ vào tối thứ Sáu',
            (SELECT `id` FROM `dutyTemplates` WHERE `templateCode` = 'TPL-SINH-HOAT-TO' LIMIT 1),
            'weekly', '19:00:00', '20:00:00', 1, 20, 'weekly', 5, 0, 1),
      ('HOP-BAN-THANG', 'Họp ban hằng tháng', 'Họp ban phụ trách theo tháng',
            (SELECT `id` FROM `dutyTemplates` WHERE `templateCode` = 'TPL-HOP-BAN' LIMIT 1),
            'monthly', '19:30:00', '20:30:00', 1, 10, 'monthly', NULL, 0, 1)
ON DUPLICATE KEY UPDATE
      `dutyName` = VALUES(`dutyName`),
      `description` = VALUES(`description`),
      `templateId` = VALUES(`templateId`),
      `dutyType` = VALUES(`dutyType`),
      `startTime` = VALUES(`startTime`),
      `endTime` = VALUES(`endTime`),
      `minPersons` = VALUES(`minPersons`),
      `maxPersons` = VALUES(`maxPersons`),
      `frequency` = VALUES(`frequency`),
      `dayOfWeek` = VALUES(`dayOfWeek`),
      `requiresStudyScheduleCheck` = VALUES(`requiresStudyScheduleCheck`),
      `isActive` = 1;

-- Rebuild checklist cho cac duty demo
DELETE dc
FROM `dutyChecklists` dc
JOIN `dutyConfigs` cfg ON cfg.`id` = dc.`dutyConfigId`
WHERE cfg.`dutyCode` IN (
      'TRUC-NHA-AN-SANG',
      'VE-SINH-CHUNG-CHIEU',
      'SINH-HOAT-TO-THU6',
      'HOP-BAN-THANG'
);

INSERT INTO `dutyChecklists` (
      `dutyConfigId`,
      `itemOrder`,
      `checklistItem`,
      `isRequired`,
      `description`,
      `estimatedTimeMinutes`
)
VALUES
      ((SELECT `id` FROM `dutyConfigs` WHERE `dutyCode` = 'TRUC-NHA-AN-SANG' LIMIT 1), 1, 'Lau bàn ăn', 1, NULL, 15),
      ((SELECT `id` FROM `dutyConfigs` WHERE `dutyCode` = 'TRUC-NHA-AN-SANG' LIMIT 1), 2, 'Dọn rác khu nhà ăn', 1, NULL, 10),
      ((SELECT `id` FROM `dutyConfigs` WHERE `dutyCode` = 'VE-SINH-CHUNG-CHIEU' LIMIT 1), 1, 'Quét hành lang', 1, NULL, 20),
      ((SELECT `id` FROM `dutyConfigs` WHERE `dutyCode` = 'VE-SINH-CHUNG-CHIEU' LIMIT 1), 2, 'Lau khu sinh hoạt chung', 1, NULL, 20),
      ((SELECT `id` FROM `dutyConfigs` WHERE `dutyCode` = 'SINH-HOAT-TO-THU6' LIMIT 1), 1, 'Điểm danh thành viên tổ', 1, NULL, 10),
      ((SELECT `id` FROM `dutyConfigs` WHERE `dutyCode` = 'SINH-HOAT-TO-THU6' LIMIT 1), 2, 'Ghi nhận việc cần hỗ trợ', 0, NULL, 15),
      ((SELECT `id` FROM `dutyConfigs` WHERE `dutyCode` = 'HOP-BAN-THANG' LIMIT 1), 1, 'Chuẩn bị nội dung họp', 1, NULL, 20),
      ((SELECT `id` FROM `dutyConfigs` WHERE `dutyCode` = 'HOP-BAN-THANG' LIMIT 1), 2, 'Ghi chú kết luận', 1, NULL, 20);

INSERT INTO `daily_routine_templates` (
      `code`,
      `name`,
      `day_type`,
      `description`,
      `is_active`,
      `sort_order`
)
VALUES
      ('WEEKDAY-DEMO', 'Ngày thường', 'weekday', 'Lịch sinh hoạt mẫu ngày thường', 1, 1),
      ('SUNDAY-DEMO', 'Chúa nhật', 'sunday', 'Lịch sinh hoạt mẫu Chúa nhật', 1, 2)
ON DUPLICATE KEY UPDATE
      `name` = VALUES(`name`),
      `day_type` = VALUES(`day_type`),
      `description` = VALUES(`description`),
      `is_active` = 1,
      `sort_order` = VALUES(`sort_order`);

DELETE dri
FROM `daily_routine_items` dri
JOIN `daily_routine_templates` drt ON drt.`id` = dri.`template_id`
WHERE drt.`code` IN ('WEEKDAY-DEMO', 'SUNDAY-DEMO');

INSERT INTO `daily_routine_items` (
      `template_id`,
      `start_time`,
      `end_time`,
      `title`,
      `location`,
      `description`,
      `is_active`,
      `sort_order`
)
VALUES
      ((SELECT `id` FROM `daily_routine_templates` WHERE `code` = 'WEEKDAY-DEMO' LIMIT 1), '05:30:00', '06:00:00', 'Thức dậy', 'Lưu xá', NULL, 1, 1),
      ((SELECT `id` FROM `daily_routine_templates` WHERE `code` = 'WEEKDAY-DEMO' LIMIT 1), '06:00:00', '06:30:00', 'Cầu nguyện / sinh hoạt sáng', 'Nhà nguyện', NULL, 1, 2),
      ((SELECT `id` FROM `daily_routine_templates` WHERE `code` = 'WEEKDAY-DEMO' LIMIT 1), '18:30:00', '19:00:00', 'Cơm tối', 'Nhà ăn', NULL, 1, 3),
      ((SELECT `id` FROM `daily_routine_templates` WHERE `code` = 'WEEKDAY-DEMO' LIMIT 1), '19:30:00', '21:30:00', 'Giờ tự học', 'Phòng học chung', NULL, 1, 4),
      ((SELECT `id` FROM `daily_routine_templates` WHERE `code` = 'SUNDAY-DEMO' LIMIT 1), '06:00:00', '07:00:00', 'Thánh lễ / sinh hoạt Chúa nhật', 'Nhà nguyện', NULL, 1, 1),
      ((SELECT `id` FROM `daily_routine_templates` WHERE `code` = 'SUNDAY-DEMO' LIMIT 1), '19:00:00', '20:00:00', 'Sinh hoạt chung', 'Hội trường', NULL, 1, 2);

-- ============================================================================
-- 5. TAO DATA DEMO MOI: PHONG, TRUONG, HOC VIEN
-- ============================================================================

INSERT INTO `groups` (`groupCode`, `groupName`, `description`)
VALUES
      ('G-NAM', 'Khu Nam', 'Nhóm phòng khu Nam'),
      ('G-NU', 'Khu Nữ', 'Nhóm phòng khu Nữ');

INSERT INTO `rooms` (`roomCode`, `capacity`, `groupId`, `notes`)
VALUES
      ('A101', 4, (SELECT `id` FROM `groups` WHERE `groupCode` = 'G-NAM' LIMIT 1), 'Phòng demo 4 chỗ'),
      ('A102', 4, (SELECT `id` FROM `groups` WHERE `groupCode` = 'G-NAM' LIMIT 1), 'Phòng demo 4 chỗ'),
      ('B201', 4, (SELECT `id` FROM `groups` WHERE `groupCode` = 'G-NU' LIMIT 1), 'Phòng demo 4 chỗ'),
      ('B202', 4, (SELECT `id` FROM `groups` WHERE `groupCode` = 'G-NU' LIMIT 1), 'Phòng demo 4 chỗ');

INSERT INTO `schools` (`name`, `type`, `address`, `phoneNumber`)
VALUES
      ('Đại học Demo Sài Gòn', 'university', 'Quận 1, TP.HCM', '0280000001'),
      ('Cao đẳng Demo Thủ Đức', 'college', 'TP. Thủ Đức, TP.HCM', '0280000002');

INSERT INTO `programs` (`schoolId`, `name`, `code`)
VALUES
      ((SELECT `id` FROM `schools` WHERE `name` = 'Đại học Demo Sài Gòn' LIMIT 1), 'Công nghệ thông tin', 'CNTT'),
      ((SELECT `id` FROM `schools` WHERE `name` = 'Đại học Demo Sài Gòn' LIMIT 1), 'Kế toán', 'KT'),
      ((SELECT `id` FROM `schools` WHERE `name` = 'Cao đẳng Demo Thủ Đức' LIMIT 1), 'Quản trị kinh doanh', 'QTKD');

-- User hoc vien demo, pass 123456, bat doi mat khau lan dau
INSERT INTO `users` (`username`, `passwordHash`, `name`, `role`, `isActive`, `mustChangePassword`)
VALUES
      ('anna.nguyen', '$2b$10$cTzCcbCgqq8dJkVjOuzysulGHwN/R6ZFRGnFoQDrGsN8PoqxivHBi', 'Anna Nguyễn', 'resident', 1, 1),
      ('bao.tran', '$2b$10$cTzCcbCgqq8dJkVjOuzysulGHwN/R6ZFRGnFoQDrGsN8PoqxivHBi', 'Bảo Trần', 'resident', 1, 1),
      ('chi.le', '$2b$10$cTzCcbCgqq8dJkVjOuzysulGHwN/R6ZFRGnFoQDrGsN8PoqxivHBi', 'Chi Lê', 'resident', 1, 1),
      ('dung.pham', '$2b$10$cTzCcbCgqq8dJkVjOuzysulGHwN/R6ZFRGnFoQDrGsN8PoqxivHBi', 'Dũng Phạm', 'resident', 1, 1),
      ('emily.vo', '$2b$10$cTzCcbCgqq8dJkVjOuzysulGHwN/R6ZFRGnFoQDrGsN8PoqxivHBi', 'Emily Võ', 'resident', 1, 1),
      ('phuc.hoang', '$2b$10$cTzCcbCgqq8dJkVjOuzysulGHwN/R6ZFRGnFoQDrGsN8PoqxivHBi', 'Phúc Hoàng', 'resident', 1, 1),
      ('linh.do', '$2b$10$cTzCcbCgqq8dJkVjOuzysulGHwN/R6ZFRGnFoQDrGsN8PoqxivHBi', 'Linh Đỗ', 'resident', 1, 1),
      ('minh.bui', '$2b$10$cTzCcbCgqq8dJkVjOuzysulGHwN/R6ZFRGnFoQDrGsN8PoqxivHBi', 'Minh Bùi', 'resident', 1, 1);

INSERT INTO `userRoles` (`userId`, `roleId`)
SELECT u.`id`, @residentRoleId
FROM `users` u
WHERE u.`role` = 'resident'
  AND NOT EXISTS (
      SELECT 1 FROM `userRoles` ur
      WHERE ur.`userId` = u.`id` AND ur.`roleId` = @residentRoleId
  );

INSERT INTO `residents` (
      `residentCode`,
      `holyName`,
      `userId`,
      `fullName`,
      `dateOfBirth`,
      `gender`,
      `idNumber`,
      `permanentAddress`,
      `phoneNumber`,
      `schoolId`,
      `status`,
      `currentRoomId`,
      `admissionDate`,
      `notes`
)
VALUES
      ('RES-DEMO-001', 'Maria', (SELECT `id` FROM `users` WHERE `username` = 'anna.nguyen' LIMIT 1), 'Anna Nguyễn', '2005-03-12', 'female', '079205000001', 'Đồng Nai', '0901000001', (SELECT `id` FROM `schools` WHERE `name` = 'Đại học Demo Sài Gòn' LIMIT 1), 'active', (SELECT `id` FROM `rooms` WHERE `roomCode` = 'B201' LIMIT 1), '2026-01-05', 'Demo - Trưởng lưu xá'),
      ('RES-DEMO-002', 'Giuse', (SELECT `id` FROM `users` WHERE `username` = 'bao.tran' LIMIT 1), 'Bảo Trần', '2004-09-20', 'male', '079204000002', 'Bình Dương', '0901000002', (SELECT `id` FROM `schools` WHERE `name` = 'Đại học Demo Sài Gòn' LIMIT 1), 'active', (SELECT `id` FROM `rooms` WHERE `roomCode` = 'A101' LIMIT 1), '2026-01-05', 'Demo - Phó lưu xá'),
      ('RES-DEMO-003', 'Têrêsa', (SELECT `id` FROM `users` WHERE `username` = 'chi.le' LIMIT 1), 'Chi Lê', '2005-11-02', 'female', '079205000003', 'Long An', '0901000003', (SELECT `id` FROM `schools` WHERE `name` = 'Cao đẳng Demo Thủ Đức' LIMIT 1), 'active', (SELECT `id` FROM `rooms` WHERE `roomCode` = 'B201' LIMIT 1), '2026-01-06', 'Demo - Thư ký'),
      ('RES-DEMO-004', 'Phêrô', (SELECT `id` FROM `users` WHERE `username` = 'dung.pham' LIMIT 1), 'Dũng Phạm', '2003-07-18', 'male', '079203000004', 'Tây Ninh', '0901000004', (SELECT `id` FROM `schools` WHERE `name` = 'Đại học Demo Sài Gòn' LIMIT 1), 'active', (SELECT `id` FROM `rooms` WHERE `roomCode` = 'A101' LIMIT 1), '2026-01-06', 'Demo - Thủ quỹ'),
      ('RES-DEMO-005', 'Anna', (SELECT `id` FROM `users` WHERE `username` = 'emily.vo' LIMIT 1), 'Emily Võ', '2006-01-22', 'female', '079206000005', 'Tiền Giang', '0901000005', (SELECT `id` FROM `schools` WHERE `name` = 'Đại học Demo Sài Gòn' LIMIT 1), 'active', (SELECT `id` FROM `rooms` WHERE `roomCode` = 'B202' LIMIT 1), '2026-01-08', 'Demo - Tổ trưởng Tổ 1'),
      ('RES-DEMO-006', 'Phaolô', (SELECT `id` FROM `users` WHERE `username` = 'phuc.hoang' LIMIT 1), 'Phúc Hoàng', '2004-05-16', 'male', '079204000006', 'Bến Tre', '0901000006', (SELECT `id` FROM `schools` WHERE `name` = 'Cao đẳng Demo Thủ Đức' LIMIT 1), 'active', (SELECT `id` FROM `rooms` WHERE `roomCode` = 'A102' LIMIT 1), '2026-01-08', 'Demo - Tổ trưởng Tổ 2'),
      ('RES-DEMO-007', 'Maria', (SELECT `id` FROM `users` WHERE `username` = 'linh.do' LIMIT 1), 'Linh Đỗ', '2005-12-01', 'female', '079205000007', 'Vĩnh Long', '0901000007', (SELECT `id` FROM `schools` WHERE `name` = 'Đại học Demo Sài Gòn' LIMIT 1), 'active', (SELECT `id` FROM `rooms` WHERE `roomCode` = 'B202' LIMIT 1), '2026-01-09', 'Demo - Trưởng ban Phụng vụ'),
      ('RES-DEMO-008', 'Gioan', (SELECT `id` FROM `users` WHERE `username` = 'minh.bui' LIMIT 1), 'Minh Bùi', '2003-10-10', 'male', '079203000008', 'Cần Thơ', '0901000008', (SELECT `id` FROM `schools` WHERE `name` = 'Đại học Demo Sài Gòn' LIMIT 1), 'active', (SELECT `id` FROM `rooms` WHERE `roomCode` = 'A102' LIMIT 1), '2026-01-09', 'Demo - Trưởng ban Đời sống');

INSERT INTO `parents` (`residentId`, `parentType`, `fullName`, `phoneNumber`, `address`)
SELECT r.`id`, 'father', CONCAT('Phụ huynh ', r.`fullName`), CONCAT('091', LPAD(r.`id`, 7, '0')), r.`permanentAddress`
FROM `residents` r
WHERE r.`residentCode` LIKE 'RES-DEMO-%';

INSERT INTO `residentEducation` (`residentId`, `schoolName`, `educationLevel`, `classOrMajor`, `academicYear`, `notes`, `isActive`)
SELECT r.`id`, s.`name`, 'university', 'Lớp / ngành demo', '2025-2026', 'Thông tin học tập demo Phase 2', 1
FROM `residents` r
LEFT JOIN `schools` s ON s.`id` = r.`schoolId`
WHERE r.`residentCode` LIKE 'RES-DEMO-%';

INSERT INTO `residentStudySchedules` (`residentId`, `dayOfWeek`, `startTime`, `endTime`, `subjectName`, `location`, `notes`, `isActive`)
SELECT r.`id`, 'monday', '09:00:00', '11:30:00', 'Môn học sáng thứ Hai', 'Trường học', 'Dùng test conflict công tác', 1
FROM `residents` r WHERE r.`residentCode` IN ('RES-DEMO-001','RES-DEMO-002','RES-DEMO-003','RES-DEMO-004');

INSERT INTO `residentStudySchedules` (`residentId`, `dayOfWeek`, `startTime`, `endTime`, `subjectName`, `location`, `notes`, `isActive`)
SELECT r.`id`, 'wednesday', '13:30:00', '16:00:00', 'Môn học chiều thứ Tư', 'Trường học', 'Dùng test conflict công tác', 1
FROM `residents` r WHERE r.`residentCode` IN ('RES-DEMO-005','RES-DEMO-006','RES-DEMO-007','RES-DEMO-008');

INSERT INTO `roomAssignments` (`residentId`, `roomId`, `assignedDate`, `eventType`, `reason`, `notes`)
SELECT r.`id`, r.`currentRoomId`, r.`admissionDate`, 'new_entry', 'Demo nhập lưu xá', 'Phân phòng demo'
FROM `residents` r
WHERE r.`residentCode` LIKE 'RES-DEMO-%'
  AND r.`currentRoomId` IS NOT NULL;

INSERT INTO `roomAssignmentHistory` (`residentId`, `roomId`, `assignmentDate`, `assignedBy`, `reason`)
SELECT r.`id`, r.`currentRoomId`, TIMESTAMP(r.`admissionDate`), @adminUserId, 'Demo nhập lưu xá'
FROM `residents` r
WHERE r.`residentCode` LIKE 'RES-DEMO-%'
  AND r.`currentRoomId` IS NOT NULL;

-- ============================================================================
-- 6. DEMO TO CHUC: BO NHIEM + THANH VIEN TO/BAN
-- ============================================================================

SET @termId = (SELECT `id` FROM `organization_terms` WHERE `code` = 'TERM-2026-DEMO' LIMIT 1);

SET @roleHouseLeader = (SELECT `id` FROM `organization_roles` WHERE `code` = 'house_leader' LIMIT 1);
SET @roleDeputy = (SELECT `id` FROM `organization_roles` WHERE `code` = 'deputy' LIMIT 1);
SET @roleSecretary = (SELECT `id` FROM `organization_roles` WHERE `code` = 'secretary' LIMIT 1);
SET @roleTreasurer = (SELECT `id` FROM `organization_roles` WHERE `code` = 'treasurer' LIMIT 1);
SET @roleTeamLeader = (SELECT `id` FROM `organization_roles` WHERE `code` = 'team_leader' LIMIT 1);
SET @roleCommitteeHead = (SELECT `id` FROM `organization_roles` WHERE `code` = 'committee_head' LIMIT 1);

SET @team1 = (SELECT `id` FROM `organization_units` WHERE `code` = 'TEAM-01' LIMIT 1);
SET @team2 = (SELECT `id` FROM `organization_units` WHERE `code` = 'TEAM-02' LIMIT 1);
SET @comLiturgy = (SELECT `id` FROM `organization_units` WHERE `code` = 'COM-LITURGY' LIMIT 1);
SET @comLife = (SELECT `id` FROM `organization_units` WHERE `code` = 'COM-LIFE' LIMIT 1);

INSERT INTO `organization_assignments` (`term_id`, `role_id`, `resident_id`, `unit_id`, `assignment_title`, `start_date`, `status`, `notes`)
VALUES
      (@termId, @roleHouseLeader, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-001' LIMIT 1), NULL, 'Trưởng lưu xá', '2026-01-01', 'active', 'Demo'),
      (@termId, @roleDeputy, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-002' LIMIT 1), NULL, 'Phó lưu xá', '2026-01-01', 'active', 'Demo'),
      (@termId, @roleSecretary, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-003' LIMIT 1), NULL, 'Thư ký', '2026-01-01', 'active', 'Demo'),
      (@termId, @roleTreasurer, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-004' LIMIT 1), NULL, 'Thủ quỹ', '2026-01-01', 'active', 'Demo'),
      (@termId, @roleTeamLeader, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-005' LIMIT 1), @team1, 'Tổ trưởng Tổ 1', '2026-01-01', 'active', 'Demo'),
      (@termId, @roleTeamLeader, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-006' LIMIT 1), @team2, 'Tổ trưởng Tổ 2', '2026-01-01', 'active', 'Demo'),
      (@termId, @roleCommitteeHead, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-007' LIMIT 1), @comLiturgy, 'Trưởng ban Phụng vụ', '2026-01-01', 'active', 'Demo'),
      (@termId, @roleCommitteeHead, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-008' LIMIT 1), @comLife, 'Trưởng ban Đời sống', '2026-01-01', 'active', 'Demo');

INSERT INTO `organization_unit_members` (`unit_id`, `resident_id`, `member_role`, `status`, `start_date`, `notes`)
VALUES
      (@team1, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-005' LIMIT 1), 'leader', 'active', '2026-01-01', 'Tổ trưởng demo'),
      (@team1, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-001' LIMIT 1), 'member', 'active', '2026-01-01', 'Thành viên demo'),
      (@team1, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-002' LIMIT 1), 'member', 'active', '2026-01-01', 'Thành viên demo'),
      (@team1, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-007' LIMIT 1), 'member', 'active', '2026-01-01', 'Thành viên demo'),

      (@team2, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-006' LIMIT 1), 'leader', 'active', '2026-01-01', 'Tổ trưởng demo'),
      (@team2, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-003' LIMIT 1), 'member', 'active', '2026-01-01', 'Thành viên demo'),
      (@team2, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-004' LIMIT 1), 'member', 'active', '2026-01-01', 'Thành viên demo'),
      (@team2, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-008' LIMIT 1), 'member', 'active', '2026-01-01', 'Thành viên demo'),

      (@comLiturgy, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-007' LIMIT 1), 'head', 'active', '2026-01-01', 'Trưởng ban demo'),
      (@comLiturgy, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-001' LIMIT 1), 'member', 'active', '2026-01-01', 'Thành viên ban demo'),
      (@comLiturgy, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-003' LIMIT 1), 'member', 'active', '2026-01-01', 'Thành viên ban demo'),

      (@comLife, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-008' LIMIT 1), 'head', 'active', '2026-01-01', 'Trưởng ban demo'),
      (@comLife, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-002' LIMIT 1), 'member', 'active', '2026-01-01', 'Thành viên ban demo'),
      (@comLife, (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-004' LIMIT 1), 'member', 'active', '2026-01-01', 'Thành viên ban demo');

-- ============================================================================
-- 7. DEMO CONG TAC HOM NAY
-- ============================================================================

INSERT INTO `dutyAssignments` (
      `dutyConfigId`,
      `residentId`,
      `assigned_to_type`,
      `assigned_to_id`,
      `assignedDate`,
      `startDateTime`,
      `endDateTime`,
      `status`,
      `notes`
)
VALUES
      (
            (SELECT `id` FROM `dutyConfigs` WHERE `dutyCode` = 'TRUC-NHA-AN-SANG' LIMIT 1),
            (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-002' LIMIT 1),
            'resident',
            (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-002' LIMIT 1),
            CURDATE(),
            TIMESTAMP(CURDATE(), '06:00:00'),
            TIMESTAMP(CURDATE(), '07:00:00'),
            'pending',
            'Công tác trực tiếp demo'
      ),
      (
            (SELECT `id` FROM `dutyConfigs` WHERE `dutyCode` = 'VE-SINH-CHUNG-CHIEU' LIMIT 1),
            (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-005' LIMIT 1),
            'team',
            @team1,
            CURDATE(),
            TIMESTAMP(CURDATE(), '17:00:00'),
            TIMESTAMP(CURDATE(), '18:00:00'),
            'pending',
            'Công tác Tổ 1 demo'
      ),
      (
            (SELECT `id` FROM `dutyConfigs` WHERE `dutyCode` = 'HOP-BAN-THANG' LIMIT 1),
            (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-007' LIMIT 1),
            'committee',
            @comLiturgy,
            CURDATE(),
            TIMESTAMP(CURDATE(), '19:30:00'),
            TIMESTAMP(CURDATE(), '20:30:00'),
            'pending',
            'Công tác Ban Phụng vụ demo'
      ),
      (
            (SELECT `id` FROM `dutyConfigs` WHERE `dutyCode` = 'SINH-HOAT-TO-THU6' LIMIT 1),
            (SELECT `id` FROM `residents` WHERE `residentCode` = 'RES-DEMO-001' LIMIT 1),
            'executive',
            NULL,
            CURDATE(),
            TIMESTAMP(CURDATE(), '19:00:00'),
            TIMESTAMP(CURDATE(), '20:00:00'),
            'pending',
            'Công tác điều hành toàn lưu xá demo'
      );

-- ============================================================================
-- 8. KIEM TRA NHANH
-- ============================================================================

SELECT 'Admin' AS `section`, `id`, `username`, `role`, `isActive`, `mustChangePassword`
FROM `users`
WHERE `username` = 'admin';

SELECT 'Demo residents' AS `section`, COUNT(*) AS `total`
FROM `residents`
WHERE `residentCode` LIKE 'RES-DEMO-%';

SELECT 'Demo rooms' AS `section`, COUNT(*) AS `total`
FROM `rooms`;

SELECT 'Active term' AS `section`, `code`, `name`, `status`
FROM `organization_terms`
WHERE `status` = 'active';

SELECT 'Active organization assignments' AS `section`, COUNT(*) AS `total`
FROM `organization_assignments`
WHERE `status` = 'active';

SELECT 'Active unit members' AS `section`, COUNT(*) AS `total`
FROM `organization_unit_members`
WHERE `status` = 'active';

SELECT 'Today duty assignments' AS `section`, COUNT(*) AS `total`
FROM `dutyAssignments`
WHERE `assignedDate` = CURDATE();



-- END RESET DEMO PHASE 2
SET SQL_SAFE_UPDATES = 1;
