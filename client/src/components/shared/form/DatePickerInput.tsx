import * as React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
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

                  {/* Calendar dropdown — không dùng Portal, absolute trong wrapper */}
                  {open && (
                        <div className="absolute left-0 top-full z-[9999] mt-1 rounded-lg border border-input bg-white p-3 shadow-2xl">
                              <DayPicker
                                    mode="single"
                                    selected={selected}
                                    onSelect={handleSelect}
                                    defaultMonth={selected ?? new Date()}
                                    showOutsideDays
                                    disabled={disabledDays.length ? disabledDays : undefined}
                                    formatters={{
                                          formatMonthCaption: (d) => `${VI_MONTHS[d.getMonth()]} ${d.getFullYear()}`,
                                          formatWeekdayName: (d) => VI_WEEKDAYS[d.getDay()],
                                    }}
                                    classNames={{
                                          root: "w-[252px]",
                                          months: "relative",
                                          month: "flex flex-col gap-3",
                                          month_caption: "flex h-8 items-center justify-center px-8",
                                          caption_label: "text-sm font-semibold text-slate-800 select-none",
                                          nav: "absolute top-0 inset-x-0 flex items-center justify-between",
                                          button_previous: cn(
                                                "h-8 w-8 flex items-center justify-center rounded-md",
                                                "border border-slate-200 bg-white text-slate-500",
                                                "hover:bg-slate-100 hover:text-slate-800",
                                                "disabled:pointer-events-none disabled:opacity-30"
                                          ),
                                          button_next: cn(
                                                "h-8 w-8 flex items-center justify-center rounded-md",
                                                "border border-slate-200 bg-white text-slate-500",
                                                "hover:bg-slate-100 hover:text-slate-800",
                                                "disabled:pointer-events-none disabled:opacity-30"
                                          ),
                                          weekdays: "flex",
                                          weekday: "w-9 text-center text-[0.75rem] font-medium text-slate-400 py-1",
                                          weeks: "flex flex-col gap-0.5 mt-1",
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
                                    }}
                                    components={{
                                          Chevron: ({ orientation }) =>
                                                orientation === "left"
                                                      ? <ChevronLeft className="h-4 w-4" />
                                                      : <ChevronRight className="h-4 w-4" />,
                                    }}
                              />
                        </div>
                  )}
            </div>
      );
}
