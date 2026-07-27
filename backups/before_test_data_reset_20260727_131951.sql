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
INSERT INTO `daily_routines` VALUES (1,'2026-06-04','05:30:00','05:50:00','Thức dậy và cầu nguyện sáng',NULL,'Nhà nguyện','spiritual','Ban phụng vụ',1,1,'daily',1,'all',NULL,'pending',NULL,NULL,NULL,'2026-06-04 22:04:29','2026-06-04 22:04:29'),(2,'2026-06-04','06:00:00','06:30:00','Ăn sáng',NULL,'Nhà ăn','meal','Tổ trực',1,2,'daily',1,'all',NULL,'pending',NULL,NULL,NULL,'2026-06-04 22:04:29','2026-06-04 22:04:29'),(3,'2026-06-04','07:00:00','16:30:00','Đi học / học tập tại trường',NULL,'Trường học','study','Học viên',1,3,'daily',1,'all',NULL,'pending',NULL,NULL,NULL,'2026-06-04 22:04:29','2026-06-04 22:04:29'),(4,'2026-06-04','19:00:00','20:30:00','Giờ học buổi tối',NULL,'Phòng học chung','study','Ban học tập',1,4,'daily',1,'all',NULL,'pending',NULL,NULL,NULL,'2026-06-04 22:04:29','2026-06-04 22:04:29'),(5,'2026-06-04','22:00:00','22:15:00','Ổn định phòng và nghỉ đêm',NULL,'Khu phòng ở','rest','Tổ trưởng',1,5,'daily',1,'all',NULL,'pending',NULL,NULL,NULL,'2026-06-04 22:04:29','2026-06-04 22:04:29');
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
INSERT INTO `dutyassignments` VALUES (110,16,NULL,31,'resident',31,'2026-06-22','2026-06-21 22:00:00','2026-06-21 22:45:00','completed','2026-06-22 15:57:00',NULL,NULL,'2026-06-22 22:47:42','2026-06-22 22:57:00'),(111,15,NULL,25,'resident',25,'2026-06-21','2026-06-20 21:30:00','2026-06-20 22:00:00','pending',NULL,NULL,NULL,'2026-06-22 22:51:51','2026-06-22 22:51:51'),(112,15,NULL,25,'resident',25,'2026-06-22','2026-06-21 21:30:00','2026-06-21 22:00:00','completed','2026-06-22 15:56:55',NULL,NULL,'2026-06-22 22:51:51','2026-06-22 22:56:54'),(113,15,NULL,25,'resident',25,'2026-06-23','2026-06-22 21:30:00','2026-06-22 22:00:00','completed','2026-06-22 16:05:57',NULL,NULL,'2026-06-22 22:51:51','2026-06-22 23:05:57'),(114,15,NULL,25,'resident',25,'2026-06-24','2026-06-23 21:30:00','2026-06-23 22:00:00','completed','2026-06-23 16:28:59',NULL,NULL,'2026-06-22 22:51:51','2026-06-23 23:28:58'),(115,15,NULL,25,'resident',25,'2026-06-25','2026-06-24 21:30:00','2026-06-24 22:00:00','pending',NULL,NULL,NULL,'2026-06-22 22:51:51','2026-06-22 22:51:51'),(116,15,NULL,25,'resident',25,'2026-06-26','2026-06-25 21:30:00','2026-06-25 22:00:00','pending',NULL,NULL,NULL,'2026-06-22 22:51:52','2026-06-22 22:51:52'),(117,15,NULL,25,'resident',25,'2026-06-27','2026-06-26 21:30:00','2026-06-26 22:00:00','pending',NULL,NULL,NULL,'2026-06-22 22:51:52','2026-06-22 22:51:52'),(118,16,NULL,18,'resident',18,'2026-06-21','2026-06-20 22:00:00','2026-06-20 22:45:00','pending',NULL,NULL,NULL,'2026-06-22 22:52:16','2026-06-22 22:52:16'),(119,16,NULL,18,'resident',18,'2026-06-22','2026-06-21 22:00:00','2026-06-21 22:45:00','completed','2026-06-22 15:57:01',NULL,NULL,'2026-06-22 22:52:16','2026-06-22 22:57:01'),(120,16,NULL,18,'resident',18,'2026-06-24','2026-06-23 22:00:00','2026-06-23 22:45:00','completed','2026-06-23 16:28:58',NULL,NULL,'2026-06-22 22:52:16','2026-06-23 23:28:57'),(121,16,NULL,18,'resident',18,'2026-06-25','2026-06-24 22:00:00','2026-06-24 22:45:00','pending',NULL,NULL,NULL,'2026-06-22 22:52:16','2026-06-22 22:52:16'),(122,16,NULL,18,'resident',18,'2026-06-26','2026-06-25 22:00:00','2026-06-25 22:45:00','pending',NULL,NULL,NULL,'2026-06-22 22:52:16','2026-06-22 22:52:16'),(123,16,NULL,18,'resident',18,'2026-06-27','2026-06-26 22:00:00','2026-06-26 22:45:00','pending',NULL,NULL,NULL,'2026-06-22 22:52:16','2026-06-22 22:52:16'),(124,16,NULL,32,'resident',32,'2026-06-23','2026-06-22 22:00:00','2026-06-22 22:45:00','completed','2026-06-22 16:05:59',NULL,NULL,'2026-06-22 22:52:58','2026-06-22 23:05:59'),(125,15,NULL,27,'resident',27,'2026-06-21','2026-06-20 21:30:00','2026-06-20 22:00:00','pending',NULL,NULL,NULL,'2026-06-22 22:53:23','2026-06-22 22:53:23'),(126,15,NULL,27,'resident',27,'2026-06-22','2026-06-21 21:30:00','2026-06-21 22:00:00','completed','2026-06-22 15:56:58',NULL,NULL,'2026-06-22 22:53:23','2026-06-22 22:56:57'),(127,15,NULL,27,'resident',27,'2026-06-23','2026-06-22 21:30:00','2026-06-22 22:00:00','completed','2026-06-22 16:05:58',NULL,NULL,'2026-06-22 22:53:23','2026-06-22 23:05:57'),(128,15,NULL,27,'resident',27,'2026-06-24','2026-06-23 21:30:00','2026-06-23 22:00:00','completed','2026-06-23 16:28:59',NULL,NULL,'2026-06-22 22:53:23','2026-06-23 23:28:58'),(129,15,NULL,27,'resident',27,'2026-06-25','2026-06-24 21:30:00','2026-06-24 22:00:00','pending',NULL,NULL,NULL,'2026-06-22 22:53:23','2026-06-22 22:53:23'),(130,15,NULL,27,'resident',27,'2026-06-26','2026-06-25 21:30:00','2026-06-25 22:00:00','pending',NULL,NULL,NULL,'2026-06-22 22:53:23','2026-06-22 22:53:23'),(131,15,NULL,27,'resident',27,'2026-06-27','2026-06-26 21:30:00','2026-06-26 22:00:00','pending',NULL,NULL,NULL,'2026-06-22 22:53:23','2026-06-22 22:53:23'),(132,17,NULL,18,'resident',18,'2026-06-21','2026-06-21 00:00:00','2026-06-21 00:30:00','pending',NULL,NULL,NULL,'2026-06-22 22:54:30','2026-06-22 22:54:30'),(133,17,NULL,18,'resident',18,'2026-06-22','2026-06-22 00:00:00','2026-06-22 00:30:00','cancelled',NULL,NULL,'Hủy từ màn hình sinh hoạt hằng ngày','2026-06-22 22:54:30','2026-06-22 22:54:43'),(134,17,NULL,18,'resident',18,'2026-06-23','2026-06-23 00:00:00','2026-06-23 00:30:00','completed','2026-06-22 16:06:00',NULL,NULL,'2026-06-22 22:54:30','2026-06-22 23:05:59'),(135,17,NULL,18,'resident',18,'2026-06-24','2026-06-24 00:00:00','2026-06-24 00:30:00','completed','2026-06-23 16:29:07',NULL,NULL,'2026-06-22 22:54:30','2026-06-23 23:29:06'),(136,17,NULL,18,'resident',18,'2026-06-25','2026-06-25 00:00:00','2026-06-25 00:30:00','pending',NULL,NULL,NULL,'2026-06-22 22:54:30','2026-06-22 22:54:30'),(137,17,NULL,18,'resident',18,'2026-06-26','2026-06-26 00:00:00','2026-06-26 00:30:00','pending',NULL,NULL,NULL,'2026-06-22 22:54:30','2026-06-22 22:54:30'),(138,17,NULL,18,'resident',18,'2026-06-27','2026-06-27 00:00:00','2026-06-27 00:30:00','pending',NULL,NULL,NULL,'2026-06-22 22:54:30','2026-06-22 22:54:30'),(139,17,NULL,28,'resident',28,'2026-06-21','2026-06-21 00:00:00','2026-06-21 00:30:00','pending',NULL,NULL,NULL,'2026-06-22 22:56:22','2026-06-22 22:56:22'),(140,17,NULL,28,'resident',28,'2026-06-22','2026-06-22 00:00:00','2026-06-22 00:30:00','completed','2026-06-22 15:57:03',NULL,NULL,'2026-06-22 22:56:23','2026-06-22 22:57:02'),(141,17,NULL,28,'resident',28,'2026-06-23','2026-06-23 00:00:00','2026-06-23 00:30:00','completed','2026-06-22 16:06:04',NULL,NULL,'2026-06-22 22:56:23','2026-06-22 23:06:04'),(142,17,NULL,28,'resident',28,'2026-06-24','2026-06-24 00:00:00','2026-06-24 00:30:00','completed','2026-06-23 16:29:07',NULL,NULL,'2026-06-22 22:56:23','2026-06-23 23:29:06'),(143,17,NULL,28,'resident',28,'2026-06-25','2026-06-25 00:00:00','2026-06-25 00:30:00','pending',NULL,NULL,NULL,'2026-06-22 22:56:23','2026-06-22 22:56:23'),(144,17,NULL,28,'resident',28,'2026-06-26','2026-06-26 00:00:00','2026-06-26 00:30:00','pending',NULL,NULL,NULL,'2026-06-22 22:56:23','2026-06-22 22:56:23'),(145,17,NULL,28,'resident',28,'2026-06-27','2026-06-27 00:00:00','2026-06-27 00:30:00','pending',NULL,NULL,NULL,'2026-06-22 22:56:23','2026-06-22 22:56:23'),(146,19,NULL,33,'resident',33,'2026-06-21','2026-06-21 03:00:00','2026-06-21 03:45:00','pending',NULL,NULL,NULL,'2026-06-22 22:56:42','2026-06-22 22:56:42'),(147,19,NULL,33,'resident',33,'2026-06-22','2026-06-22 03:00:00','2026-06-22 03:45:00','completed','2026-06-23 16:22:37',NULL,NULL,'2026-06-22 22:56:42','2026-06-23 23:22:36'),(148,19,NULL,33,'resident',33,'2026-06-23','2026-06-23 03:00:00','2026-06-23 03:45:00','pending',NULL,NULL,NULL,'2026-06-22 22:56:42','2026-06-22 22:56:42'),(149,19,NULL,33,'resident',33,'2026-06-24','2026-06-24 03:00:00','2026-06-24 03:45:00','completed','2026-06-24 06:51:21',NULL,NULL,'2026-06-22 22:56:42','2026-06-24 13:51:21'),(150,19,NULL,33,'resident',33,'2026-06-25','2026-06-25 03:00:00','2026-06-25 03:45:00','pending',NULL,NULL,NULL,'2026-06-22 22:56:42','2026-06-22 22:56:42'),(151,19,NULL,33,'resident',33,'2026-06-26','2026-06-26 03:00:00','2026-06-26 03:45:00','pending',NULL,NULL,NULL,'2026-06-22 22:56:42','2026-06-22 22:56:42'),(152,19,NULL,33,'resident',33,'2026-06-27','2026-06-27 03:00:00','2026-06-27 03:45:00','pending',NULL,NULL,NULL,'2026-06-22 22:56:42','2026-06-22 22:56:42'),(153,17,NULL,24,'resident',24,'2026-06-22','2026-06-22 00:00:00','2026-06-22 00:30:00','completed','2026-06-22 15:57:53',NULL,NULL,'2026-06-22 22:57:49','2026-06-22 22:57:53'),(154,19,NULL,24,'resident',24,'2026-06-21','2026-06-21 03:00:00','2026-06-21 03:45:00','pending',NULL,NULL,NULL,'2026-06-22 23:10:37','2026-06-22 23:10:37'),(155,19,NULL,24,'resident',24,'2026-06-22','2026-06-22 03:00:00','2026-06-22 03:45:00','completed','2026-06-23 16:22:38',NULL,NULL,'2026-06-22 23:10:37','2026-06-23 23:22:37'),(156,19,NULL,24,'resident',24,'2026-06-23','2026-06-23 03:00:00','2026-06-23 03:45:00','pending',NULL,NULL,NULL,'2026-06-22 23:10:37','2026-06-22 23:10:37'),(157,19,NULL,24,'resident',24,'2026-06-24','2026-06-24 03:00:00','2026-06-24 03:45:00','completed','2026-06-24 06:51:21',NULL,NULL,'2026-06-22 23:10:37','2026-06-24 13:51:21'),(158,19,NULL,24,'resident',24,'2026-06-25','2026-06-25 03:00:00','2026-06-25 03:45:00','pending',NULL,NULL,NULL,'2026-06-22 23:10:37','2026-06-22 23:10:37'),(159,19,NULL,24,'resident',24,'2026-06-26','2026-06-26 03:00:00','2026-06-26 03:45:00','pending',NULL,NULL,NULL,'2026-06-22 23:10:37','2026-06-22 23:10:37'),(160,19,NULL,24,'resident',24,'2026-06-27','2026-06-27 03:00:00','2026-06-27 03:45:00','pending',NULL,NULL,NULL,'2026-06-22 23:10:37','2026-06-22 23:10:37'),(161,20,NULL,34,'resident',34,'2026-06-21','2026-06-21 05:00:00','2026-06-21 05:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:11:43','2026-06-22 23:11:43'),(162,20,NULL,23,'resident',23,'2026-06-21','2026-06-21 05:00:00','2026-06-21 05:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:11:43','2026-06-22 23:11:43'),(163,20,NULL,34,'resident',34,'2026-06-22','2026-06-22 05:00:00','2026-06-22 05:30:00','completed','2026-06-23 16:22:39',NULL,NULL,'2026-06-22 23:11:43','2026-06-23 23:22:39'),(164,20,NULL,23,'resident',23,'2026-06-22','2026-06-22 05:00:00','2026-06-22 05:30:00','completed','2026-06-23 16:22:40',NULL,NULL,'2026-06-22 23:11:43','2026-06-23 23:22:39'),(165,20,NULL,34,'resident',34,'2026-06-23','2026-06-23 05:00:00','2026-06-23 05:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:11:43','2026-06-22 23:11:43'),(166,20,NULL,23,'resident',23,'2026-06-23','2026-06-23 05:00:00','2026-06-23 05:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:11:43','2026-06-22 23:11:43'),(167,20,NULL,34,'resident',34,'2026-06-24','2026-06-24 05:00:00','2026-06-24 05:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:11:43','2026-06-22 23:11:43'),(168,20,NULL,23,'resident',23,'2026-06-24','2026-06-24 05:00:00','2026-06-24 05:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:11:43','2026-06-22 23:11:43'),(169,20,NULL,34,'resident',34,'2026-06-25','2026-06-25 05:00:00','2026-06-25 05:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:11:43','2026-06-22 23:11:43'),(170,20,NULL,23,'resident',23,'2026-06-25','2026-06-25 05:00:00','2026-06-25 05:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:11:43','2026-06-22 23:11:43'),(171,20,NULL,34,'resident',34,'2026-06-26','2026-06-26 05:00:00','2026-06-26 05:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:11:43','2026-06-22 23:11:43'),(172,20,NULL,23,'resident',23,'2026-06-26','2026-06-26 05:00:00','2026-06-26 05:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:11:43','2026-06-22 23:11:43'),(173,20,NULL,34,'resident',34,'2026-06-27','2026-06-27 05:00:00','2026-06-27 05:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:11:43','2026-06-22 23:11:43'),(174,20,NULL,23,'resident',23,'2026-06-27','2026-06-27 05:00:00','2026-06-27 05:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:11:43','2026-06-22 23:11:43'),(175,22,NULL,25,'resident',25,'2026-06-21','2026-06-21 09:00:00','2026-06-21 09:45:00','pending',NULL,NULL,NULL,'2026-06-22 23:12:03','2026-06-22 23:12:03'),(176,22,NULL,24,'resident',24,'2026-06-21','2026-06-21 09:00:00','2026-06-21 09:45:00','pending',NULL,NULL,NULL,'2026-06-22 23:12:03','2026-06-22 23:12:03'),(177,22,NULL,25,'resident',25,'2026-06-22','2026-06-22 09:00:00','2026-06-22 09:45:00','completed','2026-06-23 16:22:40',NULL,NULL,'2026-06-22 23:12:03','2026-06-23 23:22:40'),(178,22,NULL,24,'resident',24,'2026-06-22','2026-06-22 09:00:00','2026-06-22 09:45:00','completed','2026-06-23 16:22:42',NULL,NULL,'2026-06-22 23:12:03','2026-06-23 23:22:41'),(179,22,NULL,25,'resident',25,'2026-06-23','2026-06-23 09:00:00','2026-06-23 09:45:00','pending',NULL,NULL,NULL,'2026-06-22 23:12:03','2026-06-22 23:12:03'),(180,22,NULL,24,'resident',24,'2026-06-23','2026-06-23 09:00:00','2026-06-23 09:45:00','pending',NULL,NULL,NULL,'2026-06-22 23:12:03','2026-06-22 23:12:03'),(181,22,NULL,25,'resident',25,'2026-06-24','2026-06-24 09:00:00','2026-06-24 09:45:00','pending',NULL,NULL,NULL,'2026-06-22 23:12:03','2026-06-22 23:12:03'),(182,22,NULL,24,'resident',24,'2026-06-24','2026-06-24 09:00:00','2026-06-24 09:45:00','pending',NULL,NULL,NULL,'2026-06-22 23:12:03','2026-06-22 23:12:03'),(183,22,NULL,25,'resident',25,'2026-06-25','2026-06-25 09:00:00','2026-06-25 09:45:00','pending',NULL,NULL,NULL,'2026-06-22 23:12:03','2026-06-22 23:12:03'),(184,22,NULL,24,'resident',24,'2026-06-25','2026-06-25 09:00:00','2026-06-25 09:45:00','pending',NULL,NULL,NULL,'2026-06-22 23:12:03','2026-06-22 23:12:03'),(185,22,NULL,25,'resident',25,'2026-06-26','2026-06-26 09:00:00','2026-06-26 09:45:00','pending',NULL,NULL,NULL,'2026-06-22 23:12:03','2026-06-22 23:12:03'),(186,22,NULL,24,'resident',24,'2026-06-26','2026-06-26 09:00:00','2026-06-26 09:45:00','pending',NULL,NULL,NULL,'2026-06-22 23:12:03','2026-06-22 23:12:03'),(187,22,NULL,25,'resident',25,'2026-06-27','2026-06-27 09:00:00','2026-06-27 09:45:00','pending',NULL,NULL,NULL,'2026-06-22 23:12:03','2026-06-22 23:12:03'),(188,22,NULL,24,'resident',24,'2026-06-27','2026-06-27 09:00:00','2026-06-27 09:45:00','pending',NULL,NULL,NULL,'2026-06-22 23:12:03','2026-06-22 23:12:03'),(189,23,NULL,22,'resident',22,'2026-06-23','2026-06-23 11:00:00','2026-06-23 11:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:15:02','2026-06-22 23:15:02'),(190,23,NULL,31,'resident',31,'2026-06-23','2026-06-23 11:00:00','2026-06-23 11:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:15:02','2026-06-22 23:15:02'),(191,23,NULL,22,'resident',22,'2026-06-24','2026-06-24 11:00:00','2026-06-24 11:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:15:02','2026-06-22 23:15:02'),(192,23,NULL,31,'resident',31,'2026-06-24','2026-06-24 11:00:00','2026-06-24 11:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:15:02','2026-06-22 23:15:02'),(193,23,NULL,22,'resident',22,'2026-06-25','2026-06-25 11:00:00','2026-06-25 11:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:15:02','2026-06-22 23:15:02'),(194,23,NULL,31,'resident',31,'2026-06-25','2026-06-25 11:00:00','2026-06-25 11:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:15:02','2026-06-22 23:15:02'),(195,23,NULL,22,'resident',22,'2026-06-26','2026-06-26 11:00:00','2026-06-26 11:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:15:02','2026-06-22 23:15:02'),(196,23,NULL,31,'resident',31,'2026-06-26','2026-06-26 11:00:00','2026-06-26 11:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:15:02','2026-06-22 23:15:02'),(197,23,NULL,22,'resident',22,'2026-06-27','2026-06-27 11:00:00','2026-06-27 11:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:15:02','2026-06-22 23:15:02'),(198,23,NULL,31,'resident',31,'2026-06-27','2026-06-27 11:00:00','2026-06-27 11:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:15:02','2026-06-22 23:15:02'),(199,23,NULL,22,'resident',22,'2026-06-28','2026-06-28 11:00:00','2026-06-28 11:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:15:02','2026-06-22 23:15:02'),(200,23,NULL,31,'resident',31,'2026-06-28','2026-06-28 11:00:00','2026-06-28 11:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:15:02','2026-06-22 23:15:02'),(201,23,NULL,22,'resident',22,'2026-06-29','2026-06-29 11:00:00','2026-06-29 11:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:15:02','2026-06-22 23:15:02'),(202,23,NULL,31,'resident',31,'2026-06-29','2026-06-29 11:00:00','2026-06-29 11:30:00','pending',NULL,NULL,NULL,'2026-06-22 23:15:02','2026-06-22 23:15:02'),(203,24,NULL,20,'resident',20,'2026-06-23','2026-06-23 01:00:00','2026-06-23 05:00:00','pending',NULL,NULL,NULL,'2026-06-22 23:26:40','2026-06-22 23:26:40'),(204,24,NULL,21,'resident',21,'2026-06-23','2026-06-23 01:00:00','2026-06-23 05:00:00','pending',NULL,NULL,NULL,'2026-06-22 23:26:40','2026-06-22 23:26:40'),(205,24,NULL,20,'resident',20,'2026-06-24','2026-06-24 01:00:00','2026-06-24 05:00:00','completed','2026-06-24 06:51:18',NULL,NULL,'2026-06-22 23:26:40','2026-06-24 13:51:18'),(206,24,NULL,21,'resident',21,'2026-06-24','2026-06-24 01:00:00','2026-06-24 05:00:00','completed','2026-06-24 06:51:18',NULL,NULL,'2026-06-22 23:26:40','2026-06-24 13:51:18'),(207,24,NULL,20,'resident',20,'2026-06-25','2026-06-25 01:00:00','2026-06-25 05:00:00','pending',NULL,NULL,NULL,'2026-06-22 23:26:40','2026-06-22 23:26:40'),(208,24,NULL,21,'resident',21,'2026-06-25','2026-06-25 01:00:00','2026-06-25 05:00:00','pending',NULL,NULL,NULL,'2026-06-22 23:26:40','2026-06-22 23:26:40'),(209,24,NULL,20,'resident',20,'2026-06-26','2026-06-26 01:00:00','2026-06-26 05:00:00','pending',NULL,NULL,NULL,'2026-06-22 23:26:40','2026-06-22 23:26:40'),(210,24,NULL,21,'resident',21,'2026-06-26','2026-06-26 01:00:00','2026-06-26 05:00:00','pending',NULL,NULL,NULL,'2026-06-22 23:26:40','2026-06-22 23:26:40'),(211,24,NULL,20,'resident',20,'2026-06-27','2026-06-27 01:00:00','2026-06-27 05:00:00','pending',NULL,NULL,NULL,'2026-06-22 23:26:40','2026-06-22 23:26:40'),(212,24,NULL,21,'resident',21,'2026-06-27','2026-06-27 01:00:00','2026-06-27 05:00:00','pending',NULL,NULL,NULL,'2026-06-22 23:26:40','2026-06-22 23:26:40'),(213,24,NULL,20,'resident',20,'2026-06-28','2026-06-28 01:00:00','2026-06-28 05:00:00','pending',NULL,NULL,NULL,'2026-06-22 23:26:40','2026-06-22 23:26:40'),(214,24,NULL,21,'resident',21,'2026-06-28','2026-06-28 01:00:00','2026-06-28 05:00:00','pending',NULL,NULL,NULL,'2026-06-22 23:26:40','2026-06-22 23:26:40'),(215,24,NULL,20,'resident',20,'2026-06-29','2026-06-29 01:00:00','2026-06-29 05:00:00','pending',NULL,NULL,NULL,'2026-06-22 23:26:40','2026-06-22 23:26:40'),(216,24,NULL,21,'resident',21,'2026-06-29','2026-06-29 01:00:00','2026-06-29 05:00:00','pending',NULL,NULL,NULL,'2026-06-22 23:26:40','2026-06-22 23:26:40'),(217,27,NULL,29,'resident',29,'2026-06-27','2026-06-27 01:00:00','2026-06-27 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(218,27,NULL,30,'resident',30,'2026-06-27','2026-06-27 01:00:00','2026-06-27 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(219,27,NULL,19,'resident',19,'2026-06-27','2026-06-27 01:00:00','2026-06-27 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(220,27,NULL,32,'resident',32,'2026-06-27','2026-06-27 01:00:00','2026-06-27 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(221,27,NULL,29,'resident',29,'2026-06-29','2026-06-29 01:00:00','2026-06-29 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(222,27,NULL,30,'resident',30,'2026-06-29','2026-06-29 01:00:00','2026-06-29 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(223,27,NULL,19,'resident',19,'2026-06-29','2026-06-29 01:00:00','2026-06-29 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(224,27,NULL,32,'resident',32,'2026-06-29','2026-06-29 01:00:00','2026-06-29 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(225,27,NULL,29,'resident',29,'2026-07-04','2026-07-04 01:00:00','2026-07-04 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(226,27,NULL,30,'resident',30,'2026-07-04','2026-07-04 01:00:00','2026-07-04 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(227,27,NULL,19,'resident',19,'2026-07-04','2026-07-04 01:00:00','2026-07-04 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(228,27,NULL,32,'resident',32,'2026-07-04','2026-07-04 01:00:00','2026-07-04 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(229,27,NULL,29,'resident',29,'2026-07-06','2026-07-06 01:00:00','2026-07-06 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(230,27,NULL,30,'resident',30,'2026-07-06','2026-07-06 01:00:00','2026-07-06 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(231,27,NULL,19,'resident',19,'2026-07-06','2026-07-06 01:00:00','2026-07-06 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(232,27,NULL,32,'resident',32,'2026-07-06','2026-07-06 01:00:00','2026-07-06 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(233,27,NULL,29,'resident',29,'2026-07-11','2026-07-11 01:00:00','2026-07-11 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(234,27,NULL,30,'resident',30,'2026-07-11','2026-07-11 01:00:00','2026-07-11 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(235,27,NULL,19,'resident',19,'2026-07-11','2026-07-11 01:00:00','2026-07-11 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(236,27,NULL,32,'resident',32,'2026-07-11','2026-07-11 01:00:00','2026-07-11 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(237,27,NULL,29,'resident',29,'2026-07-13','2026-07-13 01:00:00','2026-07-13 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(238,27,NULL,30,'resident',30,'2026-07-13','2026-07-13 01:00:00','2026-07-13 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(239,27,NULL,19,'resident',19,'2026-07-13','2026-07-13 01:00:00','2026-07-13 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(240,27,NULL,32,'resident',32,'2026-07-13','2026-07-13 01:00:00','2026-07-13 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(241,27,NULL,29,'resident',29,'2026-07-18','2026-07-18 01:00:00','2026-07-18 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(242,27,NULL,30,'resident',30,'2026-07-18','2026-07-18 01:00:00','2026-07-18 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(243,27,NULL,19,'resident',19,'2026-07-18','2026-07-18 01:00:00','2026-07-18 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(244,27,NULL,32,'resident',32,'2026-07-18','2026-07-18 01:00:00','2026-07-18 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(245,27,NULL,29,'resident',29,'2026-07-20','2026-07-20 01:00:00','2026-07-20 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(246,27,NULL,30,'resident',30,'2026-07-20','2026-07-20 01:00:00','2026-07-20 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(247,27,NULL,19,'resident',19,'2026-07-20','2026-07-20 01:00:00','2026-07-20 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(248,27,NULL,32,'resident',32,'2026-07-20','2026-07-20 01:00:00','2026-07-20 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(249,27,NULL,29,'resident',29,'2026-07-25','2026-07-25 01:00:00','2026-07-25 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(250,27,NULL,30,'resident',30,'2026-07-25','2026-07-25 01:00:00','2026-07-25 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(251,27,NULL,19,'resident',19,'2026-07-25','2026-07-25 01:00:00','2026-07-25 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(252,27,NULL,32,'resident',32,'2026-07-25','2026-07-25 01:00:00','2026-07-25 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(253,27,NULL,29,'resident',29,'2026-07-27','2026-07-27 01:00:00','2026-07-27 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(254,27,NULL,30,'resident',30,'2026-07-27','2026-07-27 01:00:00','2026-07-27 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(255,27,NULL,19,'resident',19,'2026-07-27','2026-07-27 01:00:00','2026-07-27 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(256,27,NULL,32,'resident',32,'2026-07-27','2026-07-27 01:00:00','2026-07-27 05:00:00','pending',NULL,NULL,NULL,'2026-06-23 22:48:47','2026-06-23 22:48:47'),(257,18,NULL,29,'resident',29,'2026-06-24','2026-06-24 00:30:00','2026-06-24 01:30:00','completed','2026-06-24 06:51:20',NULL,NULL,'2026-06-24 00:07:58','2026-06-24 13:51:19'),(258,18,NULL,30,'resident',30,'2026-06-24','2026-06-24 00:30:00','2026-06-24 01:30:00','completed','2026-06-24 06:51:20',NULL,NULL,'2026-06-24 00:07:58','2026-06-24 13:51:19'),(259,18,NULL,19,'resident',19,'2026-06-24','2026-06-24 00:30:00','2026-06-24 01:30:00','completed','2026-06-24 06:51:20',NULL,NULL,'2026-06-24 00:07:58','2026-06-24 13:51:19'),(260,18,NULL,32,'resident',32,'2026-06-24','2026-06-24 00:30:00','2026-06-24 01:30:00','completed','2026-06-24 06:51:20',NULL,NULL,'2026-06-24 00:07:58','2026-06-24 13:51:19'),(261,23,NULL,NULL,'committee',6,'2026-07-06','2026-07-06 11:00:00','2026-07-06 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(262,23,NULL,NULL,'committee',6,'2026-07-07','2026-07-07 11:00:00','2026-07-07 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(263,23,NULL,NULL,'committee',6,'2026-07-08','2026-07-08 11:00:00','2026-07-08 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(264,23,NULL,NULL,'committee',6,'2026-07-09','2026-07-09 11:00:00','2026-07-09 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(265,23,NULL,NULL,'committee',6,'2026-07-10','2026-07-10 11:00:00','2026-07-10 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(266,23,NULL,NULL,'committee',6,'2026-07-11','2026-07-11 11:00:00','2026-07-11 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(267,23,NULL,NULL,'committee',6,'2026-07-12','2026-07-12 11:00:00','2026-07-12 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(268,23,NULL,NULL,'committee',6,'2026-07-13','2026-07-13 11:00:00','2026-07-13 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(269,23,NULL,NULL,'committee',6,'2026-07-14','2026-07-14 11:00:00','2026-07-14 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(270,23,NULL,NULL,'committee',6,'2026-07-15','2026-07-15 11:00:00','2026-07-15 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(271,23,NULL,NULL,'committee',6,'2026-07-16','2026-07-16 11:00:00','2026-07-16 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(272,23,NULL,NULL,'committee',6,'2026-07-17','2026-07-17 11:00:00','2026-07-17 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(273,23,NULL,NULL,'committee',6,'2026-07-18','2026-07-18 11:00:00','2026-07-18 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(274,23,NULL,NULL,'committee',6,'2026-07-19','2026-07-19 11:00:00','2026-07-19 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(275,23,NULL,NULL,'committee',6,'2026-07-20','2026-07-20 11:00:00','2026-07-20 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(276,23,NULL,NULL,'committee',6,'2026-07-21','2026-07-21 11:00:00','2026-07-21 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(277,23,NULL,NULL,'committee',6,'2026-07-22','2026-07-22 11:00:00','2026-07-22 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(278,23,NULL,NULL,'committee',6,'2026-07-23','2026-07-23 11:00:00','2026-07-23 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(279,23,NULL,NULL,'committee',6,'2026-07-24','2026-07-24 11:00:00','2026-07-24 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(280,23,NULL,NULL,'committee',6,'2026-07-25','2026-07-25 11:00:00','2026-07-25 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(281,23,NULL,NULL,'committee',6,'2026-07-26','2026-07-26 11:00:00','2026-07-26 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(282,23,NULL,NULL,'committee',6,'2026-07-27','2026-07-27 11:00:00','2026-07-27 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(283,23,NULL,NULL,'committee',6,'2026-07-28','2026-07-28 11:00:00','2026-07-28 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(284,23,NULL,NULL,'committee',6,'2026-07-29','2026-07-29 11:00:00','2026-07-29 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(285,23,NULL,NULL,'committee',6,'2026-07-30','2026-07-30 11:00:00','2026-07-30 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(286,23,NULL,NULL,'committee',6,'2026-07-31','2026-07-31 11:00:00','2026-07-31 11:30:00','pending',NULL,NULL,NULL,'2026-07-06 04:47:42','2026-07-06 04:47:42'),(287,23,NULL,27,'resident',27,'2026-07-08','2026-07-08 11:00:00','2026-07-08 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(288,23,NULL,18,'resident',18,'2026-07-08','2026-07-08 11:00:00','2026-07-08 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(289,23,NULL,33,'resident',33,'2026-07-08','2026-07-08 11:00:00','2026-07-08 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(290,23,NULL,27,'resident',27,'2026-07-09','2026-07-09 11:00:00','2026-07-09 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(291,23,NULL,18,'resident',18,'2026-07-09','2026-07-09 11:00:00','2026-07-09 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(292,23,NULL,33,'resident',33,'2026-07-09','2026-07-09 11:00:00','2026-07-09 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(293,23,NULL,27,'resident',27,'2026-07-10','2026-07-10 11:00:00','2026-07-10 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(294,23,NULL,18,'resident',18,'2026-07-10','2026-07-10 11:00:00','2026-07-10 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(295,23,NULL,33,'resident',33,'2026-07-10','2026-07-10 11:00:00','2026-07-10 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(296,23,NULL,27,'resident',27,'2026-07-11','2026-07-11 11:00:00','2026-07-11 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(297,23,NULL,18,'resident',18,'2026-07-11','2026-07-11 11:00:00','2026-07-11 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(298,23,NULL,33,'resident',33,'2026-07-11','2026-07-11 11:00:00','2026-07-11 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(299,23,NULL,27,'resident',27,'2026-07-12','2026-07-12 11:00:00','2026-07-12 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(300,23,NULL,18,'resident',18,'2026-07-12','2026-07-12 11:00:00','2026-07-12 11:30:00','completed','2026-07-11 23:25:38',NULL,NULL,'2026-07-07 22:58:40','2026-07-12 06:25:37'),(301,23,NULL,33,'resident',33,'2026-07-12','2026-07-12 11:00:00','2026-07-12 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(302,23,NULL,27,'resident',27,'2026-07-13','2026-07-13 11:00:00','2026-07-13 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(303,23,NULL,18,'resident',18,'2026-07-13','2026-07-13 11:00:00','2026-07-13 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(304,23,NULL,33,'resident',33,'2026-07-13','2026-07-13 11:00:00','2026-07-13 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(305,23,NULL,27,'resident',27,'2026-07-14','2026-07-14 11:00:00','2026-07-14 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(306,23,NULL,18,'resident',18,'2026-07-14','2026-07-14 11:00:00','2026-07-14 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(307,23,NULL,33,'resident',33,'2026-07-14','2026-07-14 11:00:00','2026-07-14 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(308,23,NULL,27,'resident',27,'2026-07-15','2026-07-15 11:00:00','2026-07-15 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(309,23,NULL,18,'resident',18,'2026-07-15','2026-07-15 11:00:00','2026-07-15 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(310,23,NULL,33,'resident',33,'2026-07-15','2026-07-15 11:00:00','2026-07-15 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(311,23,NULL,27,'resident',27,'2026-07-16','2026-07-16 11:00:00','2026-07-16 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(312,23,NULL,18,'resident',18,'2026-07-16','2026-07-16 11:00:00','2026-07-16 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(313,23,NULL,33,'resident',33,'2026-07-16','2026-07-16 11:00:00','2026-07-16 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(314,23,NULL,27,'resident',27,'2026-07-17','2026-07-17 11:00:00','2026-07-17 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(315,23,NULL,18,'resident',18,'2026-07-17','2026-07-17 11:00:00','2026-07-17 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(316,23,NULL,33,'resident',33,'2026-07-17','2026-07-17 11:00:00','2026-07-17 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(317,23,NULL,27,'resident',27,'2026-07-18','2026-07-18 11:00:00','2026-07-18 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(318,23,NULL,18,'resident',18,'2026-07-18','2026-07-18 11:00:00','2026-07-18 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(319,23,NULL,33,'resident',33,'2026-07-18','2026-07-18 11:00:00','2026-07-18 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(320,23,NULL,27,'resident',27,'2026-07-19','2026-07-19 11:00:00','2026-07-19 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(321,23,NULL,18,'resident',18,'2026-07-19','2026-07-19 11:00:00','2026-07-19 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(322,23,NULL,33,'resident',33,'2026-07-19','2026-07-19 11:00:00','2026-07-19 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(323,23,NULL,27,'resident',27,'2026-07-20','2026-07-20 11:00:00','2026-07-20 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(324,23,NULL,18,'resident',18,'2026-07-20','2026-07-20 11:00:00','2026-07-20 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(325,23,NULL,33,'resident',33,'2026-07-20','2026-07-20 11:00:00','2026-07-20 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(326,23,NULL,27,'resident',27,'2026-07-21','2026-07-21 11:00:00','2026-07-21 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(327,23,NULL,18,'resident',18,'2026-07-21','2026-07-21 11:00:00','2026-07-21 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(328,23,NULL,33,'resident',33,'2026-07-21','2026-07-21 11:00:00','2026-07-21 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(329,23,NULL,27,'resident',27,'2026-07-22','2026-07-22 11:00:00','2026-07-22 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(330,23,NULL,18,'resident',18,'2026-07-22','2026-07-22 11:00:00','2026-07-22 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(331,23,NULL,33,'resident',33,'2026-07-22','2026-07-22 11:00:00','2026-07-22 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(332,23,NULL,27,'resident',27,'2026-07-23','2026-07-23 11:00:00','2026-07-23 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(333,23,NULL,18,'resident',18,'2026-07-23','2026-07-23 11:00:00','2026-07-23 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(334,23,NULL,33,'resident',33,'2026-07-23','2026-07-23 11:00:00','2026-07-23 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(335,23,NULL,27,'resident',27,'2026-07-24','2026-07-24 11:00:00','2026-07-24 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(336,23,NULL,18,'resident',18,'2026-07-24','2026-07-24 11:00:00','2026-07-24 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(337,23,NULL,33,'resident',33,'2026-07-24','2026-07-24 11:00:00','2026-07-24 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(338,23,NULL,27,'resident',27,'2026-07-25','2026-07-25 11:00:00','2026-07-25 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(339,23,NULL,18,'resident',18,'2026-07-25','2026-07-25 11:00:00','2026-07-25 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(340,23,NULL,33,'resident',33,'2026-07-25','2026-07-25 11:00:00','2026-07-25 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(341,23,NULL,27,'resident',27,'2026-07-26','2026-07-26 11:00:00','2026-07-26 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(342,23,NULL,18,'resident',18,'2026-07-26','2026-07-26 11:00:00','2026-07-26 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(343,23,NULL,33,'resident',33,'2026-07-26','2026-07-26 11:00:00','2026-07-26 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(344,23,NULL,27,'resident',27,'2026-07-27','2026-07-27 11:00:00','2026-07-27 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(345,23,NULL,18,'resident',18,'2026-07-27','2026-07-27 11:00:00','2026-07-27 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(346,23,NULL,33,'resident',33,'2026-07-27','2026-07-27 11:00:00','2026-07-27 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(347,23,NULL,27,'resident',27,'2026-07-28','2026-07-28 11:00:00','2026-07-28 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(348,23,NULL,18,'resident',18,'2026-07-28','2026-07-28 11:00:00','2026-07-28 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(349,23,NULL,33,'resident',33,'2026-07-28','2026-07-28 11:00:00','2026-07-28 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(350,23,NULL,27,'resident',27,'2026-07-29','2026-07-29 11:00:00','2026-07-29 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(351,23,NULL,18,'resident',18,'2026-07-29','2026-07-29 11:00:00','2026-07-29 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(352,23,NULL,33,'resident',33,'2026-07-29','2026-07-29 11:00:00','2026-07-29 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(353,23,NULL,27,'resident',27,'2026-07-30','2026-07-30 11:00:00','2026-07-30 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(354,23,NULL,18,'resident',18,'2026-07-30','2026-07-30 11:00:00','2026-07-30 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(355,23,NULL,33,'resident',33,'2026-07-30','2026-07-30 11:00:00','2026-07-30 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(356,23,NULL,27,'resident',27,'2026-07-31','2026-07-31 11:00:00','2026-07-31 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(357,23,NULL,18,'resident',18,'2026-07-31','2026-07-31 11:00:00','2026-07-31 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(358,23,NULL,33,'resident',33,'2026-07-31','2026-07-31 11:00:00','2026-07-31 11:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:58:40','2026-07-07 22:58:40'),(359,26,NULL,18,'resident',18,'2026-07-10','2026-07-10 12:30:00','2026-07-10 13:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:59:29','2026-07-07 22:59:29'),(360,26,NULL,18,'resident',18,'2026-07-14','2026-07-14 12:30:00','2026-07-14 13:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:59:29','2026-07-07 22:59:29'),(361,26,NULL,18,'resident',18,'2026-07-17','2026-07-17 12:30:00','2026-07-17 13:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:59:29','2026-07-07 22:59:29'),(362,26,NULL,18,'resident',18,'2026-07-21','2026-07-21 12:30:00','2026-07-21 13:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:59:29','2026-07-07 22:59:29'),(363,26,NULL,18,'resident',18,'2026-07-24','2026-07-24 12:30:00','2026-07-24 13:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:59:29','2026-07-07 22:59:29'),(364,26,NULL,18,'resident',18,'2026-07-28','2026-07-28 12:30:00','2026-07-28 13:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:59:29','2026-07-07 22:59:29'),(365,26,NULL,18,'resident',18,'2026-07-31','2026-07-31 12:30:00','2026-07-31 13:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:59:29','2026-07-07 22:59:29'),(366,26,NULL,18,'resident',18,'2026-08-04','2026-08-04 12:30:00','2026-08-04 13:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:59:29','2026-07-07 22:59:29'),(367,26,NULL,18,'resident',18,'2026-08-07','2026-08-07 12:30:00','2026-08-07 13:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:59:29','2026-07-07 22:59:29'),(368,26,NULL,18,'resident',18,'2026-08-11','2026-08-11 12:30:00','2026-08-11 13:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:59:29','2026-07-07 22:59:29'),(369,26,NULL,18,'resident',18,'2026-08-14','2026-08-14 12:30:00','2026-08-14 13:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:59:29','2026-07-07 22:59:29'),(370,26,NULL,18,'resident',18,'2026-08-18','2026-08-18 12:30:00','2026-08-18 13:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:59:29','2026-07-07 22:59:29'),(371,26,NULL,18,'resident',18,'2026-08-21','2026-08-21 12:30:00','2026-08-21 13:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:59:29','2026-07-07 22:59:29'),(372,26,NULL,18,'resident',18,'2026-08-25','2026-08-25 12:30:00','2026-08-25 13:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:59:29','2026-07-07 22:59:29'),(373,26,NULL,18,'resident',18,'2026-08-28','2026-08-28 12:30:00','2026-08-28 13:30:00','pending',NULL,NULL,NULL,'2026-07-07 22:59:29','2026-07-07 22:59:29'),(374,22,NULL,18,'resident',18,'2026-07-08','2026-07-08 09:00:00','2026-07-08 09:45:00','pending',NULL,NULL,NULL,'2026-07-08 01:04:28','2026-07-08 01:04:28'),(375,15,NULL,18,'resident',18,'2026-07-20','2026-07-19 21:30:00','2026-07-19 22:00:00','pending',NULL,NULL,NULL,'2026-07-20 02:16:21','2026-07-20 02:16:21'),(376,24,NULL,20,'resident',20,'2026-07-20','2026-07-20 00:00:00','2026-07-20 07:00:00','pending',NULL,NULL,NULL,'2026-07-20 13:03:47','2026-07-20 13:03:47'),(377,25,NULL,18,'resident',18,'2026-07-20','2026-07-20 06:00:00','2026-07-20 12:00:00','pending',NULL,NULL,NULL,'2026-07-20 13:04:29','2026-07-20 13:04:29'),(378,24,NULL,18,'resident',18,'2026-07-21','2026-07-21 00:00:00','2026-07-21 07:00:00','completed','2026-07-21 00:04:00',NULL,NULL,'2026-07-21 02:33:52','2026-07-21 07:04:00'),(379,25,NULL,34,'resident',34,'2026-07-21','2026-07-21 06:00:00','2026-07-21 12:00:00','cancelled',NULL,NULL,'Hủy từ màn hình sinh hoạt hằng ngày','2026-07-21 07:45:45','2026-07-21 08:03:07');
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
INSERT INTO `finance_charge_period_items` VALUES (1,1,5,'lodging_fee','Phí lưu trú',1200000.00,1,10,'2026-06-25 10:15:03','2026-06-25 10:15:03'),(2,1,6,'meal_living_fee','Ăn uống sinh hoạt',1800000.00,1,20,'2026-06-25 10:15:03','2026-06-25 10:15:03'),(3,1,7,'other_student_fee','Khoản thu khác của học viên',500000.00,0,30,'2026-06-25 10:15:03','2026-06-25 10:15:03'),(4,2,5,'lodging_fee','Phí lưu trú',1350000.00,1,10,'2026-06-25 15:53:10','2026-06-25 15:53:10'),(5,2,6,'meal_living_fee','Ăn uống sinh hoạt',1800000.00,1,20,'2026-06-25 15:53:10','2026-06-25 15:53:10'),(6,2,7,'other_student_fee','Khoản thu khác của học viên',500000.00,0,30,'2026-06-25 15:53:10','2026-06-25 15:53:10');
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
INSERT INTO `finance_charge_periods` VALUES (1,'PERIOD-2026-01-12-1782357303702','Phí lưu xá năm 2026',2026,1,12,'draft','Chi phí cần thu học viên năm 2026',1,'2026-06-25 10:15:03','2026-06-25 10:15:03'),(2,'PERIOD-2027-01-12-1782377590096','Phí lưu xá năm 2027',2027,1,12,'draft',NULL,1,'2026-06-25 15:53:10','2026-06-25 15:53:10');
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
INSERT INTO `finance_charges` VALUES (5,'RC-FEE-27-5-2026-01-1782358774439-9795',27,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Cao Ngọc Thanh','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Phí lưu trú',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(6,'RC-FEE-27-6-2026-01-1782358774442-865',27,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Cao Ngọc Thanh','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Ăn uống sinh hoạt',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(7,'RC-FEE-20-5-2026-01-1782358774445-2805',20,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Cao Thị Khánh Linh','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Phí lưu trú',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(8,'RC-FEE-20-6-2026-01-1782358774448-8914',20,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Cao Thị Khánh Linh','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Ăn uống sinh hoạt',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(9,'RC-FEE-34-5-2026-01-1782358774452-8611',34,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Hà Vân Mộng','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Phí lưu trú',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(10,'RC-FEE-34-6-2026-01-1782358774454-2359',34,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Hà Vân Mộng','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Ăn uống sinh hoạt',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(11,'RC-FEE-23-5-2026-01-1782358774457-1959',23,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Hoàng Anh Trúc','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Phí lưu trú',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(12,'RC-FEE-23-6-2026-01-1782358774459-1049',23,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Hoàng Anh Trúc','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Ăn uống sinh hoạt',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(13,'RC-FEE-21-5-2026-01-1782358774462-8975',21,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lâm Ngọc Xuyến','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Phí lưu trú',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(14,'RC-FEE-21-6-2026-01-1782358774464-3264',21,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lâm Ngọc Xuyến','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Ăn uống sinh hoạt',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(15,'RC-FEE-18-5-2026-01-1782358774467-4234',18,5,1,1,1200000.00,1200000.00,0.00,NULL,'paid','student_fee','period_monthly','resident','Lê Thị Phương Anh','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Phí lưu trú',1,'2026-06-25 10:39:34','2026-07-01 15:29:42'),(16,'RC-FEE-18-6-2026-01-1782358774470-4271',18,6,1,2,1800000.00,1800000.00,0.00,NULL,'paid','student_fee','period_monthly','resident','Lê Thị Phương Anh','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Ăn uống sinh hoạt',1,'2026-06-25 10:39:34','2026-07-01 15:29:42'),(17,'RC-FEE-22-5-2026-01-1782358774473-2099',22,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lương Giang Huyền','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Phí lưu trú',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(18,'RC-FEE-22-6-2026-01-1782358774476-4403',22,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lương Giang Huyền','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Ăn uống sinh hoạt',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(19,'RC-FEE-29-5-2026-01-1782358774479-8978',29,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lý Thị Nga','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Phí lưu trú',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(20,'RC-FEE-29-6-2026-01-1782358774481-4313',29,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lý Thị Nga','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Ăn uống sinh hoạt',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(21,'RC-FEE-31-5-2026-01-1782358774484-4107',31,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Nguyễn Thị Tuyết','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Phí lưu trú',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(22,'RC-FEE-31-6-2026-01-1782358774486-415',31,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Nguyễn Thị Tuyết','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Ăn uống sinh hoạt',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(23,'RC-FEE-33-5-2026-01-1782358774489-2524',33,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Phan Gia Lâm','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Phí lưu trú',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(24,'RC-FEE-33-6-2026-01-1782358774492-7378',33,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Phan Gia Lâm','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Ăn uống sinh hoạt',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(25,'RC-FEE-24-5-2026-01-1782358774495-8288',24,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Quách Gia Liễu','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Phí lưu trú',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(26,'RC-FEE-24-6-2026-01-1782358774497-2980',24,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Quách Gia Liễu','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Ăn uống sinh hoạt',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(27,'RC-FEE-30-5-2026-01-1782358774500-5825',30,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Sương Thị Mai','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Phí lưu trú',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(28,'RC-FEE-30-6-2026-01-1782358774502-1249',30,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Sương Thị Mai','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Ăn uống sinh hoạt',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(29,'RC-FEE-32-5-2026-01-1782358774505-8924',32,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Phúc Giang','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Phí lưu trú',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(30,'RC-FEE-32-6-2026-01-1782358774507-6038',32,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Phúc Giang','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Ăn uống sinh hoạt',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(31,'RC-FEE-19-5-2026-01-1782358774510-6737',19,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thanh Trà','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Phí lưu trú',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(32,'RC-FEE-19-6-2026-01-1782358774512-2700',19,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thanh Trà','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Ăn uống sinh hoạt',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(33,'RC-FEE-28-5-2026-01-1782358774515-3904',28,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thị Thu Sương','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Phí lưu trú',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(34,'RC-FEE-28-6-2026-01-1782358774517-3882',28,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thị Thu Sương','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Ăn uống sinh hoạt',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(35,'RC-FEE-25-5-2026-01-1782358774520-8877',25,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Tú Anh','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Phí lưu trú',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(36,'RC-FEE-25-6-2026-01-1782358774522-2152',25,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Tú Anh','2026-01','2026-01-01','2026-01-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-01 - Ăn uống sinh hoạt',1,'2026-06-25 10:39:34','2026-06-25 10:39:34'),(37,'RC-FEE-27-5-2026-02-1782358906020-5261',27,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Cao Ngọc Thanh','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Phí lưu trú',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(38,'RC-FEE-27-6-2026-02-1782358906023-4303',27,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Cao Ngọc Thanh','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Ăn uống sinh hoạt',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(39,'RC-FEE-20-5-2026-02-1782358906026-3389',20,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Cao Thị Khánh Linh','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Phí lưu trú',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(40,'RC-FEE-20-6-2026-02-1782358906028-2057',20,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Cao Thị Khánh Linh','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Ăn uống sinh hoạt',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(41,'RC-FEE-34-5-2026-02-1782358906031-7297',34,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Hà Vân Mộng','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Phí lưu trú',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(42,'RC-FEE-34-6-2026-02-1782358906034-1839',34,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Hà Vân Mộng','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Ăn uống sinh hoạt',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(43,'RC-FEE-23-5-2026-02-1782358906036-4451',23,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Hoàng Anh Trúc','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Phí lưu trú',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(44,'RC-FEE-23-6-2026-02-1782358906038-2069',23,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Hoàng Anh Trúc','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Ăn uống sinh hoạt',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(45,'RC-FEE-21-5-2026-02-1782358906040-5654',21,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lâm Ngọc Xuyến','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Phí lưu trú',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(46,'RC-FEE-21-6-2026-02-1782358906042-4997',21,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lâm Ngọc Xuyến','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Ăn uống sinh hoạt',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(47,'RC-FEE-18-5-2026-02-1782358906045-472',18,5,1,1,1200000.00,1200000.00,0.00,NULL,'paid','student_fee','period_monthly','resident','Lê Thị Phương Anh','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Phí lưu trú',1,'2026-06-25 10:41:46','2026-07-01 15:29:54'),(48,'RC-FEE-18-6-2026-02-1782358906047-1285',18,6,1,2,1800000.00,1800000.00,0.00,NULL,'paid','student_fee','period_monthly','resident','Lê Thị Phương Anh','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Ăn uống sinh hoạt',1,'2026-06-25 10:41:46','2026-07-01 15:29:54'),(49,'RC-FEE-22-5-2026-02-1782358906049-9209',22,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lương Giang Huyền','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Phí lưu trú',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(50,'RC-FEE-22-6-2026-02-1782358906051-3390',22,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lương Giang Huyền','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Ăn uống sinh hoạt',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(51,'RC-FEE-29-5-2026-02-1782358906053-1796',29,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lý Thị Nga','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Phí lưu trú',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(52,'RC-FEE-29-6-2026-02-1782358906055-8947',29,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lý Thị Nga','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Ăn uống sinh hoạt',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(53,'RC-FEE-31-5-2026-02-1782358906057-9157',31,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Nguyễn Thị Tuyết','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Phí lưu trú',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(54,'RC-FEE-31-6-2026-02-1782358906059-9781',31,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Nguyễn Thị Tuyết','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Ăn uống sinh hoạt',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(55,'RC-FEE-33-5-2026-02-1782358906061-6022',33,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Phan Gia Lâm','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Phí lưu trú',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(56,'RC-FEE-33-6-2026-02-1782358906063-8893',33,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Phan Gia Lâm','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Ăn uống sinh hoạt',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(57,'RC-FEE-24-5-2026-02-1782358906065-4559',24,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Quách Gia Liễu','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Phí lưu trú',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(58,'RC-FEE-24-6-2026-02-1782358906068-3102',24,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Quách Gia Liễu','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Ăn uống sinh hoạt',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(59,'RC-FEE-30-5-2026-02-1782358906070-4335',30,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Sương Thị Mai','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Phí lưu trú',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(60,'RC-FEE-30-6-2026-02-1782358906072-3168',30,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Sương Thị Mai','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Ăn uống sinh hoạt',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(61,'RC-FEE-32-5-2026-02-1782358906075-403',32,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Phúc Giang','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Phí lưu trú',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(62,'RC-FEE-32-6-2026-02-1782358906077-8342',32,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Phúc Giang','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Ăn uống sinh hoạt',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(63,'RC-FEE-19-5-2026-02-1782358906080-2145',19,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thanh Trà','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Phí lưu trú',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(64,'RC-FEE-19-6-2026-02-1782358906086-2162',19,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thanh Trà','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Ăn uống sinh hoạt',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(65,'RC-FEE-28-5-2026-02-1782358906088-7904',28,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thị Thu Sương','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Phí lưu trú',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(66,'RC-FEE-28-6-2026-02-1782358906091-2449',28,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thị Thu Sương','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Ăn uống sinh hoạt',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(67,'RC-FEE-25-5-2026-02-1782358906093-2435',25,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Tú Anh','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Phí lưu trú',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(68,'RC-FEE-25-6-2026-02-1782358906095-152',25,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Tú Anh','2026-02','2026-02-01','2026-02-27','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-02 - Ăn uống sinh hoạt',1,'2026-06-25 10:41:46','2026-06-25 10:41:46'),(69,'RC-FEE-27-5-2026-07-1782376872710-6032',27,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Cao Ngọc Thanh','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Phí lưu trú',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(70,'RC-FEE-27-6-2026-07-1782376872713-7582',27,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Cao Ngọc Thanh','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(71,'RC-FEE-27-7-2026-07-1782376872715-7677',27,7,1,3,500000.00,0.00,500000.00,NULL,'open','student_fee','period_monthly','resident','Cao Ngọc Thanh','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Khoản thu khác của học viên',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(72,'RC-FEE-20-5-2026-07-1782376872718-4327',20,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Cao Thị Khánh Linh','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Phí lưu trú',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(73,'RC-FEE-20-6-2026-07-1782376872720-2283',20,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Cao Thị Khánh Linh','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(74,'RC-FEE-34-5-2026-07-1782376872723-2201',34,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Hà Vân Mộng','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Phí lưu trú',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(75,'RC-FEE-34-6-2026-07-1782376872726-7634',34,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Hà Vân Mộng','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(76,'RC-FEE-23-5-2026-07-1782376872729-3087',23,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Hoàng Anh Trúc','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Phí lưu trú',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(77,'RC-FEE-23-6-2026-07-1782376872732-6477',23,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Hoàng Anh Trúc','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(78,'RC-FEE-23-7-2026-07-1782376872734-5657',23,7,1,3,500000.00,0.00,500000.00,NULL,'open','student_fee','period_monthly','resident','Hoàng Anh Trúc','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Khoản thu khác của học viên',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(79,'RC-FEE-21-5-2026-07-1782376872736-1314',21,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lâm Ngọc Xuyến','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Phí lưu trú',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(80,'RC-FEE-21-6-2026-07-1782376872738-1892',21,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lâm Ngọc Xuyến','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(81,'RC-FEE-18-5-2026-07-1782376872740-9882',18,5,1,1,1200000.00,1200000.00,0.00,NULL,'paid','student_fee','period_monthly','resident','Lê Thị Phương Anh','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Phí lưu trú',1,'2026-06-25 15:41:12','2026-07-01 15:36:39'),(82,'RC-FEE-18-6-2026-07-1782376872742-1794',18,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lê Thị Phương Anh','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(83,'RC-FEE-22-5-2026-07-1782376872744-9876',22,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lương Giang Huyền','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Phí lưu trú',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(84,'RC-FEE-22-6-2026-07-1782376872746-4107',22,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lương Giang Huyền','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(85,'RC-FEE-29-5-2026-07-1782376872749-6463',29,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lý Thị Nga','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Phí lưu trú',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(86,'RC-FEE-29-6-2026-07-1782376872751-4448',29,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lý Thị Nga','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(87,'RC-FEE-31-5-2026-07-1782376872754-8690',31,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Nguyễn Thị Tuyết','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Phí lưu trú',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(88,'RC-FEE-31-6-2026-07-1782376872757-9040',31,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Nguyễn Thị Tuyết','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(89,'RC-FEE-33-5-2026-07-1782376872760-6211',33,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Phan Gia Lâm','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Phí lưu trú',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(90,'RC-FEE-33-6-2026-07-1782376872762-3664',33,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Phan Gia Lâm','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(91,'RC-FEE-24-5-2026-07-1782376872765-5058',24,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Quách Gia Liễu','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Phí lưu trú',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(92,'RC-FEE-24-6-2026-07-1782376872768-719',24,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Quách Gia Liễu','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(93,'RC-FEE-30-5-2026-07-1782376872770-4074',30,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Sương Thị Mai','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Phí lưu trú',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(94,'RC-FEE-30-6-2026-07-1782376872772-810',30,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Sương Thị Mai','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(95,'RC-FEE-30-7-2026-07-1782376872775-765',30,7,1,3,500000.00,0.00,500000.00,NULL,'open','student_fee','period_monthly','resident','Sương Thị Mai','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Khoản thu khác của học viên',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(96,'RC-FEE-32-5-2026-07-1782376872778-9895',32,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Phúc Giang','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Phí lưu trú',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(97,'RC-FEE-32-6-2026-07-1782376872780-4539',32,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Phúc Giang','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(98,'RC-FEE-19-5-2026-07-1782376872784-5208',19,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thanh Trà','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Phí lưu trú',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(99,'RC-FEE-19-6-2026-07-1782376872786-3902',19,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thanh Trà','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(100,'RC-FEE-28-5-2026-07-1782376872789-1335',28,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thị Thu Sương','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Phí lưu trú',1,'2026-06-25 15:41:12','2026-06-25 15:41:12'),(101,'RC-FEE-28-6-2026-07-1782376872791-7726',28,6,1,2,1800000.00,1800000.00,0.00,NULL,'paid','student_fee','period_monthly','resident','Trần Thị Thu Sương','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:12','2026-07-03 11:25:51'),(102,'RC-FEE-25-5-2026-07-1782376872794-2069',25,5,1,1,1200000.00,1200000.00,0.00,NULL,'paid','student_fee','period_monthly','resident','Trần Tú Anh','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Phí lưu trú',1,'2026-06-25 15:41:12','2026-07-03 05:59:46'),(103,'RC-FEE-25-6-2026-07-1782376872796-5975',25,6,1,2,1800000.00,1800000.00,0.00,NULL,'paid','student_fee','period_monthly','resident','Trần Tú Anh','2026-07','2026-07-01','2026-07-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-07 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:12','2026-07-03 05:59:46'),(104,'RC-FEE-27-5-2026-06-1782376918739-1717',27,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Cao Ngọc Thanh','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Phí lưu trú',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(105,'RC-FEE-27-6-2026-06-1782376918742-3940',27,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Cao Ngọc Thanh','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(106,'RC-FEE-20-5-2026-06-1782376918746-5384',20,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Cao Thị Khánh Linh','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Phí lưu trú',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(107,'RC-FEE-20-6-2026-06-1782376918749-119',20,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Cao Thị Khánh Linh','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(108,'RC-FEE-34-5-2026-06-1782376918752-8936',34,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Hà Vân Mộng','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Phí lưu trú',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(109,'RC-FEE-34-6-2026-06-1782376918754-7168',34,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Hà Vân Mộng','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(110,'RC-FEE-23-5-2026-06-1782376918757-8574',23,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Hoàng Anh Trúc','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Phí lưu trú',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(111,'RC-FEE-23-6-2026-06-1782376918760-2918',23,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Hoàng Anh Trúc','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(112,'RC-FEE-21-5-2026-06-1782376918765-3346',21,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lâm Ngọc Xuyến','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Phí lưu trú',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(113,'RC-FEE-21-6-2026-06-1782376918767-9530',21,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lâm Ngọc Xuyến','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(114,'RC-FEE-18-5-2026-06-1782376918770-7172',18,5,1,1,1200000.00,1200000.00,0.00,NULL,'paid','student_fee','period_monthly','resident','Lê Thị Phương Anh','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Phí lưu trú',1,'2026-06-25 15:41:58','2026-07-01 15:35:56'),(115,'RC-FEE-18-6-2026-06-1782376918772-243',18,6,1,2,1800000.00,1800000.00,0.00,NULL,'paid','student_fee','period_monthly','resident','Lê Thị Phương Anh','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:58','2026-07-01 15:35:56'),(116,'RC-FEE-22-5-2026-06-1782376918774-8527',22,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lương Giang Huyền','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Phí lưu trú',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(117,'RC-FEE-22-6-2026-06-1782376918776-2087',22,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lương Giang Huyền','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(118,'RC-FEE-29-5-2026-06-1782376918778-9427',29,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lý Thị Nga','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Phí lưu trú',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(119,'RC-FEE-29-6-2026-06-1782376918780-9731',29,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lý Thị Nga','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(120,'RC-FEE-31-5-2026-06-1782376918783-6041',31,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Nguyễn Thị Tuyết','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Phí lưu trú',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(121,'RC-FEE-31-6-2026-06-1782376918784-1297',31,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Nguyễn Thị Tuyết','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(122,'RC-FEE-33-5-2026-06-1782376918786-2172',33,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Phan Gia Lâm','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Phí lưu trú',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(123,'RC-FEE-33-6-2026-06-1782376918788-1179',33,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Phan Gia Lâm','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(124,'RC-FEE-24-5-2026-06-1782376918790-4986',24,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Quách Gia Liễu','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Phí lưu trú',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(125,'RC-FEE-24-6-2026-06-1782376918792-9649',24,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Quách Gia Liễu','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(126,'RC-FEE-30-5-2026-06-1782376918794-2431',30,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Sương Thị Mai','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Phí lưu trú',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(127,'RC-FEE-30-6-2026-06-1782376918796-3245',30,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Sương Thị Mai','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(128,'RC-FEE-32-5-2026-06-1782376918797-2411',32,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Phúc Giang','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Phí lưu trú',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(129,'RC-FEE-32-6-2026-06-1782376918799-4975',32,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Phúc Giang','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(130,'RC-FEE-19-5-2026-06-1782376918801-1110',19,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thanh Trà','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Phí lưu trú',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(131,'RC-FEE-19-6-2026-06-1782376918803-9738',19,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thanh Trà','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(132,'RC-FEE-28-5-2026-06-1782376918805-7665',28,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thị Thu Sương','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Phí lưu trú',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(133,'RC-FEE-28-6-2026-06-1782376918807-3965',28,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thị Thu Sương','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(134,'RC-FEE-25-5-2026-06-1782376918809-3660',25,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Tú Anh','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Phí lưu trú',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(135,'RC-FEE-25-6-2026-06-1782376918811-1979',25,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Tú Anh','2026-06','2026-06-01','2026-06-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-06 - Ăn uống sinh hoạt',1,'2026-06-25 15:41:58','2026-06-25 15:41:58'),(136,'RC-FEE-27-5-2026-08-1782377266487-2030',27,5,1,1,1200000.00,1200000.00,0.00,NULL,'paid','student_fee','period_monthly','resident','Cao Ngọc Thanh','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Phí lưu trú',1,'2026-06-25 15:47:46','2026-06-29 13:21:40'),(137,'RC-FEE-27-6-2026-08-1782377266490-8718',27,6,1,2,1800000.00,1800000.00,0.00,NULL,'paid','student_fee','period_monthly','resident','Cao Ngọc Thanh','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Ăn uống sinh hoạt',1,'2026-06-25 15:47:46','2026-06-29 13:21:40'),(138,'RC-FEE-20-5-2026-08-1782377266493-8489',20,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Cao Thị Khánh Linh','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Phí lưu trú',1,'2026-06-25 15:47:46','2026-06-25 15:47:46'),(139,'RC-FEE-20-6-2026-08-1782377266495-5200',20,6,1,2,1900000.00,1000000.00,900000.00,NULL,'partial','student_fee','period_monthly','resident','Cao Thị Khánh Linh','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Ăn uống sinh hoạt',1,'2026-06-25 15:47:46','2026-06-29 13:34:07'),(140,'RC-FEE-34-5-2026-08-1782377266498-3920',34,5,1,1,1200000.00,800000.00,0.00,NULL,'paid','student_fee','period_monthly','resident','Hà Vân Mộng','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Phí lưu trú',1,'2026-06-25 15:47:46','2026-06-29 09:31:49'),(141,'RC-FEE-34-6-2026-08-1782377266501-8455',34,6,1,2,1800000.00,1800000.00,0.00,NULL,'paid','student_fee','period_monthly','resident','Hà Vân Mộng','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Ăn uống sinh hoạt',1,'2026-06-25 15:47:46','2026-06-29 09:31:26'),(142,'RC-FEE-23-5-2026-08-1782859671472-8713',23,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Hoàng Anh Trúc','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Phí lưu trú',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(143,'RC-FEE-23-6-2026-08-1782859671475-5653',23,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Hoàng Anh Trúc','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(144,'RC-FEE-21-5-2026-08-1782859671478-5330',21,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lâm Ngọc Xuyến','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Phí lưu trú',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(145,'RC-FEE-21-6-2026-08-1782859671481-9829',21,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lâm Ngọc Xuyến','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(146,'RC-FEE-18-5-2026-08-1782859671485-3064',18,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lê Thị Phương Anh','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Phí lưu trú',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(147,'RC-FEE-18-6-2026-08-1782859671487-7885',18,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lê Thị Phương Anh','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(148,'RC-FEE-22-5-2026-08-1782859671489-8153',22,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lương Giang Huyền','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Phí lưu trú',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(149,'RC-FEE-22-6-2026-08-1782859671491-4715',22,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lương Giang Huyền','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(150,'RC-FEE-29-5-2026-08-1782859671493-6471',29,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lý Thị Nga','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Phí lưu trú',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(151,'RC-FEE-29-6-2026-08-1782859671495-1243',29,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lý Thị Nga','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(152,'RC-FEE-31-5-2026-08-1782859671498-3746',31,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Nguyễn Thị Tuyết','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Phí lưu trú',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(153,'RC-FEE-31-6-2026-08-1782859671500-9374',31,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Nguyễn Thị Tuyết','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(154,'RC-FEE-33-5-2026-08-1782859671502-1377',33,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Phan Gia Lâm','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Phí lưu trú',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(155,'RC-FEE-33-6-2026-08-1782859671505-9224',33,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Phan Gia Lâm','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(156,'RC-FEE-24-5-2026-08-1782859671508-5787',24,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Quách Gia Liễu','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Phí lưu trú',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(157,'RC-FEE-24-6-2026-08-1782859671509-2340',24,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Quách Gia Liễu','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(158,'RC-FEE-30-5-2026-08-1782859671512-9583',30,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Sương Thị Mai','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Phí lưu trú',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(159,'RC-FEE-30-6-2026-08-1782859671516-5653',30,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Sương Thị Mai','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(160,'RC-FEE-32-5-2026-08-1782859671519-2990',32,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Phúc Giang','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Phí lưu trú',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(161,'RC-FEE-32-6-2026-08-1782859671521-766',32,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Phúc Giang','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(162,'RC-FEE-19-5-2026-08-1782859671523-9895',19,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thanh Trà','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Phí lưu trú',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(163,'RC-FEE-19-6-2026-08-1782859671525-5475',19,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thanh Trà','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(164,'RC-FEE-28-5-2026-08-1782859671527-7265',28,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thị Thu Sương','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Phí lưu trú',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(165,'RC-FEE-28-6-2026-08-1782859671529-9200',28,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thị Thu Sương','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(166,'RC-FEE-25-5-2026-08-1782859671531-863',25,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Tú Anh','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Phí lưu trú',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(167,'RC-FEE-25-6-2026-08-1782859671534-4249',25,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Tú Anh','2026-08','2026-08-01','2026-08-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-08 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:51','2026-07-01 05:47:51'),(168,'RC-FEE-27-5-2026-09-1782859678082-8540',27,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Cao Ngọc Thanh','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Phí lưu trú',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(169,'RC-FEE-27-6-2026-09-1782859678085-5529',27,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Cao Ngọc Thanh','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(170,'RC-FEE-20-5-2026-09-1782859678088-3661',20,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Cao Thị Khánh Linh','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Phí lưu trú',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(171,'RC-FEE-20-6-2026-09-1782859678090-8349',20,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Cao Thị Khánh Linh','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(172,'RC-FEE-34-5-2026-09-1782859678092-7671',34,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Hà Vân Mộng','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Phí lưu trú',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(173,'RC-FEE-34-6-2026-09-1782859678094-7387',34,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Hà Vân Mộng','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(174,'RC-FEE-23-5-2026-09-1782859678098-8375',23,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Hoàng Anh Trúc','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Phí lưu trú',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(175,'RC-FEE-23-6-2026-09-1782859678100-8990',23,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Hoàng Anh Trúc','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(176,'RC-FEE-21-5-2026-09-1782859678103-4876',21,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lâm Ngọc Xuyến','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Phí lưu trú',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(177,'RC-FEE-21-6-2026-09-1782859678105-3359',21,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lâm Ngọc Xuyến','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(178,'RC-FEE-18-5-2026-09-1782859678108-6627',18,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lê Thị Phương Anh','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Phí lưu trú',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(179,'RC-FEE-18-6-2026-09-1782859678113-7423',18,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lê Thị Phương Anh','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(180,'RC-FEE-22-5-2026-09-1782859678116-8538',22,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lương Giang Huyền','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Phí lưu trú',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(181,'RC-FEE-22-6-2026-09-1782859678119-8348',22,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lương Giang Huyền','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(182,'RC-FEE-29-5-2026-09-1782859678121-9700',29,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lý Thị Nga','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Phí lưu trú',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(183,'RC-FEE-29-6-2026-09-1782859678123-8030',29,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lý Thị Nga','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(184,'RC-FEE-31-5-2026-09-1782859678126-9059',31,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Nguyễn Thị Tuyết','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Phí lưu trú',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(185,'RC-FEE-31-6-2026-09-1782859678128-8077',31,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Nguyễn Thị Tuyết','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(186,'RC-FEE-33-5-2026-09-1782859678131-5283',33,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Phan Gia Lâm','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Phí lưu trú',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(187,'RC-FEE-33-6-2026-09-1782859678133-1217',33,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Phan Gia Lâm','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(188,'RC-FEE-24-5-2026-09-1782859678137-8158',24,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Quách Gia Liễu','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Phí lưu trú',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(189,'RC-FEE-24-6-2026-09-1782859678139-1522',24,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Quách Gia Liễu','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(190,'RC-FEE-30-5-2026-09-1782859678141-6145',30,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Sương Thị Mai','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Phí lưu trú',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(191,'RC-FEE-30-6-2026-09-1782859678143-6179',30,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Sương Thị Mai','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(192,'RC-FEE-32-5-2026-09-1782859678147-3314',32,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Phúc Giang','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Phí lưu trú',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(193,'RC-FEE-32-6-2026-09-1782859678150-4727',32,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Phúc Giang','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(194,'RC-FEE-19-5-2026-09-1782859678153-3910',19,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thanh Trà','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Phí lưu trú',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(195,'RC-FEE-19-6-2026-09-1782859678155-2657',19,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thanh Trà','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(196,'RC-FEE-28-5-2026-09-1782859678158-106',28,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thị Thu Sương','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Phí lưu trú',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(197,'RC-FEE-28-6-2026-09-1782859678160-6351',28,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thị Thu Sương','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(198,'RC-FEE-25-5-2026-09-1782859678162-6290',25,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Tú Anh','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Phí lưu trú',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(199,'RC-FEE-25-6-2026-09-1782859678166-7426',25,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Tú Anh','2026-09','2026-09-01','2026-09-29','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-09 - Ăn uống sinh hoạt',1,'2026-07-01 05:47:58','2026-07-01 05:47:58'),(200,'RC-FEE-27-5-2026-10-1782859689272-7789',27,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Cao Ngọc Thanh','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Phí lưu trú',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(201,'RC-FEE-27-6-2026-10-1782859689274-9112',27,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Cao Ngọc Thanh','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Ăn uống sinh hoạt',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(202,'RC-FEE-20-5-2026-10-1782859689277-751',20,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Cao Thị Khánh Linh','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Phí lưu trú',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(203,'RC-FEE-20-6-2026-10-1782859689280-3614',20,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Cao Thị Khánh Linh','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Ăn uống sinh hoạt',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(204,'RC-FEE-34-5-2026-10-1782859689282-1069',34,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Hà Vân Mộng','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Phí lưu trú',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(205,'RC-FEE-34-6-2026-10-1782859689285-8740',34,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Hà Vân Mộng','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Ăn uống sinh hoạt',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(206,'RC-FEE-23-5-2026-10-1782859689287-9362',23,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Hoàng Anh Trúc','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Phí lưu trú',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(207,'RC-FEE-23-6-2026-10-1782859689289-2011',23,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Hoàng Anh Trúc','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Ăn uống sinh hoạt',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(208,'RC-FEE-21-5-2026-10-1782859689291-5159',21,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lâm Ngọc Xuyến','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Phí lưu trú',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(209,'RC-FEE-21-6-2026-10-1782859689294-3866',21,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lâm Ngọc Xuyến','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Ăn uống sinh hoạt',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(210,'RC-FEE-18-5-2026-10-1782859689298-7013',18,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lê Thị Phương Anh','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Phí lưu trú',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(211,'RC-FEE-18-6-2026-10-1782859689300-2441',18,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lê Thị Phương Anh','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Ăn uống sinh hoạt',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(212,'RC-FEE-22-5-2026-10-1782859689304-2039',22,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lương Giang Huyền','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Phí lưu trú',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(213,'RC-FEE-22-6-2026-10-1782859689306-320',22,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lương Giang Huyền','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Ăn uống sinh hoạt',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(214,'RC-FEE-29-5-2026-10-1782859689308-2387',29,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Lý Thị Nga','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Phí lưu trú',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(215,'RC-FEE-29-6-2026-10-1782859689311-3214',29,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Lý Thị Nga','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Ăn uống sinh hoạt',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(216,'RC-FEE-31-5-2026-10-1782859689314-6817',31,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Nguyễn Thị Tuyết','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Phí lưu trú',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(217,'RC-FEE-31-6-2026-10-1782859689316-7097',31,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Nguyễn Thị Tuyết','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Ăn uống sinh hoạt',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(218,'RC-FEE-33-5-2026-10-1782859689319-4975',33,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Phan Gia Lâm','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Phí lưu trú',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(219,'RC-FEE-33-6-2026-10-1782859689321-8115',33,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Phan Gia Lâm','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Ăn uống sinh hoạt',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(220,'RC-FEE-24-5-2026-10-1782859689323-7132',24,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Quách Gia Liễu','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Phí lưu trú',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(221,'RC-FEE-24-6-2026-10-1782859689325-1442',24,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Quách Gia Liễu','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Ăn uống sinh hoạt',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(222,'RC-FEE-30-5-2026-10-1782859689328-678',30,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Sương Thị Mai','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Phí lưu trú',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(223,'RC-FEE-30-6-2026-10-1782859689330-4075',30,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Sương Thị Mai','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Ăn uống sinh hoạt',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(224,'RC-FEE-32-5-2026-10-1782859689333-2097',32,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Phúc Giang','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Phí lưu trú',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(225,'RC-FEE-32-6-2026-10-1782859689336-4299',32,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Phúc Giang','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Ăn uống sinh hoạt',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(226,'RC-FEE-19-5-2026-10-1782859689339-9795',19,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thanh Trà','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Phí lưu trú',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(227,'RC-FEE-19-6-2026-10-1782859689341-5853',19,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thanh Trà','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Ăn uống sinh hoạt',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(228,'RC-FEE-28-5-2026-10-1782859689344-5863',28,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thị Thu Sương','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Phí lưu trú',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(229,'RC-FEE-28-6-2026-10-1782859689347-1735',28,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Thị Thu Sương','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Ăn uống sinh hoạt',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(230,'RC-FEE-25-5-2026-10-1782859689349-4277',25,5,1,1,1200000.00,0.00,1200000.00,NULL,'open','student_fee','period_monthly','resident','Trần Tú Anh','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Phí lưu trú',1,'2026-07-01 05:48:09','2026-07-01 05:48:09'),(231,'RC-FEE-25-6-2026-10-1782859689352-7643',25,6,1,2,1800000.00,0.00,1800000.00,NULL,'open','student_fee','period_monthly','resident','Trần Tú Anh','2026-10','2026-10-01','2026-10-30','full_month',1.00,'Kỳ: Phí lưu xá năm 2026 - 2026-10 - Ăn uống sinh hoạt',1,'2026-07-01 05:48:09','2026-07-01 05:48:09');
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_fee_types`
--

LOCK TABLES `finance_fee_types` WRITE;
/*!40000 ALTER TABLE `finance_fee_types` DISABLE KEYS */;
INSERT INTO `finance_fee_types` VALUES (1,'MONTHLY_FEE','Phí lưu trú tháng',0.00,'monthly','Khoản thu lưu trú theo tháng',1,10,'2026-06-24 15:30:06','2026-06-24 15:30:06'),(2,'MEAL_FEE','Phí ăn uống',0.00,'monthly','Khoản thu ăn uống hoặc sinh hoạt chung',1,20,'2026-06-24 15:30:06','2026-06-24 15:30:06'),(3,'OTHER_FEE','Khoản thu khác',0.00,'once','Khoản thu phát sinh khác',1,90,'2026-06-24 15:30:06','2026-06-24 15:30:06'),(5,'lodging_fee','Phí lưu trú',1200000.00,'monthly','Phí lưu trú',1,10,'2026-06-25 10:13:58','2026-07-25 13:54:42'),(6,'meal_living_fee','Ăn uống sinh hoạt',1800000.00,'monthly','Ăn uống sinh hoạt',1,20,'2026-06-25 10:13:58','2026-07-25 13:54:42'),(7,'other_student_fee','Khoản thu khác của học viên',500000.00,'monthly','Khoản thu khác của học viên',1,30,'2026-06-25 10:13:58','2026-07-25 13:54:42');
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
INSERT INTO `finance_payments` VALUES (1,141,34,1800000.00,'2026-06-29','cash',NULL,1,'2026-06-29 09:31:26','2026-06-29 09:31:26'),(2,140,34,800000.00,'2026-06-29','cash',NULL,1,'2026-06-29 09:31:49','2026-06-29 09:31:49'),(3,139,20,1000000.00,'2026-06-29','cash',NULL,1,'2026-06-29 09:34:40','2026-06-29 09:34:40'),(4,136,27,1200000.00,'2026-06-29','cash','Thu Cao Ngọc Thanh - Tháng 08 / 2026',1,'2026-06-29 13:21:40','2026-06-29 13:21:40'),(5,137,27,1800000.00,'2026-06-29','cash','Thu Cao Ngọc Thanh - Tháng 08 / 2026',1,'2026-06-29 13:21:40','2026-06-29 13:21:40'),(6,15,18,1200000.00,'2026-07-01','cash','Thu Lê Thị Phương Anh - Tháng 01 / 2026',1,'2026-07-01 15:29:42','2026-07-01 15:29:42'),(7,16,18,1800000.00,'2026-07-01','cash','Thu Lê Thị Phương Anh - Tháng 01 / 2026',1,'2026-07-01 15:29:42','2026-07-01 15:29:42'),(8,47,18,1200000.00,'2026-07-01','cash','Thu Lê Thị Phương Anh - Tháng 02 / 2026',1,'2026-07-01 15:29:54','2026-07-01 15:29:54'),(9,48,18,1800000.00,'2026-07-01','cash','Thu Lê Thị Phương Anh - Tháng 02 / 2026',1,'2026-07-01 15:29:54','2026-07-01 15:29:54'),(10,114,18,1200000.00,'2026-07-01','cash','Thu Lê Thị Phương Anh - Tháng 06 / 2026',1,'2026-07-01 15:35:56','2026-07-01 15:35:56'),(11,115,18,1800000.00,'2026-07-01','cash','Thu Lê Thị Phương Anh - Tháng 06 / 2026',1,'2026-07-01 15:35:56','2026-07-01 15:35:56'),(12,81,18,1200000.00,'2026-07-01','cash','Thu Lê Thị Phương Anh - Tháng 07 / 2026',1,'2026-07-01 15:36:39','2026-07-01 15:36:39'),(13,102,25,1200000.00,'2026-07-03','cash','Thu Trần Tú Anh - Tháng 07 / 2026',1,'2026-07-03 05:59:46','2026-07-03 05:59:46'),(14,103,25,1800000.00,'2026-07-03','cash','Thu Trần Tú Anh - Tháng 07 / 2026',1,'2026-07-03 05:59:46','2026-07-03 05:59:46'),(15,101,28,1800000.00,'2026-07-03','cash','Thu Trần Thị Thu Sương - Tháng 07 / 2026',1,'2026-07-03 11:25:51','2026-07-03 11:25:51');
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
INSERT INTO `finance_transactions` VALUES (1,'student_fee_payment','in',1800000.00,'2026-06-29','resident','Hà Vân Mộng','Thu Ăn uống sinh hoạt',NULL,1,'2026-06-29 09:31:26','2026-06-29 09:31:26'),(2,'student_fee_payment','in',800000.00,'2026-06-29','resident','Hà Vân Mộng','Thu Phí lưu trú',NULL,1,'2026-06-29 09:31:49','2026-06-29 09:31:49'),(3,'student_fee_payment','in',1000000.00,'2026-06-29','resident','Cao Thị Khánh Linh','Thu Ăn uống sinh hoạt',NULL,1,'2026-06-29 09:34:40','2026-06-29 09:34:40'),(4,'donation','in',20000000.00,'2026-06-29','donation','Mr Don',NULL,NULL,1,'2026-06-29 09:36:26','2026-06-29 09:36:26'),(5,'student_fee_payment','in',1200000.00,'2026-06-29','resident','Cao Ngọc Thanh','Thu Cao Ngọc Thanh - Tháng 08 / 2026',NULL,1,'2026-06-29 13:21:40','2026-06-29 13:21:40'),(6,'student_fee_payment','in',1800000.00,'2026-06-29','resident','Cao Ngọc Thanh','Thu Cao Ngọc Thanh - Tháng 08 / 2026',NULL,1,'2026-06-29 13:21:40','2026-06-29 13:21:40'),(12,'other_income','in',20000000.00,'2026-07-01','other_income','MR John','Tiền ủng hộ lưu xá',NULL,1,'2026-07-01 13:50:24','2026-07-01 13:50:24'),(13,'expense_plan','out',7500000.00,'2026-07-01','expense_plan_periods:2026-07,2026-08,2026-09,2026-10,2026-11,2026-12','Tiền điện','Chi phí điện vận hành theo kỳ · Nhóm chi: Điện · Áp dụng kỳ: 2026-07, 2026-08, 2026-09, 2026-10, 2026-11, 2026-12 · Số tiền mỗi kỳ: 1250000',NULL,1,'2026-07-01 13:51:36','2026-07-01 13:51:36'),(15,'advance_out','out',20000000.00,'2026-07-01','expense_advance:stationery:week:2026-07-01_2026-07-31:committee','Ban Hậu cần','Tạm ứng văn phòng phẩm theo kỳ · Nhóm chi: Tạm ứng văn phòng phẩm · Loại chi: Tạm ứng theo kỳ · Thời gian: 2026-07-01 → 2026-07-31 · Đối tượng nhận: committee · Đơn vị/cá nhân nhận: Ban Hậu cần · Ghi chú: cần cập nhật chi thực tế hằng ngày và quyết toán cuối kỳ',NULL,1,'2026-07-01 14:29:08','2026-07-01 14:29:08'),(16,'expense','out',400000.00,'2026-07-01','expense_daily:supplies','Mua hoa','Chi phí phát sinh · Nhóm chi: Vật dụng · Loại chi: Chi theo ngày / một lần',NULL,1,'2026-07-01 14:29:33','2026-07-01 14:29:33'),(17,'expense_plan','out',7380000.00,'2026-07-01','plan:202607-202612:first:01','Tiền nước','Chi phí nước sinh hoạt theo kỳ · Nhóm chi: Nước · Áp dụng kỳ: 2026-07, 2026-08, 2026-09, 2026-10, 2026-11, 2026-12 · Số tiền mỗi kỳ: 1230000 · Ngày dự chi: đầu kỳ',NULL,1,'2026-07-01 14:29:51','2026-07-01 14:29:51'),(18,'advance_out','out',2000000.00,'2026-07-01','expense_advance:flowers_lights:month:2026-07-01_2026-09-30:committee','Ban Truyền Thông','Tạm ứng hoa nến / hoa đèn theo kỳ · Nhóm chi: Tạm ứng hoa nến · Loại chi: Tạm ứng theo kỳ · Thời gian: 2026-07-01 → 2026-09-30 · Đối tượng nhận: committee · Đơn vị/cá nhân nhận: Ban Truyền Thông · Ghi chú: cần cập nhật chi thực tế hằng ngày và quyết toán cuối kỳ',NULL,1,'2026-07-01 15:21:06','2026-07-01 15:21:06'),(19,'advance_actual_spending','memo',250000.00,'2026-07-01','advance_entry:18','Ban Truyền Thông','Mua hoa',NULL,18,'2026-07-01 15:21:37','2026-07-01 15:21:37'),(20,'advance_actual_spending','memo',200000.00,'2026-07-01','advance_entry:18','Ban Truyền Thông','Mua giấy in',NULL,18,'2026-07-01 15:25:05','2026-07-01 15:25:05'),(21,'student_fee_payment','in',1200000.00,'2026-07-01','resident','Lê Thị Phương Anh','Thu Lê Thị Phương Anh - Tháng 01 / 2026',NULL,1,'2026-07-01 15:29:42','2026-07-01 15:29:42'),(22,'student_fee_payment','in',1800000.00,'2026-07-01','resident','Lê Thị Phương Anh','Thu Lê Thị Phương Anh - Tháng 01 / 2026',NULL,1,'2026-07-01 15:29:42','2026-07-01 15:29:42'),(23,'student_fee_payment','in',1200000.00,'2026-07-01','resident','Lê Thị Phương Anh','Thu Lê Thị Phương Anh - Tháng 02 / 2026',NULL,1,'2026-07-01 15:29:54','2026-07-01 15:29:54'),(24,'student_fee_payment','in',1800000.00,'2026-07-01','resident','Lê Thị Phương Anh','Thu Lê Thị Phương Anh - Tháng 02 / 2026',NULL,1,'2026-07-01 15:29:54','2026-07-01 15:29:54'),(25,'student_fee_payment','in',1200000.00,'2026-07-01','resident','Lê Thị Phương Anh','Thu Lê Thị Phương Anh - Tháng 06 / 2026',NULL,1,'2026-07-01 15:35:56','2026-07-01 15:35:56'),(26,'student_fee_payment','in',1800000.00,'2026-07-01','resident','Lê Thị Phương Anh','Thu Lê Thị Phương Anh - Tháng 06 / 2026',NULL,1,'2026-07-01 15:35:56','2026-07-01 15:35:56'),(27,'student_fee_payment','in',1200000.00,'2026-07-01','resident','Lê Thị Phương Anh','Thu Lê Thị Phương Anh - Tháng 07 / 2026',NULL,1,'2026-07-01 15:36:39','2026-07-01 15:36:39'),(28,'student_fee_payment','in',1200000.00,'2026-07-03','resident','Trần Tú Anh','Thu Trần Tú Anh - Tháng 07 / 2026',NULL,1,'2026-07-03 05:59:46','2026-07-03 05:59:46'),(29,'student_fee_payment','in',1800000.00,'2026-07-03','resident','Trần Tú Anh','Thu Trần Tú Anh - Tháng 07 / 2026',NULL,1,'2026-07-03 05:59:46','2026-07-03 05:59:46'),(30,'other_income','in',2000000.00,'2026-07-03','other_income','Nội thất Hưng hoa','Thanh lý ghế',NULL,1,'2026-07-03 06:00:47','2026-07-03 06:00:47'),(31,'student_fee_payment','in',1800000.00,'2026-07-03','resident','Trần Thị Thu Sương','Thu Trần Thị Thu Sương - Tháng 07 / 2026',NULL,1,'2026-07-03 11:25:51','2026-07-03 11:25:51'),(32,'other_income','in',2000000.00,'2026-07-03','other_income','Bán ve chai','Bán ve chai',NULL,1,'2026-07-03 12:28:40','2026-07-03 12:28:40'),(33,'store_daily_closing','in',2000000.00,'2026-07-13','store_daily_closing_income','Cửa hàng lưu xá','Chốt sổ cửa hàng ngày 2026-07-13 · CHOT-20260713-1\nChi tiết từng giao dịch thu:\n1. Bán hàng sáng ngày 13.07 [THU-20260713-91898]\n   Cộng giao dịch: 2.000.000đ\nTổng thu: 2.000.000đ','STORE-CHOT-20260713-1:IN',1,'2026-07-15 00:24:34','2026-07-25 17:00:11'),(34,'store_daily_closing','out',5000000.00,'2026-07-13','store_daily_closing_expense','Cửa hàng lưu xá','Chốt sổ cửa hàng ngày 2026-07-13 · CHOT-20260713-1\nChi tiết từng giao dịch chi:\n1. Nhập hàng [CHI-20260713-00779]\n   Cộng giao dịch: 5.000.000đ\nTổng chi: 5.000.000đ','STORE-CHOT-20260713-1:OUT',1,'2026-07-15 00:24:34','2026-07-25 17:00:11'),(35,'store_daily_closing','in',145000.00,'2026-07-14','store_daily_closing_income','Cửa hàng lưu xá','Chốt sổ cửa hàng ngày 2026-07-14 · CHOT-20260714-1\nChi tiết từng giao dịch thu:\n1. Bán hàng: Ví Thổ cẩm Nam [BAN-20260714-88225]\n   Cộng giao dịch: 145.000đ\nTổng thu: 145.000đ','STORE-CHOT-20260714-1:IN',1,'2026-07-17 09:05:32','2026-07-25 17:00:11'),(36,'store_daily_closing','out',110000000.00,'2026-07-14','store_daily_closing_expense','Cửa hàng lưu xá','Chốt sổ cửa hàng ngày 2026-07-14 · CHOT-20260714-1\nChi tiết từng giao dịch chi:\n1. Nhập hàng: Ví Thổ cẩm Nam [NHAP-20260714-75474]\n   Nhà cung cấp / nguồn giao: Làng Brok\n   Cộng giao dịch: 110.000.000đ\nTổng chi: 110.000.000đ','STORE-CHOT-20260714-1:OUT',1,'2026-07-17 09:05:32','2026-07-25 17:00:11'),(37,'store_daily_closing','in',850000.00,'2026-07-15','store_daily_closing_income','Cửa hàng lưu xá','Chốt sổ cửa hàng ngày 2026-07-15 · CHOT-20260715-1\nChi tiết từng giao dịch thu:\n1. Bán hàng: Cà phê xay 500G [BAN-20260715-66126]\n   Cộng giao dịch: 850.000đ\nTổng thu: 850.000đ','STORE-CHOT-20260715-1:IN',1,'2026-07-17 09:18:51','2026-07-25 17:00:11'),(38,'store_daily_closing','out',120000000.00,'2026-07-15','store_daily_closing_expense','Cửa hàng lưu xá','Chốt sổ cửa hàng ngày 2026-07-15 · CHOT-20260715-1\nChi tiết từng giao dịch chi:\n1. Mua và nhập kho: Cà phê xay 500G [NHAP-20260715-04115]\n   Nhà cung cấp / nguồn giao: LangBiang\n   Cộng giao dịch: 120.000.000đ\nTổng chi: 120.000.000đ','STORE-CHOT-20260715-1:OUT',1,'2026-07-17 09:18:51','2026-07-25 17:00:11'),(39,'store_daily_closing','out',24500000.00,'2026-07-17','store_daily_closing_expense','Cửa hàng lưu xá','Chốt sổ cửa hàng ngày 2026-07-17 · CHOT-20260717-1\nChi tiết từng giao dịch chi:\n1. Mua hàng nhập kho · PN-20260717-864308 [NHAP-20260717-64324]\n   Nhà cung cấp / nguồn giao: Krong Shop\n   - Cà phê Hạt 500G: 150 gói × 110.000đ = 16.500.000đ\n   - Ví Thổ cẩm Nam: 50 Cái × 110.000đ = 5.500.000đ\n   - Bút bi: 500 cây × 5.000đ = 2.500.000đ\n   Cộng giao dịch: 24.500.000đ\nTổng chi: 24.500.000đ','STORE-CHOT-20260717-1:OUT',1,'2026-07-17 09:30:21','2026-07-25 17:00:11'),(40,'store_daily_closing','in',17240000.00,'2026-07-20','store_daily_closing_income','Cửa hàng lưu xá','Chốt sổ cửa hàng ngày 2026-07-20 · CHOT-20260720-1\nChi tiết từng giao dịch thu:\n1. Bán hàng · BAN-20260720-635483 [BAN-20260720-635483]\n   Khách hàng: Nghi\n   - Cà phê Hạt 500G: 100 gói × 170.000đ = 17.000.000đ\n   - Bút bi: 20 cây × 12.000đ = 240.000đ\n   Cộng giao dịch: 17.240.000đ\nTổng thu: 17.240.000đ','STORE-CHOT-20260720-1:IN',1,'2026-07-20 14:30:48','2026-07-25 17:00:11'),(41,'store_daily_closing','out',260000000.00,'2026-07-20','store_daily_closing_expense','Cửa hàng lưu xá','Chốt sổ cửa hàng ngày 2026-07-20 · CHOT-20260720-1\nChi tiết từng giao dịch chi:\n1. Mua hàng nhập kho · PN-20260720-601806 [PN-20260720-601806]\n   Nhà cung cấp / nguồn giao: Krong\n   - Bộ cồng chiêng lưu niệm: 2.000 cái × 130.000đ = 260.000.000đ\n   Cộng giao dịch: 260.000.000đ\nTổng chi: 260.000.000đ','STORE-CHOT-20260720-1:OUT',1,'2026-07-20 14:30:48','2026-07-25 17:00:11'),(42,'store_daily_closing','in',49450000.00,'2026-07-19','store_daily_closing_income','Cửa hàng lưu xá','Chốt sổ cửa hàng ngày 2026-07-19 · CHOT-20260719-1\nChi tiết từng giao dịch thu:\n1. Bán hàng · BAN-20260719-921531 [BAN-20260719-921531]\n   Khách hàng: Linh Da\n   - Cà phê Hạt 500G: 50 gói × 189.000đ = 9.450.000đ\n   - Cà phê xay 500G: 200 Gói × 200.000đ = 40.000.000đ\n   Cộng giao dịch: 49.450.000đ\nTổng thu: 49.450.000đ','STORE-CHOT-20260719-1:IN',1,'2026-07-20 14:38:55','2026-07-25 17:00:11'),(43,'store_daily_closing','in',4000000.00,'2026-07-21','store_daily_closing_income','Cửa hàng lưu xá','Chốt sổ cửa hàng ngày 2026-07-21 · CHOT-20260721-1\nChi tiết từng giao dịch thu:\n1. Bán hàng · BAN-20260721-291078 [BAN-20260721-291078]\n   Khách hàng: Test\n   - Ví Thổ cẩm Nam: 20 Cái × 170.000đ = 3.400.000đ\n   - Bộ cồng chiêng lưu niệm: 1 cái × 300.000đ = 300.000đ\n   Cộng giao dịch: 3.700.000đ\n2. Bán hàng · BAN-20260721-048165 [BAN-20260721-048165]\n   Khách hàng: Linh\n   - Ví Thổ cẩm Nam: 2 Cái × 150.000đ = 300.000đ\n   Cộng giao dịch: 300.000đ\nTổng thu: 4.000.000đ','STORE-CHOT-20260721-1:IN',1,'2026-07-22 06:20:29','2026-07-25 17:00:11'),(44,'store_daily_closing','out',60000000.00,'2026-07-21','store_daily_closing_expense','Cửa hàng lưu xá','Chốt sổ cửa hàng ngày 2026-07-21 · CHOT-20260721-1\nChi tiết từng giao dịch chi:\n1. Mua hàng nhập kho · PN-20260721-111705 [PN-20260721-111705]\n   Nhà cung cấp / nguồn giao: Krong\n   - Cà phê Hạt 500G: 500 gói × 120.000đ = 60.000.000đ\n   Cộng giao dịch: 60.000.000đ\nTổng chi: 60.000.000đ','STORE-CHOT-20260721-1:OUT',1,'2026-07-22 06:20:29','2026-07-25 17:00:11');
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
INSERT INTO `notifications` VALUES (1,27,'task_assigned','Bạn có công tác mới','Rửa chén ca tối được phân công cho Cao Ngọc Thanh, ngày 08/07/2026, 09/07/2026, 10/07/2026 và 21 ngày khác.','duty',23,0,'2026-07-07 15:58:40',NULL,'2026-07-07 15:58:40'),(2,18,'task_assigned','Bạn có công tác mới','Rửa chén ca tối được phân công cho Lê Thị Phương Anh, ngày 08/07/2026, 09/07/2026, 10/07/2026 và 21 ngày khác.','duty',23,1,'2026-07-07 15:58:40','2026-07-07 16:00:23','2026-07-07 15:58:40'),(3,33,'task_assigned','Bạn có công tác mới','Rửa chén ca tối được phân công cho Phan Gia Lâm, ngày 08/07/2026, 09/07/2026, 10/07/2026 và 21 ngày khác.','duty',23,0,'2026-07-07 15:58:40',NULL,'2026-07-07 15:58:40'),(4,18,'task_assigned','Bạn có công tác mới','Tập hát được phân công cho Lê Thị Phương Anh, ngày 10/07/2026, 14/07/2026, 17/07/2026 và 12 ngày khác.','duty',26,1,'2026-07-07 15:59:29','2026-07-07 16:00:24','2026-07-07 15:59:29'),(5,18,'task_assigned','Bạn có công tác mới','Nấu ăn tối được phân công cho Lê Thị Phương Anh, ngày 08/07/2026.','duty',22,1,'2026-07-07 18:04:29','2026-07-08 15:41:05','2026-07-07 18:04:29'),(6,18,'task_assigned','Bạn có công tác mới','Đi chợ được phân công cho Lê Thị Phương Anh, ngày 20/07/2026.','duty',15,0,'2026-07-19 19:16:22',NULL,'2026-07-19 19:16:22'),(7,20,'task_assigned','Bạn có công tác mới','Trực cửa hàng ca sáng được phân công cho Cao Thị Khánh Linh, ngày 20/07/2026.','duty',24,0,'2026-07-20 06:03:48',NULL,'2026-07-20 06:03:48'),(8,18,'task_assigned','Bạn có công tác mới','Trực cửa hàng ca chiều được phân công cho Lê Thị Phương Anh, ngày 20/07/2026.','duty',25,0,'2026-07-20 06:04:30',NULL,'2026-07-20 06:04:30'),(9,18,'task_assigned','Bạn có công tác mới','Trực cửa hàng ca sáng được phân công cho Lê Thị Phương Anh, ngày 21/07/2026.','duty',24,0,'2026-07-20 19:33:53',NULL,'2026-07-20 19:33:53'),(10,18,'system','Mã vào Cửa hàng','Cửa hàng lưu xá · ca sáng. Mã truy cập của bạn là 898927. Vào mục Công tác, chọn Vào cửa hàng và nhập mã này. Mã chỉ dùng trong thời gian ca trực; quyền Cửa hàng hết sau 30 phút không hoạt động.','store_shift_access',3,1,'2026-07-20 21:19:06','2026-07-20 21:19:36','2026-07-20 21:19:06'),(11,18,'system','Mã vào Cửa hàng','Cửa hàng lưu xá · ca sáng. Mã truy cập của bạn là 221399. Vào mục Công tác, chọn Vào cửa hàng và nhập mã này. Mã chỉ dùng trong thời gian ca trực; quyền Cửa hàng hết sau 30 phút không hoạt động.','store_shift_access',3,1,'2026-07-20 21:43:45','2026-07-20 23:30:04','2026-07-20 21:43:45'),(12,18,'system','Mã vào Cửa hàng','Cửa hàng lưu xá · ca sáng. Mã truy cập của bạn là 496479. Vào mục Công tác, chọn Vào cửa hàng và nhập mã này. Mã chỉ dùng trong thời gian ca trực; quyền Cửa hàng hết sau 30 phút không hoạt động.','store_shift_access',3,0,'2026-07-20 21:44:05',NULL,'2026-07-20 21:44:05'),(13,18,'system','Mã vào Cửa hàng','Cửa hàng lưu xá · ca sáng. Mã truy cập của bạn là 498141. Vào mục Công tác, chọn Vào cửa hàng và nhập mã này. Mã chỉ dùng trong thời gian ca trực; quyền Cửa hàng hết sau 30 phút không hoạt động.','store_shift_access',3,1,'2026-07-20 21:44:06','2026-07-20 23:30:02','2026-07-20 21:44:06'),(14,18,'system','Mã vào Cửa hàng','Cửa hàng lưu xá · ca sáng. Mã truy cập của bạn là 644226. Vào mục Công tác, chọn Vào cửa hàng và nhập mã này. Mã chỉ dùng trong thời gian ca trực; quyền Cửa hàng hết sau 30 phút không hoạt động.','store_shift_access',3,0,'2026-07-20 21:44:07',NULL,'2026-07-20 21:44:07'),(15,34,'task_assigned','Bạn có công tác mới','Trực cửa hàng ca chiều được phân công cho Hà Vân Mộng, ngày 21/07/2026.','duty',25,1,'2026-07-21 00:45:45','2026-07-21 00:45:54','2026-07-21 00:45:45'),(16,34,'system','Mã vào Cửa hàng','Cửa hàng lưu xá · ca chiều. Mã truy cập của bạn là 290105. Vào mục Công tác, chọn Vào cửa hàng và nhập mã này. Mã chỉ dùng trong thời gian ca trực; quyền Cửa hàng hết sau 30 phút không hoạt động.','store_shift_access',4,0,'2026-07-21 01:02:52',NULL,'2026-07-21 01:02:52'),(17,34,'system','Mã vào Cửa hàng','Cửa hàng lưu xá · ca chiều. Mã truy cập của bạn là 220588. Vào mục Công tác, chọn Vào cửa hàng và nhập mã này. Mã chỉ dùng trong thời gian ca trực; quyền Cửa hàng hết sau 30 phút không hoạt động.','store_shift_access',4,1,'2026-07-21 01:03:31','2026-07-21 01:03:34','2026-07-21 01:03:31'),(18,34,'system','Mã vào Cửa hàng','Cửa hàng lưu xá · ca chiều. Mã truy cập của bạn là 237917. Vào mục Công tác, chọn Vào cửa hàng và nhập mã này. Mã chỉ dùng trong thời gian ca trực; quyền Cửa hàng hết sau 30 phút không hoạt động.','store_shift_access',4,1,'2026-07-21 02:00:49','2026-07-21 02:01:12','2026-07-21 02:00:49');
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
INSERT INTO `organization_assignments` VALUES (18,1,1,18,7,'2026-06-16',NULL,'active',NULL,'2026-06-16 15:13:56','2026-06-16 15:13:56',NULL,'Trưởng'),(19,1,5,18,7,'2026-06-16','2026-06-16','ended',NULL,'2026-06-16 15:14:15','2026-06-16 08:15:04',1,'Tổ trưởng Tổ 1'),(20,1,5,18,7,'2026-06-16',NULL,'active',NULL,'2026-06-16 15:15:19','2026-06-16 08:15:36',3,'Tổ trưởng Tổ 3'),(21,1,5,32,10,'2026-06-16',NULL,'active',NULL,'2026-06-16 15:16:17','2026-06-16 15:16:17',1,'Tổ trưởng Tổ 1'),(22,1,5,30,9,'2026-06-16',NULL,'active',NULL,'2026-06-16 15:16:40','2026-06-16 15:16:40',2,'Tổ trưởng Tổ 2'),(23,1,5,20,8,'2026-06-16',NULL,'active',NULL,'2026-06-16 15:16:59','2026-06-16 15:16:59',7,'Tổ trưởng Tổ 4'),(24,1,6,18,7,'2026-06-16',NULL,'active',NULL,'2026-06-16 15:17:22','2026-06-16 15:17:22',6,'Trưởng ban Truyền Thông'),(25,1,2,34,9,'2026-06-16','2026-06-18','ended',NULL,'2026-06-16 15:17:30','2026-06-18 00:03:31',NULL,'Phó'),(26,1,3,22,7,'2026-06-16','2026-06-18','ended',NULL,'2026-06-16 15:17:35','2026-06-18 00:03:33',NULL,'Thư ký'),(27,1,4,30,9,'2026-06-16',NULL,'active',NULL,'2026-06-16 15:17:41','2026-06-16 15:17:41',NULL,'Thủ quỹ'),(28,1,2,20,8,'2026-06-16','2026-06-18','ended',NULL,'2026-06-16 23:41:41','2026-06-18 07:30:46',NULL,'Phó'),(29,1,2,19,8,'2026-06-18',NULL,'active',NULL,'2026-06-18 14:31:07','2026-06-18 14:31:07',NULL,'Phó'),(30,1,3,29,7,'2026-06-18',NULL,'active',NULL,'2026-06-18 14:31:16','2026-06-18 14:31:16',NULL,'Thư ký'),(31,1,2,31,8,'2026-06-29',NULL,'active',NULL,'2026-06-29 02:27:05','2026-06-29 02:27:05',NULL,'Phó'),(32,1,6,33,9,'2026-06-30',NULL,'active',NULL,'2026-06-30 23:40:19','2026-06-30 23:40:19',8,'Trưởng ban Hậu cần'),(33,1,6,19,8,'2026-06-30',NULL,'active',NULL,'2026-06-30 23:40:40','2026-06-30 23:40:40',4,'Trưởng ban Thanh nhạc'),(34,1,6,25,9,'2026-06-30',NULL,'active',NULL,'2026-06-30 23:40:49','2026-06-30 16:40:58',5,'Trưởng ban sinh hoạt');
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
INSERT INTO `organization_unit_members` VALUES (17,4,18,'member','inactive','2026-06-16','2026-06-16',NULL,'2026-06-16 15:10:50','2026-06-16 08:11:30'),(18,4,33,'member','inactive','2026-06-16','2026-06-16',NULL,'2026-06-16 15:10:52','2026-06-16 08:11:30'),(19,4,32,'member','inactive','2026-06-16','2026-06-16',NULL,'2026-06-16 15:10:55','2026-06-16 08:11:31'),(20,4,20,'member','inactive','2026-06-16','2026-06-16',NULL,'2026-06-16 15:10:58','2026-06-16 08:11:32'),(21,4,28,'member','active','2026-06-16',NULL,NULL,'2026-06-16 15:11:02','2026-06-16 15:11:02'),(22,4,22,'member','active','2026-06-16',NULL,NULL,'2026-06-16 15:11:06','2026-06-16 15:11:06'),(23,1,20,'member','inactive','2026-06-16','2026-06-16',NULL,'2026-06-16 15:11:37','2026-06-16 08:12:39'),(24,1,26,'member','active','2026-06-16',NULL,NULL,'2026-06-16 15:11:39','2026-06-16 15:11:39'),(25,1,32,'member','active','2026-06-16',NULL,NULL,'2026-06-16 15:11:42','2026-06-16 15:11:42'),(26,1,24,'member','active','2026-06-16',NULL,NULL,'2026-06-16 15:11:46','2026-06-16 15:11:46'),(27,1,22,'member','active','2026-06-16',NULL,NULL,'2026-06-16 15:11:49','2026-06-16 15:11:49'),(28,1,34,'member','active','2026-06-16',NULL,NULL,'2026-06-16 15:11:56','2026-06-16 15:11:56'),(29,2,28,'member','inactive','2026-06-16','2026-06-16',NULL,'2026-06-16 15:12:05','2026-06-16 08:13:25'),(30,2,21,'member','active','2026-06-16',NULL,NULL,'2026-06-16 15:12:06','2026-06-16 15:12:06'),(31,2,29,'member','inactive','2026-06-16','2026-06-16',NULL,'2026-06-16 15:12:08','2026-06-16 08:12:46'),(32,2,30,'member','active','2026-06-16',NULL,NULL,'2026-06-16 15:12:10','2026-06-16 15:12:10'),(33,2,31,'member','active','2026-06-16',NULL,NULL,'2026-06-16 15:12:12','2026-06-16 15:12:12'),(34,2,27,'member','active','2026-06-16',NULL,NULL,'2026-06-16 15:12:15','2026-06-16 15:12:15'),(35,7,20,'member','active','2026-06-16',NULL,NULL,'2026-06-16 15:12:51','2026-06-16 15:12:51'),(36,7,25,'member','active','2026-06-16',NULL,NULL,'2026-06-16 15:12:52','2026-06-16 15:12:52'),(37,7,33,'member','active','2026-06-16',NULL,NULL,'2026-06-16 15:12:54','2026-06-16 15:12:54'),(38,7,23,'member','active','2026-06-16',NULL,NULL,'2026-06-16 15:12:56','2026-06-16 15:12:56'),(39,3,18,'member','active','2026-06-16',NULL,NULL,'2026-06-16 15:13:05','2026-06-16 15:13:05'),(40,3,19,'member','active','2026-06-16',NULL,NULL,'2026-06-16 15:13:07','2026-06-16 15:13:07'),(41,3,29,'member','active','2026-06-16',NULL,NULL,'2026-06-16 15:13:09','2026-06-16 15:13:09'),(42,3,28,'member','active','2026-06-16',NULL,'Chuyển sang Tổ 3 từ màn quản lý Tổ/Ban','2026-06-16 15:13:24','2026-06-16 15:13:24'),(43,6,18,'head','active','2026-06-16',NULL,'Tự động thêm khi bổ nhiệm Trưởng ban.','2026-06-16 15:17:22','2026-06-16 15:17:22'),(44,5,20,'member','active','2026-06-16',NULL,NULL,'2026-06-16 23:37:46','2026-06-16 23:37:46'),(45,4,20,'member','active','2026-06-16',NULL,NULL,'2026-06-16 23:37:54','2026-06-16 23:37:54'),(46,5,34,'member','active','2026-06-16',NULL,NULL,'2026-06-16 23:40:09','2026-06-16 23:40:09'),(47,8,33,'head','active','2026-06-30',NULL,'Tự động thêm khi bổ nhiệm Trưởng ban.','2026-06-30 23:40:19','2026-06-30 23:40:19'),(48,4,19,'head','active','2026-06-30',NULL,'Tự động thêm khi bổ nhiệm Trưởng ban.','2026-06-30 23:40:40','2026-06-30 23:40:40'),(49,5,32,'head','active','2026-06-30',NULL,'Tự động thêm khi bổ nhiệm Trưởng ban.','2026-06-30 23:40:49','2026-06-30 23:40:49'),(50,5,25,'head','active','2026-06-30',NULL,'Tự động thêm khi bổ nhiệm Trưởng ban.','2026-06-30 23:40:57','2026-06-30 23:40:57');
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parents`
--

LOCK TABLES `parents` WRITE;
/*!40000 ALTER TABLE `parents` DISABLE KEYS */;
INSERT INTO `parents` VALUES (8,18,'father','Lê Tham Linh','0909168190',NULL,NULL,NULL,'Xuân Lộc, Đồng Nai',NULL,'2026-06-15 22:43:45','2026-06-15 22:43:45'),(9,19,'mother','Lý Thị Tông','0134678902',NULL,NULL,NULL,'DakLak',NULL,'2026-06-15 22:47:48','2026-06-15 22:47:48'),(10,28,'father','Trần Lý','0909878271',NULL,NULL,NULL,'Xuân Lộc, Đồng Nai',NULL,'2026-06-16 15:05:30','2026-06-16 15:05:30'),(11,25,'father','Trần Quý Linh','09098713425',NULL,NULL,NULL,'Hồ Chí Minh',NULL,'2026-06-16 15:06:43','2026-06-16 15:06:43'),(12,22,'mother','Lâm Vân','0908768190',NULL,'0910394019',NULL,'Đức Phổ, Quãng Ngãi',NULL,'2026-06-16 15:07:58','2026-06-16 15:07:58'),(13,20,'father','Cao An','092876481',NULL,NULL,NULL,'Gia Lai',NULL,'2026-06-16 23:18:51','2026-06-16 16:19:01');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `residenteducation`
--

LOCK TABLES `residenteducation` WRITE;
/*!40000 ALTER TABLE `residenteducation` DISABLE KEYS */;
INSERT INTO `residenteducation` VALUES (3,20,'Cao Đẳng Sư Phạm DakLak','university','Sư phạm Hoá','2024',NULL,1,'2026-06-16 16:19:35','2026-06-17 09:11:45'),(4,18,'Đại Học Sư Phạm DakLak','university','Sư phạm Tin','2023',NULL,1,'2026-06-17 08:18:49','2026-06-17 08:18:49');
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
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `residents`
--

LOCK TABLES `residents` WRITE;
/*!40000 ALTER TABLE `residents` DISABLE KEYS */;
INSERT INTO `residents` VALUES (18,'LX2026368495','Maria',18,'Lê Thị Phương Anh','2003-04-17','female','0909168190','Xuân Lộc, Đồng Nai','0943224567',NULL,NULL,'active',7,'2026-06-15',NULL,NULL,'2026-06-15 22:42:48','2026-06-15 15:45:37'),(19,'LX2026644114','Ane',19,'Trần Thanh Trà','2004-04-18','female','00671330401','DakLak','0987098172',NULL,NULL,'active',8,'2026-06-15',NULL,NULL,'2026-06-15 22:47:24','2026-06-17 15:42:07'),(20,'LX2026729949','Ane',20,'Cao Thị Khánh Linh','2002-07-22','female','0671168822','Gia Lai','0928746301',NULL,NULL,'active',10,'2026-06-15',NULL,NULL,'2026-06-15 22:48:49','2026-07-03 08:53:45'),(21,'LX2026775677','Matta',21,'Lâm Ngọc Xuyến','2002-01-30','female','97482013201','Di Linh','0678943152',NULL,NULL,'active',7,'2026-06-15',NULL,NULL,'2026-06-15 22:49:35','2026-06-16 08:03:12'),(22,'LX2026267372','Teresa',22,'Lương Giang Huyền','2002-04-29','female','678092731','Đức Phổ, Quãng Ngãi','987328910',NULL,NULL,'active',7,'2026-06-16',NULL,NULL,'2026-06-16 14:47:47','2026-06-16 08:07:25'),(23,'LX2026309663','Isave',23,'Hoàng Anh Trúc','1999-05-28','female','9028479501',NULL,'8909010903',NULL,NULL,'active',10,'2026-06-16',NULL,NULL,'2026-06-16 14:48:29','2026-06-17 08:00:34'),(24,'LX2026386284','Maria',24,'Quách Gia Liễu','1998-11-10','female','345678920',NULL,'1234567890',NULL,NULL,'active',9,'2026-06-16',NULL,NULL,'2026-06-16 14:49:46','2026-06-16 08:03:17'),(25,'LX2026461129','Teresa',25,'Trần Tú Anh','2001-02-23','female','098904001','Hồ Chí Minh','456789203003',NULL,NULL,'active',9,'2026-06-16',NULL,NULL,'2026-06-16 14:51:01','2026-06-16 08:06:24'),(26,'LX2026488342','Anne',26,'Trần Tú Xương','1999-11-23','female','23456789',NULL,'456789067891',NULL,NULL,'transferred_out',NULL,'2026-06-16','2026-06-17',NULL,'2026-06-16 14:51:28','2026-06-17 07:57:13'),(27,'LX2026677402','Cecillia',27,'Cao Ngọc Thanh','2002-03-27','female','093984040',NULL,'0987653112',NULL,NULL,'active',10,'2026-06-16',NULL,NULL,'2026-06-16 14:54:37','2026-06-16 08:19:42'),(28,'LX2026736253',NULL,28,'Trần Thị Thu Sương','1997-10-13','female','09090274950','Xuân Lộc, Đồng Nai','0967893112',NULL,NULL,'active',7,'2026-06-16',NULL,NULL,'2026-06-16 14:55:36','2026-06-16 08:05:42'),(29,'LX2026868211','Maria',29,'Lý Thị Nga','2003-01-23','female','09049909091',NULL,'45678912345',NULL,NULL,'active',7,'2026-06-16',NULL,NULL,'2026-06-16 14:57:48','2026-06-16 08:03:26'),(30,'LX2026905665','Ane',30,'Sương Thị Mai','1999-10-04','female','0910394019',NULL,'56789012345',NULL,NULL,'active',9,'2026-06-16',NULL,NULL,'2026-06-16 14:58:25','2026-06-17 15:41:52'),(31,'LX2026949137','Maria',31,'Nguyễn Thị Tuyết','1998-07-16','female','0982168822',NULL,'0915678902',NULL,NULL,'active',8,'2026-06-16',NULL,NULL,'2026-06-16 14:59:09','2026-06-16 08:03:21'),(32,'LX2026026492','Catarina',32,'Trần Phúc Giang','2002-05-29','female','0980993094',NULL,'0987653678',NULL,NULL,'active',10,'2026-06-16',NULL,NULL,'2026-06-16 15:00:26','2026-06-16 08:03:00'),(33,'LX2026077927','Matta',33,'Phan Gia Lâm','2002-06-28','female','12345678765432',NULL,'234567654321',NULL,NULL,'active',9,'2026-06-16',NULL,NULL,'2026-06-16 15:01:17','2026-06-16 08:03:07'),(34,'LX2026124333','Ane',34,'Hà Vân Mộng','2000-01-31','female','90230900',NULL,'0989098098',NULL,NULL,'active',9,'2026-06-16',NULL,NULL,'2026-06-16 15:02:04','2026-06-17 15:41:39');
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `residentstudyschedules`
--

LOCK TABLES `residentstudyschedules` WRITE;
/*!40000 ALTER TABLE `residentstudyschedules` DISABLE KEYS */;
INSERT INTO `residentstudyschedules` VALUES (6,20,'monday','08:00:00','12:00:00','Toán','Trường',NULL,1,'2026-06-17 08:09:36','2026-06-17 08:09:36'),(7,20,'tuesday','08:00:00','12:00:00','Tiếng Anh','Trường học',NULL,1,'2026-06-17 08:10:19','2026-06-17 15:22:31'),(8,18,'monday','07:00:00','11:00:00','Tin học',NULL,NULL,1,'2026-06-17 08:19:06','2026-06-17 08:19:06'),(9,18,'wednesday','13:00:00','16:00:00','Tiếng Anh',NULL,NULL,1,'2026-06-17 08:20:04','2026-06-17 08:20:04'),(10,18,'tuesday','08:00:00','12:00:00',NULL,'Trường',NULL,1,'2026-06-17 08:22:41','2026-06-17 08:22:41'),(11,18,'saturday','08:00:00','12:00:00',NULL,'Trường',NULL,1,'2026-06-17 08:22:41','2026-06-17 08:22:41'),(12,20,'saturday','08:00:00','12:00:00',NULL,'Trường',NULL,1,'2026-07-03 17:36:36','2026-07-03 17:36:36');
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
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roomassignments`
--

LOCK TABLES `roomassignments` WRITE;
/*!40000 ALTER TABLE `roomassignments` DISABLE KEYS */;
INSERT INTO `roomassignments` VALUES (27,18,7,'2026-06-15',NULL,'new_entry',NULL,NULL,'2026-06-15 22:45:37','2026-06-15 22:45:37'),(28,19,8,'2026-06-15',NULL,'new_entry',NULL,NULL,'2026-06-15 22:48:00','2026-06-15 22:48:00'),(29,20,8,'2026-06-16','2026-07-03','new_entry','Chuyển phòng',NULL,'2026-06-16 15:02:32','2026-07-03 15:53:44'),(30,34,9,'2026-06-16',NULL,'new_entry',NULL,NULL,'2026-06-16 15:02:41','2026-06-16 15:02:41'),(31,30,9,'2026-06-16',NULL,'new_entry',NULL,NULL,'2026-06-16 15:02:49','2026-06-16 15:02:49'),(32,26,10,'2026-06-16','2026-06-17','new_entry','Rời lưu xá / ngừng lưu trú',NULL,'2026-06-16 15:02:56','2026-06-17 14:57:13'),(33,32,10,'2026-06-16',NULL,'new_entry',NULL,NULL,'2026-06-16 15:03:00','2026-06-16 15:03:00'),(34,33,9,'2026-06-16',NULL,'new_entry',NULL,NULL,'2026-06-16 15:03:07','2026-06-16 15:03:07'),(35,21,7,'2026-06-16',NULL,'new_entry',NULL,NULL,'2026-06-16 15:03:12','2026-06-16 15:03:12'),(36,24,9,'2026-06-16',NULL,'new_entry',NULL,NULL,'2026-06-16 15:03:16','2026-06-16 15:03:16'),(37,31,8,'2026-06-16',NULL,'new_entry',NULL,NULL,'2026-06-16 15:03:21','2026-06-16 15:03:21'),(38,29,7,'2026-06-16',NULL,'new_entry',NULL,NULL,'2026-06-16 15:03:26','2026-06-16 15:03:26'),(39,27,7,'2026-06-16','2026-06-16','new_entry','Rời lưu xá / ngừng lưu trú',NULL,'2026-06-16 15:03:30','2026-06-16 15:19:28'),(40,23,9,'2026-06-16','2026-06-17','new_entry','Chuyển phòng',NULL,'2026-06-16 15:03:42','2026-06-17 15:00:34'),(41,28,7,'2026-06-16',NULL,'new_entry',NULL,NULL,'2026-06-16 15:04:23','2026-06-16 15:04:23'),(42,25,9,'2026-06-16',NULL,'new_entry',NULL,NULL,'2026-06-16 15:04:27','2026-06-16 15:04:27'),(43,22,7,'2026-06-16',NULL,'new_entry',NULL,NULL,'2026-06-16 15:04:31','2026-06-16 15:04:31'),(44,27,10,'2026-06-16',NULL,'new_entry',NULL,NULL,'2026-06-16 15:19:42','2026-06-16 15:19:42'),(45,23,10,'2026-06-17',NULL,'transfer',NULL,NULL,'2026-06-17 15:00:34','2026-06-17 15:00:34'),(46,20,10,'2026-07-03',NULL,'transfer',NULL,NULL,'2026-07-03 15:53:44','2026-07-03 15:53:44');
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (7,'P109',8,'2026-06-15 22:45:34','2026-06-15 22:45:34',NULL,'Phòng 109'),(8,'P108',6,'2026-06-15 22:46:00','2026-06-15 22:46:00',NULL,'Phòng 108'),(9,'P106',6,'2026-06-15 22:46:15','2026-06-15 22:46:15',NULL,'Phòng 106'),(10,'P201',4,'2026-06-15 22:46:36','2026-06-15 22:46:36',NULL,'Phòng 201 (Khu B)'),(11,'P202',6,'2026-06-17 23:17:48','2026-06-17 23:17:48',NULL,'Phòng 202 (Khu B)'),(12,'P203',4,'2026-06-17 23:20:38','2026-06-17 23:20:38',NULL,'Phòng 203 (Khu B)');
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
INSERT INTO `sessions` VALUES ('_9_WiSfnIb4x5jmwDeh8l',1,'2026-07-31 23:54:01','2026-07-24 23:54:01'),('0XgOWzl2a2n2MicmPICHU',1,'2026-07-31 23:54:31','2026-07-24 23:54:31'),('29sRmetp7vXLzcGm4UcV_',1,'2026-06-29 00:13:58','2026-06-22 00:13:58'),('6z2GWZBAvvqeymo3G0-b7',18,'2026-06-22 15:45:04','2026-06-15 15:45:04'),('7OVoAdLsmHk7nqJvHibKg',18,'2026-07-28 21:21:53','2026-07-21 21:21:53'),('ATiQ9X9mlV0W422hxifw1',34,'2026-07-28 00:31:34','2026-07-21 00:31:34'),('bACtF9bQOVUlQVeYtQsZ4',1,'2026-08-01 02:59:24','2026-07-25 02:59:24'),('cLNFMUI7CeY5wlk2q3zN7',18,'2026-06-23 07:53:29','2026-06-16 07:53:29'),('dicPwomPN89EZi_fq8lhn',1,'2026-07-28 21:33:35','2026-07-21 21:33:35'),('Do5aNzzjlKnADKrPCNatX',1,'2026-07-24 15:58:06','2026-07-17 15:58:06'),('DSPihiVgewoCk0Io0LnCI',18,'2026-07-28 00:07:50','2026-07-21 00:07:50'),('fr7ExtW8nHX5kIfMbCbQC',18,'2026-07-08 01:19:47','2026-07-01 01:19:47'),('frxt-WeXQHO2p-kygi1PG',34,'2026-07-28 00:07:25','2026-07-21 00:07:25'),('FSbjhkeUK0vDzmhfqb0zM',1,'2026-06-30 16:14:31','2026-06-23 16:14:31'),('JVF9SG6kIgyn0Ih2FEVTz',1,'2026-06-22 15:43:07','2026-06-15 15:43:07'),('n3GPA58hnogcmPEjd4cG5',18,'2026-06-22 15:44:38','2026-06-15 15:44:38'),('oUF5uLnbN2R8HdOTHoZpf',1,'2026-07-01 06:50:47','2026-06-24 06:50:47'),('OvlrYHJBEH6gmHMN6P1Y5',18,'2026-07-28 21:10:40','2026-07-21 21:10:40'),('pofSWlE9iSABndMYGdV7w',1,'2026-07-23 01:07:29','2026-07-16 01:07:29'),('uFU5D0tHkimQ4Ck98N1YW',1,'2026-07-31 23:55:48','2026-07-24 23:55:48'),('Whrff8nTKO0TltgW0-mIO',18,'2026-07-28 16:54:51','2026-07-21 16:54:51'),('Wm7j10r_HjVMF1uPLYuyW',34,'2026-07-28 00:32:02','2026-07-21 00:32:02'),('z4WKSzWASPd9SDVrQCPlW',1,'2026-07-28 21:19:51','2026-07-21 21:19:51'),('zQCipZnp4q95KDeNpt2pj',1,'2026-07-28 20:55:24','2026-07-21 20:55:24');
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
INSERT INTO `storedailyclosings` VALUES (4,1,'CHOT-20260713-1','2026-07-13',2000000.00,5000000.00,-3000000.00,2,'approved',1,'2026-07-14 17:22:29',1,'STORE-CHOT-20260713-1',NULL,NULL,NULL,1,'2026-07-14 10:24:35',1,'2026-07-14 17:24:35',1,'2026-07-14 17:16:16','2026-07-14 17:24:34'),(5,1,'CHOT-20260714-1','2026-07-14',145000.00,110000000.00,-109855000.00,2,'approved',1,'2026-07-14 17:46:34',1,'STORE-CHOT-20260714-1',NULL,NULL,NULL,1,'2026-07-16 19:05:32',1,'2026-07-17 02:05:32',1,'2026-07-14 17:46:33','2026-07-17 02:05:32'),(6,1,'CHOT-20260715-1','2026-07-15',850000.00,120000000.00,-119150000.00,2,'approved',1,'2026-07-17 02:18:49',1,'STORE-CHOT-20260715-1',NULL,NULL,NULL,1,'2026-07-16 19:18:52',1,'2026-07-17 02:18:52',1,'2026-07-17 02:18:49','2026-07-17 02:18:51'),(7,1,'CHOT-20260717-1','2026-07-17',0.00,24500000.00,-24500000.00,1,'approved',1,'2026-07-17 02:30:16',1,'STORE-CHOT-20260717-1',NULL,NULL,NULL,1,'2026-07-16 19:30:22',1,'2026-07-17 02:30:22',1,'2026-07-17 02:30:16','2026-07-17 02:30:21'),(8,1,'CHOT-20260720-1','2026-07-20',17240000.00,260000000.00,-242760000.00,2,'approved',1,'2026-07-20 07:30:46',1,'STORE-CHOT-20260720-1',NULL,NULL,NULL,1,'2026-07-20 00:30:49',1,'2026-07-20 07:30:49',1,'2026-07-20 07:30:46','2026-07-20 07:30:48'),(9,1,'CHOT-20260719-1','2026-07-19',49450000.00,0.00,49450000.00,1,'approved',1,'2026-07-20 07:38:52',1,'STORE-CHOT-20260719-1',NULL,NULL,NULL,1,'2026-07-20 00:38:55',1,'2026-07-20 07:38:55',1,'2026-07-20 07:38:52','2026-07-20 07:38:55'),(10,1,'CHOT-20260721-1','2026-07-21',4000000.00,60000000.00,-56000000.00,3,'approved',34,'2026-07-21 23:20:14',1,'STORE-CHOT-20260721-1',NULL,NULL,NULL,1,'2026-07-21 16:20:30',1,'2026-07-21 23:20:30',34,'2026-07-21 23:20:14','2026-07-21 23:20:29');
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
INSERT INTO `storedocumentlines` VALUES (1,1,11,1,150.00,110000.00,0.00,16500000.00,NULL,'2026-07-17 02:04:24'),(2,1,9,2,50.00,110000.00,0.00,5500000.00,NULL,'2026-07-17 02:04:24'),(3,1,3,3,500.00,5000.00,0.00,2500000.00,NULL,'2026-07-17 02:04:24'),(4,2,12,1,2000.00,130000.00,0.00,260000000.00,NULL,'2026-07-20 07:30:01'),(5,3,11,1,100.00,110000.00,170000.00,17000000.00,NULL,'2026-07-20 07:30:35'),(6,3,3,2,20.00,5000.00,12000.00,240000.00,NULL,'2026-07-20 07:30:35'),(7,4,11,1,50.00,110000.00,189000.00,9450000.00,NULL,'2026-07-20 07:35:21'),(8,4,7,2,200.00,120000.00,200000.00,40000000.00,NULL,'2026-07-20 07:35:21'),(9,5,9,1,20.00,110000.00,170000.00,3400000.00,NULL,'2026-07-21 04:48:11'),(10,5,12,2,1.00,130000.00,300000.00,300000.00,NULL,'2026-07-21 04:48:11'),(11,6,9,1,2.00,110000.00,150000.00,300000.00,NULL,'2026-07-21 08:04:08'),(12,7,11,1,500.00,120000.00,0.00,60000000.00,NULL,'2026-07-21 08:05:11');
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
INSERT INTO `storedocuments` VALUES (1,1,8,NULL,NULL,NULL,'PN-20260717-864308','stock_in','2026-07-17','purchase','Krong Shop','cash',700.00,24500000.00,NULL,'posted',1,'2026-07-17 02:04:24','2026-07-17 02:04:24'),(2,1,9,NULL,NULL,NULL,'PN-20260720-601806','stock_in','2026-07-20','purchase','Krong','cash',2000.00,260000000.00,NULL,'posted',1,'2026-07-20 07:30:01','2026-07-20 07:30:01'),(3,1,10,NULL,NULL,NULL,'BAN-20260720-635483','sale','2026-07-20',NULL,'Nghi','cash',120.00,17240000.00,NULL,'posted',1,'2026-07-20 07:30:35','2026-07-20 07:30:35'),(4,1,11,NULL,NULL,NULL,'BAN-20260719-921531','sale','2026-07-19',NULL,'Linh Da','cash',250.00,49450000.00,NULL,'posted',1,'2026-07-20 07:35:21','2026-07-20 07:35:21'),(5,1,12,NULL,NULL,NULL,'BAN-20260721-291078','sale','2026-07-21',NULL,'Test','cash',21.00,3700000.00,NULL,'posted',18,'2026-07-21 04:48:11','2026-07-21 04:48:11'),(6,1,13,NULL,NULL,NULL,'BAN-20260721-048165','sale','2026-07-21',NULL,'Linh','cash',2.00,300000.00,NULL,'posted',34,'2026-07-21 08:04:08','2026-07-21 08:04:08'),(7,1,14,NULL,NULL,NULL,'PN-20260721-111705','stock_in','2026-07-21','purchase','Krong','cash',500.00,60000000.00,NULL,'posted',34,'2026-07-21 08:05:11','2026-07-21 08:05:11');
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
INSERT INTO `storedutyaccesssessions` VALUES (5,3,3,18,'40e9b218f2bdb27fbf9376a946bec5c1523ce864c07d5ed9756fd563b57adf7e',NULL,NULL,'2026-07-20 17:00:00','2026-07-21 00:00:00',NULL,NULL,'2026-07-20 21:44:07','revoked',NULL,'2026-07-21 04:19:06','2026-07-20 21:44:07','2026-07-21 04:19:06','2026-07-21 04:44:06'),(6,3,3,18,'9dc20f58db41b329873e54038b93b8c2149926d34bb2899b0e91c6b1463566a8',NULL,NULL,'2026-07-20 17:00:00','2026-07-21 00:00:00',NULL,NULL,'2026-07-20 21:44:07','revoked',NULL,'2026-07-21 04:43:45','2026-07-20 21:44:07','2026-07-21 04:43:45','2026-07-21 04:44:06'),(7,3,3,18,'a4ed02265d23d31aa71ecbf2b39123fb8a08a4f2a3913c54eb3e5295009f0b3f',NULL,NULL,'2026-07-20 17:00:00','2026-07-21 00:00:00',NULL,NULL,'2026-07-20 21:44:07','revoked',NULL,'2026-07-21 04:44:04','2026-07-20 21:44:07','2026-07-21 04:44:04','2026-07-21 04:44:06'),(8,3,3,18,'7689f0b546e928b45d8767dbbf37582df81cf1247dbdb6f24e90690de2513a8a',NULL,NULL,'2026-07-20 17:00:00','2026-07-21 00:00:00',NULL,NULL,'2026-07-20 21:44:07','revoked',NULL,'2026-07-21 04:44:06','2026-07-20 21:44:07','2026-07-21 04:44:06','2026-07-21 04:44:06'),(9,3,3,18,'d96b8453a2cd093609700c3767176e692ea60dd69f5855f80a2d46fe98bdb148','6b361d57cc0fc943eaba357556e2e59e1dea99cd1ffd7515fda49807b143ca8e',NULL,'2026-07-20 17:00:00','2026-07-21 00:00:00','2026-07-20 21:44:25','2026-07-20 21:54:31','2026-07-20 23:29:58','expired',NULL,'2026-07-21 04:44:06',NULL,'2026-07-21 04:44:06','2026-07-21 06:29:57'),(10,4,4,34,'a64bf73f7cb51d8d4dd6835bb76eedeedb18deaa4cdd21acb3afb28b2d7005cf',NULL,NULL,'2026-07-20 23:00:00','2026-07-21 05:00:00',NULL,NULL,'2026-07-21 16:20:14','revoked',NULL,'2026-07-21 08:02:52','2026-07-21 16:20:14','2026-07-21 08:02:52','2026-07-21 23:20:14'),(11,4,4,34,'ed089dad9b0436dc07412a8d00137210c75809fd7d72ccff8cb73ceb32a41d0d','eba5bd7ca4d2dff26c7d6dc743dee1356ae8c7f41f51d4f528a6a2ecc19a7ac3',NULL,'2026-07-20 23:00:00','2026-07-21 05:00:00','2026-07-21 01:03:41','2026-07-21 01:59:59','2026-07-21 16:20:14','revoked',NULL,'2026-07-21 08:03:30','2026-07-21 16:20:14','2026-07-21 08:03:30','2026-07-21 23:20:14'),(12,4,4,34,'0ed9eef1e0b5fbe04e94d8d683ddcb1f2d60c66b86da0cd91bccac82bde9250d',NULL,NULL,'2026-07-20 23:00:00','2026-07-21 05:00:00','2026-07-21 02:01:02','2026-07-21 02:06:00','2026-07-21 16:20:14','revoked',NULL,'2026-07-21 09:00:49','2026-07-21 16:20:14','2026-07-21 09:00:49','2026-07-21 23:20:14');
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
INSERT INTO `storedutyassignments` VALUES (1,376,1,'2026-07-20','morning',20,1,19999000.00,'scheduled',NULL,1,'2026-07-20 13:03:47','2026-07-20 13:03:47'),(3,378,1,'2026-07-21','morning',18,1,0.00,'scheduled',NULL,1,'2026-07-21 02:33:52','2026-07-21 02:33:52'),(4,379,1,'2026-07-21','afternoon',34,1,0.00,'scheduled',NULL,1,'2026-07-21 07:45:45','2026-07-21 07:45:45');
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
INSERT INTO `storedutymembers` VALUES (1,1,20,'primary','assigned','2026-07-20 13:03:47','2026-07-20 13:03:47'),(3,3,18,'primary','assigned','2026-07-21 02:33:52','2026-07-21 02:33:52'),(4,4,34,'primary','assigned','2026-07-21 07:45:45','2026-07-21 07:45:45');
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
INSERT INTO `storeledgers` VALUES (1,'CUA_HANG','Cửa hàng lưu xá','store',0.00,'Sổ thu chi riêng cho cửa hàng/quầy nhỏ.',1,NULL,'2026-07-12 23:05:56','2026-07-12 23:05:56');
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
INSERT INTO `storeledgertransactions` VALUES (1,1,4,NULL,NULL,NULL,'THU-20260713-91898','in','2026-07-13',2000000.00,'sales','Bán hàng sáng ngày 13.07',NULL,'cash',NULL,'posted',1,1,'2026-07-13 03:46:31','2026-07-14 17:22:28'),(2,1,4,NULL,NULL,NULL,'CHI-20260713-00779','out','2026-07-13',5000000.00,'purchase','Nhập hàng',NULL,'cash',NULL,'posted',1,1,'2026-07-13 04:15:00','2026-07-14 17:22:28'),(3,1,5,NULL,NULL,NULL,'NHAP-20260714-75474','out','2026-07-14',110000000.00,'purchase_stock','Nhập hàng: Ví Thổ cẩm Nam','Làng Brok','cash',NULL,'posted',1,1,'2026-07-14 12:36:15','2026-07-14 17:46:33'),(4,1,5,NULL,NULL,NULL,'BAN-20260714-88225','in','2026-07-14',145000.00,'sales','Bán hàng: Ví Thổ cẩm Nam',NULL,'cash',NULL,'posted',1,1,'2026-07-14 13:48:08','2026-07-14 17:46:33'),(5,1,6,NULL,NULL,NULL,'NHAP-20260715-04115','out','2026-07-15',120000000.00,'purchase_stock','Mua và nhập kho: Cà phê xay 500G','LangBiang','cash',NULL,'posted',1,1,'2026-07-14 17:28:24','2026-07-17 02:18:49'),(6,1,6,NULL,NULL,NULL,'BAN-20260715-66126','in','2026-07-15',850000.00,'sales','Bán hàng: Cà phê xay 500G',NULL,'cash',NULL,'posted',1,1,'2026-07-14 17:44:26','2026-07-17 02:18:49'),(7,1,NULL,NULL,NULL,NULL,'BAN-20260717-79117','in','2026-07-17',1650000.00,'sales','Bán hàng · PB-20260717-679117',NULL,'cash',NULL,'posted',0,1,'2026-07-17 02:01:19','2026-07-17 02:29:27'),(8,1,7,NULL,NULL,NULL,'NHAP-20260717-64324','out','2026-07-17',24500000.00,'purchase_stock','Mua hàng nhập kho · PN-20260717-864308','Krong Shop','cash',NULL,'posted',1,1,'2026-07-17 02:04:24','2026-07-17 02:30:16'),(9,1,8,NULL,NULL,NULL,'PN-20260720-601806','out','2026-07-20',260000000.00,'purchase_stock','Mua hàng nhập kho · PN-20260720-601806','Krong','cash',NULL,'posted',1,1,'2026-07-20 07:30:01','2026-07-20 07:30:46'),(10,1,8,NULL,NULL,NULL,'BAN-20260720-635483','in','2026-07-20',17240000.00,'sales','Bán hàng · BAN-20260720-635483','Nghi','cash',NULL,'posted',1,1,'2026-07-20 07:30:35','2026-07-20 07:30:46'),(11,1,9,NULL,NULL,NULL,'BAN-20260719-921531','in','2026-07-19',49450000.00,'sales','Bán hàng · BAN-20260719-921531','Linh Da','cash',NULL,'posted',1,1,'2026-07-20 07:35:21','2026-07-20 07:38:52'),(12,1,10,NULL,NULL,NULL,'BAN-20260721-291078','in','2026-07-21',3700000.00,'sales','Bán hàng · BAN-20260721-291078','Test','cash',NULL,'posted',1,18,'2026-07-21 04:48:11','2026-07-21 23:20:14'),(13,1,10,NULL,NULL,NULL,'BAN-20260721-048165','in','2026-07-21',300000.00,'sales','Bán hàng · BAN-20260721-048165','Linh','cash',NULL,'posted',1,34,'2026-07-21 08:04:08','2026-07-21 23:20:14'),(14,1,10,NULL,NULL,NULL,'PN-20260721-111705','out','2026-07-21',60000000.00,'purchase_stock','Mua hàng nhập kho · PN-20260721-111705','Krong','cash',NULL,'posted',1,34,'2026-07-21 08:05:11','2026-07-21 23:20:14');
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
INSERT INTO `storeproductcosthistories` VALUES (1,1,'manual','2026-07-14',0.00,3500.00,3500.00,'initial','Dòng khởi tạo lịch sử giá vốn từ dữ liệu hàng hóa hiện có.',NULL,'2026-07-14 08:11:03','2026-07-14 08:11:03'),(2,2,'manual','2026-07-14',0.00,4500.00,4500.00,'initial','Dòng khởi tạo lịch sử giá vốn từ dữ liệu hàng hóa hiện có.',NULL,'2026-07-14 08:11:03','2026-07-14 08:11:03'),(3,3,'manual','2026-07-14',0.00,2500.00,2500.00,'initial','Dòng khởi tạo lịch sử giá vốn từ dữ liệu hàng hóa hiện có.',NULL,'2026-07-14 08:11:03','2026-07-14 08:11:03'),(4,9,'purchase','2026-07-14',1000.00,110000.00,110000.00,'Nhập hàng',NULL,1,'2026-07-14 12:36:15','2026-07-14 12:36:15'),(5,7,'purchase','2026-07-15',1000.00,120000.00,120000.00,'Nhập kho từ mua hàng','Mua hàng · LangBiang',1,'2026-07-14 17:28:24','2026-07-14 17:28:24'),(6,11,'purchase','2026-07-17',150.00,110000.00,110000.00,'Nhập kho từ mua hàng','PN-20260717-864308',1,'2026-07-17 02:04:24','2026-07-17 02:04:24'),(7,9,'purchase','2026-07-17',50.00,110000.00,110000.00,'Nhập kho từ mua hàng','PN-20260717-864308',1,'2026-07-17 02:04:24','2026-07-17 02:04:24'),(8,3,'purchase','2026-07-17',500.00,5000.00,5000.00,'Nhập kho từ mua hàng','PN-20260717-864308',1,'2026-07-17 02:04:24','2026-07-17 02:04:24'),(9,12,'purchase','2026-07-20',2000.00,130000.00,130000.00,'Nhập kho từ mua hàng','Krong',1,'2026-07-20 07:30:01','2026-07-20 07:30:01'),(10,11,'purchase','2026-07-21',500.00,120000.00,120000.00,'Nhập kho từ mua hàng','Krong',34,'2026-07-21 08:05:11','2026-07-21 08:05:11');
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
INSERT INTO `storeproducts` VALUES (1,'NUOC_SUOI_500','Nước suối 500ml','drink','chai',3500.00,5000.00,20.00,0.00,'purchase','weighted_average',3500.00,5000.00,'Sản phẩm demo cửa hàng',NULL,NULL,0,NULL,'2026-07-13 07:03:01','2026-07-14 07:01:25'),(2,'MI_GOI','Mì gói','food','gói',4500.00,7000.00,15.00,0.00,'purchase','weighted_average',4500.00,7000.00,'Sản phẩm demo cửa hàng',NULL,NULL,0,NULL,'2026-07-13 07:03:01','2026-07-14 07:01:25'),(3,'BUT_BI','Bút bi','stationery','cây',5000.00,8000.00,1000.00,480.00,'purchase','weighted_average',5000.00,8000.00,'Sản phẩm demo cửa hàng',NULL,NULL,1,NULL,'2026-07-13 07:03:01','2026-07-22 04:25:01'),(7,'CAFE_XAY_500','Cà phê xay 500G','nong_san','Gói',120000.00,0.00,0.00,795.00,'purchase','weighted_average',120000.00,0.00,NULL,NULL,NULL,1,1,'2026-07-13 07:39:44','2026-07-20 07:35:21'),(8,'CAFE_HAT_500','Cà phê hạt 500G','nong_san','Gói',0.00,150000.00,0.00,0.00,'purchase','weighted_average',0.00,150000.00,NULL,NULL,NULL,0,1,'2026-07-13 07:40:12','2026-07-17 02:17:10'),(9,'VI_THOCAM_NAM','Ví Thổ cẩm Nam','thu_cong','Cái',110000.00,145000.00,0.00,1027.00,'purchase','weighted_average',110000.00,145000.00,NULL,NULL,NULL,1,1,'2026-07-13 07:41:01','2026-07-21 08:04:08'),(10,'SACH_VAN_HOA_TAY_NGUYEN','Văn hoá Tây Nguyên','sach','cuốn',0.00,0.00,0.00,0.00,'purchase','weighted_average',0.00,0.00,NULL,NULL,'data:image/jpeg;base64,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',1,1,'2026-07-14 17:46:25','2026-07-16 09:37:44'),(11,'CF_HAT_500','Cà phê Hạt 500G','nong_san','gói',120000.00,0.00,0.00,500.00,'purchase','weighted_average',120000.00,0.00,NULL,NULL,'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAgFBgcGBQgHBgcJCAgJDBMMDAsLDBgREg4THBgdHRsYGxofIywlHyEqIRobJjQnKi4vMTIxHiU2OjYwOiwwMTD/2wBDAQgJCQwKDBcMDBcwIBsgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDD/wAARCAIwAa8DASIAAhEBAxEB/8QAHAABAAEFAQEAAAAAAAAAAAAAAAECAwQFBgcI/8QAUxAAAQMBBgQDBQQHBQUEBwkAAQACEQMEEiExQVEFIjJhBkJxBxOBocEUUmKRI0NysdHh8BUzgpKiFheDstIlJjRjJDVEVHOElEVTdHWTs8LT8f/EABkBAQADAQEAAAAAAAAAAAAAAAABAgQDBf/EACYRAQEAAgEEAQUBAQEBAAAAAAABAhEDEiExMlEEEyIzQWEUcSP/2gAMAwEAAhEDEQA/APf0REBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQW5nKW+qXsIAI7oZwv/CFJvRzRHZAvRgQSdwoBjHMbBBejliO6CZ5erWUAmcRIGoKm9OABB3Kg5i9npCkzHNEawgXoEEE91AMZyfRSL0csR3UDW58ZQJ1xjZTM5SD3UHPHq0R0xzxHZAvCMj6pMZyT2U80aR81DZjkiO6BOuMbKSZylvqoxn8WqO/HHaEEl2EQR3UTGYJPZSb0YxGqCY5IjugiYxxIOQCEziJAGYKDM3erWUMzzZ6QgkmcACD3UXowIJ7rn/HdarR4PSuPLC6u0EtJBiCc/guKp8T4lRcCziFrGWHvnEfkSuGfNMMtWOuHFc5uPVQYzkzlCTriBsvNafifjTMPtpjA402H6LJpeM+KMAL20apwkuYe+0Kv/Tgt9jJ6FM4CWncqLwiIK4Nnj22QPfWOg4YdJLf4qun7SGNddtHDHsA1ZUDv3gK858L/AFW8Wc/juQYzk+iTrpsuTb7QeFZCha2zuxv/AFLIZ434U4zdtId3pj+Kt93D5V+3l8OkJnKW+qXpEQR3Whb4w4U/rfVH/DKq/wBr+EZOtDgP/hOn9yfcw+Toy+G9mMDJPZRMY4kaBaUeLODgctqMd6T/AOCj/a7gocAbWWuO9J8fuU/cx+UdGXw3czlI7FTenCCO5Wjq+LeDsJm0ue4ZXKbvqFaPjHh5ke7tDh2YMfmovJhP6noy+HQh0YEE9woBjOTOy5p3jexNwbZrVHdrf4qzU8c2dp/Q2Kq79twCj72Hyn7Wfw6uZxyGymZwEtO5XD1/G9scZoWOiyPvuLv3Qug8L8XqcY4fUq2lrG1KVU03e7BAyBGZOhCY8uOV1DLjyxm6297DI+qmYzk+ic0YRHzUNnyfNdXMnXTZJnKQe6eb8XyUunzxHZAvYZFAYwMuO4Tn7R80bMck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',1,1,'2026-07-16 09:39:49','2026-07-21 08:05:11'),(12,'LUU_NIEM_CONG_CHIENG','Bộ cồng chiêng lưu niệm','thu_cong','cái',130000.00,0.00,0.00,1999.00,'purchase','weighted_average',130000.00,0.00,NULL,NULL,NULL,1,1,'2026-07-20 07:29:48','2026-07-21 04:48:11');
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
INSERT INTO `storeproductsalepricehistories` VALUES (1,9,'2026-07-14',135000.00,'manual',NULL,1,'2026-07-14 08:07:02','2026-07-14 08:07:02'),(2,3,'2026-07-14',8000.00,'manual',NULL,1,'2026-07-14 08:12:01','2026-07-14 08:12:01'),(3,8,'2026-07-14',150000.00,'manual',NULL,1,'2026-07-14 08:12:28','2026-07-14 08:12:28'),(4,9,'2026-07-14',145000.00,'manual',NULL,1,'2026-07-14 08:13:03','2026-07-14 08:13:03');
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
INSERT INTO `storeshifts` VALUES (1,1,1,'2026-07-20','morning','2026-07-19 17:00:00','2026-07-19 23:00:00','2026-07-19 17:00:00','2026-07-20 00:00:00',20,19999000.00,19999000.00,NULL,0.00,'scheduled',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-07-20 13:03:47','2026-07-21 02:42:02'),(3,3,1,'2026-07-21','morning','2026-07-20 17:00:00','2026-07-20 23:00:00','2026-07-20 17:00:00','2026-07-21 00:00:00',18,0.00,0.00,NULL,0.00,'opened','2026-07-20 21:44:25',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-07-21 02:33:52','2026-07-21 04:44:25'),(4,4,1,'2026-07-21','afternoon','2026-07-20 23:00:00','2026-07-21 04:00:00','2026-07-20 23:00:00','2026-07-21 05:00:00',34,0.00,0.00,NULL,0.00,'confirmed','2026-07-21 01:03:41',NULL,'2026-07-21 16:20:14',34,NULL,NULL,1,'2026-07-21 16:20:30',NULL,1,'2026-07-21 07:45:45','2026-07-21 23:20:29');
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
INSERT INTO `storestockmovements` VALUES (1,9,3,NULL,NULL,'purchase','2026-07-14',1000.00,0.00,110000.00,NULL,1,'2026-07-14 12:36:15'),(2,9,4,NULL,NULL,'sale','2026-07-14',0.00,1.00,110000.00,NULL,1,'2026-07-14 13:48:08'),(3,7,5,NULL,NULL,'purchase','2026-07-15',1000.00,0.00,120000.00,'Mua hàng · LangBiang',1,'2026-07-14 17:28:24'),(4,7,6,NULL,NULL,'sale','2026-07-15',0.00,5.00,120000.00,NULL,1,'2026-07-14 17:44:26'),(5,11,8,1,1,'purchase','2026-07-17',150.00,0.00,110000.00,'PN-20260717-864308 · Krong Shop',1,'2026-07-17 02:04:24'),(6,9,8,1,2,'purchase','2026-07-17',50.00,0.00,110000.00,'PN-20260717-864308 · Krong Shop',1,'2026-07-17 02:04:24'),(7,3,8,1,3,'purchase','2026-07-17',500.00,0.00,5000.00,'PN-20260717-864308 · Krong Shop',1,'2026-07-17 02:04:24'),(8,12,9,2,4,'purchase','2026-07-20',2000.00,0.00,130000.00,'Krong',1,'2026-07-20 07:30:01'),(9,11,10,3,5,'sale','2026-07-20',0.00,100.00,110000.00,'Nghi',1,'2026-07-20 07:30:35'),(10,3,10,3,6,'sale','2026-07-20',0.00,20.00,5000.00,'Nghi',1,'2026-07-20 07:30:35'),(11,11,11,4,7,'sale','2026-07-19',0.00,50.00,110000.00,'Linh Da',1,'2026-07-20 07:35:21'),(12,7,11,4,8,'sale','2026-07-19',0.00,200.00,120000.00,'Linh Da',1,'2026-07-20 07:35:21'),(13,9,12,5,9,'sale','2026-07-21',0.00,20.00,110000.00,'Test',18,'2026-07-21 04:48:11'),(14,12,12,5,10,'sale','2026-07-21',0.00,1.00,130000.00,'Test',18,'2026-07-21 04:48:11'),(15,9,13,6,11,'sale','2026-07-21',0.00,2.00,110000.00,'Linh',34,'2026-07-21 08:04:08'),(16,11,14,7,12,'purchase','2026-07-21',500.00,0.00,120000.00,'Krong',34,'2026-07-21 08:05:11');
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
) ENGINE=InnoDB AUTO_INCREMENT=148 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userroles`
--

LOCK TABLES `userroles` WRITE;
/*!40000 ALTER TABLE `userroles` DISABLE KEYS */;
INSERT INTO `userroles` VALUES (1,1,1,1,NULL,'2026-06-02 15:26:09'),(77,21,2,1,1,'2026-06-15 22:49:35'),(79,23,2,1,1,'2026-06-16 14:48:29'),(80,24,2,1,1,'2026-06-16 14:49:46'),(82,26,2,1,1,'2026-06-16 14:51:28'),(83,27,2,1,1,'2026-06-16 14:54:37'),(84,28,2,1,1,'2026-06-16 14:55:36'),(112,18,8,0,NULL,'2026-06-16 15:17:22'),(113,18,3,0,NULL,'2026-06-16 15:17:22'),(114,18,2,1,NULL,'2026-06-16 15:17:22'),(115,18,7,0,NULL,'2026-06-16 15:17:22'),(120,30,2,1,NULL,'2026-06-16 15:17:41'),(121,30,7,0,NULL,'2026-06-16 15:17:41'),(122,30,6,0,NULL,'2026-06-16 15:17:41'),(126,34,2,1,NULL,'2026-06-18 07:03:30'),(127,22,2,1,NULL,'2026-06-18 07:03:32'),(128,20,2,1,NULL,'2026-06-18 14:30:28'),(129,20,7,0,NULL,'2026-06-18 14:30:28'),(132,29,2,1,NULL,'2026-06-18 14:31:16'),(133,29,5,0,NULL,'2026-06-18 14:31:16'),(134,31,4,0,NULL,'2026-06-29 02:27:05'),(135,31,2,1,NULL,'2026-06-29 02:27:05'),(136,33,8,0,NULL,'2026-06-30 23:40:19'),(137,33,2,1,NULL,'2026-06-30 23:40:19'),(138,19,8,0,NULL,'2026-06-30 23:40:40'),(139,19,4,0,NULL,'2026-06-30 23:40:40'),(140,19,2,1,NULL,'2026-06-30 23:40:40'),(144,32,2,1,NULL,'2026-06-30 23:40:57'),(145,32,7,0,NULL,'2026-06-30 23:40:57'),(146,25,8,0,NULL,'2026-06-30 23:40:57'),(147,25,2,1,NULL,'2026-06-30 23:40:57');
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
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$7D.mJrq6g2vY7JeD.h0zReb17tJO8M/fAjod/5mJKwNYKwS0v0mtq','Trần Thu Giang',NULL,'manager',1,0,'2026-05-27 14:23:55','2026-07-27 06:08:36','2026-07-26 23:08:36'),(18,'anh.le','$2b$10$G2Th2lEVKCtnq5Dd1B3hK.XNBQPFv4Gz3YvC2Oi80esgeWJfkY012','Lê Thị Phương Anh',NULL,'resident',1,0,'2026-06-15 22:42:48','2026-07-22 07:41:41','2026-07-22 00:41:42'),(19,'tra.tran','$2b$10$K5qCQgIVd.CAILjqi2xJ2u7w8TZ8X/N/X.12ZxvGoq7tDzrAjk4aa','Trần Thanh Trà',NULL,'resident',1,1,'2026-06-15 22:47:24','2026-06-15 22:47:24',NULL),(20,'linh.cao','$2b$10$0UVS8lI2kasT9Mw.cJ2hheaZygDZalph7mhH4uRNe13Ocfs7MgT1a','Cao Thị Khánh linh',NULL,'resident',1,1,'2026-06-15 22:48:50','2026-06-15 22:48:50',NULL),(21,'xuyen.lam','$2b$10$8C/E8.Xi11Gd8sE7GEgSdu70m1zFN2pqI3vSQYVUy71ZyYiAGHIzW','Lâm Ngọc Xuyến',NULL,'resident',1,1,'2026-06-15 22:49:35','2026-06-15 22:49:35',NULL),(22,'huyen.luong','$2b$10$W0HrR5tE1ZAKTsqxN.wtpeiE1/DfWDG9k6rIOSknQou3S/icCAP8q','Lương Giang Huyền',NULL,'resident',1,1,'2026-06-16 14:47:47','2026-06-16 14:47:47',NULL),(23,'truc.hoang','$2b$10$8brrmfabJ6eHsKM3KlBB2esZEdhtEeIyHHo5/Rpgu8C/htROP29Em','Hoàng Anh Trúc',NULL,'resident',1,1,'2026-06-16 14:48:29','2026-06-16 14:48:29',NULL),(24,'lieu.quach','$2b$10$oNLfcuM.rZBK/SF/J4ffjO5MS6r3JC1sDxCMeMETLx5NBnqLC7Cdu','Quách Gia Liễu',NULL,'resident',1,1,'2026-06-16 14:49:46','2026-06-16 14:49:46',NULL),(25,'anh.tran','$2b$10$KTAaL6UpJPMh2iS9gToBAehWD904J.kiDRTR.WV2tW7X/UYE5QwSO','Trần Tú Anh',NULL,'resident',1,1,'2026-06-16 14:51:01','2026-06-16 14:51:01',NULL),(26,'xuong.tran','$2b$10$ipD8D9prGwWwZEQUNzAXw.VOmacKnEbFtzJx988gWKfUSOCwEKYv.','Trần Tú Xương',NULL,'resident',0,1,'2026-06-16 14:51:28','2026-06-17 07:57:13',NULL),(27,'thanh.cao','$2b$10$qgsFj7MjUqqlAD6Gb0BcM.W/HnO.wqkYcZZUOjc57yFKCuNKVUyIW','Cao Ngọc Thanh',NULL,'resident',1,1,'2026-06-16 14:54:37','2026-06-16 08:19:35',NULL),(28,'suong.tran','$2b$10$Dgq1IhjpWxjMCORxCP5vlOTbQ8NJ3BmjUL4tGTa/zuMyRHE7LUB3q','Trần Thị Thu Sương',NULL,'resident',1,1,'2026-06-16 14:55:36','2026-06-16 14:55:36',NULL),(29,'nga.ly','$2b$10$/CkWcL/ryzpNxFQoHXqPiebwlYnsqkVdW1GSZEwsteAyrqorhuod2','Lý Thị Nga',NULL,'resident',1,1,'2026-06-16 14:57:48','2026-06-16 14:57:48',NULL),(30,'mai.suong','$2b$10$bCq0ZoJtF/DWb25mcRhh0O8nQVWsS3zQfYWVZ6zbB3MxIowArjCja','Sương Thị Mai',NULL,'resident',1,1,'2026-06-16 14:58:25','2026-06-16 14:58:25',NULL),(31,'tuyet.nguyen','$2b$10$rdqyxoYUYjQUN/R7mB2EDewEbgPBtbooNCYjitDQsqX22o8Ohk/xq','Nguyễn Thị Tuyết',NULL,'resident',1,1,'2026-06-16 14:59:09','2026-06-16 14:59:09',NULL),(32,'giang.tran','$2b$10$ErApMGpZN20yNvWAEfoIJegOsAwuMkd9Q1kJtrUf5bem3EATykGye','Trần Phúc Giang',NULL,'resident',1,1,'2026-06-16 15:00:26','2026-06-16 15:00:26',NULL),(33,'lam.phan','$2b$10$ZskyjRiPfdfcHyihxfoZ3O38Z.Oym4hFWbX/9xComMIPTKyCTmnU6','Phan Gia Lâm',NULL,'resident',1,1,'2026-06-16 15:01:17','2026-06-16 15:01:17',NULL),(34,'mong.ha','$2b$10$9aoUkolro.NJZv7OlieYFuM6Gv0q/D.k731E66x2zD6Qm19hZ9ul6','Hà Vân Mộng',NULL,'resident',1,0,'2026-06-16 15:02:04','2026-07-21 23:54:46','2026-07-21 16:54:47');
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

-- Dump completed on 2026-07-27 13:19:52
