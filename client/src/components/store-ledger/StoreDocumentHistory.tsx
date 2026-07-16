import { Eye, Printer } from "lucide-react";
import { residenceMediumStyle } from "@/components/shared/styleMedium";
import { formatDateText, formatMoney, stockMovementSourceLabel } from "./storeLedgerUtils";

export function StoreDocumentHistory({ type, documents, loading, onPreview }: { type: "stock_in" | "sale"; documents: any[]; loading?: boolean; onPreview: (document: any) => void }) {
  const title = type === "stock_in" ? "Lịch sử phiếu nhập kho" : "Lịch sử phiếu bán hàng";
  return (
    <section className={residenceMediumStyle.section}>
      <div className={residenceMediumStyle.sectionHeader}>
        <div>
          <h2 className="text-base font-black text-slate-950">{title}</h2>
          <p className="text-sm font-semibold text-slate-500">Mỗi phiếu có thể chứa nhiều hàng hóa và có thể xem trước hoặc in lại.</p>
        </div>
      </div>
      <div className={`${residenceMediumStyle.sectionBody} space-y-3`}>
        {loading ? <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm font-semibold text-slate-600">Đang tải phiếu...</div> : documents.length ? documents.map((document) => (
          <article key={document.id} className="rounded-2xl border border-[#eadfca] bg-white/95 p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-100">
                    {type === "stock_in" ? stockMovementSourceLabel(document.stockInSource === "production" ? "production_in" : document.stockInSource === "self_supply" ? "self_supply_in" : document.stockInSource === "other" ? "other_in" : "purchase") : "Bán hàng"}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{formatDateText(document.documentDate)}</span>
                </div>
                <h3 className="mt-2 text-base font-black text-slate-950">{document.documentCode}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">{document.partnerName || (type === "sale" ? "Khách lẻ" : "Chưa nhập nguồn giao")} · {document.lines?.length || 0} mặt hàng</p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="mr-2 text-right">
                  <p className="text-xs font-bold text-slate-500">Số lượng {formatMoney(document.totalQuantity)}</p>
                  <p className="text-base font-black text-slate-950">{formatMoney(document.totalAmount)} đ</p>
                </div>
                <button type="button" onClick={() => onPreview(document)} className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-black text-amber-700 hover:bg-amber-50"><Eye className="h-4 w-4" /> Xem phiếu</button>
                <button type="button" onClick={() => onPreview(document)} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white"><Printer className="h-4 w-4" /> In phiếu</button>
              </div>
            </div>
          </article>
        )) : <div className="rounded-[1.5rem] border border-dashed border-amber-200 bg-amber-50/60 p-5 text-center text-sm font-semibold text-slate-600">Chưa có phiếu trong khoảng thời gian này.</div>}
      </div>
    </section>
  );
}
