-- 16L8.9 - Kiểm tra khóa ngoại phiên truy cập Cửa hàng

SELECT
      sh.id AS storeShiftId,
      sh.storeDutyAssignmentId,
      sda.id AS linkedStoreDutyAssignmentId,
      sdm.residentId,
      r.fullName
FROM storeShifts sh
LEFT JOIN storeDutyAssignments sda
      ON sda.id = sh.storeDutyAssignmentId
LEFT JOIN storeDutyMembers sdm
      ON sdm.storeDutyAssignmentId = sda.id
LEFT JOIN residents r
      ON r.id = sdm.residentId
ORDER BY sh.id DESC;

SELECT id, username, role
FROM users
ORDER BY id;
