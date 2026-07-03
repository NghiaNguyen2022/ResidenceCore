"use client";

import { RotateCcw, Save, X } from "lucide-react";
import { useState } from "react";

import {
  defaultFinanceVoucherSettings,
  loadFinanceVoucherSettings,
  mergeFinanceVoucherSettings,
  saveFinanceVoucherSettings,
  type FinanceVoucherSettings,
} from "./financeVoucherUtils";

export function FinanceVoucherSettingsModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [draftSettings, setDraftSettings] = useState<FinanceVoucherSettings>(() =>
    mergeFinanceVoucherSettings(loadFinanceVoucherSettings()),
  );

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
    saveFinanceVoucherSettings(draftSettings);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[30px] border border-amber-100 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.24)]">
        <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              Cấu hình chứng từ
            </p>
            <h3 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950">
              Mẫu phiếu in tài chính
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#fffdf8_0%,#f8fafc_100%)] p-5">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
            <section className="rounded-[26px] border border-amber-100/80 bg-white/88 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Thông tin chung</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <ConfigInput label="Tên đơn vị" value={draftSettings.organizationName} onChange={(value) => updateDraft("organizationName", value)} />
                <ConfigInput label="Dòng phụ" value={draftSettings.organizationSubtitle} onChange={(value) => updateDraft("organizationSubtitle", value)} />
                <ConfigInput label="Địa chỉ" value={draftSettings.address} onChange={(value) => updateDraft("address", value)} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <ConfigInput label="Điện thoại" value={draftSettings.phone} onChange={(value) => updateDraft("phone", value)} />
                  <ConfigInput label="Email" value={draftSettings.email} onChange={(value) => updateDraft("email", value)} />
                </div>
                <ConfigTextarea label="Header text" value={draftSettings.headerText} onChange={(value) => updateDraft("headerText", value)} />
                <ConfigTextarea label="Footer text" value={draftSettings.footerText} onChange={(value) => updateDraft("footerText", value)} />
                <ConfigInput label="Chức danh thủ quỹ" value={draftSettings.cashierTitle} onChange={(value) => updateDraft("cashierTitle", value)} />
                <ConfigInput label="Chức danh quản lý" value={draftSettings.managerTitle} onChange={(value) => updateDraft("managerTitle", value)} />
              </div>
            </section>

            <aside className="rounded-[26px] border border-amber-100/80 bg-[linear-gradient(180deg,#fffaf0_0%,#fffdf8_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Ghi chú</p>
              <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
                <p>
                  Cấu hình này dùng chung cho biên nhận thu học viên, phiếu thu, phiếu chi, phiếu tạm ứng và phiếu đề nghị chi.
                </p>
                <p>
                  Hiện đang lưu tạm trên trình duyệt. Sau này có thể chuyển xuống cấu hình hệ thống trong database.
                </p>
              </div>
            </aside>

            <section className="rounded-[26px] border border-amber-100/80 bg-white/88 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] xl:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Tiêu đề phiếu</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <ConfigInput label="Thu học viên" value={draftSettings.titles.studentFee} onChange={(value) => updateDraft("titles.studentFee", value)} />
                <ConfigInput label="Phiếu thu" value={draftSettings.titles.receipt} onChange={(value) => updateDraft("titles.receipt", value)} />
                <ConfigInput label="Tài trợ / ủng hộ" value={draftSettings.titles.donation} onChange={(value) => updateDraft("titles.donation", value)} />
                <ConfigInput label="Phiếu chi" value={draftSettings.titles.payment} onChange={(value) => updateDraft("titles.payment", value)} />
                <ConfigInput label="Dự chi" value={draftSettings.titles.plannedExpense} onChange={(value) => updateDraft("titles.plannedExpense", value)} />
                <ConfigInput label="Tạm ứng" value={draftSettings.titles.advance} onChange={(value) => updateDraft("titles.advance", value)} />
                <ConfigInput label="Quyết toán tạm ứng" value={draftSettings.titles.advanceSettlement} onChange={(value) => updateDraft("titles.advanceSettlement", value)} />
              </div>
            </section>

            <section className="rounded-[26px] border border-slate-100 bg-white/88 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] xl:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Prefix số phiếu</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
                <ConfigInput label="Thu HV" value={draftSettings.prefixes.studentFee} onChange={(value) => updateDraft("prefixes.studentFee", value)} />
                <ConfigInput label="Thu" value={draftSettings.prefixes.receipt} onChange={(value) => updateDraft("prefixes.receipt", value)} />
                <ConfigInput label="Tài trợ" value={draftSettings.prefixes.donation} onChange={(value) => updateDraft("prefixes.donation", value)} />
                <ConfigInput label="Chi" value={draftSettings.prefixes.payment} onChange={(value) => updateDraft("prefixes.payment", value)} />
                <ConfigInput label="Dự chi" value={draftSettings.prefixes.plannedExpense} onChange={(value) => updateDraft("prefixes.plannedExpense", value)} />
                <ConfigInput label="Tạm ứng" value={draftSettings.prefixes.advance} onChange={(value) => updateDraft("prefixes.advance", value)} />
                <ConfigInput label="Quyết toán" value={draftSettings.prefixes.advanceSettlement} onChange={(value) => updateDraft("prefixes.advanceSettlement", value)} />
              </div>
            </section>
          </div>
        </div>

        <footer className="flex flex-col gap-2 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => setDraftSettings(defaultFinanceVoucherSettings)}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Mặc định
          </button>
          <button
            type="button"
            onClick={saveSettings}
            className="inline-flex items-center justify-center rounded-2xl border border-amber-200 bg-[linear-gradient(135deg,#fff6d8_0%,#f2c866_100%)] px-5 py-2.5 text-sm font-bold text-[#4a2b00] shadow-sm transition hover:-translate-y-0.5"
          >
            <Save className="mr-2 h-4 w-4" />
            Lưu cấu hình
          </button>
        </footer>
      </div>
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
    <label className="block md:col-span-2">
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
