import { BadgeDollarSign, Boxes, CalendarDays, Eye, FileText, PackageMinus, Printer, Search, ShoppingBag, TrendingUp, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { FormDateInput } from "@/components/shared";
import { residenceMediumStyle } from "@/components/shared/styleMedium";
import { inputClass } from "@/components/store-ledger/StoreLedgerShared";
import { formatDateText, formatMoney } from "@/components/store-ledger/storeLedgerUtils";

type StoreSalesTabProps = {
  documents: any[];
  loading?: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  fromDate: string;
  setFromDate: (value: string) => void;
  toDate: string;
  setToDate: (value: string) => void;
  openSaleStockModal: () => void;
  onPreview: (document: any) => void;
};

export function StoreSalesTab({
  documents,
  loading,
  searchTerm,
  setSearchTerm,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  openSaleStockModal,
  onPreview,
}: StoreSalesTabProps) {
  const [pageSize, setPageSize] = useState<7 | 10>(7);
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [searchTerm, fromDate, toDate, pageSize]);

  const summary = useMemo(() => {
    let totalQuantity = 0;
    let totalRevenue = 0;
    const productIds = new Set<number>();
    const productSales = new Map<number, { id: number; name: string; quantity: number; amount: number }>();

    documents.forEach((document) => {
      totalQuantity += Number(document.totalQuantity || 0);
      totalRevenue += Number(document.totalAmount || 0);
      (document.lines || []).forEach((line: any) => {
        const productId = Number(line.productId || 0);
        if (productId) productIds.add(productId);
        const current = productSales.get(productId) || {
          id: productId,
          name: line.productName || line.name || "Hàng hóa",
          quantity: 0,
          amount: 0,
        };
        current.quantity += Number(line.quantity || 0);
        current.amount += Number(line.lineAmount || line.totalAmount || Number(line.quantity || 0) * Number(line.unitPrice || line.unitValue || 0));
        productSales.set(productId, current);
      });
    });

    const topProducts = Array.from(productSales.values())
      .sort((left, right) => right.amount - left.amount)
      .slice(0, 5);

    return {
      receiptCount: documents.length,
      totalQuantity,
      totalRevenue,
      productCount: productIds.size,
      topProducts,
      averageOrderValue: documents.length ? totalRevenue / documents.length : 0,
    };
  }, [documents]);

  const pageCount = Math.max(1, Math.ceil(documents.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleDocuments = documents.slice((safePage - 1) * pageSize, safePage * pageSize);
  const startRow = documents.length ? (safePage - 1) * pageSize + 1 : 0;
  const endRow = Math.min(safePage * pageSize, documents.length);

  function focusSection(id: string) {
    window.requestAnimationFrame(() => {
      const target = document.getElementById(id);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      target?.classList.add("ring-4", "ring-amber-100");
      window.setTimeout(() => target?.classList.remove("ring-4", "ring-amber-100"), 1200);
    });
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button type="button" onClick={() => focusSection("store-sales-history")} className="rounded-[1.25rem] border border-[#eadfca] bg-white/95 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-100"><PackageMinus className="h-5 w-5" /></span><div><p className="text-xs font-bold text-slate-500">Phiếu bán</p><p className="mt-0.5 text-xl font-black text-slate-950">{formatMoney(summary.receiptCount)}</p></div></div>
        </button>
        <button type="button" onClick={() => focusSection("store-sales-history")} className="rounded-[1.25rem] border border-[#eadfca] bg-white/95 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"><Boxes className="h-5 w-5" /></span><div><p className="text-xs font-bold text-slate-500">Số lượng bán</p><p className="mt-0.5 text-xl font-black text-slate-950">{formatMoney(summary.totalQuantity)}</p></div></div>
        </button>
        <button type="button" onClick={() => focusSection("store-sales-top-products")} className="rounded-[1.25rem] border border-[#eadfca] bg-white/95 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-700 ring-1 ring-slate-100"><ShoppingBag className="h-5 w-5" /></span><div><p className="text-xs font-bold text-slate-500">Mặt hàng đã bán</p><p className="mt-0.5 text-xl font-black text-slate-950">{formatMoney(summary.productCount)}</p></div></div>
        </button>
        <button type="button" onClick={() => focusSection("store-sales-value")} className="rounded-[1.25rem] border border-[#eadfca] bg-white/95 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700 ring-1 ring-rose-100"><BadgeDollarSign className="h-5 w-5" /></span><div className="min-w-0"><p className="text-xs font-bold text-slate-500">Doanh thu bán</p><p className="mt-0.5 truncate text-xl font-black text-slate-950">{formatMoney(summary.totalRevenue)} đ</p></div></div>
        </button>
      </section>

      <section className={residenceMediumStyle.section}>
        <div className={`${residenceMediumStyle.sectionBody} space-y-3`}>
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_170px_170px_auto] xl:items-end">
            <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-500">Tìm phiếu bán</span><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className={`${inputClass} pl-9`} placeholder="Số phiếu, khách hàng..." /></div></label>
            <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-500">Từ ngày</span><FormDateInput value={fromDate} onChange={(event: any) => setFromDate(event.target.value)} /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-500">Đến ngày</span><FormDateInput value={toDate} onChange={(event: any) => setToDate(event.target.value)} /></label>
            <button type="button" onClick={openSaleStockModal} className={residenceMediumStyle.buttonCardPrimary}>Tạo phiếu bán</button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_290px]">
        <section id="store-sales-history" className="min-w-0 overflow-hidden rounded-[1.5rem] border border-[#eadfca] bg-white/95 shadow-sm transition">
          <div className="flex flex-col gap-3 border-b border-[#efe5d3] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-lg font-black text-slate-950">Lịch sử phiếu bán</h2><p className="mt-0.5 text-sm font-medium text-slate-500">Khách hàng, mặt hàng, số lượng và tổng tiền từng phiếu.</p></div>
            <div className="flex items-center gap-2"><select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value) as 7 | 10)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600"><option value={7}>7 phiếu</option><option value={10}>10 phiếu</option></select><span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700">{documents.length} phiếu</span></div>
          </div>
          <div className="space-y-2.5 p-3">
            {loading ? <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm font-semibold text-slate-600">Đang tải phiếu bán...</div> : visibleDocuments.length ? visibleDocuments.map((sale) => (
              <article key={sale.id} className="rounded-[1.2rem] border border-slate-100 bg-white px-4 py-3 transition hover:border-amber-200 hover:shadow-sm">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-center">
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-700"><FileText className="h-3.5 w-3.5" />Phiếu bán</span><span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400"><CalendarDays className="h-3.5 w-3.5" />{formatDateText(sale.documentDate)}</span></div><button type="button" onClick={() => onPreview(sale)} className="mt-2 block max-w-full truncate text-left text-base font-black text-slate-950 hover:text-amber-700">{sale.documentCode}</button><p className="mt-1 flex items-center gap-1.5 truncate text-sm font-medium text-slate-500"><UserRound className="h-4 w-4 shrink-0" />{sale.partnerName || "Khách lẻ"} · {sale.lines?.length || 0} mặt hàng</p></div>
                  <div className="grid grid-cols-2 gap-2"><div className="rounded-xl bg-slate-50 px-3 py-2 text-right"><p className="text-[11px] font-bold text-slate-400">Số lượng</p><p className="mt-0.5 text-sm font-black text-slate-800">{formatMoney(sale.totalQuantity)}</p></div><div className="rounded-xl bg-amber-50 px-3 py-2 text-right"><p className="text-[11px] font-bold text-amber-500">Tổng tiền</p><p className="mt-0.5 text-sm font-black text-amber-800">{formatMoney(sale.totalAmount)} đ</p></div></div>
                  <div className="flex flex-wrap gap-2 lg:justify-end"><button type="button" onClick={() => onPreview(sale)} className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-black text-amber-700"><Eye className="h-4 w-4" />Xem</button><button type="button" onClick={() => onPreview(sale)} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white"><Printer className="h-4 w-4" />In phiếu</button></div>
                </div>
              </article>
            )) : <div className="rounded-[1.4rem] border border-dashed border-amber-200 bg-amber-50/50 px-5 py-8 text-center"><FileText className="mx-auto h-7 w-7 text-amber-400" /><p className="mt-2 text-sm font-black text-slate-800">Chưa có phiếu bán trong khoảng thời gian này</p></div>}
          </div>
          {documents.length ? <div className="flex flex-col gap-3 border-t border-[#efe5d3] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs font-medium text-slate-500">Hiển thị {startRow}–{endRow} trong {documents.length} phiếu</p><div className="flex items-center gap-2"><button type="button" disabled={safePage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-40">Trước</button><span className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white">{safePage}/{pageCount}</span><button type="button" disabled={safePage >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-40">Sau</button></div></div> : null}
        </section>

        <aside className="space-y-3 xl:sticky xl:top-4 xl:self-start">
          <section id="store-sales-value" className="rounded-[1.25rem] border border-[#eadfca] bg-white/95 p-4 shadow-sm transition"><div className="flex items-center gap-2"><BadgeDollarSign className="h-4 w-4 text-amber-600" /><h3 className="text-sm font-black text-slate-900">Giá trị bán hàng</h3></div><div className="mt-3 space-y-2 text-sm"><div className="flex justify-between gap-3"><span className="font-medium text-slate-500">Tổng doanh thu</span><span className="font-black text-slate-950">{formatMoney(summary.totalRevenue)} đ</span></div><div className="flex justify-between gap-3"><span className="font-medium text-slate-500">Trung bình / phiếu</span><span className="font-black text-slate-950">{formatMoney(summary.averageOrderValue)} đ</span></div><div className="flex justify-between gap-3"><span className="font-medium text-slate-500">Tổng số lượng</span><span className="font-black text-slate-950">{formatMoney(summary.totalQuantity)}</span></div></div></section>
          <section id="store-sales-top-products" className="rounded-[1.25rem] border border-[#eadfca] bg-white/95 p-4 shadow-sm transition"><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-600" /><h3 className="text-sm font-black text-slate-900">Mặt hàng bán nổi bật</h3></div><div className="mt-3 space-y-2">{summary.topProducts.length ? summary.topProducts.map((item, index) => <div key={`${item.id}-${index}`} className="rounded-xl bg-slate-50 px-3 py-2"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-black text-slate-900">{item.name}</p><p className="text-xs font-medium text-slate-500">Đã bán {formatMoney(item.quantity)}</p></div><span className="shrink-0 text-xs font-black text-amber-700">{formatMoney(item.amount)} đ</span></div></div>) : <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-medium text-slate-500">Chưa có dữ liệu bán hàng.</p>}</div></section>
        </aside>
      </div>
    </div>
  );
}
