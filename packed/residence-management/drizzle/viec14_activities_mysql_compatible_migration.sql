-- ResidenceCore / App Lưu Xá
-- Việc 14B2 - Activities DB migration fix for MySQL versions that do NOT support ADD COLUMN IF NOT EXISTS.
-- Run on the ResidenceCore database.
-- This script is designed to be re-runnable.

CREATE TABLE IF NOT EXISTS `activities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NULL,
  `title` varchar(255) NULL,
  `activityType` enum('community','spiritual','study','sports','culture','volunteer','meeting','other') NOT NULL DEFAULT 'community',
  `activityStatus` enum('draft','scheduled','in_progress','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  `activityDate` date NULL,
  `startTime` time NULL,
  `endTime` time NULL,
  `location` varchar(255) NULL,
  `ownerGroup` varchar(255) NULL,
  `expectedParticipants` int NOT NULL DEFAULT 0,
  `actualParticipants` int NOT NULL DEFAULT 0,
  `description` text NULL,
  `notes` text NULL,
  `isPublicOnPortal` tinyint(1) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdBy` int NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `activityParticipants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activityId` int NULL,
  `residentId` int NULL,
  `role` enum('participant','organizer','volunteer') NOT NULL DEFAULT 'participant',
  `attended` tinyint(1) NOT NULL DEFAULT 0,
  `notes` text NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP PROCEDURE IF EXISTS rc_add_column_if_missing;
DELIMITER $$
CREATE PROCEDURE rc_add_column_if_missing(
  IN p_table_name varchar(64),
  IN p_column_name varchar(64),
  IN p_column_def text
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table_name
      AND COLUMN_NAME = p_column_name
  ) THEN
    SET @sql = CONCAT('ALTER TABLE `', p_table_name, '` ADD COLUMN `', p_column_name, '` ', p_column_def);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS rc_add_index_if_missing;
DELIMITER $$
CREATE PROCEDURE rc_add_index_if_missing(
  IN p_table_name varchar(64),
  IN p_index_name varchar(64),
  IN p_index_sql text
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table_name
      AND INDEX_NAME = p_index_name
  ) THEN
    SET @sql = p_index_sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$
DELIMITER ;

-- Align activities columns for older/manual tables.
CALL rc_add_column_if_missing('activities', 'code', 'varchar(50) NULL');
CALL rc_add_column_if_missing('activities', 'title', 'varchar(255) NULL');
CALL rc_add_column_if_missing('activities', 'activityType', "enum('community','spiritual','study','sports','culture','volunteer','meeting','other') NOT NULL DEFAULT 'community'");
CALL rc_add_column_if_missing('activities', 'activityStatus', "enum('draft','scheduled','in_progress','completed','cancelled') NOT NULL DEFAULT 'scheduled'");
CALL rc_add_column_if_missing('activities', 'activityDate', 'date NULL');
CALL rc_add_column_if_missing('activities', 'startTime', 'time NULL');
CALL rc_add_column_if_missing('activities', 'endTime', 'time NULL');
CALL rc_add_column_if_missing('activities', 'location', 'varchar(255) NULL');
CALL rc_add_column_if_missing('activities', 'ownerGroup', 'varchar(255) NULL');
CALL rc_add_column_if_missing('activities', 'expectedParticipants', 'int NOT NULL DEFAULT 0');
CALL rc_add_column_if_missing('activities', 'actualParticipants', 'int NOT NULL DEFAULT 0');
CALL rc_add_column_if_missing('activities', 'description', 'text NULL');
CALL rc_add_column_if_missing('activities', 'notes', 'text NULL');
CALL rc_add_column_if_missing('activities', 'isPublicOnPortal', 'tinyint(1) NOT NULL DEFAULT 0');
CALL rc_add_column_if_missing('activities', 'isActive', 'tinyint(1) NOT NULL DEFAULT 1');
CALL rc_add_column_if_missing('activities', 'createdBy', 'int NULL');
CALL rc_add_column_if_missing('activities', 'createdAt', 'timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP');
CALL rc_add_column_if_missing('activities', 'updatedAt', 'timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

-- Align participant columns for older/manual tables.
CALL rc_add_column_if_missing('activityParticipants', 'activityId', 'int NULL');
CALL rc_add_column_if_missing('activityParticipants', 'residentId', 'int NULL');
CALL rc_add_column_if_missing('activityParticipants', 'role', "enum('participant','organizer','volunteer') NOT NULL DEFAULT 'participant'");
CALL rc_add_column_if_missing('activityParticipants', 'attended', 'tinyint(1) NOT NULL DEFAULT 0');
CALL rc_add_column_if_missing('activityParticipants', 'notes', 'text NULL');
CALL rc_add_column_if_missing('activityParticipants', 'createdAt', 'timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP');
CALL rc_add_column_if_missing('activityParticipants', 'updatedAt', 'timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

-- Backfill safe defaults for old rows.
UPDATE `activities`
SET
  `code` = COALESCE(`code`, CONCAT('ACT', LPAD(`id`, 6, '0'))),
  `title` = COALESCE(`title`, 'Hoạt động chưa đặt tên'),
  `activityDate` = COALESCE(`activityDate`, CURRENT_DATE()),
  `activityType` = COALESCE(`activityType`, 'community'),
  `activityStatus` = COALESCE(`activityStatus`, 'scheduled'),
  `expectedParticipants` = COALESCE(`expectedParticipants`, 0),
  `actualParticipants` = COALESCE(`actualParticipants`, 0),
  `isPublicOnPortal` = COALESCE(`isPublicOnPortal`, 0),
  `isActive` = COALESCE(`isActive`, 1)
WHERE `id` > 0;

-- Tighten important columns after backfill. If your old table has invalid duplicate codes, fix duplicates before re-running these MODIFY statements.
ALTER TABLE `activities` MODIFY COLUMN `code` varchar(50) NOT NULL;
ALTER TABLE `activities` MODIFY COLUMN `title` varchar(255) NOT NULL;
ALTER TABLE `activities` MODIFY COLUMN `activityDate` date NOT NULL;

-- Add indexes only if missing.
CALL rc_add_index_if_missing('activities', 'activities_code_unique', 'ALTER TABLE `activities` ADD UNIQUE KEY `activities_code_unique` (`code`)');
CALL rc_add_index_if_missing('activities', 'activities_status_idx', 'ALTER TABLE `activities` ADD KEY `activities_status_idx` (`activityStatus`)');
CALL rc_add_index_if_missing('activities', 'activities_activity_date_idx', 'ALTER TABLE `activities` ADD KEY `activities_activity_date_idx` (`activityDate`)');
CALL rc_add_index_if_missing('activities', 'activities_portal_idx', 'ALTER TABLE `activities` ADD KEY `activities_portal_idx` (`isPublicOnPortal`, `isActive`)');
CALL rc_add_index_if_missing('activities', 'activities_created_by_idx', 'ALTER TABLE `activities` ADD KEY `activities_created_by_idx` (`createdBy`)');
CALL rc_add_index_if_missing('activityParticipants', 'activity_participants_activity_resident_unique', 'ALTER TABLE `activityParticipants` ADD UNIQUE KEY `activity_participants_activity_resident_unique` (`activityId`, `residentId`)');
CALL rc_add_index_if_missing('activityParticipants', 'activity_participants_activity_idx', 'ALTER TABLE `activityParticipants` ADD KEY `activity_participants_activity_idx` (`activityId`)');
CALL rc_add_index_if_missing('activityParticipants', 'activity_participants_resident_idx', 'ALTER TABLE `activityParticipants` ADD KEY `activity_participants_resident_idx` (`residentId`)');

DROP PROCEDURE IF EXISTS rc_add_column_if_missing;
DROP PROCEDURE IF EXISTS rc_add_index_if_missing;

-- Verify after running:
-- SHOW COLUMNS FROM `activities`;
-- SHOW COLUMNS FROM `activityParticipants`;
