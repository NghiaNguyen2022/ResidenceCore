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
            <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
                  {options.map((option) => (
                        <button
                              key={option.value}
                              type="button"
                              onClick={() => onChange(option.value)}
                              className={[
                                    'rounded-xl px-3 py-2 text-sm font-semibold transition',
                                    value === option.value
                                          ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-100'
                                          : 'text-slate-500 hover:text-slate-800',
                              ].join(' ')}
                        >
                              {option.label}
                        </button>
                  ))}
            </div>
      );
}

export default DutyViewSwitcher;
