import { BookOpen, Clock3, Home, Info, Phone, ShieldCheck } from "lucide-react";

import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";

function InfoCard({
      icon: Icon,
      title,
      description,
      items,
}: {
      icon: any;
      title: string;
      description: string;
      items: string[];
}) {
      return (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600 ring-1 ring-blue-100">
                              <Icon className="h-5 w-5" />
                        </div>
                        <div>
                              <h2 className="text-lg font-bold text-slate-950">{title}</h2>
                              <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
                        </div>
                  </div>

                  <div className="mt-4 space-y-2">
                        {items.map((item) => (
                              <div
                                    key={item}
                                    className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                              >
                                    {item}
                              </div>
                        ))}
                  </div>
            </section>
      );
}

export default function ResidentInformation() {
      return (
            <ResidenceCareLayout>
                  <div className="mx-auto max-w-6xl space-y-5">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                                    Lưu xá
                              </p>
                              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                    Thông tin chung
                              </h1>
                              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                    Các thông tin cần biết khi sinh hoạt tại lưu xá. Màn hình này ưu tiên hiển thị ngắn gọn để học viên dễ xem hằng ngày.
                              </p>
                        </section>

                        <div className="grid gap-4 lg:grid-cols-2">
                              <InfoCard
                                    icon={Clock3}
                                    title="Giờ giấc sinh hoạt"
                                    description="Nhắc nhanh các mốc thời gian quan trọng trong ngày."
                                    items={[
                                          "Có mặt đúng giờ theo lịch học, lịch sinh hoạt và công tác được phân công.",
                                          "Khi vắng hoặc thay đổi lịch, báo trước cho người phụ trách theo quy định của lưu xá.",
                                          "Công tác hằng ngày được theo dõi trong mục Hôm nay."
                                    ]}
                              />

                              <InfoCard
                                    icon={ShieldCheck}
                                    title="Nội quy cốt lõi"
                                    description="Những điểm đơn giản nhưng cần tuân thủ thường xuyên."
                                    items={[
                                          "Giữ trật tự, vệ sinh và tôn trọng không gian chung.",
                                          "Không tự ý đổi phòng, đổi công tác hoặc thay đổi lịch trực khi chưa được đồng ý.",
                                          "Tôn trọng người phụ trách, tổ/ban và các thành viên khác trong lưu xá."
                                    ]}
                              />

                              <InfoCard
                                    icon={BookOpen}
                                    title="Học tập và công tác"
                                    description="Liên kết giữa lịch học và phân công trong lưu xá."
                                    items={[
                                          "Lịch học được dùng để tránh phân công trùng giờ học hoặc thời gian di chuyển.",
                                          "Công tác giao trực tiếp cho học viên có thể xác nhận hoàn thành trong trang Hôm nay.",
                                          "Công tác giao cho Tổ/Ban được người phụ trách theo dõi theo phạm vi vai trò."
                                    ]}
                              />

                              <InfoCard
                                    icon={Phone}
                                    title="Liên hệ khi cần"
                                    description="Kênh liên hệ sẽ được cập nhật theo cấu hình lưu xá."
                                    items={[
                                          "Liên hệ người phụ trách khi cần báo vắng, đổi lịch hoặc hỗ trợ khẩn.",
                                          "Các thông tin liên hệ chi tiết sẽ được bổ sung trong giai đoạn cấu hình dữ liệu thật.",
                                          "Phụ huynh/người thân được quản lý trong hồ sơ cá nhân của học viên."
                                    ]}
                              />
                        </div>

                        <section className="rounded-3xl border border-amber-100 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
                              <div className="flex items-start gap-3">
                                    <Info className="mt-0.5 h-5 w-5 shrink-0" />
                                    <div>
                                          <div className="font-semibold">Ghi chú triển khai</div>
                                          <p className="mt-1">
                                                Nội dung hiện đang là bản Simple Mode để demo luồng chính. Giai đoạn sau có thể chuyển các mục này thành dữ liệu cấu hình từ màn hình quản trị.
                                          </p>
                                    </div>
                              </div>
                        </section>
                  </div>
            </ResidenceCareLayout>
      );
}
