import type { ReactNode } from "react";

import { formatMoney } from "@/components/store-ledger/storeLedgerUtils";

export function CashflowLine({
      label,
      value,
      total,
}: {
      label: string;
      value: number;
      total: number;
}) {
      const percent = total > 0 ? Math.round((value / total) * 100) : 0;
      return (
            <div className="rounded-xl border border-white/80 bg-white/85 px-3 py-2 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-bold text-slate-600">{label}</span>
                        <span className="text-sm font-black text-slate-950">
                              {formatMoney(value)} đ
                        </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                              className="h-full rounded-full bg-slate-700"
                              style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                        />
                  </div>
                  <p className="mt-1 text-right text-[11px] font-bold text-slate-400">
                        {percent}%
                  </p>
            </div>
      );
}

export function MiniStat({ label, value }: { label: string; value: string }) {
      return (
            <div className="rounded-2xl border border-amber-100 bg-white px-3 py-2 shadow-sm">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                        {label}
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
            </div>
      );
}

export function SummaryCard({
      icon,
      label,
      value,
      tone,
}: {
      icon: ReactNode;
      label: string;
      value: string;
      tone: "emerald" | "rose" | "amber" | "slate";
}) {
      const toneClass =
            tone === "emerald"
                  ? "text-emerald-700"
                  : tone === "rose"
                        ? "text-rose-700"
                        : tone === "amber"
                              ? "text-amber-700"
                              : "text-slate-700";
      return (
            <div className="rounded-[1.5rem] border border-[#eadfca] bg-[linear-gradient(135deg,#ffffff_0%,#fff7df_100%)] p-4 shadow-lg shadow-amber-950/5">
                  <div className="flex items-center gap-3">
                        <div
                              className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-amber-100 ${toneClass}`}
                        >
                              {icon}
                        </div>
                        <div className="min-w-0">
                              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                                    {label}
                              </p>
                              <p className="mt-1 truncate text-xl font-black text-slate-950">
                                    {value}
                              </p>
                        </div>
                  </div>
            </div>
      );
}

export const inputClass =
      "w-full rounded-2xl border border-[#e5d8bd] bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-[#d6a63d] focus:ring-4 focus:ring-amber-100";

export function Field({
      label,
      children,
      className = "",
}: {
      label: string;
      children: ReactNode;
      className?: string;
}) {
      return (
            <label className={`block ${className}`}>
                  <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                        {label}
                  </span>
                  {children}
            </label>
      );
}

export function Modal({
      title,
      children,
      onClose,
      overlayClassName = "z-[80]",
}: {
      title: string;
      children: ReactNode;
      onClose: () => void;
      overlayClassName?: string;
}) {
      return (
            <div
                  className={`fixed inset-0 ${overlayClassName} flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm`}
            >
                  <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[2rem] border border-[#eadfca] bg-[linear-gradient(135deg,#fffdf7_0%,#ffffff_54%,#fff7df_100%)] shadow-2xl shadow-slate-950/20">
                        <div className="flex items-center justify-between border-b border-[#eadfca] px-5 py-4">
                              <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
                                          Quản lý cửa hàng
                                    </p>
                                    <h2 className="text-lg font-black text-slate-950">{title}</h2>
                              </div>
                              <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-slate-50"
                              >
                                    Đóng
                              </button>
                        </div>
                        <div className="max-h-[68vh] overflow-y-auto px-5 py-4">{children}</div>
                  </div>
            </div>
      );
}

export function ErrorText({ children }: { children: ReactNode }) {
      return (
            <div className="mt-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                  {children}
            </div>
      );
}

export function ModalFooter({
      onClose,
      onSave,
      saveText,
      loading,
}: {
      onClose: () => void;
      onSave: () => void;
      saveText: string;
      loading?: boolean;
}) {
      return (
            <div className="mt-4 flex justify-end gap-2 border-t border-[#eadfca] pt-4">
                  <button
                        type="button"
                        onClick={onClose}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm"
                  >
                        Hủy
                  </button>
                  <button
                        type="button"
                        onClick={onSave}
                        disabled={loading}
                        className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-slate-950/20 disabled:opacity-60"
                  >
                        {loading ? "Đang lưu..." : saveText}
                  </button>
            </div>
      );
}
