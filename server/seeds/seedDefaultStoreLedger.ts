import { storeLedgerService } from "../services/storeLedgerService";

const DEFAULT_LEDGER = {
      ledgerCode: "CUA_HANG_LUU_XA",
      ledgerName: "Cửa hàng lưu xá nữ BMT",
      ledgerType: "store" as const,
      openingBalance: 0,
      description: "Sổ cửa hàng phục vụ học viên và hoạt động của lưu xá nữ tại Buôn Ma Thuột.",
      createdBy: null,
};

async function main() {
      const ledger = await storeLedgerService.createLedger(DEFAULT_LEDGER);
      console.log(
            JSON.stringify(
                  {
                        id: ledger.id,
                        ledgerCode: ledger.ledgerCode,
                        ledgerName: ledger.ledgerName,
                        isActive: ledger.isActive,
                  },
                  null,
                  2,
            ),
      );
}

main()
      .then(() => process.exit(0))
      .catch((error) => {
            console.error(error);
            process.exit(1);
      });
