import { ModulePlaceholderPage } from "@/components/module/ModulePlaceholderPage";

export default function DailyRoutine() {
  return (
    <ModulePlaceholderPage
      title="Lịch sinh hoạt hằng ngày"
      subtitle="Thiết lập khung sinh hoạt từ lúc thức dậy đến khi đi ngủ, làm nền cho điểm danh, công tác và nề nếp."
      moduleGroup="Sinh hoạt & Nề nếp"
      dataStatus="mock"
      checklistItems={[
        "Tạo lịch sinh hoạt theo ngày",
        "Quản lý khung giờ thức dậy, học tập, sinh hoạt, tự học, giờ ngủ",
        "Gắn khung giờ với điểm danh hoặc công tác",
        "Theo dõi hoàn thành lịch sinh hoạt",
      ]}
      backendMapping={[
        "Chưa có DB/API hiện tại",
        "Đề xuất sau: dailyRoutineTemplates",
        "Đề xuất sau: dailyRoutineItems",
        "Đề xuất sau: dailyRoutineAssignments",
        "Có thể liên kết với attendance và dutySchedules",
      ]}
      mockCards={[
        {
          label: "Khung giờ",
          value: 9,
          description: "Mock lịch mẫu trong ngày",
        },
        {
          label: "Bắt buộc điểm danh",
          value: 3,
          description: "Kinh tối, tự học, giờ ngủ",
        },
        {
          label: "Gắn công tác",
          value: 1,
          description: "Khung vệ sinh/công tác",
        },
      ]}
      mockColumns={[
        { label: "Khung giờ", key: "time" },
        { label: "Hoạt động", key: "activity" },
        { label: "Loại kiểm soát", key: "control" },
        { label: "Áp dụng", key: "scope" },
      ]}
      mockRows={[
        {
          time: "05:30 - 06:00",
          activity: "Thức dậy / vệ sinh cá nhân",
          control: "Nhắc lịch",
          scope: "Toàn lưu xá",
        },
        {
          time: "19:00 - 21:00",
          activity: "Tự học",
          control: "Điểm danh",
          scope: "Theo phòng",
        },
        {
          time: "22:00",
          activity: "Giờ ngủ",
          control: "Kiểm tra phòng",
          scope: "Toàn lưu xá",
        },
      ]}
    />
  );
}