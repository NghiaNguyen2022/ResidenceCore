#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

ROOT = Path.cwd()
BACKUP = ROOT / f".backup_16L8_21_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

def load(relative):
    path = ROOT / relative
    if not path.exists(): raise RuntimeError(f"Không tìm thấy {relative}")
    return path, path.read_text(encoding="utf-8")

def save(path, text):
    target = BACKUP / path.relative_to(ROOT)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, target)
    path.write_text(text, encoding="utf-8")

def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1: raise RuntimeError(f"{label}: cần 1 block, tìm thấy {count}")
    return text.replace(old, new, 1)

resident_path, resident = load("client/src/pages/ResidentStore.tsx")
resident = replace_once(resident, 'import { trpc } from "@/lib/trpc";', 'import { trpc } from "@/lib/trpc";\nimport { getPurchasePriceReference, getSalePriceReference } from "@/lib/storePriceDefaults";', "Import pricing helper")
resident = replace_once(resident, '''type DocumentLine = {
      productId: number;
      quantity: string;
      unitPrice?: string;
      unitCost?: string;
};''', '''type DocumentLine = {
      productId: number;
      quantity: string;
      unitPrice?: string;
      unitCost?: string;
      priceNote?: string;
      usesPurchasePrice?: boolean;
};''', "Mở rộng DocumentLine")
resident = replace_once(resident, '''      return {
            productId: 0,
            quantity: "1",
            unitPrice: "",
            unitCost: "",
      };''', '''      return {
            productId: 0,
            quantity: "1",
            unitPrice: "",
            unitCost: "",
            priceNote: "",
            usesPurchasePrice: false,
      };''', "Khởi tạo dòng giá")
resident = replace_once(resident, '''                                                                  onChange={(event) =>
                                                                        updateLine(
                                                                              activeTab === "sales" ? setSaleLines : setPurchaseLines,
                                                                              index,
                                                                              { productId: Number(event.target.value) },
                                                                        )
                                                                  }''', '''                                                                  onChange={(event) => {
                                                                        const productId = Number(event.target.value);
                                                                        const product = products.find((item: any) => Number(item.id) === productId);
                                                                        const reference = activeTab === "sales"
                                                                              ? getSalePriceReference(product)
                                                                              : getPurchasePriceReference(product);
                                                                        updateLine(
                                                                              activeTab === "sales" ? setSaleLines : setPurchaseLines,
                                                                              index,
                                                                              activeTab === "sales"
                                                                                    ? { productId, unitPrice: reference.value > 0 ? String(reference.value) : "", priceNote: reference.note, usesPurchasePrice: reference.isPurchaseFallback }
                                                                                    : { productId, unitCost: reference.value > 0 ? String(reference.value) : "", priceNote: reference.note, usesPurchasePrice: false },
                                                                        );
                                                                  }}''', "Tự điền giá khi chọn hàng")
resident = replace_once(resident, '''                                                            <input
                                                                  inputMode="numeric"
                                                                  value={activeTab === "sales" ? line.unitPrice : line.unitCost}
                                                                  onChange={(event) =>
                                                                        updateLine(
                                                                              activeTab === "sales" ? setSaleLines : setPurchaseLines,
                                                                              index,
                                                                              activeTab === "sales"
                                                                                    ? { unitPrice: event.target.value }
                                                                                    : { unitCost: event.target.value },
                                                                        )
                                                                  }
                                                                  placeholder={activeTab === "sales" ? "Đơn giá bán" : "Giá nhập"}
                                                                  className="rounded-xl border border-amber-100 bg-white px-3 py-2.5 text-sm"
                                                            />''', '''                                                            <div>
                                                                  <input
                                                                        inputMode="numeric"
                                                                        value={activeTab === "sales" ? line.unitPrice : line.unitCost}
                                                                        onChange={(event) => updateLine(
                                                                              activeTab === "sales" ? setSaleLines : setPurchaseLines,
                                                                              index,
                                                                              activeTab === "sales"
                                                                                    ? { unitPrice: event.target.value, priceNote: "Giá được nhập thủ công", usesPurchasePrice: false }
                                                                                    : { unitCost: event.target.value, priceNote: "Giá mua được nhập thủ công" },
                                                                        )}
                                                                        placeholder={activeTab === "sales" ? "Đơn giá bán" : "Giá mua"}
                                                                        className="w-full rounded-xl border border-amber-100 bg-white px-3 py-2.5 text-sm"
                                                                  />
                                                                  {line.priceNote ? (
                                                                        <p className={line.usesPurchasePrice ? "mt-1 text-[11px] font-semibold text-amber-700" : "mt-1 text-[11px] font-semibold text-slate-500"}>{line.priceNote}</p>
                                                                  ) : null}
                                                            </div>''', "Hiện ghi chú nguồn giá")
save(resident_path, resident)

modal_path, modal = load("client/src/components/store-ledger/StoreDocumentFormModal.tsx")
modal = replace_once(modal, 'import type { StoreDocumentDraft, StoreDocumentLineDraft, StoreDocumentType } from "./storeDocumentTypes";', 'import type { StoreDocumentDraft, StoreDocumentLineDraft, StoreDocumentType } from "./storeDocumentTypes";\nimport { getPurchasePriceReference, getSalePriceReference } from "@/lib/storePriceDefaults";', "Import helper modal")
modal = replace_once(modal, '''  const value = type === "stock_in"
    ? Number(product?.averageCostPrice || product?.defaultCostPrice || 0)
    : Number(product?.currentSalePrice || product?.defaultSalePrice || 0);''', '''  const reference = type === "stock_in"
    ? getPurchasePriceReference(product)
    : getSalePriceReference(product);
  const value = reference.value;''', "Giá mặc định modal")
modal = replace_once(modal, '''                           const defaultValue = type === "stock_in"
                             ? Number(product?.averageCostPrice || product?.defaultCostPrice || 0)
                             : Number(product?.currentSalePrice || product?.defaultSalePrice || 0);
                           updateLine(line.key, { productId: event.target.value, unitValue: defaultValue > 0 ? formatCurrencyInput(defaultValue) : "" });''', '''                           const reference = type === "stock_in"
                             ? getPurchasePriceReference(product)
                             : getSalePriceReference(product);
                           updateLine(line.key, { productId: event.target.value, unitValue: reference.value > 0 ? formatCurrencyInput(reference.value) : "", notes: reference.note });''', "Giá khi đổi hàng modal")
save(modal_path, modal)

print("16L8.21 applied")
print("Backup:", BACKUP)
