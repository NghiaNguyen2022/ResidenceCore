-- 16L8.19 — Kiểm tra giao dịch thuộc ca Cửa hàng

SELECT
      id,
      ledgerId,
      storeShiftId,
      transactionDate,
      direction,
      category,
      amount,
      status,
      isActive,
      title
FROM storeLedgerTransactions
WHERE transactionDate = '2026-07-21'
ORDER BY id;

SELECT
      id,
      shiftDate,
      shiftType,
      openingCash,
      expectedClosingCash,
      countedClosingCash,
      cashDifference,
      status
FROM storeShifts
ORDER BY id DESC;
