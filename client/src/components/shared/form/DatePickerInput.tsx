import * as React from "react";
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
      const ref = React.useRef<HTMLDivElement>(null);

      const selected = React.useMemo(() => parseYMD(value), [value]);
      const [month, setMonth] = React.useState<Date>(() => selected ?? new Date());

      // Reset month khi mở lại
      React.useEffect(() => {
            if (open) setMonth(selected ?? new Date());
      }, [open]);

      // Đóng khi click bên ngoài
      React.useEffect(() => {
            if (!open) return;
            function onPointerDown(e: PointerEvent) {
                  if (ref.current && !ref.current.contains(e.target as Node)) {
                        setOpen(false);
                  }
            }
            document.addEventListener("pointerdown", onPointerDown);
            return () => document.removeEventListener("pointerdown", onPointerDown);
      }, [open]);

      const handleSelect = (date: Date | undefined) => {
            if (date) onChange?.({ target: { value: toYMD(date) } });
            setOpen(false);
      };

      const disabledDays: any[] = [];
      const fromDate = parseYMD(min);
      const toDate   = parseYMD(max);
      if (fromDate) disabledDays.push({ before: fromDate });
      if (toDate)   disabledDays.push({ after: toDate });

      return (
            <div ref={ref} className="relative">
                  {/* Trigger button */}
                  <button
                        id={id}
                        type="button"
                        disabled={disabled}
                        aria-required={required}
                        onClick={() => setOpen((v) => !v)}
                        className={cn(
                              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
                              "ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                              "disabled:cursor-not-allowed disabled:opacity-50",
                              !selected && "text-muted-foreground",
                              className
                        )}
                  >
                        <span>{selected ? toDMY(selected) : placeholder}</span>
                        <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" />
                  </button>

                  {/* Calendar dropdown */}
                  {open && (
                        <div className="absolute left-0 top-full z-[9999] mt-1 rounded-lg border border-slate-200 bg-white p-3 shadow-2xl">
                              {/* Custom header với nav tháng + năm */}
                              <div className="mb-3 flex items-center justify-between gap-1">
                                    {/* Lùi 1 năm */}
                                    <button type="button" onClick={() => setMonth(d => new Date(d.getFullYear() - 1, d.getMonth(), 1))}
                                          className="h-8 w-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100">
                                          <ChevronsLeft className="h-4 w-4" />
                                    </button>
                                    {/* Lùi 1 tháng */}
                                    <button type="button" onClick={() => setMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                                          className="h-8 w-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100">
                                          <ChevronLeft className="h-4 w-4" />
                                    </button>

                                    <span className="flex-1 text-center text-sm font-semibold text-slate-800 select-none">
                                          {VI_MONTHS[month.getMonth()]} {month.getFullYear()}
                                    </span>

                                    {/* Tiến 1 tháng */}
                                    <button type="button" onClick={() => setMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                                          className="h-8 w-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100">
                                          <ChevronRight className="h-4 w-4" />
                                    </button>
                                    {/* Tiến 1 năm */}
                                    <button type="button" onClick={() => setMonth(d => new Date(d.getFullYear() + 1, d.getMonth(), 1))}
                                          className="h-8 w-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100">
                                          <ChevronsRight className="h-4 w-4" />
                                    </button>
                              </div>

                              <DayPicker
                                    mode="single"
                                    selected={selected}
                                    onSelect={handleSelect}
                                    month={month}
                                    onMonthChange={setMonth}
                                    hideNavigation
                                    showOutsideDays
                                    disabled={disabledDays.length ? disabledDays : undefined}
                                    formatters={{
                                          formatWeekdayName: (d) => VI_WEEKDAYS[d.getDay()],
                                    }}
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
                        </div>
                  )}
            </div>
      );
}
