import { Pencil, Printer, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  defaultFinanceVoucherSettings,
  getFinanceVoucherAmountText,
  getFinanceVoucherContent,
  getFinanceVoucherCounterparty,
  getFinanceVoucherCounterpartyLabel,
  getFinanceVoucherDate,
  getFinanceVoucherDetailRows,
  getFinanceVoucherNo,
  getFinanceVoucherTitle,
  loadFinanceVoucherSettings,
  mergeFinanceVoucherSettings,
  saveFinanceVoucherSettings,
  type FinanceVoucherSettings,
} from "./financeVoucherUtils";

import { formatMoney } from "./financeLiteUtils";

export function FinanceVoucherPreviewModal({
  transaction,
  settings,
  onClose,
}: {
  transaction: any;
  settings?: FinanceVoucherSettings;
  onClose: () => void;
}) {
  const [currentSettings, setCurrentSettings] = useState<FinanceVoucherSettings>(() =>
    mergeFinanceVoucherSettings(settings || loadFinanceVoucherSettings()),
  );
  const [localOptionsOpen, setLocalOptionsOpen] = useState(false);
  const [localTitle, setLocalTitle] = useState("");

  const defaultTitle = useMemo(() => getFinanceVoucherTitle(transaction, currentSettings), [transaction, currentSettings]);
  const title = localTitle.trim() || defaultTitle;
  const voucherNo = useMemo(() => getFinanceVoucherNo(transaction, currentSettings), [transaction, currentSettings]);
  const rows = useMemo(() => getFinanceVoucherDetailRows(transaction), [transaction]);
  const printFrameRef = useRef<HTMLIFrameElement | null>(null);
  const printHtml = useMemo(
    () => buildVoucherPrintHtml({
      settings: currentSettings,
      title,
      voucherNo,
      transaction,
      rows,
    }),
    [currentSettings, title, voucherNo, transaction, rows],
  );

  if (!transaction) return null;

  function printVoucherFromIframe() {
    const frameWindow = printFrameRef.current?.contentWindow;
    if (!frameWindow) return;
    frameWindow.focus();
    frameWindow.print();
  }

  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm finance-voucher-no-print">
<div className="flex h-[92vh] w-full max-w-[1040px] flex-col overflow-hidden rounded-[28px] border border-amber-100 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.24)]">
        <div className="finance-voucher-no-print flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Xem trước chứng từ</p>
            <h3 className="mt-1 text-lg font-bold text-slate-950">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLocalOptionsOpen((value) => !value)}
              className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Tùy chỉnh
            </button>
            <button
              type="button"
              onClick={printVoucherFromIframe}
              className="inline-flex items-center rounded-2xl border border-amber-200 bg-[linear-gradient(135deg,#fff6d8_0%,#f2c866_100%)] px-4 py-2.5 text-sm font-bold text-[#4a2b00] shadow-sm transition hover:-translate-y-0.5"
            >
              <Printer className="mr-2 h-4 w-4" />
              In phiếu
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden grid-cols-1">
          <div className="min-h-0 overflow-hidden bg-slate-100/70 p-4">
            {localOptionsOpen ? (
              <div className="mx-auto mb-3 max-w-[860px] rounded-2xl border border-amber-100 bg-white px-4 py-3 shadow-sm">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Tiêu đề phiếu này</span>
                  <input
                    value={localTitle}
                    onChange={(event) => setLocalTitle(event.target.value)}
                    placeholder={defaultTitle}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                  />
                </label>
              </div>
            ) : null}
            <iframe
              ref={printFrameRef}
              title="Xem trước phiếu in"
              srcDoc={printHtml}
              className="mx-auto h-full min-h-0 w-full max-w-[860px] rounded-2xl border border-slate-200 bg-white shadow-xl"
            />
          </div>
        </div>
      </div>
    </div>
    , document.body
  );
}

type VoucherPrintHtmlArgs = {
  settings: FinanceVoucherSettings;
  title: string;
  voucherNo: string;
  transaction: any;
  rows: Array<{ label: string; value: string; amount: number }>;
};

function buildVoucherPrintHtml({ settings, title, voucherNo, transaction, rows }: VoucherPrintHtmlArgs) {
  const organizationLine = [
    settings.phone ? `ĐT: ${settings.phone}` : "",
    settings.email || "",
  ].filter(Boolean).join(" · ");

  const rowsHtml = rows
    .map(
      (row) => `
        <tr>
          <td><strong>${escapeHtml(row.label)}:</strong> ${escapeHtml(row.value)}</td>
          <td class="money">${escapeHtml(formatMoney(row.amount))}</td>
        </tr>
      `,
    )
    .join("");

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)} - ${escapeHtml(voucherNo)}</title>
  <style>
    :root {
      color-scheme: light;
      font-family: Arial, "Times New Roman", sans-serif;
      color: #0f172a;
      background: #f1f5f9;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #e5e7eb;
      color: #0f172a;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #fff;
      padding: 16mm 15mm;
      box-shadow: none;
    }
    .header {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 24px;
      border-bottom: 2px solid #111827;
      padding-bottom: 14px;
    }
    .org-name {
      font-size: 18px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    .muted { color: #64748b; font-size: 12px; line-height: 1.55; }
    .voucher-no {
      text-align: right;
      font-size: 12px;
      color: #64748b;
    }
    .voucher-no strong {
      display: block;
      margin-top: 4px;
      font-size: 16px;
      color: #0f172a;
    }
    .title {
      text-align: center;
      padding: 28px 0 22px;
    }
    .title h1 {
      margin: 0;
      font-size: 24px;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .title p { margin: 8px 0 0; color: #475569; font-size: 13px; }
    .info {
      display: grid;
      gap: 10px;
      font-size: 14px;
      line-height: 1.7;
    }
    .info-row {
      display: grid;
      grid-template-columns: 180px 1fr;
      gap: 12px;
      border-bottom: 1px dotted #94a3b8;
      padding-bottom: 4px;
    }
    .info-row label { font-weight: 700; color: #334155; }
    .info-row strong { color: #0f172a; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 28px;
      font-size: 14px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 10px 12px;
      vertical-align: top;
    }
    th {
      background: #f1f5f9;
      text-align: left;
    }
    .money { text-align: right; font-weight: 700; white-space: nowrap; }
    .signatures {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-top: 42px;
      text-align: center;
      font-size: 14px;
    }
    .sign-title { font-weight: 700; }
    .sign-note { margin-top: 4px; color: #64748b; font-size: 12px; font-style: italic; }
    .sign-space { height: 92px; }
    footer {
      margin-top: 44px;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }
    @page {
      size: A4 portrait;
      margin: 12mm;
    }
    @media print {
      body { background: #fff; }
      .page {
        width: auto;
        min-height: auto;
        margin: 0;
        padding: 0;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <main class="page">
    <header class="header">
      <div>
        <div class="org-name">${escapeHtml(settings.organizationName)}</div>
        ${settings.organizationSubtitle ? `<div class="muted">${escapeHtml(settings.organizationSubtitle)}</div>` : ""}
        ${settings.address ? `<div class="muted">${escapeHtml(settings.address)}</div>` : ""}
        ${organizationLine ? `<div class="muted">${escapeHtml(organizationLine)}</div>` : ""}
      </div>
      <div class="voucher-no">
        Số phiếu
        <strong>${escapeHtml(voucherNo)}</strong>
      </div>
    </header>

    ${settings.headerText ? `<p class="muted" style="text-align:center;font-style:italic;margin-top:12px;">${escapeHtml(settings.headerText)}</p>` : ""}

    <section class="title">
      <h1>${escapeHtml(title)}</h1>
      <p>Ngày lập: ${escapeHtml(getFinanceVoucherDate(transaction))}</p>
    </section>

    <section class="info">
      <div class="info-row">
        <label>${escapeHtml(getFinanceVoucherCounterpartyLabel(transaction))}:</label>
        <div>${escapeHtml(getFinanceVoucherCounterparty(transaction))}</div>
      </div>
      <div class="info-row">
        <label>Nội dung:</label>
        <div>${escapeHtml(getFinanceVoucherContent(transaction))}</div>
      </div>
      <div class="info-row">
        <label>Số tiền:</label>
        <div><strong>${escapeHtml(getFinanceVoucherAmountText(transaction))}</strong></div>
      </div>
    </section>

    <table>
      <thead>
        <tr>
          <th>Nội dung</th>
          <th style="width: 180px; text-align:right;">Số tiền</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>

    <section class="signatures">
      <div>
        <div class="sign-title">Người lập</div>
        <div class="sign-note">(Ký, ghi rõ họ tên)</div>
        <div class="sign-space"></div>
      </div>
      <div>
        <div class="sign-title">Người nộp/nhận</div>
        <div class="sign-note">(Ký, ghi rõ họ tên)</div>
        <div class="sign-space"></div>
      </div>
      <div>
        <div class="sign-title">${escapeHtml(settings.cashierTitle)}</div>
        <div class="sign-note">(Ký, ghi rõ họ tên)</div>
        <div class="sign-space"></div>
      </div>
      <div>
        <div class="sign-title">${escapeHtml(settings.managerTitle)}</div>
        <div class="sign-note">(Ký, ghi rõ họ tên)</div>
        <div class="sign-space"></div>
      </div>
    </section>

    <footer>${escapeHtml(settings.footerText)}</footer>
  </main>
</body>
</html>`;
}

function escapeHtml(value: any) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function VoucherInfoRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="grid grid-cols-[170px_1fr] gap-3 border-b border-dotted border-slate-300 pb-1">
      <p className="font-semibold text-slate-700">{label}:</p>
      <p className={strong ? "font-bold text-slate-950" : "text-slate-800"}>{value}</p>
    </div>
  );
}

function SignatureBox({ title }: { title: string }) {
  return (
    <div>
      <p className="font-bold">{title}</p>
      <p className="mt-1 text-xs italic text-slate-500">(Ký, ghi rõ họ tên)</p>
      <div className="h-24" />
    </div>
  );
}

