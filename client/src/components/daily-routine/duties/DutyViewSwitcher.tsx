'use client';

type DutyViewMode = 'day' | 'week' | 'month';

type DutyViewSwitcherProps = {
      value: DutyViewMode;
      onChange: (value: DutyViewMode) => void;
};

const options: Array<{ value: DutyViewMode; label: string }> = [
      { value: 'day', label: 'Ngày' },
      { value: 'week', label: 'Tuần' },
      { value: 'month', label: 'Tháng' },
];

export function DutyViewSwitcher({ value, onChange }: DutyViewSwitcherProps) {
      return (
            <div className="inline-flex rounded-xl border border-amber-100 bg-white/80 p-1 shadow-[0_4px_12px_rgba(120,53,15,0.03)]">
                  {options.map((option) => (
                        <button
                              key={option.value}
                              type="button"
                              onClick={() => onChange(option.value)}
                              className={[
                                    'rounded-lg px-3 py-1.5 text-sm font-semibold transition',
                                    value === option.value
                                          ? 'bg-amber-100 text-amber-900'
                                          : 'text-slate-500 hover:bg-amber-50 hover:text-slate-800',
                              ].join(' ')}
                        >
                              {option.label}
                        </button>
                  ))}
            </div>
      );
}

export default DutyViewSwitcher;
