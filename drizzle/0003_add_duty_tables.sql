CREATE TABLE `dutyAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dutyConfigId` int NOT NULL,
	`residentId` int NOT NULL,
	`assignedDate` date NOT NULL,
	`startDateTime` timestamp,
	`endDateTime` timestamp,
	`status` enum('pending','confirmed','in_progress','completed','skipped','cancelled') NOT NULL DEFAULT 'pending',
	`completedAt` timestamp,
	`notes` text,
	`reason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dutyAssignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dutyChecklists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dutyConfigId` int NOT NULL,
	`itemOrder` int NOT NULL,
	`checklistItem` varchar(255) NOT NULL,
	`isRequired` boolean NOT NULL DEFAULT true,
	`description` text,
	`estimatedTimeMinutes` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dutyChecklists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dutyConfigs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dutyCode` varchar(50) NOT NULL,
	`dutyName` varchar(100) NOT NULL,
	`description` text,
	`templateId` int,
	`dutyType` enum('daily','weekly','monthly') NOT NULL,
	`startTime` time,
	`endTime` time,
	`minPersons` int NOT NULL DEFAULT 1,
	`maxPersons` int NOT NULL DEFAULT 5,
	`frequency` enum('daily','weekly','monthly') NOT NULL,
	`dayOfWeek` int,
	`requiresStudyScheduleCheck` boolean NOT NULL DEFAULT true,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dutyConfigs_id` PRIMARY KEY(`id`),
	CONSTRAINT `dutyConfigs_dutyCode_unique` UNIQUE(`dutyCode`)
);
--> statement-breakpoint
CREATE TABLE `dutyEvaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assignmentId` int NOT NULL,
	`quality` int,
	`punctuality` int,
	`professionalism` int,
	`responsibility` int,
	`teamwork` int,
	`totalScore` int,
	`checklistCompletedJson` json,
	`evaluatorComments` text,
	`evaluatedBy` int,
	`evaluatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dutyEvaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dutySchedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dutyConfigId` int NOT NULL,
	`weekNumber` int,
	`dayOfWeek` int,
	`startDate` date NOT NULL,
	`endDate` date NOT NULL,
	`rotationOrder` int,
	`rotationInterval` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dutySchedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dutyTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateCode` varchar(50) NOT NULL,
	`templateName` varchar(100) NOT NULL,
	`description` text,
	`dutyType` enum('daily','weekly','monthly') NOT NULL,
	`startTime` time,
	`endTime` time,
	`minPersons` int NOT NULL DEFAULT 1,
	`maxPersons` int NOT NULL DEFAULT 5,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dutyTemplates_id` PRIMARY KEY(`id`),
	CONSTRAINT `dutyTemplates_templateCode_unique` UNIQUE(`templateCode`)
);
--> statement-breakpoint
CREATE TABLE `scheduleConflicts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`residentId` int NOT NULL,
	`dutyConfigId` int NOT NULL,
	`studyDayOfWeek` int,
	`studyStartTime` time,
	`studyEndTime` time,
	`dutyStartTime` time,
	`dutyEndTime` time,
	`conflictLevel` enum('none','partial','full') NOT NULL DEFAULT 'none',
	`conflictMinutes` int,
	`isResolved` boolean NOT NULL DEFAULT false,
	`resolutionNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduleConflicts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `dutyAssignments` ADD CONSTRAINT `dutyAssignments_dutyConfigId_dutyConfigs_id_fk` FOREIGN KEY (`dutyConfigId`) REFERENCES `dutyConfigs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dutyAssignments` ADD CONSTRAINT `dutyAssignments_residentId_residents_id_fk` FOREIGN KEY (`residentId`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dutyChecklists` ADD CONSTRAINT `dutyChecklists_dutyConfigId_dutyConfigs_id_fk` FOREIGN KEY (`dutyConfigId`) REFERENCES `dutyConfigs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dutyConfigs` ADD CONSTRAINT `dutyConfigs_templateId_dutyTemplates_id_fk` FOREIGN KEY (`templateId`) REFERENCES `dutyTemplates`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dutyEvaluations` ADD CONSTRAINT `dutyEvaluations_assignmentId_dutyAssignments_id_fk` FOREIGN KEY (`assignmentId`) REFERENCES `dutyAssignments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dutyEvaluations` ADD CONSTRAINT `dutyEvaluations_evaluatedBy_residents_id_fk` FOREIGN KEY (`evaluatedBy`) REFERENCES `residents`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dutySchedules` ADD CONSTRAINT `dutySchedules_dutyConfigId_dutyConfigs_id_fk` FOREIGN KEY (`dutyConfigId`) REFERENCES `dutyConfigs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scheduleConflicts` ADD CONSTRAINT `scheduleConflicts_residentId_residents_id_fk` FOREIGN KEY (`residentId`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scheduleConflicts` ADD CONSTRAINT `scheduleConflicts_dutyConfigId_dutyConfigs_id_fk` FOREIGN KEY (`dutyConfigId`) REFERENCES `dutyConfigs`(`id`) ON DELETE cascade ON UPDATE no action;