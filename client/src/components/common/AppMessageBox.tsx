'use client';

import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type AppMessageBoxVariant = 'info' | 'warning' | 'danger' | 'success';

export type AppMessageBoxAction = {
      label: string;
      value: string;
      description?: string;
      variant?: AppMessageBoxVariant;
};

export type AppMessageBoxState = {
      open: boolean;
      title: string;
      message?: string;
      variant?: AppMessageBoxVariant;
      actions: AppMessageBoxAction[];
      cancelText?: string;
      selectedValue?: string;
};

function getVariantClasses(variant: AppMessageBoxVariant = 'info') {
      switch (variant) {
            case 'danger':
                  return {
                        iconWrap: 'bg-rose-50 text-rose-700 ring-rose-200',
                        confirmButton: 'bg-rose-600 text-white hover:bg-rose-700',
                  };

            case 'warning':
                  return {
                        iconWrap: 'bg-amber-50 text-amber-700 ring-amber-200',
                        confirmButton: 'bg-amber-600 text-white hover:bg-amber-700',
                  };

            case 'success':
                  return {
                        iconWrap: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
                        confirmButton: 'bg-emerald-600 text-white hover:bg-emerald-700',
                  };

            default:
                  return {
                        iconWrap: 'bg-blue-50 text-blue-700 ring-blue-200',
                        confirmButton: 'bg-slate-900 text-white hover:bg-slate-800',
                  };
      }
}

function VariantIcon({ variant }: { variant: AppMessageBoxVariant }) {
      if (variant === 'danger' || variant === 'warning') {
            return <AlertTriangle className="h-5 w-5" />;
      }

      if (variant === 'success') {
            return <CheckCircle2 className="h-5 w-5" />;
      }

      return <Info className="h-5 w-5" />;
}

export function AppMessageBox({
      state,
      onCancel,
      onConfirm,
      isProcessing,
}: {
      state: AppMessageBoxState;
      onCancel: () => void;
      onConfirm: (value: string) => void;
      isProcessing?: boolean;
}) {
      if (!state.open) return null;

      const variant = state.variant ?? 'info';
      const classes = getVariantClasses(variant);
      const selectedValue = state.selectedValue ?? state.actions[0]?.value;

      return (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 px-4">
                  <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
                        <div className="flex items-start gap-4 border-b border-slate-100 px-6 py-5">
                              <div
                                    className={[
                                          'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1',
                                          classes.iconWrap,
                                    ].join(' ')}
                              >
                                    <VariantIcon variant={variant} />
                              </div>

                              <div className="min-w-0 flex-1">
                                    <h2 className="text-lg font-bold text-slate-950">
                                          {state.title}
                                    </h2>

                                    {state.message && (
                                          <p className="mt-1 text-sm leading-6 text-slate-600">
                                                {state.message}
                                          </p>
                                    )}
                              </div>

                              <button
                                    type="button"
                                    onClick={onCancel}
                                    disabled={isProcessing}
                                    className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                    <X className="h-5 w-5" />
                              </button>
                        </div>

                        <div className="space-y-3 px-6 py-5">
                              {state.actions.map((action) => {
                                    const checked = selectedValue === action.value;

                                    return (
                                          <label
                                                key={action.value}
                                                className={[
                                                      'flex cursor-pointer gap-3 rounded-2xl border px-4 py-3 transition',
                                                      checked
                                                            ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900/10'
                                                            : 'border-slate-200 hover:bg-slate-50',
                                                ].join(' ')}
                                          >
                                                <input
                                                      type="radio"
                                                      name="app-message-box-action"
                                                      checked={checked}
                                                      onChange={() => onConfirm(`__select__:${action.value}`)}
                                                      className="mt-1"
                                                      disabled={isProcessing}
                                                />

                                                <div>
                                                      <div className="text-sm font-semibold text-slate-900">
                                                            {action.label}
                                                      </div>

                                                      {action.description && (
                                                            <div className="mt-1 text-sm leading-5 text-slate-500">
                                                                  {action.description}
                                                            </div>
                                                      )}
                                                </div>
                                          </label>
                                    );
                              })}
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
                              <button
                                    type="button"
                                    onClick={onCancel}
                                    disabled={isProcessing}
                                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                    {state.cancelText ?? 'Hủy'}
                              </button>

                              <button
                                    type="button"
                                    onClick={() => onConfirm(selectedValue)}
                                    disabled={isProcessing || !selectedValue}
                                    className={[
                                          'rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
                                          classes.confirmButton,
                                    ].join(' ')}
                              >
                                    {isProcessing ? 'Đang xử lý...' : 'Xác nhận'}
                              </button>
                        </div>
                  </div>
            </div>
      );
}