'use client';

import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, RotateCcw, Settings, X } from 'lucide-react';

type DecimalPlaces = 'auto' | 0 | 1 | 2 | 3;

export type StatCardSettings = {
      backgroundColor?: string;
      textColor?: string;
      decimalPlaces?: DecimalPlaces;
};

type ConfigurableStatCardProps = {
      moduleKey: string;
      cardKey: string;
      label?: string;
      title?: string;
      value: number | string;
      description?: string;
      tone?: string;
      icon?: ReactNode;
      className?: string;
      defaultSettings?: StatCardSettings;
      onSettingsChange?: (
            moduleKey: string,
            cardKey: string,
            settings: StatCardSettings
      ) => void;
};

const BASE_SETTINGS: Required<StatCardSettings> = {
      backgroundColor: '#ffffff',
      textColor: '#334155',
      decimalPlaces: 'auto',
};

const BACKGROUND_PRESETS = [
      '#ffffff',
      '#f8fafc',
      '#eff6ff',
      '#f0fdf4',
      '#fff7ed',
      '#f5f3ff',
];

const TEXT_PRESETS = [
      '#334155',
      '#1d4ed8',
      '#15803d',
      '#c2410c',
      '#6d28d9',
      '#be185d',
];

function getStorageKey(moduleKey: string, cardKey: string) {
      return `residencecore:stat-card:${moduleKey}:${cardKey}`;
}

function isDecimalPlaces(value: unknown): value is DecimalPlaces {
      return value === 'auto' || value === 0 || value === 1 || value === 2 || value === 3;
}

function normalizeSettings(settings?: StatCardSettings): Required<StatCardSettings> {
      return {
            backgroundColor: settings?.backgroundColor || BASE_SETTINGS.backgroundColor,
            textColor: settings?.textColor || BASE_SETTINGS.textColor,
            decimalPlaces: isDecimalPlaces(settings?.decimalPlaces)
                  ? settings!.decimalPlaces!
                  : BASE_SETTINGS.decimalPlaces,
      };
}

function readSavedSettings(moduleKey: string, cardKey: string) {
      if (typeof window === 'undefined') return null;

      try {
            const raw = window.localStorage.getItem(getStorageKey(moduleKey, cardKey));
            if (!raw) return null;
            return normalizeSettings(JSON.parse(raw) as StatCardSettings);
      } catch {
            return null;
      }
}

function saveSettings(moduleKey: string, cardKey: string, settings: StatCardSettings) {
      if (typeof window === 'undefined') return;

      try {
            window.localStorage.setItem(
                  getStorageKey(moduleKey, cardKey),
                  JSON.stringify(settings)
            );
      } catch {
            // Không chặn thao tác nếu trình duyệt không cho lưu localStorage.
      }
}

function formatValue(value: number | string, decimalPlaces: DecimalPlaces) {
      if (typeof value !== 'number') return value;

      if (decimalPlaces === 'auto') {
            return new Intl.NumberFormat('vi-VN').format(value);
      }

      return new Intl.NumberFormat('vi-VN', {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
      }).format(value);
}

function hexToRgba(hex: string, alpha: number) {
      const normalized = hex.replace('#', '').trim();
      const full = normalized.length === 3
            ? normalized.split('').map((char) => `${char}${char}`).join('')
            : normalized;

      if (full.length !== 6) return `rgba(51, 65, 85, ${alpha})`;

      const red = parseInt(full.slice(0, 2), 16);
      const green = parseInt(full.slice(2, 4), 16);
      const blue = parseInt(full.slice(4, 6), 16);

      if ([red, green, blue].some((item) => Number.isNaN(item))) {
            return `rgba(51, 65, 85, ${alpha})`;
      }

      return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function ColorDot({
      color,
      selected,
      onClick,
}: {
      color: string;
      selected: boolean;
      onClick: () => void;
}) {
      return (
            <button
                  type="button"
                  onClick={onClick}
                  className={`relative h-6 w-6 rounded-full border transition hover:scale-105 ${
                        selected ? 'border-slate-900 ring-2 ring-slate-200' : 'border-slate-200'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={color}
                  title={color}
            >
                  {selected ? (
                        <span className="absolute inset-0 flex items-center justify-center">
                              <Check className="h-3 w-3 text-slate-900 drop-shadow-sm" />
                        </span>
                  ) : null}
            </button>
      );
}

export function ConfigurableStatCard({
      moduleKey,
      cardKey,
      label,
      title,
      value,
      description,
      icon,
      className = '',
      defaultSettings,
      onSettingsChange,
}: ConfigurableStatCardProps) {
      const [isSettingsOpen, setIsSettingsOpen] = useState(false);
      const wrapperRef = useRef<HTMLDivElement | null>(null);

      const initialSettings = useMemo(
            () => normalizeSettings(defaultSettings),
            [defaultSettings]
      );

      const [settings, setSettings] = useState<Required<StatCardSettings>>(initialSettings);

      useEffect(() => {
            const savedSettings = readSavedSettings(moduleKey, cardKey);
            setSettings(savedSettings || normalizeSettings(defaultSettings));
            // Chỉ load lại khi đổi đúng card.
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [moduleKey, cardKey]);

      useEffect(() => {
            function handleClickOutside(event: MouseEvent) {
                  if (!wrapperRef.current) return;
                  if (!wrapperRef.current.contains(event.target as Node)) {
                        setIsSettingsOpen(false);
                  }
            }

            function handleEscape(event: KeyboardEvent) {
                  if (event.key === 'Escape') setIsSettingsOpen(false);
            }

            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);

            return () => {
                  document.removeEventListener('mousedown', handleClickOutside);
                  document.removeEventListener('keydown', handleEscape);
            };
      }, []);

      const applySettings = (nextSettings: Required<StatCardSettings>) => {
            setSettings(nextSettings);
            saveSettings(moduleKey, cardKey, nextSettings);
            onSettingsChange?.(moduleKey, cardKey, nextSettings);
      };

      const resetSettings = () => applySettings(initialSettings);

      const displayLabel = label || title || '';
      const displayValue = formatValue(value, settings.decimalPlaces);
      const accentSoft = hexToRgba(settings.textColor, 0.09);
      const accentLine = hexToRgba(settings.textColor, 0.22);
      const mutedText = hexToRgba(settings.textColor, 0.68);
      const borderColor = hexToRgba(settings.textColor, 0.11);

      return (
            <div ref={wrapperRef} className={`relative ${className}`}>
                  <div
                        className="group relative min-h-[136px] overflow-hidden rounded-2xl border px-4 py-4 shadow-[0_10px_26px_rgba(15,23,42,0.075),0_1px_0_rgba(255,255,255,0.75)_inset] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.11),0_1px_0_rgba(255,255,255,0.8)_inset]"
                        style={{
                              backgroundColor: settings.backgroundColor,
                              borderColor,
                              color: settings.textColor,
                        }}
                  >
                        <div
                              className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full blur-2xl"
                              style={{ backgroundColor: accentSoft }}
                        />
                        <div
                              className="pointer-events-none absolute bottom-0 left-4 right-4 h-px"
                              style={{ backgroundColor: accentLine }}
                        />

                        <div className="relative flex h-full min-h-[104px] flex-col justify-between gap-3">
                              <div className="flex items-start justify-between gap-3">
                                    <p className="line-clamp-1 text-[12px] font-semibold tracking-[0.02em]" style={{ color: mutedText }}>
                                          {displayLabel}
                                    </p>

                                    <div className="flex shrink-0 items-start gap-2">
                                          {icon ? (
                                                <div
                                                      className="flex h-9 w-9 items-center justify-center rounded-xl shadow-sm ring-1 ring-white/50 [&_svg]:h-5 [&_svg]:w-5"
                                                      style={{
                                                            backgroundColor: accentSoft,
                                                            color: settings.textColor,
                                                      }}
                                                >
                                                      {icon}
                                                </div>
                                          ) : null}

                                          <button
                                                type="button"
                                                onClick={() => setIsSettingsOpen((current) => !current)}
                                                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/70 bg-white/80 text-slate-500 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-800"
                                                title="Thiết lập hiển thị card"
                                                aria-label="Thiết lập hiển thị card"
                                          >
                                                <Settings className="h-4 w-4" />
                                          </button>
                                    </div>
                              </div>

                              <div>
                                    <p className="text-[2.05rem] font-bold leading-none tracking-[-0.04em] md:text-[2.2rem]">
                                          {displayValue}
                                    </p>

                                    {description ? (
                                          <p className="mt-2 line-clamp-2 max-w-[13.5rem] text-[13px] leading-5" style={{ color: mutedText }}>
                                                {description}
                                          </p>
                                    ) : null}
                              </div>
                        </div>
                  </div>

                  {isSettingsOpen ? (
                        <div className="absolute right-1 top-10 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
                              <div className="absolute -top-1.5 right-5 h-3 w-3 rotate-45 border-l border-t border-slate-200 bg-white" />

                              <div className="relative mb-3 flex items-center justify-between gap-3">
                                    <div>
                                          <h3 className="text-sm font-semibold text-slate-900">
                                                Thiết lập card
                                          </h3>
                                          <p className="mt-0.5 text-[11px] text-slate-500">
                                                Màu sắc và định dạng số.
                                          </p>
                                    </div>

                                    <button
                                          type="button"
                                          onClick={() => setIsSettingsOpen(false)}
                                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                          title="Đóng"
                                          aria-label="Đóng"
                                    >
                                          <X className="h-4 w-4" />
                                    </button>
                              </div>

                              <div className="space-y-3">
                                    <section>
                                          <div className="mb-1.5 flex items-center justify-between gap-3">
                                                <label className="text-xs font-medium text-slate-600">
                                                      Màu nền
                                                </label>
                                                <span className="text-[10px] uppercase text-slate-400">
                                                      {settings.backgroundColor}
                                                </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                                <input
                                                      type="color"
                                                      value={settings.backgroundColor}
                                                      onChange={(event) =>
                                                            applySettings({
                                                                  ...settings,
                                                                  backgroundColor: event.target.value,
                                                            })
                                                      }
                                                      className="h-8 w-9 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                                                />
                                                <div className="flex flex-wrap gap-1.5">
                                                      {BACKGROUND_PRESETS.map((color) => (
                                                            <ColorDot
                                                                  key={color}
                                                                  color={color}
                                                                  selected={settings.backgroundColor.toLowerCase() === color}
                                                                  onClick={() =>
                                                                        applySettings({
                                                                              ...settings,
                                                                              backgroundColor: color,
                                                                        })
                                                                  }
                                                            />
                                                      ))}
                                                </div>
                                          </div>
                                    </section>

                                    <section>
                                          <div className="mb-1.5 flex items-center justify-between gap-3">
                                                <label className="text-xs font-medium text-slate-600">
                                                      Màu chữ
                                                </label>
                                                <span className="text-[10px] uppercase text-slate-400">
                                                      {settings.textColor}
                                                </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                                <input
                                                      type="color"
                                                      value={settings.textColor}
                                                      onChange={(event) =>
                                                            applySettings({
                                                                  ...settings,
                                                                  textColor: event.target.value,
                                                            })
                                                      }
                                                      className="h-8 w-9 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                                                />
                                                <div className="flex flex-wrap gap-1.5">
                                                      {TEXT_PRESETS.map((color) => (
                                                            <ColorDot
                                                                  key={color}
                                                                  color={color}
                                                                  selected={settings.textColor.toLowerCase() === color}
                                                                  onClick={() =>
                                                                        applySettings({
                                                                              ...settings,
                                                                              textColor: color,
                                                                        })
                                                                  }
                                                            />
                                                      ))}
                                                </div>
                                          </div>
                                    </section>

                                    <section>
                                          <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                                Thập phân
                                          </label>
                                          <div className="relative">
                                                <select
                                                      value={String(settings.decimalPlaces)}
                                                      onChange={(event) => {
                                                            const nextValue = event.target.value;
                                                            applySettings({
                                                                  ...settings,
                                                                  decimalPlaces:
                                                                        nextValue === 'auto'
                                                                              ? 'auto'
                                                                              : (Number(nextValue) as DecimalPlaces),
                                                            });
                                                      }}
                                                      className="h-8 w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 pr-8 text-xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                                >
                                                      <option value="auto">Tự động</option>
                                                      <option value="0">0 chữ số</option>
                                                      <option value="1">1 chữ số</option>
                                                      <option value="2">2 chữ số</option>
                                                      <option value="3">3 chữ số</option>
                                                </select>
                                                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                          </div>
                                    </section>
                              </div>

                              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                                    <button
                                          type="button"
                                          onClick={resetSettings}
                                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                                    >
                                          <RotateCcw className="h-3.5 w-3.5" />
                                          Mặc định
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => setIsSettingsOpen(false)}
                                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                                    >
                                          <Check className="h-3.5 w-3.5" />
                                          Xong
                                    </button>
                              </div>
                        </div>
                  ) : null}
            </div>
      );
}

export default ConfigurableStatCard;
