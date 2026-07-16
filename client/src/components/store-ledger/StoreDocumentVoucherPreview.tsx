import { Printer, X } from "lucide-react";
import { useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { loadFinanceVoucherSettings, numberToVietnameseWords } from "@/components/finance-lite/financeVoucherUtils";
import { formatDateText, formatMoney } from "./storeLedgerUtils";

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char] || char));
}

export function StoreDocumentVoucherPreview({ document, onClose }: { document: any; onClose: () => void }) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const settings = loadFinanceVoucherSettings();
  const html = useMemo(() => buildHtml(document, settings), [document]);
  if (!document) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="flex h-[92vh] w-full max-w-[1060px] flex-col overflow-hidden rounded-[28px] border border-amber-100 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Xem trước phiếu cửa hàng</p><h3 className="mt-1 text-lg font-bold text-slate-950">{document.documentType === "sale" ? "PHIẾU BÁN HÀNG" : document.stockInSource === "purchase" ? "PHIẾU MUA HÀNG / NHẬP KHO" : "PHIẾU NHẬP KHO"}</h3></div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { const win = frameRef.current?.contentWindow; win?.focus(); win?.print(); }} className="inline-flex items-center rounded-2xl border border-amber-200 bg-[linear-gradient(135deg,#fff6d8_0%,#f2c866_100%)] px-4 py-2.5 text-sm font-bold text-[#4a2b00]"><Printer className="mr-2 h-4 w-4" /> In phiếu</button>
            <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600"><X className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="min-h-0 flex-1 bg-slate-100/70 p-4"><iframe ref={frameRef} title="Phiếu cửa hàng" srcDoc={html} className="mx-auto h-full w-full max-w-[860px] rounded-2xl border border-slate-200 bg-white shadow-xl" /></div>
      </div>
    </div>, document.body,
  );
}

function buildHtml(document: any, settings: any) {
  const isSale = document.documentType === "sale";
  const title = isSale ? "PHIẾU BÁN HÀNG" : document.stockInSource === "purchase" ? "PHIẾU MUA HÀNG / NHẬP KHO" : "PHIẾU NHẬP KHO";
  const rows = (document.lines || []).map((line: any, index: number) => `<tr><td>${index + 1}</td><td>${escapeHtml(line.productName)}</td><td>${escapeHtml(line.productUnit || "")}</td><td class="num">${escapeHtml(formatMoney(line.quantity))}</td><td class="num">${escapeHtml(formatMoney(isSale ? line.unitPrice : line.unitCost))}</td><td class="num">${escapeHtml(formatMoney(line.lineAmount))}</td></tr>`).join("");
  const amount = Number(document.totalAmount || 0);
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${escapeHtml(title)} - ${escapeHtml(document.documentCode)}</title><style>
  *{box-sizing:border-box}body{margin:0;background:#e5e7eb;font-family:Arial,"Times New Roman",sans-serif;color:#0f172a}.page{width:210mm;min-height:297mm;margin:0 auto;background:white;padding:16mm 15mm}.header{display:flex;justify-content:space-between;border-bottom:2px solid #111827;padding-bottom:14px}.org{font-size:18px;font-weight:800;text-transform:uppercase}.muted{font-size:12px;color:#64748b;line-height:1.55}.code{text-align:right;font-size:12px;color:#64748b}.code b{display:block;font-size:16px;color:#0f172a;margin-top:4px}.title{text-align:center;padding:26px 0 20px}.title h1{font-size:24px;letter-spacing:.07em;margin:0}.title p{font-size:13px;color:#475569}.info{display:grid;gap:8px;font-size:14px}.info-row{display:grid;grid-template-columns:170px 1fr;gap:12px;border-bottom:1px dotted #94a3b8;padding-bottom:4px}.info-row label{font-weight:700}table{width:100%;border-collapse:collapse;margin-top:24px;font-size:13px}th,td{border:1px solid #cbd5e1;padding:8px}th{background:#f1f5f9}.num{text-align:right;white-space:nowrap}.total{margin-top:18px;display:flex;justify-content:flex-end}.total-box{width:360px;font-size:14px}.total-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dotted #94a3b8}.words{margin-top:14px;font-size:14px;line-height:1.6}.signatures{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:42px;text-align:center;font-size:14px}.space{height:88px}footer{margin-top:38px;border-top:1px solid #e2e8f0;padding-top:10px;text-align:center;color:#64748b;font-size:12px}@page{size:A4 portrait;margin:12mm}@media print{body{background:#fff}.page{width:auto;min-height:auto;padding:0}}
  </style></head><body><main class="page"><header class="header"><div><div class="org">${escapeHtml(settings.organizationName || "APP LƯU XÁ")}</div><div class="muted">${escapeHtml(settings.organizationSubtitle || "Quản lý lưu xá")}</div><div class="muted">${escapeHtml(settings.address || "")}</div></div><div class="code">Số phiếu<b>${escapeHtml(document.documentCode)}</b></div></header><section class="title"><h1>${escapeHtml(title)}</h1><p>Ngày ${escapeHtml(formatDateText(document.documentDate))}</p></section><section class="info"><div class="info-row"><label>${isSale ? "Người mua / khách hàng" : "Nhà cung cấp / nguồn giao"}</label><strong>${escapeHtml(document.partnerName || "................................")}</strong></div><div class="info-row"><label>Phương thức thanh toán</label><strong>${escapeHtml(document.paymentMethod || "Tiền mặt")}</strong></div><div class="info-row"><label>Ghi chú</label><span>${escapeHtml(document.notes || "")}</span></div></section><table><thead><tr><th>STT</th><th>Hàng hóa</th><th>ĐVT</th><th class="num">Số lượng</th><th class="num">Đơn giá</th><th class="num">Thành tiền</th></tr></thead><tbody>${rows}</tbody></table><div class="total"><div class="total-box"><div class="total-row"><b>Tổng số lượng</b><b>${escapeHtml(formatMoney(document.totalQuantity))}</b></div><div class="total-row"><b>Tổng tiền</b><b>${escapeHtml(formatMoney(amount))} đ</b></div></div></div><div class="words"><b>Số tiền bằng chữ:</b> ${escapeHtml(numberToVietnameseWords(amount))} đồng.</div><section class="signatures"><div><b>Người lập phiếu</b><div class="muted">(Ký, ghi rõ họ tên)</div><div class="space"></div></div><div><b>${isSale ? "Người bán / thu tiền" : "Người giao hàng"}</b><div class="muted">(Ký, ghi rõ họ tên)</div><div class="space"></div></div><div><b>${isSale ? "Người nhận hàng" : "Người nhận kho"}</b><div class="muted">(Ký, ghi rõ họ tên)</div><div class="space"></div></div><div><b>${escapeHtml(settings.managerTitle || "Người duyệt")}</b><div class="muted">(Ký, ghi rõ họ tên)</div><div class="space"></div></div></section><footer>${escapeHtml(settings.footerText || "Phiếu được in từ hệ thống quản lý lưu xá.")}</footer></main></body></html>`;
}
