# 16L1 — Correct repository path fix

The actual repository structure is:
- drizzle/schema.ts
- drizzle/core.ts
- drizzle/residents.ts
- drizzle/storeLedger.ts

Replace:
- `drizzle/storeLedger.ts`
- `server/db/storeLedger.ts`

Delete the incorrectly copied file if it exists:
- `drizzle/schema/storeLedger.ts`

Do not add `.ts` extensions to these project imports.

Restart:
`pnpm dev`
