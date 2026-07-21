#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

root = Path.cwd()
path = root / "server/services/storeShiftHandoverService.ts"
if not path.exists():
    raise SystemExit("Không tìm thấy server/services/storeShiftHandoverService.ts")

text = path.read_text(encoding="utf-8")
backup = root / f".backup_16L8_19_{datetime.now().strftime('%Y%m%d_%H%M%S')}" / path.relative_to(root)
backup.parent.mkdir(parents=True, exist_ok=True)
shutil.copy2(path, backup)

old_helper = '''function asMoney(value: unknown) {
      return toMoney(value).toFixed(2);
}
'''
new_helper = '''function asMoney(value: unknown) {
      return toMoney(value).toFixed(2);
}

function toDateKey(value: unknown) {
      if (!value) return "";

      if (typeof value === "string") {
            const matched = value.match(/^\\d{4}-\\d{2}-\\d{2}/);
            if (matched) return matched[0];
      }

      const date = value instanceof Date ? value : new Date(String(value));
      if (Number.isNaN(date.getTime())) {
            throw new Error("Ngày ca trực Cửa hàng không hợp lệ.");
      }

      const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Ho_Chi_Minh",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
      }).formatToParts(date);

      const getPart = (type: string) =>
            parts.find((item) => item.type === type)?.value || "";

      return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}
'''

if old_helper not in text:
    raise SystemExit("Không tìm thấy block helper để thêm toDateKey().")
text = text.replace(old_helper, new_helper, 1)

old_calc = '''async function calculateShiftCash(shift: any) {
      const transactions = await storeDb.listStoreLedgerTransactions({
            ledgerId: Number(shift.ledgerId),
            fromDate: String(shift.shiftDate),
            toDate: String(shift.shiftDate),
            direction: "all",
            limit: 500,
      });

      const totalSales = transactions
            .filter((item: any) => item.direction === "in" && item.category === "sales")
            .reduce((sum: number, item: any) => sum + toMoney(item.amount), 0);

      const totalOtherIncome = transactions
            .filter((item: any) => item.direction === "in" && item.category !== "sales")
            .reduce((sum: number, item: any) => sum + toMoney(item.amount), 0);

      const totalPurchases = transactions
            .filter((item: any) =>
                  item.direction === "out" &&
                  ["purchase_stock", "purchase"].includes(String(item.category || "")),
            )
            .reduce((sum: number, item: any) => sum + toMoney(item.amount), 0);

      const totalOtherExpense = transactions
            .filter((item: any) =>
                  item.direction === "out" &&
                  !["purchase_stock", "purchase"].includes(String(item.category || "")),
            )
            .reduce((sum: number, item: any) => sum + toMoney(item.amount), 0);
'''

new_calc = '''async function calculateShiftCash(shift: any) {
      const shiftDate = toDateKey(shift.shiftDate);
      const transactions = await storeDb.listStoreLedgerTransactions({
            ledgerId: Number(shift.ledgerId),
            fromDate: shiftDate,
            toDate: shiftDate,
            direction: "all",
            limit: 500,
      });

      const linkedTransactions = transactions.filter(
            (item: any) => Number(item.storeShiftId || 0) === Number(shift.id),
      );

      const shiftTransactions =
            linkedTransactions.length > 0
                  ? linkedTransactions
                  : transactions.filter((item: any) => !Number(item.storeShiftId || 0));

      const postedTransactions = shiftTransactions.filter(
            (item: any) =>
                  item.isActive !== false &&
                  !["cancelled", "void"].includes(String(item.status || "").toLowerCase()),
      );

      const totalSales = postedTransactions
            .filter((item: any) => item.direction === "in" && item.category === "sales")
            .reduce((sum: number, item: any) => sum + toMoney(item.amount), 0);

      const totalOtherIncome = postedTransactions
            .filter((item: any) => item.direction === "in" && item.category !== "sales")
            .reduce((sum: number, item: any) => sum + toMoney(item.amount), 0);

      const totalPurchases = postedTransactions
            .filter((item: any) =>
                  item.direction === "out" &&
                  ["purchase_stock", "purchase"].includes(String(item.category || "")),
            )
            .reduce((sum: number, item: any) => sum + toMoney(item.amount), 0);

      const totalOtherExpense = postedTransactions
            .filter((item: any) =>
                  item.direction === "out" &&
                  !["purchase_stock", "purchase"].includes(String(item.category || "")),
            )
            .reduce((sum: number, item: any) => sum + toMoney(item.amount), 0);
'''

if old_calc not in text:
    raise SystemExit("Không tìm thấy block calculateShiftCash() đúng phiên bản Git hiện tại.")
text = text.replace(old_calc, new_calc, 1)

old_receiver = '            shiftDate: String(shift.shiftDate),'
new_receiver = '            shiftDate: toDateKey(shift.shiftDate),'
if old_receiver not in text:
    raise SystemExit("Không tìm thấy block findReceiverShift().")
text = text.replace(old_receiver, new_receiver, 1)

path.write_text(text, encoding="utf-8")
print("16L8.19 applied successfully")
print("Backup:", backup)
