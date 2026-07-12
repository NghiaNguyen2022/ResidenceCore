import { Link } from "wouter";
import {
      BookOpenText,
      CalendarDays,
      ClipboardCheck,
      Home,
      Info,
      PhoneCall,
      Sparkles,
} from "lucide-react";

import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { residenceMediumStyle } from "@/components/shared/styleMedium";

const informationBlocks = [
      {
            title: "Giờ giấc chung",
            icon: CalendarDays,
            items: [
                  "Theo dõi lịch học và công tác trong trang Hôm nay.",
                  "Có thay đổi về giờ giấc cần báo lại người phụ trách.",
                  "Ưu tiên hoàn thành các việc trong ngày trước khi chuyển sang việc khác.",
            ],
      },
      {
            title: "Nội quy cốt lõi",
            icon: ClipboardCheck,
            items: [
                  "Giữ trật tự, vệ sinh và tôn trọng không gian sinh hoạt chung.",
                  "Không tự ý thay đổi phòng ở hoặc lịch công tác khi chưa báo quản lý.",
                  "Có vấn đề phát sinh cần báo sớm để được hỗ trợ.",
            ],
      },
      {
            title: "Học tập và công tác",
            icon: BookOpenText,
            items: [
                  "Lịch học giúp hệ thống tránh phân công trùng giờ.",
                  "Công tác trực tiếp có thể đánh dấu hoàn thành ở trang Hôm nay hoặc Công tác.",
                  "Công tác theo Tổ/Ban dùng để theo dõi phạm vi phụ trách.",
            ],
      },
      {
            title: "Liên hệ khi cần",
            icon: PhoneCall,
            items: [
                  "Liên hệ Tổ trưởng khi cần hỗ trợ trong phạm vi Tổ.",
                  "Liên hệ Trưởng ban khi liên quan đến công tác của Ban.",
                  "Liên hệ quản lý lưu xá khi có vấn đề khẩn cấp hoặc cần cập nhật hồ sơ.",
            ],
      },
];

function InfoCard({ block }: { block: (typeof informationBlocks)[number] }) {
      const Icon = block.icon;

      return (
            <article className="group overflow-hidden rounded-[1.75rem] border border-amber-100/80 bg-white/90 shadow-lg shadow-amber-950/8 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-950/10">
                  <div className="h-1 bg-gradient-to-r from-amber-200 via-orange-200 to-transparent" />
                  <div className="p-5">
                        <div className="flex items-start gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-700 shadow-sm">
                                    <Icon className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                    <h2 className="text-lg font-black tracking-tight text-slate-950">{block.title}</h2>
                                    <div className="mt-3 space-y-2.5">
                                          {block.items.map((item) => (
                                                <div key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
                                                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                                                      <span>{item}</span>
                                                </div>
                                          ))}
                                    </div>
                              </div>
                        </div>
                  </div>
            </article>
      );
}

export default function ResidentInformation() {
      return (
            <ResidenceCareLayout>
                  <div className={residenceMediumStyle.page}>
                        <span className={residenceMediumStyle.pageAura} />
                        <div className={residenceMediumStyle.standardPageContent}>
                              <div className={residenceMediumStyle.standardHeader}>
                                    <div className={residenceMediumStyle.standardHeaderAura} />
                                    <div className={residenceMediumStyle.standardHeaderInner}>
                                          <div className={residenceMediumStyle.standardHeaderTextWrap}>
                                                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700/80">Lưu xá của tôi</p>
                                                <h1 className={residenceMediumStyle.standardHeaderTitle}>Thông tin lưu xá</h1>
                                                <p className={residenceMediumStyle.standardHeaderSubtitle}>
                                                      Những điều cần biết được gom ngắn gọn để học viên dễ xem, dễ nhớ và quay lại khi cần.
                                                </p>
                                          </div>
                                    </div>
                              </div>

                              <section className="grid gap-4 md:grid-cols-3">
                                    <div className="relative overflow-hidden rounded-[1.75rem] border border-amber-100/80 bg-[linear-gradient(135deg,#fffaf0_0%,#ffffff_56%,#fde68a_145%)] p-5 shadow-lg shadow-amber-950/10 md:col-span-2">
                                          <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-100 bg-white/85 text-amber-700 shadow-sm">
                                                <Info className="h-5 w-5" />
                                          </div>
                                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Simple Mode</p>
                                          <h2 className="mt-3 max-w-xl text-2xl font-black tracking-tight text-slate-950">Giữ thông tin vừa đủ để demo và vận hành hằng ngày</h2>
                                          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                                Các nội dung nâng cao có thể mở rộng sau. Trước mắt portal chỉ giữ các điểm học viên cần dùng thường xuyên.
                                          </p>
                                    </div>
                                    <Link
                                          href="/resident/today"
                                          className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-slate-950 p-5 text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-900"
                                    >
                                          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-200/20 blur-2xl" />
                                          <div className="relative flex h-full flex-col justify-between gap-8">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-amber-200">
                                                      <Home className="h-5 w-5" />
                                                </div>
                                                <div>
                                                      <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-100/80">Đi nhanh</p>
                                                      <h2 className="mt-2 text-xl font-black">Mở Hôm nay</h2>
                                                      <p className="mt-2 text-sm leading-6 text-white/70">Lịch học và công tác trong ngày.</p>
                                                </div>
                                          </div>
                                    </Link>
                              </section>

                              <section className="grid gap-4 lg:grid-cols-2">
                                    {informationBlocks.map((block) => (
                                          <InfoCard key={block.title} block={block} />
                                    ))}
                              </section>

                              <section className="overflow-hidden rounded-[2rem] border border-amber-100/80 bg-white/88 shadow-xl shadow-amber-950/10">
                                    <div className="flex flex-col gap-4 bg-[linear-gradient(135deg,#fffaf0_0%,#ffffff_60%,#fffbeb_100%)] p-5 md:flex-row md:items-center md:justify-between">
                                          <div className="flex items-start gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-700 shadow-sm">
                                                      <Sparkles className="h-5 w-5" />
                                                </div>
                                                <div>
                                                      <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700/80">Gợi ý demo</p>
                                                      <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Bắt đầu từ Hôm nay, sau đó xem Công tác và Tài chính</h2>
                                                      <p className="mt-1 text-sm leading-6 text-slate-600">
                                                            Đây là luồng học viên dễ hiểu nhất khi demo portal: xem hôm nay, xử lý công tác, kiểm tra khoản thu và thông báo.
                                                      </p>
                                                </div>
                                          </div>
                                          <Link
                                                href="/my-duties"
                                                className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-black text-white shadow-lg shadow-slate-950/15 transition hover:bg-slate-900"
                                          >
                                                Xem công tác
                                          </Link>
                                    </div>
                              </section>
                        </div>
                  </div>
            </ResidenceCareLayout>
      );
}
