-- Run once on the target ResidenceCore database.
-- These indexes support the current room, duty, attendance, and schedule queries.

CREATE INDEX idx_residents_status_current_room
      ON residents (status, currentRoomId);

CREATE INDEX idx_study_schedules_resident_day_active
      ON residentStudySchedules (residentId, dayOfWeek, isActive);

CREATE INDEX idx_room_assignments_room_unassigned
      ON roomAssignments (roomId, unassignedDate);

CREATE INDEX idx_room_assignments_resident_unassigned
      ON roomAssignments (residentId, unassignedDate);

CREATE INDEX idx_attendance_resident_date
      ON attendance (residentId, attendanceDate);

CREATE INDEX idx_duty_assignments_resident_date_status
      ON dutyAssignments (residentId, assignedDate, status);

CREATE INDEX idx_duty_assignments_config_date_target_status
      ON dutyAssignments (dutyConfigId, assignedDate, assigned_to_type, assigned_to_id, status);
