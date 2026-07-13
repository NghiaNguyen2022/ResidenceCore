-- Việc 16A4 - Store ledger enum column check
-- Main fix is code-side drizzle/storeLedger.ts. Run this only to inspect DB columns.

SHOW COLUMNS FROM storeLedgers;
SHOW COLUMNS FROM storeLedgerTransactions;

-- Expected columns used by runtime after 16A4:
-- storeLedgers.ledgerType
-- storeLedgerTransactions.direction
-- storeLedgerTransactions.status
