CREATE TABLE IF NOT EXISTS `skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` enum('life','communication','learning','leadership','digital','career','spiritual','community','other') NOT NULL DEFAULT 'other',
  `level` enum('basic','intermediate','advanced') NOT NULL DEFAULT 'basic',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `description` text NULL, `objective` text NULL, `evaluationCriteria` text NULL,
  `suggestedDuration` varchar(100) NULL, `ownerGroup` varchar(255) NULL, `note` text NULL,
  `classCount` int NOT NULL DEFAULT 0, `completedCount` int NOT NULL DEFAULT 0,
  `sortOrder` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), UNIQUE KEY `skills_code_unique` (`code`),
  KEY `skills_status_idx` (`status`), KEY `skills_category_idx` (`category`)
);
