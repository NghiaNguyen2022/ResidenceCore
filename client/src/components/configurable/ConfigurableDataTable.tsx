import { ReactNode, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Eye,
  EyeOff,
  Settings,
} from 'lucide-react';

export type SortDirection = 'asc' | 'desc';

export type ConfigurableColumn<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  defaultVisible?: boolean;
  className?: string;
  headerClassName?: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number | Date | null | undefined;
};

type ConfigurableDataTableProps<T> = {
  moduleKey: string;
  tableKey: string;
  columns: ConfigurableColumn<T>[];
  data: T[];
  getRowKey: (row: T, index: number) => string | number;
  emptyTitle?: string;
  emptyDescription?: string;
  isLoading?: boolean;
  loadingText?: string;
};

function normalizeSortValue(value: unknown): string | number {
  if (value === null || value === undefined) return '';

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'number') {
    return value;
  }

  return String(value).toLowerCase();
}

export function ConfigurableDataTable<T>({
  moduleKey,
  tableKey,
  columns,
  data,
  getRowKey,
  emptyTitle = 'Không có dữ liệu',
  emptyDescription = 'Chưa có dữ liệu phù hợp để hiển thị.',
  isLoading = false,
  loadingText = 'Đang tải dữ liệu...',
}: ConfigurableDataTableProps<T>) {
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(
    columns
      .filter((column) => column.defaultVisible !== false)
      .map((column) => column.key)
  );
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: SortDirection;
  } | null>(null);

  const visibleColumns = useMemo(() => {
    return columns.filter((column) => visibleColumnKeys.includes(column.key));
  }, [columns, visibleColumnKeys]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const column = columns.find((item) => item.key === sortConfig.key);
    if (!column || !column.sortable) return data;

    return [...data].sort((a, b) => {
      const aValue = normalizeSortValue(
        column.sortValue ? column.sortValue(a) : ''
      );
      const bValue = normalizeSortValue(
        column.sortValue ? column.sortValue(b) : ''
      );

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      return sortConfig.direction === 'asc'
        ? String(aValue).localeCompare(String(bValue), 'vi')
        : String(bValue).localeCompare(String(aValue), 'vi');
    });
  }, [columns, data, sortConfig]);

  const handleToggleColumn = (key: string) => {
    setVisibleColumnKeys((current) => {
      if (current.includes(key)) {
        if (current.length === 1) return current;
        return current.filter((item) => item !== key);
      }

      return [...current, key];
    });
  };

  const handleSort = (column: ConfigurableColumn<T>) => {
    if (!column.sortable) return;

    setSortConfig((current) => {
      if (!current || current.key !== column.key) {
        return {
          key: column.key,
          direction: 'asc',
        };
      }

      if (current.direction === 'asc') {
        return {
          key: column.key,
          direction: 'desc',
        };
      }

      return null;
    });
  };

  const getSortIcon = (column: ConfigurableColumn<T>) => {
    if (!column.sortable) return null;

    if (!sortConfig || sortConfig.key !== column.key) {
      return <ChevronsUpDown className="h-3.5 w-3.5 text-neutral-400" />;
    }

    if (sortConfig.direction === 'asc') {
      return <ChevronUp className="h-3.5 w-3.5 text-blue-600" />;
    }

    return <ChevronDown className="h-3.5 w-3.5 text-blue-600" />;
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-neutral-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            Cấu hình lưới
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Module: <span className="font-mono">{moduleKey}</span> · Table:{' '}
            <span className="font-mono">{tableKey}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowColumnSettings((value) => !value)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
        >
          <Settings className="h-4 w-4" />
          Cấu hình cột
        </button>
      </div>

      {showColumnSettings && (
        <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-4">
          <div className="mb-3">
            <p className="text-sm font-semibold text-neutral-800">
              Ẩn / hiện cột
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Hiện tại chỉ lưu tạm trên màn hình. Phase Setting sau này sẽ lưu
              cấu hình theo user/role.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {columns.map((column) => {
              const isVisible = visibleColumnKeys.includes(column.key);

              return (
                <button
                  key={column.key}
                  type="button"
                  onClick={() => handleToggleColumn(column.key)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    isVisible
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-neutral-200 bg-white text-neutral-500'
                  }`}
                >
                  {isVisible ? (
                    <Eye className="h-3.5 w-3.5" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5" />
                  )}
                  {column.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="px-5 py-12 text-center text-sm text-neutral-500">
            {loadingText}
          </div>
        ) : data.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-neutral-800">
              {emptyTitle}
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              {emptyDescription}
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-5 py-3 font-semibold ${
                      column.sortable ? 'cursor-pointer select-none' : ''
                    } ${column.headerClassName || ''}`}
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{column.label}</span>
                      {getSortIcon(column)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100">
              {sortedData.map((row, index) => (
                <tr
                  key={getRowKey(row, index)}
                  className="transition hover:bg-neutral-50"
                >
                  {visibleColumns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-5 py-4 align-middle text-neutral-700 ${
                        column.className || ''
                      }`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}