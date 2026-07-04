import * as React from "react";
import { createPortal } from "react-dom";
import { CalendarIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

// ─── helpers ─────────────────────────────────────────────────────────────────

function parseYMD(s: string | undefined): Date | undefined {
      if (!s) return undefined;
      const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (!m) return undefined;
      const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      return isNaN(d.getTime()) ? undefined : d;
}

function toYMD(d: Date): string {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toDMY(d: Date): string {
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

/**
 * Xử lý chuỗi digits thô → trả về { formatted, date }
 * - Auto-pad: nếu chữ số đầu tiên của ngày > 3 (hoặc tháng > 1) → tự thêm 0 phía trước
 * - Clamp: tháng tối đa 12, ngày tối đa 31
 */
function processDigits(raw: string): { digits: string; formatted: string; date?: Date } {
      let d = raw.replace(/\D/g, "");

      // Auto-pad ngày nếu chữ số đầu > 3
      if (d.length >= 1 && parseInt(d[0]) > 3) d = "0" + d;

      // Clamp ngày ≤ 31
      if (d.length >= 2) {
            const dd = parseInt(d.slice(0, 2));
            if (dd > 31) d = "3" + "1" + d.slice(2);
            if (dd === 0) d = "0" + d.slice(1); // giữ "0" chờ digit thứ 2
      }

      // Auto-pad tháng nếu chữ số đầu > 1
      if (d.length >= 3 && parseInt(d[2]) > 1) d = d.slice(0, 2) + "0" + d.slice(2);

      // Clamp tháng ≤ 12
      if (d.length >= 4) {
            const mm = parseInt(d.slice(2, 4));
            if (mm > 12) d = d.slice(0, 2) + "1" + "2" + d.slice(4);
            if (mm === 0) d = d.slice(0, 3) + d.slice(3); // giữ "0" chờ
      }

      d = d.slice(0, 8);

      // Format: dd/mm/yyyy
      let formatted = d.slice(0, 2);
      if (d.length > 2) formatted += "/" + d.slice(2, 4);
      if (d.length > 4) formatted += "/" + d.slice(4, 8);

      // Parse thành Date nếu đủ 8 chữ số
      let date: Date | undefined;
      if (d.length === 8) {
            const dd = parseInt(d.slice(0, 2));
            const mm = parseInt(d.slice(2, 4));
            const yyyy = parseInt(d.slice(4, 8));
            if (mm >= 1 && mm <= 12 && dd >= 1 && yyyy >= 1000) {
                  const candidate = new Date(yyyy, mm - 1, dd);
                  if (candidate.getDate() === dd && candidate.getMonth() === mm - 1)
                        date = candidate;
            }
      }

      return { digits: d, formatted, date };
}

const VI_MONTHS = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];
const VI_WEEKDAYS = ["CN","T2","T3","T4","T5","T6","T7"];

// ─── component ───────────────────────────────────────────────────────────────

interface DatePickerInputProps {
      id?: string;
      value?: string;
      onChange?: (e: { target: { value: string } }) => void;
      className?: string;
      required?: boolean;
      disabled?: boolean;
      placeholder?: string;
      min?: string;
      max?: string;
}

export function DatePickerInput({
      id,
      value,
      onChange,
      className,
      required,
      disabled,
      placeholder = "dd/mm/yyyy",
      min,
      max,
}: DatePickerInputProps) {
      const [open, setOpen] = React.useState(false);
      const [inputText, setInputText] = React.useState(() => {
            const d = parseYMD(value);
            return d ? toDMY(d) : "";
      });
      const wrapperRef = React.useRef<HTMLDivElement>(null);
      const dropdownRef = React.useRef<HTMLDivElement>(null);
      const inputRef = React.useRef<HTMLInputElement>(null);
      const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({});

      const updateDropdownPosition = React.useCallback(() => {
            const anchor = wrapperRef.current;
            if (!anchor) return;

            const rect = anchor.getBoundingClientRect();
            const dropdownWidth = 292;
            const dropdownHeight = 360;
            const viewportGap = 12;
            const spaceBelow = window.innerHeight - rect.bottom;
            const shouldOpenUp = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

            const left = Math.min(
                  Math.max(viewportGap, rect.left),
                  Math.max(viewportGap, window.innerWidth - dropdownWidth - viewportGap)
            );

            const top = shouldOpenUp
                  ? Math.max(viewportGap, rect.top - dropdownHeight - 6)
                  : Math.min(rect.bottom + 6, window.innerHeight - viewportGap);

            setDropdownStyle({
                  position: "fixed",
                  top,
                  left,
                  width: dropdownWidth,
                  zIndex: 100000,
            });
      }, []);

      // Sync khi value thay đổi từ bên ngoài (không phải do user đang gõ)
      const lastEmitted = React.useRef(value);
      React.useEffect(() => {
            if (value !== lastEmitted.current) {
                  const d = parseYMD(value);
                  setInputText(d ? toDMY(d) : "");
                  lastEmitted.current = value;
            }
      }, [value]);

      // Đóng calendar khi click ngoài, kể cả dropdown đang render qua portal.
      React.useEffect(() => {
            if (!open) return;

            updateDropdownPosition();

            function onPointerDown(e: PointerEvent) {
                  const target = e.target as Node;
                  if (wrapperRef.current?.contains(target)) return;
                  if (dropdownRef.current?.contains(target)) return;
                  setOpen(false);
            }

            function onViewportChange() {
                  updateDropdownPosition();
            }

            document.addEventListener("pointerdown", onPointerDown);
            window.addEventListener("resize", onViewportChange);
            window.addEventListener("scroll", onViewportChange, true);

            return () => {
                  document.removeEventListener("pointerdown", onPointerDown);
                  window.removeEventListener("resize", onViewportChange);
                  window.removeEventListener("scroll", onViewportChange, true);
            };
      }, [open, updateDropdownPosition]);

      // Chọn từ calendar
      const handleCalendarSelect = (date: Date | undefined) => {
            if (date) {
                  const ymd = toYMD(date);
                  setInputText(toDMY(date));
                  lastEmitted.current = ymd;
                  onChange?.({ target: { value: ymd } });
            }
            setOpen(false);
      };

      // User gõ trực tiếp
      const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { formatted, date } = processDigits(e.target.value);
            setInputText(formatted);
            if (date) {
                  const ymd = toYMD(date);
                  lastEmitted.current = ymd;
                  onChange?.({ target: { value: ymd } });
            }
      };

      // Month state cho calendar
      const selected = React.useMemo(() => parseYMD(value), [value]);
      const [month, setMonth] = React.useState<Date>(() => selected ?? new Date());
      React.useEffect(() => {
            if (open) setMonth(selected ?? new Date());
      }, [open]);

      const disabledDays: any[] = [];
      const fromDate = parseYMD(min);
      const toDate   = parseYMD(max);
      if (fromDate) disabledDays.push({ before: fromDate });
      if (toDate)   disabledDays.push({ after: toDate });

      return (
            <div ref={wrapperRef} className="relative">
                  {/* Input row: text field + calendar icon */}
                  <div className={cn(
                        "flex h-10 w-full items-center rounded-md border border-input bg-background text-sm",
                        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background",
                        disabled && "cursor-not-allowed opacity-50",
                        className
                  )}>
                        <input
                              ref={inputRef}
                              id={id}
                              type="text"
                              inputMode="numeric"
                              value={inputText}
                              onChange={handleTextChange}
                              disabled={disabled}
                              required={required}
                              placeholder={placeholder}
                              maxLength={10}
                              className="flex-1 bg-transparent px-3 py-2 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                        />
                        <button
                              type="button"
                              disabled={disabled}
                              tabIndex={-1}
                              onClick={() => { setOpen(v => !v); inputRef.current?.focus(); }}
                              className="flex h-full items-center px-2.5 text-muted-foreground hover:text-foreground disabled:pointer-events-none"
                        >
                              <CalendarIcon className="h-4 w-4" />
                        </button>
                  </div>

                  {/* Calendar dropdown render bằng portal để không bị cắt bởi modal/card có overflow hidden. */}
                  {open && createPortal(
                        <div
                              ref={dropdownRef}
                              style={dropdownStyle}
                              className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xl"
                        >
                              {/* Header: năm + tháng */}
                              <div className="mb-3 flex items-center justify-between gap-1">
                                    <button type="button" tabIndex={-1}
                                          onClick={() => setMonth(d => new Date(d.getFullYear() - 1, d.getMonth(), 1))}
                                          className="h-8 w-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100">
                                          <ChevronsLeft className="h-4 w-4" />
                                    </button>
                                    <button type="button" tabIndex={-1}
                                          onClick={() => setMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                                          className="h-8 w-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100">
                                          <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="flex-1 text-center text-sm font-semibold text-slate-800 select-none">
                                          {VI_MONTHS[month.getMonth()]} {month.getFullYear()}
                                    </span>
                                    <button type="button" tabIndex={-1}
                                          onClick={() => setMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                                          className="h-8 w-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100">
                                          <ChevronRight className="h-4 w-4" />
                                    </button>
                                    <button type="button" tabIndex={-1}
                                          onClick={() => setMonth(d => new Date(d.getFullYear() + 1, d.getMonth(), 1))}
                                          className="h-8 w-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100">
                                          <ChevronsRight className="h-4 w-4" />
                                    </button>
                              </div>

                              <DayPicker
                                    mode="single"
                                    selected={selected}
                                    onSelect={handleCalendarSelect}
                                    month={month}
                                    onMonthChange={setMonth}
                                    hideNavigation
                                    showOutsideDays
                                    disabled={disabledDays.length ? disabledDays : undefined}
                                    formatters={{ formatWeekdayName: (d) => VI_WEEKDAYS[d.getDay()] }}
                                    classNames={{
                                          root: "w-[252px]",
                                          months: "",
                                          month: "flex flex-col gap-1",
                                          month_caption: "hidden",
                                          weekdays: "flex",
                                          weekday: "w-9 text-center text-[0.75rem] font-medium text-slate-400 py-1",
                                          weeks: "flex flex-col gap-0.5",
                                          week: "flex",
                                          day: "w-9 h-9 flex items-center justify-center p-0",
                                          day_button: cn(
                                                "h-8 w-8 rounded-md text-sm text-slate-700",
                                                "hover:bg-slate-100 hover:text-slate-900",
                                                "focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          ),
                                          selected: "[&>button]:!bg-blue-600 [&>button]:!text-white [&>button]:hover:!bg-blue-700",
                                          today: "[&>button]:border [&>button]:border-blue-400 [&>button]:font-bold [&>button]:text-blue-600",
                                          outside: "[&>button]:text-slate-300",
                                          disabled: "[&>button]:opacity-30 [&>button]:pointer-events-none",
                                          hidden: "invisible",
                                          nav: "hidden",
                                    }}
                              />
                        </div>,
                        document.body
                  )}
            </div>
      );
}
