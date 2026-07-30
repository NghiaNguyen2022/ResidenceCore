-- 16L8.16 — Kiểm tra khóa ngoại gây lỗi phân công Cửa hàng

SELECT id, username, role
FROM users
ORDER BY id;

SHOW CREATE TABLE storeDutyAssignments;
SHOW CREATE TABLE storeShifts;

-- Kiểm tra ca đã tạo dở dang nếu lần phân công trước insert dutyAssignments thành công
-- nhưng insert phần Store thất bại.
SELECT
      da.id AS dutyAssignmentId,
      da.dutyConfigId,
      da.residentId,
      da.assignedToType,
      da.assignedToId,
      da.assignedDate,
      da.status,
      sda.id AS storeDutyAssignmentId,
      sh.id AS storeShiftId
FROM dutyAssignments da
LEFT JOIN storeDutyAssignments sda
      ON sda.dutyAssignmentId = da.id
LEFT JOIN storeShifts sh
      ON sh.storeDutyAssignmentId = sda.id
WHERE da.assignedToType = 'resident'
ORDER BY da.id DESC
LIMIT 50;
