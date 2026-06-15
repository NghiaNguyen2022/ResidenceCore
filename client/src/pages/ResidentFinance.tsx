import { CreditCard, History, Info, WalletCards } from "lucide-react";

import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";

const financeCards = [
      {
            title: "Khoản cần đóng",
            description:
                  "Hiển thị các khoản phí còn phải đóng, kỳ phí và hạn thanh toán khi module tài chính được mở.",
            status: "Chuẩn bị",
            icon: WalletCards,
      },
      {
            title: "Lịch sử thanh toán",
            description:
                  "Theo dõi các khoản đã nộp, ngày nộp và ghi chú liên quan để học viên dễ đối chiếu.",
            status: "Chuẩn bị",
            icon: History,
      },
      {
            title: "Nhắc nhở tài chính",
            description:
                  "Các nhắc nhở đơn giản sẽ được đưa vào trang Hôm nay khi đến hạn hoặc gần đến hạn.",
            status: "Chuẩn bị",
            icon: CreditCard,
      },
];

export default function ResidentFinance() {
      return (
            <ResidenceCareLayout>
                  <div className="mx-auto max-w-6xl space-y-5">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                              <div className="max-w-3xl">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                          Lưu xá
                                    </p>
                                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                          Tài chính của tôi
                                    </h1>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">
                                          Màn hình này giữ chỗ cho module tài chính Simple Mode. Trước mắt chỉ
                                          hiển thị cấu trúc, chưa phát sinh nghiệp vụ thu phí.
                                    </p>
                              </div>
                        </section>

                        <section className="grid gap-4 lg:grid-cols-3">
                              {financeCards.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                          <article
                                                key={item.title}
                                                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                                          >
                                                <div className="flex items-start justify-between gap-3">
                                                      <div className="flex items-start gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
                                                                  <Icon className="h-5 w-5" />
                                                            </div>
                                                            <h2 className="text-lg font-semibold text-slate-950">
                                                                  {item.title}
                                                            </h2>
                                                      </div>

                                                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                                                            {item.status}
                                                      </span>
                                                </div>

                                                <p className="mt-3 text-sm leading-6 text-slate-600">
                                                      {item.description}
                                                </p>
                                          </article>
                                    );
                              })}
                        </section>

                        <section className="rounded-3xl border border-sky-200 bg-sky-50/70 p-5">
                              <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                                          <Info className="h-5 w-5" />
                                    </div>
                                    <div>
                                          <h2 className="text-base font-semibold text-sky-900">
                                                Ghi chú triển khai
                                          </h2>
                                          <p className="mt-2 text-sm leading-6 text-sky-800">
                                                Phần tài chính sẽ được mở sau khi các luồng chính về hồ sơ, phòng ở,
                                                tổ/ban, lịch học và công tác đã ổn định.
                                          </p>
                                    </div>
                              </div>
                        </section>
                  </div>
            </ResidenceCareLayout>
      );
}
