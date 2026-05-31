CREATE TABLE `parents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`residentId` int NOT NULL,
	`parentType` enum('father','mother','guardian') NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`phoneNumber` varchar(20),
	`email` varchar(320),
	`idNumber` varchar(50),
	`occupation` varchar(255),
	`address` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `cronJobLogs` MODIFY COLUMN `jobName` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `cronJobLogs` MODIFY COLUMN `status` enum('success','failed','skipped') NOT NULL;--> statement-breakpoint
ALTER TABLE `residents` MODIFY COLUMN `admissionDate` date NOT NULL;--> statement-breakpoint
ALTER TABLE `residents` MODIFY COLUMN `departureDate` date;--> statement-breakpoint
ALTER TABLE `cronJobLogs` ADD `executedAt` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `cronJobLogs` ADD `nextScheduledAt` timestamp;--> statement-breakpoint
ALTER TABLE `residents` ADD `residentCode` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `residents` ADD `schoolId` int;--> statement-breakpoint
ALTER TABLE `residents` ADD `profileImage` varchar(500);--> statement-breakpoint
ALTER TABLE `residents` ADD CONSTRAINT `residents_residentCode_unique` UNIQUE(`residentCode`);--> statement-breakpoint
ALTER TABLE `parents` ADD CONSTRAINT `parents_residentId_residents_id_fk` FOREIGN KEY (`residentId`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_residentId_residents_id_fk` FOREIGN KEY (`residentId`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_scheduleId_attendanceSchedule_id_fk` FOREIGN KEY (`scheduleId`) REFERENCES `attendanceSchedule`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_recordedBy_users_id_fk` FOREIGN KEY (`recordedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `debts` ADD CONSTRAINT `debts_residentId_residents_id_fk` FOREIGN KEY (`residentId`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `debts` ADD CONSTRAINT `debts_feeTypeId_feeTypes_id_fk` FOREIGN KEY (`feeTypeId`) REFERENCES `feeTypes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_recipientId_users_id_fk` FOREIGN KEY (`recipientId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_debtId_debts_id_fk` FOREIGN KEY (`debtId`) REFERENCES `debts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_recordedBy_users_id_fk` FOREIGN KEY (`recordedBy`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `programs` ADD CONSTRAINT `programs_schoolId_schools_id_fk` FOREIGN KEY (`schoolId`) REFERENCES `schools`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `residentAcademicInfo` ADD CONSTRAINT `residentAcademicInfo_residentId_residents_id_fk` FOREIGN KEY (`residentId`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `residentAcademicInfo` ADD CONSTRAINT `residentAcademicInfo_schoolId_schools_id_fk` FOREIGN KEY (`schoolId`) REFERENCES `schools`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `residentAcademicInfo` ADD CONSTRAINT `residentAcademicInfo_programId_programs_id_fk` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `residents` ADD CONSTRAINT `residents_schoolId_schools_id_fk` FOREIGN KEY (`schoolId`) REFERENCES `schools`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `roomAssignmentHistory` ADD CONSTRAINT `roomAssignmentHistory_residentId_residents_id_fk` FOREIGN KEY (`residentId`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `roomAssignmentHistory` ADD CONSTRAINT `roomAssignmentHistory_roomId_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `roomAssignmentHistory` ADD CONSTRAINT `roomAssignmentHistory_assignedBy_users_id_fk` FOREIGN KEY (`assignedBy`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `taskAssignments` ADD CONSTRAINT `taskAssignments_taskTypeId_taskTypes_id_fk` FOREIGN KEY (`taskTypeId`) REFERENCES `taskTypes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `taskAssignments` ADD CONSTRAINT `taskAssignments_residentId_residents_id_fk` FOREIGN KEY (`residentId`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `taskAssignments` ADD CONSTRAINT `taskAssignments_assignedBy_users_id_fk` FOREIGN KEY (`assignedBy`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `taskAssignments` ADD CONSTRAINT `taskAssignments_verifiedBy_users_id_fk` FOREIGN KEY (`verifiedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cronJobLogs` DROP COLUMN `executionDate`;--> statement-breakpoint
ALTER TABLE `cronJobLogs` DROP COLUMN `recordsProcessed`;