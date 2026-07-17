import { useMemo, useState } from "react";
import {
  Boxes,
  CircleDollarSign,
  Factory,
  PackagePlus,
  Plus,
  Search,
  ShoppingCart,
  WalletCards,
} from "lucide-react";

import { FormDateInput } from "@/components/shared";
import { residenceMediumStyle } from "@/components/shared/styleMedium";
import { StoreDocumentHistory } from "@/components/store-ledger/StoreDocumentHistory";
import { SummaryCard, inputClass } from "@/components/store-ledger/StoreLedgerShared";
import { formatMoney } from "@/components/store-ledger/storeLedgerUtils";

type PurchaseSourceFilter = "all" | "purchase" | "internal" | "other";

function focusSection(id: string) {
  window.requestAnimationFrame(() => {
    const element = document.getElementById(id);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.focus({ preventScroll: true });
  });
}

export function StorePurchaseTab({
  documents,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  openPurchaseStockModal,
  openOperationExpenseModal,
  onPreview,
}: {
  documents: any[];
  loading?: boolean;
  error?: any;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  fromDate: string;
  setFromDate: (value: string) => void;
  toDate: string;
  setToDate: (value: string) => void;
  openPurchaseStockModal: () => void;
  openOperationExpenseModal: () => void;
  onPreview: (document: any) => void;
}) {
  const [sourceFilter, setSourceFilter] = useState<PurchaseSourceFilter>("all");

  const summary = useMemo(() => {
    let purchaseCount = 0;
    let internalCount = 0;
    let otherCount = 0;
    let totalQuantity = 0;
    let totalAmount = 0;
    const productIds = new Set<number>();

    documents.forEach((document) => {
      const source = String(document.stockInSource || "purchase");
      if (source === "purchase") purchaseCount += 1;
      else if (["production", "self_supply"].includes(source)) internalCount += 1;
      else otherCount += 1;

      totalQuantity += Number(document.totalQuantity || 0);
      totalAmount += Number(document.totalAmount || 0);
      (document.lines || []).forEach((line: any) => {
        const id = Number(line.productId || 0);
        if (id) productIds.add(id);
      });
    });

    return {
      receiptCount: documents.length,
      purchaseCount,
      internalCount,
      otherCount,
      totalQuantity,
      totalAmount,
      productCount: productIds.size,
    };
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const source = String(document.stockInSource || "purchase");
      if (sourceFilter === "purchase") return source === "purchase";
      if (sourceFilter === "internal") return ["production", "self_supply"].includes(source);
      if (sourceFilter === "other") return source === "other";
      return true;
    });
  }, [documents, sourceFilter]);

  return (
    <div className="space-y-4">
      <section className="grid gap-3 md:grid-cols-4">
        <SummaryCard
          icon={<PackagePlus className="h-5 w-5" />}
          label="Tổng phiếu nhập"
          value={String(summary.receiptCount)}
          note={`${formatMoney(summary.productCount)} mặt hàng`}
          tone="amber"
          onClick={() => focusSection("store-purchase-history")}
        />
        <SummaryCard
          icon={<ShoppingCart className="h-5 w-5" />}
          label="Phiếu mua hàng"
          value={String(summary.purchaseCount)}
          note="Có ghi nhận khoản chi"
          tone="rose"
          onClick={() => focusSection("store-purchase-source-overview")}
        />
        <SummaryCard
          icon={<Factory className="h-5 w-5" />}
          label="Nhập nội bộ"
          value={String(summary.internalCount)}
          note="Gia công / tự cung cấp"
          tone="slate"
          onClick={() => focusSection("store-purchase-source-overview")}
        />
        <SummaryCard
          icon={<CircleDollarSign className="h-5 w-5" />}
          label="Giá trị nhập"
          value={`${formatMoney(summary.totalAmount)} đ`}
          note={`${formatMoney(summary.totalQuantity)} đơn vị`}
          tone="emerald"
          onClick={() => focusSection("store-purchase-value-overview")}
        />
      </section>

      <section className="overflow-hidden rounded-[1.45rem] border border-[#eadfca] bg-white/95 shadow-sm">
        <div className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_150px_150px_auto] lg:items-center">
          <label className="relative block min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className={`${inputClass} pl-9`}
              placeholder="Tìm mã phiếu, nhà cung cấp hoặc mặt hàng..."
            />
          </label>
          <FormDateInput value={fromDate} onChange={(event: any) => setFromDate(event.target.value)} />
          <FormDateInput value={toDate} onChange={(event: any) => setToDate(event.target.value)} />
          <button
            type="button"
            onClick={openOperationExpenseModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-100 bg-white px-3.5 py-2.5 text-sm font-black text-rose-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-50"
          >
            <WalletCards className="h-4 w-4" />
            Chi vận hành
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-[#efe5d3] bg-[#fffdf8] px-4 py-3">
          <span className="mr-1 text-xs font-bold text-slate-500">Nguồn nhập</span>
          {[
            { value: "all", label: "Tất cả" },
            { value: "purchase", label: "Mua hàng" },
            { value: "internal", label: "Gia công / tự cấp" },
            { value: "other", label: "Nguồn khác" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setSourceFilter(item.value as PurchaseSourceFilter)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                sourceFilter === item.value
                  ? "bg-slate-950 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">Không thể tải lịch sử phiếu nhập: {error?.message || "Lỗi không xác định"}</div> : null}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_290px]">
        <div id="store-purchase-history" tabIndex={-1} className="min-w-0 scroll-mt-24 outline-none">
          <StoreDocumentHistory
            type="stock_in"
            documents={filteredDocuments}
            loading={loading}
            onPreview={onPreview}
          />
        </div>

        <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
          <section
            id="store-purchase-source-overview"
            tabIndex={-1}
            className="scroll-mt-24 rounded-[1.35rem] border border-[#eadfca] bg-white/95 p-4 shadow-sm outline-none focus:ring-4 focus:ring-amber-100"
          >
            <h3 className="text-sm font-black text-slate-950">Cơ cấu nguồn nhập</h3>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
              Phân biệt nguồn mua hàng và nguồn nội bộ để theo dõi đúng tồn kho và dòng tiền.
            </p>
            <div className="mt-4 space-y-2.5">
              <SourceLine label="Mua hàng" value={summary.purchaseCount} total={summary.receiptCount} tone="rose" />
              <SourceLine label="Gia công / tự cấp" value={summary.internalCount} total={summary.receiptCount} tone="amber" />
              <SourceLine label="Nguồn khác" value={summary.otherCount} total={summary.receiptCount} tone="slate" />
            </div>
          </section>

          <section
            id="store-purchase-value-overview"
            tabIndex={-1}
            className="scroll-mt-24 rounded-[1.35rem] border border-amber-200 bg-[linear-gradient(145deg,#fffaf0_0%,#ffffff_100%)] p-4 shadow-sm outline-none focus:ring-4 focus:ring-amber-100"
          >
            <h3 className="text-sm font-black text-slate-950">Giá trị nhập trong kỳ</h3>
            <div className="mt-4 space-y-3">
              <MetricLine label="Tổng giá trị nhập" value={`${formatMoney(summary.totalAmount)} đ`} strong />
              <MetricLine label="Tổng số lượng" value={formatMoney(summary.totalQuantity)} />
              <MetricLine label="Mặt hàng đã nhập" value={formatMoney(summary.productCount)} />
            </div>
            <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2 text-xs font-semibold leading-5 text-amber-900">
              Chỉ phiếu có nguồn <b>Mua hàng</b> mới tự động tạo khoản chi. Các nguồn còn lại chỉ cập nhật tồn và giá vốn.
            </div>
          </section>

          <button
            type="button"
            onClick={openPurchaseStockModal}
            className={`${residenceMediumStyle.buttonCardPrimary} w-full justify-center`}
          >
            <Plus className="h-4 w-4" />
            Tạo phiếu nhập
          </button>
        </aside>
      </section>
    </div>
  );
}

function SourceLine({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: "rose" | "amber" | "slate";
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  const barClass =
    tone === "rose" ? "bg-rose-400" : tone === "amber" ? "bg-amber-400" : "bg-slate-400";
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-600">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${Math.max(value ? 8 : 0, percent)}%` }} />
      </div>
    </div>
  );
}

function MetricLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <span className={strong ? "text-base font-black text-slate-950" : "text-sm font-black text-slate-800"}>{value}</span>
    </div>
  );
}
