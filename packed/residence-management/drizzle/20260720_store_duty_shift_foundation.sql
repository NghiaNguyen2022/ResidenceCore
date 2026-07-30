-- Việc 16L1 — Store duty, access session and handover foundation
-- Time rules are evaluated in Asia/Ho_Chi_Minh by the service layer.

CREATE TABLE `storeDutyAssignments` (
      `id` INT NOT NULL AUTO_INCREMENT,
      `dutyAssignmentId` INT NULL,
      `ledgerId` INT NOT NULL,
      `shiftDate` DATE NOT NULL,
      `shiftType` ENUM('morning','afternoon') NOT NULL,
      `primaryResidentId` INT NULL,
      `managerId` INT NULL,
      `openingCashPlanned` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
      `status` ENUM(
            'scheduled','access_issued','active',
            'handover_pending','completed','cancelled'
      ) NOT NULL DEFAULT 'scheduled',
      `notes` TEXT NULL,
      `createdBy` INT NULL,
      `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      INDEX `storeDutyAssignments_duty_assignment_idx` (`dutyAssignmentId`),
      INDEX `storeDutyAssignments_ledger_date_shift_idx` (`ledgerId`,`shiftDate`,`shiftType`),
      INDEX `storeDutyAssignments_primary_resident_idx` (`primaryResidentId`),
      INDEX `storeDutyAssignments_status_idx` (`status`),
      CONSTRAINT `storeDutyAssignments_ledger_fk`
            FOREIGN KEY (`ledgerId`) REFERENCES `storeLedgers` (`id`) ON DELETE RESTRICT,
      CONSTRAINT `storeDutyAssignments_primary_resident_fk`
            FOREIGN KEY (`primaryResidentId`) REFERENCES `residents` (`id`) ON DELETE SET NULL,
      CONSTRAINT `storeDutyAssignments_manager_fk`
            FOREIGN KEY (`managerId`) REFERENCES `users` (`id`) ON DELETE SET NULL,
      CONSTRAINT `storeDutyAssignments_created_by_fk`
            FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

CREATE TABLE `storeDutyMembers` (
      `id` INT NOT NULL AUTO_INCREMENT,
      `storeDutyAssignmentId` INT NOT NULL,
      `residentId` INT NOT NULL,
      `memberRole` ENUM('primary','assistant','receiver') NOT NULL DEFAULT 'assistant',
      `status` ENUM('assigned','confirmed','completed','cancelled') NOT NULL DEFAULT 'assigned',
      `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      UNIQUE KEY `storeDutyMembers_assignment_resident_unique`
            (`storeDutyAssignmentId`,`residentId`),
      INDEX `storeDutyMembers_assignment_idx` (`storeDutyAssignmentId`),
      INDEX `storeDutyMembers_resident_idx` (`residentId`),
      CONSTRAINT `storeDutyMembers_assignment_fk`
            FOREIGN KEY (`storeDutyAssignmentId`) REFERENCES `storeDutyAssignments` (`id`) ON DELETE CASCADE,
      CONSTRAINT `storeDutyMembers_resident_fk`
            FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE
);

CREATE TABLE `storeShifts` (
      `id` INT NOT NULL AUTO_INCREMENT,
      `storeDutyAssignmentId` INT NOT NULL,
      `ledgerId` INT NOT NULL,
      `shiftDate` DATE NOT NULL,
      `shiftType` ENUM('morning','afternoon') NOT NULL,
      `scheduledFrom` TIMESTAMP NOT NULL,
      `scheduledTo` TIMESTAMP NOT NULL,
      `accessValidFrom` TIMESTAMP NOT NULL,
      `accessValidUntil` TIMESTAMP NOT NULL,
      `primaryResidentId` INT NULL,
      `openingCash` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
      `expectedClosingCash` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
      `countedClosingCash` DECIMAL(14,2) NULL,
      `cashDifference` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
      `status` ENUM(
            'scheduled','access_issued','opened','in_progress',
            'handover_pending','handed_over','closing_pending',
            'closed','reviewed','confirmed','expired',
            'closing_overdue','cancelled'
      ) NOT NULL DEFAULT 'scheduled',
      `openedAt` TIMESTAMP NULL,
      `handedOverAt` TIMESTAMP NULL,
      `closedAt` TIMESTAMP NULL,
      `closedBy` INT NULL,
      `reviewedBy` INT NULL,
      `reviewedAt` TIMESTAMP NULL,
      `confirmedBy` INT NULL,
      `confirmedAt` TIMESTAMP NULL,
      `notes` TEXT NULL,
      `createdBy` INT NULL,
      `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      UNIQUE KEY `storeShifts_assignment_unique` (`storeDutyAssignmentId`),
      UNIQUE KEY `storeShifts_ledger_date_shift_unique` (`ledgerId`,`shiftDate`,`shiftType`),
      INDEX `storeShifts_primary_resident_idx` (`primaryResidentId`),
      INDEX `storeShifts_access_window_idx` (`accessValidFrom`,`accessValidUntil`),
      INDEX `storeShifts_status_idx` (`status`),
      CONSTRAINT `storeShifts_assignment_fk`
            FOREIGN KEY (`storeDutyAssignmentId`) REFERENCES `storeDutyAssignments` (`id`) ON DELETE RESTRICT,
      CONSTRAINT `storeShifts_ledger_fk`
            FOREIGN KEY (`ledgerId`) REFERENCES `storeLedgers` (`id`) ON DELETE RESTRICT,
      CONSTRAINT `storeShifts_primary_resident_fk`
            FOREIGN KEY (`primaryResidentId`) REFERENCES `residents` (`id`) ON DELETE SET NULL,
      CONSTRAINT `storeShifts_closed_by_fk`
            FOREIGN KEY (`closedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
      CONSTRAINT `storeShifts_reviewed_by_fk`
            FOREIGN KEY (`reviewedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
      CONSTRAINT `storeShifts_confirmed_by_fk`
            FOREIGN KEY (`confirmedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
      CONSTRAINT `storeShifts_created_by_fk`
            FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

CREATE TABLE `storeDutyAccessSessions` (
      `id` INT NOT NULL AUTO_INCREMENT,
      `storeShiftId` INT NOT NULL,
      `storeDutyAssignmentId` INT NOT NULL,
      `residentId` INT NOT NULL,
      `accessCodeHash` VARCHAR(255) NOT NULL,
      `accessTokenHash` VARCHAR(255) NULL,
      `portalSessionId` VARCHAR(255) NULL,
      `validFrom` TIMESTAMP NOT NULL,
      `validUntil` TIMESTAMP NOT NULL,
      `verifiedAt` TIMESTAMP NULL,
      `lastStoreActivityAt` TIMESTAMP NULL,
      `sessionExpiresAt` TIMESTAMP NULL,
      `status` ENUM('pending','active','expired','revoked','completed')
            NOT NULL DEFAULT 'pending',
      `issuedBy` INT NULL,
      `issuedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `revokedAt` TIMESTAMP NULL,
      `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      INDEX `storeDutyAccessSessions_shift_resident_idx` (`storeShiftId`,`residentId`),
      INDEX `storeDutyAccessSessions_assignment_idx` (`storeDutyAssignmentId`),
      INDEX `storeDutyAccessSessions_token_idx` (`accessTokenHash`),
      INDEX `storeDutyAccessSessions_status_expiry_idx` (`status`,`sessionExpiresAt`),
      CONSTRAINT `storeDutyAccessSessions_shift_fk`
            FOREIGN KEY (`storeShiftId`) REFERENCES `storeShifts` (`id`) ON DELETE CASCADE,
      CONSTRAINT `storeDutyAccessSessions_assignment_fk`
            FOREIGN KEY (`storeDutyAssignmentId`) REFERENCES `storeDutyAssignments` (`id`) ON DELETE CASCADE,
      CONSTRAINT `storeDutyAccessSessions_resident_fk`
            FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE CASCADE,
      CONSTRAINT `storeDutyAccessSessions_issued_by_fk`
            FOREIGN KEY (`issuedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

CREATE TABLE `storeShiftHandovers` (
      `id` INT NOT NULL AUTO_INCREMENT,
      `storeShiftId` INT NOT NULL,
      `handoverType` ENUM('shift_to_shift','end_of_day','manager_adjustment') NOT NULL,
      `handoverToShiftId` INT NULL,
      `openingCash` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
      `totalSales` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
      `totalOtherIncome` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
      `totalPurchases` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
      `totalOtherExpense` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
      `expectedCash` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
      `countedCash` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
      `differenceAmount` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
      `differenceReason` TEXT NULL,
      `notes` TEXT NULL,
      `handedOverByResidentId` INT NULL,
      `receivedByResidentId` INT NULL,
      `handedOverAt` TIMESTAMP NULL,
      `receivedAt` TIMESTAMP NULL,
      `giverSignedAt` TIMESTAMP NULL,
      `receiverSignedAt` TIMESTAMP NULL,
      `status` ENUM('draft','giver_signed','receiver_signed','completed','cancelled')
            NOT NULL DEFAULT 'draft',
      `createdBy` INT NULL,
      `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      INDEX `storeShiftHandovers_shift_idx` (`storeShiftId`),
      INDEX `storeShiftHandovers_receiver_shift_idx` (`handoverToShiftId`),
      INDEX `storeShiftHandovers_status_idx` (`status`),
      CONSTRAINT `storeShiftHandovers_shift_fk`
            FOREIGN KEY (`storeShiftId`) REFERENCES `storeShifts` (`id`) ON DELETE RESTRICT,
      CONSTRAINT `storeShiftHandovers_receiver_shift_fk`
            FOREIGN KEY (`handoverToShiftId`) REFERENCES `storeShifts` (`id`) ON DELETE SET NULL,
      CONSTRAINT `storeShiftHandovers_handed_over_resident_fk`
            FOREIGN KEY (`handedOverByResidentId`) REFERENCES `residents` (`id`) ON DELETE SET NULL,
      CONSTRAINT `storeShiftHandovers_received_resident_fk`
            FOREIGN KEY (`receivedByResidentId`) REFERENCES `residents` (`id`) ON DELETE SET NULL,
      CONSTRAINT `storeShiftHandovers_created_by_fk`
            FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

ALTER TABLE `storeLedgerTransactions`
      ADD COLUMN `storeShiftId` INT NULL AFTER `dailyClosingId`,
      ADD COLUMN `storeDutyAssignmentId` INT NULL AFTER `storeShiftId`,
      ADD COLUMN `createdByResidentId` INT NULL AFTER `storeDutyAssignmentId`,
      ADD INDEX `storeLedgerTransactions_shift_idx` (`storeShiftId`),
      ADD INDEX `storeLedgerTransactions_duty_assignment_idx` (`storeDutyAssignmentId`),
      ADD CONSTRAINT `storeLedgerTransactions_shift_fk`
            FOREIGN KEY (`storeShiftId`) REFERENCES `storeShifts` (`id`) ON DELETE SET NULL,
      ADD CONSTRAINT `storeLedgerTransactions_duty_assignment_fk`
            FOREIGN KEY (`storeDutyAssignmentId`) REFERENCES `storeDutyAssignments` (`id`) ON DELETE SET NULL,
      ADD CONSTRAINT `storeLedgerTransactions_created_resident_fk`
            FOREIGN KEY (`createdByResidentId`) REFERENCES `residents` (`id`) ON DELETE SET NULL;

ALTER TABLE `storeDocuments`
      ADD COLUMN `storeShiftId` INT NULL AFTER `ledgerTransactionId`,
      ADD COLUMN `storeDutyAssignmentId` INT NULL AFTER `storeShiftId`,
      ADD COLUMN `createdByResidentId` INT NULL AFTER `storeDutyAssignmentId`,
      ADD INDEX `storeDocuments_shift_idx` (`storeShiftId`),
      ADD INDEX `storeDocuments_duty_assignment_idx` (`storeDutyAssignmentId`),
      ADD CONSTRAINT `storeDocuments_shift_fk`
            FOREIGN KEY (`storeShiftId`) REFERENCES `storeShifts` (`id`) ON DELETE SET NULL,
      ADD CONSTRAINT `storeDocuments_duty_assignment_fk`
            FOREIGN KEY (`storeDutyAssignmentId`) REFERENCES `storeDutyAssignments` (`id`) ON DELETE SET NULL,
      ADD CONSTRAINT `storeDocuments_created_resident_fk`
            FOREIGN KEY (`createdByResidentId`) REFERENCES `residents` (`id`) ON DELETE SET NULL;
