import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { residenceMediumStyle } from "@/components/shared/styleMedium";

interface DutyTemplate {
  id: number;
  templateCode: string;
  templateName: string;
  dutyType: string;
  startTime: string | null;
  endTime: string | null;
  minPersons: number;
  maxPersons: number;
  description: string | null;
  isActive: boolean;
}

interface TemplateSelectorProps {
  onSelect: (template: DutyTemplate) => void;
  onCancel: () => void;
}

function getDutyTypeLabel(type: string) {
  if (type === "daily") return "Hằng ngày";
  if (type === "weekly") return "Hằng tuần";
  return "Hằng tháng";
}

export default function TemplateSelector({ onSelect, onCancel }: TemplateSelectorProps) {
  const [dutyType, setDutyType] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedTemplate, setSelectedTemplate] = useState<DutyTemplate | null>(null);

  const { data: templates = [], isLoading } = trpc.duties.getTemplatesByType.useQuery({
    dutyType,
  });

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
    }
  };

  return (
    <div className={residenceMediumStyle.modalOverlay}>
      <div className={`${residenceMediumStyle.modalShell} max-w-2xl`}>
        <div className={residenceMediumStyle.modalHeader}>
          <div>
            <p className={residenceMediumStyle.modalEyebrow}>Mẫu công tác</p>
            <div className={residenceMediumStyle.modalTitle}>Chọn công tác mẫu</div>
            <p className={residenceMediumStyle.modalSubtitle}>
              Chọn một mẫu có sẵn để điền nhanh thông tin công tác.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-amber-50/70"
          >
            Đóng
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto p-5">
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-700">Loại công tác</div>
            <div className="flex flex-wrap gap-2 rounded-2xl border border-amber-100/80 bg-white/85 p-1.5 shadow-[0_8px_20px_rgba(120,53,15,0.045)]">
              {(["daily", "weekly", "monthly"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setDutyType(type);
                    setSelectedTemplate(null);
                  }}
                  className={[
                    "rounded-xl px-4 py-2 text-sm font-semibold transition",
                    dutyType === type
                      ? "bg-[#17335f] text-white shadow-sm"
                      : "text-slate-600 hover:bg-amber-50/70 hover:text-slate-900",
                  ].join(" ")}
                >
                  {getDutyTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold text-slate-700">Danh sách mẫu</div>
            {isLoading ? (
              <div className="rounded-2xl border border-dashed border-amber-100 bg-white/70 py-8 text-center text-sm text-slate-500">
                Đang tải...
              </div>
            ) : templates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-amber-100 bg-white/70 py-8 text-center text-sm text-slate-500">
                Không có công tác mẫu nào.
              </div>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-amber-100/80 bg-white/70 p-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplate(template)}
                    className={[
                      "w-full rounded-2xl border p-3 text-left transition",
                      selectedTemplate?.id === template.id
                        ? "border-[#17335f] bg-blue-50/70 shadow-sm"
                        : "border-slate-200 bg-white/85 hover:border-amber-100 hover:bg-amber-50/60",
                    ].join(" ")}
                  >
                    <div className="font-semibold text-[#17335f]">{template.templateName}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {template.startTime || "--:--"} - {template.endTime || "--:--"}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedTemplate && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="mb-3 text-sm font-semibold text-[#17335f]">Chi tiết mẫu</div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Mã</div>
                  <div className="mt-1 font-semibold text-slate-700">{selectedTemplate.templateCode}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Số người</div>
                  <div className="mt-1 font-semibold text-slate-700">
                    {selectedTemplate.minPersons} - {selectedTemplate.maxPersons}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Mô tả</div>
                  <div className="mt-1 text-slate-600">
                    {selectedTemplate.description || "Chưa có mô tả"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-amber-100/80 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-amber-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-amber-50/70"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSelect}
              disabled={!selectedTemplate}
              className="rounded-xl bg-[#17335f] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(23,51,95,0.16)] transition hover:bg-[#244878] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
            >
              Chọn mẫu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
