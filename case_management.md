Case Management Scope

Manage full lifecycle of case and associated objects: create, retrieve, update, delete.

Confirmed business rules

1. Deleting a case is hard delete and must cascade to dependent records.
2. Delete must show/require explicit warning confirmation before execution.
3. A case can exist with zero linked schools.
4. Artifact file content is stored in filesystem; DB stores only metadata/path.

Chinese support requirements (mandatory)

1. All new MySQL tables/columns must use `utf8mb4` and Chinese-friendly collation.
2. API must fully accept and return Chinese text for all content fields and messages.
3. Frontend UI labels, validation, warnings, and confirmations must support Chinese.
4. File metadata (especially `attachment_name`) must preserve Chinese filenames end-to-end.

Domain model

- case(id, description, courseId, createdAt, updatedAt)
- artifact(id, caseId, description, category, attachmentPath, attachmentName, attachmentMime, attachmentSize, type, createdAt, updatedAt)
- course(id, title, description, category, subcategory, createdAt, updatedAt)
- school(...) existing

Artifact type enum

- doc
- pdf
- video
- audio

Relationships

- case belongs to one course: `cases.courseId -> courses.id`
- artifact belongs to one case: `artifacts.caseId -> cases.id`
- case belongs to at most one school: `cases.schoolId -> schools.id` (nullable)

MySQL schema (draft)

```sql
CREATE TABLE courses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  category VARCHAR(255) NULL,
  subcategory VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE cases (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  description TEXT NOT NULL,
  course_id BIGINT NOT NULL,
  school_id BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cases_course
    FOREIGN KEY (course_id) REFERENCES courses(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_cases_school
    FOREIGN KEY (school_id) REFERENCES schools(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE artifacts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  case_id BIGINT NOT NULL,
  description TEXT NULL,
  category VARCHAR(255) NULL,
  attachment_path VARCHAR(1024) NOT NULL,
  attachment_name VARCHAR(255) NOT NULL,
  attachment_mime VARCHAR(255) NULL,
  attachment_size BIGINT NULL,
  type ENUM('doc','pdf','video','audio') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_artifacts_case
    FOREIGN KEY (case_id) REFERENCES cases(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

```

Notes

- `ON DELETE CASCADE` on `artifacts` implements confirmed cascade behavior.
- Delete safety is implemented at API/UI level (confirmation required), not by DB alone.
- Keep artifact files under an app-managed root, e.g. `upload/cases/{caseId}/...`.

REST API contract (draft)

Cases

- `POST /api/cases`
  - body: `{ description, courseId, schoolId?: number | null }`
  - allow empty/missing `schoolId`.
- `GET /api/cases`
  - supports pagination/filter (`courseId`, keyword).
- `GET /api/cases/:id`
  - return case + course + school + artifacts summary.
- `PUT /api/cases/:id`
  - body: `{ description?, courseId?, schoolId? }`
- `DELETE /api/cases/:id?confirmCascade=true`
  - hard delete case and cascaded artifacts.
  - reject without `confirmCascade=true` with warning payload.

Artifacts

- `POST /api/cases/:caseId/artifacts` (multipart/form-data)
  - fields: `description`, `category`, `type`, `file`
  - store file on disk, metadata in DB.
- `GET /api/cases/:caseId/artifacts`
- `GET /api/artifacts/:id/download`
- `PUT /api/artifacts/:id`
  - update metadata (`description`, `category`, `type`) and optionally replace file.
- `DELETE /api/artifacts/:id?confirmDelete=true`
  - hard delete artifact record + remove file from filesystem.

Courses

- `POST /api/courses`
  - body: `{ title, description?, category?, subcategory? }`
- `GET /api/courses`
- `GET /api/courses/:id`
- `PUT /api/courses/:id`
  - body: `{ title?, description?, category?, subcategory? }`
- `DELETE /api/courses/:id`
  - should fail if referenced by any case (`ON DELETE RESTRICT`).

Suggested error semantics

- Missing delete confirmation: `400` with message:
  - `"Destructive action. Re-submit with confirmCascade=true to permanently delete this case and all artifacts."`
  - `"危险操作：将永久删除该案例及其所有附件。请使用 confirmCascade=true 重新提交。"`
- Not found: `404`
- Validation error: `422`

React UI flow (draft)

1. Case List page
   - table: id, description, course, linked school, actions.
   - actions: view/edit/delete.
2. Case Form page
   - fields: description, course dropdown, school single-select (optional).
   - if course is managed in-page, support course category/subcategory display.
3. Case Detail page
   - sections: summary, linked school, artifacts.
   - artifact uploader and artifact list with category, download, delete.
4. Delete confirmation modal (required)
   - explicit warning text:
   - "This permanently deletes the case and all linked artifacts. This cannot be undone."
   - "此操作将永久删除该案例及其所有关联附件，且无法撤销。"
   - require user to click confirm before API call with `confirmCascade=true`.

Backend implementation notes

- Use transaction for case create/update/delete to keep DB consistency.
- On artifact create/update/delete, keep filesystem and DB consistent:
  - write file first, then DB insert; on DB failure, remove written file.
  - on delete, delete DB row and file in same request; log file delete failure for manual cleanup.
- Validate `artifact.type` against enum.
- Set HTTP headers for UTF-8 JSON responses:
  - `Content-Type: application/json; charset=utf-8`

Testing checklist

- Create case with no schools.
- Create case with one school and update/remove school link.
- Upload artifact and download artifact.
- Delete case without confirm flag returns warning/error.
- Delete case with confirm flag removes:
  - case row
  - all artifact rows
  - artifact files in filesystem
