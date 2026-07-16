import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { FormDateInput } from "@/components/shared";
import { ErrorText, Field, Modal, ModalFooter, inputClass } from "@/components/store-ledger/StoreLedgerShared";
import { formatCurrencyInput, formatMoney, getTodayYmd, parseCurrencyInput } from "@/components/store-ledger/storeLedgerUtils";
import type { StoreDocumentDraft, StoreDocumentLineDraft, StoreDocumentType } from "./storeDocumentTypes";

function emptyLine(products: any[], type: StoreDocumentType): StoreDocumentLineDraft {
  const product = products.find((item) => item?.isActive !== false && (type === "stock_in" || Number(item.currentStock || 0) > 0));
  const value = type === "stock_in"
    ? Number(product?.averageCostPrice || product?.defaultCostPrice || 0)
    : Number(product?.currentSalePrice || product?.defaultSalePrice || 0);
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    productId: product?.id ? String(product.id) : "",
    quantity: "",
    unitValue: value > 0 ? formatCurrencyInput(value) : "",
    notes: "",
  };
}

function createDraft(products: any[], type: StoreDocumentType): StoreDocumentDraft {
  return {
    documentDate: getTodayYmd(),
    stockInSource: "purchase",
    partnerName: "",
    paymentMethod: "cash",
    notes: "",
    lines: [emptyLine(products, type)],
  };
}

export function StoreDocumentFormModal({
  open,
  type,
  products,
  loading,
  error,
  onClose,
  onSave,
}: {
  open: boolean;
  type: StoreDocumentType;
  products: any[];
  loading?: boolean;
  error?: string;
  onClose: () => void;
  onSave: (draft: StoreDocumentDraft) => void;
}) {
  const [draft, setDraft] = useState<StoreDocumentDraft>(() => createDraft(products, type));

  useEffect(() => {
    if (open) setDraft(createDraft(products, type));
  }, [open, type]);

  const totalQuantity = useMemo(
    () => draft.lines.reduce((sum, line) => sum + parseCurrencyInput(line.quantity), 0),
    [draft.lines],
  );
  const totalAmount = useMemo(
    () => draft.lines.reduce((sum, line) => sum + parseCurrencyInput(line.quantity) * parseCurrencyInput(line.unitValue), 0),
    [draft.lines],
  );

  if (!open) return null;

  function updateLine(key: string, patch: Partial<StoreDocumentLineDraft>) {
    setDraft((current) => ({
      ...current,
      lines: current.lines.map((line) => line.key === key ? { ...line, ...patch } : line),
    }));
  }

  function addLine() {
    setDraft((current) => ({ ...current, lines: [...current.lines, emptyLine(products, type)] }));
  }

  function removeLine(key: string) {
    setDraft((current) => ({ ...current, lines: current.lines.length > 1 ? current.lines.filter((line) => line.key !== key) : current.lines }));
  }

  return (
    <Modal title={type === "stock_in" ? "Tạo phiếu nhập kho" : "Tạo phiếu bán hàng"} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {type === "stock_in" ? (
            <Field label="Nguồn nhập">
              <select
                value={draft.stockInSource}
                onChange={(event) => setDraft((current) => ({ ...current, stockInSource: event.target.value as any }))}
                className={inputClass}
              >
                <option value="purchase">Mua hàng</option>
                <option value="production">Sản xuất / gia công nội bộ</option>
                <option value="self_supply">Tự cung cấp / được cấp</option>
                <option value="other">Nguồn khác</option>
              </select>
            </Field>
          ) : null}
          <Field label={type === "stock_in" ? "Ngày nhập" : "Ngày bán"}>
            <FormDateInput value={draft.documentDate} onChange={(event: any) => setDraft((current) => ({ ...current, documentDate: event.target.value }))} />
          </Field>
          <Field label={type === "stock_in" ? "Nhà cung cấp / nguồn giao" : "Khách hàng"}>
            <input value={draft.partnerName} onChange={(event) => setDraft((current) => ({ ...current, partnerName: event.target.value }))} className={inputClass} />
          </Field>
          <Field label="Phương thức thanh toán">
            <select value={draft.paymentMethod} onChange={(event) => setDraft((current) => ({ ...current, paymentMethod: event.target.value }))} className={inputClass}>
              <option value="cash">Tiền mặt</option>
              <option value="bank_transfer">Chuyển khoản</option>
              <option value="other">Khác</option>
            </select>
          </Field>
        </div>

        <section className="overflow-hidden rounded-2xl border border-amber-100 bg-white">
          <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50/70 px-4 py-3">
            <div>
              <h3 className="text-sm font-black text-slate-950">Danh sách hàng hóa</h3>
              <p className="text-xs font-semibold text-slate-500">Một phiếu có thể gồm nhiều mặt hàng.</p>
            </div>
            <button type="button" onClick={addLine} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white">
              <Plus className="h-4 w-4" /> Thêm dòng
            </button>
          </div>
          <div className="space-y-3 p-3">
            {draft.lines.map((line, index) => {
              const selectedProduct = products.find((item) => String(item.id) === line.productId);
              const quantity = parseCurrencyInput(line.quantity);
              const unitValue = parseCurrencyInput(line.unitValue);
              return (
                <div key={line.key} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_120px_150px_130px_auto] lg:items-end">
                    <Field label={`Hàng hóa ${index + 1}`}>
                      <select
                        value={line.productId}
                        onChange={(event) => {
                          const product = products.find((item) => String(item.id) === event.target.value);
                          const defaultValue = type === "stock_in"
                            ? Number(product?.averageCostPrice || product?.defaultCostPrice || 0)
                            : Number(product?.currentSalePrice || product?.defaultSalePrice || 0);
                          updateLine(line.key, { productId: event.target.value, unitValue: defaultValue > 0 ? formatCurrencyInput(defaultValue) : "" });
                        }}
                        className={inputClass}
                      >
                        <option value="">Chọn hàng hóa</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.productName}{type === "sale" ? ` · tồn ${formatMoney(product.currentStock)} ${product.unit || ""}` : ""}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Số lượng">
                      <input inputMode="numeric" value={line.quantity} onChange={(event) => updateLine(line.key, { quantity: formatCurrencyInput(event.target.value) })} className={`${inputClass} text-right`} />
                    </Field>
                    <Field label={type === "stock_in" ? "Giá vốn / đơn vị" : "Giá bán / đơn vị"}>
                      <input inputMode="numeric" value={line.unitValue} onChange={(event) => updateLine(line.key, { unitValue: formatCurrencyInput(event.target.value) })} className={`${inputClass} text-right`} />
                    </Field>
                    <div className="pb-2 text-right">
                      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Thành tiền</p>
                      <p className="mt-1 text-sm font-black text-slate-950">{formatMoney(quantity * unitValue)} đ</p>
                      {type === "sale" && selectedProduct ? <p className="text-[11px] font-semibold text-slate-500">Tồn {formatMoney(selectedProduct.currentStock)} {selectedProduct.unit || ""}</p> : null}
                    </div>
                    <button type="button" onClick={() => removeLine(line.key)} className="mb-2 rounded-xl border border-rose-100 bg-white p-2 text-rose-600 disabled:opacity-40" disabled={draft.lines.length <= 1}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-4 sm:grid-cols-2">
          <div><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Tổng số lượng</p><p className="mt-1 text-xl font-black text-slate-950">{formatMoney(totalQuantity)}</p></div>
          <div className="text-right"><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Tổng giá trị</p><p className="mt-1 text-xl font-black text-amber-700">{formatMoney(totalAmount)} đ</p></div>
        </div>

        <Field label="Ghi chú">
          <textarea value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} rows={2} className={inputClass} />
        </Field>
        {error ? <ErrorText>{error}</ErrorText> : null}
        <ModalFooter onClose={onClose} onSave={() => onSave(draft)} saveText={type === "stock_in" ? "Lưu phiếu nhập" : "Lưu phiếu bán"} loading={loading} />
      </div>
    </Modal>
  );
}
