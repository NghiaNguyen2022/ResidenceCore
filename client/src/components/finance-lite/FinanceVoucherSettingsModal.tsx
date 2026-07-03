import { RotateCcw, Save, X } from "lucide-react";
import { useState } from "react";

import {
      defaultFinanceVoucherSettings,
      loadFinanceVoucherSettings,
      mergeFinanceVoucherSettings,
      saveFinanceVoucherSettings,
      type FinanceVoucherSettings,
} from "./financeVoucherUtils";

export function FinanceVoucherSettingsModal({ onClose }: { onClose: () => void }) {
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
            saveFinanceVoucherSettings(mergeFinanceVoucherSettings(draftSettings));
            onClose();
      }

      return (
            <div className="fixed inset-0 z-[96] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
                  <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-amber-100 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.24)]">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                              <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Cấu hình chung</p>
                                    <h3 className="mt-1 text-xl font-bold text-slate-950">Mẫu phiếu in</h3>
                              </div>
                              <div className="flex items-center gap-2">
                                    <button
                                          type="button"
                                          onClick={() => setDraftSettings(defaultFinanceVoucherSettings)}
                                          className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200"
                                    >
                                          <RotateCcw className="mr-2 h-4 w-4" />
                                          Mặc định
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

                        <div className="min-h-0 flex-1 overflow-y-auto p-5">
                              <div className="grid gap-4 md:grid-cols-2">
                                    <ConfigInput label="Tên đơn vị" value={draftSettings.organizationName} onChange={(value) => updateDraft("organizationName", value)} />
                                    <ConfigInput label="Dòng phụ" value={draftSettings.organizationSubtitle} onChange={(value) => updateDraft("organizationSubtitle", value)} />
                              </div>
                              <div className="mt-4">
                                    <ConfigInput label="Địa chỉ" value={draftSettings.address} onChange={(value) => updateDraft("address", value)} />
                              </div>
                              <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <ConfigInput label="Điện thoại" value={draftSettings.phone} onChange={(value) => updateDraft("phone", value)} />
                                    <ConfigInput label="Email" value={draftSettings.email} onChange={(value) => updateDraft("email", value)} />
                              </div>
                              <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <ConfigInput label="Chức danh thủ quỹ" value={draftSettings.cashierTitle} onChange={(value) => updateDraft("cashierTitle", value)} />
                                    <ConfigInput label="Chức danh quản lý" value={draftSettings.managerTitle} onChange={(value) => updateDraft("managerTitle", value)} />
                              </div>
                              <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <ConfigTextarea label="Header text" value={draftSettings.headerText} onChange={(value) => updateDraft("headerText", value)} />
                                    <ConfigTextarea label="Footer text" value={draftSettings.footerText} onChange={(value) => updateDraft("footerText", value)} />
                              </div>

                              <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50/45 p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Tiêu đề mặc định</p>
                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                          <ConfigInput label="Thu học viên" value={draftSettings.titles.studentFee} onChange={(value) => updateDraft("titles.studentFee", value)} />
                                          <ConfigInput label="Phiếu thu" value={draftSettings.titles.receipt} onChange={(value) => updateDraft("titles.receipt", value)} />
                                          <ConfigInput label="Tài trợ / ủng hộ" value={draftSettings.titles.donation} onChange={(value) => updateDraft("titles.donation", value)} />
                                          <ConfigInput label="Phiếu chi" value={draftSettings.titles.payment} onChange={(value) => updateDraft("titles.payment", value)} />
                                          <ConfigInput label="Dự chi" value={draftSettings.titles.plannedExpense} onChange={(value) => updateDraft("titles.plannedExpense", value)} />
                                          <ConfigInput label="Tạm ứng" value={draftSettings.titles.advance} onChange={(value) => updateDraft("titles.advance", value)} />
                                          <ConfigInput label="Quyết toán tạm ứng" value={draftSettings.titles.advanceSettlement} onChange={(value) => updateDraft("titles.advanceSettlement", value)} />
                                    </div>
                              </div>

                              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Prefix số phiếu</p>
                                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                                          <ConfigInput label="Thu HV" value={draftSettings.prefixes.studentFee} onChange={(value) => updateDraft("prefixes.studentFee", value)} />
                                          <ConfigInput label="Thu" value={draftSettings.prefixes.receipt} onChange={(value) => updateDraft("prefixes.receipt", value)} />
                                          <ConfigInput label="Tài trợ" value={draftSettings.prefixes.donation} onChange={(value) => updateDraft("prefixes.donation", value)} />
                                          <ConfigInput label="Chi" value={draftSettings.prefixes.payment} onChange={(value) => updateDraft("prefixes.payment", value)} />
                                          <ConfigInput label="Dự chi" value={draftSettings.prefixes.plannedExpense} onChange={(value) => updateDraft("prefixes.plannedExpense", value)} />
                                          <ConfigInput label="Tạm ứng" value={draftSettings.prefixes.advance} onChange={(value) => updateDraft("prefixes.advance", value)} />
                                          <ConfigInput label="Quyết toán" value={draftSettings.prefixes.advanceSettlement} onChange={(value) => updateDraft("prefixes.advanceSettlement", value)} />
                                    </div>
                              </div>
                        </div>

                        <div className="border-t border-slate-100 bg-white px-5 py-4">
                              <button
                                    type="button"
                                    onClick={saveSettings}
                                    className="inline-flex w-full items-center justify-center rounded-2xl border border-amber-200 bg-[linear-gradient(135deg,#fff6d8_0%,#f2c866_100%)] px-4 py-3 text-sm font-bold text-[#4a2b00] shadow-sm"
                              >
                                    <Save className="mr-2 h-4 w-4" />
                                    Lưu cấu hình chung
                              </button>
                        </div>
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
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
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
                        rows={4}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                  />
            </label>
      );
}
