import {
      AlertTriangle,
      BellRing,
      CheckCircle2,
      ClipboardList,
      Home,
      ShieldCheck,
} from "lucide-react";

import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";

const coreRules = [
      {
            title: "Giữ nề nếp sinh hoạt chung",
            description:
                  "Tôn trọng giờ giấc, không gây ồn ảnh hưởng đến người khác, giữ không gian chung gọn gàng.",
            icon: Home,
            tone: "blue",
      },
      {
            title: "Hoàn thành công tác được phân công",
            description:
                  "Theo dõi trang Hôm nay để biết công tác trực tiếp, công tác theo Tổ/Ban và thực hiện đúng thời gian.",
            icon: ClipboardList,
            tone: "emerald",
      },
      {
            title: "Báo sớm khi có thay đổi",
            description:
                  "Nếu có thay đổi về lịch học, phòng ở, vắng mặt hoặc không thể hoàn thành công tác, cần báo người phụ trách.",
            icon: BellRing,
            tone: "amber",
      },
      {
            title: "Tôn trọng người cùng lưu trú",
            description:
                  "Giữ thái độ lịch sự, hỗ trợ nhau trong sinh hoạt, tránh xung đột và báo quản lý khi cần hỗ trợ.",
            icon: ShieldCheck,
            tone: "purple",
      },
];

const reminders = [
      "Xem trang Hôm nay mỗi ngày để không bỏ sót lịch học và công tác.",
      "Công tác trực tiếp có thể đánh dấu hoàn thành sau khi thực hiện xong.",
      "Công tác theo Tổ/Ban dùng để theo dõi phạm vi phụ trách, không đánh dấu thay cho người khác.",
      "Thông tin phòng, liên hệ gia đình và tài khoản được xem tại trang Hồ sơ.",
];

function getToneClass(tone: string) {
      switch (tone) {
            case "blue":
                  return "border-blue-100 bg-blue-50 text-blue-700";
            case "emerald":
                  return "border-emerald-100 bg-emerald-50 text-emerald-700";
            case "amber":
                  return "border-amber-100 bg-amber-50 text-amber-700";
            case "purple":
                  return "border-purple-100 bg-purple-50 text-purple-700";
            default:
                  return "border-slate-200 bg-slate-50 text-slate-700";
      }
}

export default function ResidentRules() {
      return (
            <ResidenceCareLayout>
                  <div className="mx-auto max-w-6xl space-y-5">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                              <div className="max-w-3xl">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                          Lưu xá
                                    </p>
                                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                          Nội quy & nhắc nhở
                                    </h1>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">
                                          Phiên bản Simple Mode chỉ giữ các nguyên tắc cốt lõi để học viên dễ nhớ,
                                          dễ thực hiện và dễ xem lại khi cần.
                                    </p>
                              </div>
                        </section>

                        <section className="grid gap-4 lg:grid-cols-2">
                              {coreRules.map((rule) => {
                                    const Icon = rule.icon;

                                    return (
                                          <article
                                                key={rule.title}
                                                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                                          >
                                                <div className="flex items-start gap-3">
                                                      <div
                                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${getToneClass(
                                                                  rule.tone
                                                            )}`}
                                                      >
                                                            <Icon className="h-5 w-5" />
                                                      </div>
                                                      <div>
                                                            <h2 className="text-lg font-semibold text-slate-950">
                                                                  {rule.title}
                                                            </h2>
                                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                                  {rule.description}
                                                            </p>
                                                      </div>
                                                </div>
                                          </article>
                                    );
                              })}
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                              <div className="mb-4 flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                                          <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                          <h2 className="text-xl font-bold text-slate-950">
                                                Nhắc nhở sử dụng app
                                          </h2>
                                          <p className="mt-1 text-sm leading-6 text-slate-500">
                                                Các điểm cần nhớ khi học viên sử dụng portal.
                                          </p>
                                    </div>
                              </div>

                              <div className="space-y-3">
                                    {reminders.map((item) => (
                                          <div
                                                key={item}
                                                className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600"
                                          >
                                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                                                <span>{item}</span>
                                          </div>
                                    ))}
                              </div>
                        </section>

                        <section className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5">
                              <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                                          <AlertTriangle className="h-5 w-5" />
                                    </div>
                                    <div>
                                          <h2 className="text-base font-semibold text-amber-900">
                                                Khi có việc khẩn cấp
                                          </h2>
                                          <p className="mt-2 text-sm leading-6 text-amber-800">
                                                Học viên nên báo trực tiếp cho Tổ trưởng, Trưởng ban hoặc quản lý lưu xá.
                                                App chỉ hỗ trợ theo dõi thông tin, không thay thế trao đổi trực tiếp trong
                                                tình huống khẩn cấp.
                                          </p>
                                    </div>
                              </div>
                        </section>
                  </div>
            </ResidenceCareLayout>
      );
}
