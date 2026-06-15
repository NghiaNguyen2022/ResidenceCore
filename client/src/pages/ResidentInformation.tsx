import { Link } from "wouter";
import {
      BookOpenText,
      CalendarDays,
      ClipboardCheck,
      Home,
      Info,
      PhoneCall,
} from "lucide-react";

import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";

const informationBlocks = [
      {
            title: "Giờ giấc chung",
            icon: CalendarDays,
            tone: "blue",
            items: [
                  "Theo dõi lịch học và công tác trong trang Hôm nay.",
                  "Có thay đổi về giờ giấc cần báo lại người phụ trách.",
                  "Ưu tiên hoàn thành các việc trong ngày trước khi chuyển sang việc khác.",
            ],
      },
      {
            title: "Nội quy cốt lõi",
            icon: ClipboardCheck,
            tone: "emerald",
            items: [
                  "Giữ trật tự, vệ sinh và tôn trọng không gian sinh hoạt chung.",
                  "Không tự ý thay đổi phòng ở hoặc lịch công tác khi chưa báo quản lý.",
                  "Có vấn đề phát sinh cần báo sớm để được hỗ trợ.",
            ],
      },
      {
            title: "Học tập và công tác",
            icon: BookOpenText,
            tone: "amber",
            items: [
                  "Lịch học giúp hệ thống tránh phân công trùng giờ.",
                  "Công tác trực tiếp có thể đánh dấu hoàn thành ở trang Hôm nay.",
                  "Công tác theo Tổ/Ban dùng để theo dõi phạm vi phụ trách.",
            ],
      },
      {
            title: "Liên hệ khi cần",
            icon: PhoneCall,
            tone: "purple",
            items: [
                  "Liên hệ Tổ trưởng khi cần hỗ trợ trong phạm vi Tổ.",
                  "Liên hệ Trưởng ban khi liên quan đến công tác của Ban.",
                  "Liên hệ quản lý lưu xá khi có vấn đề khẩn cấp hoặc cần cập nhật hồ sơ.",
            ],
      },
];

function getToneClass(tone: string) {
      switch (tone) {
            case "blue":
                  return {
                        box: "border-blue-100 bg-blue-50 text-blue-700",
                        bullet: "bg-blue-400",
                  };
            case "emerald":
                  return {
                        box: "border-emerald-100 bg-emerald-50 text-emerald-700",
                        bullet: "bg-emerald-400",
                  };
            case "amber":
                  return {
                        box: "border-amber-100 bg-amber-50 text-amber-700",
                        bullet: "bg-amber-400",
                  };
            case "purple":
                  return {
                        box: "border-purple-100 bg-purple-50 text-purple-700",
                        bullet: "bg-purple-400",
                  };
            default:
                  return {
                        box: "border-slate-200 bg-slate-50 text-slate-700",
                        bullet: "bg-slate-400",
                  };
      }
}

export default function ResidentInformation() {
      return (
            <ResidenceCareLayout>
                  <div className="mx-auto max-w-6xl space-y-5">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="max-w-3xl">
                                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                Lưu xá
                                          </p>
                                          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                                Thông tin chung
                                          </h1>
                                          <p className="mt-3 text-sm leading-6 text-slate-600">
                                                Các thông tin cần biết được trình bày ngắn gọn để học viên dễ xem,
                                                dễ nhớ và có thể quay lại khi cần.
                                          </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                                <Info className="h-4 w-4 text-slate-500" />
                                                Simple Mode
                                          </div>
                                          <p className="mt-1 text-xs leading-5 text-slate-500">
                                                Chỉ giữ các thông tin cốt lõi, dễ đọc, dễ dùng.
                                          </p>
                                    </div>
                              </div>
                        </section>

                        <section className="grid gap-4 lg:grid-cols-2">
                              {informationBlocks.map((block) => {
                                    const toneClass = getToneClass(block.tone);
                                    const Icon = block.icon;

                                    return (
                                          <article
                                                key={block.title}
                                                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                                          >
                                                <div className="flex items-start gap-3">
                                                      <div
                                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${toneClass.box}`}
                                                      >
                                                            <Icon className="h-5 w-5" />
                                                      </div>
                                                      <div>
                                                            <h2 className="text-lg font-semibold text-slate-950">
                                                                  {block.title}
                                                            </h2>
                                                            <div className="mt-3 space-y-2">
                                                                  {block.items.map((item) => (
                                                                        <div
                                                                              key={item}
                                                                              className="flex gap-2 text-sm leading-6 text-slate-600"
                                                                        >
                                                                              <span
                                                                                    className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${toneClass.bullet}`}
                                                                              />
                                                                              <span>{item}</span>
                                                                        </div>
                                                                  ))}
                                                            </div>
                                                      </div>
                                                </div>
                                          </article>
                                    );
                              })}
                        </section>

                        <section className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5">
                              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-start gap-3">
                                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                                                <Home className="h-5 w-5" />
                                          </div>
                                          <div>
                                                <h2 className="text-base font-semibold text-amber-900">
                                                      Cần xem việc hôm nay?
                                                </h2>
                                                <p className="mt-1 text-sm leading-6 text-amber-800">
                                                      Lịch học, công tác trực tiếp và công tác theo vai trò được gom
                                                      ở trang Hôm nay.
                                                </p>
                                          </div>
                                    </div>

                                    <Link
                                          href="/resident/today"
                                          className="inline-flex items-center justify-center rounded-2xl bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-800"
                                    >
                                          Mở Hôm nay
                                    </Link>
                              </div>
                        </section>
                  </div>
            </ResidenceCareLayout>
      );
}
