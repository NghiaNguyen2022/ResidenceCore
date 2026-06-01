import { ReactNode, useState } from 'react';
import { Settings } from 'lucide-react';

type CardTone = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'neutral';

type ConfigurableStatCardProps = {
  moduleKey: string;
  cardKey: string;
  label: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  tone?: CardTone;
  onOpenSettings?: (payload: {
    moduleKey: string;
    cardKey: string;
    label: string;
  }) => void;
};

const toneClasses: Record<CardTone, string> = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  red: 'bg-red-50 text-red-600',
  orange: 'bg-orange-50 text-orange-600',
  purple: 'bg-purple-50 text-purple-600',
  neutral: 'bg-neutral-100 text-neutral-600',
};

export function ConfigurableStatCard({
  moduleKey,
  cardKey,
  label,
  value,
  description,
  icon,
  tone = 'blue',
  onOpenSettings,
}: ConfigurableStatCardProps) {
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  const handleOpenSettings = () => {
    if (onOpenSettings) {
      onOpenSettings({
        moduleKey,
        cardKey,
        label,
      });
      return;
    }

    setShowPlaceholder(true);
  };

  return (
    <div className="relative rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <button
        type="button"
        onClick={handleOpenSettings}
        className="absolute right-3 top-3 rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
        title="Thiết lập card"
      >
        <Settings className="h-4 w-4" />
      </button>

      <div className="flex items-start justify-between gap-4 pr-8">
        <div>
          <p className="text-sm font-medium text-neutral-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{value}</p>
          {description && (
            <p className="mt-1 text-sm text-neutral-500">{description}</p>
          )}
        </div>

        {icon && (
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${toneClasses[tone]}`}
          >
            {icon}
          </div>
        )}
      </div>

      {showPlaceholder && (
        <div className="mt-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-3 text-sm text-neutral-600">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-neutral-800">
                Thiết lập card
              </p>
              <p className="mt-1">
                Module: <span className="font-mono">{moduleKey}</span>
              </p>
              <p>
                Card: <span className="font-mono">{cardKey}</span>
              </p>
              <p className="mt-2">
                Phase Setting sau này sẽ xử lý màu nền, màu số, định dạng số,
                số chữ số thập phân, ẩn/hiện card và thứ tự hiển thị.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPlaceholder(false)}
              className="rounded-md px-2 py-1 text-xs font-semibold text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-800"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}