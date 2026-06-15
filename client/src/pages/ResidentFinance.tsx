import { CalendarDays, CircleDollarSign, FileText, WalletCards } from "lucide-react";

import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";

function FinanceCard({
      icon: Icon,
      title,
      description,
}: {
      icon: any;
      title: string;
      description: string;
}) {
      return (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 ring-1 ring-emerald-100">
                              <Icon className="h-5 w-5" />
                        </div>
                        <div>
                              <h2 className="text-lg font-bold text-slate-950">{title}</h2>
                              <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
                        </div>
                  </div>
            </div>
      );
}

export default function ResidentFinance() {
      return (
            <ResidenceCareLayout>
                  <div className="mx-auto max-w-6xl space-y-5">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                                    Tài chính
                              </p>
                              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                    Tài chính của tôi
                              </h1>
                              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                    Màn hình tóm tắt các khoản phí và tình trạng thanh toán của học viên. Hiện đang để dạng Simple Mode để không làm rối portal học viên.
                              </p>
                        </section>

                        <div className="grid gap-4 lg:grid-cols-3">
                              <FinanceCard
                                    icon={WalletCards}
                                    title="Khoản cần đóng"
                                    description="Sẽ hiển thị các khoản phí còn phải đóng khi module tài chính được mở dữ liệu thật."
                              />
                              <FinanceCard
                                    icon={FileText}
                                    title="Lịch sử thanh toán"
                                    description="Theo dõi các khoản đã đóng, ngày đóng và ghi chú liên quan."
                              />
                              <FinanceCard
                                    icon={CalendarDays}
                                    title="Kỳ phí"
                                    description="Có thể cấu hình theo tháng, học kỳ hoặc kỳ sinh hoạt của lưu xá."
                              />
                        </div>

                        <section className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                                    <CircleDollarSign className="h-7 w-7" />
                              </div>
                              <h2 className="mt-4 text-xl font-bold text-slate-950">Chưa có dữ liệu tài chính</h2>
                              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                    Khi module tài chính được kích hoạt, học viên sẽ xem được khoản cần đóng, trạng thái thanh toán và các ghi chú liên quan tại đây.
                              </p>
                        </section>
                  </div>
            </ResidenceCareLayout>
      );
}
