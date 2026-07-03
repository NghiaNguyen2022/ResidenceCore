import { Settings2, Printer, RotateCcw, Save, X } from "lucide-react";
import { useMemo, useState } from "react";
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
  const [draftSettings, setDraftSettings] = useState<FinanceVoucherSettings>(currentSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const title = useMemo(() => getFinanceVoucherTitle(transaction, currentSettings), [transaction, currentSettings]);
  const voucherNo = useMemo(() => getFinanceVoucherNo(transaction, currentSettings), [transaction, currentSettings]);
  const rows = useMemo(() => getFinanceVoucherDetailRows(transaction), [transaction]);

  if (!transaction) return null;

  function updateDraft(path: string, value: string) {
    setDraftSettings((prev) => {
      const next = mergeFinanceVoucherSettings(prev);
      if (path.startsWith("titles.")) {
        const key = path.replace("titles.", "") as keyof FinanceVoucherSettings["titles"];
        return { ...next, titles: { ...next.titles, [key]: value } };
      }
      if (path.startsWith("prefixes.")) {
        const key = path.replace("prefixes.", "") as keyof FinanceVoucherSettings["prefixes"];
        return { ...next, prefixes: { ...next.prefixes, [key]: value } };
      }
      return { ...next, [path]: value };
    });
  }

  function saveSettings() {
    const merged = mergeFinanceVoucherSettings(draftSettings);
    saveFinanceVoucherSettings(merged);
    setCurrentSettings(merged);
    setDraftSettings(merged);
    setSettingsOpen(false);
  }

  function resetSettings() {
    setDraftSettings(defaultFinanceVoucherSettings);
  }

  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm finance-voucher-no-print">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #finance-voucher-print-area, #finance-voucher-print-area * {
              visibility: visible !important;
            }
            #finance-voucher-print-area {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
              padding: 22mm 18mm !important;
              background: white !important;
            }
            .finance-voucher-no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-amber-100 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.24)]">
        <div className="finance-voucher-no-print flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Xem trước chứng từ</p>
            <h3 className="mt-1 text-lg font-bold text-slate-950">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSettingsOpen((value) => !value)}
              className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200"
            >
              <Settings2 className="mr-2 h-4 w-4" />
              Cấu hình
            </button>
            <button
              type="button"
              onClick={() => window.print()}
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

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[1fr_360px]">
          <div className="overflow-y-auto bg-slate-100/70 p-4">
            <div id="finance-voucher-print-area" className="mx-auto min-h-[720px] max-w-[794px] bg-white px-10 py-9 text-slate-950 shadow-xl">
              <header className="border-b-2 border-slate-900 pb-4">
                <div className="grid grid-cols-[1fr_auto] gap-4">
                  <div>
                    <p className="text-lg font-extrabold uppercase tracking-wide">{currentSettings.organizationName}</p>
                    {currentSettings.organizationSubtitle ? <p className="mt-1 text-sm text-slate-600">{currentSettings.organizationSubtitle}</p> : null}
                    {currentSettings.address ? <p className="mt-1 text-xs text-slate-500">{currentSettings.address}</p> : null}
                    {currentSettings.phone || currentSettings.email ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {currentSettings.phone ? `ĐT: ${currentSettings.phone}` : ""}{currentSettings.phone && currentSettings.email ? " · " : ""}{currentSettings.email || ""}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>Số phiếu</p>
                    <p className="mt-1 text-base font-bold text-slate-950">{voucherNo}</p>
                  </div>
                </div>
                {currentSettings.headerText ? <p className="mt-3 text-center text-sm italic text-slate-600">{currentSettings.headerText}</p> : null}
              </header>

              <section className="py-7 text-center">
                <h1 className="text-2xl font-extrabold uppercase tracking-[0.08em]">{title}</h1>
                <p className="mt-2 text-sm text-slate-600">Ngày lập: {getFinanceVoucherDate(transaction)}</p>
              </section>

              <section className="grid gap-3 text-sm leading-7">
                <VoucherInfoRow label={getFinanceVoucherCounterpartyLabel(transaction)} value={getFinanceVoucherCounterparty(transaction)} />
                <VoucherInfoRow label="Nội dung" value={getFinanceVoucherContent(transaction)} />
                <VoucherInfoRow label="Số tiền" value={getFinanceVoucherAmountText(transaction)} strong />
              </section>

              <section className="mt-7">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 px-3 py-2 text-left">Nội dung</th>
                      <th className="w-44 border border-slate-300 px-3 py-2 text-right">Số tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={`${row.label}-${index}`}>
                        <td className="border border-slate-300 px-3 py-2">
                          <span className="font-semibold">{row.label}:</span> {row.value}
                        </td>
                        <td className="border border-slate-300 px-3 py-2 text-right font-semibold">{formatMoney(row.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="mt-10 grid grid-cols-4 gap-4 text-center text-sm">
                <SignatureBox title="Người lập" />
                <SignatureBox title="Người nộp/nhận" />
                <SignatureBox title={currentSettings.cashierTitle} />
                <SignatureBox title={currentSettings.managerTitle} />
              </section>

              <footer className="mt-12 border-t border-slate-200 pt-3 text-center text-xs text-slate-500">
                {currentSettings.footerText}
              </footer>
            </div>
          </div>

          {settingsOpen ? (
            <aside className="finance-voucher-no-print min-h-0 overflow-y-auto border-l border-slate-100 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Cấu hình mẫu phiếu</p>
                  <h4 className="mt-1 text-base font-bold text-slate-950">Header, footer, tiêu đề</h4>
                </div>
                <button type="button" onClick={resetSettings} className="inline-flex items-center rounded-2xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Mặc định
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <ConfigInput label="Tên đơn vị" value={draftSettings.organizationName} onChange={(value) => updateDraft("organizationName", value)} />
                <ConfigInput label="Dòng phụ" value={draftSettings.organizationSubtitle} onChange={(value) => updateDraft("organizationSubtitle", value)} />
                <ConfigInput label="Địa chỉ" value={draftSettings.address} onChange={(value) => updateDraft("address", value)} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <ConfigInput label="Điện thoại" value={draftSettings.phone} onChange={(value) => updateDraft("phone", value)} />
                  <ConfigInput label="Email" value={draftSettings.email} onChange={(value) => updateDraft("email", value)} />
                </div>
                <ConfigTextarea label="Header text" value={draftSettings.headerText} onChange={(value) => updateDraft("headerText", value)} />
                <ConfigTextarea label="Footer text" value={draftSettings.footerText} onChange={(value) => updateDraft("footerText", value)} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <ConfigInput label="Chức danh thủ quỹ" value={draftSettings.cashierTitle} onChange={(value) => updateDraft("cashierTitle", value)} />
                  <ConfigInput label="Chức danh quản lý" value={draftSettings.managerTitle} onChange={(value) => updateDraft("managerTitle", value)} />
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50/45 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Tiêu đề phiếu</p>
                  <div className="mt-3 space-y-3">
                    <ConfigInput label="Thu học viên" value={draftSettings.titles.studentFee} onChange={(value) => updateDraft("titles.studentFee", value)} />
                    <ConfigInput label="Phiếu thu" value={draftSettings.titles.receipt} onChange={(value) => updateDraft("titles.receipt", value)} />
                    <ConfigInput label="Tài trợ" value={draftSettings.titles.donation} onChange={(value) => updateDraft("titles.donation", value)} />
                    <ConfigInput label="Phiếu chi" value={draftSettings.titles.payment} onChange={(value) => updateDraft("titles.payment", value)} />
                    <ConfigInput label="Dự chi" value={draftSettings.titles.plannedExpense} onChange={(value) => updateDraft("titles.plannedExpense", value)} />
                    <ConfigInput label="Tạm ứng" value={draftSettings.titles.advance} onChange={(value) => updateDraft("titles.advance", value)} />
                    <ConfigInput label="Quyết toán tạm ứng" value={draftSettings.titles.advanceSettlement} onChange={(value) => updateDraft("titles.advanceSettlement", value)} />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Prefix số phiếu</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <ConfigInput label="Thu HV" value={draftSettings.prefixes.studentFee} onChange={(value) => updateDraft("prefixes.studentFee", value)} />
                    <ConfigInput label="Thu" value={draftSettings.prefixes.receipt} onChange={(value) => updateDraft("prefixes.receipt", value)} />
                    <ConfigInput label="Chi" value={draftSettings.prefixes.payment} onChange={(value) => updateDraft("prefixes.payment", value)} />
                    <ConfigInput label="Dự chi" value={draftSettings.prefixes.plannedExpense} onChange={(value) => updateDraft("prefixes.plannedExpense", value)} />
                    <ConfigInput label="Tạm ứng" value={draftSettings.prefixes.advance} onChange={(value) => updateDraft("prefixes.advance", value)} />
                    <ConfigInput label="Quyết toán" value={draftSettings.prefixes.advanceSettlement} onChange={(value) => updateDraft("prefixes.advanceSettlement", value)} />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 mt-4 border-t border-slate-100 bg-white pt-3">
                <button
                  type="button"
                  onClick={saveSettings}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-amber-200 bg-[linear-gradient(135deg,#fff6d8_0%,#f2c866_100%)] px-4 py-3 text-sm font-bold text-[#4a2b00] shadow-sm"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Lưu cấu hình
                </button>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
    , document.body
  );
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

function ConfigInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
      />
    </label>
  );
}

function ConfigTextarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
      />
    </label>
  );
}
