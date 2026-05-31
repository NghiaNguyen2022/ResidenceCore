import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const taskSchema = z.object({
  taskTypeId: z.number(),
  residentId: z.number(),
  assignmentDate: z.date(),
  dueDate: z.date(),
  notes: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function Tasks() {
  const [open, setOpen] = useState(false);
  const { data: tasks, isLoading, refetch } = trpc.tasks.listAssignments.useQuery({});
  const { data: residents } = trpc.residents.list.useQuery({ limit: 100 });
  const { data: taskTypes } = trpc.tasks.listTaskTypes.useQuery();
  const assignMutation = trpc.tasks.assignTask.useMutation();
  const updateStatusMutation = trpc.tasks.updateTaskStatus.useMutation();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      await assignMutation.mutateAsync(data);
      toast.success("Phân công công việc thành công");
      form.reset();
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleStatusUpdate = async (taskId: number, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        taskId,
        status: newStatus as any,
        completionDate: newStatus === "completed" ? new Date() : undefined,
      });
      toast.success("Cập nhật trạng thái thành công");
      refetch();
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-amber-600" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "overdue":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "in_progress":
        return "Đang thực hiện";
      case "completed":
        return "Hoàn thành";
      case "overdue":
        return "Quá hạn";
      case "cancelled":
        return "Hủy";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "in_progress":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      case "cancelled":
        return "bg-gray-100 text-gray-700";
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
            <h1 className="font-serif-editorial text-5xl font-bold">Quản lý công việc</h1>
            <p className="text-muted-foreground detail-text">Phân công và theo dõi công việc nhà</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary gap-2">
                <Plus className="w-4 h-4" />
                Phân công
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Phân công công việc</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="taskTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại công việc</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại công việc" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {taskTypes?.map((type) => (
                              <SelectItem key={type.id} value={type.id.toString()}>
                                {type.name}
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
                  <Button type="submit" className="btn-primary w-full">
                    Phân công
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tasks Table */}
        <Card className="card-editorial overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>
          ) : tasks && tasks.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Công việc</TableHead>
                    <TableHead>Cư dân</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Hạn chót</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">Công việc #{task.taskTypeId}</TableCell>
                      <TableCell>Cư dân #{task.residentId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <span className={`px-3 py-1 rounded-sm text-sm font-medium ${getStatusColor(task.status)}`}>
                            {getStatusLabel(task.status)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        {task.status !== "completed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusUpdate(task.id, "completed")}
                          >
                            Hoàn thành
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">Không có công việc nào</div>
          )}
        </Card>
      </div>
    </ResidenceCareLayout>
  );
}
