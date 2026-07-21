SET SQL_SAFE_UPDATES = 0;
START TRANSACTION;

UPDATE storeShifts
SET
      scheduledFrom = DATE_SUB(scheduledFrom, INTERVAL 7 HOUR),
      scheduledTo = DATE_SUB(scheduledTo, INTERVAL 7 HOUR),
      accessValidFrom = DATE_SUB(accessValidFrom, INTERVAL 7 HOUR),
      accessValidUntil = DATE_SUB(accessValidUntil, INTERVAL 7 HOUR),
      updatedAt = CURRENT_TIMESTAMP
WHERE id > 0
  AND (
        (shiftType = 'morning' AND HOUR(accessValidFrom) = 7)
        OR
        (shiftType = 'afternoon' AND HOUR(accessValidFrom) = 13)
  )
  AND status NOT IN ('confirmed', 'cancelled');

UPDATE storeDutyAccessSessions AS s
INNER JOIN storeShifts AS sh ON sh.id = s.storeShiftId
SET
      s.validFrom = sh.accessValidFrom,
      s.validUntil = sh.accessValidUntil,
      s.sessionExpiresAt = CASE
            WHEN s.sessionExpiresAt IS NULL THEN NULL
            ELSE LEAST(s.sessionExpiresAt, sh.accessValidUntil)
      END,
      s.updatedAt = CURRENT_TIMESTAMP
WHERE s.id > 0
  AND s.status IN ('pending', 'active');

COMMIT;
SET SQL_SAFE_UPDATES = 1;

SELECT id, shiftDate, shiftType, scheduledFrom, scheduledTo,
       accessValidFrom, accessValidUntil, status
FROM storeShifts
ORDER BY shiftDate DESC, shiftType, id DESC
LIMIT 30;
