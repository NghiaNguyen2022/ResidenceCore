import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type TimePickerChangeEvent = {
      target: {
            value: string;
      };
};

interface TimePickerInputProps {
      id?: string;
      value?: string;
      onChange?: (event: TimePickerChangeEvent) => void;
      className?: string;
      required?: boolean;
      disabled?: boolean;
      placeholder?: string;
      minuteStep?: number;
      startHour?: number;
      endHour?: number;
}

function normalizeTime(value: string | undefined): string {
      if (!value) return "";
      const match = value.match(/^(\d{1,2}):(\d{2})/);
      if (!match) return "";
      const hour = Math.min(23, Math.max(0, Number(match[1])));
      const minute = Math.min(59, Math.max(0, Number(match[2])));
      if (Number.isNaN(hour) || Number.isNaN(minute)) return "";
      return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function buildTimeOptions(startHour: number, endHour: number, minuteStep: number): string[] {
      const safeStart = Math.min(23, Math.max(0, startHour));
      const safeEnd = Math.min(23, Math.max(safeStart, endHour));
      const safeStep = Math.min(60, Math.max(1, minuteStep));
      const options: string[] = [];

      for (let hour = safeStart; hour <= safeEnd; hour += 1) {
            for (let minute = 0; minute < 60; minute += safeStep) {
                  options.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
            }
      }

      return options;
}

/**
 * Shared time picker for ResidenceCore forms.
 *
 * It keeps the same onChange shape as normal inputs so existing form code can
 * replace <input type="time" /> with minimal changes, while giving users a
 * quick dropdown picker instead of a plain text-only field.
 */
export function TimePickerInput({
      id,
      value,
      onChange,
      className,
      required,
      disabled,
      placeholder = "Chọn giờ",
      minuteStep = 15,
      startHour = 5,
      endHour = 23,
}: TimePickerInputProps) {
      const [open, setOpen] = React.useState(false);
      const wrapperRef = React.useRef<HTMLDivElement>(null);
      const inputRef = React.useRef<HTMLInputElement>(null);
      const normalizedValue = normalizeTime(value);

      React.useEffect(() => {
            if (!open) return;

            function onPointerDown(event: PointerEvent) {
                  if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                        setOpen(false);
                  }
            }

            document.addEventListener("pointerdown", onPointerDown);
            return () => document.removeEventListener("pointerdown", onPointerDown);
      }, [open]);

      const options = React.useMemo(
            () => buildTimeOptions(startHour, endHour, minuteStep),
            [startHour, endHour, minuteStep],
      );

      const emitChange = (nextValue: string) => {
            onChange?.({ target: { value: normalizeTime(nextValue) } });
      };

      return (
            <div ref={wrapperRef} className="relative">
                  <div
                        className={cn(
                              "flex h-10 w-full items-center rounded-md border border-input bg-background text-sm",
                              "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background",
                              disabled && "cursor-not-allowed opacity-50",
                              className,
                        )}
                  >
                        <input
                              ref={inputRef}
                              id={id}
                              type="time"
                              value={normalizedValue}
                              onChange={(event) => emitChange(event.target.value)}
                              onFocus={() => setOpen(true)}
                              disabled={disabled}
                              required={required}
                              placeholder={placeholder}
                              className="flex-1 bg-transparent px-3 py-2 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                        />
                        <button
                              type="button"
                              disabled={disabled}
                              tabIndex={-1}
                              onClick={() => {
                                    setOpen((current) => !current);
                                    inputRef.current?.focus();
                              }}
                              className="flex h-full items-center px-2.5 text-muted-foreground hover:text-foreground disabled:pointer-events-none"
                              aria-label="Chọn giờ"
                        >
                              <Clock className="h-4 w-4" />
                        </button>
                  </div>

                  {open && (
                        <div className="absolute left-0 top-full z-[9999] mt-1 max-h-64 w-full min-w-[11rem] overflow-y-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-2xl">
                              {options.map((option) => (
                                    <button
                                          key={option}
                                          type="button"
                                          onClick={() => {
                                                emitChange(option);
                                                setOpen(false);
                                          }}
                                          className={cn(
                                                "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100",
                                                option === normalizedValue && "bg-blue-600 text-white hover:bg-blue-700",
                                          )}
                                    >
                                          <span>{option}</span>
                                          {option === normalizedValue && <span className="text-xs">Đã chọn</span>}
                                    </button>
                              ))}
                        </div>
                  )}
            </div>
      );
}
