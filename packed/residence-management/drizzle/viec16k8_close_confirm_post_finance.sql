-- Việc 16K8: tách Chốt ngày / Xác nhận và chống đẩy trùng sang sổ chung.
-- Chạy trên MySQL sau khi đã apply các migration Store trước đó.

ALTER TABLE storeDailyClosings
  ADD COLUMN closedBy INT NULL AFTER status,
  ADD COLUMN closedAt DATETIME NULL AFTER closedBy,
  ADD COLUMN confirmedBy INT NULL AFTER approvedAt,
  ADD COLUMN confirmedAt DATETIME NULL AFTER confirmedBy;

-- Backfill dữ liệu cũ: createdBy/createdAt đại diện người và thời điểm chốt ban đầu.
UPDATE storeDailyClosings
SET closedBy = COALESCE(closedBy, createdBy),
    closedAt = COALESCE(closedAt, createdAt)
WHERE id > 0;

-- Backfill các ngày đã approved/closed trước đây.
UPDATE storeDailyClosings
SET confirmedBy = COALESCE(confirmedBy, approvedBy),
    confirmedAt = COALESCE(confirmedAt, approvedAt)
WHERE id > 0
  AND status IN ('approved', 'closed');

ALTER TABLE finance_transactions
  ADD COLUMN external_ref VARCHAR(160) NULL AFTER description;

CREATE UNIQUE INDEX uq_finance_transactions_external_ref
  ON finance_transactions (external_ref);
