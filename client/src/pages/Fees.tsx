import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, DollarSign, AlertCircle } from "lucide-react";
import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const paymentSchema = z.object({
  debtId: z.number(),
  amount: z.number().min(0, "Số tiền phải lớn hơn 0"),
  paymentMethod: z.enum(["cash", "bank_transfer", "check", "other"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function Fees() {
  const [open, setOpen] = useState(false);
  const { data: debts, isLoading, refetch } = trpc.fees.listDebts.useQuery({});
  const { data: stats } = trpc.fees.getDebtStats.useQuery();
  const recordPaymentMutation = trpc.fees.recordPayment.useMutation();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const onSubmit = async (data: PaymentFormData) => {
    try {
      await recordPaymentMutation.mutateAsync(data);
      toast.success("Ghi nhận thanh toán thành công");
      form.reset();
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "partially_paid":
        return "bg-blue-100 text-blue-700";
      case "unpaid":
        return "bg-red-100 text-red-700";
      case "overdue":
        return "bg-orange-100 text-orange-700";
      case "waived":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Đã thanh toán";
      case "partially_paid":
        return "Thanh toán một phần";
      case "unpaid":
        return "Chưa thanh toán";
      case "overdue":
        return "Quá hạn";
      case "waived":
        return "Miễn";
      default:
        return status;
    }
  };

  return (
    <ResidenceCareLayout>
      <div className="p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="font-serif-editorial text-5xl font-bold">Quản lý thu phí</h1>
            <p className="text-muted-foreground detail-text">Quản lý công nợ và thanh toán</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary gap-2">
                <Plus className="w-4 h-4" />
                Ghi nhận thanh toán
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ghi nhận thanh toán</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="debtId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Công nợ</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn công nợ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                          {debts?.map((debt) => (
                            <SelectItem key={debt.id} value={debt.id.toString()}>
                              Cư dân #{debt.residentId} - {Number(debt.amount).toLocaleString("vi-VN")} đ
                            </SelectItem>
                          ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số tiền (đ)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Nhập số tiền" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phương thức thanh toán</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn phương thức" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash">Tiền mặt</SelectItem>
                            <SelectItem value="bank_transfer">Chuyển khoản</SelectItem>
                            <SelectItem value="check">Séc</SelectItem>
                            <SelectItem value="other">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="btn-primary w-full">
                    Ghi nhận
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Financial Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="card-editorial">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tổng công nợ</p>
                <p className="text-2xl font-bold">{stats.totalAmount.toLocaleString("vi-VN")} đ</p>
              </div>
            </Card>
            <Card className="card-editorial">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Chưa thanh toán</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalUnpaid.toLocaleString("vi-VN")} đ</p>
              </div>
            </Card>
            <Card className="card-editorial">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Công nợ chưa xử lý</p>
                <p className="text-2xl font-bold">{stats.unpaid}</p>
              </div>
            </Card>
            <Card className="card-editorial">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Đã thanh toán</p>
                <p className="text-2xl font-bold text-green-600">
                  {(stats.totalAmount - stats.totalUnpaid).toLocaleString("vi-VN")} đ
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Debts Table */}
        <Card className="card-editorial overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>
          ) : debts && debts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cư dân</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Tháng</TableHead>
                    <TableHead>Hạn chót</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debts.map((debt) => (
                    <TableRow key={debt.id}>
                      <TableCell className="font-medium">Cư dân #{debt.residentId}</TableCell>
                      <TableCell>{Number(debt.amount).toLocaleString("vi-VN")} đ</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-sm text-sm font-medium ${getStatusColor(debt.status)}`}>
                          {getStatusLabel(debt.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{debt.billingMonth}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString("vi-VN") : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">Không có công nợ nào</div>
          )}
        </Card>
      </div>
    </ResidenceCareLayout>
  );
}
