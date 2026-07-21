from pathlib import Path
import shutil
from datetime import datetime

ROOT = Path.cwd()
STAMP = datetime.now().strftime("%Y%m%d_%H%M%S")
BACKUP = ROOT / f".backup_16L8_22_{STAMP}"


def load(relative: str):
    path = ROOT / relative
    if not path.exists():
        raise RuntimeError(f"Không tìm thấy {relative}")
    return path, path.read_text(encoding="utf-8")


def save(path: Path, text: str):
    target = BACKUP / path.relative_to(ROOT)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, target)
    path.write_text(text, encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: cần đúng 1 block, tìm thấy {count}")
    return text.replace(old, new, 1)


# ResidentStore.tsx
path, text = load("client/src/pages/ResidentStore.tsx")
text = replace_once(
    text,
    'import { trpc } from "@/lib/trpc";',
    'import { trpc } from "@/lib/trpc";\nimport { getPurchasePriceReference, getSalePriceReference } from "@/lib/storePriceDefaults";',
    "import helper giá",
)
text = replace_once(
    text,
    '''type DocumentLine = {
      productId: number;
      quantity: string;
      unitPrice?: string;
      unitCost?: string;
};''',
    '''type DocumentLine = {
      productId: number;
      quantity: string;
      unitPrice?: string;
      unitCost?: string;
      priceNote?: string;
      usesPurchasePrice?: boolean;
};''',
    "mở rộng DocumentLine",
)
text = replace_once(
    text,
    '''      return {
            productId: 0,
            quantity: "1",
            unitPrice: "",
            unitCost: "",
      };''',
    '''      return {
            productId: 0,
            quantity: "1",
            unitPrice: "",
            unitCost: "",
            priceNote: "",
            usesPurchasePrice: false,
      };''',
    "khởi tạo dòng",
)
text = replace_once(
    text,
    '''                                                                  onChange={(event) =>
                                                                        updateLine(
                                                                              activeTab === "sales" ? setSaleLines : setPurchaseLines,
                                                                              index,
                                                                              { productId: Number(event.target.value) },
                                                                        )
                                                                  }''',
    '''                                                                  onChange={(event) => {
                                                                        const productId = Number(event.target.value);
                                                                        const product = products.find(
                                                                              (item: any) => Number(item.id) === productId,
                                                                        );
                                                                        const reference = activeTab === "sales"
                                                                              ? getSalePriceReference(product)
                                                                              : getPurchasePriceReference(product);

                                                                        updateLine(
                                                                              activeTab === "sales" ? setSaleLines : setPurchaseLines,
                                                                              index,
                                                                              activeTab === "sales"
                                                                                    ? {
                                                                                            productId,
                                                                                            unitPrice: reference.value > 0
                                                                                                  ? String(reference.value)
                                                                                                  : "",
                                                                                            priceNote: reference.note,
                                                                                            usesPurchasePrice: reference.isPurchaseFallback,
                                                                                      }
                                                                                    : {
                                                                                            productId,
                                                                                            unitCost: reference.value > 0
                                                                                                  ? String(reference.value)
                                                                                                  : "",
                                                                                            priceNote: reference.note,
                                                                                            usesPurchasePrice: false,
                                                                                      },
                                                                        );
                                                                  }}''',
    "nhảy giá khi chọn hàng học viên",
)
text = replace_once(
    text,
    '''                                                            <input
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
                                                            />''',
    '''                                                            <div className="min-h-[66px]">
                                                                  <input
                                                                        inputMode="numeric"
                                                                        value={activeTab === "sales" ? line.unitPrice : line.unitCost}
                                                                        onChange={(event) =>
                                                                              updateLine(
                                                                                    activeTab === "sales" ? setSaleLines : setPurchaseLines,
                                                                                    index,
                                                                                    activeTab === "sales"
                                                                                          ? {
                                                                                                  unitPrice: event.target.value,
                                                                                                  priceNote: "Giá được nhập thủ công",
                                                                                                  usesPurchasePrice: false,
                                                                                            }
                                                                                          : {
                                                                                                  unitCost: event.target.value,
                                                                                                  priceNote: "Giá mua được nhập thủ công",
                                                                                            },
                                                                              )
                                                                        }
                                                                        placeholder={activeTab === "sales" ? "Đơn giá bán" : "Giá mua"}
                                                                        className="w-full rounded-xl border border-amber-100 bg-white px-3 py-2.5 text-sm"
                                                                  />
                                                                  {line.priceNote ? (
                                                                        <p className={[
                                                                              "mt-1 min-h-[16px] text-[11px] font-semibold leading-4",
                                                                              line.usesPurchasePrice
                                                                                    ? "text-amber-700"
                                                                                    : "text-slate-500",
                                                                        ].join(" ")}>
                                                                              {line.priceNote}
                                                                        </p>
                                                                  ) : <div className="mt-1 min-h-[16px]" />}
                                                            </div>''',
    "ghi chú giá học viên",
)
save(path, text)

# StoreDocumentFormModal.tsx - manager UI gọn hơn và cùng logic giá
path, text = load("client/src/components/store-ledger/StoreDocumentFormModal.tsx")
text = replace_once(
    text,
    'import type { StoreDocumentDraft, StoreDocumentLineDraft, StoreDocumentType } from "./storeDocumentTypes";',
    'import type { StoreDocumentDraft, StoreDocumentLineDraft, StoreDocumentType } from "./storeDocumentTypes";\nimport { getPurchasePriceReference, getSalePriceReference } from "@/lib/storePriceDefaults";',
    "import helper giá manager",
)
text = replace_once(
    text,
    '''  const value = type === "stock_in"
    ? Number(product?.averageCostPrice || product?.defaultCostPrice || 0)
    : Number(product?.currentSalePrice || product?.defaultSalePrice || 0);''',
    '''  const reference = type === "stock_in"
    ? getPurchasePriceReference(product)
    : getSalePriceReference(product);
  const value = reference.value;''',
    "giá mặc định manager",
)
text = replace_once(
    text,
    '''                           const defaultValue = type === "stock_in"
                             ? Number(product?.averageCostPrice || product?.defaultCostPrice || 0)
                             : Number(product?.currentSalePrice || product?.defaultSalePrice || 0);
                           updateLine(line.key, { productId: event.target.value, unitValue: defaultValue > 0 ? formatCurrencyInput(defaultValue) : "" });''',
    '''                           const reference = type === "stock_in"
                             ? getPurchasePriceReference(product)
                             : getSalePriceReference(product);
                           updateLine(line.key, {
                             productId: event.target.value,
                             unitValue: reference.value > 0 ? formatCurrencyInput(reference.value) : "",
                             notes: reference.note,
                           });''',
    "nhảy giá manager",
)
text = text.replace(
    'className="grid gap-2.5 md:grid-cols-[minmax(220px,1.7fr)_110px_140px_130px_40px] md:items-end"',
    'className="grid gap-2.5 md:grid-cols-[minmax(240px,1.8fr)_110px_165px_130px_40px] md:items-start"',
    1,
)
text = replace_once(
    text,
    '''                    <Field label={type === "stock_in" ? "Giá vốn / đơn vị" : "Giá bán / đơn vị"}>
                       <input inputMode="numeric" value={line.unitValue} onChange={(event) => updateLine(line.key, { unitValue: formatCurrencyInput(event.target.value) })} className={`${inputClass} text-right`} />
                     </Field>''',
    '''                    <Field label={type === "stock_in" ? "Giá mua / đơn vị" : "Giá bán / đơn vị"}>
                       <div className="min-h-[66px]">
                         <input
                           inputMode="numeric"
                           value={line.unitValue}
                           onChange={(event) => updateLine(line.key, {
                             unitValue: formatCurrencyInput(event.target.value),
                             notes: type === "stock_in" ? "Giá mua được nhập thủ công" : "Giá bán được nhập thủ công",
                           })}
                           className={`${inputClass} text-right`}
                         />
                         <p className={`mt-1 min-h-[16px] text-[11px] font-semibold leading-4 ${
                           type === "sale" && line.notes?.startsWith("Chưa có giá bán")
                             ? "text-amber-700"
                             : "text-slate-500"
                         }`}>
                           {line.notes || " "}
                         </p>
                       </div>
                     </Field>''',
    "UI giá manager",
)
save(path, text)

print("16L8.22 applied successfully")
print("Backup:", BACKUP)
