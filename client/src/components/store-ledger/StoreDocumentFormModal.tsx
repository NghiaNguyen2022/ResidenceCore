import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { FormDateInput } from "@/components/shared";
import {
  ErrorText,
  Field,
  Modal,
  inputClass,
} from "@/components/store-ledger/StoreLedgerShared";
import {
  formatCurrencyInput,
  formatMoney,
  getTodayYmd,
  parseCurrencyInput,
} from "@/components/store-ledger/storeLedgerUtils";
import {
  getPurchasePriceReference,
  getSalePriceReference,
} from "@/lib/storePriceDefaults";
import type {
  StoreDocumentDraft,
  StoreDocumentLineDraft,
  StoreDocumentType,
} from "./storeDocumentTypes";

function emptyLine(
  products: any[],
  type: StoreDocumentType,
): StoreDocumentLineDraft {
  const product = products.find(
    (item) =>
      item?.isActive !== false &&
      (type === "stock_in" ||
        Number(item.currentStock || 0) > 0),
  );

  const reference =
    type === "stock_in"
      ? getPurchasePriceReference(product)
      : getSalePriceReference(product);

  return {
    key: `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`,
    productId: product?.id ? String(product.id) : "",
    quantity: "",
    unitValue:
      reference.value > 0
        ? formatCurrencyInput(reference.value)
        : "",
    notes: reference.note,
  };
}

function createDraft(
  products: any[],
  type: StoreDocumentType,
): StoreDocumentDraft {
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
  const [draft, setDraft] = useState<StoreDocumentDraft>(() =>
    createDraft(products, type),
  );

  useEffect(() => {
    if (open) {
      setDraft(createDraft(products, type));
    }
  }, [open, type, products]);

  const totalQuantity = useMemo(
    () =>
      draft.lines.reduce(
        (sum, line) =>
          sum + parseCurrencyInput(line.quantity),
        0,
      ),
    [draft.lines],
  );

  const totalAmount = useMemo(
    () =>
      draft.lines.reduce(
        (sum, line) =>
          sum +
          parseCurrencyInput(line.quantity) *
            parseCurrencyInput(line.unitValue),
        0,
      ),
    [draft.lines],
  );

  const invalid = draft.lines.some(
    (line) =>
      !line.productId ||
      parseCurrencyInput(line.quantity) <= 0 ||
      parseCurrencyInput(line.unitValue) <= 0,
  );

  function updateLine(
    key: string,
    patch: Partial<StoreDocumentLineDraft>,
  ) {
    setDraft((current) => ({
      ...current,
      lines: current.lines.map((line) =>
        line.key === key ? { ...line, ...patch } : line,
      ),
    }));
  }

  if (!open) return null;

  return (
    <Modal
      title={
        type === "stock_in"
          ? "Tạo phiếu nhập kho"
          : "Tạo phiếu bán hàng"
      }
      onClose={onClose}
    >
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          {type === "stock_in" ? (
            <Field label="Nguồn nhập">
              <select
                value={draft.stockInSource}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    stockInSource: event.target.value as any,
                  }))
                }
                className={inputClass}
              >
                <option value="purchase">Mua hàng</option>
                <option value="production">
                  Sản xuất / gia công nội bộ
                </option>
                <option value="self_supply">
                  Tự cung cấp / được cấp
                </option>
                <option value="other">Nguồn khác</option>
              </select>
            </Field>
          ) : null}

          <Field
            label={
              type === "stock_in" ? "Ngày nhập" : "Ngày bán"
            }
          >
            <FormDateInput
              value={draft.documentDate}
              onChange={(event: any) =>
                setDraft((current) => ({
                  ...current,
                  documentDate: event.target.value,
                }))
              }
            />
          </Field>

          <Field
            label={
              type === "stock_in"
                ? "Nhà cung cấp / nguồn giao"
                : "Khách hàng"
            }
          >
            <input
              value={draft.partnerName}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  partnerName: event.target.value,
                }))
              }
              className={inputClass}
            />
          </Field>

          <Field label="Phương thức thanh toán">
            <select
              value={draft.paymentMethod}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  paymentMethod: event.target.value,
                }))
              }
              className={inputClass}
            >
              <option value="cash">Tiền mặt</option>
              <option value="bank_transfer">
                Chuyển khoản
              </option>
              <option value="other">Khác</option>
            </select>
          </Field>
        </div>

        <section className="overflow-hidden rounded-[1.25rem] border border-[#eadfca] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#eadfca] bg-amber-50/45 px-4 py-3">
            <div>
              <h3 className="text-base font-black text-slate-950">
                Hàng hóa trong phiếu
              </h3>
              <p className="text-xs font-medium text-slate-500">
                {type === "stock_in"
                  ? "Giá nhập lấy giá mua gần nhất; chưa có thì dùng giá mua trung bình."
                  : "Có giá bán thì dùng giá bán; chưa có sẽ dùng giá mua và ghi chú."}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  lines: [
                    ...current.lines,
                    emptyLine(products, type),
                  ],
                }))
              }
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white"
            >
              <Plus className="h-4 w-4" />
              Thêm dòng
            </button>
          </div>

          <div className="space-y-2.5 p-3">
            {draft.lines.map((line, index) => {
              const product = products.find(
                (item) =>
                  String(item.id) === line.productId,
              );
              const reference =
                type === "stock_in"
                  ? getPurchasePriceReference(product)
                  : getSalePriceReference(product);
              const quantity = parseCurrencyInput(
                line.quantity,
              );
              const unitValue = parseCurrencyInput(
                line.unitValue,
              );

              return (
                <div
                  key={line.key}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/55 p-3"
                >
                  <div className="grid gap-2.5 md:grid-cols-[minmax(220px,1.7fr)_120px_180px_145px_42px] md:items-start">
                    <Field label={`Hàng hóa ${index + 1}`}>
                      <select
                        value={line.productId}
                        onChange={(event) => {
                          const selected = products.find(
                            (item) =>
                              String(item.id) ===
                              event.target.value,
                          );
                          const nextReference =
                            type === "stock_in"
                              ? getPurchasePriceReference(
                                  selected,
                                )
                              : getSalePriceReference(selected);

                          updateLine(line.key, {
                            productId: event.target.value,
                            unitValue:
                              nextReference.value > 0
                                ? formatCurrencyInput(
                                    nextReference.value,
                                  )
                                : "",
                            notes: nextReference.note,
                          });
                        }}
                        className={inputClass}
                      >
                        <option value="">
                          Chọn hàng hóa
                        </option>
                        {products.map((item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.productName}
                            {type === "sale"
                              ? ` · tồn ${formatMoney(
                                  item.currentStock,
                                )} ${item.unit || ""}`
                              : ` · ${item.unit || ""}`}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Số lượng">
                      <input
                        inputMode="numeric"
                        value={line.quantity}
                        onChange={(event) =>
                          updateLine(line.key, {
                            quantity: formatCurrencyInput(
                              event.target.value,
                            ),
                          })
                        }
                        className={`${inputClass} text-right`}
                      />
                    </Field>

                    <Field
                      label={
                        type === "stock_in"
                          ? "Giá mua / đơn vị"
                          : "Giá bán / đơn vị"
                      }
                    >
                      <input
                        inputMode="numeric"
                        value={line.unitValue}
                        onChange={(event) =>
                          updateLine(line.key, {
                            unitValue: formatCurrencyInput(
                              event.target.value,
                            ),
                            notes:
                              type === "stock_in"
                                ? "Giá mua nhập thủ công"
                                : "Giá bán nhập thủ công",
                          })
                        }
                        className={`${inputClass} text-right font-bold`}
                      />
                      <p
                        className={`mt-1 min-h-[16px] text-[11px] font-semibold ${
                          reference.isPurchaseFallback
                            ? "text-amber-700"
                            : "text-slate-500"
                        }`}
                      >
                        {line.notes || reference.note}
                      </p>
                    </Field>

                    <div className="rounded-xl bg-white px-3 py-2 text-right ring-1 ring-slate-100">
                      <p className="text-xs font-semibold text-slate-500">
                        Thành tiền
                      </p>
                      <p className="mt-0.5 whitespace-nowrap text-sm font-black text-slate-950">
                        {formatMoney(quantity * unitValue)} đ
                      </p>
                      {type === "sale" && product ? (
                        <p className="text-[11px] font-semibold text-slate-500">
                          Tồn {formatMoney(product.currentStock)}{" "}
                          {product.unit || ""}
                        </p>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      disabled={draft.lines.length <= 1}
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          lines: current.lines.filter(
                            (item) =>
                              item.key !== line.key,
                          ),
                        }))
                      }
                      className="rounded-xl border border-rose-100 bg-white p-2 text-rose-600 disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid gap-3 rounded-2xl border border-amber-100 bg-amber-50/45 px-4 py-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Tổng số lượng
            </p>
            <p className="mt-0.5 text-lg font-black text-slate-950">
              {formatMoney(totalQuantity)}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold text-slate-500">
              {type === "stock_in"
                ? "Tổng giá trị nhập"
                : "Tổng giá trị bán"}
            </p>
            <p className="mt-0.5 text-lg font-black text-amber-700">
              {formatMoney(totalAmount)} đ
            </p>
          </div>
        </div>

        <Field label="Ghi chú">
          <textarea
            value={draft.notes}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                notes: event.target.value,
              }))
            }
            rows={2}
            className={inputClass}
          />
        </Field>

        {error ? <ErrorText>{error}</ErrorText> : null}

        <div className="flex justify-end gap-2 border-t border-[#eadfca] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            disabled={Boolean(loading || invalid)}
            className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white disabled:opacity-45"
          >
            {loading
              ? "Đang lưu..."
              : type === "stock_in"
                ? "Lưu phiếu nhập"
                : "Lưu phiếu bán"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
