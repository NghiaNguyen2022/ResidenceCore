import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { FormDateInput } from "@/components/shared";
import { ErrorText, Field, Modal, inputClass } from "@/components/store-ledger/StoreLedgerShared";
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
  const duplicateProductIds = useMemo(() => {
    const counts = new Map<string, number>();
    draft.lines.forEach((line) => {
      if (line.productId) counts.set(line.productId, (counts.get(line.productId) || 0) + 1);
    });
    return new Set(Array.from(counts.entries()).filter(([, count]) => count > 1).map(([id]) => id));
  }, [draft.lines]);
  const hasInvalidLine = draft.lines.some((line) => !line.productId || parseCurrencyInput(line.quantity) <= 0 || parseCurrencyInput(line.unitValue) <= 0);
  const overStockLines = useMemo(() => {
    if (type !== "sale") return new Set<string>();
    return new Set(
      draft.lines
        .filter((line) => {
          const product = products.find((item) => String(item.id) === line.productId);
          return product && parseCurrencyInput(line.quantity) > Number(product.currentStock || 0);
        })
        .map((line) => line.key),
    );
  }, [draft.lines, products, type]);

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
      <div className="space-y-3">
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

        <section className="overflow-hidden rounded-[1.25rem] border border-[#eadfca] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eadfca] bg-amber-50/45 px-4 py-3">
            <div>
              <h3 className="text-base font-black text-slate-950">Hàng hóa trong phiếu</h3>
              <p className="text-xs font-medium text-slate-500">
                {type === "stock_in" ? "Thêm nhiều mặt hàng trong cùng một phiếu nhập." : "Chọn hàng, kiểm tra tồn và giá bán trước khi lưu phiếu."}
              </p>
            </div>
            <button type="button" onClick={addLine} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white">
              <Plus className="h-4 w-4" /> Thêm dòng
            </button>
          </div>
          <div className="space-y-2.5 p-3">
            {draft.lines.map((line, index) => {
              const selectedProduct = products.find((item) => String(item.id) === line.productId);
              const quantity = parseCurrencyInput(line.quantity);
              const unitValue = parseCurrencyInput(line.unitValue);
              return (
                <div key={line.key} className="rounded-2xl border border-slate-200/80 bg-slate-50/55 p-3">
                  <div className="grid gap-2.5 md:grid-cols-[minmax(220px,1.7fr)_110px_140px_130px_40px] md:items-end">
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
                        {products.map((product) => {
                          const selectedElsewhere = draft.lines.some((other) => other.key !== line.key && other.productId === String(product.id));
                          return (
                            <option key={product.id} value={product.id} disabled={selectedElsewhere}>
                              {product.productName}{type === "sale" ? ` · tồn ${formatMoney(product.currentStock)} ${product.unit || ""}` : ` · ${product.unit || ""}`}
                            </option>
                          );
                        })}
                      </select>
                    </Field>
                    <Field label="Số lượng">
                      <input inputMode="numeric" value={line.quantity} onChange={(event) => updateLine(line.key, { quantity: formatCurrencyInput(event.target.value) })} className={`${inputClass} text-right`} />
                    </Field>
                    <Field label={type === "stock_in" ? "Giá vốn / đơn vị" : "Giá bán / đơn vị"}>
                      <input inputMode="numeric" value={line.unitValue} onChange={(event) => updateLine(line.key, { unitValue: formatCurrencyInput(event.target.value) })} className={`${inputClass} text-right`} />
                    </Field>
                    <div className="rounded-xl bg-white px-3 py-2 text-right ring-1 ring-slate-100">
                      <p className="text-xs font-semibold text-slate-500">Thành tiền</p>
                      <p className="mt-0.5 whitespace-nowrap text-sm font-black text-slate-950">{formatMoney(quantity * unitValue)} đ</p>
                      {type === "sale" && selectedProduct ? <p className="text-[11px] font-semibold text-slate-500">Tồn {formatMoney(selectedProduct.currentStock)} {selectedProduct.unit || ""}</p> : null}
                    </div>
                    <button type="button" onClick={() => removeLine(line.key)} className="rounded-xl border border-rose-100 bg-white p-2 text-rose-600 shadow-sm disabled:opacity-40" disabled={draft.lines.length <= 1}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {duplicateProductIds.has(line.productId) ? (
                    <p className="mt-2 text-xs font-bold text-rose-600">Hàng hóa này đã có trong phiếu. Hãy gộp số lượng vào một dòng.</p>
                  ) : null}
                  {overStockLines.has(line.key) ? (
                    <p className="mt-2 text-xs font-bold text-rose-600">Số lượng bán vượt tồn hiện tại. Vui lòng giảm số lượng trước khi lưu.</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid gap-3 rounded-2xl border border-amber-100 bg-amber-50/45 px-4 py-3 sm:grid-cols-2">
          <div><p className="text-xs font-semibold text-slate-500">Tổng số lượng</p><p className="mt-0.5 text-lg font-black text-slate-950">{formatMoney(totalQuantity)}</p></div>
          <div className="sm:text-right"><p className="text-xs font-semibold text-slate-500">Tổng giá trị nhập</p><p className="mt-0.5 text-lg font-black text-amber-700">{formatMoney(totalAmount)} đ</p></div>
        </div>

        <Field label="Ghi chú">
          <textarea value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} rows={2} className={inputClass} />
        </Field>
        {duplicateProductIds.size ? <ErrorText>Mỗi hàng hóa chỉ được xuất hiện một lần trong phiếu.</ErrorText> : null}
        {overStockLines.size ? <ErrorText>Có hàng hóa đang bán vượt số lượng tồn kho.</ErrorText> : null}
        {error ? <ErrorText>{error}</ErrorText> : null}
        <div className="sticky bottom-0 -mx-5 flex flex-col gap-2 border-t border-[#eadfca] bg-white/95 px-5 pb-1 pt-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-slate-500">
            {hasInvalidLine
              ? "Hoàn tất hàng hóa, số lượng và đơn giá trước khi lưu."
              : duplicateProductIds.size
                ? "Mỗi hàng hóa chỉ được xuất hiện một lần trong phiếu."
                : overStockLines.size
                  ? "Có hàng hóa đang bán vượt tồn hiện tại."
                  : `${draft.lines.length} dòng hàng · Tổng ${formatMoney(totalAmount)} đ`}
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => onSave(draft)}
              disabled={Boolean(loading || duplicateProductIds.size || overStockLines.size || hasInvalidLine)}
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-slate-950/15 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {loading ? "Đang lưu..." : type === "stock_in" ? "Lưu phiếu nhập" : "Lưu phiếu bán"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
