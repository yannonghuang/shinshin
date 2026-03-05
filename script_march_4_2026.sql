-- Quiet one-click operator script for case model migration
-- Idempotent migration with minimal output.
-- Usage:
--   mysql -h <host> -u <user> -p <db> < script_march_4_case_management_operator_quiet.sql

SET @old_sql_safe_updates := @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

CREATE TABLE IF NOT EXISTS `cases` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `description` VARCHAR(4096) NOT NULL,
  `year` INT NOT NULL,
  `course` VARCHAR(64) NOT NULL,
  `category` VARCHAR(255) NOT NULL,
  `schoolId` INTEGER DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cases_year` (`year`),
  KEY `idx_cases_course` (`course`),
  KEY `idx_cases_category` (`category`),
  KEY `idx_cases_schoolId` (`schoolId`),
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
  `type` VARCHAR(64) NOT NULL,
  `caseId` BIGINT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_artifacts_caseId` (`caseId`),
  CONSTRAINT `fk_artifacts_caseId`
    FOREIGN KEY (`caseId`) REFERENCES `cases` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET @has_legacy_field_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND COLUMN_NAME = 'field'
);
SET @has_course_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND COLUMN_NAME = 'course'
);
SET @sql_rename_field_to_course := IF(
  @has_legacy_field_col > 0 AND @has_course_col = 0,
  'ALTER TABLE `cases` CHANGE COLUMN `field` `course` VARCHAR(64) NULL',
  'DO 0'
);
PREPARE stmt_rename_field_to_course FROM @sql_rename_field_to_course;
EXECUTE stmt_rename_field_to_course;
DEALLOCATE PREPARE stmt_rename_field_to_course;

SET @has_course_col2 := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND COLUMN_NAME = 'course'
);
SET @sql_add_course_col := IF(
  @has_course_col2 = 0,
  'ALTER TABLE `cases` ADD COLUMN `course` VARCHAR(64) NULL AFTER `description`',
  'DO 0'
);
PREPARE stmt_add_course_col FROM @sql_add_course_col;
EXECUTE stmt_add_course_col;
DEALLOCATE PREPARE stmt_add_course_col;

SET @has_year_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND COLUMN_NAME = 'year'
);
SET @sql_add_year_col := IF(
  @has_year_col = 0,
  'ALTER TABLE `cases` ADD COLUMN `year` INT NULL AFTER `description`',
  'DO 0'
);
PREPARE stmt_add_year_col FROM @sql_add_year_col;
EXECUTE stmt_add_year_col;
DEALLOCATE PREPARE stmt_add_year_col;

SET @has_legacy_topic_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND COLUMN_NAME = 'topic'
);
SET @has_category_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND COLUMN_NAME = 'category'
);
SET @sql_rename_topic_to_category := IF(
  @has_legacy_topic_col > 0 AND @has_category_col = 0,
  'ALTER TABLE `cases` CHANGE COLUMN `topic` `category` VARCHAR(255) NULL',
  'DO 0'
);
PREPARE stmt_rename_topic_to_category FROM @sql_rename_topic_to_category;
EXECUTE stmt_rename_topic_to_category;
DEALLOCATE PREPARE stmt_rename_topic_to_category;

SET @has_category_col2 := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND COLUMN_NAME = 'category'
);
SET @sql_add_category_col := IF(
  @has_category_col2 = 0,
  'ALTER TABLE `cases` ADD COLUMN `category` VARCHAR(255) NULL AFTER `course`',
  'DO 0'
);
PREPARE stmt_add_category_col FROM @sql_add_category_col;
EXECUTE stmt_add_category_col;
DEALLOCATE PREPARE stmt_add_category_col;

SET @has_course_table := (
  SELECT COUNT(*)
  FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'courses'
);
SET @has_course_id_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND COLUMN_NAME = 'courseId'
);
SET @sql_backfill_from_course := IF(
  @has_course_table > 0 AND @has_course_id_col > 0,
  'UPDATE `cases` c
     SET
       c.course = CASE
         WHEN c.course IS NOT NULL AND c.course <> "" THEN c.course
         WHEN (SELECT co.category FROM `courses` co WHERE co.id = c.courseId LIMIT 1) IN ("语文", "数学", "乡土课程")
           THEN (SELECT co.category FROM `courses` co WHERE co.id = c.courseId LIMIT 1)
         ELSE "语文"
       END,
       c.category = CASE
         WHEN c.category IS NOT NULL AND c.category <> "" THEN c.category
         WHEN COALESCE((SELECT co.subcategory FROM `courses` co WHERE co.id = c.courseId LIMIT 1), "") <> ""
           THEN (SELECT co.subcategory FROM `courses` co WHERE co.id = c.courseId LIMIT 1)
         ELSE "一年级"
       END
    WHERE c.id > 0',
  'UPDATE `cases`
     SET
       `course` = COALESCE(NULLIF(`course`, ""), "语文"),
       `category` = COALESCE(NULLIF(`category`, ""), "一年级")
    WHERE `id` > 0'
);
PREPARE stmt_backfill_from_course FROM @sql_backfill_from_course;
EXECUTE stmt_backfill_from_course;
DEALLOCATE PREPARE stmt_backfill_from_course;

UPDATE `cases`
SET `year` = COALESCE(`year`, YEAR(COALESCE(`createdAt`, NOW())), YEAR(NOW()))
WHERE `id` > 0 AND `year` IS NULL;

UPDATE `cases`
SET `course` = '语文'
WHERE `id` > 0 AND (`course` NOT IN ('语文', '数学', '乡土课程') OR `course` IS NULL OR `course` = '');

UPDATE `cases`
SET `category` = CASE
  WHEN `course` = '乡土课程' THEN '家乡美食与饮食文化'
  ELSE '一年级'
END
WHERE `id` > 0 AND (`category` IS NULL OR `category` = '');

SET @year_is_nullable := (
  SELECT IS_NULLABLE
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND COLUMN_NAME = 'year'
  LIMIT 1
);
SET @sql_alter_year_nn := IF(
  @year_is_nullable = 'YES',
  'ALTER TABLE `cases` MODIFY COLUMN `year` INT NOT NULL',
  'DO 0'
);
PREPARE stmt_alter_year_nn FROM @sql_alter_year_nn;
EXECUTE stmt_alter_year_nn;
DEALLOCATE PREPARE stmt_alter_year_nn;

SET @course_is_nullable := (
  SELECT IS_NULLABLE
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND COLUMN_NAME = 'course'
  LIMIT 1
);
SET @sql_alter_course_nn := IF(
  @course_is_nullable = 'YES',
  'ALTER TABLE `cases` MODIFY COLUMN `course` VARCHAR(64) NOT NULL',
  'DO 0'
);
PREPARE stmt_alter_course_nn FROM @sql_alter_course_nn;
EXECUTE stmt_alter_course_nn;
DEALLOCATE PREPARE stmt_alter_course_nn;

SET @category_is_nullable := (
  SELECT IS_NULLABLE
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND COLUMN_NAME = 'category'
  LIMIT 1
);
SET @sql_alter_category_nn := IF(
  @category_is_nullable = 'YES',
  'ALTER TABLE `cases` MODIFY COLUMN `category` VARCHAR(255) NOT NULL',
  'DO 0'
);
PREPARE stmt_alter_category_nn FROM @sql_alter_category_nn;
EXECUTE stmt_alter_category_nn;
DEALLOCATE PREPARE stmt_alter_category_nn;

SET @course_fk_name := (
  SELECT CONSTRAINT_NAME
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND COLUMN_NAME = 'courseId'
    AND REFERENCED_TABLE_NAME IS NOT NULL
  LIMIT 1
);
SET @sql_drop_course_fk := IF(
  @course_fk_name IS NOT NULL,
  CONCAT('ALTER TABLE `cases` DROP FOREIGN KEY `', @course_fk_name, '`'),
  'DO 0'
);
PREPARE stmt_drop_course_fk FROM @sql_drop_course_fk;
EXECUTE stmt_drop_course_fk;
DEALLOCATE PREPARE stmt_drop_course_fk;

SET @has_course_idx := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND INDEX_NAME = 'idx_cases_courseId'
);
SET @sql_drop_course_idx := IF(
  @has_course_idx > 0,
  'ALTER TABLE `cases` DROP INDEX `idx_cases_courseId`',
  'DO 0'
);
PREPARE stmt_drop_course_idx FROM @sql_drop_course_idx;
EXECUTE stmt_drop_course_idx;
DEALLOCATE PREPARE stmt_drop_course_idx;

SET @has_course_id_col2 := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND COLUMN_NAME = 'courseId'
);
SET @sql_drop_course_id_col := IF(
  @has_course_id_col2 > 0,
  'ALTER TABLE `cases` DROP COLUMN `courseId`',
  'DO 0'
);
PREPARE stmt_drop_course_id_col FROM @sql_drop_course_id_col;
EXECUTE stmt_drop_course_id_col;
DEALLOCATE PREPARE stmt_drop_course_id_col;

SET @has_legacy_field_idx := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND INDEX_NAME = 'idx_cases_field'
);
SET @sql_drop_legacy_field_idx := IF(
  @has_legacy_field_idx > 0,
  'ALTER TABLE `cases` DROP INDEX `idx_cases_field`',
  'DO 0'
);
PREPARE stmt_drop_legacy_field_idx FROM @sql_drop_legacy_field_idx;
EXECUTE stmt_drop_legacy_field_idx;
DEALLOCATE PREPARE stmt_drop_legacy_field_idx;

SET @has_legacy_topic_idx := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND INDEX_NAME = 'idx_cases_topic'
);
SET @sql_drop_legacy_topic_idx := IF(
  @has_legacy_topic_idx > 0,
  'ALTER TABLE `cases` DROP INDEX `idx_cases_topic`',
  'DO 0'
);
PREPARE stmt_drop_legacy_topic_idx FROM @sql_drop_legacy_topic_idx;
EXECUTE stmt_drop_legacy_topic_idx;
DEALLOCATE PREPARE stmt_drop_legacy_topic_idx;

SET @has_field_idx := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND INDEX_NAME = 'idx_cases_course'
);
SET @sql_add_field_idx := IF(
  @has_field_idx = 0,
  'ALTER TABLE `cases` ADD INDEX `idx_cases_course` (`course`)',
  'DO 0'
);
PREPARE stmt_add_field_idx FROM @sql_add_field_idx;
EXECUTE stmt_add_field_idx;
DEALLOCATE PREPARE stmt_add_field_idx;

SET @has_year_idx := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND INDEX_NAME = 'idx_cases_year'
);
SET @sql_add_year_idx := IF(
  @has_year_idx = 0,
  'ALTER TABLE `cases` ADD INDEX `idx_cases_year` (`year`)',
  'DO 0'
);
PREPARE stmt_add_year_idx FROM @sql_add_year_idx;
EXECUTE stmt_add_year_idx;
DEALLOCATE PREPARE stmt_add_year_idx;

SET @has_topic_idx := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND INDEX_NAME = 'idx_cases_category'
);
SET @sql_add_topic_idx := IF(
  @has_topic_idx = 0,
  'ALTER TABLE `cases` ADD INDEX `idx_cases_category` (`category`)',
  'DO 0'
);
PREPARE stmt_add_topic_idx FROM @sql_add_topic_idx;
EXECUTE stmt_add_topic_idx;
DEALLOCATE PREPARE stmt_add_topic_idx;

SET @artifact_type_column_type := (
  SELECT COLUMN_TYPE
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'artifacts'
    AND COLUMN_NAME = 'type'
  LIMIT 1
);
SET @sql_alter_artifact_type_col := IF(
  @artifact_type_column_type IS NOT NULL AND @artifact_type_column_type NOT LIKE 'varchar%',
  'ALTER TABLE `artifacts` MODIFY COLUMN `type` VARCHAR(64) NOT NULL',
  'DO 0'
);
PREPARE stmt_alter_artifact_type_col FROM @sql_alter_artifact_type_col;
EXECUTE stmt_alter_artifact_type_col;
DEALLOCATE PREPARE stmt_alter_artifact_type_col;

SET @artifact_fk_name := (
  SELECT kcu.CONSTRAINT_NAME
  FROM information_schema.KEY_COLUMN_USAGE kcu
  WHERE kcu.TABLE_SCHEMA = DATABASE()
    AND kcu.TABLE_NAME = 'artifacts'
    AND kcu.COLUMN_NAME = 'caseId'
    AND kcu.REFERENCED_TABLE_NAME = 'cases'
  LIMIT 1
);
SET @artifact_fk_is_cascade := (
  SELECT COUNT(*)
  FROM information_schema.REFERENTIAL_CONSTRAINTS rc
  WHERE rc.CONSTRAINT_SCHEMA = DATABASE()
    AND rc.TABLE_NAME = 'artifacts'
    AND rc.CONSTRAINT_NAME = @artifact_fk_name
    AND rc.DELETE_RULE = 'CASCADE'
    AND rc.UPDATE_RULE = 'CASCADE'
);
SET @sql_drop_artifact_fk_non_cascade := IF(
  @artifact_fk_name IS NOT NULL AND @artifact_fk_is_cascade = 0,
  CONCAT('ALTER TABLE `artifacts` DROP FOREIGN KEY `', @artifact_fk_name, '`'),
  'DO 0'
);
PREPARE stmt_drop_artifact_fk_non_cascade FROM @sql_drop_artifact_fk_non_cascade;
EXECUTE stmt_drop_artifact_fk_non_cascade;
DEALLOCATE PREPARE stmt_drop_artifact_fk_non_cascade;

SET @has_artifacts_case_idx := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'artifacts'
    AND INDEX_NAME = 'idx_artifacts_caseId'
);
SET @sql_add_artifacts_case_idx := IF(
  @has_artifacts_case_idx = 0,
  'ALTER TABLE `artifacts` ADD INDEX `idx_artifacts_caseId` (`caseId`)',
  'DO 0'
);
PREPARE stmt_add_artifacts_case_idx FROM @sql_add_artifacts_case_idx;
EXECUTE stmt_add_artifacts_case_idx;
DEALLOCATE PREPARE stmt_add_artifacts_case_idx;

SET @has_artifact_cascade_fk := (
  SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE kcu
  INNER JOIN information_schema.REFERENTIAL_CONSTRAINTS rc
    ON rc.CONSTRAINT_SCHEMA = kcu.TABLE_SCHEMA
   AND rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
   AND rc.TABLE_NAME = kcu.TABLE_NAME
  WHERE kcu.TABLE_SCHEMA = DATABASE()
    AND kcu.TABLE_NAME = 'artifacts'
    AND kcu.COLUMN_NAME = 'caseId'
    AND kcu.REFERENCED_TABLE_NAME = 'cases'
    AND rc.DELETE_RULE = 'CASCADE'
    AND rc.UPDATE_RULE = 'CASCADE'
);
SET @sql_add_artifact_cascade_fk := IF(
  @has_artifact_cascade_fk = 0,
  'ALTER TABLE `artifacts` ADD CONSTRAINT `fk_artifacts_caseId`
     FOREIGN KEY (`caseId`) REFERENCES `cases` (`id`)
     ON DELETE CASCADE ON UPDATE CASCADE',
  'DO 0'
);
PREPARE stmt_add_artifact_cascade_fk FROM @sql_add_artifact_cascade_fk;
EXECUTE stmt_add_artifact_cascade_fk;
DEALLOCATE PREPARE stmt_add_artifact_cascade_fk;

SET SQL_SAFE_UPDATES = @old_sql_safe_updates;

SELECT
  DATABASE() AS current_database,
  (SELECT COUNT(*) FROM `cases`) AS cases_total,
  (SELECT COUNT(*) FROM `cases` WHERE `year` IS NULL) AS cases_missing_year,
  (SELECT COUNT(*) FROM `cases` WHERE `course` IS NULL OR `course` = '' OR `category` IS NULL OR `category` = '') AS cases_missing_course_or_category,
  (SELECT COUNT(*) FROM `cases` WHERE `course` NOT IN ('语文', '数学', '乡土课程')) AS cases_invalid_course,
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cases' AND COLUMN_NAME = 'courseId') AS legacy_courseid_column_count;
