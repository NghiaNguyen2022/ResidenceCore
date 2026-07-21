-- 16L8.1 — Fix giờ truy cập ca Cửa hàng theo Asia/Ho_Chi_Minh
-- Nguyên nhân: giờ ca 07:00/13:00 đang được tạo bằng Date.UTC như thể là UTC,
-- nên 07:00 Việt Nam bị hiểu thành 14:00 Việt Nam.
--
-- Script idempotent: chỉ sửa các dòng còn mang giờ wall-clock sai 07:00/13:00.

START TRANSACTION;

UPDATE storeShifts
SET
      scheduledFrom = DATE_SUB(scheduledFrom, INTERVAL 7 HOUR),
      scheduledTo = DATE_SUB(scheduledTo, INTERVAL 7 HOUR),
      accessValidFrom = DATE_SUB(accessValidFrom, INTERVAL 7 HOUR),
      accessValidUntil = DATE_SUB(accessValidUntil, INTERVAL 7 HOUR),
      updatedAt = CURRENT_TIMESTAMP
WHERE
      (
            (shiftType = 'morning' AND HOUR(accessValidFrom) = 7)
            OR
            (shiftType = 'afternoon' AND HOUR(accessValidFrom) = 13)
      )
      AND status NOT IN ('confirmed', 'cancelled');

UPDATE storeDutyAccessSessions AS s
INNER JOIN storeShifts AS sh ON sh.id = s.storeShiftId
SET
      s.validFrom = DATE_SUB(s.validFrom, INTERVAL 7 HOUR),
      s.validUntil = DATE_SUB(s.validUntil, INTERVAL 7 HOUR),
      s.sessionExpiresAt = CASE
            WHEN s.sessionExpiresAt IS NULL THEN NULL
            ELSE LEAST(
                  s.sessionExpiresAt,
                  DATE_SUB(sh.accessValidUntil, INTERVAL 0 HOUR)
            )
      END,
      s.updatedAt = CURRENT_TIMESTAMP
WHERE
      (
            (sh.shiftType = 'morning' AND HOUR(s.validFrom) = 7)
            OR
            (sh.shiftType = 'afternoon' AND HOUR(s.validFrom) = 13)
      )
      AND s.status IN ('pending', 'active');

COMMIT;

-- Kiểm tra sau khi chạy:
SELECT
      id,
      shiftDate,
      shiftType,
      scheduledFrom,
      scheduledTo,
      accessValidFrom,
      accessValidUntil,
      status
FROM storeShifts
ORDER BY shiftDate DESC, shiftType, id DESC
LIMIT 20;
