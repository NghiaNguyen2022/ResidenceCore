import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import TemplateSelector from "./TemplateSelector";
import { DEFAULT_TIME } from "@/lib/formDefaults";

interface ChecklistItem {
  id?: number;
  itemOrder: number;
  checklistItem: string;
  isRequired: boolean;
  description?: string | null;
  estimatedTimeMinutes?: number | null;
}

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

interface DutyConfigFormProps {
  duty?: any;
  onSave: () => void;
  onCancel: () => void;
}

const formLabelClass = "text-sm font-semibold text-slate-700";
const formInputClass =
  "h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm text-slate-800 shadow-[0_8px_18px_rgba(120,53,15,0.045)] outline-none transition placeholder:text-slate-400 focus:border-amber-200 focus:ring-2 focus:ring-amber-100 disabled:bg-slate-50 disabled:text-slate-400";
const formTextareaClass =
  "min-h-24 w-full rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm text-slate-800 shadow-[0_8px_18px_rgba(120,53,15,0.045)] outline-none transition placeholder:text-slate-400 focus:border-amber-200 focus:ring-2 focus:ring-amber-100";
const secondaryButtonClass =
  "rounded-xl border border-amber-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-amber-50/70 disabled:cursor-not-allowed disabled:opacity-60";
const primaryButtonClass =
  "rounded-xl bg-[#17335f] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(23,51,95,0.16)] transition hover:bg-[#244878] disabled:cursor-not-allowed disabled:opacity-60";

export default function DutyConfigForm({ duty, onSave, onCancel }: DutyConfigFormProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "checklist">("basic");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState<ChecklistItem>({
    itemOrder: 0,
    checklistItem: "",
    isRequired: true,
  });

  const [formData, setFormData] = useState({
    dutyCode: "",
    dutyName: "",
    description: "",
    dutyType: "daily" as "daily" | "weekly" | "monthly",
    startTime: DEFAULT_TIME,
    endTime: DEFAULT_TIME,
    minPersons: 1,
    maxPersons: 5,
    frequency: "daily" as "daily" | "weekly" | "monthly",
    dayOfWeek: 0,
    requiresStudyScheduleCheck: true,
  });

  const getChecklistQuery = trpc.duties.getChecklist.useQuery(
    { dutyConfigId: duty?.id || 0 },
    { enabled: !!duty?.id }
  );
  const createConfigMutation = trpc.duties.createConfig.useMutation();
  const updateConfigMutation = trpc.duties.updateConfig.useMutation();
  const addChecklistItemMutation = trpc.duties.addChecklistItem.useMutation();
  const updateChecklistItemMutation = trpc.duties.updateChecklistItem.useMutation();
  const deleteChecklistItemMutation = trpc.duties.deleteChecklistItem.useMutation();

  useEffect(() => {
    if (duty) {
      setFormData({
        dutyCode: duty.dutyCode,
        dutyName: duty.dutyName,
        description: duty.description || "",
        dutyType: duty.dutyType,
        startTime: duty.startTime || DEFAULT_TIME,
        endTime: duty.endTime || DEFAULT_TIME,
        minPersons: duty.minPersons,
        maxPersons: duty.maxPersons,
        frequency: duty.frequency,
        dayOfWeek: duty.dayOfWeek || 0,
        requiresStudyScheduleCheck: duty.requiresStudyScheduleCheck,
      });
    } else {
      setChecklistItems([]);
      setFormData({
        dutyCode: "",
        dutyName: "",
        description: "",
        dutyType: "daily",
        startTime: DEFAULT_TIME,
        endTime: DEFAULT_TIME,
        minPersons: 1,
        maxPersons: 5,
        frequency: "daily",
        dayOfWeek: 0,
        requiresStudyScheduleCheck: true,
      });
    }
  }, [duty]);

  useEffect(() => {
    if (getChecklistQuery.data) {
      setChecklistItems(getChecklistQuery.data);
    }
  }, [getChecklistQuery.data]);

  const handleSelectTemplate = (template: DutyTemplate) => {
    setFormData({
      ...formData,
      dutyCode: `${template.templateCode}_${Date.now()}`,
      dutyName: template.templateName,
      description: template.description || "",
      startTime: template.startTime || DEFAULT_TIME,
      endTime: template.endTime || DEFAULT_TIME,
      minPersons: template.minPersons,
      maxPersons: template.maxPersons,
      dutyType: template.dutyType as "daily" | "weekly" | "monthly",
      frequency: template.dutyType as "daily" | "weekly" | "monthly",
    });
    setShowTemplateSelector(false);
  };

  const persistChecklistItems = async (dutyConfigId: number) => {
    const originalItems = (getChecklistQuery.data || []) as ChecklistItem[];
    const originalIds = originalItems
      .map((item) => item.id)
      .filter((id): id is number => Boolean(id));

    const currentIds = checklistItems
      .map((item) => item.id)
      .filter((id): id is number => Boolean(id));

    const deletedIds = originalIds.filter((id) => !currentIds.includes(id));

    for (const id of deletedIds) {
      await deleteChecklistItemMutation.mutateAsync({ id });
    }

    for (let index = 0; index < checklistItems.length; index += 1) {
      const item = checklistItems[index];
      const payload = {
        checklistItem: item.checklistItem.trim(),
        description: item.description || undefined,
        isRequired: item.isRequired,
        estimatedTimeMinutes: item.estimatedTimeMinutes ?? undefined,
      };

      if (!payload.checklistItem) continue;

      if (item.id) {
        await updateChecklistItemMutation.mutateAsync({
          id: item.id,
          ...payload,
        });
      } else {
        await addChecklistItemMutation.mutateAsync({
          dutyConfigId,
          itemOrder: index + 1,
          ...payload,
        });
      }
    }
  };

  const getDutyConfigIdFromResult = (result: any) => {
    const rawId =
      result?.id ??
      result?.dutyConfigId ??
      result?.insertId ??
      result?.data?.id ??
      result?.data?.dutyConfigId ??
      result?.data?.insertId ??
      result?.result?.id ??
      result?.result?.insertId ??
      result?.[0]?.id ??
      result?.[0]?.insertId;

    const parsedId = Number(rawId);

    return Number.isFinite(parsedId) && parsedId > 0 ? parsedId : 0;
  };

  const handleSave = async () => {
    if (!formData.dutyCode || !formData.dutyName) {
      setFormError("Vui lòng nhập mã và tên công tác.");
      return;
    }

    try {
      setFormError(null);
      setLoading(true);

      let dutyConfigId = duty?.id ? Number(duty.id) : 0;

      if (duty) {
        const updatedConfig: any = await updateConfigMutation.mutateAsync({
          id: duty.id,
          dutyName: formData.dutyName,
          description: formData.description,
          startTime: formData.startTime || undefined,
          endTime: formData.endTime || undefined,
          minPersons: formData.minPersons,
          maxPersons: formData.maxPersons,
        });

        dutyConfigId =
          dutyConfigId ||
          getDutyConfigIdFromResult(updatedConfig) ||
          Number(duty.id || 0);
      } else {
        const createdConfig: any = await createConfigMutation.mutateAsync({
          dutyCode: formData.dutyCode,
          dutyName: formData.dutyName,
          description: formData.description,
          dutyType: formData.dutyType,
          startTime: formData.startTime || undefined,
          endTime: formData.endTime || undefined,
          minPersons: formData.minPersons,
          maxPersons: formData.maxPersons,
          frequency: formData.frequency,
          dayOfWeek: formData.dayOfWeek,
          requiresStudyScheduleCheck: formData.requiresStudyScheduleCheck,
        });

        dutyConfigId = getDutyConfigIdFromResult(createdConfig);

        if (!dutyConfigId) {
          console.warn(
            "Đã lưu cấu hình công tác nhưng response chưa trả về ID. Bỏ qua bước lưu danh sách công việc trong lần này.",
            createdConfig
          );
        }
      }

      const hasChecklistItems = checklistItems.some((item) =>
        item.checklistItem?.trim()
      );

      if (hasChecklistItems && dutyConfigId) {
        await persistChecklistItems(dutyConfigId);
      } else if (hasChecklistItems && !dutyConfigId) {
        console.warn(
          "Không xác định được công tác cần lưu danh sách công việc. Vui lòng mở lại công tác vừa tạo để bổ sung danh sách công việc nếu cần."
        );
      }

      onSave();
    } catch (error) {
      console.error("Error saving duty config:", error);
      alert(error instanceof Error ? error.message : "Lỗi khi lưu công tác");
    } finally {
      setLoading(false);
    }
  };

  const handleAddChecklistItem = () => {
    const checklistItem = newChecklistItem.checklistItem.trim();

    if (!checklistItem) {
      alert("Vui lòng nhập nội dung công việc");
      return;
    }

    const newItem = {
      ...newChecklistItem,
      checklistItem,
      itemOrder: checklistItems.length + 1,
    };

    setChecklistItems([...checklistItems, newItem]);
    setNewChecklistItem({
      itemOrder: 0,
      checklistItem: "",
      isRequired: true,
    });
  };

  const handleDeleteChecklistItem = (index: number) => {
    setChecklistItems(
      checklistItems
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          itemOrder: itemIndex + 1,
        }))
    );
  };

  return (
    <div className="space-y-5">
      {formError && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-3 text-sm font-semibold text-rose-700">
          {formError}
        </div>
      )}

      <div className="flex flex-wrap gap-2 rounded-2xl border border-amber-100/80 bg-white/85 p-1.5 shadow-[0_8px_20px_rgba(120,53,15,0.045)]">
        {[
          { key: "basic", label: "Thông tin cơ bản" },
          { key: "checklist", label: "Danh sách công việc" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as "basic" | "checklist")}
            className={[
              "rounded-xl px-4 py-2 text-sm font-semibold transition",
              activeTab === tab.key
                ? "bg-[#17335f] text-white shadow-sm"
                : "text-slate-600 hover:bg-amber-50/70 hover:text-slate-900",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "basic" && (
        <div className="space-y-4">
          {!duty && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <button
                type="button"
                onClick={() => setShowTemplateSelector(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-white/90 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
              >
                Chọn công tác mẫu
              </button>
              <p className="mt-2 text-sm leading-6 text-emerald-700">
                Chọn mẫu để tự động điền các thông tin cơ bản.
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className={formLabelClass}>Mã công tác *</span>
              <input
                type="text"
                value={formData.dutyCode}
                onChange={(e) => setFormData({ ...formData, dutyCode: e.target.value })}
                disabled={!!duty}
                className={formInputClass}
                placeholder="VD: DI_CHO_1234567890"
              />
            </label>
            <label className="space-y-1.5">
              <span className={formLabelClass}>Tên công tác *</span>
              <input
                type="text"
                value={formData.dutyName}
                onChange={(e) => setFormData({ ...formData, dutyName: e.target.value })}
                className={formInputClass}
                placeholder="VD: Đi chợ"
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className={formLabelClass}>Mô tả</span>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={formTextareaClass}
              placeholder="Mô tả chi tiết về công tác"
              rows={3}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className={formLabelClass}>Loại công tác *</span>
              <select
                value={formData.dutyType}
                onChange={(e) => setFormData({ ...formData, dutyType: e.target.value as any })}
                disabled={!!duty}
                className={formInputClass}
              >
                <option value="daily">Hằng ngày</option>
                <option value="weekly">Hằng tuần</option>
                <option value="monthly">Hằng tháng</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className={formLabelClass}>Tần suất *</span>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                className={formInputClass}
              >
                <option value="daily">Hằng ngày</option>
                <option value="weekly">Hằng tuần</option>
                <option value="monthly">Hằng tháng</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className={formLabelClass}>Giờ bắt đầu</span>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className={formInputClass}
              />
            </label>
            <label className="space-y-1.5">
              <span className={formLabelClass}>Giờ kết thúc</span>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className={formInputClass}
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className={formLabelClass}>Số người tối thiểu</span>
              <input
                type="number"
                min="1"
                value={formData.minPersons}
                onChange={(e) => setFormData({ ...formData, minPersons: parseInt(e.target.value) })}
                className={formInputClass}
              />
            </label>
            <label className="space-y-1.5">
              <span className={formLabelClass}>Số người tối đa</span>
              <input
                type="number"
                min="1"
                value={formData.maxPersons}
                onChange={(e) => setFormData({ ...formData, maxPersons: parseInt(e.target.value) })}
                className={formInputClass}
              />
            </label>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-white/80 px-4 py-3">
            <input
              type="checkbox"
              checked={formData.requiresStudyScheduleCheck}
              onChange={(e) =>
                setFormData({ ...formData, requiresStudyScheduleCheck: e.target.checked })
              }
              className="h-4 w-4 rounded border-amber-200 text-[#17335f]"
            />
            <span className="text-sm font-semibold text-slate-700">
              Kiểm tra xung đột với lịch học
            </span>
          </label>
        </div>
      )}

      {activeTab === "checklist" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3">
            <p className="text-sm leading-6 text-blue-800">
              Thêm danh sách công việc cần hoàn thành cho công tác này.
            </p>
          </div>

          {checklistItems.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-900">
                Danh sách công việc hiện tại
              </div>
              <div className="space-y-2">
                {checklistItems.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/85 p-3 shadow-[0_8px_18px_rgba(15,23,42,0.035)]"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.isRequired}
                          disabled
                          className="h-4 w-4 rounded border-slate-300"
                        />
                        <span className="font-semibold text-slate-900">{item.checklistItem}</span>
                        {item.estimatedTimeMinutes && (
                          <span className="text-xs text-slate-400">
                            ({item.estimatedTimeMinutes} phút)
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="ml-6 mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteChecklistItem(index)}
                      className="rounded-xl px-3 py-1.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 rounded-2xl border border-amber-100/80 bg-white/80 p-4 shadow-[0_10px_24px_rgba(120,53,15,0.045)]">
            <div className="text-sm font-semibold text-slate-900">Thêm công việc mới</div>

            <label className="block space-y-1.5">
              <span className={formLabelClass}>Nội dung công việc *</span>
              <input
                type="text"
                value={newChecklistItem.checklistItem}
                onChange={(e) =>
                  setNewChecklistItem({ ...newChecklistItem, checklistItem: e.target.value })
                }
                className={formInputClass}
                placeholder="VD: Mua rau, mua thịt, mua gia vị"
              />
            </label>

            <label className="block space-y-1.5">
              <span className={formLabelClass}>Mô tả chi tiết</span>
              <input
                type="text"
                value={newChecklistItem.description || ""}
                onChange={(e) =>
                  setNewChecklistItem({ ...newChecklistItem, description: e.target.value })
                }
                className={formInputClass}
                placeholder="Mô tả chi tiết nếu cần"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-1.5">
                <span className={formLabelClass}>Thời gian ước tính (phút)</span>
                <input
                  type="number"
                  min="0"
                  value={newChecklistItem.estimatedTimeMinutes || ""}
                  onChange={(e) =>
                    setNewChecklistItem({
                      ...newChecklistItem,
                      estimatedTimeMinutes: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className={formInputClass}
                  placeholder="30"
                />
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 md:mt-7">
                <input
                  type="checkbox"
                  checked={newChecklistItem.isRequired}
                  onChange={(e) =>
                    setNewChecklistItem({ ...newChecklistItem, isRequired: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className="text-sm font-semibold text-slate-700">Bắt buộc</span>
              </label>
            </div>

            <button
              type="button"
              onClick={handleAddChecklistItem}
              className="w-full rounded-xl border border-emerald-100 bg-emerald-50/90 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
            >
              + Thêm công việc
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-3 border-t border-amber-100/80 pt-4">
        <button type="button" onClick={onCancel} className={`${secondaryButtonClass} flex-1`}>
          Hủy
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className={`${primaryButtonClass} flex-1`}
        >
          {loading ? "Đang lưu..." : duty ? "Cập nhật" : "Tạo mới"}
        </button>
      </div>

      {showTemplateSelector && (
        <TemplateSelector
          onSelect={handleSelectTemplate}
          onCancel={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  );
}
