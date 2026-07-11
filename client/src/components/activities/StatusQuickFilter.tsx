import { residenceMediumStyle } from '@/components/shared/styleMedium';

import type { ActivityStatus } from './types';

export function StatusQuickFilter({
      value,
      onChange,
}: {
      value: 'all' | ActivityStatus;
      onChange: (value: 'all' | ActivityStatus) => void;
}) {
      const items: Array<{ value: 'all' | ActivityStatus; label: string }> = [
            { value: 'all', label: 'Tất cả' },
            { value: 'scheduled', label: 'Dự kiến' },
            { value: 'in_progress', label: 'Đang diễn ra' },
            { value: 'completed', label: 'Đã diễn ra' },
      ];

      return (
            <div className={residenceMediumStyle.standardTabRail}>
                  <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-4">
                        {items.map((item) => {
                              const active = value === item.value;
                              return (
                                    <button
                                          key={item.value}
                                          type="button"
                                          onClick={() => onChange(item.value)}
                                          className={`rounded-2xl px-4 py-2.5 text-sm font-black transition ${active
                                                      ? 'bg-white text-amber-900 shadow-[0_10px_24px_rgba(120,53,15,0.10)] ring-1 ring-amber-100/80'
                                                      : 'text-slate-500 hover:bg-white/70 hover:text-slate-800'
                                                }`}
                                    >
                                          {item.label}
                                    </button>
                              );
                        })}
                  </div>
            </div>
      );
}
