import { Eye, FileText, Printer } from "lucide-react";

import { residenceMediumStyle } from "@/components/shared/styleMedium";
import { formatDateText, formatMoney, stockMovementSourceLabel } from "./storeLedgerUtils";

export function StoreDocumentHistory({
  type,
  documents,
  loading,
  onPreview,
}: {
  type: "stock_in" | "sale";
  documents: any[];
  loading?: boolean;
  onPreview: (document: any) => void;
}) {
  const title = type === "stock_in" ? "Lịch sử phiếu nhập" : "Lịch sử phiếu bán";
  const subtitle =
    type === "stock_in"
      ? "Theo dõi nguồn nhập, nhà cung cấp, số mặt hàng và giá trị từng phiếu."
      : "Theo dõi khách hàng, số mặt hàng và giá trị từng phiếu bán.";

  return (
    <section className={residenceMediumStyle.section}>
      <div className={residenceMediumStyle.sectionHeader}>
        <div>
          <h2 className="text-base font-black text-slate-950">{title}</h2>
          <p className="mt-0.5 text-sm font-medium text-slate-500">{subtitle}</p>
        </div>
        <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700">
          {documents.length} phiếu
        </span>
      </div>

      <div className={`${residenceMediumStyle.sectionBody} space-y-2.5`}>
        {loading ? (
          <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm font-semibold text-slate-600">
            Đang tải phiếu...
          </div>
        ) : documents.length ? (
          documents.map((document) => {
            const sourceLabel =
              type === "stock_in"
                ? stockMovementSourceLabel(
                    document.stockInSource === "production"
                      ? "production_in"
                      : document.stockInSource === "self_supply"
                        ? "self_supply_in"
                        : document.stockInSource === "other"
                          ? "other_in"
                          : "purchase",
                  )
                : "Bán hàng";

            return (
              <article
                key={document.id}
                className="group rounded-[1.25rem] border border-[#eadfca] bg-white/95 px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md"
              >
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-700 ring-1 ring-amber-100">
                        <FileText className="h-3.5 w-3.5" />
                        {sourceLabel}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {formatDateText(document.documentDate)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onPreview(document)}
                      className="mt-2 block max-w-full truncate text-left text-base font-black text-slate-950 transition hover:text-amber-700"
                    >
                      {document.documentCode}
                    </button>
                    <p className="mt-1 truncate text-sm font-medium text-slate-500">
                      {document.partnerName || (type === "sale" ? "Khách lẻ" : "Chưa nhập nguồn giao")}
                      <span className="mx-1.5 text-slate-300">•</span>
                      {document.lines?.length || 0} mặt hàng
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 lg:min-w-[230px]">
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-right">
                      <p className="text-[11px] font-bold text-slate-400">Số lượng</p>
                      <p className="mt-0.5 text-sm font-black text-slate-800">
                        {formatMoney(document.totalQuantity)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-amber-50 px-3 py-2 text-right">
                      <p className="text-[11px] font-bold text-amber-500">Giá trị</p>
                      <p className="mt-0.5 text-sm font-black text-amber-800">
                        {formatMoney(document.totalAmount)} đ
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <button
                      type="button"
                      onClick={() => onPreview(document)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-black text-amber-700 shadow-sm hover:bg-amber-50"
                    >
                      <Eye className="h-4 w-4" />
                      Xem
                    </button>
                    <button
                      type="button"
                      onClick={() => onPreview(document)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white shadow-sm hover:bg-slate-800"
                    >
                      <Printer className="h-4 w-4" />
                      In phiếu
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-[1.4rem] border border-dashed border-amber-200 bg-amber-50/50 px-5 py-8 text-center">
            <FileText className="mx-auto h-7 w-7 text-amber-400" />
            <p className="mt-2 text-sm font-black text-slate-800">Chưa có phiếu trong khoảng thời gian này</p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Điều chỉnh thời gian hoặc tạo phiếu nhập mới để bắt đầu theo dõi.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
