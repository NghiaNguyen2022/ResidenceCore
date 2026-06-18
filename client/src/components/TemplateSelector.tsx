// @ts-nocheck
import { useState } from "react";
import { trpc } from "@/lib/trpc";

interface DutyTemplate {
  id: number;
  templateCode: string;
  templateName: string;
  dutyType: string;
  startTime: string;
  endTime: string;
  minPersons: number;
  maxPersons: number;
  description: string;
  isActive: boolean;
}

interface TemplateSelectorProps {
  onSelect: (template: DutyTemplate) => void;
  onCancel: () => void;
}

export default function TemplateSelector({ onSelect, onCancel }: TemplateSelectorProps) {
  const [dutyType, setDutyType] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedTemplate, setSelectedTemplate] = useState<DutyTemplate | null>(null);

  // Fetch templates by type
  const { data: templates = [], isLoading } = trpc.duties.getTemplatesByType.useQuery({
    dutyType,
  });

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Chọn Công Tác Mẫu</h2>

        {/* Type Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Loại Công Tác</label>
          <div className="flex gap-2">
            {["daily", "weekly", "monthly"].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setDutyType(type as "daily" | "weekly" | "monthly");
                  setSelectedTemplate(null);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  dutyType === type
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {type === "daily" && "Hàng Ngày"}
                {type === "weekly" && "Hàng Tuần"}
                {type === "monthly" && "Hàng Tháng"}
              </button>
            ))}
          </div>
        </div>

        {/* Templates List */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Danh Sách Mẫu</label>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Đang tải...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Không có công tác mẫu nào</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedTemplate?.id === template.id
                      ? "bg-blue-100 border-2 border-blue-500"
                      : "bg-gray-50 border border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <div className="font-medium text-gray-900">{template.templateName}</div>
                  <div className="text-sm text-gray-600">
                    {template.startTime} - {template.endTime}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Template Details */}
        {selectedTemplate && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-bold text-gray-900 mb-3">📌 Chi Tiết Mẫu</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Mã:</span>
                <span className="ml-2 text-gray-600">{selectedTemplate.templateCode}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Tên:</span>
                <span className="ml-2 text-gray-600">{selectedTemplate.templateName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Giờ:</span>
                <span className="ml-2 text-gray-600">
                  {selectedTemplate.startTime} - {selectedTemplate.endTime}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Số Người:</span>
                <span className="ml-2 text-gray-600">
                  {selectedTemplate.minPersons} - {selectedTemplate.maxPersons}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Mô Tả:</span>
                <span className="ml-2 text-gray-600 block mt-1">{selectedTemplate.description}</span>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedTemplate}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              selectedTemplate
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Chọn Mẫu
          </button>
        </div>
      </div>
    </div>
  );
}
