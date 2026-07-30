-- ResidenceCore / App Lưu Xá
-- Phase A: Extend Duty model for daily / weekly / monthly / event work planning.
-- Review before running on production. MySQL syntax.

ALTER TABLE dutyConfigs
      MODIFY COLUMN dutyType ENUM('daily','weekly','monthly','event') NOT NULL,
      MODIFY COLUMN frequency ENUM('daily','weekly','monthly','event') NOT NULL;

ALTER TABLE dutyConfigs
      ADD COLUMN frequencyPerWeek INT NULL AFTER dayOfWeek,
      ADD COLUMN frequencyPerMonth INT NULL AFTER frequencyPerWeek,
      ADD COLUMN weeklyDaysJson JSON NULL AFTER frequencyPerMonth,
      ADD COLUMN monthWeeksJson JSON NULL AFTER weeklyDaysJson,
      ADD COLUMN monthWeekDaysJson JSON NULL AFTER monthWeeksJson,
      ADD COLUMN monthDaysJson JSON NULL AFTER monthWeekDaysJson,
      ADD COLUMN eventName VARCHAR(255) NULL AFTER monthDaysJson,
      ADD COLUMN eventStartDate DATE NULL AFTER eventName,
      ADD COLUMN eventEndDate DATE NULL AFTER eventStartDate;

ALTER TABLE dutyChecklists
      ADD COLUMN stageType ENUM('normal','preparation','during','after') NOT NULL DEFAULT 'normal' AFTER description,
      ADD COLUMN minPersons INT NOT NULL DEFAULT 1 AFTER stageType,
      ADD COLUMN maxPersons INT NOT NULL DEFAULT 1 AFTER minPersons;

ALTER TABLE dutyAssignments
      MODIFY COLUMN residentId INT NULL,
      ADD COLUMN dutyTaskId INT NULL AFTER dutyConfigId;

ALTER TABLE dutyAssignments
      ADD CONSTRAINT fk_dutyAssignments_dutyTaskId
      FOREIGN KEY (dutyTaskId) REFERENCES dutyChecklists(id)
      ON DELETE SET NULL;
