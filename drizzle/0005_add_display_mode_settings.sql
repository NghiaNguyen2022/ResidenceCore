-- 0006_add_roles_permissions.sql
-- ResidenceCore / App Lưu Xá
-- Add RBAC base tables: roles, userRoles, rolePermissions

CREATE TABLE IF NOT EXISTS `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `roleKey` varchar(50) NOT NULL,
  `roleName` varchar(100) NOT NULL,
  `description` text NULL,
  `isSystem` boolean NOT NULL DEFAULT true,
  `isActive` boolean NOT NULL DEFAULT true,
  `sortOrder` int NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_roleKey` (`roleKey`)
);

CREATE TABLE IF NOT EXISTS `userRoles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `roleId` int NOT NULL,
  `isPrimary` boolean NOT NULL DEFAULT false,
  `assignedBy` int NULL,
  `assignedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_userRoles_user_role` (`userId`, `roleId`),
  KEY `idx_userRoles_userId` (`userId`),
  KEY `idx_userRoles_roleId` (`roleId`),
  KEY `idx_userRoles_assignedBy` (`assignedBy`),
  CONSTRAINT `fk_userRoles_user`
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_userRoles_role`
    FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_userRoles_assignedBy`
    FOREIGN KEY (`assignedBy`) REFERENCES `users` (`id`)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `rolePermissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `roleId` int NOT NULL,
  `moduleKey` varchar(100) NOT NULL,
  `actionKey` varchar(100) NOT NULL,
  `isAllowed` boolean NOT NULL DEFAULT true,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_rolePermissions_role_module_action` (`roleId`, `moduleKey`, `actionKey`),
  KEY `idx_rolePermissions_roleId` (`roleId`),
  KEY `idx_rolePermissions_moduleKey` (`moduleKey`),
  CONSTRAINT `fk_rolePermissions_role`
    FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`)
    ON DELETE CASCADE
);

INSERT INTO `roles`
  (`roleKey`, `roleName`, `description`, `isSystem`, `isActive`, `sortOrder`)
VALUES
  ('admin', 'Quản trị hệ thống', 'Toàn quyền quản trị hệ thống. Không tạo mới từ màn hình người dùng thông thường.', true, true, 10),
  ('manager', 'Quản lý lưu xá', 'Quản lý vận hành lưu xá, hồ sơ, phòng ở, sinh hoạt và báo cáo.', true, true, 20),
  ('supervisor', 'Người phụ trách / Tổ trưởng', 'Theo dõi nhóm, công tác, điểm danh hoặc các phần được phân công.', true, true, 30),
  ('accountant', 'Kế toán', 'Theo dõi học phí, khoản thu, tài chính và các báo cáo liên quan.', true, true, 40),
  ('resident', 'Học viên', 'Xem lịch, công tác, thông báo và các thông tin cá nhân được phép.', true, true, 50)
ON DUPLICATE KEY UPDATE
  `roleName` = VALUES(`roleName`),
  `description` = VALUES(`description`),
  `isSystem` = VALUES(`isSystem`),
  `isActive` = VALUES(`isActive`),
  `sortOrder` = VALUES(`sortOrder`);