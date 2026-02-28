-- Unified production script:
-- - Fresh install: creates courses / cases / artifacts tables
-- - Existing install: migrates from case_school -> cases.schoolId (idempotent)

CREATE TABLE IF NOT EXISTS `courses` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` VARCHAR(4096) DEFAULT NULL,
  `category` VARCHAR(255) DEFAULT NULL,
  `subcategory` VARCHAR(255) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `cases` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `description` VARCHAR(4096) NOT NULL,
  `courseId` BIGINT NOT NULL,
  `schoolId` INTEGER DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cases_courseId` (`courseId`),
  KEY `idx_cases_schoolId` (`schoolId`),
  CONSTRAINT `fk_cases_courseId`
    FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_cases_schoolId`
    FOREIGN KEY (`schoolId`) REFERENCES `schools` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `artifacts` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `description` VARCHAR(4096) DEFAULT NULL,
  `category` VARCHAR(255) DEFAULT NULL,
  `attachmentPath` VARCHAR(1024) NOT NULL,
  `attachmentName` VARCHAR(255) NOT NULL,
  `attachmentMime` VARCHAR(255) DEFAULT NULL,
  `attachmentSize` BIGINT DEFAULT NULL,
  `type` ENUM('doc','pdf','video','audio') NOT NULL,
  `caseId` BIGINT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_artifacts_caseId` (`caseId`),
  CONSTRAINT `fk_artifacts_caseId`
    FOREIGN KEY (`caseId`) REFERENCES `cases` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===== Existing DB migration compatibility =====
-- 1) Add schoolId column + index to cases when missing
SET @has_school_id_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND COLUMN_NAME = 'schoolId'
);

SET @sql_add_col := IF(
  @has_school_id_col = 0,
  'ALTER TABLE `cases` ADD COLUMN `schoolId` INT NULL',
  'SELECT ''cases.schoolId already exists'' AS msg'
);
PREPARE stmt_add_col FROM @sql_add_col;
EXECUTE stmt_add_col;
DEALLOCATE PREPARE stmt_add_col;

SET @has_school_id_idx := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND INDEX_NAME = 'idx_cases_schoolId'
);

SET @sql_add_idx := IF(
  @has_school_id_idx = 0,
  'ALTER TABLE `cases` ADD INDEX `idx_cases_schoolId` (`schoolId`)',
  'SELECT ''idx_cases_schoolId already exists'' AS msg'
);
PREPARE stmt_add_idx FROM @sql_add_idx;
EXECUTE stmt_add_idx;
DEALLOCATE PREPARE stmt_add_idx;

-- 2) Backfill schoolId from old join table when case_school exists
SET @has_case_school_table := (
  SELECT COUNT(*)
  FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'case_school'
);

SET @sql_backfill := IF(
  @has_case_school_table > 0,
  'UPDATE `cases` c
     JOIN (
       SELECT `caseId`, MIN(`schoolId`) AS `schoolId`
       FROM `case_school`
       GROUP BY `caseId`
     ) cs ON cs.caseId = c.id
     SET c.schoolId = cs.schoolId
   WHERE c.schoolId IS NULL',
  'SELECT ''case_school does not exist, skip backfill'' AS msg'
);
PREPARE stmt_backfill FROM @sql_backfill;
EXECUTE stmt_backfill;
DEALLOCATE PREPARE stmt_backfill;

-- 3) Add FK cases.schoolId -> schools.id when missing
SET @has_fk := (
  SELECT COUNT(*)
  FROM information_schema.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND CONSTRAINT_NAME = 'fk_cases_schoolId'
);

SET @sql_add_fk := IF(
  @has_fk = 0,
  'ALTER TABLE `cases`
     ADD CONSTRAINT `fk_cases_schoolId`
     FOREIGN KEY (`schoolId`) REFERENCES `schools`(`id`)
     ON DELETE SET NULL ON UPDATE CASCADE',
  'SELECT ''fk_cases_schoolId already exists'' AS msg'
);
PREPARE stmt_add_fk FROM @sql_add_fk;
EXECUTE stmt_add_fk;
DEALLOCATE PREPARE stmt_add_fk;

-- Optional cleanup (run manually after verification):
-- DROP TABLE `case_school`;
