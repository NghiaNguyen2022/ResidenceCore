CREATE TABLE `groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupCode` varchar(50) NOT NULL,
	`groupName` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `groups_id` PRIMARY KEY(`id`),
	CONSTRAINT `groups_groupCode_unique` UNIQUE(`groupCode`)
);
--> statement-breakpoint
CREATE TABLE `roomAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`residentId` int NOT NULL,
	`roomId` int NOT NULL,
	`assignedDate` date NOT NULL,
	`unassignedDate` date,
	`eventType` enum('new_entry','transfer','temporary_leave','left') NOT NULL,
	`reason` varchar(255),
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roomAssignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roomLeaders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`residentId` int NOT NULL,
	`appointedDate` date NOT NULL,
	`unappointedDate` date,
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roomLeaders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `rooms` MODIFY COLUMN `createdAt` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `rooms` MODIFY COLUMN `updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `rooms` ADD `groupId` int;--> statement-breakpoint
ALTER TABLE `rooms` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `roomAssignments` ADD CONSTRAINT `roomAssignments_residentId_residents_id_fk` FOREIGN KEY (`residentId`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `roomAssignments` ADD CONSTRAINT `roomAssignments_roomId_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `roomLeaders` ADD CONSTRAINT `roomLeaders_roomId_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `roomLeaders` ADD CONSTRAINT `roomLeaders_residentId_residents_id_fk` FOREIGN KEY (`residentId`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rooms` ADD CONSTRAINT `rooms_groupId_groups_id_fk` FOREIGN KEY (`groupId`) REFERENCES `groups`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rooms` DROP COLUMN `roomName`;--> statement-breakpoint
ALTER TABLE `rooms` DROP COLUMN `floor`;--> statement-breakpoint
ALTER TABLE `rooms` DROP COLUMN `zone`;--> statement-breakpoint
ALTER TABLE `rooms` DROP COLUMN `gender`;--> statement-breakpoint
ALTER TABLE `rooms` DROP COLUMN `currentOccupancy`;--> statement-breakpoint
ALTER TABLE `rooms` DROP COLUMN `status`;