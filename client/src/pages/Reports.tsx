import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { Card } from "@/components/ui/card";

export default function Reports() {
  return (
    <ResidenceCareLayout>
      <div className="p-6 md:p-8">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-4">Báo cáo</h1>
          <p className="text-muted-foreground">
            Đây là trang báo cáo. Bạn có thể thêm biểu đồ, báo cáo tài chính hoặc thống kê chi tiết ở đây.
          </p>
        </Card>
      </div>
    </ResidenceCareLayout>
  );
}
