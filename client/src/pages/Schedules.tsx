import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Clock, Pencil, Trash2 } from "lucide-react";
import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { FormTimeInput } from "@/components/shared/form/FormTimeInput";
import { ConfirmDialog } from "@/components/shared/overlay/ConfirmDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const scheduleSchema = z.object({
  name: z.string().min(1, "Tên hoạt động không được trống"),
  type: z.enum(["check_in", "check_out", "meal", "study_hour", "curfew", "activity"]),
  scheduledTime: z.string(),
  isDaily: z.boolean().default(true),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

export default function Schedules() {
  const [open, setOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const { data: schedules, isLoading, refetch } = trpc.attendance.listSchedules.useQuery();
  const createMutation = trpc.attendance.createSchedule.useMutation();
  const updateMutation = trpc.attendance.updateSchedule.useMutation();
  const deleteMutation = trpc.attendance.deleteSchedule.useMutation();

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema) as any,
    defaultValues: {
      name: "",
      type: "meal",
      scheduledTime: "07:00",
      isDaily: true,
    },
  });

  const onSubmit = async (data: ScheduleFormData) => {
    try {
      if (editingSchedule) {
        await updateMutation.mutateAsync({ id: editingSchedule.id, ...data });
        toast.success("Đã cập nhật lịch biểu");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Thêm lịch biểu thành công");
      }
      form.reset();
      setEditingSchedule(null);
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const openCreate = () => {
    setEditingSchedule(null);
    form.reset({
      name: "",
      type: "meal",
      scheduledTime: "07:00",
      isDaily: true,
    });
    setOpen(true);
  };

  const openEdit = (schedule: any) => {
    setEditingSchedule(schedule);
    form.reset({
      name: schedule.name,
      type: schedule.type,
      scheduledTime: String(schedule.scheduledTime).slice(0, 5),
      isDaily: schedule.isDaily,
    });
    setOpen(true);
  };

  const typeLabels: Record<string, string> = {
    check_in: "Điểm danh vào",
    check_out: "Điểm danh ra",
    meal: "Ăn cơm",
    study_hour: "Giờ học tập",
    curfew: "Giờ yên tĩnh",
    activity: "Hoạt động",
  };

  return (
    <ResidenceCareLayout>
      <div className="p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="font-serif-editorial text-5xl font-bold">Lịch biểu sinh hoạt</h1>
            <p className="text-muted-foreground detail-text">Quản lý lịch sinh hoạt chung</p>
          </div>
          <Dialog open={open} onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (!nextOpen) setEditingSchedule(null);
          }}>
            <DialogTrigger asChild>
              <Button className="btn-primary gap-2" onClick={openCreate}>
                <Plus className="w-4 h-4" />
                Thêm lịch
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSchedule ? "Sửa lịch biểu" : "Thêm lịch biểu mới"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên hoạt động</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: Ăn cơm sáng..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại hoạt động</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại hoạt động" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="check_in">Điểm danh vào</SelectItem>
                            <SelectItem value="check_out">Điểm danh ra</SelectItem>
                            <SelectItem value="meal">Ăn cơm</SelectItem>
                            <SelectItem value="study_hour">Giờ học tập</SelectItem>
                            <SelectItem value="curfew">Giờ yên tĩnh</SelectItem>
                            <SelectItem value="activity">Hoạt động</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="scheduledTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giờ</FormLabel>
                        <FormControl>
                          <FormTimeInput value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="btn-primary w-full">
                    {editingSchedule ? "Lưu thay đổi" : "Thêm mới"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Schedules Table */}
        <Card className="card-editorial overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>
          ) : schedules && schedules.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hoạt động</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Tần suất</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules?.map((schedule: any) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.name}</TableCell>
                      <TableCell>{typeLabels[schedule.type] || schedule.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{schedule.scheduledTime}</span>
                        </div>
                      </TableCell>
                      <TableCell>{schedule.isDaily ? "Hàng ngày" : "Theo lịch"}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(schedule)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteTarget(schedule)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">Không có lịch biểu nào</div>
          )}
        </Card>
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setDeleteTarget(null);
          }}
          title="Xóa lịch điểm danh?"
          description="Chỉ có thể xóa lịch chưa phát sinh dữ liệu điểm danh."
          confirmLabel="Xóa lịch"
          variant="danger"
          loading={deleteMutation.isPending}
          onConfirm={async () => {
            if (!deleteTarget) return;
            try {
              await deleteMutation.mutateAsync({ id: deleteTarget.id });
              toast.success("Đã xóa lịch điểm danh");
              setDeleteTarget(null);
              await refetch();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Không thể xóa lịch điểm danh");
            }
          }}
        />
      </div>
    </ResidenceCareLayout>
  );
}
