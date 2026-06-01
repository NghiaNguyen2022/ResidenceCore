import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import {
  AlertCircle,
  Database,
  ListChecks,
  Map,
  Plus,
  Table,
} from "lucide-react";

type MockCard = {
  label: string;
  value: string | number;
  description: string;
};

type MockColumn = {
  label: string;
  key: string;
};

type ModulePlaceholderPageProps = {
  title: string;
  subtitle: string;
  moduleGroup: string;
  dataStatus: "mock" | "partial";
  checklistItems: string[];
  backendMapping: string[];
  mockCards?: MockCard[];
  mockColumns?: MockColumn[];
  mockRows?: Record<string, string | number>[];
};

export function ModulePlaceholderPage({
  title,
  subtitle,
  moduleGroup,
  dataStatus,
  checklistItems,
  backendMapping,
  mockCards = [],
  mockColumns = [],
  mockRows = [],
}: ModulePlaceholderPageProps) {
  const statusLabel =
    dataStatus === "partial" ? "UI đã dựng - chờ connect thêm" : "UI mock - chưa connect DB";

  const statusClass =
    dataStatus === "partial"
      ? "border-orange-200 bg-orange-50 text-orange-700"
      : "border-neutral-200 bg-neutral-50 text-neutral-700";

  return (
    <ResidenceCareLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">{moduleGroup}</p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-500">{subtitle}</p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            Thêm mới
          </button>
        </div>

        <div className={`rounded-2xl border p-4 ${statusClass}`}>
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">{statusLabel}</p>
              <p className="mt-1 text-sm">
                Màn hình này dùng để dựng UI, review nghiệp vụ và mapping checklist.
                Chưa ghi dữ liệu thật nếu chưa có API/backend tương ứng.
              </p>
            </div>
          </div>
        </div>

        {mockCards.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {mockCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm text-neutral-500">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-neutral-900">{card.value}</p>
                <p className="mt-1 text-xs text-neutral-500">{card.description}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-bold text-neutral-900">
                Mapping với checklist tổng
              </h2>
            </div>

            <div className="space-y-2">
              {checklistItems.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 rounded-xl bg-neutral-50 p-3 text-sm text-neutral-700"
                >
                  <span className="mt-0.5 text-blue-600">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-bold text-neutral-900">
                Mapping backend / data
              </h2>
            </div>

            <div className="space-y-2">
              {backendMapping.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 rounded-xl bg-neutral-50 p-3 text-sm text-neutral-700"
                >
                  <Map className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {mockColumns.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-neutral-200 px-5 py-4">
              <Table className="h-5 w-5 text-neutral-500" />
              <div>
                <h2 className="text-lg font-bold text-neutral-900">
                  UI danh sách mẫu
                </h2>
                <p className="text-sm text-neutral-500">
                  Dữ liệu dưới đây là mock để review UI, chưa ghi database.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px]">
                <thead className="bg-neutral-50">
                  <tr>
                    {mockColumns.map((column) => (
                      <th
                        key={column.key}
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500"
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100">
                  {mockRows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-neutral-50">
                      {mockColumns.map((column) => (
                        <td
                          key={column.key}
                          className="px-5 py-4 text-sm text-neutral-700"
                        >
                          {row[column.key] ?? "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ResidenceCareLayout>
  );
}