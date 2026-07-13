"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CalendarDays, CheckCircle2, CircleDollarSign, Plus, Search, Store, Trash2, WalletCards, XCircle } from "lucide-react";

import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { FormDateInput } from "@/components/shared";
import { residenceMediumStyle } from "@/components/shared/styleMedium";
import { trpc } from "@/lib/trpc";

const ledgerTypes = [
      { value: "store", label: "Cửa hàng" },
      { value: "fund", label: "Quỹ riêng" },
      { value: "other", label: "Khác" },
] as const;

const transactionCategories = [
      { value: "sales", label: "Bán hàng" },
      { value: "donation", label: "Ủng hộ" },
      { value: "purchase", label: "Mua hàng" },
      { value: "operation", label: "Vận hành" },
      { value: "other", label: "Khác" },
];

function getTodayYmd() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getMonthStartYmd() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function formatMoney(value: number | string | null | undefined) {
      const amount = Number(value || 0);
      return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(amount);
}

function parseCurrencyInput(value: string) {
      const digits = value.replace(/[^0-9]/g, "");
      return digits ? Number(digits) : 0;
}

function formatCurrencyInput(value: string | number) {
      const amount = typeof value === "number" ? value : parseCurrencyInput(value);
      return amount ? new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(amount) : "";
}

function typeLabel(value?: string | null) {
      return ledgerTypes.find((item) => item.value === value)?.label || "Sổ riêng";
}

function categoryLabel(value?: string | null) {
      return transactionCategories.find((item) => item.value === value)?.label || "Khác";
}

function directionLabel(value?: string | null) {
      return value === "in" ? "Thu" : "Chi";
}

function directionClass(value?: string | null) {
      return value === "in"
            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
            : "border-rose-100 bg-rose-50 text-rose-700";
}

type LedgerFormState = {
      ledgerCode: string;
      ledgerName: string;
      ledgerType: "store" | "fund" | "other";
      openingBalance: string;
      description: string;
};

type TransactionFormState = {
      direction: "in" | "out";
      transactionDate: string;
      amount: string;
      category: string;
      title: string;
      partnerName: string;
      paymentMethod: string;
      description: string;
};

const emptyLedgerForm: LedgerFormState = {
      ledgerCode: "CUA_HANG",
      ledgerName: "Cửa hàng lưu xá",
      ledgerType: "store",
      openingBalance: "",
      description: "",
};

const emptyTransactionForm: TransactionFormState = {
      direction: "in",
      transactionDate: getTodayYmd(),
      amount: "",
      category: "sales",
      title: "",
      partnerName: "",
      paymentMethod: "cash",
      description: "",
};

export default function StoreLedger() {
      const storeLedgerApi = (trpc as any).storeLedger;
      const [selectedLedgerId, setSelectedLedgerId] = useState<number | null>(null);
      const [directionFilter, setDirectionFilter] = useState<"all" | "in" | "out">("all");
      const [typeFilter, setTypeFilter] = useState<"all" | "store" | "fund" | "other">("all");
      const [searchTerm, setSearchTerm] = useState("");
      const [fromDate, setFromDate] = useState(getMonthStartYmd());
      const [toDate, setToDate] = useState(getTodayYmd());
      const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
      const [transactionModalOpen, setTransactionModalOpen] = useState(false);
      const [formError, setFormError] = useState("");
      const [ledgerForm, setLedgerForm] = useState<LedgerFormState>(emptyLedgerForm);
      const [transactionForm, setTransactionForm] = useState<TransactionFormState>(emptyTransactionForm);

      const ledgersQuery = storeLedgerApi?.listLedgers?.useQuery?.({ isActive: true }) ?? { data: [], isLoading: false, error: null, refetch: () => undefined };
      const ledgers = ledgersQuery.data || [];
      const activeLedgerId = selectedLedgerId || ledgers[0]?.id || null;

      const summaryQuery = storeLedgerApi?.getSummary?.useQuery?.(
            { ledgerId: activeLedgerId || undefined, fromDate, toDate },
            { enabled: !!activeLedgerId },
      ) ?? { data: { totalIn: 0, totalOut: 0, balance: 0, transactionCount: 0 }, refetch: () => undefined };

      const transactionsQuery = storeLedgerApi?.listTransactions?.useQuery?.(
            {
                  ledgerId: activeLedgerId || undefined,
                  direction: directionFilter,
                  fromDate,
                  toDate,
                  search: searchTerm,
                  limit: 200,
            },
            { enabled: !!activeLedgerId },
      ) ?? { data: [], isLoading: false, error: null, refetch: () => undefined };

      const createLedgerMutation = storeLedgerApi?.createLedger?.useMutation?.({
            onSuccess: async (createdLedger: any) => {
                  setLedgerModalOpen(false);
                  setLedgerForm(emptyLedgerForm);
                  setFormError("");
                  if (createdLedger?.id) setSelectedLedgerId(Number(createdLedger.id));
                  await ledgersQuery.refetch?.();
            },
            onError: (error: any) => setFormError(error?.message || "Không thể tạo sổ/quỹ."),
      });

      const createTransactionMutation = storeLedgerApi?.createTransaction?.useMutation?.({
            onSuccess: async () => {
                  setTransactionModalOpen(false);
                  setTransactionForm(emptyTransactionForm);
                  setFormError("");
                  await Promise.all([summaryQuery.refetch?.(), transactionsQuery.refetch?.()]);
            },
            onError: (error: any) => setFormError(error?.message || "Không thể lưu khoản thu/chi."),
      });

      const cancelTransactionMutation = storeLedgerApi?.cancelTransaction?.useMutation?.({
            onSuccess: async () => {
                  await Promise.all([summaryQuery.refetch?.(), transactionsQuery.refetch?.()]);
            },
      });

      const deleteTransactionMutation = storeLedgerApi?.deleteTransaction?.useMutation?.({
            onSuccess: async () => {
                  await Promise.all([summaryQuery.refetch?.(), transactionsQuery.refetch?.()]);
            },
      });

      const filteredLedgers = useMemo(() => {
            if (typeFilter === "all") return ledgers;
            return ledgers.filter((ledger: any) => ledger.ledgerType === typeFilter);
      }, [ledgers, typeFilter]);

      const summary = summaryQuery.data || { totalIn: 0, totalOut: 0, balance: 0, transactionCount: 0 };
      const transactions = transactionsQuery.data || [];
      const activeLedger = ledgers.find((item: any) => Number(item.id) === Number(activeLedgerId));

      function handleCreateLedger() {
            setFormError("");
            const openingBalance = parseCurrencyInput(ledgerForm.openingBalance);
            createLedgerMutation?.mutate?.({
                  ledgerCode: ledgerForm.ledgerCode,
                  ledgerName: ledgerForm.ledgerName,
                  ledgerType: ledgerForm.ledgerType,
                  openingBalance,
                  description: ledgerForm.description || null,
            });
      }

      function openTransactionModal(direction: "in" | "out") {
            setFormError("");
            setTransactionForm({
                  ...emptyTransactionForm,
                  direction,
                  category: direction === "in" ? "sales" : "purchase",
            });
            setTransactionModalOpen(true);
      }

      function handleCreateTransaction() {
            if (!activeLedgerId) {
                  setFormError("Vui lòng tạo hoặc chọn sổ/quỹ trước.");
                  return;
            }
            const amount = parseCurrencyInput(transactionForm.amount);
            createTransactionMutation?.mutate?.({
                  ledgerId: activeLedgerId,
                  direction: transactionForm.direction,
                  transactionDate: transactionForm.transactionDate,
                  amount,
                  category: transactionForm.category,
                  title: transactionForm.title,
                  partnerName: transactionForm.partnerName || null,
                  paymentMethod: transactionForm.paymentMethod,
                  description: transactionForm.description || null,
            });
      }

      return (
            <ResidenceCareLayout>
                  <div className={residenceMediumStyle.page}>
                        <div className={residenceMediumStyle.pageAura} />
                        <div className={`${residenceMediumStyle.standardPageContent} space-y-5`}>
                              <section className="relative overflow-hidden rounded-[2rem] border border-[#eadfca] bg-[radial-gradient(circle_at_top_left,#fff7dc_0%,#fffdf7_38%,#ffffff_100%)] px-5 py-5 shadow-xl shadow-amber-950/5 sm:px-7">
                                    <div className="absolute right-8 top-5 h-24 w-24 rounded-full bg-amber-200/30 blur-3xl" />
                                    <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                          <div className="text-center lg:text-left">
                                                <p className="text-xs font-bold uppercase tracking-[0.26em] text-amber-700">Sổ riêng</p>
                                                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Cửa hàng / Quỹ riêng</h1>
                                                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                                                      Ghi nhận thu chi riêng cho cửa hàng hoặc quỹ nhỏ, tách khỏi tài chính học viên.
                                                </p>
                                          </div>
                                          <div className="flex flex-wrap justify-center gap-2 lg:justify-end">
                                                <button
                                                      type="button"
                                                      onClick={() => {
                                                            setFormError("");
                                                            setLedgerModalOpen(true);
                                                      }}
                                                      className={residenceMediumStyle.buttonCard}
                                                >
                                                      <Plus className="h-4 w-4" />
                                                      Tạo sổ/quỹ
                                                </button>
                                                <button
                                                      type="button"
                                                      onClick={() => openTransactionModal("in")}
                                                      disabled={!activeLedgerId}
                                                      className={residenceMediumStyle.buttonCardPrimary}
                                                >
                                                      <Plus className="h-4 w-4" />
                                                      Ghi thu
                                                </button>
                                                <button
                                                      type="button"
                                                      onClick={() => openTransactionModal("out")}
                                                      disabled={!activeLedgerId}
                                                      className="inline-flex items-center gap-2 rounded-2xl border border-rose-100 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 shadow-sm hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                      <Plus className="h-4 w-4" />
                                                      Ghi chi
                                                </button>
                                          </div>
                                    </div>
                              </section>

                              <section className="grid gap-3 md:grid-cols-4">
                                    <SummaryCard icon={<CircleDollarSign className="h-5 w-5" />} label="Tổng thu" value={`${formatMoney(summary.totalIn)} đ`} tone="emerald" />
                                    <SummaryCard icon={<WalletCards className="h-5 w-5" />} label="Tổng chi" value={`${formatMoney(summary.totalOut)} đ`} tone="rose" />
                                    <SummaryCard icon={<Store className="h-5 w-5" />} label="Số dư" value={`${formatMoney(summary.balance)} đ`} tone="amber" />
                                    <SummaryCard icon={<CalendarDays className="h-5 w-5" />} label="Phát sinh" value={String(summary.transactionCount || 0)} tone="slate" />
                              </section>

                              <section className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
                                    <aside className="rounded-[1.75rem] border border-[#eadfca] bg-white/90 p-4 shadow-lg shadow-amber-950/5">
                                          <div className="flex items-center justify-between gap-3">
                                                <div>
                                                      <h2 className="text-sm font-black text-slate-900">Danh sách sổ</h2>
                                                      <p className="text-xs font-semibold text-slate-500">Cửa hàng, quỹ nhỏ, quỹ riêng.</p>
                                                </div>
                                          </div>
                                          <div className="mt-4 flex flex-wrap gap-2">
                                                {[{ value: "all", label: "Tất cả" }, ...ledgerTypes].map((item) => (
                                                      <button
                                                            key={item.value}
                                                            type="button"
                                                            onClick={() => setTypeFilter(item.value as any)}
                                                            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${typeFilter === item.value ? "bg-slate-950 text-white shadow-md" : "border border-amber-100 bg-amber-50/70 text-slate-700 hover:bg-amber-100"}`}
                                                      >
                                                            {item.label}
                                                      </button>
                                                ))}
                                          </div>
                                          <div className="mt-4 space-y-2">
                                                {ledgersQuery.isLoading ? (
                                                      <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3 text-sm font-semibold text-slate-600">Đang tải sổ...</div>
                                                ) : filteredLedgers.length ? (
                                                      filteredLedgers.map((ledger: any) => (
                                                            <button
                                                                  key={ledger.id}
                                                                  type="button"
                                                                  onClick={() => setSelectedLedgerId(Number(ledger.id))}
                                                                  className={`w-full rounded-2xl border px-3 py-3 text-left transition ${Number(activeLedgerId) === Number(ledger.id) ? "border-amber-300 bg-amber-50 shadow-md shadow-amber-950/5" : "border-slate-100 bg-white hover:border-amber-200 hover:bg-amber-50/60"}`}
                                                            >
                                                                  <div className="flex items-center justify-between gap-2">
                                                                        <p className="truncate text-sm font-black text-slate-900">{ledger.ledgerName}</p>
                                                                        <span className="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-100">{typeLabel(ledger.ledgerType)}</span>
                                                                  </div>
                                                                  <p className="mt-1 text-xs font-semibold text-slate-500">{ledger.ledgerCode}</p>
                                                            </button>
                                                      ))
                                                ) : (
                                                      <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-4 text-sm font-semibold text-slate-600">
                                                            Chưa có sổ/quỹ. Tạo một sổ để bắt đầu ghi thu chi.
                                                      </div>
                                                )}
                                          </div>
                                    </aside>

                                    <main className="min-w-0 space-y-4">
                                          <section className="rounded-[1.75rem] border border-[#eadfca] bg-white/90 p-4 shadow-lg shadow-amber-950/5">
                                                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px_160px]">
                                                      <label className="relative block">
                                                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                            <input
                                                                  value={searchTerm}
                                                                  onChange={(event) => setSearchTerm(event.target.value)}
                                                                  className={residenceMediumStyle.searchInput}
                                                                  placeholder="Tìm nội dung, mã phiếu, người nhận/nộp..."
                                                            />
                                                      </label>
                                                      <FormDateInput value={fromDate} onChange={(event: any) => setFromDate(event.target.value)} />
                                                      <FormDateInput value={toDate} onChange={(event: any) => setToDate(event.target.value)} />
                                                </div>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                      {[{ value: "all", label: "Tất cả" }, { value: "in", label: "Khoản thu" }, { value: "out", label: "Khoản chi" }].map((item) => (
                                                            <button
                                                                  key={item.value}
                                                                  type="button"
                                                                  onClick={() => setDirectionFilter(item.value as any)}
                                                                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${directionFilter === item.value ? "bg-slate-950 text-white shadow-md" : "border border-amber-100 bg-amber-50/70 text-slate-700 hover:bg-amber-100"}`}
                                                            >
                                                                  {item.label}
                                                            </button>
                                                      ))}
                                                </div>
                                          </section>

                                          <section className={residenceMediumStyle.section}>
                                                <div className={residenceMediumStyle.sectionHeader}>
                                                      <div>
                                                            <h2 className="text-base font-black text-slate-950">Sổ phát sinh</h2>
                                                            <p className="text-sm font-semibold text-slate-500">{activeLedger ? activeLedger.ledgerName : "Chưa chọn sổ/quỹ"}</p>
                                                      </div>
                                                </div>
                                                <div className={`${residenceMediumStyle.sectionBody} space-y-2`}>
                                                      {transactionsQuery.isLoading ? (
                                                            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm font-semibold text-slate-600">Đang tải phát sinh...</div>
                                                      ) : transactions.length ? (
                                                            transactions.map((item: any) => (
                                                                  <article key={item.id} className="group rounded-2xl border border-[#eadfca] bg-[linear-gradient(135deg,#ffffff_0%,#fffaf0_100%)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                                              <div className="min-w-0">
                                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                                          <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${directionClass(item.direction)}`}>{directionLabel(item.direction)}</span>
                                                                                          <span className="rounded-full border border-amber-100 bg-white px-2.5 py-1 text-xs font-bold text-amber-700">{categoryLabel(item.category)}</span>
                                                                                          <span className="text-xs font-bold text-slate-400">{item.transactionDate}</span>
                                                                                    </div>
                                                                                    <h3 className="mt-2 truncate text-base font-black text-slate-950">{item.title}</h3>
                                                                                    <p className="mt-1 text-sm font-semibold text-slate-500">{item.partnerName || item.description || item.transactionCode}</p>
                                                                              </div>
                                                                              <div className="flex shrink-0 items-center justify-between gap-3 lg:justify-end">
                                                                                    <p className={`text-lg font-black ${item.direction === "in" ? "text-emerald-700" : "text-rose-700"}`}>
                                                                                          {item.direction === "in" ? "+" : "-"}{formatMoney(item.amount)} đ
                                                                                    </p>
                                                                                    <div className="flex items-center gap-1">
                                                                                          {item.status !== "cancelled" ? (
                                                                                                <button
                                                                                                      type="button"
                                                                                                      onClick={() => cancelTransactionMutation?.mutate?.({ id: Number(item.id) })}
                                                                                                      className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                                                                                                      title="Hủy phát sinh"
                                                                                                >
                                                                                                      <XCircle className="h-4 w-4" />
                                                                                                </button>
                                                                                          ) : (
                                                                                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">Đã hủy</span>
                                                                                          )}
                                                                                          <button
                                                                                                type="button"
                                                                                                onClick={() => deleteTransactionMutation?.mutate?.({ id: Number(item.id) })}
                                                                                                className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                                                                                                title="Xóa phát sinh"
                                                                                          >
                                                                                                <Trash2 className="h-4 w-4" />
                                                                                          </button>
                                                                                    </div>
                                                                              </div>
                                                                        </div>
                                                                  </article>
                                                            ))
                                                      ) : (
                                                            <div className="rounded-[1.5rem] border border-dashed border-amber-200 bg-amber-50/60 p-6 text-center">
                                                                  <CheckCircle2 className="mx-auto h-8 w-8 text-amber-500" />
                                                                  <p className="mt-2 text-sm font-black text-slate-800">Chưa có phát sinh trong khoảng thời gian này</p>
                                                                  <p className="mt-1 text-xs font-semibold text-slate-500">Bấm Ghi thu hoặc Ghi chi để bắt đầu.</p>
                                                            </div>
                                                      )}
                                                </div>
                                          </section>
                                    </main>
                              </section>
                        </div>
                  </div>

                  {ledgerModalOpen ? (
                        <Modal title="Tạo sổ/quỹ riêng" onClose={() => setLedgerModalOpen(false)}>
                              <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Mã sổ">
                                          <input value={ledgerForm.ledgerCode} onChange={(event) => setLedgerForm((prev) => ({ ...prev, ledgerCode: event.target.value }))} className={inputClass} />
                                    </Field>
                                    <Field label="Tên sổ/quỹ">
                                          <input value={ledgerForm.ledgerName} onChange={(event) => setLedgerForm((prev) => ({ ...prev, ledgerName: event.target.value }))} className={inputClass} />
                                    </Field>
                                    <Field label="Loại sổ">
                                          <select value={ledgerForm.ledgerType} onChange={(event) => setLedgerForm((prev) => ({ ...prev, ledgerType: event.target.value as any }))} className={inputClass}>
                                                {ledgerTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                                          </select>
                                    </Field>
                                    <Field label="Số dư đầu kỳ">
                                          <input inputMode="numeric" value={ledgerForm.openingBalance} onChange={(event) => setLedgerForm((prev) => ({ ...prev, openingBalance: formatCurrencyInput(event.target.value) }))} className={`${inputClass} text-right font-black`} placeholder="0" />
                                    </Field>
                                    <Field label="Ghi chú" className="sm:col-span-2">
                                          <textarea value={ledgerForm.description} onChange={(event) => setLedgerForm((prev) => ({ ...prev, description: event.target.value }))} rows={2} className={inputClass} />
                                    </Field>
                              </div>
                              {formError ? <ErrorText>{formError}</ErrorText> : null}
                              <ModalFooter onClose={() => setLedgerModalOpen(false)} onSave={handleCreateLedger} saveText="Tạo sổ/quỹ" loading={createLedgerMutation?.isPending} />
                        </Modal>
                  ) : null}

                  {transactionModalOpen ? (
                        <Modal title={transactionForm.direction === "in" ? "Ghi khoản thu" : "Ghi khoản chi"} onClose={() => setTransactionModalOpen(false)}>
                              <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Loại phát sinh">
                                          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-amber-100 bg-amber-50/70 p-1">
                                                {([{ value: "in", label: "Thu" }, { value: "out", label: "Chi" }] as const).map((item) => (
                                                      <button key={item.value} type="button" onClick={() => setTransactionForm((prev) => ({ ...prev, direction: item.value, category: item.value === "in" ? "sales" : "purchase" }))} className={`rounded-xl px-3 py-2 text-sm font-black ${transactionForm.direction === item.value ? "bg-slate-950 text-white shadow" : "text-slate-600"}`}>{item.label}</button>
                                                ))}
                                          </div>
                                    </Field>
                                    <Field label="Ngày phát sinh">
                                          <FormDateInput value={transactionForm.transactionDate} onChange={(event: any) => setTransactionForm((prev) => ({ ...prev, transactionDate: event.target.value }))} />
                                    </Field>
                                    <Field label="Số tiền">
                                          <input inputMode="numeric" value={transactionForm.amount} onChange={(event) => setTransactionForm((prev) => ({ ...prev, amount: formatCurrencyInput(event.target.value) }))} className={`${inputClass} text-right text-base font-black`} placeholder="1.000.000" />
                                    </Field>
                                    <Field label="Nhóm khoản">
                                          <select value={transactionForm.category} onChange={(event) => setTransactionForm((prev) => ({ ...prev, category: event.target.value }))} className={inputClass}>
                                                {transactionCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                                          </select>
                                    </Field>
                                    <Field label="Nội dung" className="sm:col-span-2">
                                          <input value={transactionForm.title} onChange={(event) => setTransactionForm((prev) => ({ ...prev, title: event.target.value }))} className={inputClass} placeholder="Ví dụ: Bán nước uống / Mua vật tư cửa hàng" />
                                    </Field>
                                    <Field label="Người nộp/nhận">
                                          <input value={transactionForm.partnerName} onChange={(event) => setTransactionForm((prev) => ({ ...prev, partnerName: event.target.value }))} className={inputClass} />
                                    </Field>
                                    <Field label="Phương thức">
                                          <select value={transactionForm.paymentMethod} onChange={(event) => setTransactionForm((prev) => ({ ...prev, paymentMethod: event.target.value }))} className={inputClass}>
                                                <option value="cash">Tiền mặt</option>
                                                <option value="bank_transfer">Chuyển khoản</option>
                                                <option value="other">Khác</option>
                                          </select>
                                    </Field>
                                    <Field label="Ghi chú" className="sm:col-span-2">
                                          <textarea value={transactionForm.description} onChange={(event) => setTransactionForm((prev) => ({ ...prev, description: event.target.value }))} rows={2} className={inputClass} />
                                    </Field>
                              </div>
                              {formError ? <ErrorText>{formError}</ErrorText> : null}
                              <ModalFooter onClose={() => setTransactionModalOpen(false)} onSave={handleCreateTransaction} saveText="Lưu phát sinh" loading={createTransactionMutation?.isPending} />
                        </Modal>
                  ) : null}
            </ResidenceCareLayout>
      );
}

function SummaryCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: "emerald" | "rose" | "amber" | "slate" }) {
      const toneClass = tone === "emerald" ? "text-emerald-700" : tone === "rose" ? "text-rose-700" : tone === "amber" ? "text-amber-700" : "text-slate-700";
      return (
            <div className="rounded-[1.5rem] border border-[#eadfca] bg-[linear-gradient(135deg,#ffffff_0%,#fff7df_100%)] p-4 shadow-lg shadow-amber-950/5">
                  <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-amber-100 ${toneClass}`}>{icon}</div>
                        <div className="min-w-0">
                              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
                              <p className="mt-1 truncate text-xl font-black text-slate-950">{value}</p>
                        </div>
                  </div>
            </div>
      );
}

const inputClass = "w-full rounded-2xl border border-[#e5d8bd] bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-[#d6a63d] focus:ring-4 focus:ring-amber-100";

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
      return (
            <label className={`block ${className}`}>
                  <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</span>
                  {children}
            </label>
      );
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
      return (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
                  <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[2rem] border border-[#eadfca] bg-[linear-gradient(135deg,#fffdf7_0%,#ffffff_54%,#fff7df_100%)] shadow-2xl shadow-slate-950/20">
                        <div className="flex items-center justify-between border-b border-[#eadfca] px-5 py-4">
                              <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Cửa hàng / Quỹ riêng</p>
                                    <h2 className="text-lg font-black text-slate-950">{title}</h2>
                              </div>
                              <button type="button" onClick={onClose} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-slate-50">Đóng</button>
                        </div>
                        <div className="max-h-[68vh] overflow-y-auto px-5 py-4">{children}</div>
                  </div>
            </div>
      );
}

function ErrorText({ children }: { children: ReactNode }) {
      return <div className="mt-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{children}</div>;
}

function ModalFooter({ onClose, onSave, saveText, loading }: { onClose: () => void; onSave: () => void; saveText: string; loading?: boolean }) {
      return (
            <div className="mt-4 flex justify-end gap-2 border-t border-[#eadfca] pt-4">
                  <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm">Hủy</button>
                  <button type="button" onClick={onSave} disabled={loading} className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-slate-950/20 disabled:opacity-60">{loading ? "Đang lưu..." : saveText}</button>
            </div>
      );
}
