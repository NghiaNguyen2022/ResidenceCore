-- 16L8.10 — Đồng bộ bảng storeDutyAccessSessions với Drizzle schema
-- Chạy trong MySQL Workbench trước khi test gửi mã lại.

SET SQL_SAFE_UPDATES = 0;

ALTER TABLE storeDutyAccessSessions
      MODIFY COLUMN accessCodeHash VARCHAR(255) NOT NULL,
      MODIFY COLUMN accessTokenHash VARCHAR(255) NULL,
      MODIFY COLUMN portalSessionId VARCHAR(255) NULL,
      MODIFY COLUMN validFrom TIMESTAMP NOT NULL,
      MODIFY COLUMN validUntil TIMESTAMP NOT NULL,
      MODIFY COLUMN verifiedAt TIMESTAMP NULL DEFAULT NULL,
      MODIFY COLUMN lastStoreActivityAt TIMESTAMP NULL DEFAULT NULL,
      MODIFY COLUMN sessionExpiresAt TIMESTAMP NULL DEFAULT NULL,
      MODIFY COLUMN issuedBy INT NULL,
      MODIFY COLUMN revokedAt TIMESTAMP NULL DEFAULT NULL;

SET SQL_SAFE_UPDATES = 1;

-- Kiểm tra cấu trúc sau khi sửa
SHOW CREATE TABLE storeDutyAccessSessions;

-- Kiểm tra ba khóa ngoại của dữ liệu đang phát hành
SELECT
      sh.id AS storeShiftId,
      sh.storeDutyAssignmentId,
      sda.id AS linkedStoreDutyAssignmentId,
      sdm.residentId AS linkedResidentId,
      r.id AS residentExists,
      r.fullName,
      r.userId
FROM storeShifts sh
LEFT JOIN storeDutyAssignments sda
      ON sda.id = sh.storeDutyAssignmentId
LEFT JOIN storeDutyMembers sdm
      ON sdm.storeDutyAssignmentId = sda.id
LEFT JOIN residents r
      ON r.id = sdm.residentId
WHERE sh.id = 3;
