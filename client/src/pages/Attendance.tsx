import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CheckCircle, XCircle, Clock } from "lucide-react";
import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const attendanceSchema = z.object({
  residentId: z.number(),
  status: z.enum(["present", "absent", "excused", "late"]),
  notes: z.string().optional(),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;

export default function Attendance() {
  const [open, setOpen] = useState(false);
  const { data: attendance, isLoading, refetch } = trpc.attendance.getTodayAttendance.useQuery();
  const { data: residents } = trpc.residents.list.useQuery({ limit: 100 });
  const createMutation = trpc.attendance.recordAttendance.useMutation();

  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
  });

  const onSubmit = async (data: AttendanceFormData) => {
    try {
      await createMutation.mutateAsync({
        residentId: data.residentId,
        scheduleId: 1,
        attendanceDate: new Date(),
        status: data.status,
        notes: data.notes,
      });
      toast.success("Ghi nhận điểm danh thành công");
      form.reset();
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "absent":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "excused":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "late":
        return <Clock className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "present":
        return "Có mặt";
      case "absent":
        return "Vắng";
      case "excused":
        return "Xin phép";
      case "late":
        return "Muộn";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-700";
      case "absent":
        return "bg-red-100 text-red-700";
      case "excused":
        return "bg-blue-100 text-blue-700";
      case "late":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <ResidenceCareLayout>
      <div className="p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="font-serif-editorial text-5xl font-bold">Điểm danh</h1>
            <p className="text-muted-foreground detail-text">Ghi nhận điểm danh hàng ngày</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary gap-2">
                <Plus className="w-4 h-4" />
                Ghi nhận
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ghi nhận điểm danh</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="residentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cư dân</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn cư dân" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {residents?.map((resident) => (
                              <SelectItem key={resident.id} value={resident.id.toString()}>
                                {resident.fullName}
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trạng thái</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="present">Có mặt</SelectItem>
                            <SelectItem value="absent">Vắng</SelectItem>
                            <SelectItem value="excused">Xin phép</SelectItem>
                            <SelectItem value="late">Muộn</SelectItem>
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

        {/* Attendance Table */}
        <Card className="card-editorial overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>
          ) : attendance && attendance.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cư dân</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead>Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">Cư dân #{record.residentId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(record.status)}
                          <span className={`px-3 py-1 rounded-sm text-sm font-medium ${getStatusColor(record.status)}`}>
                            {getStatusLabel(record.status)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{record.notes || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(record.attendanceDate).toLocaleString("vi-VN")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">Không có bản ghi điểm danh</div>
          )}
        </Card>
      </div>
    </ResidenceCareLayout>
  );
}
