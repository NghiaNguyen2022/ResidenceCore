-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: residence_care
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `activityType` enum('community','spiritual','study','sports','culture','volunteer','meeting','other') NOT NULL DEFAULT 'other',
  `status` enum('draft','scheduled','in_progress','completed','cancelled') NOT NULL DEFAULT 'draft',
  `activityDate` date NOT NULL,
  `startTime` time DEFAULT NULL,
  `endTime` time DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `ownerGroup` varchar(255) DEFAULT NULL,
  `expectedParticipants` int DEFAULT '0',
  `actualParticipants` int DEFAULT '0',
  `description` text,
  `notes` text,
  `createdBy` int DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `activityStatus` enum('draft','scheduled','in_progress','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  `isPublicOnPortal` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `activities_code_unique` (`code`),
  KEY `activities_status_idx` (`activityStatus`),
  KEY `activities_activity_date_idx` (`activityDate`),
  KEY `activities_portal_idx` (`isPublicOnPortal`,`isActive`),
  KEY `activities_created_by_idx` (`createdBy`),
  CONSTRAINT `activities_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activities`
--

LOCK TABLES `activities` WRITE;
/*!40000 ALTER TABLE `activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activityparticipants`
--

DROP TABLE IF EXISTS `activityparticipants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activityparticipants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activityId` int NOT NULL,
  `residentId` int NOT NULL,
  `role` enum('participant','organizer','volunteer') NOT NULL DEFAULT 'participant',
  `attended` tinyint(1) NOT NULL DEFAULT '0',
  `notes` varchar(500) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `activity_participants_activity_resident_unique` (`activityId`,`residentId`),
  KEY `activity_participants_activity_idx` (`activityId`),
  KEY `activity_participants_resident_idx` (`residentId`),
  CONSTRAINT `activityParticipants_activityId_activities_id_fk` FOREIGN KEY (`activityId`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activityParticipants_residentId_residents_id_fk` FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activityparticipants`
--

LOCK TABLES `activityparticipants` WRITE;
/*!40000 ALTER TABLE `activityparticipants` DISABLE KEYS */;
/*!40000 ALTER TABLE `activityparticipants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `additionalfees`
--

DROP TABLE IF EXISTS `additionalfees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `additionalfees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `residentId` int NOT NULL,
  `feeCategory` varchar(100) NOT NULL,
  `description` text,
  `amount` decimal(12,2) NOT NULL,
  `billingMonth` int NOT NULL,
  `billingYear` int NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `relatedActivityId` int DEFAULT NULL,
  `relatedCourseId` int DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `approvedBy` int DEFAULT NULL,
  `approvedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `additionalFees_approvedBy_fk` (`approvedBy`),
  KEY `idx_additionalFees_residentId` (`residentId`),
  CONSTRAINT `additionalFees_approvedBy_fk` FOREIGN KEY (`approvedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `additionalFees_residentId_fk` FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `additionalfees`
--

LOCK TABLES `additionalfees` WRITE;
/*!40000 ALTER TABLE `additionalfees` DISABLE KEYS */;
/*!40000 ALTER TABLE `additionalfees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appsettings`
--

DROP TABLE IF EXISTS `appsettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appsettings` (
  `settingKey` varchar(100) NOT NULL,
  `value` json NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`settingKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appsettings`
--

LOCK TABLES `appsettings` WRITE;
/*!40000 ALTER TABLE `appsettings` DISABLE KEYS */;
INSERT INTO `appsettings` VALUES ('defaultDisplayMode','\"simple\"','2026-06-02 16:25:25','2026-07-22 04:36:09');
/*!40000 ALTER TABLE `appsettings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `residentId` int NOT NULL,
  `scheduleId` int NOT NULL,
  `attendanceDate` date NOT NULL,
  `status` enum('present','absent','excused','late') NOT NULL,
  `checkInTime` timestamp NULL DEFAULT NULL,
  `checkOutTime` timestamp NULL DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `recordedBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `attendance_scheduleId_attendanceSchedule_id_fk` (`scheduleId`),
  KEY `attendance_recordedBy_users_id_fk` (`recordedBy`),
  KEY `idx_attendance_resident_date` (`residentId`,`attendanceDate`),
  CONSTRAINT `attendance_recordedBy_users_id_fk` FOREIGN KEY (`recordedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `attendance_residentId_residents_id_fk` FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_scheduleId_attendanceSchedule_id_fk` FOREIGN KEY (`scheduleId`) REFERENCES `attendanceschedule` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendanceschedule`
--

DROP TABLE IF EXISTS `attendanceschedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendanceschedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('check_in','check_out','meal','study_hour','curfew','activity') NOT NULL,
  `scheduledTime` time NOT NULL,
  `tolerance` int DEFAULT '0',
  `isDaily` tinyint(1) NOT NULL DEFAULT '1',
  `daysOfWeek` json DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendanceschedule`
--

LOCK TABLES `attendanceschedule` WRITE;
/*!40000 ALTER TABLE `attendanceschedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendanceschedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `borrowedfees`
--

DROP TABLE IF EXISTS `borrowedfees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `borrowedfees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `residentId` int NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `borrowDate` date NOT NULL,
  `reason` text,
  `status` enum('pending','added_to_fee','paid') NOT NULL DEFAULT 'pending',
  `addedToMonthlyFeeMonth` int DEFAULT NULL,
  `addedToMonthlyFeeYear` int DEFAULT NULL,
  `paidDate` date DEFAULT NULL,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_borrowedFees_residentId` (`residentId`),
  CONSTRAINT `borrowedFees_residentId_fk` FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `borrowedfees`
--

LOCK TABLES `borrowedfees` WRITE;
/*!40000 ALTER TABLE `borrowedfees` DISABLE KEYS */;
/*!40000 ALTER TABLE `borrowedfees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cronjoblogs`
--

DROP TABLE IF EXISTS `cronjoblogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cronjoblogs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `jobName` varchar(255) NOT NULL,
  `status` enum('success','failed','skipped') NOT NULL,
  `executedAt` timestamp NOT NULL DEFAULT (now()),
  `nextScheduledAt` timestamp NULL DEFAULT NULL,
  `errorMessage` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cronjoblogs`
--

LOCK TABLES `cronjoblogs` WRITE;
/*!40000 ALTER TABLE `cronjoblogs` DISABLE KEYS */;
/*!40000 ALTER TABLE `cronjoblogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_routine_items`
--

DROP TABLE IF EXISTS `daily_routine_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_routine_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `template_id` int NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `title` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `description` text,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '10',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_daily_routine_items_template_id` (`template_id`),
  KEY `idx_daily_routine_items_time` (`start_time`,`end_time`),
  CONSTRAINT `fk_daily_routine_items_template` FOREIGN KEY (`template_id`) REFERENCES `daily_routine_templates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_routine_items`
--

LOCK TABLES `daily_routine_items` WRITE;
/*!40000 ALTER TABLE `daily_routine_items` DISABLE KEYS */;
INSERT INTO `daily_routine_items` VALUES (1,1,'05:00:00','05:30:00','Thức dậy / vệ sinh cá nhân','Khu lưu trú',NULL,1,10,'2026-06-08 22:30:11','2026-06-08 15:52:01'),(2,1,'05:30:00','06:00:00','Cầu nguyện / sinh hoạt chung','Phòng sinh hoạt',NULL,1,20,'2026-06-08 22:30:14','2026-06-08 15:52:14'),(3,1,'06:00:00','06:30:00','Ăn sáng','Nhà ăn',NULL,1,30,'2026-06-08 22:30:19','2026-06-08 15:52:28'),(4,1,'07:00:00','11:30:00','Đi học buổi sáng','Trường học',NULL,1,40,'2026-06-08 22:30:26','2026-06-08 22:30:26'),(5,1,'19:00:00','21:00:00','Hoạt động tối','Phòng học chung','Học bài, sinh hoạt, đọc kinh',1,80,'2026-06-08 22:30:28','2026-06-08 15:58:37'),(6,1,'21:30:00','22:00:00','Chuẩn bị nghỉ','Khu lưu trú',NULL,1,90,'2026-06-08 22:30:31','2026-06-08 15:58:02'),(7,1,'07:00:00','11:30:00','Hoạt động sáng','Lưu xá / Cửa hàng',NULL,1,40,'2026-06-08 22:53:14','2026-06-08 15:53:36'),(8,1,'11:30:00','12:30:00','Ăn trưa','Nhà ăn',NULL,1,50,'2026-06-08 22:54:10','2026-06-08 15:54:20'),(9,1,'13:00:00','17:30:00','Giờ đi học chiều','Trường học',NULL,1,60,'2026-06-08 22:55:18','2026-06-08 22:55:18'),(10,1,'13:00:00','17:30:00','Hoạt động chiều','Lưu xá, cửa hàng','Cửa hàng',1,60,'2026-06-08 22:56:09','2026-06-08 22:56:09'),(11,1,'18:00:00','19:00:00','Ăn tối','Nhà ăn',NULL,1,70,'2026-06-08 22:57:14','2026-06-08 22:57:14');
/*!40000 ALTER TABLE `daily_routine_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_routine_templates`
--

DROP TABLE IF EXISTS `daily_routine_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_routine_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `day_type` enum('weekday','sunday','special') NOT NULL DEFAULT 'weekday',
  `description` text,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '10',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_daily_routine_templates_day_type` (`day_type`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_routine_templates`
--

LOCK TABLES `daily_routine_templates` WRITE;
/*!40000 ALTER TABLE `daily_routine_templates` DISABLE KEYS */;
INSERT INTO `daily_routine_templates` VALUES (1,'WEEKDAY_DEFAULT','Lịch ngày thường','weekday','Lịch sinh hoạt áp dụng cho ngày học bình thường.',1,10,'2026-06-08 22:30:01','2026-06-08 22:30:01'),(2,'SUNDAY_DEFAULT','Lịch Chúa nhật','sunday','Lịch sinh hoạt áp dụng cho Chúa nhật.',1,20,'2026-06-08 22:30:01','2026-06-08 22:30:01'),(3,'SPECIAL_DEFAULT','Lịch ngày đặc biệt','special','Lịch sinh hoạt áp dụng cho ngày lễ hoặc chương trình đặc biệt.',1,30,'2026-06-08 22:30:01','2026-06-08 22:30:01');
/*!40000 ALTER TABLE `daily_routine_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_routines`
--

DROP TABLE IF EXISTS `daily_routines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_routines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `routine_date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `location` varchar(255) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `responsible_label` varchar(255) DEFAULT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT '1',
  `display_order` int NOT NULL DEFAULT '0',
  `routine_type` varchar(50) NOT NULL DEFAULT 'daily',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `assignee_type` varchar(50) NOT NULL DEFAULT 'all',
  `assignee_id` int DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `completed_at` datetime DEFAULT NULL,
  `completed_by` int DEFAULT NULL,
  `notes` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_daily_routines_date` (`routine_date`),
  KEY `idx_daily_routines_status` (`status`),
  KEY `idx_daily_routines_assignee` (`assignee_type`,`assignee_id`),
  KEY `idx_daily_routines_active` (`is_active`),
  KEY `idx_daily_routines_category` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_routines`
--

LOCK TABLES `daily_routines` WRITE;
/*!40000 ALTER TABLE `daily_routines` DISABLE KEYS */;
/*!40000 ALTER TABLE `daily_routines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `debts`
--

DROP TABLE IF EXISTS `debts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `debts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `residentId` int NOT NULL,
  `feeTypeId` int NOT NULL,
  `billingMonth` varchar(20) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `dueDate` date NOT NULL,
  `status` enum('unpaid','partially_paid','paid','overdue','waived') NOT NULL DEFAULT 'unpaid',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `debts_residentId_residents_id_fk` (`residentId`),
  KEY `debts_feeTypeId_feeTypes_id_fk` (`feeTypeId`),
  CONSTRAINT `debts_feeTypeId_feeTypes_id_fk` FOREIGN KEY (`feeTypeId`) REFERENCES `feetypes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `debts_residentId_residents_id_fk` FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `debts`
--

LOCK TABLES `debts` WRITE;
/*!40000 ALTER TABLE `debts` DISABLE KEYS */;
/*!40000 ALTER TABLE `debts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dutyassignments`
--

DROP TABLE IF EXISTS `dutyassignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dutyassignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dutyConfigId` int NOT NULL,
  `dutyTaskId` int DEFAULT NULL,
  `residentId` int DEFAULT NULL,
  `assigned_to_type` varchar(30) DEFAULT NULL,
  `assigned_to_id` int DEFAULT NULL,
  `assignedDate` date NOT NULL,
  `startDateTime` timestamp NULL DEFAULT NULL,
  `endDateTime` timestamp NULL DEFAULT NULL,
  `status` enum('pending','confirmed','in_progress','completed','skipped','cancelled') NOT NULL DEFAULT 'pending',
  `completedAt` timestamp NULL DEFAULT NULL,
  `notes` text,
  `reason` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_duty_assignments_assigned_to` (`assigned_to_type`,`assigned_to_id`),
  KEY `fk_dutyAssignments_dutyTaskId` (`dutyTaskId`),
  KEY `idx_duty_assignments_resident_date_status` (`residentId`,`assignedDate`,`status`),
  KEY `idx_duty_assignments_config_date_target_status` (`dutyConfigId`,`assignedDate`,`assigned_to_type`,`assigned_to_id`,`status`),
  CONSTRAINT `dutyAssignments_dutyConfigId_dutyConfigs_id_fk` FOREIGN KEY (`dutyConfigId`) REFERENCES `dutyconfigs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `dutyAssignments_residentId_residents_id_fk` FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dutyAssignments_dutyTaskId` FOREIGN KEY (`dutyTaskId`) REFERENCES `dutychecklists` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=380 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dutyassignments`
--

LOCK TABLES `dutyassignments` WRITE;
/*!40000 ALTER TABLE `dutyassignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `dutyassignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dutychecklists`
--

DROP TABLE IF EXISTS `dutychecklists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dutychecklists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dutyConfigId` int NOT NULL,
  `itemOrder` int NOT NULL,
  `checklistItem` varchar(255) NOT NULL,
  `isRequired` tinyint(1) NOT NULL DEFAULT '1',
  `description` text,
  `stageType` enum('normal','preparation','during','after') NOT NULL DEFAULT 'normal',
  `minPersons` int NOT NULL DEFAULT '1',
  `maxPersons` int NOT NULL DEFAULT '1',
  `estimatedTimeMinutes` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `dutyChecklists_dutyConfigId_dutyConfigs_id_fk` (`dutyConfigId`),
  CONSTRAINT `dutyChecklists_dutyConfigId_dutyConfigs_id_fk` FOREIGN KEY (`dutyConfigId`) REFERENCES `dutyconfigs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dutychecklists`
--

LOCK TABLES `dutychecklists` WRITE;
/*!40000 ALTER TABLE `dutychecklists` DISABLE KEYS */;
/*!40000 ALTER TABLE `dutychecklists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dutyconfigs`
--

DROP TABLE IF EXISTS `dutyconfigs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dutyconfigs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dutyCode` varchar(50) NOT NULL,
  `dutyName` varchar(100) NOT NULL,
  `description` text,
  `templateId` int DEFAULT NULL,
  `dutyType` enum('daily','weekly','monthly','event') NOT NULL,
  `startTime` time DEFAULT NULL,
  `endTime` time DEFAULT NULL,
  `minPersons` int NOT NULL DEFAULT '1',
  `maxPersons` int NOT NULL DEFAULT '5',
  `frequency` enum('daily','weekly','monthly','event') NOT NULL,
  `dayOfWeek` int DEFAULT NULL,
  `frequencyPerWeek` int DEFAULT NULL,
  `frequencyPerMonth` int DEFAULT NULL,
  `weeklyDaysJson` json DEFAULT NULL,
  `monthWeeksJson` json DEFAULT NULL,
  `monthWeekDaysJson` json DEFAULT NULL,
  `monthDaysJson` json DEFAULT NULL,
  `eventName` varchar(255) DEFAULT NULL,
  `eventStartDate` date DEFAULT NULL,
  `eventEndDate` date DEFAULT NULL,
  `requiresStudyScheduleCheck` tinyint(1) NOT NULL DEFAULT '1',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dutyConfigs_dutyCode_unique` (`dutyCode`),
  KEY `dutyConfigs_templateId_dutyTemplates_id_fk` (`templateId`),
  CONSTRAINT `dutyConfigs_templateId_dutyTemplates_id_fk` FOREIGN KEY (`templateId`) REFERENCES `dutytemplates` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dutyconfigs`
--

LOCK TABLES `dutyconfigs` WRITE;
/*!40000 ALTER TABLE `dutyconfigs` DISABLE KEYS */;
INSERT INTO `dutyconfigs` VALUES (15,'di_cho_1782167819690','Đi chợ','Mua hàng tươi sống cho bữa ăn trong ngày',NULL,'daily','04:30:00','05:00:00',1,2,'daily',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,1,'2026-06-22 22:37:09','2026-06-22 22:37:09'),(16,'nau_sang_1782167841395','Nấu ăn sáng','Chuẩn bị bữa sáng cho tất cả học viên',NULL,'daily','05:00:00','05:45:00',2,3,'daily',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,'2026-06-22 22:37:58','2026-06-22 22:42:36'),(17,'rua_chen_sang_1782167888907','Rửa chén ca sáng','Rửa chén sau bữa sáng',NULL,'daily','07:00:00','07:30:00',2,2,'daily',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,'2026-06-22 22:38:21','2026-06-22 22:38:21'),(18,'don_phong_sang_1782167921833','Dọn phòng chung ca sáng','Dọn dẹp phòng chung, hành lang, sân vào buổi sáng',NULL,'daily','07:30:00','08:30:00',2,3,'daily',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,'2026-06-22 22:38:45','2026-06-22 22:38:45'),(19,'nau_trua_1782167936684','Nấu ăn trưa','Chuẩn bị bữa trưa cho tất cả học viên',NULL,'daily','10:00:00','10:45:00',2,3,'daily',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,'2026-06-22 22:39:21','2026-06-22 22:39:21'),(20,'rua_chen_trua_1782168013214','Rửa chén ca trưa','Rửa chén sau bữa trưa',NULL,'daily','12:00:00','12:30:00',2,2,'daily',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,1,'2026-06-22 22:40:16','2026-06-22 22:42:21'),(21,'don_phong_chieu_1782168036479','Dọn phòng chung ca chiều','Dọn dẹp phòng chung, hành lang, sân vào buổi chiều',NULL,'daily','16:00:00','17:00:00',2,3,'daily',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,'2026-06-22 22:40:40','2026-06-22 22:40:40'),(22,'nau_toi_1782168054666','Nấu ăn tối','Chuẩn bị bữa tối cho tất cả học viên',NULL,'daily','16:00:00','16:45:00',2,3,'daily',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,'2026-06-22 22:40:56','2026-06-22 22:40:56'),(23,'rua_chen_toi_1782168075417','Rửa chén ca tối','Rửa chén sau bữa tối',NULL,'daily','18:00:00','18:30:00',2,2,'daily',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,'2026-06-22 22:41:18','2026-06-22 22:42:31'),(24,'truc_cua_hang_sang_1782168094580','Trực cửa hàng ca sáng','Tiếp đón, hỗ trợ Khách tại của hàng',NULL,'daily','08:00:00','12:00:00',1,2,'daily',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,'2026-06-22 22:41:36','2026-06-22 22:41:36'),(25,'truc_cua_hang_chieu_1782168105522','Trực cửa hàng ca chiều','Tiếp đón,  hỗ trợ Khách tại của hàng',NULL,'daily','13:30:00','17:00:00',1,2,'daily',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,'2026-06-22 22:41:48','2026-06-22 22:41:48'),(26,'tap_hat_1782168173375','Tập hát','Tập hát (Thứ 3 và 6)',NULL,'weekly','19:30:00','20:30:00',1,1,'weekly',1,2,NULL,'[\"tuesday\", \"friday\"]',NULL,NULL,NULL,NULL,NULL,NULL,0,1,'2026-06-22 22:43:28','2026-06-22 22:43:28'),(27,'ve_sinh_tuan_1782168225455','Vệ sinh chung tuần','Vệ sinh toàn bộ khu lưu trú (Thứ Bảy)',NULL,'weekly','08:00:00','12:00:00',5,6,'weekly',0,2,NULL,'[\"monday\", \"saturday\"]',NULL,NULL,NULL,NULL,NULL,NULL,1,1,'2026-06-22 22:44:03','2026-06-23 22:43:45');
/*!40000 ALTER TABLE `dutyconfigs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dutyevaluations`
--

DROP TABLE IF EXISTS `dutyevaluations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dutyevaluations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `assignmentId` int NOT NULL,
  `quality` int DEFAULT NULL,
  `punctuality` int DEFAULT NULL,
  `professionalism` int DEFAULT NULL,
  `responsibility` int DEFAULT NULL,
  `teamwork` int DEFAULT NULL,
  `totalScore` int DEFAULT NULL,
  `checklistCompletedJson` json DEFAULT NULL,
  `evaluatorComments` text,
  `evaluatedBy` int DEFAULT NULL,
  `evaluatedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `dutyEvaluations_assignmentId_dutyAssignments_id_fk` (`assignmentId`),
  KEY `dutyEvaluations_evaluatedBy_residents_id_fk` (`evaluatedBy`),
  CONSTRAINT `dutyEvaluations_assignmentId_dutyAssignments_id_fk` FOREIGN KEY (`assignmentId`) REFERENCES `dutyassignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `dutyEvaluations_evaluatedBy_residents_id_fk` FOREIGN KEY (`evaluatedBy`) REFERENCES `residents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dutyevaluations`
--

LOCK TABLES `dutyevaluations` WRITE;
/*!40000 ALTER TABLE `dutyevaluations` DISABLE KEYS */;
/*!40000 ALTER TABLE `dutyevaluations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dutyschedules`
--

DROP TABLE IF EXISTS `dutyschedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dutyschedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dutyConfigId` int NOT NULL,
  `weekNumber` int DEFAULT NULL,
  `dayOfWeek` int DEFAULT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `rotationOrder` int DEFAULT NULL,
  `rotationInterval` int DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `dutySchedules_dutyConfigId_dutyConfigs_id_fk` (`dutyConfigId`),
  CONSTRAINT `dutySchedules_dutyConfigId_dutyConfigs_id_fk` FOREIGN KEY (`dutyConfigId`) REFERENCES `dutyconfigs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dutyschedules`
--

LOCK TABLES `dutyschedules` WRITE;
/*!40000 ALTER TABLE `dutyschedules` DISABLE KEYS */;
/*!40000 ALTER TABLE `dutyschedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dutytemplates`
--

DROP TABLE IF EXISTS `dutytemplates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dutytemplates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `templateCode` varchar(50) NOT NULL,
  `templateName` varchar(100) NOT NULL,
  `description` text,
  `dutyType` enum('daily','weekly','monthly') NOT NULL,
  `startTime` time DEFAULT NULL,
  `endTime` time DEFAULT NULL,
  `minPersons` int NOT NULL DEFAULT '1',
  `maxPersons` int NOT NULL DEFAULT '5',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dutyTemplates_templateCode_unique` (`templateCode`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dutytemplates`
--

LOCK TABLES `dutytemplates` WRITE;
/*!40000 ALTER TABLE `dutytemplates` DISABLE KEYS */;
INSERT INTO `dutytemplates` VALUES (1,'di_cho','Đi chợ','Mua hàng tươi sống cho bữa ăn trong ngày','daily','04:00:00','05:00:00',1,2,1,'2026-05-31 02:16:18','2026-06-09 14:37:55'),(2,'nau_sang','Nấu ăn sáng','Chuẩn bị bữa sáng cho tất cả học viên','daily','05:00:00','05:45:00',2,3,1,'2026-05-31 02:16:22','2026-06-09 14:33:52'),(3,'nau_trua','Nấu ăn trưa','Chuẩn bị bữa trưa cho tất cả học viên','daily','10:00:00','10:45:00',2,3,1,'2026-05-31 02:16:25','2026-06-09 14:33:52'),(4,'nau_toi','Nấu ăn tối','Chuẩn bị bữa tối cho tất cả học viên','daily','16:00:00','16:45:00',2,3,1,'2026-05-31 02:16:29','2026-06-09 14:33:52'),(5,'rua_chen_sang','Rửa chén ca sáng','Rửa chén sau bữa sáng','daily','07:30:00','07:30:00',2,2,1,'2026-05-31 02:16:33','2026-06-09 14:36:04'),(6,'rua_chen_trua','Rửa chén ca trưa','Rửa chén sau bữa trưa','daily','12:00:00','12:30:00',2,2,1,'2026-05-31 02:16:36','2026-06-09 14:36:04'),(7,'rua_chen_toi','Rửa chén ca tối','Rửa chén sau bữa tối','daily','18:00:00','18:30:00',2,2,1,'2026-05-31 02:16:43','2026-06-09 14:36:04'),(8,'don_phong_sang','Dọn phòng chung ca sáng','Dọn dẹp phòng chung, hành lang, sân vào buổi sáng','daily','07:30:00','08:30:00',2,3,1,'2026-05-31 02:16:51','2026-06-09 14:36:54'),(9,'don_phong_chieu','Dọn phòng chung ca chiều','Dọn dẹp phòng chung, hành lang, sân vào buổi chiều','daily','16:00:00','17:00:00',2,3,1,'2026-05-31 02:16:51','2026-06-09 14:36:54'),(10,'truc_cua_hang_sang','Trực cửa hàng ca sáng','Tiếp đón, hỗ trợ Khách tại của hàng','daily','08:00:00','12:00:00',1,2,1,'2026-05-31 02:16:51','2026-06-09 14:39:49'),(11,'truc_cua_hang_chieu','Trực cửa hàng ca chiều','Tiếp đón,  hỗ trợ Khách tại của hàng','daily','13:30:00','17:00:00',1,2,1,'2026-05-31 02:16:51','2026-06-09 14:39:49'),(12,'ve_sinh_tuan','Vệ sinh chung tuần','Vệ sinh toàn bộ khu lưu trú (Chủ Nhật)','weekly','08:00:00','12:00:00',3,5,1,'2026-05-31 02:16:51','2026-05-31 02:16:51'),(13,'tong_ve_sinh','Tổng vệ sinh','Vệ sinh sâu toàn bộ khu lưu trú (Chủ Nhật cuối tháng)','weekly','07:00:00','17:00:00',5,8,1,'2026-05-31 02:16:51','2026-05-31 02:16:51'),(14,'tap_hat','Tập hát','Tập hát (Thứ 5 hoặc 6)','weekly','19:00:00','20:30:00',2,3,1,'2026-05-31 02:16:51','2026-06-09 14:40:07'),(15,'sinh_hoat_chung','Sinh hoạt chung','Tổ chức sinh hoạt, giao lưu (Thứ 7 hoặc Chủ Nhật)','weekly','18:00:00','20:00:00',3,5,1,'2026-05-31 02:16:51','2026-05-31 02:16:51'),(16,'truc_le_tuan','Trực lễ tuần','Chuẩn bị, dọn dẹp trước/sau lễ (Chủ Nhật)','weekly','07:00:00','09:00:00',2,2,1,'2026-05-31 02:16:51','2026-05-31 02:16:51');
/*!40000 ALTER TABLE `dutytemplates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expensecategories`
--

DROP TABLE IF EXISTS `expensecategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expensecategories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `budgetAmount` decimal(12,2) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `expenseCategories_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expensecategories`
--

LOCK TABLES `expensecategories` WRITE;
/*!40000 ALTER TABLE `expensecategories` DISABLE KEYS */;
/*!40000 ALTER TABLE `expensecategories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expensehistory`
--

DROP TABLE IF EXISTS `expensehistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expensehistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `expenseId` int NOT NULL,
  `fieldChanged` varchar(100) NOT NULL,
  `oldValue` text,
  `newValue` text,
  `changeReason` varchar(255) DEFAULT NULL,
  `changedBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `expenseHistory_expenseId_fk` (`expenseId`),
  KEY `expenseHistory_changedBy_fk` (`changedBy`),
  CONSTRAINT `expenseHistory_changedBy_fk` FOREIGN KEY (`changedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenseHistory_expenseId_fk` FOREIGN KEY (`expenseId`) REFERENCES `expenses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expensehistory`
--

LOCK TABLES `expensehistory` WRITE;
/*!40000 ALTER TABLE `expensehistory` DISABLE KEYS */;
/*!40000 ALTER TABLE `expensehistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoryId` int NOT NULL,
  `department` enum('general','store','library','other') NOT NULL DEFAULT 'general',
  `description` text NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `expenseDate` date NOT NULL,
  `paymentMethod` enum('cash','bank_transfer','check','other') NOT NULL,
  `invoiceNumber` varchar(100) DEFAULT NULL,
  `invoiceFile` varchar(255) DEFAULT NULL,
  `status` enum('draft','submitted','approved','rejected','paid') NOT NULL DEFAULT 'draft',
  `approvedBy` int DEFAULT NULL,
  `approvedAt` timestamp NULL DEFAULT NULL,
  `rejectionReason` text,
  `notes` text,
  `createdBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `expenses_approvedBy_fk` (`approvedBy`),
  KEY `expenses_createdBy_fk` (`createdBy`),
  KEY `idx_expenses_categoryId` (`categoryId`),
  KEY `idx_expenses_status` (`status`),
  KEY `idx_expenses_expenseDate` (`expenseDate`),
  CONSTRAINT `expenses_approvedBy_fk` FOREIGN KEY (`approvedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_categoryId_fk` FOREIGN KEY (`categoryId`) REFERENCES `expensecategories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `expenses_createdBy_fk` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feechangehistory`
--

DROP TABLE IF EXISTS `feechangehistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feechangehistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `residentId` int NOT NULL,
  `oldFeeTypeId` int DEFAULT NULL,
  `newFeeTypeId` int NOT NULL,
  `changeReason` varchar(255) DEFAULT NULL,
  `changeDate` date NOT NULL,
  `effectiveFromMonth` int NOT NULL,
  `effectiveFromYear` int NOT NULL,
  `changedBy` int DEFAULT NULL,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `feeChangeHistory_residentId_fk` (`residentId`),
  KEY `feeChangeHistory_oldFeeTypeId_fk` (`oldFeeTypeId`),
  KEY `feeChangeHistory_newFeeTypeId_fk` (`newFeeTypeId`),
  KEY `feeChangeHistory_changedBy_fk` (`changedBy`),
  CONSTRAINT `feeChangeHistory_changedBy_fk` FOREIGN KEY (`changedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `feeChangeHistory_newFeeTypeId_fk` FOREIGN KEY (`newFeeTypeId`) REFERENCES `residentfeetypes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `feeChangeHistory_oldFeeTypeId_fk` FOREIGN KEY (`oldFeeTypeId`) REFERENCES `residentfeetypes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `feeChangeHistory_residentId_fk` FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feechangehistory`
--

LOCK TABLES `feechangehistory` WRITE;
/*!40000 ALTER TABLE `feechangehistory` DISABLE KEYS */;
/*!40000 ALTER TABLE `feechangehistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feetypes`
--

DROP TABLE IF EXISTS `feetypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feetypes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `billingCycle` enum('monthly','quarterly','yearly') NOT NULL DEFAULT 'monthly',
  `description` text,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `feeTypes_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feetypes`
--

LOCK TABLES `feetypes` WRITE;
/*!40000 ALTER TABLE `feetypes` DISABLE KEYS */;
/*!40000 ALTER TABLE `feetypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_charge_period_items`
--

DROP TABLE IF EXISTS `finance_charge_period_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_charge_period_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period_id` int NOT NULL,
  `fee_type_id` int DEFAULT NULL,
  `fee_type_code` varchar(50) NOT NULL,
  `fee_type_name` varchar(255) NOT NULL,
  `amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `is_default_checked` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '10',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_finance_period_items_period` (`period_id`),
  KEY `idx_finance_period_items_fee_type` (`fee_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_charge_period_items`
--

LOCK TABLES `finance_charge_period_items` WRITE;
/*!40000 ALTER TABLE `finance_charge_period_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_charge_period_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_charge_periods`
--

DROP TABLE IF EXISTS `finance_charge_periods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_charge_periods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period_code` varchar(100) NOT NULL,
  `period_name` varchar(255) NOT NULL,
  `year` int NOT NULL,
  `from_month` int NOT NULL DEFAULT '1',
  `to_month` int NOT NULL DEFAULT '12',
  `status` varchar(40) NOT NULL DEFAULT 'draft',
  `description` text,
  `created_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `period_code` (`period_code`),
  KEY `idx_finance_charge_periods_year` (`year`),
  KEY `idx_finance_charge_periods_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_charge_periods`
--

LOCK TABLES `finance_charge_periods` WRITE;
/*!40000 ALTER TABLE `finance_charge_periods` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_charge_periods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_charges`
--

DROP TABLE IF EXISTS `finance_charges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_charges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `charge_code` varchar(80) NOT NULL,
  `resident_id` int NOT NULL,
  `fee_type_id` int NOT NULL,
  `period_id` int DEFAULT NULL,
  `period_item_id` int DEFAULT NULL,
  `amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `paid_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `remaining_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `due_date` date DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'open',
  `source` varchar(40) NOT NULL DEFAULT 'student_fee',
  `fee_mode` varchar(40) DEFAULT NULL,
  `target_type` varchar(160) DEFAULT NULL,
  `target_name` varchar(255) DEFAULT NULL,
  `billing_month` varchar(7) DEFAULT NULL,
  `period_start_date` date DEFAULT NULL,
  `period_end_date` date DEFAULT NULL,
  `period_charge_mode` varchar(40) DEFAULT NULL,
  `period_multiplier` decimal(10,2) NOT NULL DEFAULT '1.00',
  `description` text,
  `created_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `charge_code` (`charge_code`),
  KEY `idx_finance_charges_resident_id` (`resident_id`),
  KEY `idx_finance_charges_fee_type_id` (`fee_type_id`),
  KEY `idx_finance_charges_status` (`status`),
  KEY `idx_finance_charges_due_date` (`due_date`),
  KEY `idx_finance_charges_period` (`resident_id`,`fee_type_id`,`billing_month`,`period_start_date`,`period_end_date`)
) ENGINE=InnoDB AUTO_INCREMENT=232 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_charges`
--

LOCK TABLES `finance_charges` WRITE;
/*!40000 ALTER TABLE `finance_charges` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_charges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_fee_types`
--

DROP TABLE IF EXISTS `finance_fee_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_fee_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fee_code` varchar(50) NOT NULL,
  `fee_name` varchar(255) NOT NULL,
  `default_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `cycle` varchar(30) NOT NULL DEFAULT 'monthly',
  `description` text,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '10',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fee_code` (`fee_code`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_fee_types`
--

LOCK TABLES `finance_fee_types` WRITE;
/*!40000 ALTER TABLE `finance_fee_types` DISABLE KEYS */;
INSERT INTO `finance_fee_types` VALUES (8,'lodging_fee','Phí lưu trú',1200000.00,'monthly','Phí lưu trú',1,10,'2026-07-27 13:26:57','2026-07-27 13:26:57'),(9,'meal_living_fee','Ăn uống sinh hoạt',1800000.00,'monthly','Ăn uống sinh hoạt',1,20,'2026-07-27 13:26:57','2026-07-27 13:26:57'),(10,'other_student_fee','Khoản thu khác của học viên',500000.00,'monthly','Khoản thu khác của học viên',1,30,'2026-07-27 13:26:57','2026-07-27 13:26:57');
/*!40000 ALTER TABLE `finance_fee_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_payments`
--

DROP TABLE IF EXISTS `finance_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `charge_id` int NOT NULL,
  `resident_id` int NOT NULL,
  `amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `payment_date` date NOT NULL,
  `method` varchar(30) NOT NULL DEFAULT 'cash',
  `note` text,
  `created_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_finance_payments_charge_id` (`charge_id`),
  KEY `idx_finance_payments_resident_id` (`resident_id`),
  KEY `idx_finance_payments_payment_date` (`payment_date`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_payments`
--

LOCK TABLES `finance_payments` WRITE;
/*!40000 ALTER TABLE `finance_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_transactions`
--

DROP TABLE IF EXISTS `finance_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `source` varchar(40) NOT NULL,
  `direction` varchar(10) NOT NULL DEFAULT 'in',
  `amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `transaction_date` date NOT NULL,
  `target_type` varchar(160) DEFAULT NULL,
  `target_name` varchar(255) DEFAULT NULL,
  `description` text,
  `external_ref` varchar(160) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_finance_transactions_external_ref` (`external_ref`),
  KEY `idx_finance_transactions_source` (`source`),
  KEY `idx_finance_transactions_direction` (`direction`),
  KEY `idx_finance_transactions_transaction_date` (`transaction_date`),
  KEY `idx_finance_transactions_target_type` (`target_type`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_transactions`
--

LOCK TABLES `finance_transactions` WRITE;
/*!40000 ALTER TABLE `finance_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `groupCode` varchar(50) NOT NULL,
  `groupName` varchar(255) NOT NULL,
  `description` text,
  `createdAt` timestamp NULL DEFAULT (now()),
  `updatedAt` timestamp NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `groups_groupCode_unique` (`groupCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groups`
--

LOCK TABLES `groups` WRITE;
/*!40000 ALTER TABLE `groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `libraryexpenses`
--

DROP TABLE IF EXISTS `libraryexpenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `libraryexpenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `expenseDate` date NOT NULL,
  `description` text NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `expenseType` enum('books','maintenance','utilities','staff','other') NOT NULL,
  `notes` text,
  `recordedBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `libraryExpenses_recordedBy_fk` (`recordedBy`),
  CONSTRAINT `libraryExpenses_recordedBy_fk` FOREIGN KEY (`recordedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `libraryexpenses`
--

LOCK TABLES `libraryexpenses` WRITE;
/*!40000 ALTER TABLE `libraryexpenses` DISABLE KEYS */;
/*!40000 ALTER TABLE `libraryexpenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `libraryrevenues`
--

DROP TABLE IF EXISTS `libraryrevenues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `libraryrevenues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `revenueDate` date NOT NULL,
  `revenueType` enum('rental','photocopy','printing','registration','other') NOT NULL,
  `description` text,
  `amount` decimal(12,2) NOT NULL,
  `notes` text,
  `recordedBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `libraryRevenues_recordedBy_fk` (`recordedBy`),
  KEY `idx_libraryRevenues_revenueDate` (`revenueDate`),
  CONSTRAINT `libraryRevenues_recordedBy_fk` FOREIGN KEY (`recordedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `libraryrevenues`
--

LOCK TABLES `libraryrevenues` WRITE;
/*!40000 ALTER TABLE `libraryrevenues` DISABLE KEYS */;
/*!40000 ALTER TABLE `libraryrevenues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `moduledisplaymodes`
--

DROP TABLE IF EXISTS `moduledisplaymodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `moduledisplaymodes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `moduleKey` varchar(100) NOT NULL,
  `displayMode` enum('simple','detailed') NOT NULL DEFAULT 'simple',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_moduleDisplayModes_moduleKey` (`moduleKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `moduledisplaymodes`
--

LOCK TABLES `moduledisplaymodes` WRITE;
/*!40000 ALTER TABLE `moduledisplaymodes` DISABLE KEYS */;
/*!40000 ALTER TABLE `moduledisplaymodes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipientId` int NOT NULL,
  `type` enum('fee_generated','debt_overdue','task_assigned','attendance_alert','system') NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `relatedEntityType` varchar(50) DEFAULT NULL,
  `relatedEntityId` int DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `sentAt` timestamp NOT NULL DEFAULT (now()),
  `readAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `notifications_recipientId_users_id_fk` (`recipientId`),
  CONSTRAINT `notifications_recipientId_users_id_fk` FOREIGN KEY (`recipientId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_assignments`
--

DROP TABLE IF EXISTS `organization_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `term_id` int NOT NULL,
  `role_id` int NOT NULL,
  `resident_id` int NOT NULL,
  `room_id` int DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'active',
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `unit_id` int DEFAULT NULL,
  `assignment_title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_org_assignments_term_id` (`term_id`),
  KEY `idx_org_assignments_role_id` (`role_id`),
  KEY `idx_org_assignments_resident_id` (`resident_id`),
  KEY `idx_org_assignments_room_id` (`room_id`),
  KEY `idx_org_assignments_status` (`status`),
  KEY `idx_organization_assignments_unit_id` (`unit_id`),
  KEY `idx_org_assign_term_role_unit_status` (`term_id`,`role_id`,`unit_id`,`status`),
  KEY `idx_organization_assignments_title` (`assignment_title`),
  CONSTRAINT `fk_org_assignments_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_org_assignments_role` FOREIGN KEY (`role_id`) REFERENCES `organization_roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_org_assignments_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_org_assignments_term` FOREIGN KEY (`term_id`) REFERENCES `organization_terms` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_organization_assignments_unit` FOREIGN KEY (`unit_id`) REFERENCES `organization_units` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_assignments`
--

LOCK TABLES `organization_assignments` WRITE;
/*!40000 ALTER TABLE `organization_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `organization_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_assignments_bak_20260601`
--

DROP TABLE IF EXISTS `organization_assignments_bak_20260601`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_assignments_bak_20260601` (
  `id` int NOT NULL DEFAULT '0',
  `term_id` int NOT NULL,
  `role_id` int NOT NULL,
  `resident_id` int NOT NULL,
  `room_id` int DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'active',
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_assignments_bak_20260601`
--

LOCK TABLES `organization_assignments_bak_20260601` WRITE;
/*!40000 ALTER TABLE `organization_assignments_bak_20260601` DISABLE KEYS */;
INSERT INTO `organization_assignments_bak_20260601` VALUES (1,1,1,1,2,'2026-06-01',NULL,'active',NULL,'2026-06-01 15:10:53','2026-06-01 15:10:53'),(2,1,2,1,2,'2026-06-01',NULL,'active',NULL,'2026-06-01 15:19:38','2026-06-01 15:19:38'),(3,1,5,3,2,'2026-06-01',NULL,'active',NULL,'2026-06-01 15:21:12','2026-06-01 15:21:12'),(4,1,7,3,2,'2026-06-01',NULL,'active',NULL,'2026-06-01 15:21:22','2026-06-01 15:21:22'),(5,1,8,3,2,'2026-06-01',NULL,'active',NULL,'2026-06-01 15:21:30','2026-06-01 15:21:30'),(6,1,6,4,1,'2026-06-01',NULL,'active',NULL,'2026-06-01 15:25:52','2026-06-01 15:25:52'),(7,1,9,3,2,'2026-06-01','2026-06-01','ended',NULL,'2026-06-01 15:26:09','2026-06-01 09:14:53');
/*!40000 ALTER TABLE `organization_assignments_bak_20260601` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_roles`
--

DROP TABLE IF EXISTS `organization_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'other',
  `description` text,
  `allow_multiple_members` tinyint(1) NOT NULL DEFAULT '1',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `level` int NOT NULL DEFAULT '3',
  `role_type` varchar(50) NOT NULL DEFAULT 'custom',
  `min_assignees` int NOT NULL DEFAULT '0',
  `max_assignees` int DEFAULT NULL,
  `is_system` tinyint(1) NOT NULL DEFAULT '0',
  `requires_unit` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_organization_roles_code` (`code`),
  UNIQUE KEY `uq_organization_roles_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_roles`
--

LOCK TABLES `organization_roles` WRITE;
/*!40000 ALTER TABLE `organization_roles` DISABLE KEYS */;
INSERT INTO `organization_roles` VALUES (1,'TRUONG','Trưởng','management',NULL,0,1,1,'2026-06-05 07:39:56','2026-06-05 07:39:56',1,'head',1,1,1,0),(2,'PHO','Phó','management',NULL,1,1,2,'2026-06-05 07:39:56','2026-06-05 07:39:56',1,'deputy',0,2,1,0),(3,'THU_KY','Thư ký','management',NULL,0,1,3,'2026-06-05 07:39:56','2026-06-05 07:39:56',1,'secretary',0,1,1,0),(4,'THU_QUY','Thủ quỹ','finance',NULL,0,1,4,'2026-06-05 07:39:56','2026-06-05 07:39:56',1,'treasurer',0,1,1,0),(5,'TO_TRUONG','Tổ trưởng','life',NULL,1,1,10,'2026-06-05 07:39:56','2026-06-05 07:39:56',2,'team_leader',0,1,1,1),(6,'TRUONG_BAN','Trưởng ban','activity',NULL,1,1,20,'2026-06-05 07:39:56','2026-06-05 07:39:56',2,'committee_head',0,1,1,1);
/*!40000 ALTER TABLE `organization_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_roles_bak_20260601`
--

DROP TABLE IF EXISTS `organization_roles_bak_20260601`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_roles_bak_20260601` (
  `id` int NOT NULL DEFAULT '0',
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'other',
  `description` text,
  `allow_multiple_members` tinyint(1) NOT NULL DEFAULT '1',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_roles_bak_20260601`
--

LOCK TABLES `organization_roles_bak_20260601` WRITE;
/*!40000 ALTER TABLE `organization_roles_bak_20260601` DISABLE KEYS */;
INSERT INTO `organization_roles_bak_20260601` VALUES (1,'TRUONG_LUU_XA','Trưởng lưu xá','management','Phụ trách chung hoạt động tổ chức, nề nếp và điều phối lưu xá.',0,1,1,'2026-06-01 13:58:43','2026-06-01 07:51:01'),(2,'PHO_LUU_XA','Phó lưu xá','management','Hỗ trợ Trưởng lưu xá trong công tác điều phối, quản lý và sinh hoạt chung.',1,1,2,'2026-06-01 13:58:43','2026-06-01 13:58:43'),(3,'TRUONG_PHONG','Trưởng phòng','room','Đại diện phòng, phụ trách nề nếp, sinh hoạt và thông tin của phòng.',1,1,3,'2026-06-01 13:58:43','2026-06-01 13:58:43'),(4,'PHO_PHONG','Phó phòng','room','Hỗ trợ Trưởng phòng trong việc quản lý nề nếp và sinh hoạt của phòng.',1,1,4,'2026-06-01 13:58:43','2026-06-01 13:58:43'),(5,'BAN_PHUNG_VU','Ban phụng vụ','liturgy','Phụ trách lịch phụng vụ, phân công đọc sách, hát lễ, kinh nguyện và điểm danh phụng vụ.',1,1,5,'2026-06-01 13:58:43','2026-06-01 13:58:43'),(6,'BAN_HOC_TAP','Ban học tập','academic','Theo dõi học tập, hỗ trợ sinh hoạt học vụ, kỹ năng và phát triển cá nhân.',1,1,6,'2026-06-01 13:58:43','2026-06-01 13:58:43'),(7,'BAN_SINH_HOAT','Ban sinh hoạt','activity','Phụ trách hoạt động cộng đồng, sinh hoạt chung, sự kiện và kết nối học viên.',1,1,7,'2026-06-01 13:58:43','2026-06-01 13:58:43'),(8,'BAN_TRUYEN_THONG','Ban truyền thông','activity','Phụ trách truyền thông nội bộ, hình ảnh, thông báo và nội dung sinh hoạt.',1,1,8,'2026-06-01 13:58:43','2026-06-01 13:58:43'),(9,'THU_QUY','Thủ quỹ','finance','Hỗ trợ ghi nhận, theo dõi các khoản thu chi nội bộ theo phân công của lưu xá.',0,1,9,'2026-06-01 13:58:43','2026-06-01 13:58:43'),(10,'BAN_DOI_NGOAI','Ban đối ngoại','activity','Hỗ trợ kết nối, tiếp đón khách, đối ngoại và các hoạt động liên hệ bên ngoài.',1,1,10,'2026-06-01 13:58:43','2026-06-01 13:58:43'),(11,'BAN_KY_LUAT','Ban kỷ luật','discipline','Hỗ trợ theo dõi nội quy, nhắc nhở nề nếp và ghi nhận các trường hợp vi phạm.',1,1,11,'2026-06-01 13:58:43','2026-06-01 13:58:43'),(12,'BAN_DOI_SONG','Ban đời sống','life','Hỗ trợ theo dõi đời sống, sinh hoạt hằng ngày, vệ sinh và nhu cầu chung của học viên.',1,1,12,'2026-06-01 13:58:43','2026-06-01 13:58:43'),(13,'KHAC','Khác','other','Vai trò khác theo nhu cầu tổ chức của lưu xá.',1,1,99,'2026-06-01 13:58:43','2026-06-01 13:58:43');
/*!40000 ALTER TABLE `organization_roles_bak_20260601` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_terms`
--

DROP TABLE IF EXISTS `organization_terms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_terms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'inactive',
  `description` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_organization_terms_code` (`code`),
  UNIQUE KEY `uq_organization_terms_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_terms`
--

LOCK TABLES `organization_terms` WRITE;
/*!40000 ALTER TABLE `organization_terms` DISABLE KEYS */;
INSERT INTO `organization_terms` VALUES (1,'NK26_27','Nhiệm kỳ 2026 - 2027','2026-06-01','2027-05-31','active',NULL,'2026-06-05 06:45:25','2026-06-05 00:53:12');
/*!40000 ALTER TABLE `organization_terms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_unit_members`
--

DROP TABLE IF EXISTS `organization_unit_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_unit_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `unit_id` int NOT NULL,
  `resident_id` int NOT NULL,
  `member_role` enum('member','leader','head') NOT NULL DEFAULT 'member',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_organization_unit_members_unit` (`unit_id`),
  KEY `idx_organization_unit_members_resident` (`resident_id`),
  KEY `idx_organization_unit_members_status` (`status`),
  KEY `idx_org_unit_members_unit_resident_status` (`unit_id`,`resident_id`,`status`),
  CONSTRAINT `fk_org_unit_members_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_org_unit_members_unit` FOREIGN KEY (`unit_id`) REFERENCES `organization_units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_unit_members`
--

LOCK TABLES `organization_unit_members` WRITE;
/*!40000 ALTER TABLE `organization_unit_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `organization_unit_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_units`
--

DROP TABLE IF EXISTS `organization_units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_units` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `unit_type` varchar(50) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_organization_units_code` (`code`),
  KEY `idx_organization_units_type` (`unit_type`),
  KEY `idx_organization_units_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_units`
--

LOCK TABLES `organization_units` WRITE;
/*!40000 ALTER TABLE `organization_units` DISABLE KEYS */;
INSERT INTO `organization_units` VALUES (1,'TO_1','Tổ 1','team',NULL,1,10,'2026-06-05 14:48:35','2026-06-05 14:48:35'),(2,'TO_2','Tổ 2','team',NULL,1,20,'2026-06-05 14:48:48','2026-06-05 14:48:48'),(3,'TO_3','Tổ 3','team',NULL,1,30,'2026-06-05 14:48:56','2026-06-05 14:48:56'),(4,'BAN_THANH_NHAC','Ban Thanh nhạc','committee',NULL,1,40,'2026-06-05 14:49:17','2026-06-05 14:49:17'),(5,'BAN_SINH_HOAT','Ban sinh hoạt','committee',NULL,1,50,'2026-06-05 14:49:37','2026-06-05 14:49:37'),(6,'BAN_TRUYEN_THONG','Ban Truyền Thông','committee',NULL,1,60,'2026-06-05 14:49:57','2026-06-05 07:56:12'),(7,'TO_4','Tổ 4','team',NULL,1,70,'2026-06-05 16:54:30','2026-06-05 16:54:30'),(8,'BAN_HAU_CAN','Ban Hậu cần','committee',NULL,1,80,'2026-07-01 06:39:58','2026-07-01 06:39:58');
/*!40000 ALTER TABLE `organization_units` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parents`
--

DROP TABLE IF EXISTS `parents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `residentId` int NOT NULL,
  `parentType` enum('father','mother','guardian') NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `phoneNumber` varchar(20) DEFAULT NULL,
  `email` varchar(320) DEFAULT NULL,
  `idNumber` varchar(50) DEFAULT NULL,
  `occupation` varchar(255) DEFAULT NULL,
  `address` text,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `parents_residentId_residents_id_fk` (`residentId`),
  CONSTRAINT `parents_residentId_residents_id_fk` FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parents`
--

LOCK TABLES `parents` WRITE;
/*!40000 ALTER TABLE `parents` DISABLE KEYS */;
INSERT INTO `parents` VALUES (14,35,'mother','Trần Thị Phụ Huynh UAT','0910000001','phuhuynh.uat@example.com',NULL,'Giáo viên','TP. Hồ Chí Minh','Liên hệ kiểm thử chính','2026-07-27 06:33:58','2026-07-27 06:33:58');
/*!40000 ALTER TABLE `parents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `debtId` int NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `paymentDate` timestamp NOT NULL DEFAULT (now()),
  `paymentMethod` enum('cash','bank_transfer','check','other') NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `recordedBy` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `payments_debtId_debts_id_fk` (`debtId`),
  KEY `payments_recordedBy_users_id_fk` (`recordedBy`),
  CONSTRAINT `payments_debtId_debts_id_fk` FOREIGN KEY (`debtId`) REFERENCES `debts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_recordedBy_users_id_fk` FOREIGN KEY (`recordedBy`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programs`
--

DROP TABLE IF EXISTS `programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `schoolId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `programs_schoolId_schools_id_fk` (`schoolId`),
  CONSTRAINT `programs_schoolId_schools_id_fk` FOREIGN KEY (`schoolId`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programs`
--

LOCK TABLES `programs` WRITE;
/*!40000 ALTER TABLE `programs` DISABLE KEYS */;
/*!40000 ALTER TABLE `programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `residentacademicinfo`
--

DROP TABLE IF EXISTS `residentacademicinfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `residentacademicinfo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `residentId` int NOT NULL,
  `schoolId` int NOT NULL,
  `programId` int NOT NULL,
  `class` varchar(100) DEFAULT NULL,
  `academicYear` varchar(20) NOT NULL,
  `enrollmentDate` timestamp NOT NULL DEFAULT (now()),
  `status` enum('enrolled','graduated','transferred','suspended') NOT NULL DEFAULT 'enrolled',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `residentAcademicInfo_residentId_residents_id_fk` (`residentId`),
  KEY `residentAcademicInfo_schoolId_schools_id_fk` (`schoolId`),
  KEY `residentAcademicInfo_programId_programs_id_fk` (`programId`),
  CONSTRAINT `residentAcademicInfo_programId_programs_id_fk` FOREIGN KEY (`programId`) REFERENCES `programs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `residentAcademicInfo_residentId_residents_id_fk` FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `residentAcademicInfo_schoolId_schools_id_fk` FOREIGN KEY (`schoolId`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `residentacademicinfo`
--

LOCK TABLES `residentacademicinfo` WRITE;
/*!40000 ALTER TABLE `residentacademicinfo` DISABLE KEYS */;
/*!40000 ALTER TABLE `residentacademicinfo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `residenteducation`
--

DROP TABLE IF EXISTS `residenteducation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `residenteducation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `residentId` int NOT NULL,
  `schoolName` varchar(255) NOT NULL,
  `educationLevel` enum('high_school','vocational','college','university','other') DEFAULT 'university',
  `classOrMajor` varchar(255) DEFAULT NULL,
  `academicYear` varchar(100) DEFAULT NULL,
  `notes` text,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_residentEducation_resident` (`residentId`),
  CONSTRAINT `fk_residentEducation_resident` FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `residenteducation`
--

LOCK TABLES `residenteducation` WRITE;
/*!40000 ALTER TABLE `residenteducation` DISABLE KEYS */;
INSERT INTO `residenteducation` VALUES (5,35,'Đại học UAT','university','Công nghệ thông tin - UAT01','2026-2027','Thông tin học tập kiểm thử',1,'2026-07-26 23:36:48','2026-07-26 23:36:48');
/*!40000 ALTER TABLE `residenteducation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `residentfeeassignments`
--

DROP TABLE IF EXISTS `residentfeeassignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `residentfeeassignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `residentId` int NOT NULL,
  `feeTypeId` int NOT NULL,
  `assignedDate` date NOT NULL,
  `effectiveFromMonth` int NOT NULL,
  `effectiveFromYear` int NOT NULL,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `residentFeeAssignments_residentId_fk` (`residentId`),
  KEY `residentFeeAssignments_feeTypeId_fk` (`feeTypeId`),
  CONSTRAINT `residentFeeAssignments_feeTypeId_fk` FOREIGN KEY (`feeTypeId`) REFERENCES `residentfeetypes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `residentFeeAssignments_residentId_fk` FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `residentfeeassignments`
--

LOCK TABLES `residentfeeassignments` WRITE;
/*!40000 ALTER TABLE `residentfeeassignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `residentfeeassignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `residentfeetypes`
--

DROP TABLE IF EXISTS `residentfeetypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `residentfeetypes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `roomFee` decimal(12,2) NOT NULL DEFAULT '0.00',
  `mealFee` decimal(12,2) NOT NULL DEFAULT '0.00',
  `activitiesFee` decimal(12,2) NOT NULL DEFAULT '0.00',
  `totalMonthlyFee` decimal(12,2) NOT NULL DEFAULT '0.00',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `residentFeeTypes_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `residentfeetypes`
--

LOCK TABLES `residentfeetypes` WRITE;
/*!40000 ALTER TABLE `residentfeetypes` DISABLE KEYS */;
/*!40000 ALTER TABLE `residentfeetypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `residents`
--

DROP TABLE IF EXISTS `residents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `residents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `residentCode` varchar(50) NOT NULL,
  `holyName` varchar(100) DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `fullName` varchar(255) NOT NULL,
  `dateOfBirth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `idNumber` varchar(50) DEFAULT NULL,
  `permanentAddress` text,
  `phoneNumber` varchar(20) DEFAULT NULL,
  `schoolId` int DEFAULT NULL,
  `profileImage` varchar(500) DEFAULT NULL,
  `status` enum('active','inactive','transferred_out') NOT NULL DEFAULT 'active',
  `currentRoomId` int DEFAULT NULL,
  `admissionDate` date NOT NULL,
  `departureDate` date DEFAULT NULL,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `residents_residentCode_unique` (`residentCode`),
  KEY `residents_schoolId_schools_id_fk` (`schoolId`),
  KEY `idx_residents_status_current_room` (`status`,`currentRoomId`),
  CONSTRAINT `residents_schoolId_schools_id_fk` FOREIGN KEY (`schoolId`) REFERENCES `schools` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `residents`
--

LOCK TABLES `residents` WRITE;
/*!40000 ALTER TABLE `residents` DISABLE KEYS */;
INSERT INTO `residents` VALUES (35,'LX2026988458','Giuse',35,'Nguyễn Văn Kiểm Thử','2000-01-01','female','079200000001','TP. Hồ Chí Minh','0900000001',NULL,NULL,'active',13,'2026-07-27',NULL,'Dữ liệu UAT 2026-07-27','2026-07-27 06:33:08','2026-07-26 23:35:45');
/*!40000 ALTER TABLE `residents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `residentstudyschedules`
--

DROP TABLE IF EXISTS `residentstudyschedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `residentstudyschedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `residentId` int NOT NULL,
  `dayOfWeek` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `subjectName` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `notes` text,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_study_schedules_resident_day_active` (`residentId`,`dayOfWeek`,`isActive`),
  CONSTRAINT `fk_residentStudySchedules_resident` FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `residentstudyschedules`
--

LOCK TABLES `residentstudyschedules` WRITE;
/*!40000 ALTER TABLE `residentstudyschedules` DISABLE KEYS */;
INSERT INTO `residentstudyschedules` VALUES (13,35,'monday','07:30:00','11:00:00','Lập trình UAT','Giảng đường UAT-A','Buổi học kiểm thử xung đột công tác',1,'2026-07-26 23:37:20','2026-07-26 23:37:20');
/*!40000 ALTER TABLE `residentstudyschedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `revenuehistory`
--

DROP TABLE IF EXISTS `revenuehistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `revenuehistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `revenueId` int NOT NULL,
  `fieldChanged` varchar(100) NOT NULL,
  `oldValue` text,
  `newValue` text,
  `changeReason` varchar(255) DEFAULT NULL,
  `changedBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `revenueHistory_revenueId_fk` (`revenueId`),
  KEY `revenueHistory_changedBy_fk` (`changedBy`),
  CONSTRAINT `revenueHistory_changedBy_fk` FOREIGN KEY (`changedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `revenueHistory_revenueId_fk` FOREIGN KEY (`revenueId`) REFERENCES `revenues` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `revenuehistory`
--

LOCK TABLES `revenuehistory` WRITE;
/*!40000 ALTER TABLE `revenuehistory` DISABLE KEYS */;
/*!40000 ALTER TABLE `revenuehistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `revenuepayments`
--

DROP TABLE IF EXISTS `revenuepayments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `revenuepayments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `revenueId` int NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `paymentMethod` enum('cash','bank_transfer','check','other') NOT NULL,
  `paymentDate` date NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `notes` text,
  `recordedBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `revenuePayments_revenueId_fk` (`revenueId`),
  KEY `revenuePayments_recordedBy_fk` (`recordedBy`),
  CONSTRAINT `revenuePayments_recordedBy_fk` FOREIGN KEY (`recordedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `revenuePayments_revenueId_fk` FOREIGN KEY (`revenueId`) REFERENCES `revenues` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `revenuepayments`
--

LOCK TABLES `revenuepayments` WRITE;
/*!40000 ALTER TABLE `revenuepayments` DISABLE KEYS */;
/*!40000 ALTER TABLE `revenuepayments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `revenues`
--

DROP TABLE IF EXISTS `revenues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `revenues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `residentId` int NOT NULL,
  `billingMonth` int NOT NULL,
  `billingYear` int NOT NULL,
  `baseFee` decimal(12,2) NOT NULL,
  `additionalFeeAmount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `borrowedFeeAddition` decimal(12,2) NOT NULL DEFAULT '0.00',
  `totalAmount` decimal(12,2) NOT NULL,
  `status` enum('pending','due','overdue','paid','partial','cancelled') NOT NULL DEFAULT 'pending',
  `dueDate` date NOT NULL,
  `paidAmount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `paidDate` date DEFAULT NULL,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `revenues_unique_resident_month` (`residentId`,`billingMonth`,`billingYear`),
  KEY `idx_revenues_residentId` (`residentId`),
  KEY `idx_revenues_billingMonth` (`billingMonth`,`billingYear`),
  KEY `idx_revenues_status` (`status`),
  CONSTRAINT `revenues_residentId_fk` FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `revenues`
--

LOCK TABLES `revenues` WRITE;
/*!40000 ALTER TABLE `revenues` DISABLE KEYS */;
/*!40000 ALTER TABLE `revenues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rolepermissions`
--

DROP TABLE IF EXISTS `rolepermissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rolepermissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `roleId` int NOT NULL,
  `moduleKey` varchar(100) NOT NULL,
  `actionKey` varchar(100) NOT NULL,
  `isAllowed` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_rolePermissions_role_module_action` (`roleId`,`moduleKey`,`actionKey`),
  KEY `idx_rolePermissions_roleId` (`roleId`),
  KEY `idx_rolePermissions_moduleKey` (`moduleKey`),
  CONSTRAINT `fk_rolePermissions_role` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rolepermissions`
--

LOCK TABLES `rolepermissions` WRITE;
/*!40000 ALTER TABLE `rolepermissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `rolepermissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `roleKey` varchar(50) NOT NULL,
  `roleName` varchar(100) NOT NULL,
  `description` text,
  `isSystem` tinyint(1) NOT NULL DEFAULT '1',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `sortOrder` int DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_roleKey` (`roleKey`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'manager','Quản lý lưu xá','Toàn quyền quản lý vận hành lưu xá, người dùng, học viên, sinh hoạt, tài chính, báo cáo và thiết lập.',1,1,10,'2026-06-02 15:18:25','2026-06-02 15:18:25'),(2,'resident','Học viên','Xem lịch, công tác, thông báo và các thông tin cá nhân được phép.',1,1,20,'2026-06-02 15:18:25','2026-06-02 15:18:25'),(3,'house_leader','Trưởng nhà','Theo dõi và điều phối sinh hoạt chung cấp nhà.',1,1,30,'2026-06-02 15:18:25','2026-06-02 15:18:25'),(4,'deputy','Phó','Hỗ trợ người phụ trách chính theo phạm vi được phân công.',1,1,40,'2026-06-02 15:18:25','2026-06-02 15:18:25'),(5,'secretary','Thư ký','Ghi nhận thông tin, danh sách, biên bản và thông báo được phân công.',1,1,50,'2026-06-02 15:18:25','2026-06-02 15:18:25'),(6,'treasurer','Thủ quỹ','Theo dõi quỹ, khoản đóng góp hoặc các khoản thu chi nội bộ được phân công.',1,1,60,'2026-06-02 15:18:25','2026-06-02 15:18:25'),(7,'team_leader','Tổ trưởng','Theo dõi tổ, công tác và sinh hoạt của tổ được phân công.',1,1,70,'2026-06-02 15:18:25','2026-06-02 15:18:25'),(8,'committee_head','Trưởng ban','Theo dõi công việc và thành viên của ban được phân công.',1,1,80,'2026-06-02 15:18:25','2026-06-02 15:18:25');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roomassignmenthistory`
--

DROP TABLE IF EXISTS `roomassignmenthistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roomassignmenthistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `residentId` int NOT NULL,
  `roomId` int NOT NULL,
  `assignmentDate` timestamp NOT NULL DEFAULT (now()),
  `releaseDate` timestamp NULL DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `assignedBy` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `roomAssignmentHistory_residentId_residents_id_fk` (`residentId`),
  KEY `roomAssignmentHistory_roomId_rooms_id_fk` (`roomId`),
  KEY `roomAssignmentHistory_assignedBy_users_id_fk` (`assignedBy`),
  CONSTRAINT `roomAssignmentHistory_assignedBy_users_id_fk` FOREIGN KEY (`assignedBy`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `roomAssignmentHistory_residentId_residents_id_fk` FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `roomAssignmentHistory_roomId_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roomassignmenthistory`
--

LOCK TABLES `roomassignmenthistory` WRITE;
/*!40000 ALTER TABLE `roomassignmenthistory` DISABLE KEYS */;
/*!40000 ALTER TABLE `roomassignmenthistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roomassignments`
--

DROP TABLE IF EXISTS `roomassignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roomassignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `residentId` int NOT NULL,
  `roomId` int NOT NULL,
  `assignedDate` date NOT NULL,
  `unassignedDate` date DEFAULT NULL,
  `eventType` enum('new_entry','transfer','temporary_leave','left') NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `notes` text,
  `createdAt` timestamp NULL DEFAULT (now()),
  `updatedAt` timestamp NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_room_assignments_room_unassigned` (`roomId`,`unassignedDate`),
  KEY `idx_room_assignments_resident_unassigned` (`residentId`,`unassignedDate`),
  CONSTRAINT `roomAssignments_residentId_residents_id_fk` FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `roomAssignments_roomId_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roomassignments`
--

LOCK TABLES `roomassignments` WRITE;
/*!40000 ALTER TABLE `roomassignments` DISABLE KEYS */;
INSERT INTO `roomassignments` VALUES (47,35,13,'2026-07-27',NULL,'new_entry','Gán phòng trong kịch bản UAT',NULL,'2026-07-27 06:35:45','2026-07-27 06:35:45');
/*!40000 ALTER TABLE `roomassignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roomleaders`
--

DROP TABLE IF EXISTS `roomleaders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roomleaders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `roomId` int NOT NULL,
  `residentId` int NOT NULL,
  `appointedDate` date NOT NULL,
  `unappointedDate` date DEFAULT NULL,
  `notes` text,
  `createdAt` timestamp NULL DEFAULT (now()),
  `updatedAt` timestamp NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `roomLeaders_roomId_rooms_id_fk` (`roomId`),
  KEY `roomLeaders_residentId_residents_id_fk` (`residentId`),
  CONSTRAINT `roomLeaders_residentId_residents_id_fk` FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `roomLeaders_roomId_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roomleaders`
--

LOCK TABLES `roomleaders` WRITE;
/*!40000 ALTER TABLE `roomleaders` DISABLE KEYS */;
/*!40000 ALTER TABLE `roomleaders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `roomCode` varchar(50) NOT NULL,
  `capacity` int NOT NULL,
  `createdAt` timestamp NULL DEFAULT (now()),
  `updatedAt` timestamp NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `groupId` int DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rooms_roomCode_unique` (`roomCode`),
  KEY `rooms_groupId_groups_id_fk` (`groupId`),
  CONSTRAINT `rooms_groupId_groups_id_fk` FOREIGN KEY (`groupId`) REFERENCES `groups` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (13,'UAT-101',4,'2026-07-27 06:35:15','2026-07-27 06:35:15',NULL,'Phòng kiểm thử UAT');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scheduleconflicts`
--

DROP TABLE IF EXISTS `scheduleconflicts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scheduleconflicts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `residentId` int NOT NULL,
  `dutyConfigId` int NOT NULL,
  `studyDayOfWeek` int DEFAULT NULL,
  `studyStartTime` time DEFAULT NULL,
  `studyEndTime` time DEFAULT NULL,
  `dutyStartTime` time DEFAULT NULL,
  `dutyEndTime` time DEFAULT NULL,
  `conflictLevel` enum('none','partial','full') NOT NULL DEFAULT 'none',
  `conflictMinutes` int DEFAULT NULL,
  `isResolved` tinyint(1) NOT NULL DEFAULT '0',
  `resolutionNote` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `scheduleConflicts_residentId_residents_id_fk` (`residentId`),
  KEY `scheduleConflicts_dutyConfigId_dutyConfigs_id_fk` (`dutyConfigId`),
  CONSTRAINT `scheduleConflicts_dutyConfigId_dutyConfigs_id_fk` FOREIGN KEY (`dutyConfigId`) REFERENCES `dutyconfigs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `scheduleConflicts_residentId_residents_id_fk` FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scheduleconflicts`
--

LOCK TABLES `scheduleconflicts` WRITE;
/*!40000 ALTER TABLE `scheduleconflicts` DISABLE KEYS */;
/*!40000 ALTER TABLE `scheduleconflicts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schools`
--

DROP TABLE IF EXISTS `schools`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schools` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('high_school','college','university') NOT NULL,
  `address` text,
  `phoneNumber` varchar(20) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schools`
--

LOCK TABLES `schools` WRITE;
/*!40000 ALTER TABLE `schools` DISABLE KEYS */;
/*!40000 ALTER TABLE `schools` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `userId` int NOT NULL,
  `expiresAt` timestamp NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `sessions_userId_users_id_fk` (`userId`),
  CONSTRAINT `sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('_9_WiSfnIb4x5jmwDeh8l',1,'2026-07-31 23:54:01','2026-07-24 23:54:01'),('0XgOWzl2a2n2MicmPICHU',1,'2026-07-31 23:54:31','2026-07-24 23:54:31'),('29sRmetp7vXLzcGm4UcV_',1,'2026-06-29 00:13:58','2026-06-22 00:13:58'),('6buqN54wTPRHfVBslzzg8',1,'2026-08-02 23:31:54','2026-07-26 23:31:54'),('bACtF9bQOVUlQVeYtQsZ4',1,'2026-08-01 02:59:24','2026-07-25 02:59:24'),('dicPwomPN89EZi_fq8lhn',1,'2026-07-28 21:33:35','2026-07-21 21:33:35'),('Do5aNzzjlKnADKrPCNatX',1,'2026-07-24 15:58:06','2026-07-17 15:58:06'),('FSbjhkeUK0vDzmhfqb0zM',1,'2026-06-30 16:14:31','2026-06-23 16:14:31'),('gvpEdMSV3qfCwBp-pR0bM',1,'2026-08-02 23:32:15','2026-07-26 23:32:15'),('JVF9SG6kIgyn0Ih2FEVTz',1,'2026-06-22 15:43:07','2026-06-15 15:43:07'),('oUF5uLnbN2R8HdOTHoZpf',1,'2026-07-01 06:50:47','2026-06-24 06:50:47'),('pofSWlE9iSABndMYGdV7w',1,'2026-07-23 01:07:29','2026-07-16 01:07:29'),('uFU5D0tHkimQ4Ck98N1YW',1,'2026-07-31 23:55:48','2026-07-24 23:55:48'),('z4WKSzWASPd9SDVrQCPlW',1,'2026-07-28 21:19:51','2026-07-21 21:19:51'),('zQCipZnp4q95KDeNpt2pj',1,'2026-07-28 20:55:24','2026-07-21 20:55:24');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storedailyclosings`
--

DROP TABLE IF EXISTS `storedailyclosings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storedailyclosings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ledgerId` int NOT NULL,
  `closingCode` varchar(50) NOT NULL,
  `closingDate` date NOT NULL,
  `totalIn` decimal(14,2) NOT NULL DEFAULT '0.00',
  `totalOut` decimal(14,2) NOT NULL DEFAULT '0.00',
  `netAmount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `transactionCount` int NOT NULL DEFAULT '0',
  `status` enum('draft','reviewed','approved','cancelled','closed') NOT NULL DEFAULT 'draft',
  `closedBy` int DEFAULT NULL,
  `closedAt` datetime DEFAULT NULL,
  `postedToFinance` tinyint(1) NOT NULL DEFAULT '0',
  `financeBatchId` varchar(100) DEFAULT NULL,
  `notes` text,
  `reviewedBy` int DEFAULT NULL,
  `reviewedAt` timestamp NULL DEFAULT NULL,
  `approvedBy` int DEFAULT NULL,
  `approvedAt` timestamp NULL DEFAULT NULL,
  `confirmedBy` int DEFAULT NULL,
  `confirmedAt` datetime DEFAULT NULL,
  `createdBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `storeDailyClosings_ledger_date_unique` (`ledgerId`,`closingDate`),
  KEY `storeDailyClosings_ledger_idx` (`ledgerId`),
  KEY `storeDailyClosings_date_idx` (`closingDate`),
  KEY `storeDailyClosings_status_idx` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storedailyclosings`
--

LOCK TABLES `storedailyclosings` WRITE;
/*!40000 ALTER TABLE `storedailyclosings` DISABLE KEYS */;
/*!40000 ALTER TABLE `storedailyclosings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storedocumentlines`
--

DROP TABLE IF EXISTS `storedocumentlines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storedocumentlines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `documentId` int NOT NULL,
  `productId` int NOT NULL,
  `lineNo` int NOT NULL,
  `quantity` decimal(14,2) NOT NULL,
  `unitCost` decimal(14,2) NOT NULL DEFAULT '0.00',
  `unitPrice` decimal(14,2) NOT NULL DEFAULT '0.00',
  `lineAmount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `storeDocumentLines_document_line_unique` (`documentId`,`lineNo`),
  KEY `storeDocumentLines_document_idx` (`documentId`),
  KEY `storeDocumentLines_product_idx` (`productId`),
  CONSTRAINT `storeDocumentLines_document_fk` FOREIGN KEY (`documentId`) REFERENCES `storedocuments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `storeDocumentLines_product_fk` FOREIGN KEY (`productId`) REFERENCES `storeproducts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storedocumentlines`
--

LOCK TABLES `storedocumentlines` WRITE;
/*!40000 ALTER TABLE `storedocumentlines` DISABLE KEYS */;
/*!40000 ALTER TABLE `storedocumentlines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storedocuments`
--

DROP TABLE IF EXISTS `storedocuments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storedocuments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ledgerId` int NOT NULL,
  `ledgerTransactionId` int DEFAULT NULL,
  `storeShiftId` int DEFAULT NULL,
  `storeDutyAssignmentId` int DEFAULT NULL,
  `createdByResidentId` int DEFAULT NULL,
  `documentCode` varchar(50) NOT NULL,
  `documentType` enum('stock_in','sale') NOT NULL,
  `documentDate` date NOT NULL,
  `stockInSource` enum('purchase','production','self_supply','other') DEFAULT NULL,
  `partnerName` varchar(255) DEFAULT NULL,
  `paymentMethod` varchar(50) DEFAULT 'cash',
  `totalQuantity` decimal(14,2) NOT NULL DEFAULT '0.00',
  `totalAmount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `notes` text,
  `status` enum('posted','cancelled') NOT NULL DEFAULT 'posted',
  `createdBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `storeDocuments_documentCode_unique` (`documentCode`),
  KEY `storeDocuments_ledger_idx` (`ledgerId`),
  KEY `storeDocuments_type_date_idx` (`documentType`,`documentDate`),
  KEY `storeDocuments_transaction_idx` (`ledgerTransactionId`),
  KEY `storeDocuments_created_by_fk` (`createdBy`),
  KEY `storeDocuments_shift_idx` (`storeShiftId`),
  KEY `storeDocuments_duty_assignment_idx` (`storeDutyAssignmentId`),
  KEY `storeDocuments_created_resident_fk` (`createdByResidentId`),
  CONSTRAINT `storeDocuments_created_by_fk` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `storeDocuments_created_resident_fk` FOREIGN KEY (`createdByResidentId`) REFERENCES `residents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `storeDocuments_duty_assignment_fk` FOREIGN KEY (`storeDutyAssignmentId`) REFERENCES `storedutyassignments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `storeDocuments_ledger_fk` FOREIGN KEY (`ledgerId`) REFERENCES `storeledgers` (`id`),
  CONSTRAINT `storeDocuments_shift_fk` FOREIGN KEY (`storeShiftId`) REFERENCES `storeshifts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `storeDocuments_transaction_fk` FOREIGN KEY (`ledgerTransactionId`) REFERENCES `storeledgertransactions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storedocuments`
--

LOCK TABLES `storedocuments` WRITE;
/*!40000 ALTER TABLE `storedocuments` DISABLE KEYS */;
/*!40000 ALTER TABLE `storedocuments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storedutyaccesssessions`
--

DROP TABLE IF EXISTS `storedutyaccesssessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storedutyaccesssessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `storeShiftId` int NOT NULL,
  `storeDutyAssignmentId` int NOT NULL,
  `residentId` int NOT NULL,
  `accessCodeHash` varchar(255) NOT NULL,
  `accessTokenHash` varchar(255) DEFAULT NULL,
  `portalSessionId` varchar(255) DEFAULT NULL,
  `validFrom` timestamp NOT NULL,
  `validUntil` timestamp NOT NULL,
  `verifiedAt` timestamp NULL DEFAULT NULL,
  `lastStoreActivityAt` timestamp NULL DEFAULT NULL,
  `sessionExpiresAt` timestamp NULL DEFAULT NULL,
  `status` enum('pending','active','expired','revoked','completed') NOT NULL DEFAULT 'pending',
  `issuedBy` int DEFAULT NULL,
  `issuedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `revokedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `storeDutyAccessSessions_shift_resident_idx` (`storeShiftId`,`residentId`),
  KEY `storeDutyAccessSessions_assignment_idx` (`storeDutyAssignmentId`),
  KEY `storeDutyAccessSessions_token_idx` (`accessTokenHash`),
  KEY `storeDutyAccessSessions_status_expiry_idx` (`status`,`sessionExpiresAt`),
  KEY `storeDutyAccessSessions_resident_fk` (`residentId`),
  KEY `storeDutyAccessSessions_issued_by_fk` (`issuedBy`),
  CONSTRAINT `storeDutyAccessSessions_assignment_fk` FOREIGN KEY (`storeDutyAssignmentId`) REFERENCES `storedutyassignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `storeDutyAccessSessions_issued_by_fk` FOREIGN KEY (`issuedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `storeDutyAccessSessions_resident_fk` FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `storeDutyAccessSessions_shift_fk` FOREIGN KEY (`storeShiftId`) REFERENCES `storeshifts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storedutyaccesssessions`
--

LOCK TABLES `storedutyaccesssessions` WRITE;
/*!40000 ALTER TABLE `storedutyaccesssessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `storedutyaccesssessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storedutyassignments`
--

DROP TABLE IF EXISTS `storedutyassignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storedutyassignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dutyAssignmentId` int DEFAULT NULL,
  `ledgerId` int NOT NULL,
  `shiftDate` date NOT NULL,
  `shiftType` enum('morning','afternoon') NOT NULL,
  `primaryResidentId` int DEFAULT NULL,
  `managerId` int DEFAULT NULL,
  `openingCashPlanned` decimal(14,2) NOT NULL DEFAULT '0.00',
  `status` enum('scheduled','access_issued','active','handover_pending','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  `notes` text,
  `createdBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `storeDutyAssignments_duty_assignment_idx` (`dutyAssignmentId`),
  KEY `storeDutyAssignments_ledger_date_shift_idx` (`ledgerId`,`shiftDate`,`shiftType`),
  KEY `storeDutyAssignments_primary_resident_idx` (`primaryResidentId`),
  KEY `storeDutyAssignments_status_idx` (`status`),
  KEY `storeDutyAssignments_manager_fk` (`managerId`),
  KEY `storeDutyAssignments_created_by_fk` (`createdBy`),
  CONSTRAINT `storeDutyAssignments_created_by_fk` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `storeDutyAssignments_ledger_fk` FOREIGN KEY (`ledgerId`) REFERENCES `storeledgers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `storeDutyAssignments_manager_fk` FOREIGN KEY (`managerId`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `storeDutyAssignments_primary_resident_fk` FOREIGN KEY (`primaryResidentId`) REFERENCES `residents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storedutyassignments`
--

LOCK TABLES `storedutyassignments` WRITE;
/*!40000 ALTER TABLE `storedutyassignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `storedutyassignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storedutymembers`
--

DROP TABLE IF EXISTS `storedutymembers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storedutymembers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `storeDutyAssignmentId` int NOT NULL,
  `residentId` int NOT NULL,
  `memberRole` enum('primary','assistant','receiver') NOT NULL DEFAULT 'assistant',
  `status` enum('assigned','confirmed','completed','cancelled') NOT NULL DEFAULT 'assigned',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `storeDutyMembers_assignment_resident_unique` (`storeDutyAssignmentId`,`residentId`),
  KEY `storeDutyMembers_assignment_idx` (`storeDutyAssignmentId`),
  KEY `storeDutyMembers_resident_idx` (`residentId`),
  CONSTRAINT `storeDutyMembers_assignment_fk` FOREIGN KEY (`storeDutyAssignmentId`) REFERENCES `storedutyassignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `storeDutyMembers_resident_fk` FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storedutymembers`
--

LOCK TABLES `storedutymembers` WRITE;
/*!40000 ALTER TABLE `storedutymembers` DISABLE KEYS */;
/*!40000 ALTER TABLE `storedutymembers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storeexpenses`
--

DROP TABLE IF EXISTS `storeexpenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storeexpenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `expenseDate` date NOT NULL,
  `description` text NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `expenseType` enum('purchase','rent','utilities','staff','other') NOT NULL,
  `notes` text,
  `recordedBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `storeExpenses_recordedBy_fk` (`recordedBy`),
  CONSTRAINT `storeExpenses_recordedBy_fk` FOREIGN KEY (`recordedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storeexpenses`
--

LOCK TABLES `storeexpenses` WRITE;
/*!40000 ALTER TABLE `storeexpenses` DISABLE KEYS */;
/*!40000 ALTER TABLE `storeexpenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storeledgers`
--

DROP TABLE IF EXISTS `storeledgers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storeledgers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ledgerCode` varchar(50) NOT NULL,
  `ledgerName` varchar(255) NOT NULL,
  `ledgerType` enum('store','fund','other') NOT NULL DEFAULT 'store',
  `openingBalance` decimal(14,2) NOT NULL DEFAULT '0.00',
  `description` text,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `storeLedgers_ledgerCode_unique` (`ledgerCode`),
  KEY `storeLedgers_active_idx` (`isActive`),
  KEY `storeLedgers_createdBy_idx` (`createdBy`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storeledgers`
--

LOCK TABLES `storeledgers` WRITE;
/*!40000 ALTER TABLE `storeledgers` DISABLE KEYS */;
/*!40000 ALTER TABLE `storeledgers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storeledgertransactions`
--

DROP TABLE IF EXISTS `storeledgertransactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storeledgertransactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ledgerId` int NOT NULL,
  `dailyClosingId` int DEFAULT NULL,
  `storeShiftId` int DEFAULT NULL,
  `storeDutyAssignmentId` int DEFAULT NULL,
  `createdByResidentId` int DEFAULT NULL,
  `transactionCode` varchar(50) NOT NULL,
  `direction` enum('in','out') NOT NULL,
  `transactionDate` date NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `partnerName` varchar(255) DEFAULT NULL,
  `paymentMethod` varchar(50) DEFAULT 'cash',
  `description` text,
  `status` enum('posted','cancelled') NOT NULL DEFAULT 'posted',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `storeLedgerTransactions_code_unique` (`transactionCode`),
  KEY `storeLedgerTransactions_ledger_idx` (`ledgerId`),
  KEY `storeLedgerTransactions_date_idx` (`transactionDate`),
  KEY `storeLedgerTransactions_direction_idx` (`direction`),
  KEY `storeLedgerTransactions_createdBy_idx` (`createdBy`),
  KEY `storeLedgerTransactions_closing_idx` (`dailyClosingId`),
  KEY `storeLedgerTransactions_shift_idx` (`storeShiftId`),
  KEY `storeLedgerTransactions_duty_assignment_idx` (`storeDutyAssignmentId`),
  KEY `storeLedgerTransactions_created_resident_fk` (`createdByResidentId`),
  CONSTRAINT `storeLedgerTransactions_created_resident_fk` FOREIGN KEY (`createdByResidentId`) REFERENCES `residents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `storeLedgerTransactions_dailyClosing_fk` FOREIGN KEY (`dailyClosingId`) REFERENCES `storedailyclosings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `storeLedgerTransactions_duty_assignment_fk` FOREIGN KEY (`storeDutyAssignmentId`) REFERENCES `storedutyassignments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `storeLedgerTransactions_ledger_fk` FOREIGN KEY (`ledgerId`) REFERENCES `storeledgers` (`id`),
  CONSTRAINT `storeLedgerTransactions_shift_fk` FOREIGN KEY (`storeShiftId`) REFERENCES `storeshifts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storeledgertransactions`
--

LOCK TABLES `storeledgertransactions` WRITE;
/*!40000 ALTER TABLE `storeledgertransactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `storeledgertransactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storepreorderlines`
--

DROP TABLE IF EXISTS `storepreorderlines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storepreorderlines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `preorderId` int NOT NULL,
  `productId` int NOT NULL,
  `lineNo` int NOT NULL,
  `quantity` decimal(14,2) NOT NULL,
  `unitPrice` decimal(14,2) NOT NULL,
  `lineAmount` decimal(14,2) NOT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `storePreorderLines_order_line_unique` (`preorderId`,`lineNo`),
  KEY `storePreorderLines_product_idx` (`productId`),
  CONSTRAINT `storePreorderLines_order_fk` FOREIGN KEY (`preorderId`) REFERENCES `storepreorders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `storePreorderLines_product_fk` FOREIGN KEY (`productId`) REFERENCES `storeproducts` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storepreorderlines`
--

LOCK TABLES `storepreorderlines` WRITE;
/*!40000 ALTER TABLE `storepreorderlines` DISABLE KEYS */;
/*!40000 ALTER TABLE `storepreorderlines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storepreorders`
--

DROP TABLE IF EXISTS `storepreorders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storepreorders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ledgerId` int NOT NULL,
  `storeShiftId` int DEFAULT NULL,
  `orderCode` varchar(60) NOT NULL,
  `orderDate` date NOT NULL,
  `customerName` varchar(255) NOT NULL,
  `customerPhone` varchar(30) NOT NULL,
  `deliveryAddress` text,
  `fulfillmentType` enum('pickup','delivery') NOT NULL DEFAULT 'pickup',
  `requestedDate` date NOT NULL,
  `depositAmount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `totalAmount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `status` enum('pending','confirmed','preparing','ready','completed','cancelled') NOT NULL DEFAULT 'pending',
  `saleDocumentId` int DEFAULT NULL,
  `notes` text,
  `createdByResidentId` int DEFAULT NULL,
  `completedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `storePreorders_orderCode_unique` (`orderCode`),
  KEY `storePreorders_ledger_status_idx` (`ledgerId`,`status`),
  KEY `storePreorders_requestedDate_idx` (`requestedDate`),
  KEY `storePreorders_shift_fk` (`storeShiftId`),
  KEY `storePreorders_sale_document_fk` (`saleDocumentId`),
  CONSTRAINT `storePreorders_ledger_fk` FOREIGN KEY (`ledgerId`) REFERENCES `storeledgers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `storePreorders_sale_document_fk` FOREIGN KEY (`saleDocumentId`) REFERENCES `storedocuments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `storePreorders_shift_fk` FOREIGN KEY (`storeShiftId`) REFERENCES `storeshifts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storepreorders`
--

LOCK TABLES `storepreorders` WRITE;
/*!40000 ALTER TABLE `storepreorders` DISABLE KEYS */;
/*!40000 ALTER TABLE `storepreorders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storeproductcosthistories`
--

DROP TABLE IF EXISTS `storeproductcosthistories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storeproductcosthistories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `sourceType` enum('purchase','processed','adjustment','manual') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual',
  `effectiveDate` date NOT NULL,
  `quantity` decimal(14,2) NOT NULL DEFAULT '0.00',
  `unitCost` decimal(14,2) NOT NULL DEFAULT '0.00',
  `averageCostAfter` decimal(14,2) NOT NULL DEFAULT '0.00',
  `reason` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `storeProductCostHistories_product_date_idx` (`productId`,`effectiveDate`),
  KEY `storeProductCostHistories_createdBy_idx` (`createdBy`),
  CONSTRAINT `storeProductCostHistories_product_fk` FOREIGN KEY (`productId`) REFERENCES `storeproducts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storeproductcosthistories`
--

LOCK TABLES `storeproductcosthistories` WRITE;
/*!40000 ALTER TABLE `storeproductcosthistories` DISABLE KEYS */;
/*!40000 ALTER TABLE `storeproductcosthistories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storeproducts`
--

DROP TABLE IF EXISTS `storeproducts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storeproducts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productCode` varchar(50) NOT NULL,
  `productName` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT 'general',
  `unit` varchar(50) NOT NULL DEFAULT 'cái',
  `defaultCostPrice` decimal(14,2) NOT NULL DEFAULT '0.00',
  `defaultSalePrice` decimal(14,2) NOT NULL DEFAULT '0.00',
  `minStock` decimal(14,2) NOT NULL DEFAULT '0.00',
  `currentStock` decimal(14,2) NOT NULL DEFAULT '0.00',
  `sourceType` enum('purchase','processed','both') NOT NULL DEFAULT 'purchase',
  `costingMethod` enum('weighted_average','latest','manual') NOT NULL DEFAULT 'weighted_average',
  `averageCostPrice` decimal(14,2) NOT NULL DEFAULT '0.00',
  `currentSalePrice` decimal(14,2) NOT NULL DEFAULT '0.00',
  `description` text,
  `imageUrl` varchar(1000) DEFAULT NULL,
  `imageData` mediumtext,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `storeProducts_productCode_unique` (`productCode`),
  KEY `storeProducts_active_idx` (`isActive`),
  KEY `storeProducts_category_idx` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storeproducts`
--

LOCK TABLES `storeproducts` WRITE;
/*!40000 ALTER TABLE `storeproducts` DISABLE KEYS */;
/*!40000 ALTER TABLE `storeproducts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storeproductsalepricehistories`
--

DROP TABLE IF EXISTS `storeproductsalepricehistories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storeproductsalepricehistories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `effectiveDate` date NOT NULL,
  `salePrice` decimal(14,2) NOT NULL DEFAULT '0.00',
  `reason` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `storeProductSalePriceHistories_product_idx` (`productId`),
  KEY `storeProductSalePriceHistories_effectiveDate_idx` (`effectiveDate`),
  KEY `storeProductSalePriceHistories_product_date_idx` (`productId`,`effectiveDate`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storeproductsalepricehistories`
--

LOCK TABLES `storeproductsalepricehistories` WRITE;
/*!40000 ALTER TABLE `storeproductsalepricehistories` DISABLE KEYS */;
/*!40000 ALTER TABLE `storeproductsalepricehistories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storerevenues`
--

DROP TABLE IF EXISTS `storerevenues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storerevenues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `revenueDate` date NOT NULL,
  `productName` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `unitPrice` decimal(12,2) NOT NULL,
  `totalAmount` decimal(12,2) NOT NULL,
  `notes` text,
  `recordedBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `storeRevenues_recordedBy_fk` (`recordedBy`),
  KEY `idx_storeRevenues_revenueDate` (`revenueDate`),
  CONSTRAINT `storeRevenues_recordedBy_fk` FOREIGN KEY (`recordedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storerevenues`
--

LOCK TABLES `storerevenues` WRITE;
/*!40000 ALTER TABLE `storerevenues` DISABLE KEYS */;
/*!40000 ALTER TABLE `storerevenues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storesaleitems`
--

DROP TABLE IF EXISTS `storesaleitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storesaleitems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productName` varchar(255) NOT NULL,
  `totalQuantitySold` int NOT NULL DEFAULT '0',
  `totalRevenue` decimal(12,2) NOT NULL DEFAULT '0.00',
  `averageUnitPrice` decimal(12,2) DEFAULT NULL,
  `lastSaleDate` date DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storesaleitems`
--

LOCK TABLES `storesaleitems` WRITE;
/*!40000 ALTER TABLE `storesaleitems` DISABLE KEYS */;
/*!40000 ALTER TABLE `storesaleitems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storeshifthandovers`
--

DROP TABLE IF EXISTS `storeshifthandovers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storeshifthandovers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `storeShiftId` int NOT NULL,
  `handoverType` enum('shift_to_shift','end_of_day','manager_adjustment') NOT NULL,
  `handoverToShiftId` int DEFAULT NULL,
  `openingCash` decimal(14,2) NOT NULL DEFAULT '0.00',
  `totalSales` decimal(14,2) NOT NULL DEFAULT '0.00',
  `totalOtherIncome` decimal(14,2) NOT NULL DEFAULT '0.00',
  `totalPurchases` decimal(14,2) NOT NULL DEFAULT '0.00',
  `totalOtherExpense` decimal(14,2) NOT NULL DEFAULT '0.00',
  `expectedCash` decimal(14,2) NOT NULL DEFAULT '0.00',
  `countedCash` decimal(14,2) NOT NULL DEFAULT '0.00',
  `differenceAmount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `differenceReason` text,
  `notes` text,
  `handedOverByResidentId` int DEFAULT NULL,
  `receivedByResidentId` int DEFAULT NULL,
  `handedOverAt` timestamp NULL DEFAULT NULL,
  `receivedAt` timestamp NULL DEFAULT NULL,
  `giverSignedAt` timestamp NULL DEFAULT NULL,
  `receiverSignedAt` timestamp NULL DEFAULT NULL,
  `status` enum('draft','giver_signed','receiver_signed','completed','cancelled') NOT NULL DEFAULT 'draft',
  `createdBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `storeShiftHandovers_shift_idx` (`storeShiftId`),
  KEY `storeShiftHandovers_receiver_shift_idx` (`handoverToShiftId`),
  KEY `storeShiftHandovers_status_idx` (`status`),
  KEY `storeShiftHandovers_handed_over_resident_fk` (`handedOverByResidentId`),
  KEY `storeShiftHandovers_received_resident_fk` (`receivedByResidentId`),
  KEY `storeShiftHandovers_created_by_fk` (`createdBy`),
  CONSTRAINT `storeShiftHandovers_created_by_fk` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `storeShiftHandovers_handed_over_resident_fk` FOREIGN KEY (`handedOverByResidentId`) REFERENCES `residents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `storeShiftHandovers_received_resident_fk` FOREIGN KEY (`receivedByResidentId`) REFERENCES `residents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `storeShiftHandovers_receiver_shift_fk` FOREIGN KEY (`handoverToShiftId`) REFERENCES `storeshifts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `storeShiftHandovers_shift_fk` FOREIGN KEY (`storeShiftId`) REFERENCES `storeshifts` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storeshifthandovers`
--

LOCK TABLES `storeshifthandovers` WRITE;
/*!40000 ALTER TABLE `storeshifthandovers` DISABLE KEYS */;
/*!40000 ALTER TABLE `storeshifthandovers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storeshifts`
--

DROP TABLE IF EXISTS `storeshifts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storeshifts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `storeDutyAssignmentId` int NOT NULL,
  `ledgerId` int NOT NULL,
  `shiftDate` date NOT NULL,
  `shiftType` enum('morning','afternoon') NOT NULL,
  `scheduledFrom` timestamp NOT NULL,
  `scheduledTo` timestamp NOT NULL,
  `accessValidFrom` timestamp NOT NULL,
  `accessValidUntil` timestamp NOT NULL,
  `primaryResidentId` int DEFAULT NULL,
  `openingCash` decimal(14,2) NOT NULL DEFAULT '0.00',
  `expectedClosingCash` decimal(14,2) NOT NULL DEFAULT '0.00',
  `countedClosingCash` decimal(14,2) DEFAULT NULL,
  `cashDifference` decimal(14,2) NOT NULL DEFAULT '0.00',
  `status` enum('scheduled','access_issued','opened','in_progress','handover_pending','handed_over','closing_pending','closed','reviewed','confirmed','expired','closing_overdue','cancelled') NOT NULL DEFAULT 'scheduled',
  `openedAt` timestamp NULL DEFAULT NULL,
  `handedOverAt` timestamp NULL DEFAULT NULL,
  `closedAt` timestamp NULL DEFAULT NULL,
  `closedBy` int DEFAULT NULL,
  `reviewedBy` int DEFAULT NULL,
  `reviewedAt` timestamp NULL DEFAULT NULL,
  `confirmedBy` int DEFAULT NULL,
  `confirmedAt` timestamp NULL DEFAULT NULL,
  `notes` text,
  `createdBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `storeShifts_assignment_unique` (`storeDutyAssignmentId`),
  UNIQUE KEY `storeShifts_ledger_date_shift_unique` (`ledgerId`,`shiftDate`,`shiftType`),
  KEY `storeShifts_primary_resident_idx` (`primaryResidentId`),
  KEY `storeShifts_access_window_idx` (`accessValidFrom`,`accessValidUntil`),
  KEY `storeShifts_status_idx` (`status`),
  KEY `storeShifts_closed_by_fk` (`closedBy`),
  KEY `storeShifts_reviewed_by_fk` (`reviewedBy`),
  KEY `storeShifts_confirmed_by_fk` (`confirmedBy`),
  KEY `storeShifts_created_by_fk` (`createdBy`),
  CONSTRAINT `storeShifts_assignment_fk` FOREIGN KEY (`storeDutyAssignmentId`) REFERENCES `storedutyassignments` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `storeShifts_closed_by_fk` FOREIGN KEY (`closedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `storeShifts_confirmed_by_fk` FOREIGN KEY (`confirmedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `storeShifts_created_by_fk` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `storeShifts_ledger_fk` FOREIGN KEY (`ledgerId`) REFERENCES `storeledgers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `storeShifts_primary_resident_fk` FOREIGN KEY (`primaryResidentId`) REFERENCES `residents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `storeShifts_reviewed_by_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storeshifts`
--

LOCK TABLES `storeshifts` WRITE;
/*!40000 ALTER TABLE `storeshifts` DISABLE KEYS */;
/*!40000 ALTER TABLE `storeshifts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storestockmovements`
--

DROP TABLE IF EXISTS `storestockmovements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storestockmovements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `transactionId` int DEFAULT NULL,
  `documentId` int DEFAULT NULL,
  `documentLineId` int DEFAULT NULL,
  `movementType` enum('purchase','production_in','self_supply_in','other_in','sale','adjustment_in','adjustment_out','return') NOT NULL,
  `movementDate` date NOT NULL,
  `quantityIn` decimal(14,2) NOT NULL DEFAULT '0.00',
  `quantityOut` decimal(14,2) NOT NULL DEFAULT '0.00',
  `unitCost` decimal(14,2) NOT NULL DEFAULT '0.00',
  `note` text,
  `createdBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `storeStockMovements_product_idx` (`productId`),
  KEY `storeStockMovements_transaction_idx` (`transactionId`),
  KEY `storeStockMovements_date_idx` (`movementDate`),
  KEY `storeStockMovements_type_idx` (`movementType`),
  KEY `storeStockMovements_document_idx` (`documentId`),
  KEY `storeStockMovements_document_line_idx` (`documentLineId`),
  CONSTRAINT `storeStockMovements_document_fk` FOREIGN KEY (`documentId`) REFERENCES `storedocuments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `storeStockMovements_document_line_fk` FOREIGN KEY (`documentLineId`) REFERENCES `storedocumentlines` (`id`) ON DELETE SET NULL,
  CONSTRAINT `storeStockMovements_product_fk` FOREIGN KEY (`productId`) REFERENCES `storeproducts` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `storeStockMovements_transaction_fk` FOREIGN KEY (`transactionId`) REFERENCES `storeledgertransactions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storestockmovements`
--

LOCK TABLES `storestockmovements` WRITE;
/*!40000 ALTER TABLE `storestockmovements` DISABLE KEYS */;
/*!40000 ALTER TABLE `storestockmovements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `taskassignments`
--

DROP TABLE IF EXISTS `taskassignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `taskassignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `taskTypeId` int NOT NULL,
  `residentId` int NOT NULL,
  `assignmentDate` date NOT NULL,
  `dueDate` date NOT NULL,
  `status` enum('pending','in_progress','completed','overdue','cancelled') NOT NULL DEFAULT 'pending',
  `completionDate` timestamp NULL DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `assignedBy` int NOT NULL,
  `verifiedBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `taskAssignments_taskTypeId_taskTypes_id_fk` (`taskTypeId`),
  KEY `taskAssignments_residentId_residents_id_fk` (`residentId`),
  KEY `taskAssignments_assignedBy_users_id_fk` (`assignedBy`),
  KEY `taskAssignments_verifiedBy_users_id_fk` (`verifiedBy`),
  CONSTRAINT `taskAssignments_assignedBy_users_id_fk` FOREIGN KEY (`assignedBy`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `taskAssignments_residentId_residents_id_fk` FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `taskAssignments_taskTypeId_taskTypes_id_fk` FOREIGN KEY (`taskTypeId`) REFERENCES `tasktypes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `taskAssignments_verifiedBy_users_id_fk` FOREIGN KEY (`verifiedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `taskassignments`
--

LOCK TABLES `taskassignments` WRITE;
/*!40000 ALTER TABLE `taskassignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `taskassignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasktypes`
--

DROP TABLE IF EXISTS `tasktypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasktypes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `estimatedHours` decimal(5,2) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasktypes`
--

LOCK TABLES `tasktypes` WRITE;
/*!40000 ALTER TABLE `tasktypes` DISABLE KEYS */;
/*!40000 ALTER TABLE `tasktypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userroles`
--

DROP TABLE IF EXISTS `userroles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userroles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `roleId` int NOT NULL,
  `isPrimary` tinyint(1) NOT NULL DEFAULT '0',
  `assignedBy` int DEFAULT NULL,
  `assignedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_userRoles_user_role` (`userId`,`roleId`),
  KEY `idx_userRoles_userId` (`userId`),
  KEY `idx_userRoles_roleId` (`roleId`),
  KEY `idx_userRoles_assignedBy` (`assignedBy`),
  CONSTRAINT `fk_userRoles_assignedBy` FOREIGN KEY (`assignedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_userRoles_role` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_userRoles_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=149 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userroles`
--

LOCK TABLES `userroles` WRITE;
/*!40000 ALTER TABLE `userroles` DISABLE KEYS */;
INSERT INTO `userroles` VALUES (1,1,1,1,NULL,'2026-06-02 15:26:09'),(148,35,2,1,1,'2026-07-27 06:33:08');
/*!40000 ALTER TABLE `userroles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `name` text,
  `email` varchar(320) DEFAULT NULL,
  `role` enum('user','admin','manager','supervisor','accountant','resident') NOT NULL DEFAULT 'user',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `mustChangePassword` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$9owmk6DqDlnigue0gt2gLuE7Bvv/7RwO.g1LdU1T8aRXoGt9SdFJK','Trần Thu Giang',NULL,'manager',1,0,'2026-05-27 14:23:55','2026-07-27 06:38:20','2026-07-26 23:38:21'),(35,'thu.nguyen','$2b$10$Bh/JYiJEcdf66jpGWwT/ju2c95GR/J9jKcN4TRbr3BJlscfvWTBKe','Nguyễn Văn Kiểm Thử',NULL,'resident',1,1,'2026-07-27 06:33:08','2026-07-27 06:33:08',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'residence_care'
--

--
-- Dumping routines for database 'residence_care'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-27 13:41:44
